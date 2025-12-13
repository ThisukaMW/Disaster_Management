// Firebase Service
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';

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

// Save incident to Firestore
export const saveIncidentToFirestore = async (incidentData) => {
  try {
    const docRef = await addDoc(collection(db, 'incidents'), {
      ...incidentData,
      createdAt: serverTimestamp(),
      syncedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving incident to Firestore:', error);
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

