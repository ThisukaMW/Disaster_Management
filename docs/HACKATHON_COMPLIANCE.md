# Hackathon Compliance Checklist

A consolidated checklist of the requirements Project Aegis (ResQ) targets, and what satisfies each one.

## Component A — Field Responder App (PWA)

**Offline-first data collection**
- [x] Incident form works fully offline (Airplane Mode) — data written straight to IndexedDB.
- [x] Required fields all present: incident type (Landslide / Flood / Road Block / Power Line Down), severity (1–5), GPS location (auto-captured, works offline), timestamp, optional photo.
- [x] Bonus: map-based location picker in addition to raw GPS.

**Sync engine**
- [x] Automatic network detection (`online` event + foreground triggers — see `docs/SYNC_ENGINE.md`).
- [x] Auto-sync on reconnection, no user action required.
- [x] Duplicate prevention via a `synced` flag plus a location/type/user proximity check.
- [x] Failed uploads stay queued and retry automatically on the next sync trigger.

**Persistent offline authentication**
- [x] Firebase Auth login, session cached to `localStorage`.
- [x] User stays logged in after a full app restart while offline.
- [x] No login screen shown when offline and a valid cached session exists.

## Component B — HQ Command Dashboard (Web)

**Live map visualization**
- [x] Leaflet + OpenStreetMap markers for every incident, positioned from stored GPS coordinates.
- [x] Interactive — click a marker to see incident details.

**Real-time list view**
- [x] Firestore real-time listener (`onSnapshot`) keeps the list current with no manual refresh.
- [x] Sortable (e.g. by timestamp/severity).

## Tech stack compliance

- [x] PWA via the Vite PWA plugin (manifest, service worker, install prompt).
- [x] React + Vite for both apps.
- [x] Firebase as the backend (Firestore + Authentication + Hosting) — no custom server.
- [x] Dexie.js (IndexedDB) for the client-side offline queue.
- [x] Leaflet.js + OpenStreetMap for maps in both the PWA and the dashboard.

## The airplane-mode test (pass/fail gate)

The scenario every reviewer is expected to run — see `docs/TESTING.md` for the full step-by-step:

1. Enable Airplane Mode → network indicator flips to Offline.
2. Fill out and submit a report → saves locally, shows a clear "saved locally" confirmation, no crash or hang.
3. Kill the app completely.
4. Reopen while still offline → still logged in, the incident is still present, visible under Pending Sync.
5. Turn connectivity back on → status flips to Online.
6. Watch the dashboard → the incident appears without a manual refresh, generally within seconds.

## Scoring-rubric self-check

| Area | What's implemented |
|---|---|
| Offline robustness | Airplane-mode flow above passes end to end; IndexedDB persists across restarts; nothing is sent over the network before it's saved locally. |
| Sync logic | Multiple foreground sync triggers, duplicate detection, automatic retry of failed uploads (see `docs/SYNC_ENGINE.md`). |
| Security & auth | Firebase Auth handles credentials/tokens; session cache is timestamped and offline-capable. `localStorage` storage of the session is a known, accepted trade-off for a hackathon build — see `docs/ARCHITECTURE.md`'s limitations section. |
| Map integration | Dashboard renders accurate pins from stored coordinates; PWA captures GPS offline; map-click location picker is an extra beyond the baseline requirement. |
| Dashboard utility | Auto-refreshing via Firestore listeners, readable severity-coded list, sortable. |
| Crisis UX | Large tap targets, high-contrast always-visible online/offline banner (pulses when offline) — see `docs/FEATURES.md`. |
| Feedback loops | Distinct "saved locally" vs. "saved and synced" confirmations, visible pending count, reassurance messaging. |

## Extras beyond the baseline requirements

- Installable PWA with home-screen install prompts on both Android and iOS.
- Manual coordinate entry as a location fallback.
- Persistent, prominent network status indicator.
- Dedicated Pending Sync view listing every unsynced incident with full details.
- Dark mode, on by default, with a persisted per-device preference.

## Pre-demo checklist

- [ ] Firebase project configured with real credentials (see `docs/SETUP.md`).
- [ ] Test user accounts created in Firebase Authentication.
- [ ] Firestore rules published (see `docs/SETUP.md`).
- [ ] Airplane-mode flow tested on an actual phone, not just a laptop (see `docs/TESTING.md`).
- [ ] Both apps deployed to Firebase Hosting with stable HTTPS URLs (see `docs/DEPLOYMENT.md`).
- [ ] Full offline-submit-then-sync loop verified against the deployed URLs, not just localhost.
