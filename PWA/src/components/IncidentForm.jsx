// Incident Report Form Component
import { useState, useEffect } from 'react';
import { db } from '../db/database';
import { getCurrentLocation } from '../services/locationService';
import { getUserId } from '../services/authService';
import { syncService } from '../services/syncService';
import { isOnline } from '../services/networkService';
import MapLocationPicker from './MapLocationPicker';
import './IncidentForm.css';

const IncidentForm = () => {
  const [formData, setFormData] = useState({
    incidentType: '',
    severity: '3',
    photo: null,
    photoPreview: null
  });
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualCoords, setManualCoords] = useState({ lat: '', lng: '' });
  const [useMapPicker, setUseMapPicker] = useState(false);

  const incidentTypes = [
    { value: 'Landslide', label: 'Landslide' },
    { value: 'Flood', label: 'Flood' },
    { value: 'Road Block', label: 'Road Block' },
    { value: 'Power Line Down', label: 'Power Line Down' }
  ];

  const severityLevels = [
    { value: '1', label: '1 - Critical' },
    { value: '2', label: '2 - High' },
    { value: '3', label: '3 - Medium' },
    { value: '4', label: '4 - Low' },
    { value: '5', label: '5 - Minimal' }
  ];

  useEffect(() => {
    // Request location permission automatically on mount
    requestLocationPermission();
    updatePendingCount();
  }, []);

  const requestLocationPermission = async () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported. Please use a mobile device.');
      setManualEntry(true);
      return;
    }

    // Show alert to user first
    const userConfirmed = window.confirm(
      'This app needs your location to report incidents. Click OK to allow location access.\n\n' +
      'Note: For true offline GPS, please test on a mobile device.'
    );

    if (userConfirmed) {
      // Request location permission
      captureLocation();
    } else {
      setManualEntry(true);
      setLocationError('Location access was not granted. You can enter coordinates manually.');
    }
  };

  const captureLocation = async () => {
    setLoading(true);
    setLocationError('');
    setManualEntry(false);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (error) {
      setLocationError(error.message);
      console.error('Location error:', error);
      // Always show manual entry option on error
      setManualEntry(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLocation = () => {
    const lat = parseFloat(manualCoords.lat);
    const lng = parseFloat(manualCoords.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      setLocationError('Please enter valid coordinates');
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setLocationError('Invalid coordinates. Lat: -90 to 90, Lng: -180 to 180');
      return;
    }
    
    setLocation({ latitude: lat, longitude: lng, accuracy: 0 });
    setLocationError('');
    setManualEntry(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          photo: reader.result,
          photoPreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const updatePendingCount = async () => {
    const pending = await db.incidents.where('synced').equals(0).count();
    setPendingCount(pending);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location) {
      setLocationError('Please capture location before submitting');
      return;
    }

    if (!formData.incidentType) {
      alert('Please select an incident type');
      return;
    }

    setSubmitting(true);
    setSuccess(false);

    try {
      const userId = getUserId();
      const timestamp = new Date().toISOString();

      const incidentData = {
        incidentType: formData.incidentType,
        severity: parseInt(formData.severity),
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: timestamp,
        photo: formData.photo || null,
        userId: userId,
        synced: isOnline() ? 0 : 0, // Will be synced later
        createdAt: Date.now()
      };

      // Save to local database
      await db.incidents.add(incidentData);
      
      // Try to sync if online
      if (isOnline()) {
        await syncService.syncPendingIncidents();
      }

      // Reset form
      setFormData({
        incidentType: '',
        severity: '3',
        photo: null,
        photoPreview: null
      });
      setLocation(null);
      setSuccess(true);
      await updatePendingCount();

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving incident:', error);
      alert('Failed to save incident. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="incident-form-container">
      <div className="incident-form-card">
        <h2>Report Incident</h2>
        
        {success && (
          <div className="success-message">
            ✓ Incident saved {isOnline() ? 'and synced' : 'locally'} successfully!
          </div>
        )}

        {pendingCount > 0 && (
          <div className="pending-indicator">
            {pendingCount} incident(s) pending sync
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="incidentType">Incident Type *</label>
            <select
              id="incidentType"
              value={formData.incidentType}
              onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
              required
            >
              <option value="">Select incident type</option>
              {incidentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="severity">Severity *</label>
            <select
              id="severity"
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              required
            >
              {severityLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>GPS Location *</label>
            {loading ? (
              <div className="location-loading">Capturing location...</div>
            ) : location ? (
              <div className="location-display">
                <div className="location-coords">
                  <strong>Lat:</strong> {location.latitude.toFixed(6)}<br />
                  <strong>Lng:</strong> {location.longitude.toFixed(6)}
                </div>
                <div className="location-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setUseMapPicker(true);
                      setLocation(null);
                    }}
                    className="change-location-btn"
                  >
                    📍 Change on Map
                  </button>
                  <button
                    type="button"
                    onClick={requestLocationPermission}
                    className="refresh-location-btn"
                  >
                    🔄 Use GPS
                  </button>
                </div>
              </div>
            ) : useMapPicker ? (
              <div>
                <MapLocationPicker
                  initialLocation={location}
                  onLocationSelect={(loc) => {
                    setLocation(loc);
                    setUseMapPicker(false);
                    setLocationError('');
                  }}
                  onUseGPS={async () => {
                    try {
                      const loc = await getCurrentLocation();
                      return loc;
                    } catch (error) {
                      setLocationError(error.message);
                      return null;
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setUseMapPicker(false);
                    setLocation(null);
                  }}
                  className="back-to-options-btn"
                >
                  ← Back to Options
                </button>
              </div>
            ) : manualEntry ? (
              <div className="manual-location-entry">
                <p className="manual-entry-note">
                  GPS not available. Enter coordinates manually (for testing):
                </p>
                <div className="coord-inputs">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude (e.g., 6.6828)"
                    value={manualCoords.lat}
                    onChange={(e) => setManualCoords({ ...manualCoords, lat: e.target.value })}
                    className="coord-input"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude (e.g., 80.4012)"
                    value={manualCoords.lng}
                    onChange={(e) => setManualCoords({ ...manualCoords, lng: e.target.value })}
                    className="coord-input"
                  />
                </div>
                <div className="manual-entry-actions">
                  <button
                    type="button"
                    onClick={handleManualLocation}
                    className="use-manual-btn"
                  >
                    Use These Coordinates
                  </button>
                  <button
                    type="button"
                    onClick={requestLocationPermission}
                    className="try-gps-btn"
                  >
                    Try GPS Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="location-options">
                <p className="location-options-title">Choose how to set location:</p>
                <div className="location-option-buttons">
                  <button
                    type="button"
                    onClick={requestLocationPermission}
                    className="location-option-btn"
                  >
                    📍 Use GPS
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseMapPicker(true)}
                    className="location-option-btn map-option"
                  >
                    🗺️ Select on Map
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualEntry(true);
                      setUseMapPicker(false);
                    }}
                    className="location-option-btn"
                  >
                    ⌨️ Enter Manually
                  </button>
                </div>
                <p className="location-hint">
                  💡 Map selection works offline! Tiles are cached for offline use.
                </p>
              </div>
            )}
            {locationError && !manualEntry && !useMapPicker && (
              <div className="error-message">{locationError}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="photo">Photo (Optional)</label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
            />
            {formData.photoPreview && (
              <div className="photo-preview">
                <img src={formData.photoPreview} alt="Preview" />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={submitting || !location}
          >
            {submitting ? 'Saving...' : 'Save Incident'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IncidentForm;

