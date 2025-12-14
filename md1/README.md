# Project Aegis - Field Responder PWA

Offline-First Disaster Response System for Field Responders

## Features

- ✅ Offline-First Data Collection
- ✅ Automatic Sync Engine
- ✅ Persistent Offline Authentication
- ✅ GPS Location Capture
- ✅ Photo Capture Support
- ✅ Pending Incidents Management

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Open `src/services/firebase.js`
   - Replace the Firebase config object with your actual Firebase project credentials:
     ```javascript
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
     };
     ```

3. **Set up Firebase Authentication**
   - In Firebase Console, enable Email/Password authentication
   - Create test user accounts for responders

4. **Set up Firestore Database**
   - Create a Firestore database
   - Set up security rules (for development, you can use test mode)

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   ```

## Testing Offline Functionality

1. Open the app in your browser
2. Log in while online
3. Turn on Airplane Mode
4. Fill out and submit an incident report
5. Close and reopen the app (still offline)
6. Verify you're still logged in and data is saved
7. Turn off Airplane Mode
8. Check the dashboard to see the synced data

## Project Structure

```
src/
  ├── components/        # Reusable UI components
  ├── pages/            # Main page components
  ├── services/         # Business logic services
  ├── db/              # Database configuration
  └── App.jsx          # Main app component with routing
```

## Tech Stack

- React + Vite
- Dexie.js (IndexedDB)
- Firebase Auth & Firestore
- Leaflet.js + OpenStreetMap
- PWA Support
