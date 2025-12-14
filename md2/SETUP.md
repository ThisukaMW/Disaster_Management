# Project Aegis - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd PWA
npm install
```

### 2. Firebase Setup

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Name it "project-aegis" (or any name)
   - Disable Google Analytics (optional)

2. **Enable Services**
   - **Authentication**: 
     - Go to Authentication > Sign-in method
     - Enable "Email/Password"
     - Create test users (e.g., `responder@test.com` / `password123`)
   
   - **Firestore Database**:
     - Go to Firestore Database
     - Click "Create database"
     - Start in "Test mode" (for development)
     - Choose a location

3. **Get Firebase Config**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps"
   - Click web icon `</>`
   - Register app (name: "Aegis PWA")
   - Copy the `firebaseConfig` object

4. **Update Configuration**
   - Open `PWA/src/services/firebase.js`
   - Replace the placeholder config with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
     // ... etc
   };
   ```

### 3. Run the Application

```bash
cd PWA
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Test Offline Functionality

1. **Login Test**:
   - Open the app
   - Login with a test user (while online)
   - Verify you're logged in

2. **Airplane Mode Test**:
   - Turn on Airplane Mode (or disable network in DevTools)
   - Verify "Offline" indicator appears
   - Fill out an incident report
   - Click "Save Incident"
   - Verify success message shows "saved locally"
   - Close the app completely
   - Reopen the app (still offline)
   - Verify you're still logged in
   - Check "Pending Sync" tab - your incident should be there

3. **Sync Test**:
   - Turn off Airplane Mode
   - Wait a few seconds (auto-sync should trigger)
   - Or click "Sync Now" button
   - Open Dashboard at `/dashboard`
   - Verify your incident appears on the map

## Routes

- `/` or `/field` - Field Responder App (Mobile PWA)
- `/dashboard` - Command Dashboard (Web)
- `/login` - Login page

## Building for Production

```bash
cd PWA
npm run build
```

The built files will be in `PWA/dist/`

## PWA Installation

1. Build the app: `npm run build`
2. Serve the `dist` folder using a web server
3. On mobile devices, visit the URL
4. Browser will prompt to "Add to Home Screen"
5. App will work as a standalone app

## Troubleshooting

### GPS Not Working
- Ensure you're using HTTPS (or localhost)
- Check browser permissions for location access
- On mobile, ensure GPS is enabled in device settings

### Sync Not Working
- Check Firebase configuration is correct
- Verify Firestore rules allow writes
- Check browser console for errors
- Ensure you're logged in

### Offline Auth Not Working
- Clear browser cache and try again
- Ensure you logged in at least once while online
- Check localStorage for `disaster_auth_cache`

## Firestore Security Rules (Development)

For testing, use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /incidents/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Important**: Update these rules for production with proper security!

