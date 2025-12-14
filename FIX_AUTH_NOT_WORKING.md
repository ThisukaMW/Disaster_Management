# 🔧 Fix: Authentication Not Working

## ⚠️ About the Dynamic Links Warning

**Good News:** The Dynamic Links deprecation warning does **NOT** affect standard email/password authentication.

The warning is about:
- ❌ Email link authentication (magic links) - **We're NOT using this**
- ❌ Cordova OAuth - **We're NOT using this**

**We're using:** ✅ Standard Email/Password authentication (`signInWithEmailAndPassword`)

---

## ✅ Step 1: Enable Email/Password in Firebase Console

**This is the most common issue!**

### Steps:
1. Go to: https://console.firebase.google.com/project/disaster-management-app-3b9ce/authentication/providers
2. Click on **"Email/Password"** provider
3. **Enable** the first toggle: "Email/Password"
4. **Enable** the second toggle: "Email link (passwordless sign-in)" - **Optional** (we don't need this)
5. Click **"Save"**

### Visual Guide:
```
Authentication → Sign-in method → Email/Password
├─ Enable: ✅ Email/Password (REQUIRED)
└─ Enable: ⚪ Email link (passwordless) (OPTIONAL - we don't use this)
```

---

## ✅ Step 2: Verify Users Exist

1. Go to: https://console.firebase.google.com/project/disaster-management-app-3b9ce/authentication/users
2. Check if users exist:
   - `thisuka@gmail.com`
   - `geemal123@gmail.com`
   - `responder@gmail.com`

3. **If no users exist:**
   - Click **"Add user"**
   - Enter email and password
   - Click **"Add user"**

---

## ✅ Step 3: Test Login

1. Open your app
2. Go to login page
3. Enter credentials:
   - Email: `responder@gmail.com` (or any user from Firebase Console)
   - Password: (the password you set in Firebase Console)
4. Click "Sign In"

### Expected Console Logs:
```
🔐 Attempting login with Firebase Auth: { email: "responder@gmail.com" }
✅ Login successful: { uid: "...", email: "responder@gmail.com" }
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "auth/operation-not-allowed"
**Cause:** Email/Password provider is not enabled

**Fix:**
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password" provider
3. Click "Save"

### Issue 2: "auth/user-not-found" or "auth/invalid-credential"
**Cause:** User doesn't exist or wrong password

**Fix:**
1. Check if user exists in Firebase Console → Authentication → Users
2. Verify email spelling (case-insensitive)
3. Reset password if needed:
   - Click on user in Firebase Console
   - Click "Reset password"
   - Or create new user with known password

### Issue 3: "auth/network-request-failed"
**Cause:** No internet connection

**Fix:**
- Ensure you have internet connection for first login
- After login, session is cached for offline use

### Issue 4: "auth/invalid-api-key" or "auth/unauthorized-domain"
**Cause:** Firebase configuration issue

**Fix:**
1. Check Firebase config in `PWA/src/services/firebase.js`
2. Verify authorized domains in Firebase Console:
   - Go to: Authentication → Settings → Authorized domains
   - Add your domain if using custom domain
   - `localhost` and Firebase domains are auto-authorized

---

## 🔍 Debugging Steps

### 1. Check Browser Console
Open DevTools (F12) → Console tab and look for:
- `🔐 Attempting login with Firebase Auth:` ✅ Good
- `✅ Login successful:` ✅ Success
- `❌ Sign in error:` ❌ Check error code

### 2. Check Firebase Console
1. Go to Authentication → Users
2. Verify users exist
3. Check if Email/Password is enabled:
   - Authentication → Sign-in method → Email/Password

### 3. Test with Known Credentials
1. Create a test user in Firebase Console:
   - Email: `test@example.com`
   - Password: `test123`
2. Try logging in with these credentials
3. Check console for errors

---

## ✅ Quick Verification Checklist

- [ ] Email/Password provider is **enabled** in Firebase Console
- [ ] Users exist in Firebase Console → Authentication → Users
- [ ] Firebase config is correct in `firebase.js`
- [ ] Internet connection is available (for first login)
- [ ] Browser console shows login attempt logs
- [ ] No CORS or domain errors in console

---

## 🚀 Quick Fix Command

If you need to verify Firebase setup:
```bash
# Check Firebase project
firebase projects:list

# Should show: disaster-management-app-3b9ce
```

---

## 📞 Still Not Working?

### Share These Details:
1. **Browser console logs** (copy all logs from DevTools)
2. **Firebase Console screenshot:**
   - Authentication → Sign-in method (show Email/Password status)
   - Authentication → Users (show users list)
3. **Error message** shown to user
4. **Firebase error code** (from console logs)

---

## ✅ Expected Behavior After Fix

1. ✅ Email/Password provider enabled in Firebase Console
2. ✅ Users exist in Firebase Console
3. ✅ Login succeeds with correct credentials
4. ✅ Console shows: `✅ Login successful`
5. ✅ User redirected to `/field` page
6. ✅ Session cached for offline use

---

## 🔒 Security Note

The Dynamic Links warning is **NOT** related to standard email/password authentication. You can safely ignore it if you're only using:
- ✅ Email/Password authentication (`signInWithEmailAndPassword`)
- ✅ Standard Firebase Authentication

You only need to worry if you're using:
- ❌ Email link authentication (magic links)
- ❌ Cordova OAuth

