# Map Troubleshooting Guide

## Common Issues and Solutions

### Issue: Map Not Showing / Blank Map

**Possible Causes:**
1. Leaflet CSS not loaded
2. Map container not properly sized
3. JavaScript errors preventing render
4. Network issues loading map tiles

**Solutions:**

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for errors related to Leaflet or React-Leaflet
   - Check Network tab for failed tile requests

2. **Verify Leaflet CSS is Imported:**
   - Check `MapLocationPicker.jsx` has: `import 'leaflet/dist/leaflet.css';`
   - Ensure it's imported before component renders

3. **Check Map Container Size:**
   - Map container must have explicit height
   - CSS: `.map-container-wrapper { height: 400px; }`
   - Inline style: `style={{ height: '400px' }}`

4. **Verify Dependencies:**
   ```bash
   npm list leaflet react-leaflet
   ```
   Should show:
   - `leaflet@^1.9.4`
   - `react-leaflet@^4.2.1`

5. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear cache and reload

### Issue: Map Shows But No Tiles

**Solutions:**
1. **Check Internet Connection:**
   - Map tiles require internet (first load)
   - Tiles are cached for offline use after first load

2. **Check CORS Issues:**
   - OpenStreetMap tiles should work without CORS issues
   - If using different tile provider, check CORS settings

3. **Verify Tile URL:**
   - URL in code: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
   - Should be accessible from browser

### Issue: Markers Not Showing

**Solutions:**
1. **Check Marker Icons:**
   - Default Leaflet icons need CDN URLs
   - Icons are configured in `MapLocationPicker.jsx`

2. **Verify Coordinates:**
   - Check console for coordinate values
   - Ensure latitude/longitude are valid numbers

3. **Check Marker Rendering:**
   - Markers only render when `mapReady` is true
   - Check if map has finished loading

### Issue: Map Not Centering on Location

**Solutions:**
1. **Check GPS Permission:**
   - Browser must allow location access
   - Check browser settings

2. **Verify Location Service:**
   - `getCurrentLocation()` should return valid coordinates
   - Check console for location errors

3. **Check CenterMapOnLocation Component:**
   - Component uses `useMap()` hook
   - Must be inside MapContainer

### Issue: Click Events Not Working

**Solutions:**
1. **Check MapClickHandler:**
   - Component must be inside MapContainer
   - Uses `useMapEvents` hook

2. **Verify Event Propagation:**
   - Ensure no overlays blocking clicks
   - Check z-index of elements

## Quick Fixes

### Fix 1: Rebuild the App
```bash
cd PWA
npm run build
```

### Fix 2: Clear Node Modules
```bash
cd PWA
rm -rf node_modules package-lock.json
npm install
```

### Fix 3: Check React Version Compatibility
- React 18.2.0 ✅
- React-Leaflet 4.2.1 ✅
- Leaflet 1.9.4 ✅

### Fix 4: Verify Imports
Ensure these are imported:
```javascript
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
```

## Testing Checklist

- [ ] Map container has explicit height (400px)
- [ ] Leaflet CSS is imported
- [ ] No JavaScript errors in console
- [ ] Map tiles are loading (check Network tab)
- [ ] GPS location is being captured
- [ ] Markers are rendering
- [ ] Click events are working
- [ ] Map centers on user location

## Debug Mode

Add this to see what's happening:
```javascript
console.log('Map Center:', mapCenter);
console.log('Current Location:', currentLocation);
console.log('Selected Location:', selectedLocation);
console.log('Map Ready:', mapReady);
```

## Still Not Working?

1. **Check Browser Compatibility:**
   - Chrome/Edge: Best support
   - Firefox: Should work
   - Safari: May need additional configuration

2. **Try Different Map Provider:**
   - If OpenStreetMap doesn't work, try:
   - Mapbox (requires API key)
   - Google Maps (requires API key)

3. **Check Service Worker:**
   - Service worker might be caching old version
   - Clear service worker cache
   - Unregister service worker in DevTools

4. **Verify Build:**
   - Ensure app is built correctly
   - Check dist folder has all files
   - Verify assets are loading

