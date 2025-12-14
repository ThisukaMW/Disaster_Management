
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Configuration
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
const db = getFirestore(app);
const auth = getAuth(app);

// Secondary app to create responder users without affecting current session
const secondaryApp = initializeApp(app.options, "secondary-admin-helper");
const secondaryAuth = getAuth(secondaryApp);

export const subscribeToIncidents = (callback) => {
  const incidentsRef = collection(db, "incidents");
  
  // Helper function to convert Firestore timestamp to milliseconds
  const toMillis = (timestamp) => {
    if (!timestamp) return 0;
    if (timestamp.toMillis && typeof timestamp.toMillis === 'function') {
      return timestamp.toMillis();
    }
    if (timestamp.seconds && typeof timestamp.seconds === 'number') {
      return timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000;
    }
    if (typeof timestamp === 'number') {
      return timestamp;
    }
    const parsed = new Date(timestamp);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  };
  
  // Try querying with orderBy first
  const q = query(incidentsRef, orderBy("createdAt", "desc"));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const incidents = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        };
      });
      // Ensure data is sorted by createdAt (newest first)
      incidents.sort((a, b) => {
        return toMillis(b.createdAt) - toMillis(a.createdAt);
      });
      callback(incidents);
    },
    (error) => {
      console.error("Error fetching incidents from Firestore:", error);
      // If index is missing, log a helpful message
      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        console.warn("Firestore index may be missing. Please create a composite index for 'incidents' collection on 'createdAt' field.");
      }
      // Return empty array on error so UI doesn't break
      callback([]);
    }
  );
};

export const subscribeToResponders = (callback) => {
  const q = query(collection(db, "responders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
};

// Check if email already exists in responders collection
export const checkEmailExists = async (email) => {
  try {
    const q = query(collection(db, "responders"), where("email", "==", email.trim().toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const existingResponder = querySnapshot.docs[0];
      return {
        exists: true,
        uid: existingResponder.id,
        data: { id: existingResponder.id, ...existingResponder.data() }
      };
    }
    
    return { exists: false };
  } catch (error) {
    console.error("Error checking email existence:", error);
    // If query fails, return unknown (will try creation anyway)
    return { exists: false, error: error.message };
  }
};

export const createResponderAccount = async ({ email, password, name, phone }) => {
  // Normalize email to lowercase for consistent checking
  const emailLower = email.trim().toLowerCase();
  
  try {
    // Validate password before proceeding
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
    
    console.log("Creating Firebase Auth user with email:", emailLower, "Password length:", password.length);
    
    // Check if email already exists in Firestore responders collection
    const emailCheck = await checkEmailExists(emailLower);
    if (emailCheck.exists) {
      const errorMessage = `⚠️ WARNING: This user has already been added to the system!\n\n` +
        `Email: ${emailLower}\n` +
        `UID: ${emailCheck.uid}\n` +
        `Name: ${emailCheck.data?.name || "N/A"}\n\n` +
        `Please use a different email address or check the existing responder in the list.`;
      throw new Error(errorMessage);
    }
    
    // Create Firebase Auth user with email and password
    // Email and password are stored securely in Firebase Authentication (password is hashed)
    const cred = await createUserWithEmailAndPassword(secondaryAuth, emailLower, password);
    const uid = cred.user.uid;
    
    console.log("✓ Firebase Auth user created successfully!");
    console.log("  - UID:", uid);
    console.log("  - Email:", emailLower);
    console.log("  - Email verified:", cred.user.emailVerified);
    
    // Verify the account works by testing sign-in (then sign out immediately)
    try {
      await signOut(secondaryAuth);
      const testSignIn = await signInWithEmailAndPassword(secondaryAuth, emailLower, password);
      console.log("✓ Password verification successful - account can be authenticated");
      await signOut(secondaryAuth);
    } catch (verifyError) {
      console.error("⚠ Warning: Password verification failed:", verifyError);
      // Don't throw here - account was created, but log the issue
    }
    
    // Store responder data in Firestore "responders" collection
    // Password is stored as plain string in Firestore as requested
    // Store email in lowercase for consistent querying
    await setDoc(doc(db, "responders", uid), {
      email: emailLower,
      password: password, // Store password as string in Firestore
      name: name || "",
      phone: phone || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    console.log("✓ Responder document created in Firestore with UID:", uid);
    
    // Ensure we're signed out from secondary auth
    await signOut(secondaryAuth);
    
    return uid;
  } catch (error) {
    console.error("✗ Error in createResponderAccount:", error);
    console.error("  - Error code:", error.code);
    console.error("  - Error message:", error.message);
    
    // If error already has a custom message (from email check), re-throw it
    if (error.message.includes("WARNING: This user has already been added")) {
      throw error;
    }
    
    // Re-throw with more context for Firebase Auth errors
    if (error.code === 'auth/email-already-in-use') {
      // Try to get UID from Firestore if available (emailLower is in outer scope)
      try {
        const emailCheck = await checkEmailExists(emailLower);
        if (emailCheck.exists) {
          throw new Error(`⚠️ WARNING: This user has already been added to the system!\n\n` +
            `Email: ${emailLower}\n` +
            `UID: ${emailCheck.uid}\n` +
            `Name: ${emailCheck.data?.name || "N/A"}\n\n` +
            `This email is already registered in Firebase Authentication. Please use a different email address.`);
        } else {
          throw new Error("⚠️ WARNING: This email is already registered in Firebase Authentication.\n\nPlease use a different email address or check if the user already exists.");
        }
      } catch (checkError) {
        // If check fails, show generic message
        throw new Error("⚠️ WARNING: This email is already registered in Firebase Authentication.\n\nPlease use a different email address or check if the user already exists.");
      }
    } else if (error.code === 'auth/weak-password') {
      throw new Error("Password is too weak. Please use a stronger password (minimum 6 characters).");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("Invalid email address. Please check the email format.");
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error("Email/password accounts are not enabled. Please enable them in Firebase Console.");
    } else {
      throw new Error(error.message || "Failed to create responder account. Please try again.");
    }
  }
};

export const updateResponder = async (id, data) => {
  const ref = doc(db, "responders", id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
};

// Create SOS emergency incident
export const createSOSIncident = async (location = null, incidentType = "Emergency SOS") => {
  try {
    let latitude, longitude, locationText;
    
    // Get current location if not provided
    if (!location) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        locationText = `${latitude.toFixed(6)}°N, ${longitude.toFixed(6)}°E`;
      } catch (geoError) {
        // Default to center of Sri Lanka if geolocation fails
        latitude = 7.8731;
        longitude = 80.7718;
        locationText = "Sri Lanka (Default) | 7.8731°N, 80.7718°E";
      }
    } else {
      latitude = location.latitude;
      longitude = location.longitude;
      locationText = location.location || `${latitude.toFixed(6)}°N, ${longitude.toFixed(6)}°E`;
    }

    // Create critical SOS incident
    const sosIncident = {
      incidentType: incidentType,
      severity: 1, // Critical
      status: "Emergency SOS Alert",
      latitude: latitude,
      longitude: longitude,
      location: locationText,
      createdAt: serverTimestamp(),
      timestamp: serverTimestamp(),
      userId: auth.currentUser?.uid || "command-center",
    };

    const docRef = await addDoc(collection(db, "incidents"), sosIncident);
    console.log("✓ SOS incident created successfully! ID:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("✗ Error creating SOS incident:", error);
    throw new Error(error.message || "Failed to send SOS alert. Please try again.");
  }
};

// Helper function to test authentication (for debugging)
export const testResponderLogin = async (email, password) => {
  try {
    console.log("Testing login with email:", email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✓ Login successful! User UID:", userCredential.user.uid);
    await signOut(auth);
    return { success: true, uid: userCredential.user.uid };
  } catch (error) {
    console.error("✗ Login failed:", error.code, error.message);
    return { success: false, error: error.message, code: error.code };
  }
};

export { app, db, auth };

