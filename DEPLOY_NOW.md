# 🚀 Deploy to Firebase Hosting - Quick Guide

## ✅ Your Project is Already Configured!

- **Project ID:** `disaster-management-app-3b9ce`
- **Hosting URL:** `https://disaster-management-app-3b9ce.web.app`
- **Config:** Already set up in `firebase.json`

---

## 📋 Step-by-Step Deployment

### Step 1: Build the App
```bash
cd /Users/geemalfernando/Desktop/Disaster_Management/PWA
npm run build
```

This creates the `dist` folder with production files.

---

### Step 2: Deploy to Firebase
```bash
cd /Users/geemalfernando/Desktop/Disaster_Management
firebase deploy --only hosting
```

**Expected output:**
```
=== Deploying to 'disaster-management-app-3b9ce'...

✔  hosting[disaster-management-app-3b9ce]: file upload complete
✔  Deploy complete!

Hosting URL: https://disaster-management-app-3b9ce.web.app
```

---

## 🎯 Quick One-Liner (From Project Root)

```bash
cd /Users/geemalfernando/Desktop/Disaster_Management/PWA && npm run build && cd .. && firebase deploy --only hosting
```

---

## ✅ Verify Deployment

1. **Visit your app:**
   - https://disaster-management-app-3b9ce.web.app

2. **Test features:**
   - Login
   - Submit incident
   - SOS button
   - Offline functionality

---

## 🔧 Troubleshooting

### If you get "Not logged in":
```bash
firebase login
```

### If build fails:
```bash
cd PWA
npm install
npm run build
```

### If deploy fails:
```bash
# Check Firebase project
firebase use

# Should show: Using project disaster-management-app-3b9ce
```

---

## 📱 Access on Mobile

1. **Share the URL:**
   - https://disaster-management-app-3b9ce.web.app

2. **Open on phone:**
   - Add to Home Screen
   - Works as PWA

---

## 🎉 That's It!

Your app is live and accessible worldwide!

**Live URL:** https://disaster-management-app-3b9ce.web.app

