// Network Service - Detects online/offline status
export const isOnline = () => {
  return navigator.onLine;
};

export const getNetworkStatus = () => {
  return {
    online: navigator.onLine,
    connectionType: navigator.connection?.effectiveType || 'unknown'
  };
};

// Subscribe to network status changes
export const subscribeToNetworkStatus = (callback) => {
  const updateStatus = () => {
    callback(getNetworkStatus());
  };

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);

  // Also listen to connection changes (if available)
  if (navigator.connection) {
    navigator.connection.addEventListener('change', updateStatus);
  }

  // Return unsubscribe function
  return () => {
    window.removeEventListener('online', updateStatus);
    window.removeEventListener('offline', updateStatus);
    if (navigator.connection) {
      navigator.connection.removeEventListener('change', updateStatus);
    }
  };
};

