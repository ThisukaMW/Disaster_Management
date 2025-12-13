# PWA Features - Installation & Offline Map

## ✅ PWA Installation

The app is now fully configured as a Progressive Web App (PWA) with:

### Installation Features:
- ✅ **Install Prompt**: Automatic prompt appears when user visits on mobile/desktop
- ✅ **Add to Home Screen**: Users can install the app like a native app
- ✅ **Standalone Mode**: App runs in standalone window (no browser UI)
- ✅ **Offline Support**: Service worker caches app files for offline use
- ✅ **Map Tile Caching**: OpenStreetMap tiles are cached for offline map viewing

### How to Install:

#### On Mobile (iOS/Android):
1. Visit the app URL: `http://192.168.99.64:8000`
2. Look for the **"Install"** prompt at the bottom
3. Click **"Install"** or use browser menu:
   - **Chrome/Edge**: Menu (⋮) → "Install app" or "Add to Home screen"
   - **Safari iOS**: Share button → "Add to Home Screen"
4. App icon appears on home screen
5. Launch like a native app!

#### On Desktop:
1. Visit the app URL
2. Look for install icon in address bar (Chrome/Edge)
3. Click to install
4. App opens in standalone window

### Installation Prompt:
- Automatically appears on first visit
- Can be dismissed (won't show again for 7 days)
- Only shows if app is not already installed

---

## 🗺️ Offline Map Location Picker

### New Feature: Map-Based Location Selection

Users can now select location by clicking on a map, even when offline!

### How It Works:

1. **Three Location Options:**
   - 📍 **Use GPS**: Automatic GPS capture (works offline on mobile)
   - 🗺️ **Select on Map**: Click on map to choose location
   - ⌨️ **Enter Manually**: Type coordinates directly

2. **Map Features:**
   - Interactive Leaflet.js map with OpenStreetMap tiles
   - Click anywhere on map to set location
   - "Use GPS" button to center map on current location
   - Works offline (tiles are cached by service worker)
   - Shows selected coordinates below map

3. **Offline Map Support:**
   - Map tiles are cached when online
   - Previously viewed areas work offline
   - Map interface works even without internet
   - GPS coordinates can be selected offline

### Usage Flow:

1. **When form loads:**
   - User sees three options: GPS, Map, or Manual

2. **Select "🗺️ Select on Map":**
   - Map appears with Ratnapura, Sri Lanka centered
   - User clicks anywhere on map
   - Marker appears at clicked location
   - Coordinates update automatically

3. **Change Location:**
   - If location is already set, click "📍 Change on Map"
   - Map opens with current location
   - Click new location to update

4. **Use GPS on Map:**
   - Click "📍 Use GPS" button on map
   - Map centers on GPS location
   - Marker updates automatically

---

## 🚀 Testing PWA Installation

### Test Installation:

1. **Build the app:**
   ```bash
   cd PWA
   npm run build
   ```

2. **Serve the build:**
   ```bash
   cd dist
   python3 -m http.server 8000 --bind 0.0.0.0
   ```

3. **Access on phone:**
   - Go to: `http://YOUR_MAC_IP:8000`
   - Install prompt should appear
   - Install the app
   - Launch from home screen

### Test Offline Map:

1. **While Online:**
   - Open app
   - Navigate to different map areas
   - Tiles are cached automatically

2. **Go Offline:**
   - Enable Airplane Mode
   - Open incident form
   - Click "🗺️ Select on Map"
   - Map should still work (cached tiles)
   - Click to select location
   - Submit incident

---

## 📱 PWA Manifest Features

The app manifest includes:
- ✅ App name and description
- ✅ Icons (192x192 and 512x512)
- ✅ Theme colors
- ✅ Standalone display mode
- ✅ Start URL and scope
- ✅ Shortcuts (quick actions)

---

## 🔧 Technical Details

### Service Worker:
- Caches all app files (HTML, CSS, JS)
- Caches OpenStreetMap tiles (7 days)
- Auto-updates when new version available
- Works offline

### Map Caching Strategy:
- **CacheFirst**: Uses cached tiles when available
- **NetworkFallback**: Falls back to network if cache miss
- **Max Age**: 7 days for cached tiles
- **Max Entries**: 100 tiles cached

### Installation Detection:
- Checks if app is already installed
- Only shows prompt if installable
- Remembers dismissal (7 days)

---

## 🎯 Benefits for Hackathon Demo

1. **Professional Installation:**
   - Shows app can be installed like native app
   - Demonstrates PWA capabilities
   - Better user experience

2. **Offline Map Selection:**
   - Users can select location even offline
   - More intuitive than typing coordinates
   - Visual location selection
   - Works with cached map tiles

3. **Multiple Location Methods:**
   - GPS (automatic, works offline on mobile)
   - Map (visual, works with cached tiles)
   - Manual (fallback option)

---

## 📝 Notes

- **Map Tiles**: Require initial internet connection to cache
- **GPS**: Works completely offline on mobile devices
- **Installation**: Requires HTTPS for production (HTTP works for local testing)
- **Icons**: Currently using default Vite icon - can be replaced with custom icons

---

## 🎨 Customization

To add custom app icons:
1. Create 192x192 and 512x512 PNG icons
2. Place in `PWA/public/` folder
3. Update `manifest.json` and `vite.config.js` with icon paths
4. Rebuild the app

