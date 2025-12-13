// Field Responder App Page
import { useState } from 'react';
import { signOut } from '../services/authService';
import IncidentForm from '../components/IncidentForm';
import PendingIncidents from '../components/PendingIncidents';
import NetworkStatus from '../components/NetworkStatus';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
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
        <h1>Project Aegis</h1>
        <button onClick={handleSignOut} className="sign-out-button">
          Sign Out
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
    </div>
  );
};

export default FieldResponder;

