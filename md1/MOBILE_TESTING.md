# Mobile Testing Guide

## Why Test on Mobile?

**Macs/Desktop computers don't have GPS hardware.** They use:
- WiFi network location (requires internet)
- IP geolocation (requires internet)
- Bluetooth beacons (limited accuracy)

**Mobile devices (phones/tablets) have actual GPS chips** that work completely offline!

## Quick Setup for Mobile Testing

### Option 1: Local Network Access (Easiest)

1. **Find your Mac's IP address:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Look for something like `192.168.1.xxx`

2. **Start the dev server:**
   ```bash
   cd PWA
   npm run dev
   ```
   Note the port (usually `5173`)

3. **On your phone:**
   - Connect phone to same WiFi network as Mac
   - Open browser on phone
   - Go to: `http://YOUR_MAC_IP:5173`
   - Example: `http://192.168.1.100:5173`

4. **Enable location permissions:**
   - Browser will ask for location permission
   - Click "Allow" or "Allow Always"

### Option 2: ngrok (Internet Access Required)

1. **Install ngrok:**
   ```bash
   brew install ngrok
   # or download from https://ngrok.com/
   ```

2. **Start dev server:**
   ```bash
   cd PWA
   npm run dev
   ```

3. **Create tunnel:**
   ```bash
   ngrok http 5173
   ```

4. **Use the ngrok URL on your phone:**
   - Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
   - Open on your phone's browser
   - **Important:** Use HTTPS for GPS to work!

### Option 3: Build and Deploy

1. **Build the app:**
   ```bash
   cd PWA
   npm run build
   ```

2. **Deploy to a hosting service:**
   - Firebase Hosting
   - Netlify
   - Vercel
   - GitHub Pages

3. **Access from your phone via the deployed URL**

## Testing Offline GPS on Mobile

### Step-by-Step Test:

1. **While Online:**
   - Open app on phone
   - Login with test credentials
   - Verify you're logged in

2. **Enable Airplane Mode:**
   - Turn on Airplane Mode on your phone
   - **Keep WiFi OFF** (important!)
   - GPS will still work (it's separate from internet)

3. **Test GPS Capture:**
   - Open the incident form
   - Click "Capture Location"
   - GPS should work even though you're offline!
   - You should see coordinates appear

4. **Submit Incident:**
   - Fill out the form
   - Submit the incident
   - Should save locally

5. **Restart App:**
   - Close the browser/app completely
   - Reopen (still in Airplane Mode)
   - Should still be logged in
   - Data should still be there

6. **Test Sync:**
   - Turn off Airplane Mode
   - Wait a few seconds
   - Data should auto-sync
   - Check dashboard to verify

## Manual Coordinate Entry (Desktop Testing)

If you need to test on Mac/Desktop without GPS:

1. The form will show a manual entry option if GPS fails
2. Enter coordinates manually:
   - **Ratnapura, Sri Lanka:** `6.6828, 80.4012`
   - Or any valid coordinates

3. Click "Use These Coordinates"
4. Form will work normally

## Troubleshooting

### GPS Not Working on Mobile:

1. **Check Permissions:**
   - Settings > Privacy > Location Services
   - Ensure browser has location permission

2. **Use HTTPS:**
   - GPS requires secure context (HTTPS)
   - Use ngrok HTTPS URL or deployed version
   - Localhost works, but local IP might not

3. **Check Browser:**
   - Chrome/Edge: Best support
   - Safari iOS: Works but may need settings
   - Firefox: Should work

4. **Enable High Accuracy:**
   - Phone Settings > Location > Mode
   - Set to "High Accuracy" (GPS + WiFi + Mobile)

### Location Still Not Working:

- Try the manual coordinate entry feature
- Use Ratnapura coordinates: `6.6828, 80.4012`
- This allows you to test the rest of the app flow

## Recommended Test Coordinates

For testing the map and functionality:

- **Ratnapura, Sri Lanka (Disaster Location):**
  - Lat: `6.6828`
  - Lng: `80.4012`

- **Colombo, Sri Lanka:**
  - Lat: `6.9271`
  - Lng: `79.8612`

- **Kandy, Sri Lanka:**
  - Lat: `7.2906`
  - Lng: `80.6337`

## Quick Test Checklist

- [ ] App loads on mobile browser
- [ ] Can login successfully
- [ ] GPS capture works (shows coordinates)
- [ ] Can submit incident offline
- [ ] Data persists after app restart (offline)
- [ ] Still logged in after restart (offline)
- [ ] Auto-syncs when going online
- [ ] Dashboard shows incidents on map

## Pro Tip

For the hackathon demo:
1. **Prepare beforehand:** Test on your phone before the demo
2. **Have backup:** Use manual coordinates if GPS fails during demo
3. **Show both:** Demonstrate GPS on phone, then show dashboard on laptop
4. **Explain:** "GPS works offline on mobile devices, which is why we're testing on a phone"

