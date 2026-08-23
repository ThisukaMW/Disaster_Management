# Features

## Field-Responder PWA

### Offline-first incident reporting
- Incidents can be created with no network connection; they save to a local queue with a "saved locally" confirmation.
- Once the device is back online, queued incidents sync automatically — no manual step required (see `docs/SYNC_ENGINE.md`).
- Foreground sync also runs on app start, on the browser's `online` event, on `visibilitychange`, and on window `focus` — this covers iOS Safari, which does not support true background sync.

### Location capture
Three ways to set an incident's location, so the form still works without a live GPS fix or signal:
- **GPS** — requested automatically when the location step opens (no manual "enable GPS" step); works fully offline on a phone since it reads the device's GPS chip directly.
- **Pick on map** — an interactive Leaflet/OpenStreetMap map; tap anywhere to drop a pin. Map tiles the device has already viewed are cached by the service worker, so this also works offline for previously-visited areas.
- **Manual entry** — type latitude/longitude directly, as a fallback.

### Installable PWA
- Installable to the home screen on both mobile (Android/Chrome, iOS Safari) and desktop, and runs standalone (no browser chrome) once installed.
- Install prompt appears automatically for eligible visitors and remembers a dismissal for 7 days.
- Service worker caches the app shell for offline load, plus map tiles (cache-first, ~7 day / 100-tile budget) for offline map viewing.

### Authentication that survives being offline
- Login uses Firebase Authentication (email/password).
- After a successful online login, the session is cached in `localStorage` so the user stays logged in even if the app is closed and reopened while offline.

### Dark mode
- Dark mode is the default theme (better visibility/battery life in low-light field conditions).
- Toggle available from the login page, the field-responder header, and the dashboard header.
- Preference is saved to `localStorage` and persists across sessions, restarts, and refreshes; all components (forms, cards, buttons, banners) are themed for both modes.

### Crisis-oriented UI/UX
Designed for use in bad conditions (rain, wind, gloves, stress) rather than for visual polish:
- Large tap targets throughout — buttons are 56px tall (64px for primary actions like Save/Login/Sync), with bold, large (18–22px) uppercase labels.
- A persistent, full-width network status banner at the top of the screen: green "ONLINE — data will sync automatically" vs. a pulsing red "OFFLINE — data saved locally", so connectivity state is never ambiguous.
- A prominent post-submit confirmation that visibly differs by state — a green "saved and synced" message when online, an orange "saved locally, will sync when online" message when offline — plus reassurance text ("your data is safe and secure") so responders trust the offline save.
- Larger form inputs/labels (56px inputs, 18px labels) and generous spacing between fields and buttons.

## HQ Command Dashboard (Web)

- Central map view showing incidents submitted by field responders, sourced from the same Firestore `incidents` collection the PWA writes to.
- Incidents submitted offline by a responder appear on the dashboard as soon as that responder's device syncs — no separate ingestion step.
- Shares the same dark/light theme toggle and persisted theme preference as the PWA.
