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
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({
    incidentType: '',
    severity: '',
    location: ''
  });

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
    updatePendingCount();
  }, []);

  // Scroll to top when success message appears
  useEffect(() => {
    if (success) {
      // Scroll to top of the page smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Also scroll to success message if it exists (after a small delay to ensure it's rendered)
      setTimeout(() => {
        const successElement = document.getElementById('success-message');
        if (successElement) {
          // Scroll to show success message, accounting for fixed header (44px for network status)
          const yOffset = -60; // Account for network status banner and header
          const y = successElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 150);
    }
  }, [success]);



  // Compress and resize image for mobile
  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (warn if too large)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Image is very large. It will be compressed automatically.');
      }

      try {
        // Compress image (especially important for phone photos)
        const compressedPhoto = await compressImage(file);
        
        // Check compressed size
        const base64Size = compressedPhoto.length;
        const maxBase64Size = 900 * 1024; // ~900KB base64 (safe for Firestore 1MB limit)
        
        if (base64Size > maxBase64Size) {
          // Compress more aggressively
          const moreCompressed = await compressImage(file, 600, 600, 0.5);
          setFormData({
            ...formData,
            photo: moreCompressed,
            photoPreview: moreCompressed
          });
        } else {
          setFormData({
            ...formData,
            photo: compressedPhoto,
            photoPreview: compressedPhoto
          });
        }
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('Error processing image. Please try a different photo.');
      }
    }
  };

  const updatePendingCount = async () => {
    const pending = await db.incidents.where('synced').equals(0).count();
    setPendingCount(pending);
  };

  const validateForm = () => {
    const errors = {
      incidentType: '',
      severity: '',
      location: ''
    };
    let isValid = true;
    let firstErrorField = null;

    // Validate Incident Type
    if (!formData.incidentType || formData.incidentType.trim() === '') {
      errors.incidentType = 'Incident type is required';
      isValid = false;
      if (!firstErrorField) firstErrorField = 'incidentType';
    }

    // Validate Severity
    if (!formData.severity || formData.severity.trim() === '') {
      errors.severity = 'Severity is required';
      isValid = false;
      if (!firstErrorField) firstErrorField = 'severity';
    }

    // Validate Location
    if (!location || !location.latitude || !location.longitude) {
      errors.location = 'Location is required';
      isValid = false;
      if (!firstErrorField) firstErrorField = 'location';
    }

    setFieldErrors(errors);

    // Scroll to first error field
    if (!isValid && firstErrorField) {
      // First, scroll to form container
      const formContainer = document.getElementById('incident-form');
      if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Then scroll to the specific error field
      setTimeout(() => {
        const errorElement = document.getElementById(firstErrorField);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorElement.focus();
        }
      }, 300);
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSuccess(false);
    setFieldErrors({ incidentType: '', severity: '', location: '' });

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
    <div className="incident-form-container" id="incident-form">
      <div className="incident-form-card">
        <h2>Report Incident</h2>
        
        {success && (
          <div 
            id="success-message"
            className={`success-message-large ${isOnline() ? 'synced' : 'saved-local'}`}
          >
            <div className="success-icon">✓</div>
            <div className="success-text">
              <strong>DATA SAVED!</strong>
              <div className="success-detail">
                {isOnline() 
                  ? 'Saved and synced to server ✓' 
                  : 'Saved locally - Will sync when online ✓'}
              </div>
              <div className="success-reassurance">
                Your data is safe and secure.
              </div>
            </div>
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
              onChange={(e) => {
                setFormData({ ...formData, incidentType: e.target.value });
                if (fieldErrors.incidentType) {
                  setFieldErrors({ ...fieldErrors, incidentType: '' });
                }
              }}
              className={fieldErrors.incidentType ? 'error-field' : ''}
            >
              <option value="">Select incident type</option>
              {incidentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {fieldErrors.incidentType && (
              <span className="field-error">{fieldErrors.incidentType}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="severity">Severity *</label>
            <select
              id="severity"
              value={formData.severity}
              onChange={(e) => {
                setFormData({ ...formData, severity: e.target.value });
                if (fieldErrors.severity) {
                  setFieldErrors({ ...fieldErrors, severity: '' });
                }
              }}
              className={fieldErrors.severity ? 'error-field' : ''}
            >
              {severityLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
            {fieldErrors.severity && (
              <span className="field-error">{fieldErrors.severity}</span>
            )}
          </div>

          <div className="form-group" id="location">
            <label>Location *</label>
            <MapLocationPicker
              initialLocation={location}
              onLocationSelect={(loc) => {
                setLocation(loc);
                setLocationError('');
                if (fieldErrors.location) {
                  setFieldErrors({ ...fieldErrors, location: '' });
                }
              }}
              onUseGPS={async () => {
                try {
                  const loc = await getCurrentLocation();
                  if (fieldErrors.location) {
                    setFieldErrors({ ...fieldErrors, location: '' });
                  }
                  return loc;
                } catch (error) {
                  setLocationError(error.message);
                  return null;
                }
              }}
            />
            {fieldErrors.location && (
              <span className="field-error">{fieldErrors.location}</span>
            )}
            {locationError && (
              <div className="error-message">{locationError}</div>
            )}
            {location && (
              <div className="location-confirmation">
                ✓ Location confirmed: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </div>
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
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Incident'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IncidentForm;

