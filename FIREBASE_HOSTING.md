# Firebase Hosting Setup

Since you're using Firebase, we'll use **Firebase Hosting** to serve your PWA. This is the best solution for your tech stack!

## Setup Instructions

### 1. Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

This will open a browser window for you to authenticate.

### 3. Initialize Firebase Hosting

```bash
cd /Users/geemalfernando/Desktop/Disaster_Management
firebase init hosting
```

When prompted:
- **Select existing project** or create a new one
- **Public directory**: `PWA/dist`
- **Single-page app**: Yes (for React Router support)
- **Overwrite index.html**: No

### 4. Update Firebase Project ID

Edit `.firebaserc` and replace `your-firebase-project-id` with your actual Firebase project ID.

Or run:
```bash
firebase use --add
```
Select your project from the list.

### 5. Build and Deploy

```bash
cd PWA
npm run build
cd ..
firebase deploy --only hosting
```

Or use the npm script:
```bash
cd PWA
npm run deploy
```

### 6. Access Your App

After deployment, Firebase will give you a URL like:
```
https://your-project-id.web.app
```
or
```
https://your-project-id.firebaseapp.com
```

---

## Benefits of Firebase Hosting

✅ **HTTPS by default** - Required for PWA features (GPS, Service Workers)
✅ **CDN** - Fast global delivery
✅ **SPA routing** - Handles React Router automatically
✅ **Free tier** - Generous free hosting
✅ **Same tech stack** - Already using Firebase
✅ **Easy deployment** - One command to deploy
✅ **Custom domain** - Can add your own domain later

---

## Local Testing (Before Deploying)

You can test locally with Firebase emulator:

```bash
firebase emulators:start --only hosting
```

Or use Vite preview:
```bash
cd PWA
npm run preview -- --host 0.0.0.0
```

---

## Deployment Workflow

1. **Make changes to code**
2. **Build**: `cd PWA && npm run build`
3. **Deploy**: `firebase deploy --only hosting`
4. **Done!** App is live on Firebase URL

---

## Important Notes

- **HTTPS is required** for:
  - GPS/location services
  - Service Workers
  - PWA installation
  - Secure authentication

- **Firebase Hosting provides HTTPS automatically** - perfect for your PWA!

- **The `firebase.json` is already configured** with:
  - SPA routing (all routes → index.html)
  - Proper cache headers for PWA
  - Service worker cache control

---

## Quick Commands

```bash
# Build the app
cd PWA && npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Or use the npm script
cd PWA && npm run deploy

# View deployment
firebase hosting:channel:list
```

---

## For Hackathon Demo

1. Deploy to Firebase Hosting (gets HTTPS URL)
2. Share the Firebase URL with judges
3. They can access from any device
4. HTTPS ensures all PWA features work
5. No need for local network setup!

This is the **professional way** to serve your PWA! 🚀

