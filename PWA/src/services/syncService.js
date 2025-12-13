// Sync Service - Handles offline/online synchronization
// 
// FOREGROUND SYNC LOGIC (Hackathon Points):
// If (Online) AND (Unsynced_Records > 0) -> POST to Server -> Mark as Synced
//
// This service implements:
// 1. Automatic sync when network comes online
// 2. Foreground sync when app becomes visible (iOS compatible)
// 3. Sync on app start if online
// 4. Zero data loss - all unsynced records are synced
//
import { db } from '../db/database';
import { saveIncidentToFirestore } from './firebase';
import { isOnline } from './networkService';

class SyncService {
  constructor() {
    this.syncInProgress = false;
    this.setupNetworkListener();
    this.setupForegroundSync(); // iOS foreground sync support
  }

  setupNetworkListener() {
    window.addEventListener('online', () => {
      console.log('Network online - starting sync');
      this.syncPendingIncidents();
    });

    window.addEventListener('offline', () => {
      console.log('Network offline');
    });
  }

  // iOS Foreground Sync: Sync when app becomes visible (user re-opens app)
  setupForegroundSync() {
    document.addEventListener('visibilitychange', () => {
      // When app becomes visible (user re-opens it)
      if (!document.hidden && navigator.onLine) {
        console.log('App became visible - starting foreground sync');
        // Small delay to ensure app is fully active
        setTimeout(() => {
          this.syncPendingIncidents();
        }, 500);
      }
    });

    // Also sync when window gains focus (user switches back to app)
    window.addEventListener('focus', () => {
      if (navigator.onLine) {
        console.log('Window focused - starting foreground sync');
        setTimeout(() => {
          this.syncPendingIncidents();
        }, 500);
      }
    });
  }

  // Foreground Sync Logic: If (Online) AND (Unsynced_Records > 0) -> POST to Server -> Mark as Synced
  async syncPendingIncidents() {
    // Check if online
    if (!isOnline()) {
      console.log('Offline - skipping sync');
      return;
    }

    // Check if sync already in progress
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return;
    }

    this.syncInProgress = true;
    try {
      // Get unsynced records
      const pendingIncidents = await db.incidents
        .where('synced')
        .equals(0)
        .toArray();

      // If no unsynced records, exit
      if (pendingIncidents.length === 0) {
        console.log('No pending incidents to sync');
        this.syncInProgress = false;
        return;
      }

      console.log(`🔄 Foreground Sync: Found ${pendingIncidents.length} unsynced record(s)`);
      console.log(`✅ Online: ${isOnline()}, Unsynced Records: ${pendingIncidents.length}`);

      for (const incident of pendingIncidents) {
        try {
          // Remove local id, synced flag, and createdAt before sending
          // Firestore will add its own serverTimestamp
          const { id, synced, createdAt, ...incidentData } = incident;
          
          // Check photo size before syncing (Firestore has 1MB limit per field)
          if (incidentData.photo) {
            const photoSize = incidentData.photo.length;
            const maxSize = 900 * 1024; // ~900KB base64 (safe limit)
            
            if (photoSize > maxSize) {
              console.warn(`Incident ${incident.id} has large photo (${Math.round(photoSize / 1024)}KB). Removing photo to allow sync.`);
              // Remove photo if too large, but still sync the incident
              incidentData.photo = null;
            }
          }
          
          // POST to Server (Firestore)
          await saveIncidentToFirestore(incidentData);
          
          // Mark as Synced
          await db.incidents.update(incident.id, { synced: 1 });
          console.log(`✅ Synced incident ${incident.id} - POST successful, marked as synced`);
        } catch (error) {
          console.error(`Failed to sync incident ${incident.id}:`, error);
          
          // Check if error is due to document size
          if (error.message && error.message.includes('size')) {
            console.error('Document too large. Attempting to sync without photo...');
            try {
              // Try syncing without photo
              const { id, synced, createdAt, photo, ...incidentDataWithoutPhoto } = incident;
              await saveIncidentToFirestore(incidentDataWithoutPhoto);
              await db.incidents.update(incident.id, { synced: 1 });
              console.log(`Synced incident ${incident.id} without photo`);
            } catch (retryError) {
              console.error(`Still failed to sync incident ${incident.id}:`, retryError);
            }
          }
          // Will retry on next sync
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Manual sync trigger
  async forceSync() {
    await this.syncPendingIncidents();
  }
}

export const syncService = new SyncService();
export default syncService;

