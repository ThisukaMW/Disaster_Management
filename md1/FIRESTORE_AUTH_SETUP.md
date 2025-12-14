# Firestore Responders Collection Authentication Setup

## 📋 Overview

The app now authenticates users from the Firestore `responders` collection instead of Firebase Auth.

---

## 🔧 Firestore Collection Structure

### Collection Name: `responders`

### Document Structure:
```javascript
{
  email: "responder@example.com",  // Required: Email address (lowercase)
  password: "password123",          // Required: Password (plain text)
  name: "John Doe",                 // Optional: Responder name
  role: "responder",                // Optional: User role
  // ... any other fields you need
}
```

---

## 📝 How to Add Responders in Firestore

### Option 1: Firebase Console (Web UI)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `disaster-management-app-3b9ce`
3. Navigate to **Firestore Database**
4. Click **"Start collection"** (if first time) or **"Add collection"**
5. Collection ID: `responders`
6. Click **"Next"**
7. Add document:
   - **Document ID**: Auto-generate or custom
   - **Fields**:
     - `email` (string): `responder@example.com`
     - `password` (string): `password123`
     - `name` (string): `John Doe` (optional)
     - `role` (string): `responder` (optional)
8. Click **"Save"**

### Option 2: Firebase CLI

```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login
firebase login

# Use Firestore emulator or add via script
```

### Option 3: Add via Code (One-time setup script)

Create a file `setup-responders.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDG2LDu5cqN-OHTIcm_bZwcYYHZILiGj9M",
  authDomain: "disaster-management-app-3b9ce.firebaseapp.com",
  projectId: "disaster-management-app-3b9ce",
  // ... rest of config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addResponders() {
  const responders = [
    {
      email: "responder1@example.com",
      password: "password123",
      name: "Responder One",
      role: "responder"
    },
    {
      email: "responder2@example.com",
      password: "password456",
      name: "Responder Two",
      role: "responder"
    }
  ];

  for (const responder of responders) {
    try {
      await addDoc(collection(db, 'responders'), responder);
      console.log(`Added responder: ${responder.email}`);
    } catch (error) {
      console.error(`Error adding ${responder.email}:`, error);
    }
  }
}

addResponders();
```

---

## 🔐 Security Notes

### ⚠️ Important Security Warning:

**Storing passwords in plain text is NOT secure for production!**

### For Production, You Should:

1. **Hash passwords** using bcrypt or similar
2. **Use Firebase Auth** (recommended)
3. **Implement proper password hashing** before storing

### For Hackathon/Demo:

- Plain text passwords are acceptable for demonstration
- Make sure Firestore security rules restrict access
- Use strong passwords in your demo data

---

## 🔒 Firestore Security Rules

Update your Firestore security rules to protect the responders collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to responders only for authenticated users
    // Or restrict based on your needs
    match /responders/{responderId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins can write (use Cloud Functions)
    }
    
    // Incidents collection
    match /incidents/{incidentId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## ✅ Testing Authentication

### Test Login:

1. **Add a responder** to Firestore:
   ```
   email: "test@example.com"
   password: "test123"
   ```

2. **Open the app** and go to login page

3. **Enter credentials**:
   - Email: `test@example.com`
   - Password: `test123`

4. **Should login successfully** ✅

### Test Offline:

1. **Login while online** (creates cache)
2. **Go offline** (Airplane Mode)
3. **Kill app and reopen**
4. **Should still be logged in** (from cache) ✅

---

## 📊 Example Responder Document

```json
{
  "email": "responder@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "responder",
  "createdAt": "2024-01-01T00:00:00Z",
  "active": true
}
```

---

## 🐛 Troubleshooting

### "Invalid email or password" error:

1. **Check email is lowercase** in Firestore
2. **Verify password matches exactly** (case-sensitive)
3. **Check Firestore rules** allow reading responders collection
4. **Check network connection** (needs internet for first login)

### Offline login not working:

1. **Login once while online** (creates cache)
2. **Check localStorage** in DevTools → Application → Local Storage
3. **Verify cache key**: `disaster_auth_cache`

---

## 📝 Code Changes Made

### Updated Files:
- `PWA/src/services/authService.js` - Now queries Firestore "responders" collection
- Removed dependency on Firebase Auth
- Uses Firestore queries to match email and password

### How It Works:

1. **Login**: Queries `responders` collection for matching email
2. **Password Check**: Compares provided password with stored password
3. **Cache**: Stores user info in localStorage for offline use
4. **Offline**: Uses cached auth when offline

---

## 🚀 Quick Start

1. **Add responders to Firestore** (see above)
2. **Test login** with email/password
3. **Verify offline login** works (login once online, then test offline)

---

## ⚠️ Production Recommendations

For production deployment:

1. **Hash passwords** before storing
2. **Use Firebase Auth** (more secure)
3. **Implement password reset** functionality
4. **Add rate limiting** for login attempts
5. **Use HTTPS** only
6. **Implement proper session management**

---

## ✅ Current Implementation

- ✅ Queries Firestore "responders" collection
- ✅ Matches email (case-insensitive)
- ✅ Matches password (case-sensitive)
- ✅ Caches auth for offline use
- ✅ Works offline after initial login
- ⚠️ Passwords stored in plain text (acceptable for hackathon)

