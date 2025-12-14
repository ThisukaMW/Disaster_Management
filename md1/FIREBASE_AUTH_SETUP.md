# ✅ Firebase Authentication Setup

## 🔄 What Changed

The app now uses **Firebase Authentication** instead of Firestore `responders` collection.

### Before:
- ❌ Authenticated against Firestore `responders` collection
- ❌ Required Firestore security rules to allow reading responders
- ❌ Manual password matching

### Now:
- ✅ Uses Firebase Authentication (standard Firebase Auth)
- ✅ Users from Firebase Console → Authentication → Users
- ✅ Secure password hashing handled by Firebase
- ✅ Better security and offline support

---

## 🔐 How It Works

1. **User enters email and password** in login form
2. **Firebase Authentication** verifies credentials
3. **Session cached** in localStorage for offline use
4. **User stays logged in** even when offline

---

## 👥 User Management

### View Users:
Go to: https://console.firebase.google.com/project/disaster-management-app-3b9ce/authentication/users

### Add New User:
1. Go to Firebase Console → Authentication → Users
2. Click **"Add user"** button
3. Enter:
   - **Email:** `user@example.com`
   - **Password:** (choose a secure password)
4. Click **"Add user"**

### Test Users (from your Firebase Console):
Based on the console, you have these users:
- `thisuka@gmail.com`
- `geemal123@gmail.com`
- `responder@gmail.com`

**Note:** You'll need to know the passwords for these users (or reset them).

---

## 🔑 Reset Password (If Needed)

### Option 1: Reset in Firebase Console
1. Go to Authentication → Users
2. Click on the user
3. Click **"Reset password"**
4. Firebase will send a password reset email

### Option 2: Create New User
1. Go to Authentication → Users
2. Click **"Add user"**
3. Enter email and password
4. Use these credentials to login

---

## ✅ Testing

### Test Login:
1. Open your app
2. Go to login page
3. Enter credentials from Firebase Authentication:
   - Email: `responder@gmail.com` (or any user from Firebase Console)
   - Password: (the password set in Firebase Console)
4. Click "Sign In"

### Expected Behavior:
- ✅ Login succeeds if credentials are correct
- ✅ User redirected to `/field` page
- ✅ Session cached for offline use
- ✅ User stays logged in after app restart (offline)

---

## 🐛 Common Issues

### Issue 1: "Invalid email or password"
**Cause:** Email/password doesn't match Firebase Authentication users

**Fix:**
- Verify user exists in Firebase Console → Authentication → Users
- Check email spelling (case-insensitive)
- Verify password is correct
- Reset password if needed

### Issue 2: "User not found"
**Cause:** User doesn't exist in Firebase Authentication

**Fix:**
- Create user in Firebase Console → Authentication → Users
- Or use existing user credentials

### Issue 3: "Network error"
**Cause:** No internet connection

**Fix:**
- Login requires internet connection (first time)
- After login, session is cached for offline use

---

## 🔒 Security Notes

1. **Passwords are hashed** by Firebase (not stored in plain text)
2. **Email verification** can be enabled in Firebase Console
3. **Password reset** available via Firebase Console
4. **Session tokens** are securely managed by Firebase

---

## 📝 Firebase Authentication Features

### Available Features:
- ✅ Email/Password authentication
- ✅ Password reset (via email)
- ✅ Email verification (can be enabled)
- ✅ User management (add, delete, disable users)
- ✅ Secure password hashing
- ✅ Session management

### To Enable Email Verification:
1. Go to Firebase Console → Authentication → Settings
2. Enable "Email verification"
3. Users will receive verification emails

---

## 🚀 Next Steps

1. **Test login** with existing Firebase Authentication users
2. **Create new users** if needed in Firebase Console
3. **Reset passwords** if you don't know them
4. **Verify offline login** works (login once online, then test offline)

---

## 📞 Quick Reference

- **Firebase Console:** https://console.firebase.google.com/project/disaster-management-app-3b9ce
- **Authentication Users:** https://console.firebase.google.com/project/disaster-management-app-3b9ce/authentication/users
- **Authentication Settings:** https://console.firebase.google.com/project/disaster-management-app-3b9ce/authentication/settings

---

## ✅ Success Indicators

After setup, you should be able to:
- ✅ Login with Firebase Authentication users
- ✅ See users in Firebase Console → Authentication → Users
- ✅ Create new users via Firebase Console
- ✅ Reset passwords via Firebase Console
- ✅ Stay logged in offline (after initial login)

