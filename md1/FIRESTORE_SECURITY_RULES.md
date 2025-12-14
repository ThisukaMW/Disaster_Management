# Firestore Security Rules for Responders Collection

## 🔒 Required Security Rules

Your Firestore security rules must allow reading the `responders` collection for authentication to work.

### Current Issue
If you're getting "Invalid email or password" or "Access denied" errors, it's likely because Firestore security rules are blocking the query.

---

## ✅ Solution: Update Firestore Rules

### Step 1: Go to Firestore Rules
1. Open [Firebase Console](https://console.firebase.google.com/project/disaster-management-app-3b9ce/firestore/rules)
2. Click on **Firestore Database** → **Rules** tab

### Step 2: Add These Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow reading responders collection for authentication
    match /responders/{responderId} {
      allow read: if true; // Allow anyone to read (for login)
      allow write: if false; // Only allow writes from admin/backend
    }
    
    // Allow authenticated users to read/write incidents
    match /incidents/{incidentId} {
      allow read, write: if request.auth != null || 
        resource.data.userId == request.auth.uid;
    }
    
    // Default: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 3: Publish Rules
1. Click **Publish** button
2. Wait for rules to deploy (usually instant)

---

## 🔍 Test Credentials

Based on your Firestore document:
- **Email:** `kamal@gmail.com`
- **Password:** `kamal@123`

---

## 🐛 Debugging Steps

### 1. Check Browser Console
Open DevTools (F12) → Console tab and look for:
- `🔐 Attempting login:` - Shows email being queried
- `📊 Query result:` - Shows if query found documents
- `❌ No responder found` - Email doesn't exist
- `❌ Password mismatch` - Password doesn't match
- `🚫 Firestore permission denied` - Security rules blocking

### 2. Verify Firestore Document
1. Go to [Firestore Console](https://console.firebase.google.com/project/disaster-management-app-3b9ce/firestore/data)
2. Check `responders` collection
3. Verify document has:
   - `email` field (exact match, case-sensitive in query but normalized)
   - `password` field (exact match, case-sensitive)

### 3. Test Query Manually
In Firestore Console:
1. Go to `responders` collection
2. Use filter: `email == "kamal@gmail.com"`
3. Should return 1 document

---

## ⚠️ Security Note

**Current rules allow public read access to responders collection for login.**

For production, consider:
- Using Firebase Authentication instead
- Or implementing a backend API for login
- Or using App Check to prevent abuse

---

## ✅ After Fixing Rules

1. **Clear browser cache** (or use incognito)
2. **Try login again** with:
   - Email: `kamal@gmail.com`
   - Password: `kamal@123`
3. **Check console** for detailed logs

---

## 📝 Quick Fix Command

If you have Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

Or update rules in Firebase Console manually.

