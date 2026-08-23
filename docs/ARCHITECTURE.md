# Architecture

## Tech stack

| Layer | Choice |
|---|---|
| Frontend framework | React (PWA on React 18, Web dashboard on React 19) + Vite |
| Routing | React Router DOM |
| Offline storage | Dexie.js (a wrapper around IndexedDB) |
| Cloud backend | Firebase — Firestore (database) + Authentication + Hosting |
| Maps | Leaflet.js + OpenStreetMap tiles |
| PWA tooling | Vite PWA plugin (service worker, manifest, install prompt) |

There is no custom application server. Firebase is used as a Backend-as-a-Service: Firestore stores incident data, Firebase Auth handles login, and Firebase Hosting serves the built static files. The only "backend" code in this repo is the `Backend/` folder, which holds shared Firebase config/scripts rather than a running service.

## Folder structure (PWA)

```
PWA/
├── src/
│   ├── components/        # Login, IncidentForm, PendingIncidents, NetworkStatus, MapLocationPicker, ThemeToggle...
│   ├── pages/              # FieldResponder.jsx, Dashboard.jsx
│   ├── services/
│   │   ├── authService.js      # Firebase Auth + offline session cache
│   │   ├── firebase.js         # Firebase init + Firestore read/write helpers
│   │   ├── syncService.js      # Offline-queue sync engine
│   │   ├── networkService.js   # Online/offline detection
│   │   ├── locationService.js  # GPS capture
│   │   └── themeService.js     # Dark/light mode persistence
│   ├── db/
│   │   └── database.js         # Dexie (IndexedDB) schema
│   └── App.jsx              # Routing
```

`Web/` (the HQ dashboard built on `dev-chanith`) follows the same general React + Vite shape, minus the offline layer — it reads live from Firestore rather than queuing locally, since HQ operators are assumed to have a stable connection.

## Data flow

**1. Offline submission (PWA)**
A responder fills out the incident form. The record is written to IndexedDB immediately (`db.incidents.add(...)`, flagged `synced: 0`) before anything is sent over the network — this is what guarantees zero data loss if the device is offline or the app is killed mid-submission. The UI shows a "saved locally" confirmation right away.

**2. Sync (PWA → Firestore)**
When the sync engine determines the device is online (see `docs/SYNC_ENGINE.md` for the exact triggers), it reads all `synced: 0` records from IndexedDB, POSTs each to the Firestore `incidents` collection, and only flips the local record to `synced: 1` after a successful write. Anything that fails stays queued and is retried on the next sync pass.

**3. Live dashboard (Firestore → Web)**
The HQ dashboard holds a real-time Firestore listener on the `incidents` collection. As soon as a responder's device syncs a record, it appears on the dashboard's map (Leaflet marker) and list view with no manual refresh, and can be sorted/filtered by severity.

## Why this shape

- **No custom backend server** — Firebase's managed Auth/Firestore/Hosting covers everything the app needs (auth, storage, real-time sync, static hosting) without writing or operating server code, which matters on a hackathon timeline.
- **IndexedDB in front of Firestore, not Firestore's own offline cache** — a fully custom local queue (Dexie) plus an explicit sync service gives predictable control over retries, duplicate prevention, and *when* sync fires (needed to work around iOS Safari's lack of background sync — see `docs/SYNC_ENGINE.md`).
- **Firebase Auth session cached in `localStorage`** — lets a responder who logged in once while online keep using the app, and keep submitting incidents, indefinitely offline.

## Known limitations

- Photos are stored as base64 inside the incident record rather than in Firebase Storage; oversized photos are dropped from the payload so the rest of the incident can still sync (see `docs/SYNC_ENGINE.md`).
- Map tiles need an initial online visit to be cached — only previously-viewed areas render offline.
- The auth session cache lives in `localStorage`, which is readable by any script running on the page (acceptable for a hackathon demo, not hardened for production).
