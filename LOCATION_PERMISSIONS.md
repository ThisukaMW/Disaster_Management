# Fixing Location Permission Issues

## Enable Location Permissions in Browser

### Chrome/Edge (Mac):
1. Click the **lock icon** or **info icon** in the address bar (left of URL)
2. Find **"Location"** in the permissions list
3. Change from **"Ask"** or **"Block"** to **"Allow"**
4. Refresh the page

### Safari (Mac):
1. Go to **Safari > Settings > Websites > Location Services**
2. Find your localhost/192.168.x.x site
3. Set to **"Allow"**
4. Or go to **System Settings > Privacy & Security > Location Services**
5. Enable Location Services
6. Make sure Safari (or your browser) is checked

### Firefox (Mac):
1. Click the **lock icon** in address bar
2. Click **"More Information"**
3. Go to **"Permissions"** tab
4. Find **"Access your location"**
5. Change to **"Allow"**
6. Refresh page

## Quick Fix Steps:

1. **Look for the location icon** in your browser's address bar
2. **Click it** and select **"Always allow"** or **"Allow"**
3. **Refresh the page**
4. Try capturing location again

## Alternative: Use Manual Coordinates

If location still doesn't work on Mac (because Macs don't have GPS), use the **manual coordinate entry**:

1. When you see the location error, the form will show a **"Enter coordinates manually"** option
2. Enter test coordinates:
   - **Latitude:** `6.6828`
   - **Longitude:** `80.4012`
   - (These are Ratnapura, Sri Lanka coordinates)
3. Click **"Use These Coordinates"**
4. Continue testing the rest of the app

## For True Offline GPS Testing:

**You MUST use a mobile device (phone/tablet)** because:
- ✅ Phones have actual GPS hardware
- ✅ GPS works completely offline (no internet needed)
- ❌ Macs/Desktop don't have GPS - they need internet for location

## System-Level Location Settings (Mac):

1. Go to **System Settings** (or System Preferences)
2. Click **Privacy & Security**
3. Click **Location Services**
4. Make sure **Location Services** is **ON**
5. Scroll down and make sure your browser is checked:
   - ✅ Chrome
   - ✅ Safari  
   - ✅ Firefox
   - (whichever you're using)

## Test After Enabling:

1. Refresh the page
2. Click "Capture Location" again
3. Browser should ask for permission (if not already allowed)
4. Click "Allow" when prompted
5. Location should work (though on Mac it will use network location, not true GPS)

