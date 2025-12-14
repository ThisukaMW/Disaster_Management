// Dexie.js Database for Offline Storage
import Dexie from 'dexie';

export const db = new Dexie('DisasterManagementDB');

// Define schema
db.version(1).stores({
  incidents: '++id, incidentType, severity, latitude, longitude, timestamp, photo, synced, userId, createdAt, retryCount, lastRetryAt',
  syncQueue: '++id, incidentId, action, timestamp, retries'
});

export default db;

