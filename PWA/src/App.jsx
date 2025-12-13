// Main App Component with Routing
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChange, getCachedAuth } from './services/authService';
import { syncService } from './services/syncService';
import { initTheme } from './services/themeService';
import Login from './components/Login';
import FieldResponder from './pages/FieldResponder';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize theme (default: dark mode)
    initTheme();

    // Check for cached auth first (for offline mode)
    const cachedAuth = getCachedAuth();
    if (cachedAuth) {
      setUser({ uid: cachedAuth.uid, email: cachedAuth.email });
      setLoading(false);
    }

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        // Only clear user if we're online and there's no cache
        if (navigator.onLine && !getCachedAuth()) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    // Try to sync on app start if online
    if (navigator.onLine) {
      setTimeout(() => {
        syncService.syncPendingIncidents();
      }, 2000);
    }

    return unsubscribe;
  }, []);

  const handleLoginSuccess = () => {
    // User will be set via auth state change
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route
          path="/login"
          element={
            user ? <Navigate to="/field" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
          }
        />
        <Route
          path="/field"
          element={user ? <FieldResponder /> : <Navigate to="/login" replace />}
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/field" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
