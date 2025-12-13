// Field Responder App Page
import { useState } from 'react';
import { signOut } from '../services/authService';
import IncidentForm from '../components/IncidentForm';
import PendingIncidents from '../components/PendingIncidents';
import NetworkStatus from '../components/NetworkStatus';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import ThemeToggle from '../components/ThemeToggle';
import Footer from '../components/Footer';
import './FieldResponder.css';

const FieldResponder = () => {
  const [activeTab, setActiveTab] = useState('report');

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

