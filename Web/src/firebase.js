
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
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
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

export const createResponderAccount = async ({ email, password, name, phone, zone, role = "responder" }) => {
  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  const uid = cred.user.uid;
  await setDoc(doc(db, "responders", uid), {
    email,
    name: name || "",
    phone: phone || "",
    zone: zone || "",
    role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await signOut(secondaryAuth);
  return uid;
};

export const updateResponder = async (id, data) => {
  const ref = doc(db, "responders", id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
};

export { app, db, auth };

