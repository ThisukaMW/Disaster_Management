# Fix: Firebase Auth Error

## 🔧 Issue
Error: `Firebase: Error (auth/invalid-credential)`

This error occurs because the app was previously using Firebase Auth, but now uses Firestore authentication.

---

## ✅ Solution

### Step 1: Clear Browser Cache

**In Browser DevTools:**
1. Open DevTools (F12 or Cmd+Option+I)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Clear Storage** or **Clear Site Data**
4. Check all boxes
5. Click **Clear site data**

**Or manually:**
- Clear localStorage
- Clear sessionStorage
- Clear cookies
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### Step 2: Rebuild the App

```bash
cd /Users/geemalfernando/Desktop/Disaster_Management/PWA
npm run build
```

### Step 3: Restart the Server

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run serve
```

### Step 4: Test Login

1. Open app in browser
2. Go to login page
3. Try logging in with Firestore responder credentials

---

## 🔍 What Was Changed

### Removed:
- ❌ Firebase Auth (`signInWithEmailAndPassword`)
- ❌ Firebase Auth imports
- ❌ `auth` export from `firebase.js`

### Added:
- ✅ Firestore `responders` collection authentication
- ✅ Email/password matching from Firestore
- ✅ Offline auth caching

---

## 📝 Verify Firestore Setup

Make sure you have responders in Firestore:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `disaster-management-app-3b9ce`
3. Go to **Firestore Database**
4. Check if `responders` collection exists
5. Add a test responder:
   ```json
   {
     "email": "test@example.com",
     "password": "test123",
     "name": "Test Responder"
   }
   ```

---

## 🐛 If Error Persists

1. **Check browser console** for exact error
2. **Verify Firestore rules** allow reading `responders` collection
3. **Check network tab** - is the Firestore query succeeding?
4. **Try incognito/private window** - eliminates cache issues

---

## ✅ Expected Behavior After Fix

- ✅ No Firebase Auth errors
- ✅ Login works with Firestore responders
- ✅ Error message: "Invalid email or password" (if credentials wrong)
- ✅ No "auth/invalid-credential" errors

---

## 🔄 Quick Fix Command

```bash
# Rebuild and restart
cd /Users/geemalfernando/Desktop/Disaster_Management/PWA
npm run build
npm run serve
```

Then **clear browser cache** and try again!

