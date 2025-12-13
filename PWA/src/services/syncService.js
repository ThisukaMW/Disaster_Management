// Sync Service - Handles offline/online synchronization
import { db } from '../db/database';
import { saveIncidentToFirestore } from './firebase';
import { isOnline } from './networkService';

class SyncService {
  constructor() {
    this.syncInProgress = false;
    this.setupNetworkListener();
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

  async syncPendingIncidents() {
    if (this.syncInProgress || !isOnline()) {
      return;
    }

    this.syncInProgress = true;
    try {
      const pendingIncidents = await db.incidents
        .where('synced')
        .equals(0)
        .toArray();

      console.log(`Syncing ${pendingIncidents.length} pending incidents`);

      for (const incident of pendingIncidents) {
        try {
          // Remove local id, synced flag, and createdAt before sending
          // Firestore will add its own serverTimestamp
          const { id, synced, createdAt, ...incidentData } = incident;
          await saveIncidentToFirestore(incidentData);
          
          // Mark as synced
          await db.incidents.update(incident.id, { synced: 1 });
          console.log(`Synced incident ${incident.id}`);
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

  // Manual sync trigger
  async forceSync() {
    await this.syncPendingIncidents();
  }
}

export const syncService = new SyncService();
export default syncService;

