# Fixing Location Permission Issues

The incident form needs the browser's location permission to auto-capture GPS coordinates. If location capture fails or the browser never prompts, here's how to fix it.

## Enable location in the browser

**Chrome / Edge**
1. Click the lock/info icon left of the URL in the address bar.
2. Find "Location" in the permissions list and change it to "Allow".
3. Refresh the page.

**Safari (macOS)**
1. Safari → Settings → Websites → Location, find the site, set to "Allow".
2. Also check System Settings → Privacy & Security → Location Services — make sure it's on and Safari is checked.

**Firefox**
1. Click the lock icon in the address bar → "More Information" → Permissions tab.
2. Find "Access your location" and set it to "Allow".
3. Refresh the page.

**Quick version for any browser**: click the location icon in the address bar → "Always allow" → refresh → try capturing location again.

## System-level location settings

On the OS itself (not just the browser):
1. Open system Privacy/Security settings → Location Services.
2. Make sure Location Services is turned on overall.
3. Make sure the specific browser you're using is checked/allowed in that list.

## If it still doesn't work: use manual coordinates

The form supports typing coordinates directly when GPS isn't available — this is the expected fallback, not a workaround to be embarrassed about. Any valid lat/lng works; for consistency during testing, the team used Ratnapura, Sri Lanka:

- Latitude: `6.6828`
- Longitude: `80.4012`

Enter these (or your own test coordinates), confirm, and continue testing the rest of the app.

## Why this matters more on a laptop than a phone

Laptops and desktops have no GPS hardware — "location" on them is inferred from Wi-Fi/IP data, which needs an internet connection to resolve and is far less accurate. **True offline location capture only works on a phone or tablet**, which has an actual GPS radio that doesn't depend on connectivity at all. If you're specifically testing the offline GPS capture path (as opposed to just clicking through the UI), do it on a real device — see `docs/TESTING.md`.

## Quick checklist

- [ ] Browser location permission set to Allow for this site
- [ ] OS-level Location Services turned on, with the browser permitted
- [ ] Page refreshed after changing any permission
- [ ] If still failing, manual coordinate entry used as a fallback
- [ ] For true offline GPS testing, using a phone/tablet rather than a laptop
