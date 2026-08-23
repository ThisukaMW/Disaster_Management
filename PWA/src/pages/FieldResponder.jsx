// Field Responder App Page
import { useState } from 'react';
import { signOut, getUserId } from '../services/authService';
import { getFastLocation } from '../services/locationService';
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
  const [sosStatus, setSosStatus] = useState('');

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
    // Detailed confirmation prompt explaining what will be sent
    const confirmMessage = `🚨 SEND SOS EMERGENCY ALERT?

WHAT WILL BE SENT:
• Emergency Type: SOS / Responder Down
• Severity Level: CRITICAL (Level 1)
• Your Current GPS Location
• Timestamp: Right now
• Your User ID

WHERE IT GOES:
• Saved locally immediately (works offline)
• Synced to command center (when online)
• Visible on emergency dashboard
• Alert sent to all responders

Are you in immediate danger and need help NOW?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setSosLoading(true);
    setSosSuccess(false);
    setSosStatus('Getting your location...');

    // Get user ID immediately (don't wait)
    const userId = getUserId() || 'unknown';
    let location = null;
    let locationError = null;

    try {
      // Get location FAST (uses cached location, only 3 second timeout)
      setSosStatus('Getting your GPS location (3 seconds max)...');
      console.log('🚨 SOS: Getting location (fast mode - 3 seconds max)...');
      location = await getFastLocation();
      console.log('✅ SOS: Location obtained quickly:', {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy ? `${location.accuracy.toFixed(0)}m` : 'unknown'
      });
      setSosStatus('Location found! Saving SOS alert...');
    } catch (error) {
      console.warn('⚠️ SOS: Could not get location quickly:', error);
      locationError = error;
      setSosStatus('Location unavailable, saving SOS anyway...');
      // Continue anyway - send SOS without location or with fallback
    }

    try {
      // Create SOS incident - save IMMEDIATELY (even without location if needed)
      setSosStatus('Creating emergency alert...');
      const sosIncident = {
        incidentType: 'SOS / Responder Down',
        severity: 1, // Critical
        latitude: location ? location.latitude : 0, // Use location if available
        longitude: location ? location.longitude : 0, // Use location if available
        timestamp: new Date().toISOString(),
        photo: null, // No photo for SOS
        synced: 0, // Will sync when online
        userId: userId,
        createdAt: Date.now(),
        retryCount: 0,
        lastRetryAt: null
      };

      // Save to Dexie IMMEDIATELY (works offline)
      setSosStatus('Saving to local database...');
      console.log('🚨 SOS: Saving immediately to local database...');
      const incidentId = await db.incidents.add(sosIncident);
      
      console.log('✅ SOS: Saved instantly with ID:', incidentId);
      if (location) {
        console.log('📍 SOS: Location included:', {
          lat: location.latitude.toFixed(6),
          lng: location.longitude.toFixed(6)
        });
      }

      setSosStatus('SOS saved! Syncing to server...');
      
      // Try to sync immediately if online (force sync for SOS)
      if (navigator.onLine) {
        console.log('🚨 SOS: Online - attempting immediate sync...');
        setSosStatus('Sending to command center...');
        
        // Force immediate sync (don't wait)
        try {
          // Get the incident we just saved and sync it immediately
          const savedIncident = await db.incidents.get(incidentId);
          if (savedIncident) {
            const { id, synced, createdAt, retryCount: _, lastRetryAt: __, ...incidentData } = savedIncident;
            
            // Skip duplicate check for SOS - always send
            console.log('🚨 SOS: Bypassing duplicate check - sending directly to Firestore...');
            console.log('🚨 SOS: Incident data:', {
              type: incidentData.incidentType,
              severity: incidentData.severity,
              lat: incidentData.latitude,
              lng: incidentData.longitude,
              userId: incidentData.userId
            });
            
            const { saveIncidentToFirestore } = await import('../services/firebase');
            const firestoreId = await saveIncidentToFirestore(incidentData);
            
            // Mark as synced immediately
            await db.incidents.update(incidentId, { 
              synced: 1,
              retryCount: 0,
              lastRetryAt: null
            });
            
            console.log('✅ SOS: Synced directly to Firestore! Firestore ID:', firestoreId);
            setSosStatus('Sent to command center! ✅');
          } else {
            console.error('❌ SOS: Could not find saved incident in local database');
            // Fall back to normal sync
            setTimeout(() => {
              syncService.syncPendingIncidents();
            }, 500);
          }
        } catch (syncError) {
          console.error('❌ SOS: Direct sync failed:', syncError);
          console.error('Error details:', {
            code: syncError.code,
            message: syncError.message,
            stack: syncError.stack
          });
          setSosStatus('Sync failed - will retry...');
          // Fall back to normal sync service
          setTimeout(() => {
            syncService.syncPendingIncidents();
          }, 500);
        }
      } else {
        console.log('⚠️ SOS: Offline - will sync when connection is restored');
        setSosStatus('Saved offline - will sync when online');
      }

      // Show success IMMEDIATELY (don't wait for sync)
      setSosSuccess(true);
      setTimeout(() => {
        setSosSuccess(false);
        setSosStatus('');
      }, 4000);

      // Show detailed success message with what was sent
      const whatWasSent = `
✅ WHAT WAS SENT:
• Emergency Type: SOS / Responder Down
• Severity: CRITICAL (Level 1)
• Timestamp: ${new Date().toLocaleString()}
• Your User ID: ${userId}
${location ? `• Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\n• Accuracy: ${location.accuracy ? location.accuracy.toFixed(0) + 'm' : 'unknown'}` : '• Location: Could not get location quickly'}
• Status: ${navigator.onLine ? 'Syncing to server...' : 'Saved offline, will sync when online'}

🚨 HELP IS ON THE WAY!

Your emergency alert has been sent to the command center. Responders will be notified immediately.`;
      
      alert(`🚨 SOS ALERT SENT SUCCESSFULLY!\n\n${whatWasSent}`);

    } catch (error) {
      console.error('❌ SOS Save Error:', error);
      setSosStatus('');
      alert(`❌ SOS Alert Failed!\n\nError: ${error.message}\n\nPlease try again or use the regular incident form to report manually.`);
      setSosLoading(false);
    } finally {
      if (!sosSuccess) {
        setSosLoading(false);
      }
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
              <div className="sos-button-text">
                <span className="sos-button-title">SENDING SOS...</span>
                {sosStatus && <span className="sos-button-status">{sosStatus}</span>}
              </div>
            </>
          ) : sosSuccess ? (
            <>
              <span className="sos-check">✓</span>
              <div className="sos-button-text">
                <span className="sos-button-title">SOS SENT!</span>
                {sosStatus && <span className="sos-button-status">{sosStatus}</span>}
              </div>
            </>
          ) : (
            <>
              <span className="sos-icon">🚨</span>
              <div className="sos-button-text">
                <span className="sos-button-title">RESPONDER IN DANGER (SOS)</span>
                <span className="sos-button-subtitle">Tap to send emergency alert with location</span>
              </div>
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

