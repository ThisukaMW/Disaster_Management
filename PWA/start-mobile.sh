#!/bin/bash

# Get the local IP address
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | grep "192.168\|10\." | awk '{print $2}' | head -1)

if [ -z "$IP" ]; then
    echo "❌ Could not find local IP address"
    echo "Please connect to WiFi and try again"
    exit 1
fi

echo "🚀 Starting PWA server for mobile access..."
echo ""
echo "📱 Access from your phone:"
echo "   http://$IP:8000"
echo ""
echo "⚠️  Note: For PWA install prompt, you may need HTTPS"
echo "   Use ngrok or deploy to Firebase for full PWA features"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Build if dist doesn't exist
if [ ! -d "dist" ]; then
    echo "📦 Building app..."
    npm run build
    echo ""
fi

# Start server using serve (handles SPA routing)
# Note: serve listens on all interfaces by default when using -l
npx serve -s dist -l 8000

