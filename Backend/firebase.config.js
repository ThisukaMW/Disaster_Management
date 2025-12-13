// Firebase Configuration
// Replace these values with your Firebase project credentials
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
export default app;

