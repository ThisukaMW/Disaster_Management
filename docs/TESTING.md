# Manual Testing Guide

The most important thing to test in this project is the offline flow, and the most important thing to know about testing it: **do it on a real phone, not a laptop.** Desktops/laptops don't have a GPS chip — they fake location from Wi-Fi/IP lookups, which need internet and defeat the whole point of the test. Phones have real GPS hardware that works with no signal at all.

## Getting the app onto a phone (LAN access)

1. Start the dev server (or a static server on the built `dist/` folder) bound to all interfaces, e.g. `npm run dev` (Vite) or `npm run preview -- --host 0.0.0.0`.
2. Find your machine's LAN IP (e.g. `ipconfig` on Windows, `ifconfig` on Mac/Linux — look for something like `192.168.x.x`).
3. Connect your phone to the **same Wi-Fi network** as your machine.
4. On the phone's browser, visit `http://YOUR_LOCAL_IP:PORT` (e.g. `http://192.168.1.50:5173`).

Notes:
- Installing as a PWA (the "Add to Home Screen" prompt) generally requires HTTPS, except on `localhost`. Plain `http://` over LAN may load fine but skip the install prompt — if you need to test the actual install flow over HTTPS without deploying, tunnel the local server with a tool like ngrok, or just deploy to Firebase Hosting (see `docs/DEPLOYMENT.md`) and test against the real HTTPS URL.
- GPS itself needs a secure context too (HTTPS or `localhost`) in most browsers, so if location capture silently fails over plain LAN HTTP, that's expected — use the manual coordinate entry fallback for that case, or test against an HTTPS URL.

## iPhone / Safari specifics

- Use **Safari**, not Chrome — Chrome on iOS cannot install PWAs to the home screen.
- To install: open the app in Safari, tap the Share icon, scroll down, tap "Add to Home Screen", then "Add". The app should show iOS-specific install instructions automatically if it isn't already installed.
- Launch the app from its home-screen icon for testing, not from a Safari tab — only the installed, standalone instance reliably exercises the offline/cache behavior judges or testers care about.
- If the app doesn't work offline after installing: confirm the service worker registered (Safari's remote Web Inspector, or check on desktop DevTools if mirroring), and try clearing site data and reinstalling if it seems stuck on stale cache.

## The airplane-mode test (the core scenario)

This is the scenario that matters most for an offline-first field app — verify it end-to-end before any demo:

1. **Install and log in while online.** Open the app (ideally from its installed home-screen icon), log in with a valid test user, confirm you're logged in.
2. **Go offline.** Turn on Airplane Mode. Keep Wi-Fi off too if you want to be strict about it — GPS itself doesn't need connectivity, it's a separate radio.
3. **Kill the app completely**, not just background it (swipe it away / force-quit).
4. **Reopen the app while still offline.** It should load with no browser connection error, and you should still be logged in (from the cached session) — this depends on having logged in successfully at least once before going offline.
5. **File an incident report while offline.** Location can come from live GPS (works offline on a phone), a tap on the cached map, or manual coordinate entry. Submit it.
6. **Confirm the "saved locally" state.** You should see a clear local-save confirmation, and the incident should show up under Pending Sync.
7. **Kill and reopen the app again, still offline.** Confirm the pending incident is still there — nothing should be lost from a restart while offline.
8. **Turn Airplane Mode off.** Sync should fire automatically within a few seconds (see `docs/SYNC_ENGINE.md` for exactly what triggers it) — no manual "sync now" tap should be required, though one should exist as a fallback.
9. **Check the HQ dashboard.** The incident submitted offline should now appear on the map/list without a manual refresh.

## Other scenarios worth covering

- **Multiple offline incidents**: submit several reports while offline, then verify all of them sync once back online.
- **Going offline mid-sync**: submit while online, kill connectivity right after — the record should stay queued and sync cleanly once reconnected, without duplicating.
- **Oversized photo**: attach a large photo to an incident and confirm the incident still syncs (with the photo dropped) rather than failing silently.

## Reference test coordinates

Useful when GPS isn't available (e.g. testing on a laptop) and you need to exercise the manual-entry path:

| Location | Lat | Lng |
|---|---|---|
| Ratnapura, Sri Lanka | 6.6828 | 80.4012 |
| Colombo, Sri Lanka | 6.9271 | 79.8612 |
| Kandy, Sri Lanka | 7.2906 | 80.6337 |

## Quick checklist

- [ ] App loads on a phone browser over LAN
- [ ] Can log in successfully
- [ ] GPS capture returns coordinates on a real device
- [ ] Can install to home screen (Android Chrome and iOS Safari)
- [ ] Installed app opens in standalone mode
- [ ] Incident can be submitted fully offline
- [ ] App survives being killed and reopened while offline (session + data both persist)
- [ ] Sync fires automatically on reconnect, with no manual step
- [ ] Synced incident appears on the HQ dashboard
