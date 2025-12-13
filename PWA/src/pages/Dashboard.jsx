// Command Dashboard Page
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { subscribeToIncidents } from '../services/firebase';
import ThemeToggle from '../components/ThemeToggle';
import Footer from '../components/Footer';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Dashboard.css';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const Dashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [mapCenter, setMapCenter] = useState([6.6828, 80.4012]); // Ratnapura coordinates

  useEffect(() => {
    const unsubscribe = subscribeToIncidents((data) => {
      setIncidents(data);
      if (data.length > 0 && !selectedIncident) {
        const latest = data[0];
        if (latest.latitude && latest.longitude) {
          setMapCenter([latest.latitude, latest.longitude]);
        }
      }
    });

    return () => unsubscribe();
  }, [selectedIncident]);

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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  const handleMarkerClick = (incident) => {
    setSelectedIncident(incident);
    if (incident.latitude && incident.longitude) {
      setMapCenter([incident.latitude, incident.longitude]);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1>ResQ - Command Dashboard</h1>
          <ThemeToggle />
        </div>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Total Incidents:</span>
            <span className="stat-value">{incidents.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Critical:</span>
            <span className="stat-value critical">
              {incidents.filter(i => i.severity === 1).length}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="map-section">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {incidents
              .filter(incident => incident.latitude && incident.longitude)
              .map(incident => (
                <Marker
                  key={incident.id}
                  position={[incident.latitude, incident.longitude]}
                  eventHandlers={{
                    click: () => handleMarkerClick(incident)
                  }}
                >
                  <Popup>
                    <div className="marker-popup">
                      <strong>{incident.incidentType}</strong>
                      <br />
                      Severity: {incident.severity}
                      <br />
                      Time: {formatDate(incident.createdAt)}
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>

        <div className="list-section">
          <h2>Incident Reports</h2>
          <div className="incidents-list">
            {incidents.length === 0 ? (
              <div className="empty-state">
                <p>No incidents reported yet.</p>
              </div>
            ) : (
              incidents.map(incident => (
                <div
                  key={incident.id}
                  className={`incident-item ${selectedIncident?.id === incident.id ? 'selected' : ''}`}
                  onClick={() => handleMarkerClick(incident)}
                >
                  <div className="incident-item-header">
                    <span className="incident-type">{incident.incidentType}</span>
                    <span
                      className="severity-badge"
                      style={{ backgroundColor: getSeverityColor(incident.severity) }}
                    >
                      {incident.severity}
                    </span>
                  </div>
                  <div className="incident-item-details">
                    <div className="detail">
                      <strong>Location:</strong> {incident.latitude?.toFixed(6)}, {incident.longitude?.toFixed(6)}
                    </div>
                    <div className="detail">
                      <strong>Time:</strong> {formatDate(incident.createdAt)}
                    </div>
                    {incident.photo && (
                      <div className="incident-photo-preview">
                        <img src={incident.photo} alt="Incident" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;

