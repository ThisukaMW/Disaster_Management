# Sync Engine

The PWA is offline-first: every incident report is written to a local queue before anything is sent over the network, and a separate sync engine (`PWA/src/services/syncService.js`) pushes that queue to Firestore whenever it gets a chance to run. This doc explains how that queue and sync engine actually work.

## The local queue: IndexedDB via Dexie

Incidents are stored in an IndexedDB database (`PWA/src/db/database.js`, via the Dexie.js wrapper):

```javascript
db.version(1).stores({
  incidents: '++id, incidentType, severity, latitude, longitude, timestamp, photo, synced, userId, createdAt'
});
```

The `synced` field is the whole state machine:
- `0` — pending, not yet uploaded
- `1` — successfully synced to Firestore

When the "Save Incident" button is pressed, the record is written to IndexedDB with `synced: 0` **before** anything else happens — form reset and the "saved" confirmation both come after that local write succeeds. This is what makes the offline guarantee real: even if the network call never happens (airplane mode) or the app is killed immediately after, the incident already exists on disk.

## Why sync can't just run in the background

The natural design would be a service-worker Background Sync that fires whenever connectivity returns, even if the app isn't open. That doesn't work reliably on iOS Safari, which doesn't support the Background Sync API the way Chrome/Android does. So instead of depending on background sync, the app syncs only in the **foreground** — while the PWA is actually open and active — and makes sure that foreground window is triggered from enough different events that a queued incident won't sit unsynced for long.

## Foreground sync triggers

`setupForegroundSync()` and related listeners in `syncService.js` wire up sync attempts on:

1. **App start** — if the device is online when the app loads, sync kicks off after a short delay.
2. **`online` event** — fires the moment the browser detects connectivity is restored.
3. **`visibilitychange`** — fires when the tab/app becomes visible again (e.g. the user re-opens the app after closing it). This is the key iOS workaround: a responder can file a report offline, close the app, and the next time they simply open it back up (now with signal), sync fires automatically.
4. **`focus`** — fires when the window/tab regains focus (e.g. switching back from another app).

Each of the last three waits a brief moment (~500ms) before syncing, to let the network state settle.

## What a sync pass does

`syncPendingIncidents()` runs this logic every time it's triggered:

```
If (device is online) AND (there are records with synced = 0):
    for each pending record:
        try to POST it to Firestore
        on success -> mark synced = 1
        on failure -> leave it as synced = 0 (picked up by the next trigger)
```

A `syncInProgress` flag prevents two triggers (e.g. `online` and `visibilitychange` firing close together) from running overlapping sync passes.

Before uploading, each record is checked for an oversized photo — if the base64-encoded photo is larger than roughly 900KB (Firestore has a ~1MB document limit), the photo is dropped from that upload so the rest of the incident still syncs instead of failing outright.

## Duplicate prevention

Because sync can be triggered from multiple overlapping events, the engine checks for existing near-duplicates in Firestore before writing a new one. An incident is treated as a duplicate — and simply marked `synced: 1` without re-uploading — if there's already a Firestore record with:
- the same `userId`,
- the same `incidentType`, and
- a location within ~10 meters (calculated with the Haversine formula).

If the duplicate check itself fails (e.g. a transient read error), the engine fails open and syncs anyway rather than risk losing a real report.

## Retry behavior

A failed upload is simply left at `synced: 0` — it will be retried automatically the next time any of the foreground triggers fires. There's no need to babysit a retry loop manually; going back online, reopening the app, or refocusing the tab are all enough to give a pending incident another attempt.

## End-to-end flow for one incident

1. Responder fills the form and taps Save → validated → written to IndexedDB with `synced: 0` → "saved locally" confirmation shown immediately, regardless of connectivity.
2. If already online at save time, a sync pass is attempted right away in addition to the local save.
3. If offline, the record just waits. The next `online`, `visibilitychange`, or `focus` event triggers a sync pass.
4. On a successful Firestore write, the local record flips to `synced: 1` and the HQ dashboard's real-time Firestore listener picks it up immediately.
5. On failure (network drop mid-upload, oversized payload that still fails, etc.), the record stays `synced: 0` and is retried on the next trigger — no data is lost in the meantime because it never left IndexedDB.
