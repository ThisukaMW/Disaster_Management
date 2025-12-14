# Firebase Commands Reference

## 🔐 Authentication

### Login to Firebase
```bash
firebase login
```

### Logout from Firebase
```bash
firebase logout
```

### Check current user
```bash
firebase login:list
```

---

## 📦 Deployment

### Deploy to Firebase Hosting (from project root)
```bash
cd /Users/geemalfernando/Desktop/Disaster_Management
firebase deploy --only hosting
```

### Deploy with build (from PWA folder)
```bash
cd /Users/geemalfernando/Desktop/Disaster_Management/PWA
npm run build && firebase deploy --only hosting
```

### Deploy using npm script (from PWA folder)
```bash
cd /Users/geemalfernando/Desktop/Disaster_Management/PWA
npm run deploy
```

### Deploy to specific project
```bash
firebase deploy --only hosting --project disaster-management-app-3b9ce
```

### Deploy with message
```bash
firebase deploy --only hosting --message "Updated UI colors"
```

---

## 🛑 Stop/Undo Deployment

### Cancel ongoing deployment
Press `Ctrl+C` in the terminal where deployment is running

### Stop serving traffic (disable hosting)
```bash
firebase hosting:disable
```

### List deployment history / channels
```bash
firebase hosting:channel:list
```

### View previous deployments
Note: Firebase Hosting doesn't have a direct rollback command. You can:
1. View deployment history in Firebase Console: https://console.firebase.google.com/project/disaster-management-app-3b9ce/hosting
2. Redeploy a previous version manually
3. Use hosting channels for preview deployments

---

## 📊 View & Manage

### View hosting sites
```bash
firebase hosting:sites:list
```

### Get site info
```bash
firebase hosting:sites:get SITE_ID
```

### Create a new hosting site
```bash
firebase hosting:sites:create SITE_ID
```

### Delete a hosting site
```bash
firebase hosting:sites:delete SITE_ID
```

### Create preview channel
```bash
firebase hosting:channel:create preview-channel
```

### Deploy to preview channel
```bash
firebase hosting:channel:deploy preview-channel
```

### List all channels
```bash
firebase hosting:channel:list
```

### Open channel URL
```bash
firebase hosting:channel:open preview-channel
```

### Delete a channel
```bash
firebase hosting:channel:delete preview-channel
```

### View current project
```bash
firebase use
```

### List all projects
```bash
firebase projects:list
```

### Switch project
```bash
firebase use disaster-management-app-3b9ce
```

### View hosting configuration
```bash
cat firebase.json
```

---

## 🔍 Status & Info

### Check Firebase CLI version
```bash
firebase --version
```

### View deployment status
```bash
firebase hosting:channel:list
```

### View site URL
After deployment, Firebase will show:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/disaster-management-app-3b9ce/overview
Hosting URL: https://disaster-management-app-3b9ce.web.app
```

---

## 🧪 Testing Before Deploy

### Test locally with Firebase emulator
```bash
firebase emulators:start --only hosting
```
Then access: `http://localhost:5000`

### Build and preview locally (recommended)
```bash
cd /Users/geemalfernando/Desktop/Disaster_Management/PWA
npm run build
npm run serve
```
Then access: `http://localhost:8000`

---

## 🗑️ Cleanup

### Remove hosting site
```bash
firebase hosting:sites:delete SITE_ID
```

### Clear Firebase cache
```bash
firebase cache:clear
```

---

## 📝 Quick Reference

### Full Deployment Workflow
```bash
# 1. Navigate to PWA folder
cd /Users/geemalfernando/Desktop/Disaster_Management/PWA

# 2. Build the app
npm run build

# 3. Navigate to project root
cd ..

# 4. Deploy to Firebase
firebase deploy --only hosting
```

### Or use the npm script (does steps 2-4)
```bash
cd /Users/geemalfernando/Desktop/Disaster_Management/PWA
npm run deploy
```

---

## 🌐 Your Firebase Project

- **Project ID**: `disaster-management-app-3b9ce`
- **Hosting URL**: `https://disaster-management-app-3b9ce.web.app`
- **Custom Domain**: (if configured)

---

## ⚠️ Important Notes

1. **Always build before deploying**: `npm run build` in PWA folder
2. **Deploy from project root**: `firebase deploy` should be run from `/Users/geemalfernando/Desktop/Disaster_Management`
3. **Check firebase.json**: Make sure `public: "PWA/dist"` is correct
4. **Service Worker**: Will be automatically included in deployment
5. **SPA Routing**: Already configured in `firebase.json` rewrites

---

## 🆘 Troubleshooting

### If deployment fails:
```bash
# Check if logged in
firebase login:list

# Re-login if needed
firebase login

# Check project
firebase use

# Verify build exists
ls -la PWA/dist
```

### If you get "project not found":
```bash
# Set the project explicitly
firebase use disaster-management-app-3b9ce
```

### If build folder is missing:
```bash
cd PWA
npm run build
cd ..
firebase deploy --only hosting
```

