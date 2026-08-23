# User Guide

## For Field Responders (the PWA)

### Getting the app

Open the field-responder app URL in your phone's browser (Chrome on Android, Safari on iOS). To install it like a native app:

- **Android/Chrome**: an "Install" prompt appears automatically, or use the browser menu (⋮) → "Install app" / "Add to Home Screen".
- **iOS/Safari**: tap the Share icon, scroll down, tap "Add to Home Screen", then "Add".
- **Desktop**: look for an install icon in the address bar.

Once installed, launch it from the home-screen icon rather than the browser — it then opens standalone and works offline.

### Logging in

1. Enter your email and password (issued by your organization via Firebase) and tap Sign In.
2. Allow the location permission prompt so GPS capture works.
3. **Log in at least once while you have signal.** This caches your session, so you'll stay logged in even if you lose connectivity later.

### Reporting an incident

1. **Choose an incident type** — e.g. Landslide, Flood, Road Block, Power Line Down.
2. **Set the severity** (1 = Critical … 5 = Minimal).
3. **Set a location**, using whichever is easiest right now:
   - GPS is requested automatically — a blue circle marks your current position.
   - Tap anywhere on the map to drop the red incident pin there instead; tap "Use My Location" to snap back to GPS.
   - Or type coordinates directly if neither of the above is available.
4. **Attach a photo** (optional).
5. Tap **Save Incident**. You'll see a clear confirmation either way:
   - Online: "saved and synced".
   - Offline: "saved locally — will sync when online". Your data is not lost; it's simply queued.

### Checking what hasn't synced yet

Open the **Pending Sync** tab to see every incident that hasn't reached the server yet — type, severity, location, timestamp, and photo if attached. You don't need to do anything from here; sync runs automatically. A **Sync Now** button is available if you want to trigger it manually while online.

### Reading the network indicator

A banner is always visible at the top of the screen:
- **Green — Online**: incidents sync automatically.
- **Red, pulsing — Offline**: incidents save locally and will sync once you're back online.

### Working fully offline

The app is built for this. If you have no signal at all:
- You stay logged in (from your cached session).
- You can still fill out and submit incident reports — they save locally.
- The map still works for areas you've viewed before (tiles are cached).
- Closing and reopening the app, even fully offline, does not lose your pending reports.

As soon as you're back in range, sync happens on its own — no need to babysit it. See `docs/SYNC_ENGINE.md` if you want the technical detail on exactly when sync fires.

### Dark mode

Tap the moon/sun icon (login screen, or the app header) to switch themes. Dark mode is the default, and your preference is remembered on that device.

## For HQ Operators (the Web dashboard)

1. Open the HQ dashboard URL in a browser.
2. The **map view** shows every incident reported by field responders as a marker, sourced live from the same database the field app writes to. Click a marker to see its details.
3. The **incident list** updates in real time — no refresh needed — and can be sorted (e.g. by severity). Clicking a list item highlights it on the map.
4. **Statistics** at a glance: total incident count, critical-incident count.
5. An incident a responder files while offline appears here automatically as soon as that responder's device regains connectivity and syncs — there's no separate step on the HQ side.

## Troubleshooting

- **Map not loading**: needs an internet connection the first time it loads an area; refresh if it seems stuck.
- **GPS not working**: check the browser's location permission; on desktop, GPS is unreliable — use the map-click or manual-entry option instead.
- **Can't log in**: confirm your credentials and that you have a connection (the very first login of a session must be online).
- **Data seems stuck pending**: confirm the network banner shows Online, then use Sync Now on the Pending Sync tab.
- **App won't install**: PWA install requires HTTPS (or `localhost`); make sure you're on the deployed URL, not a plain local IP.
