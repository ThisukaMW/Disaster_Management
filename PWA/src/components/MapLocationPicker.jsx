// Map Location Picker Component - Works Offline
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getCurrentLocation } from '../services/locationService';
import 'leaflet/dist/leaflet.css';
import './MapLocationPicker.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Red marker icon for selected incident location (custom red pin)
const selectedIcon = L.divIcon({
  className: 'selected-location-marker',
  html: `
    <div style="position: relative; width: 25px; height: 41px;">
      <svg width="25" height="41" viewBox="0 0 25 41" style="position: absolute; top: 0; left: 0;">
        <path fill="#dc2626" stroke="#b91c1c" stroke-width="1" d="M12.5 0C5.596 0 0 5.596 0 12.5c0 8.75 12.5 28.5 12.5 28.5s12.5-19.75 12.5-28.5C25 5.596 19.404 0 12.5 0z"/>
        <circle fill="white" cx="12.5" cy="12.5" r="4.5"/>
      </svg>
    </div>
  `,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Neutral gray marker icon for user's current location (custom divIcon)
const currentLocationIcon = L.divIcon({
  className: 'current-location-marker',
  html: '<div style="background-color: #6b7280; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Component to center map on user location
function CenterMapOnLocation({ location }) {
  const map = useMap();
  const hasCentered = useRef(false);
  
  useEffect(() => {
    if (location && !hasCentered.current) {
      map.setView([location.latitude, location.longitude], 15);
      hasCentered.current = true;
    }
  }, [location, map]);
  
  return null;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect({ latitude: lat, longitude: lng, accuracy: 0 });
    }
  });
  return null;
}

const MapLocationPicker = ({ initialLocation, onLocationSelect, onUseGPS }) => {
  // Set default location immediately so pin appears right away
  const defaultLocation = initialLocation || { latitude: 6.6828, longitude: 80.4012, accuracy: 0 };
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [mapCenter, setMapCenter] = useState([defaultLocation.latitude, defaultLocation.longitude]);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  
  // Notify parent of default location immediately
  useEffect(() => {
    if (!initialLocation) {
      onLocationSelect(defaultLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get user's current location when map opens
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      setLoadingLocation(true);
      try {
        const location = await getCurrentLocation();
        setCurrentLocation(location);
        setMapCenter([location.latitude, location.longitude]);
        
        // If no initial location, use current location as selected location
        if (!initialLocation) {
          setSelectedLocation(location);
          onLocationSelect(location);
        }
      } catch (error) {
        console.error('Failed to get current location:', error);
        // Default location is already set, so pin will still show
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setMapCenter([initialLocation.latitude, initialLocation.longitude]);
    }
  }, [initialLocation]);

  const handleMapClick = (location) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  const handleUseGPS = async () => {
    setLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      setMapCenter([location.latitude, location.longitude]);
      setSelectedLocation(location);
      onLocationSelect(location);
    } catch (error) {
      console.error('GPS error:', error);
      if (onUseGPS) {
        try {
          const location = await onUseGPS();
          if (location) {
            setCurrentLocation(location);
            setSelectedLocation(location);
            setMapCenter([location.latitude, location.longitude]);
            onLocationSelect(location);
          }
        } catch (err) {
          console.error('GPS fallback error:', err);
        }
      }
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    <div className="map-location-picker">
      <div className="map-picker-header">
        <h3>Select Location on Map</h3>
        <button
          type="button"
          onClick={handleUseGPS}
          className="use-gps-button"
          disabled={loadingLocation}
        >
          {loadingLocation ? '📍 Getting Location...' : '📍 Use My Location'}
        </button>
      </div>
      
      {loadingLocation && !currentLocation && (
        <div className="location-loading-message">
          Getting your current location...
        </div>
      )}

      {mapError && (
        <div className="map-error-message">
          <p>⚠️ Map failed to load: {mapError}</p>
          <p>Please check your internet connection and try again.</p>
        </div>
      )}

      <div className="map-container-wrapper">
        {mapCenter && (
          <MapContainer
            key={`map-${mapCenter[0]}-${mapCenter[1]}`}
            center={mapCenter}
            zoom={15}
            style={{ height: '400px', width: '100%', zIndex: 1 }}
            zoomControl={true}
            scrollWheelZoom={true}
            whenReady={() => {
              setMapReady(true);
              setMapError(null);
            }}
            whenCreated={(map) => {
              // Map created successfully
              console.log('Map created:', map);
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
              eventHandlers={{
                tileerror: (error) => {
                  console.error('Tile error:', error);
                  setMapError('Failed to load map tiles');
                }
              }}
            />
            {mapReady && (
              <>
                <CenterMapOnLocation location={currentLocation} />
                <MapClickHandler onLocationSelect={handleMapClick} />
                
                {/* User's current location marker (blue) */}
                {currentLocation && (
                  <>
                    <Marker
                      position={[currentLocation.latitude, currentLocation.longitude]}
                      icon={currentLocationIcon}
                    >
                      <Popup>📍 Your Current Location</Popup>
                    </Marker>
                    {currentLocation.accuracy && currentLocation.accuracy < 1000 && (
                      <Circle
                        center={[currentLocation.latitude, currentLocation.longitude]}
                        radius={currentLocation.accuracy}
                        pathOptions={{ color: '#6b7280', fillColor: '#6b7280', fillOpacity: 0.2 }}
                      />
                    )}
                  </>
                )}
                
                {/* Selected incident location marker (red) */}
                {selectedLocation && (
                  <Marker
                    position={[selectedLocation.latitude, selectedLocation.longitude]}
                    icon={selectedIcon}
                  >
                    <Popup>📍 Incident Location</Popup>
                  </Marker>
                )}
              </>
            )}
          </MapContainer>
        )}
      </div>

      <div className="location-info-panel">
        {currentLocation && (
          <div className="current-location-info">
            <p><strong>📍 Your Location:</strong></p>
            <p>Lat: {currentLocation.latitude.toFixed(6)}, Lng: {currentLocation.longitude.toFixed(6)}</p>
          </div>
        )}
        
        {selectedLocation && (
          <div className="selected-location-info">
            <p><strong>✅ Incident Location:</strong></p>
            <p>Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}</p>
            <p className="map-instruction">💡 Click anywhere on the map to place incident pin</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapLocationPicker;

