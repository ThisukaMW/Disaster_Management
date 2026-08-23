// Pending Incidents List Component
import { useState, useEffect } from 'react';
import { db } from '../db/database';
import { syncService } from '../services/syncService';
import { isOnline } from '../services/networkService';
import './PendingIncidents.css';

const PendingIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadPendingIncidents();
    
    // Refresh every 5 seconds
    const interval = setInterval(loadPendingIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingIncidents = async () => {
    const pending = await db.incidents
      .where('synced')
      .equals(0)
      .reverse()
      .sortBy('createdAt');
    setIncidents(pending);
  };

  const handleSync = async () => {
    if (!isOnline()) {
      alert('You are offline. Please connect to the internet to sync.');
      return;
    }

    setSyncing(true);
    try {
      await syncService.forceSync();
      await loadPendingIncidents();
      alert('Sync completed!');
    } catch (error) {
      console.error('Sync error:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (severity) => {
    const colors = {
      1: '#c2410c',
      2: '#ea580c',
      3: '#f59e0b',
      4: '#10b981',
      5: '#6b7280'
    };
    return colors[severity] || '#6b7280';
  };

  return (
    <div className="pending-incidents-container">
      <div className="pending-header">
        <h2>Pending Incidents ({incidents.length})</h2>
        {isOnline() && (
          <button
            onClick={handleSync}
            className="sync-button"
            disabled={syncing || incidents.length === 0}
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>

      {incidents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <p className="empty-message">All reports synced!</p>
          <p className="empty-detail">Your data is safe on the server.</p>
        </div>
      ) : (
        <div className="incidents-list">
          {incidents.map(incident => (
            <div key={incident.id} className="incident-card">
              <div className="incident-header">
                <span className="incident-type">{incident.incidentType}</span>
                <span
                  className="severity-badge"
                  style={{ backgroundColor: getSeverityColor(incident.severity) }}
                >
                  Severity {incident.severity}
                </span>
              </div>
              <div className="incident-details">
                <div className="detail-row">
                  <strong>Location:</strong> {incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}
                </div>
                <div className="detail-row">
                  <strong>Time:</strong> {formatDate(incident.createdAt)}
                </div>
                {incident.photo && (
                  <div className="incident-photo">
                    <img src={incident.photo} alt="Incident" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingIncidents;

