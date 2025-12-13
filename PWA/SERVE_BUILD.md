# Serving the Built App on Your Phone

## ✅ Build Complete!

The app has been built in the `dist` folder.

## Option 1: Local Network Server (Easiest - Already Running!)

A server is already running! Here's how to access it:

### On Your Phone:

1. **Make sure your phone is on the same WiFi as your Mac**

2. **Open your phone's browser** and go to:
   ```
   http://192.168.99.64:8000
   ```
   (Replace `192.168.99.64` with your Mac's IP if different)

3. **That's it!** The app should load.

### To Stop the Server:
```bash
# Find the process
lsof -i :8000

# Kill it (replace PID with the number from above)
kill -9 <PID>
```

### To Restart the Server:
```bash
cd PWA
python3 -m http.server 8000 --bind 0.0.0.0
```

---

## Option 2: Using Vite Preview (Alternative)

```bash
cd PWA
npm run preview -- --host 0.0.0.0
```

Then access: `http://YOUR_MAC_IP:4173`

---

## Option 3: Using ngrok (Public URL - Works from Anywhere)

1. **Install ngrok:**
   ```bash
   brew install ngrok
   # or download from https://ngrok.com/
   ```

2. **Start the server:**
   ```bash
   cd PWA/dist
   python3 -m http.server 8000
   ```

3. **In another terminal, create tunnel:**
   ```bash
   ngrok http 8000
   ```

4. **Use the HTTPS URL** shown by ngrok (e.g., `https://abc123.ngrok.io`)
   - This works from anywhere, even different networks!
   - **Important:** Use HTTPS for GPS to work properly

---

## Option 4: Deploy to Hosting (Best for Production)

### Firebase Hosting:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Hosting)
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### Netlify:
1. Go to https://app.netlify.com
2. Drag and drop the `PWA/dist` folder
3. Get instant URL!

### Vercel:
```bash
npm install -g vercel
cd PWA
vercel
```

---

## Current Server Status

**Server is running on:** `http://0.0.0.0:8000`

**Access from phone:** `http://192.168.99.64:8000`

**Note:** Make sure:
- ✅ Phone and Mac are on same WiFi
- ✅ Mac firewall allows connections (System Settings > Network > Firewall)
- ✅ You use HTTP (not HTTPS) for local network access

---

## Testing GPS on Phone

Once you access the app on your phone:

1. **Allow location permission** when prompted
2. **Test offline GPS:**
   - Enable Airplane Mode (keep WiFi off)
   - GPS will still work!
   - Submit an incident
   - Verify it saves locally
   - Turn off Airplane Mode
   - Verify it syncs automatically

---

## Troubleshooting

### Can't Access from Phone:

1. **Check Mac IP:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Check if server is running:**
   ```bash
   lsof -i :8000
   ```

3. **Check firewall:**
   - System Settings > Network > Firewall
   - Make sure it's not blocking connections

4. **Try different port:**
   ```bash
   python3 -m http.server 8080 --bind 0.0.0.0
   ```
   Then use: `http://YOUR_IP:8080`

### GPS Not Working:

- Make sure you're using HTTPS (if using ngrok) or localhost
- Allow location permission in browser
- For true offline GPS, test with Airplane Mode ON (WiFi OFF)


