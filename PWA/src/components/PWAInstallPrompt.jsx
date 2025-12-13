// PWA Install Prompt Component
import { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Detect iOS
  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);
    
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    
    if (standalone) {
      setShowPrompt(false);
      return;
    }
  }, []);

  useEffect(() => {
    // For Android/Chrome: Listen for the beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    if (!isIOS) {
      window.addEventListener('beforeinstallprompt', handler);
    } else {
      // For iOS: Show instructions after a delay
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 2000); // Show after 2 seconds
        return () => clearTimeout(timer);
      } else {
        const dismissedTime = parseInt(dismissed);
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed >= 7) {
          const timer = setTimeout(() => {
            setShowPrompt(true);
          }, 2000);
          return () => clearTimeout(timer);
        }
      }
    }

    return () => {
      if (!isIOS) {
        window.removeEventListener('beforeinstallprompt', handler);
      }
    };
  }, [isIOS]);

  const handleInstallClick = async () => {
    if (isIOS) {
      // For iOS, we can't programmatically trigger install
      // The instructions are already shown
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt (Android/Chrome)
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  // iOS-specific instructions
  if (isIOS) {
    return (
      <div className="pwa-install-prompt">
        <div className="pwa-install-content ios-install">
          <div className="pwa-install-icon">📱</div>
          <div className="pwa-install-text">
            <strong>Add to Home Screen</strong>
            <p className="ios-instructions">
              <span className="ios-step">1. Tap the <strong>Share</strong> button <span className="ios-icon">⎋</span> at the bottom</span>
              <span className="ios-step">2. Scroll down and tap <strong>"Add to Home Screen"</strong></span>
              <span className="ios-step">3. Tap <strong>"Add"</strong> to install</span>
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="pwa-dismiss-btn"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  // Android/Chrome install prompt
  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-content">
        <div className="pwa-install-icon">📱</div>
        <div className="pwa-install-text">
          <strong>Install Project Aegis</strong>
          <p>Add to home screen for quick access and offline use</p>
        </div>
        <div className="pwa-install-buttons">
          <button
            onClick={handleInstallClick}
            className="pwa-install-btn"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="pwa-dismiss-btn"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;

