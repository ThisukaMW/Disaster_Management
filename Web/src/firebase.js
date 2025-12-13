
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
  const q = query(collection(db, "incidents"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const incidents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(incidents);
  });
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

