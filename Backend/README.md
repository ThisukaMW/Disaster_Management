# Backend Configuration

This folder contains Firebase configuration for the Project Aegis disaster management system.

## Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database
   - Enable Authentication (Email/Password)

2. **Get Your Firebase Config**
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Click the web icon (</>)
   - Copy the config object

3. **Update Configuration**
   - Update `firebase.config.js` with your Firebase credentials
   - Update `PWA/src/services/firebase.js` with the same credentials

## Firestore Security Rules (Development)

For development/testing, you can use these rules:

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

**Note:** For production, implement proper security rules based on user roles and permissions.

## Authentication Setup

1. In Firebase Console, go to Authentication
2. Enable "Email/Password" sign-in method
3. Create test user accounts for:
   - Field responders
   - Command center staff

## Firestore Collections

The app uses the following collection:
- `incidents` - Stores incident reports from field responders

### Incident Document Structure

```javascript
{
  incidentType: string,      // "Landslide", "Flood", "Road Block", "Power Line Down"
  severity: number,          // 1-5 (1 = Critical, 5 = Minimal)
  latitude: number,
  longitude: number,
  timestamp: string,         // ISO string
  photo: string | null,      // Base64 encoded image
  userId: string,            // Firebase Auth UID
  createdAt: Timestamp,     // Firestore timestamp
  syncedAt: Timestamp        // Firestore timestamp
}
```


