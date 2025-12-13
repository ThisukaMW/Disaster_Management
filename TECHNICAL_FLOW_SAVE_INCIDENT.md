# Technical Flow: Save Incident Button Click

## Overview
This document explains the complete technical flow that occurs when a user clicks the "Save Incident" button in the ResQ disaster management app. The system implements an **offline-first architecture** with automatic synchronization.

---

## Step-by-Step Technical Flow

### 1. **User Interaction - Button Click**
**File:** `PWA/src/components/IncidentForm.jsx` (Line 293-299)

```javascript
<button type="submit" className="submit-button" disabled={submitting || !location}>
  {submitting ? 'Saving...' : 'Save Incident'}
</button>
```

- User clicks the submit button
- Form validation occurs via `onSubmit={handleSubmit}` (Line 131)
- `e.preventDefault()` prevents default form submission

---

### 2. **Form Validation**
**File:** `PWA/src/components/IncidentForm.jsx` (Lines 131-142)

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!location) {
    setLocationError('Please capture location before submitting');
    return;
  }

  if (!formData.incidentType) {
    alert('Please select an incident type');
    return;
  }
```

**Technical Checks:**
- Validates that GPS location is captured (`location` object exists)
- Validates that incident type is selected
- If validation fails, returns early with error message

---

### 3. **Data Preparation**
**File:** `PWA/src/components/IncidentForm.jsx` (Lines 144-161)

```javascript
setSubmitting(true);
setSuccess(false);

const userId = getUserId();  // From authService
const timestamp = new Date().toISOString();

const incidentData = {
  incidentType: formData.incidentType,
  severity: parseInt(formData.severity),
  latitude: location.latitude,
  longitude: location.longitude,
  timestamp: timestamp,
  photo: formData.photo || null,  // Base64 encoded image
  userId: userId,
  synced: isOnline() ? 0 : 0,  // Always 0 initially (will sync later)
  createdAt: Date.now()  // Local timestamp
};
```

**Technical Details:**
- **`getUserId()`**: Retrieves authenticated user ID from `authService` (cached in localStorage)
- **`isOnline()`**: Checks `navigator.onLine` status via `networkService`
- **`synced: 0`**: Always set to `0` (unsynced) initially, regardless of online status
- **Photo**: Already compressed to base64 string (max 800x800px, JPEG quality 70%)
- **`createdAt`**: Unix timestamp in milliseconds for local sorting

---

### 4. **Local Database Storage (IndexedDB)**
**File:** `PWA/src/components/IncidentForm.jsx` (Line 164)
**Database:** `PWA/src/db/database.js`

```javascript
await db.incidents.add(incidentData);
```

**Technical Implementation:**

**Database Schema (Dexie.js):**
```javascript
db.version(1).stores({
  incidents: '++id, incidentType, severity, latitude, longitude, timestamp, photo, synced, userId, createdAt'
});
```

**What Happens:**
1. **Dexie.js** (IndexedDB wrapper) opens the `DisasterManagementDB` database
2. Accesses the `incidents` object store
3. Generates an auto-increment `id` (++id)
4. Stores the incident data in **IndexedDB** (browser's local database)
5. Data is **persistent** - survives browser restarts, app kills, and offline mode
6. Returns a Promise that resolves when write is complete

**Storage Location:**
- Browser's IndexedDB (typically in `~/Library/Application Support/Google/Chrome/Default/IndexedDB/` on Mac)
- **Offline-capable**: Works even in Airplane Mode

---

### 5. **Network Status Check & Sync Attempt**
**File:** `PWA/src/components/IncidentForm.jsx` (Lines 166-169)

```javascript
if (isOnline()) {
  await syncService.syncPendingIncidents();
}
```

**Technical Flow:**

#### 5.1 Network Detection
**File:** `PWA/src/services/networkService.js` (Line 2-4)

```javascript
export const isOnline = () => {
  return navigator.onLine;
};
```

- Checks `navigator.onLine` property (browser API)
- Returns `true` if device has network connectivity
- Returns `false` if offline (Airplane Mode, no WiFi, etc.)

#### 5.2 Sync Service Trigger
**File:** `PWA/src/services/syncService.js` (Lines 58-138)

**If Online:**
```javascript
async syncPendingIncidents() {
  // Check if online
  if (!isOnline()) {
    return;
  }

  // Prevent concurrent syncs
  if (this.syncInProgress) {
    return;
  }

  this.syncInProgress = true;
  
  // Get ALL unsynced records (synced = 0)
  const pendingIncidents = await db.incidents
    .where('synced')
    .equals(0)
    .toArray();

  // Process each incident
  for (const incident of pendingIncidents) {
    // Remove local-only fields
    const { id, synced, createdAt, ...incidentData } = incident;
    
    // Check photo size (Firestore 1MB limit)
    if (incidentData.photo && incidentData.photo.length > 900 * 1024) {
      incidentData.photo = null;  // Remove if too large
    }
    
    // POST to Firestore
    await saveIncidentToFirestore(incidentData);
    
    // Mark as synced
    await db.incidents.update(incident.id, { synced: 1 });
  }
}
```

**Technical Details:**
- **Query**: Uses Dexie's `.where('synced').equals(0)` to find unsynced records
- **Batch Processing**: Syncs ALL pending incidents, not just the current one
- **Photo Size Check**: Removes photo if base64 size > 900KB (Firestore limit)
- **Atomic Updates**: Each incident is synced individually (if one fails, others continue)

---

### 6. **Firebase Firestore Upload (If Online)**
**File:** `PWA/src/services/firebase.js` (Lines 30-42)

```javascript
export const saveIncidentToFirestore = async (incidentData) => {
  const docRef = await addDoc(collection(db, 'incidents'), {
    ...incidentData,
    createdAt: serverTimestamp(),  // Firebase server timestamp
    syncedAt: serverTimestamp()
  });
  return docRef.id;
};
```

**Technical Implementation:**

1. **Firebase SDK Call:**
   - Uses `addDoc()` from `firebase/firestore`
   - Targets the `incidents` collection in Firestore
   - Spreads `incidentData` (removes local `id`, `synced`, `createdAt`)

2. **Server Timestamps:**
   - `serverTimestamp()` replaces local timestamp with Firebase server time
   - Ensures consistent time across all clients
   - `syncedAt` tracks when sync occurred

3. **Network Request:**
   - HTTP POST request to Firebase REST API
   - URL: `https://firestore.googleapis.com/v1/projects/disaster-management-app-3b9ce/databases/(default)/documents/incidents`
   - Includes Firebase Auth token in headers
   - Returns document ID if successful

4. **Error Handling:**
   - If network fails, error is caught in `syncService`
   - Incident remains `synced: 0` in IndexedDB
   - Will retry on next sync attempt

---

### 7. **Local Database Update (Mark as Synced)**
**File:** `PWA/src/services/syncService.js` (Line 112)

```javascript
await db.incidents.update(incident.id, { synced: 1 });
```

**Technical Details:**
- Uses Dexie's `.update()` method
- Updates only the `synced` field from `0` to `1`
- Other fields remain unchanged
- Atomic operation (either succeeds or fails completely)

---

### 8. **UI State Updates**
**File:** `PWA/src/components/IncidentForm.jsx` (Lines 171-188)

```javascript
// Reset form
setFormData({
  incidentType: '',
  severity: '3',
  photo: null,
  photoPreview: null
});
setLocation(null);
setSuccess(true);
await updatePendingCount();

setTimeout(() => setSuccess(false), 3000);
```

**Technical Actions:**
1. **Form Reset**: Clears all form fields to default values
2. **Success Message**: Shows "DATA SAVED!" message
3. **Pending Count Update**: Queries IndexedDB for unsynced count
4. **Auto-hide**: Success message disappears after 3 seconds
5. **Error Handling**: If any step fails, shows error alert

---

## Complete Data Flow Diagram

```
User Clicks "Save Incident"
         ↓
Form Validation (location, incidentType)
         ↓
Prepare incidentData Object
         ↓
Save to IndexedDB (Local Database)
    ├─ Dexie.js writes to browser IndexedDB
    ├─ Generates auto-increment ID
    └─ Sets synced = 0
         ↓
Check Network Status (navigator.onLine)
         ↓
    ┌────┴────┐
    │         │
Online?    Offline?
    │         │
    YES       NO
    │         │
    ↓         ↓
Sync Service   Show "Saved Locally"
    │         │
    ↓         │
Query IndexedDB │
(synced = 0)   │
    │         │
    ↓         │
For Each Pending: │
    │         │
    ├─ Remove local fields │
    ├─ Check photo size    │
    ├─ POST to Firestore   │
    └─ Update synced = 1   │
         │                 │
         └─────────┐       │
                   │       │
         Show "Saved & Synced" or "Saved Locally"
```

---

## Key Technical Concepts

### 1. **Offline-First Architecture**
- Data is **always** saved locally first (IndexedDB)
- Sync is a **background process** that happens when online
- Zero data loss: Even if sync fails, data remains in IndexedDB

### 2. **IndexedDB (Dexie.js)**
- **Browser-native** database (no server required)
- **Persistent storage** (survives app restarts)
- **Asynchronous API** (non-blocking)
- **Indexed queries** (fast lookups by `synced` field)

### 3. **Firebase Firestore**
- **Cloud database** (NoSQL document store)
- **Real-time sync** (Dashboard receives updates automatically)
- **Server timestamps** (consistent time across devices)
- **1MB document limit** (photo compression required)

### 4. **Foreground Sync Logic**
- Syncs when app becomes visible (iOS compatible)
- Syncs on network reconnect
- Syncs on app start if online
- **No background sync** (meets hackathon requirements)

### 5. **Photo Compression**
- Client-side compression using HTML5 Canvas API
- Resizes to max 800x800px
- JPEG quality 70% (fallback to 50% if still too large)
- Base64 encoding for storage
- Size check before sync (removes if > 900KB)

---

## Error Scenarios

### Scenario 1: Offline Save
- **Flow**: Save to IndexedDB → Skip sync → Show "Saved Locally"
- **Result**: Data safe in IndexedDB, will sync when online

### Scenario 2: Online Save, Sync Fails
- **Flow**: Save to IndexedDB → Attempt sync → Network error
- **Result**: Data remains `synced: 0`, will retry on next sync

### Scenario 3: Photo Too Large
- **Flow**: Save to IndexedDB → Attempt sync → Photo > 1MB
- **Result**: Photo removed, incident synced without photo

### Scenario 4: App Killed During Save
- **Flow**: Save to IndexedDB → App killed
- **Result**: Data persisted in IndexedDB, sync resumes on app restart

---

## Performance Considerations

1. **IndexedDB Write**: ~10-50ms (asynchronous, non-blocking)
2. **Firestore Upload**: ~200-1000ms (depends on network speed)
3. **Photo Compression**: ~100-500ms (depends on image size)
4. **Total Time**: ~300-1500ms for online save, ~50ms for offline save

---

## Security Considerations

1. **Authentication**: Firebase Auth token required for Firestore writes
2. **Local Storage**: IndexedDB is sandboxed per origin (domain)
3. **Photo Privacy**: Base64 encoded, stored locally and in cloud
4. **User ID**: Tracks which user created each incident

---

## Summary

When a user clicks "Save Incident":

1. ✅ **Validates** form data (location, incident type)
2. ✅ **Saves** to IndexedDB (local database) - **ALWAYS**
3. ✅ **Checks** network status
4. ✅ **Syncs** to Firestore if online (background process)
5. ✅ **Updates** UI with success message
6. ✅ **Resets** form for next incident

**Key Point**: The system is **offline-first**. Data is saved locally **immediately**, and sync happens **asynchronously** when possible. This ensures **zero data loss** even in complete offline scenarios.


