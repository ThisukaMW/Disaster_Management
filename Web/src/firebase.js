
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
// Reuse the shared Firebase app/db from the backend config
import backendApp, { db as backendDb } from "../../Backend/firebase.config.js";

const app = backendApp;
const db = backendDb;
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

export const createResponderAccount = async ({ email, password, name, phone }) => {
  try {
    // Validate password before proceeding
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
    
    console.log("Creating Firebase Auth user with email:", email, "Password length:", password.length);
    
    // Create Firebase Auth user with email and password
    // Email and password are stored securely in Firebase Authentication (password is hashed)
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = cred.user.uid;
    
    console.log("✓ Firebase Auth user created successfully!");
    console.log("  - UID:", uid);
    console.log("  - Email:", email);
    console.log("  - Email verified:", cred.user.emailVerified);
    
    // Verify the account works by testing sign-in (then sign out immediately)
    try {
      await signOut(secondaryAuth);
      const testSignIn = await signInWithEmailAndPassword(secondaryAuth, email, password);
      console.log("✓ Password verification successful - account can be authenticated");
      await signOut(secondaryAuth);
    } catch (verifyError) {
      console.error("⚠ Warning: Password verification failed:", verifyError);
      // Don't throw here - account was created, but log the issue
    }
    
    // Store responder data in Firestore "responders" collection
    // Password is stored as plain string in Firestore as requested
    await setDoc(doc(db, "responders", uid), {
      email,
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
    
    // Re-throw with more context
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("This email is already registered. Please use a different email.");
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

