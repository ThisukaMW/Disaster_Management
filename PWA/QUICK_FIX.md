# 🚨 QUICK FIX - IP Mismatch Issue

## The Problem:
- App installed from: `192.168.99.64:8000`
- Server accessed from: `192.168.99.61:8000`
- **Service worker doesn't work** (different origins!)

## ✅ Fix in 3 Steps:

### Step 1: Get Correct IP & Start Server
```bash
cd PWA
npm run serve:mobile
```

**Note the IP shown!** (e.g., `http://192.168.99.64:8000`)

### Step 2: On Your Phone

1. **DELETE old app** from home screen
2. **Clear Safari:** Settings → Safari → Clear History
3. **Open the URL** shown by the script
4. **Wait 10 seconds** (service worker caches)
5. **Add to home screen** again
6. ✅ **Done!**

### Step 3: Test Offline
- Turn on Airplane Mode
- Close app
- Re-open app
- ✅ **Should work!**

---

## 🎯 Better: Use Firebase Hosting

**No more IP issues!**

```bash
cd PWA
npm run build
firebase deploy --only hosting
```

Use Firebase URL: `https://your-project.web.app`

---

## 📝 Why This Happens:

Service workers are **origin-bound**:
- `http://192.168.99.64:8000` ≠ `http://192.168.99.61:8000`
- Must use **same IP** for install and access

**Solution:** Reinstall with correct IP or use Firebase Hosting!

---

**Fix it now!** 🚀


