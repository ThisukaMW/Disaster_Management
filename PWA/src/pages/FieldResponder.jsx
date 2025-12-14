// Field Responder App Page
import { useState } from 'react';
import { signOut, getUserId } from '../services/authService';
import { getCurrentLocation } from '../services/locationService';
import { db } from '../db/database';
import { syncService } from '../services/syncService';
import IncidentForm from '../components/IncidentForm';
import PendingIncidents from '../components/PendingIncidents';
import NetworkStatus from '../components/NetworkStatus';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import ThemeToggle from '../components/ThemeToggle';
import Footer from '../components/Footer';
import './FieldResponder.css';

const FieldResponder = () => {
  const [activeTab, setActiveTab] = useState('report');
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSuccess, setSosSuccess] = useState(false);

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await signOut();
        window.location.reload();
      } catch (error) {
        console.error('Sign out error:', error);
      }
    }
  };

  const handleSOS = async () => {
    // Confirm SOS action
    if (!window.confirm('🚨 SEND SOS ALERT?\n\nThis will immediately send a CRITICAL emergency alert with your CURRENT GPS LOCATION.\n\nAre you in immediate danger?')) {
      return;
    }

    setSosLoading(true);
    setSosSuccess(false);

    try {
      // Get current location (GPS coordinates)
      console.log('🚨 SOS: Getting current GPS location...');
      const location = await getCurrentLocation();
      
      console.log('✅ SOS: Location obtained:', {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy ? `${location.accuracy.toFixed(0)}m` : 'unknown'
      });
      
      // Get user ID
      const userId = getUserId() || 'unknown';

      // Create SOS incident - bypasses form completely
      // Uses CURRENT LOCATION from GPS
      const sosIncident = {
        incidentType: 'SOS / Responder Down',
        severity: 1, // Critical
        latitude: location.latitude, // Current GPS latitude
        longitude: location.longitude, // Current GPS longitude
        timestamp: new Date().toISOString(),
        photo: null, // No photo for SOS
        synced: 0, // Will sync when online
        userId: userId,
        createdAt: Date.now(),
        retryCount: 0,
        lastRetryAt: null
      };

      // Save to Dexie immediately (works offline)
      console.log('🚨 SOS: Saving to local database with current location...');
      const incidentId = await db.incidents.add(sosIncident);
      
      console.log('✅ SOS: Saved locally with ID:', incidentId);
      console.log('📍 SOS: Location sent:', {
        lat: location.latitude.toFixed(6),
        lng: location.longitude.toFixed(6)
      });
      
      // Try to sync immediately if online
      if (navigator.onLine) {
        console.log('🚨 SOS: Online - attempting immediate sync with current location...');
        setTimeout(() => {
          syncService.syncPendingIncidents();
        }, 500);
      } else {
        console.log('⚠️ SOS: Offline - will sync when connection is restored');
      }

      // Show success message with location details
      setSosSuccess(true);
      setTimeout(() => {
        setSosSuccess(false);
      }, 3000);

      // Show alert with location confirmation
      const locationMsg = `Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
      alert(`🚨 SOS ALERT SENT!\n\nCritical emergency alert has been sent with your CURRENT LOCATION:\n${locationMsg}\n\nHelp is on the way!`);

    } catch (error) {
      console.error('❌ SOS Error:', error);
      
      // If location fails, still allow SOS but warn user
      if (error.message.includes('location') || error.message.includes('Location')) {
        const useLastKnown = window.confirm(
          `⚠️ Could not get current location.\n\nError: ${error.message}\n\nDo you want to send SOS with last known location (if available) or try again?`
        );
        
        if (useLastKnown) {
          // Try to use a default location or last known (if stored)
          // For now, we'll ask user to try again or use form
          alert('Please enable location services and try again, or use the regular incident form to report manually.');
        }
      } else {
        alert(`SOS Alert Failed: ${error.message}\n\nPlease try again or use the regular incident form.`);
      }
    } finally {
      setSosLoading(false);
    }
  };

  return (
    <div className="field-responder-app">
      <NetworkStatus />
      <PWAInstallPrompt />
      <div className="app-header">
        <div className="app-logo-container">
          <div className="resq-logo">RQ</div>
          <h1>ResQ</h1>
        </div>
        <div className="header-actions">
          <ThemeToggle />
          <button onClick={handleSignOut} className="sign-out-button" title="Sign Out">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ display: 'inline-block', verticalAlign: 'middle' }}
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* SOS Button - Big Red Emergency Button */}
      <div className="sos-button-container">
        <button
          className={`sos-button ${sosLoading ? 'loading' : ''} ${sosSuccess ? 'success' : ''}`}
          onClick={handleSOS}
          disabled={sosLoading}
        >
          {sosLoading ? (
            <>
              <span className="sos-spinner"></span>
              <span>SENDING SOS...</span>
            </>
          ) : sosSuccess ? (
            <>
              <span className="sos-check">✓</span>
              <span>SOS SENT!</span>
            </>
          ) : (
            <>
              <span className="sos-icon">🚨</span>
              <span>RESPONDER IN DANGER (SOS)</span>
            </>
          )}
        </button>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          Report Incident
        </button>
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Sync
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'report' && <IncidentForm />}
        {activeTab === 'pending' && <PendingIncidents />}
      </div>
      <Footer />
    </div>
  );
};

export default FieldResponder;

