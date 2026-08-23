// Authentication Service with Offline Support
// Authenticates against Firestore "responders" collection
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from './firebase';

// Cache auth state in localStorage for offline access
const AUTH_CACHE_KEY = 'disaster_auth_cache';

// Current authenticated user
let currentUser = null;

export const signIn = async (email, password) => {
  try {
    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('🔐 Attempting login with Firestore responders:', { email: normalizedEmail });
    
    // Query responders collection for matching email
    const respondersRef = collection(db, 'responders');
    const q = query(respondersRef, where('email', '==', normalizedEmail));
    const querySnapshot = await getDocs(q);
    
    console.log('📊 Query result:', { 
      empty: querySnapshot.empty, 
      size: querySnapshot.size,
      docs: querySnapshot.docs.map(doc => ({ id: doc.id, email: doc.data().email }))
    });
    
    if (querySnapshot.empty) {
      console.error('❌ No responder found with email:', normalizedEmail);
      throw new Error('Invalid email or password');
    }
    
    // Get the first matching responder
    const responderDoc = querySnapshot.docs[0];
    const responderData = responderDoc.data();
    
    console.log('👤 Found responder:', { 
      id: responderDoc.id, 
      email: responderData.email,
      hasPassword: !!responderData.password,
      passwordMatch: responderData.password === password
    });
    
    // Check if password matches (case-sensitive)
    if (responderData.password !== password) {
      console.error('❌ Password mismatch:', { 
        expected: responderData.password, 
        received: password,
        expectedLength: responderData.password?.length,
        receivedLength: password?.length
      });
      throw new Error('Invalid email or password');
    }
    
    // Create user object
    const user = {
      uid: responderDoc.id,
      email: responderData.email || normalizedEmail,
      name: responderData.name || responderData['full name'] || responderData.email || normalizedEmail,
      role: responderData.role || 'responder',
      ...responderData
    };
    
    // Remove password from cached data (security)
    const { password: _, ...userDataToCache } = user;
    
    // Cache user info for offline access
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role,
      timestamp: Date.now()
    }));
    
    currentUser = user;
    
    console.log('✅ Login successful:', { uid: user.uid, email: user.email });
    
    return user;
  } catch (error) {
    console.error('❌ Sign in error:', error);
    console.error('Error details:', { 
      code: error.code, 
      message: error.message,
      stack: error.stack 
    });
    
    // Provide user-friendly error message
    if (error.message && error.message.includes('Invalid email or password')) {
      throw error;
    }
    // Handle Firestore errors
    if (error.code === 'permission-denied') {
      console.error('🚫 Firestore permission denied - check security rules');
      throw new Error('Access denied. Please check Firestore security rules allow reading responders collection.');
    }
    if (error.code === 'unavailable') {
      throw new Error('Service unavailable. Please check your internet connection.');
    }
    if (error.code) {
      throw new Error(`Firestore error: ${error.code}. Please check console for details.`);
    }
    throw new Error('Failed to sign in. Please check your internet connection and try again.');
  }
};

export const signOut = async () => {
  try {
    currentUser = null;
    localStorage.removeItem(AUTH_CACHE_KEY);
  } catch (error) {
    console.error('Sign out error:', error);
    // Clear local state even if there's an error
    currentUser = null;
    localStorage.removeItem(AUTH_CACHE_KEY);
    throw error;
  }
};

export const getCurrentUser = () => {
  return currentUser;
};

export const getCachedAuth = () => {
  try {
    const cached = localStorage.getItem(AUTH_CACHE_KEY);
    if (cached) {
      const authData = JSON.parse(cached);
      // Check if cache is still valid (24 hours)
      const cacheAge = Date.now() - authData.timestamp;
      if (cacheAge < 24 * 60 * 60 * 1000) {
        // Restore currentUser from cache
        currentUser = {
          uid: authData.uid,
          email: authData.email,
          name: authData.name,
          role: authData.role
        };
        return authData;
      } else {
        // Cache expired, clear it
        localStorage.removeItem(AUTH_CACHE_KEY);
        currentUser = null;
      }
    }
  } catch (error) {
    console.error('Error reading cached auth:', error);
  }
  return null;
};

export const isAuthenticated = () => {
  // Check current user first
  if (currentUser) {
    return true;
  }
  
  // Fallback to cache for offline mode
  const cached = getCachedAuth();
  return cached !== null;
};

export const getUserId = () => {
  if (currentUser) {
    return currentUser.uid;
  }
  
  const cached = getCachedAuth();
  return cached?.uid || null;
};

// Subscribe to auth state changes (simplified for Firestore auth)
export const onAuthStateChange = (callback) => {
  // Check cached auth on mount
  const cachedAuth = getCachedAuth();
  if (cachedAuth) {
    callback({
      uid: cachedAuth.uid,
      email: cachedAuth.email
    });
  } else {
    callback(null);
  }
  
  // Return a cleanup function (no-op for Firestore auth)
  return () => {};
};

