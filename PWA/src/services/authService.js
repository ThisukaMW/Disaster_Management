// Authentication Service with Offline Support
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from './firebase';

// Cache auth state in localStorage for offline access
const AUTH_CACHE_KEY = 'disaster_auth_cache';

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Cache auth token and user info for offline access
    const token = await user.getIdToken();
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({
      uid: user.uid,
      email: user.email,
      token: token,
      timestamp: Date.now()
    }));
    
    return user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    localStorage.removeItem(AUTH_CACHE_KEY);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const getCachedAuth = () => {
  try {
    const cached = localStorage.getItem(AUTH_CACHE_KEY);
    if (cached) {
      const authData = JSON.parse(cached);
      // Check if cache is still valid (24 hours)
      const cacheAge = Date.now() - authData.timestamp;
      if (cacheAge < 24 * 60 * 60 * 1000) {
        return authData;
      }
    }
  } catch (error) {
    console.error('Error reading cached auth:', error);
  }
  return null;
};

export const isAuthenticated = () => {
  // Check Firebase auth first
  if (auth.currentUser) {
    return true;
  }
  
  // Fallback to cache for offline mode
  const cached = getCachedAuth();
  return cached !== null;
};

export const getUserId = () => {
  if (auth.currentUser) {
    return auth.currentUser.uid;
  }
  
  const cached = getCachedAuth();
  return cached?.uid || null;
};

// Subscribe to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      // Update cache when user is authenticated
      user.getIdToken().then(token => {
        localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({
          uid: user.uid,
          email: user.email,
          token: token,
          timestamp: Date.now()
        }));
      });
    }
    callback(user);
  });
};

