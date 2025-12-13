# 🔧 IP Address Changed - Quick Fix

## ⚠️ Problem:

Your Mac's IP changed:
- **Old IP:** `192.168.99.64`
- **New IP:** `192.168.99.61` (or vice versa)

**This breaks offline mode!** Service workers are origin-bound, so if the app was installed from a different IP, it won't work offline.

---

## ✅ Quick Fix:

### Option 1: Use Current IP (192.168.99.61)

1. **Delete old app** from home screen
2. **Clear Safari cache:**
   - Settings → Safari → Clear History and Website Data
3. **Open new URL:**
   - `http://192.168.99.61:8000`
4. **Wait 15 seconds** (service worker caches)
5. **Add to home screen** again
6. ✅ **Done!**

### Option 2: Use Firebase Hosting (BEST - No IP Issues!)

**This solves the problem forever!**

```bash
cd PWA
npm run build
firebase deploy --only hosting
```

Then use: `https://your-project.web.app` (never changes!)

---

## 🔍 How to Check Current IP:

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | grep "192.168\|10\." | awk '{print $2}' | head -1
```

---

## 📝 Why This Happens:

- WiFi IPs can change when:
  - Router restarts
  - Device reconnects
  - Network changes
  - DHCP lease expires

- **Service workers are origin-bound:**
  - `http://192.168.99.64:8000` ≠ `http://192.168.99.61:8000`
  - Must use **same IP** for install and access

---

## 🎯 Best Solution: Firebase Hosting

**No more IP issues!**

1. ✅ **Stable URL** - Never changes
2. ✅ **HTTPS** - Full PWA support
3. ✅ **Works everywhere** - No network setup
4. ✅ **Professional** - Judges can access

```bash
cd PWA
npm run build
firebase deploy --only hosting
```

---

## 🚀 Quick Steps Now:

1. **Get current IP:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
   ```

2. **Delete old app** from home screen

3. **Clear Safari cache**

4. **Open new URL** (use current IP)

5. **Reinstall** to home screen

6. ✅ **Test offline!**

---

**Or deploy to Firebase Hosting for a permanent solution!** 🎉


