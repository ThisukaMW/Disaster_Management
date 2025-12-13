# ✈️ Airplane Mode Testing Guide

## 📱 Link to Add to Home Screen:

### **Your App URL:**
```
http://192.168.99.64:8000
```

**Make sure:**
- ✅ Your phone is on the **same WiFi** as your Mac
- ✅ Server is running (`npm run serve:mobile`)
- ✅ Use **Safari** on iPhone (required for PWA)

---

## 📲 Step-by-Step: Add to Home Screen

### On iPhone (Safari):

1. **Open Safari** on your iPhone
2. **Go to:** `http://192.168.99.64:8000`
3. **Wait for app to load** (service worker will cache files)
4. **Tap Share button** (square with arrow up) at bottom
5. **Scroll down**, tap **"Add to Home Screen"**
6. **Tap "Add"** in top right
7. **App icon appears** on home screen ✅

### On Android (Chrome):

1. **Open Chrome** on your Android
2. **Go to:** `http://192.168.99.64:8000`
3. **Look for install banner** or tap menu (⋮)
4. **Tap "Install app"** or **"Add to Home Screen"**
5. **Tap "Install"**
6. **App icon appears** on home screen ✅

---

## ✈️ Airplane Mode Test (Complete Flow)

### Step 1: Install PWA (While Online)

1. Open app URL in Safari/Chrome
2. Add to home screen (see above)
3. **Launch app from home screen** (not browser)
4. Wait for app to fully load
5. **Service worker caches all files** automatically

### Step 2: Login (While Online)

1. Open app from home screen
2. Login with your credentials
3. Verify you're logged in
4. **Auth is cached** for offline use

### Step 3: Go Offline (Airplane Mode)

1. **Turn on Airplane Mode** on your phone
2. **Close app completely** (swipe up, remove from memory)
3. **Wait 5 seconds**
4. **Re-open app from home screen**

### Step 4: Verify Offline Works

✅ **App should load** (no Safari "can't connect" error)
✅ **You should still be logged in** (cached auth)
✅ **App should work normally**

### Step 5: Report Incident Offline

1. Tap **"Report Incident"** tab
2. Fill out the form:
   - Select incident type
   - Select severity
   - **Location:** Map should work (cached tiles)
   - **Photo:** Take/select photo
3. Tap **"Save Incident"**
4. **Should see:** "✓ Incident saved locally successfully!"
5. Go to **"Pending Sync"** tab
6. **Your incident should be there** ✅

### Step 6: Close App (Still Offline)

1. **Close app completely** (swipe up)
2. **Re-open app** (still in Airplane Mode)
3. **Verify:**
   - ✅ App loads
   - ✅ Still logged in
   - ✅ Incident still in "Pending Sync"

### Step 7: Go Online & Sync

1. **Turn off Airplane Mode**
2. **Re-open app** (or wait for foreground sync)
3. **Check console logs:**
   ```
   🔄 Foreground Sync: Found 1 unsynced record(s)
   ✅ Online: true, Unsynced Records: 1
   ✅ Synced incident 1 - POST successful, marked as synced
   ```
4. **Go to Dashboard:**
   - Open dashboard in browser
   - Your incident should appear on map ✅

---

## ✅ Checklist for Airplane Mode Test:

- [ ] App installed to home screen
- [ ] App loads when offline (no Safari error)
- [ ] User stays logged in when offline
- [ ] Can report incident when offline
- [ ] Incident saved locally (appears in Pending Sync)
- [ ] App can be closed and reopened offline
- [ ] Data persists after app restart (offline)
- [ ] When online, data syncs automatically
- [ ] Synced data appears in dashboard

---

## 🐛 Troubleshooting:

### App doesn't load offline?

1. **Make sure app is installed** (not just in browser)
2. **Launch from home screen** (not Safari)
3. **Check service worker:**
   - Open app
   - DevTools → Application → Service Workers
   - Should see `sw.js` registered and active

### Service worker not registered?

1. **Clear cache:**
   - DevTools → Application → Clear Storage
   - Clear all and reload

2. **Rebuild app:**
   ```bash
   cd PWA
   npm run build
   ```

3. **Restart server:**
   ```bash
   npm run serve:mobile
   ```

### Still showing Safari error?

1. **Make sure you're launching from home screen**
2. **Not from Safari browser**
3. **App must be installed as PWA**

---

## 📝 Expected Behavior:

### When Offline:
- ✅ App loads (cached files)
- ✅ User logged in (cached auth)
- ✅ Can report incidents
- ✅ Data saved locally
- ✅ No network errors

### When Online:
- ✅ App loads normally
- ✅ Data syncs automatically
- ✅ Foreground sync works
- ✅ Dashboard updates

---

## 🎯 This is the Hackathon Test!

This airplane mode test is exactly what judges will do:
1. Turn on Airplane Mode
2. Fill out report
3. Kill app
4. Re-open app (offline)
5. Verify still logged in + data present
6. Turn internet back on
7. Watch dashboard - data appears

**Your app should pass all these steps!** ✅

---

## 🚀 Quick Start:

```bash
# 1. Build app
cd PWA
npm run build

# 2. Start server
npm run serve:mobile

# 3. Open on phone
# http://192.168.99.64:8000

# 4. Add to home screen
# 5. Test airplane mode!
```

---

## ✅ Ready to Test!

Follow the steps above and your app will work perfectly in Airplane Mode! 🎉

