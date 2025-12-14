⛑️ ResQ: Offline-First Disaster Response System
Project Aegis (ResQ) is a resilient disaster management platform built for the Ratnapura Flood Crisis. It consists of two interconnected applications: an offline-first Mobile PWA for field responders and a real-time Command Dashboard for headquarters.

🔗 Live Demo (Judges Access)
📱 Field Responder App (PWA): https://disaster-management-app-3b9ce.web.app

🖥️ HQ Command Dashboard: https://disaster-management-app-host.web.app/

🏗️ Tech Stack
Core Architecture
Frontend: React 18 + Vite

PWA Engine: vite-plugin-pwa (Service Workers & Manifest)

Language: JavaScript (ES6+)

Backend & Data
Cloud Backend: Firebase (Firestore, Auth, Hosting)

Local Database: Dexie.js (IndexedDB Wrapper) - Ensures 100% offline functionality

Sync Engine: Custom "Foreground Sync" logic (iOS Compliant)

Maps & Visualization
Maps: Leaflet.js + OpenStreetMap (Cached tiles for offline use)

Styles: CSS Modules (Dark Mode optimized)

🚀 Prerequisites
Before you start, ensure you have the following installed globally:

Node.js (v16 or higher)

npm (comes with Node)

Firebase CLI (npm install -g firebase-tools)

📱 Component A: Field Responder PWA (dev-geemal)
The mobile-first application used by responders in the field. Capable of working in "Airplane Mode" and syncing data when connectivity returns.

1. Setup & Installation
Navigate to the PWA directory:

Bash

cd dev-geemal
npm install
2. Key Dependencies
The following critical packages will be installed:

firebase: For Cloud Firestore and Authentication.

dexie: For the local offline database (IndexedDB).

vite-plugin-pwa: To generate the Service Worker.

leaflet & react-leaflet: For map visualization.

react-router-dom: For client-side routing.

3. Environment Configuration
Ensure your src/services/firebase.js contains your Firebase credentials:

JavaScript

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "disaster-management-app-3b9ce.firebaseapp.com",
  projectId: "disaster-management-app-3b9ce",
  // ... other config keys
};
4. Run Locally
Bash

npm run dev
Access at: http://localhost:5173

🖥️ Component B: HQ Command Dashboard (dev-chanith)
The web-based dashboard for headquarters to visualize incidents, track responder status, and manage resources in real-time.

1. Setup & Installation
Navigate to the Web Dashboard directory:

Bash

cd dev-chanith
npm install
2. Key Dependencies
firebase: For real-time data listeners (onSnapshot).

leaflet: For plotting incident clusters on the map.

chart.js (Optional): For statistical analytics.

3. Run Locally
Bash

npm run dev
Access at: http://localhost:5174 (Port may vary)

☁️ Deployment Guide (Firebase Hosting)
Since we host two separate apps (PWA and Web) on different URLs, the deployment process involves targeting specific sites.

1. Login to Firebase
Bash

firebase login
2. Build for Production
You must create the production build artifacts before deploying.

For PWA (dev-geemal):

Bash

cd dev-geemal
npm run build
For Web (dev-chanith):

Bash

cd ../dev-chanith
npm run build
3. Deploy
Deploy the specific builds to their respective hosting targets.

Deploy PWA:

Bash

firebase deploy --only hosting:disaster-management-app-3b9ce
Deploy Web Dashboard:

Bash

firebase deploy --only hosting:disaster-management-app-host
🧪 Testing the "Offline Mode" (Judge's Guide)
To verify the Offline-First capabilities:

Open the PWA Live Link on a mobile device.

Login once while online (this caches your session).

Turn on Airplane Mode (ensure WiFi is off).

Submit a "Landslide" report.

Observation: You will see a "Saved Locally" toast notification.

Kill the app completely (Swipe away from recent apps).

Re-open the app (still offline).

Observation: Go to the "Pending Sync" tab. The report is still safe.

Turn Internet On.

Observation: The app auto-detects the network and syncs. Check the HQ Dashboard to see the pin drop instantly!

👥 Contributors
PWA / Offline Logic: Geemal (dev-geemal)

Web / Dashboard: Chanith (dev-chanith)

🚀 Final Step for You:
Since you have two separate folders (dev-geemal and dev-chanith), ensure that the firebase.json file in your root directory (or inside each folder) is correctly configured to point to the dist folder of each build.

If you are running the deploy command from the root, your firebase.json should look like this:

JSON

{
  "hosting": [
    {
      "target": "disaster-management-app-3b9ce",
      "public": "dev-geemal/dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [{"source": "**", "destination": "/index.html"}]
    },
    {
      "target": "disaster-management-app-host",
      "public": "dev-chanith/dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [{"source": "**", "destination": "/index.html"}]
    }
  ]
