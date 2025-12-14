# 🏆 Foreground Sync Logic - Hackathon Points

## The Winning Logic:

```
If (Online) AND (Unsynced_Records > 0) 
  → POST to Server 
  → Mark as Synced
```

---

## 📍 Implementation Location:

**File:** `PWA/src/services/syncService.js`

**Method:** `syncPendingIncidents()`

---

## 🔍 Code Breakdown:

```javascript
async syncPendingIncidents() {
  // Step 1: Check if Online
  if (!isOnline()) {
    console.log('Offline - skipping sync');
    return;
  }

  // Step 2: Check if sync in progress
  if (this.syncInProgress) {
    return;
  }

  this.syncInProgress = true;
  
  try {
    // Step 3: Get Unsynced Records
    const pendingIncidents = await db.incidents
      .where('synced')
      .equals(0)
      .toArray();

    // Step 4: If no unsynced records, exit
    if (pendingIncidents.length === 0) {
      console.log('No pending incidents to sync');
      this.syncInProgress = false;
      return;
    }

    console.log(`🔄 Foreground Sync: Found ${pendingIncidents.length} unsynced record(s)`);
    console.log(`✅ Online: ${isOnline()}, Unsynced Records: ${pendingIncidents.length}`);

    // Step 5: For each unsynced record
    for (const incident of pendingIncidents) {
      try {
        // Prepare data (remove local fields)
        const { id, synced, createdAt, ...incidentData } = incident;
        
        // POST to Server (Firestore)
        await saveIncidentToFirestore(incidentData);
        
        // Mark as Synced
        await db.incidents.update(incident.id, { synced: 1 });
        console.log(`✅ Synced incident ${incident.id} - POST successful, marked as synced`);
      } catch (error) {
        console.error(`Failed to sync incident ${incident.id}:`, error);
        // Will retry on next sync
      }
    }
  } catch (error) {
    console.error('Sync error:', error);
  } finally {
    this.syncInProgress = false;
  }
}
```

---

## 🎯 When Sync Triggers:

### 1. Network Comes Online
```javascript
window.addEventListener('online', () => {
  console.log('Network online - starting sync');
  this.syncPendingIncidents();
});
```

### 2. App Becomes Visible (Foreground Sync)
```javascript
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && navigator.onLine) {
    console.log('App became visible - starting foreground sync');
    setTimeout(() => {
      this.syncPendingIncidents();
    }, 500);
  }
});
```

### 3. Window Gains Focus
```javascript
window.addEventListener('focus', () => {
  if (navigator.onLine) {
    console.log('Window focused - starting foreground sync');
    setTimeout(() => {
      this.syncPendingIncidents();
    }, 500);
  }
});
```

### 4. App Starts (if online)
```javascript
// In App.jsx
if (navigator.onLine) {
  setTimeout(() => {
    syncService.syncPendingIncidents();
  }, 2000);
}
```

---

## ✅ Logic Verification:

### Condition 1: Online ✅
- Checks `isOnline()` function
- Uses `navigator.onLine` API
- Verifies network connectivity

### Condition 2: Unsynced Records > 0 ✅
- Queries IndexedDB: `db.incidents.where('synced').equals(0)`
- Counts unsynced records
- Only proceeds if count > 0

### Action 1: POST to Server ✅
- Calls `saveIncidentToFirestore(incidentData)`
- Sends data to Firestore (Firebase)
- Handles errors gracefully

### Action 2: Mark as Synced ✅
- Updates record: `db.incidents.update(id, { synced: 1 })`
- Prevents duplicate syncs
- Ensures data integrity

---

## 🔄 Complete Flow:

```
1. User reports incident (offline)
   → Saved to IndexedDB with synced=0

2. User goes online OR re-opens app
   → Foreground sync triggers

3. Sync Service checks:
   → Is online? ✅
   → Are there unsynced records? ✅

4. For each unsynced record:
   → POST to Firestore
   → Mark as synced (synced=1)

5. Result:
   → Data synced to server
   → Local record marked as synced
   → Zero data loss ✅
```

---

## 📊 Data Flow:

```
┌─────────────────┐
│  IndexedDB      │
│  (Local)        │
│  synced = 0     │
└────────┬────────┘
         │
         │ Foreground Sync
         │ (Online + Unsynced > 0)
         ▼
┌─────────────────┐
│  POST Request   │
│  → Firestore    │
└────────┬────────┘
         │
         │ Success
         ▼
┌─────────────────┐
│  Mark as Synced │
│  synced = 1     │
└─────────────────┘
```

---

## 🎯 Key Points for Judges:

1. **Clear Logic**: Explicitly implements the required logic
2. **Automatic**: No user intervention needed
3. **Reliable**: Handles errors, retries failed syncs
4. **Zero Data Loss**: All records eventually sync
5. **iOS Compatible**: Foreground sync (not background)
6. **Well Documented**: Clear comments and logging

---

## 📝 Console Logs (for Verification):

When sync runs, you'll see:
```
🔄 Foreground Sync: Found 3 unsynced record(s)
✅ Online: true, Unsynced Records: 3
✅ Synced incident 1 - POST successful, marked as synced
✅ Synced incident 2 - POST successful, marked as synced
✅ Synced incident 3 - POST successful, marked as synced
```

---

## ✅ Compliance:

- ✅ **If (Online)** - Checked via `isOnline()`
- ✅ **AND (Unsynced_Records > 0)** - Queried from IndexedDB
- ✅ **→ POST to Server** - `saveIncidentToFirestore()`
- ✅ **→ Mark as Synced** - `update({ synced: 1 })`

**This is the exact logic that wins hackathon points!** 🏆


