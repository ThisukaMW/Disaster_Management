# Project Aegis - Step-by-Step User Guide

## 📱 How to Use the PWA (Progressive Web App)

### Step 1: Access the App

#### Option A: Development (Local Testing)
1. Open terminal
2. Navigate to project: `cd PWA`
3. Start dev server: `npm run dev`
4. Open browser: `http://localhost:5173`

#### Option B: Production (Deployed)
1. Visit the deployed URL (e.g., Firebase Hosting URL)
2. App loads automatically

#### Option C: From Your Phone
1. Make sure phone is on same WiFi as your computer
2. Find your computer's IP address
3. Visit: `http://YOUR_IP:5173` (dev) or deployed URL
4. App opens in mobile browser

---

## 🔐 Step 2: Login

1. **Open the app** - You'll see the login screen
2. **Enter credentials:**
   - Email: Your Firebase Auth email
   - Password: Your Firebase Auth password
3. **Click "Sign In"**
4. **Allow location permission** when browser asks (for GPS)
5. **You're logged in!** ✅

**Important:** Login once while online. Your session is cached for offline use.

---

## 📍 Step 3: Report an Incident

### 3.1 Fill Out the Form

1. **Select Incident Type:**
   - Click the dropdown
   - Choose: Landslide, Flood, Road Block, or Power Line Down

2. **Select Severity:**
   - Click the severity dropdown
   - Choose: 1 (Critical) to 5 (Minimal)

3. **Set Location:**
   - **Map appears automatically** with a red pin
   - **Blue circle** shows your current location (if GPS available)
   - **Click anywhere on map** to place the red incident pin
   - **Click "📍 Use My Location"** to center map on your GPS location
   - Location coordinates update automatically below the map

4. **Add Photo (Optional):**
   - Click "Choose File" or camera icon
   - Select or take a photo
   - Preview appears

5. **Submit:**
   - Click "Save Incident" button
   - You'll see: "✓ Incident saved locally successfully!" (if offline)
   - Or: "✓ Incident saved and synced successfully!" (if online)

---

## 🗺️ Step 4: Using the Map

### Map Features:

1. **View Your Location:**
   - Blue circle = Your current GPS location
   - Appears automatically when GPS is available

2. **Select Incident Location:**
   - Click anywhere on the map
   - Red pin appears at clicked location
   - Coordinates update automatically

3. **Center on Your Location:**
   - Click "📍 Use My Location" button
   - Map centers on your GPS location
   - Red pin moves to your location

4. **Zoom:**
   - Pinch to zoom (mobile)
   - Scroll wheel (desktop)
   - Use +/- buttons

---

## 📤 Step 5: Sync Data

### Automatic Sync:
- **When online:** Data syncs automatically when you submit
- **When going online:** All pending incidents sync automatically
- **No action needed!** ✅

### Manual Sync:
1. Go to **"Pending Sync"** tab
2. See list of unsynced incidents
3. Click **"Sync Now"** button (if online)
4. Wait for confirmation

### Check Sync Status:
- **Green "Online"** indicator = Can sync
- **Red "Offline"** indicator = Data saved locally, will sync later
- **Pending count** shows number of unsynced incidents

---

## 📋 Step 6: View Pending Incidents

1. **Click "Pending Sync" tab**
2. **See all unsynced incidents:**
   - Incident type
   - Severity (color-coded)
   - Location coordinates
   - Timestamp
   - Photo (if attached)
3. **Sync manually** if needed (when online)

---

## 🖥️ Step 7: View Dashboard (Command Center)

1. **Navigate to:** `/dashboard` (or click dashboard link)
2. **See live map:**
   - All incidents as pins
   - Click pins to see details
3. **See incident list:**
   - Real-time updates
   - Auto-refreshes as new data arrives
   - Click items to highlight on map
4. **View statistics:**
   - Total incidents
   - Critical incidents count

---

## 📲 Step 8: Install as PWA (Add to Home Screen)

### On Mobile (Android/Chrome):
1. Visit the app URL
2. Look for **"Install"** prompt at bottom
3. Click **"Install"** button
4. Or: Menu (⋮) → **"Install app"** or **"Add to Home Screen"**
5. App icon appears on home screen
6. Launch like a native app!

### On Mobile (iOS/Safari):
1. Visit the app URL
2. Tap **Share button** (square with arrow)
3. Scroll down, tap **"Add to Home Screen"**
4. Tap **"Add"**
5. App icon appears on home screen

### On Desktop (Chrome/Edge):
1. Visit the app URL
2. Look for **install icon** in address bar
3. Click to install
4. App opens in standalone window

---

## ✈️ Step 9: Test Offline Functionality

### Airplane Mode Test:

1. **While Online:**
   - Login to the app
   - Verify you're logged in

2. **Enable Airplane Mode:**
   - Turn on Airplane Mode on your device
   - **Keep WiFi OFF** (important!)
   - Notice "Offline" indicator appears (red)

3. **Submit Incident Offline:**
   - Fill out incident form
   - Map still works (tiles cached)
   - Click map to set location
   - Submit the form
   - See "Saved locally" message

4. **Close App Completely:**
   - Swipe away from recent apps
   - Or close browser tab

5. **Reopen App (Still Offline):**
   - Open app again
   - **You're still logged in!** ✅
   - Go to "Pending Sync" tab
   - **Your incident is there!** ✅

6. **Go Online:**
   - Turn off Airplane Mode
   - Wait a few seconds
   - Data syncs automatically
   - Check dashboard - incident appears!

---

## 🎯 Quick Reference

### Location Selection:
- **Map shows automatically** when form opens
- **Blue circle** = Your current location
- **Red pin** = Selected incident location
- **Click map** = Move red pin
- **"Use My Location"** = Center on GPS

### Offline vs Online:
- **Green "Online"** = Connected, can sync
- **Red "Offline"** = No internet, data saved locally
- **Pending count** = Number of unsynced incidents

### Buttons:
- **"Save Incident"** = Submit the form
- **"Sync Now"** = Manually sync pending incidents
- **"Sign Out"** = Logout (top right)

---

## 🐛 Troubleshooting

### Map Not Showing:
- Check internet connection (needed for first load)
- Refresh the page
- Check browser console for errors

### GPS Not Working:
- **On Mobile:** Allow location permission
- **On Desktop:** GPS requires internet (use map click instead)
- Click "Use My Location" button to retry

### Can't Login:
- Check Firebase credentials
- Verify email/password are correct
- Check internet connection

### Data Not Syncing:
- Check "Online" indicator (must be green)
- Go to "Pending Sync" tab
- Click "Sync Now" manually
- Check browser console for errors

### App Not Installing:
- Use HTTPS (required for PWA)
- Check if browser supports PWA
- Try different browser (Chrome recommended)

---

## 📝 Tips & Best Practices

1. **Login First:** Always login while online to cache your session
2. **Check Network Status:** Watch the Online/Offline indicator
3. **Use Map for Location:** Click on map is most reliable
4. **Check Pending Tab:** Verify data is saved before going offline
5. **Test Offline:** Use Airplane Mode to test offline functionality
6. **Install PWA:** Add to home screen for easier access

---

## 🎓 For Hackathon Demo

### Demo Flow:
1. **Show Login** - Login while online
2. **Show Map** - Demonstrate location selection
3. **Go Offline** - Enable Airplane Mode
4. **Submit Incident** - Show it saves locally
5. **Close & Reopen** - Show still logged in, data persists
6. **Go Online** - Show auto-sync
7. **Show Dashboard** - Demonstrate real-time updates

---

## ✅ Checklist

Before using the app:
- [ ] Firebase configured
- [ ] User account created
- [ ] Location permission allowed
- [ ] App loaded successfully
- [ ] Map showing correctly

Ready to use! 🚀

