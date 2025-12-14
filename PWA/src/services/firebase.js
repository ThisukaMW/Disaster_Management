// Firebase Service
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, where, getDocs, limit } from 'firebase/firestore';

// Firebase Configuration - Replace with your actual config
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };
const firebaseConfig = {
    apiKey: "AIzaSyDG2LDu5cqN-OHTIcm_bZwcYYHZILiGj9M",
    authDomain: "disaster-management-app-3b9ce.firebaseapp.com",
    projectId: "disaster-management-app-3b9ce",
    storageBucket: "disaster-management-app-3b9ce.firebasestorage.app",
    messagingSenderId: "1066130120084",
    appId: "1:1066130120084:web:72db0d847c72e20de98381",
    measurementId: "G-BR2F8VCW4Z"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Calculate distance between two coordinates using Haversine formula (in meters)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

// Check for duplicate incidents (same user, same type, within 10 meters)
export const checkDuplicateIncident = async (incidentData) => {
  try {
    const { userId, incidentType, latitude, longitude } = incidentData;
    
    if (!userId || !incidentType || !latitude || !longitude) {
      return null; // Can't check duplicates without required fields
    }
    
    // Query Firestore for incidents with same user and type
    // Note: This requires a Firestore composite index on (userId, incidentType, createdAt)
    // Firebase will auto-create it on first use, or you can create it manually
    const incidentsRef = collection(db, 'incidents');
    
    let querySnapshot;
    try {
      const q = query(
        incidentsRef,
        where('userId', '==', userId),
        where('incidentType', '==', incidentType),
        orderBy('createdAt', 'desc'),
        limit(50) // Check last 50 incidents (reasonable limit)
      );
      querySnapshot = await getDocs(q);
    } catch (indexError) {
      // If index doesn't exist, fall back to simpler query
      console.warn('Composite index not found. Using simpler query for duplicate check.');
      const q = query(
        incidentsRef,
        where('userId', '==', userId),
        where('incidentType', '==', incidentType),
        limit(50)
      );
      querySnapshot = await getDocs(q);
    }
    
    // Check each incident for proximity (within 10 meters)
    for (const doc of querySnapshot.docs) {
      const existingIncident = doc.data();
      if (existingIncident.latitude && existingIncident.longitude) {
        const distance = calculateDistance(
          latitude,
          longitude,
          existingIncident.latitude,
          existingIncident.longitude
        );
        
        if (distance <= 10) { // Within 10 meters
          console.log(`⚠️ Duplicate incident detected: ${doc.id} (${distance.toFixed(2)}m away)`);
          return {
            id: doc.id,
            distance: distance,
            existingIncident: existingIncident
          };
        }
      }
    }
    
    return null; // No duplicate found
  } catch (error) {
    console.error('Error checking for duplicate incident:', error);
    // If error checking duplicates, allow sync to proceed (fail open)
    // This ensures sync doesn't fail due to duplicate check errors
    return null;
  }
};

// Save incident to Firestore
export const saveIncidentToFirestore = async (incidentData) => {
  try {
    // Skip duplicate check for SOS/emergency incidents - they should always go through
    const isSOS = incidentData.incidentType && 
                   (incidentData.incidentType.includes('SOS') || 
                    incidentData.incidentType.includes('Responder Down') ||
                    incidentData.severity === 1);
    
    if (!isSOS) {
      // Check for duplicates before saving (only for non-SOS incidents)
      const duplicate = await checkDuplicateIncident(incidentData);
      if (duplicate) {
        throw new Error(`DUPLICATE: Similar incident already exists (${duplicate.distance.toFixed(2)}m away)`);
      }
    } else {
      console.log('🚨 SOS/Emergency incident - skipping duplicate check (always allow)');
    }
    
    const docRef = await addDoc(collection(db, 'incidents'), {
      ...incidentData,
      createdAt: serverTimestamp(),
      syncedAt: serverTimestamp()
    });
    console.log('✅ Incident saved to Firestore:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving incident to Firestore:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      incidentType: incidentData.incidentType,
      severity: incidentData.severity
    });
    throw error;
  }
};

// Subscribe to incidents for real-time updates
export const subscribeToIncidents = (callback) => {
  const q = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const incidents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(incidents);
  });
};

export default app;

