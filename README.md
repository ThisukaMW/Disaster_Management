# ⛑️ ResQ: Offline-First Disaster Response System

**Project Aegis (ResQ)** is a resilient disaster management platform built for the Ratnapura Flood Crisis. It consists of two interconnected applications: an **offline-first Mobile PWA** for field responders and a **real-time Command Dashboard** for headquarters.

## 🔗 Live Demo

- 📱 **Field Responder App (PWA):** https://disaster-management-app-3b9ce.web.app
- 🖥️ **HQ Command Dashboard:** https://disaster-management-app-host.web.app/

## 🏗️ Tech Stack

**Core Architecture**
- Frontend: React 18/19 + Vite
- PWA Engine: `vite-plugin-pwa` (Service Workers & Manifest)
- Language: JavaScript (ES6+)

**Backend & Data**
- Cloud Backend: Firebase (Firestore, Auth, Hosting)
- Local Database: Dexie.js (IndexedDB wrapper) — ensures offline functionality
- Sync Engine: custom "foreground sync" logic (iOS-compliant)

**Maps & Visualization**
- Maps: Leaflet.js + OpenStreetMap (cached tiles for offline use)
- Styles: CSS Modules (dark mode supported)

## 📁 Project Structure

```
Backend/    Shared Firebase config reference
PWA/        Field Responder mobile app (offline-first)
Web/        HQ Command Dashboard
docs/       Setup, architecture, and feature documentation
```

## 🚀 Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node)
- Firebase CLI (`npm install -g firebase-tools`)

## 📱 Component A: Field Responder PWA

The mobile-first application used by responders in the field. Capable of working in Airplane Mode and syncing data when connectivity returns.

```bash
cd PWA
npm install
npm run dev
```

Access at: http://localhost:5173

Key dependencies: `firebase`, `dexie` (offline database), `vite-plugin-pwa`, `leaflet` / `react-leaflet`, `react-router-dom`.

## 🖥️ Component B: HQ Command Dashboard

The web-based dashboard for headquarters to visualize incidents, track responder status, and manage resources in real time.

```bash
cd Web
npm install
npm run dev
```

Access at: http://localhost:5174 (port may vary)

Key dependencies: `firebase` (real-time listeners via `onSnapshot`), `leaflet` (incident map clustering).

## ☁️ Deployment

Both apps deploy to separate Firebase Hosting sites from the same project.

```bash
# Build each app
cd PWA && npm run build && cd ..
cd Web && npm run build && cd ..

# Deploy each target
firebase deploy --only hosting:disaster-management-app-3b9ce   # PWA
firebase deploy --only hosting:disaster-management-app-host    # Web dashboard
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full details.

## 🧪 Testing Offline Mode

1. Open the PWA on a mobile device and log in once while online.
2. Turn on Airplane Mode.
3. Submit an incident report — a "Saved Locally" confirmation appears.
4. Close and reopen the app while still offline — the report is still queued under "Pending Sync".
5. Reconnect to the internet — the app auto-detects the network and syncs. Check the HQ Dashboard for the new pin.

See [docs/TESTING.md](docs/TESTING.md) for the full manual test guide.

## 📚 Documentation

- [docs/SETUP.md](docs/SETUP.md) — full setup and Firebase configuration
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — tech stack, folder structure, data flow
- [docs/FEATURES.md](docs/FEATURES.md) — implemented feature list
- [docs/SYNC_ENGINE.md](docs/SYNC_ENGINE.md) — offline-first sync design
- [docs/TESTING.md](docs/TESTING.md) — manual test guide
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Firebase Hosting deployment
- [docs/USER_GUIDE.md](docs/USER_GUIDE.md) — end-user guide
- [docs/LOCATION_PERMISSIONS.md](docs/LOCATION_PERMISSIONS.md) — location permission handling
- [docs/HACKATHON_COMPLIANCE.md](docs/HACKATHON_COMPLIANCE.md) — requirements checklist
- [docs/ROADMAP.md](docs/ROADMAP.md) — future ideas (not yet implemented)

## 👥 Contributors

- **PWA / Offline Logic:** Geemal ([dev-geemal](../../tree/dev-geemal) branch)
- **Web / Dashboard:** Chanith ([dev-chanith](../../tree/dev-chanith) branch)
