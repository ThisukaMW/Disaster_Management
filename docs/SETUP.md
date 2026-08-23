# Setup Guide

Project Aegis (ResQ) is made up of three folders in this repo:

| Folder | What it is |
|---|---|
| `PWA` | Offline-first field-responder app (React + Vite). Installable as a PWA. |
| `Web` | HQ command dashboard (React + Vite). Map + incident management for operators. |
| `Backend` | Firebase config/scripts shared by both apps (no standalone server to run). |

Both `PWA` and `Web` talk directly to the same Firebase project (Auth + Firestore) — there is no custom backend API.

## Prerequisites

- Node.js 18+ and npm
- A Firebase project (free Spark plan is enough)
- A phone or a second device on the same Wi-Fi if you want to test the mobile/offline flow

## 1. Install dependencies

```bash
# Field-responder PWA
cd PWA
npm install

# HQ dashboard
cd ../Web
npm install
```

`Backend` has no scripts of its own — it just pins the `firebase` package for any one-off admin scripts (e.g. seeding data).

## 2. Create and configure the Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (any name, e.g. "project-aegis"). Google Analytics is optional and can be disabled.
2. **Enable Authentication**
   - Authentication → Sign-in method → enable **Email/Password**.
   - Authentication → Users → add at least one test user (e.g. `responder@test.com` / a password you choose).
3. **Enable Firestore**
   - Firestore Database → Create database → start in **Test mode** for local development, choose any region.
4. **Register a Web app**
   - Project Settings (gear icon) → "Your apps" → click the web icon `</>` → register an app.
   - Copy the generated `firebaseConfig` object.

## 3. Add credentials to each app

Both `PWA` and `Web` read their Firebase config from a local service file. Update each with your own project's values — never commit real keys:

`PWA/src/services/firebase.js` and the equivalent config file under `Web/src/`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

Treat these values as placeholders in any doc or commit — put real keys only in your local, git-ignored copy.

Authentication is done through **Firebase Authentication** (email/password), not a custom user collection. Users are created and managed from Firebase Console → Authentication → Users; there's no self-serve sign-up flow in the apps.

## 4. Firestore security rules

For local development/demo, the rules just need to require a signed-in user for the `incidents` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /incidents/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Paste these into Firestore Database → Rules in the console and click **Publish**. These are development rules only — they trust any authenticated user with full read/write on incidents, which is fine for a hackathon demo but would need tightening (e.g. per-role checks, write validation) for production.

## 5. Run the dev servers

```bash
# Field-responder PWA — http://localhost:5173
cd PWA
npm run dev

# HQ dashboard — runs on Vite's next free port, typically http://localhost:5174
cd ../Web
npm run dev
```

Both are plain Vite dev servers, so they hot-reload on save.

## 6. Quick smoke test

1. Open the PWA, log in with your test user while online.
2. Turn on Airplane Mode / disable network in DevTools.
3. Submit an incident report — it should save with a "saved locally" message and show up under "Pending Sync".
4. Go back online — the queued incident should sync automatically within a few seconds.
5. Open the Web dashboard and confirm the incident appears on the map.

See `docs/TESTING.md` for the full manual test guide and `docs/SYNC_ENGINE.md` for how the offline queue actually works.

## Troubleshooting

- **GPS not working**: needs HTTPS or `localhost`; check browser/OS location permissions.
- **Sync not working**: double-check the Firebase config values and that Firestore rules allow writes for authenticated users; check the browser console for errors.
- **Login works online but not offline**: you must log in successfully at least once while online — that's what seeds the offline auth cache (`localStorage` key `disaster_auth_cache`). Clearing browser storage clears this cache too.
