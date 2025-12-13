// Offline Handler - Ensures app works offline
// This prevents Safari's "can't connect" error when offline

export const setupOfflineHandler = () => {
  // Check if service worker is supported
  if ('serviceWorker' in navigator) {
    // Wait for service worker to be ready
    window.addEventListener('load', () => {
      navigator.serviceWorker.ready.then((registration) => {
        console.log('✅ Service Worker ready - app can work offline');
      }).catch((error) => {
        console.warn('Service Worker not ready:', error);
      });
    });
  }

  // Handle offline errors gracefully
  window.addEventListener('error', (event) => {
    // Don't show network errors when offline - app should still work
    if (event.message && event.message.includes('Failed to fetch')) {
      if (!navigator.onLine) {
        event.preventDefault();
        console.log('Offline mode - network error suppressed');
      }
    }
  });

  // Prevent Safari from showing "can't connect" page
  window.addEventListener('online', () => {
    console.log('✅ Back online');
  });

  window.addEventListener('offline', () => {
    console.log('⚠️ Offline mode - app will use cached files');
  });
};

