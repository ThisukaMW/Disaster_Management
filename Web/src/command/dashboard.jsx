import { useEffect, useState, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./dashboard.css";
import { subscribeToIncidents, subscribeToResponders } from "../firebase";

function getSeverityLevel(severity) {
  if (typeof severity === 'number') {
    return severity; // 1=Critical, 2=High, 3=Medium, 4=Low, 5=Minimal
  }
  const severityMap = {
    'critical': 1,
    'high': 2,
    'medium': 3,
    'low': 4,
    'minimal': 5
  };
  return severityMap[String(severity).toLowerCase()] || 3;
}

function severityClass(level) {
  if (typeof level === 'number') {
    // Map numeric severity: 1=Critical, 2=High, 3=Medium, 4=Low, 5=Minimal
    const severityMap = { 1: 'critical', 2: 'high', 3: 'medium', 4: 'low', 5: 'minimal' };
    return `pill severity-${severityMap[level] || 'medium'}`;
  }
  return `pill severity-${String(level).toLowerCase()}`;
}

function severityLabel(level) {
  if (typeof level === 'number') {
    const severityMap = { 1: 'Critical', 2: 'High', 3: 'Medium', 4: 'Low', 5: 'Minimal' };
    return severityMap[level] || `Level ${level}`;
  }
  return String(level);
}

const pinSvg = encodeURIComponent(`
<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pinGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4be3c5"/>
      <stop offset="100%" stop-color="#2ea3ff"/>
    </linearGradient>
  </defs>
  <path d="M17 0C8 0 1 7.4 1 16.5C1 26.8 17 44 17 44C17 44 33 26.8 33 16.5C33 7.4 26 0 17 0Z" fill="url(#pinGradient)"/>
  <circle cx="17" cy="16" r="6" fill="white" fill-opacity="0.9"/>
</svg>
`);

const pinIcon = L.icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${pinSvg}`,
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -40],
  className: "custom-pin",
});

// Utility function to detect duplicate coordinates
// Tolerance: ~0.0001 degrees (approximately 10 meters)
const COORDINATE_TOLERANCE = 0.0001;

function findDuplicateCoordinates(incidents, currentIncident) {
  if (!currentIncident.latitude || !currentIncident.longitude) return [];
  
  const lat = Number(currentIncident.latitude);
  const lng = Number(currentIncident.longitude);
  
  return incidents.filter(inc => {
    if (inc.id === currentIncident.id) return false;
    if (!inc.latitude || !inc.longitude) return false;
    
    const incLat = Number(inc.latitude);
    const incLng = Number(inc.longitude);
    
    const latDiff = Math.abs(lat - incLat);
    const lngDiff = Math.abs(lng - incLng);
    
    return latDiff <= COORDINATE_TOLERANCE && lngDiff <= COORDINATE_TOLERANCE;
  });
}

function Dashboard({ dispatchedTeams = [], resolvedIncidents = [] }) {
  const [incidents, setIncidents] = useState([]);
  const [tableIncidents, setTableIncidents] = useState([]);
  const [responders, setResponders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mapIncident, setMapIncident] = useState(null);
  const [photoIncident, setPhotoIncident] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedIncidentType, setSelectedIncidentType] = useState("all");
  const pageSize = 10;

  const toMillis = (value) => {
    if (!value) return 0;
    if (value.toDate) return value.toDate().getTime();
    if (value.seconds) return value.seconds * 1000;
    if (typeof value === "number") return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  };

  // Subscribe to incidents
  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeToIncidents((data) => {
      try {
        // Data is already sorted from the subscription, but ensure it's sorted
        const sorted = [...data].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
        setIncidents(sorted);
        setTableIncidents(sorted);
        setPage(1);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("Error processing incidents:", err);
        setError("Error processing incident data");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to responders to build UID to name mapping
  useEffect(() => {
    const unsubscribe = subscribeToResponders((data) => {
      setResponders(data);
    });
    return () => unsubscribe();
  }, []);

  // Create a map of UID to responder name for quick lookup
  const responderMap = useMemo(() => {
    const map = new Map();
    responders.forEach((responder) => {
      if (responder.id && responder.name) {
        map.set(responder.id, responder.name);
      }
    });
    return map;
  }, [responders]);

  // Helper function to get responder name from userId
  const getResponderName = (userId) => {
    if (!userId) return "N/A";
    return responderMap.get(userId) || "Unknown";
  };

  // Get unique incident types from incidents
  const incidentTypes = useMemo(() => {
    const types = new Set();
    incidents.forEach((inc) => {
      if (inc.incidentType) {
        types.add(inc.incidentType);
      }
    });
    return Array.from(types).sort();
  }, [incidents]);

  // Filter incidents based on selected filters
  const filteredIncidents = useMemo(() => {
    let filtered = [...incidents];

    // Filter by severity
    if (selectedSeverity !== "all") {
      const severityMap = {
        critical: 1,
        high: 2,
        medium: 3,
        low: 4,
        minimal: 5,
      };
      const targetSeverity = severityMap[selectedSeverity];
      if (targetSeverity) {
        filtered = filtered.filter((inc) => getSeverityLevel(inc.severity) === targetSeverity);
      }
    }

    // Filter by incident type
    if (selectedIncidentType !== "all") {
      filtered = filtered.filter((inc) => inc.incidentType === selectedIncidentType);
    }

    // Sort by createdAt (newest first)
    return filtered.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
  }, [incidents, selectedSeverity, selectedIncidentType]);

  // Update table incidents when filtered incidents change
  useEffect(() => {
    setTableIncidents(filteredIncidents);
    setPage(1);
  }, [filteredIncidents]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredIncidents.length / pageSize));
    setPage((prev) => Math.min(prev, maxPage));
  }, [filteredIncidents]);

  const formatDate = (value) => {
    if (!value) return "N/A";
    // Handle Firestore Timestamp
    if (value.toDate && typeof value.toDate === 'function') {
      return value.toDate().toLocaleString();
    }
    // Handle Firestore Timestamp-like object with seconds
    if (value.seconds && typeof value.seconds === 'number') {
      return new Date(value.seconds * 1000).toLocaleString();
    }
    // Handle ISO string or other date formats
    try {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleString();
      }
    } catch (e) {
      // Fall through to return string representation
    }
    return String(value);
  };

  return (
    <div className="page">
      <section className="summary-grid">
        <div className="summary-card">
          <p className="label">Active incidents</p>
          <p className="value">{incidents.length}</p>
          <p className="muted">Streaming from Firestore</p>
        </div>
        <div className="summary-card">
          <p className="label">Critical</p>
          <p className="value warning">
            {incidents.filter((i) => i.severity === "Critical" || i.severity === 1 || i.severity === "1").length}
          </p>
          <p className="muted">Immediate attention</p>
        </div>
        <div className="summary-card">
          <p className="label">Teams dispatched</p>
          <p className="value">
            {dispatchedTeams.length}
          </p>
          <p className="muted">Across active responses</p>
        </div>
        <div className="summary-card">
          <p className="label">Resolved today</p>
          <p className="value success">{resolvedIncidents.length}</p>
          <p className="muted">Cases completed</p>
        </div>
      </section>

      <section className="content">
        <div className="panel list-panel">
          <div className="panel-header">
            <div>
              <p className="label">Real-time list</p>
              <h2>Incoming reports</h2>
            </div>
            <span className="badge neutral">Auto-refresh</span>
          </div>

          {/* Filter Controls */}
          <div className="dashboard-filters">
            <div className="filter-group">
              <label className="filter-label" htmlFor="severity-filter">
                Filter by Severity:
              </label>
              <select
                id="severity-filter"
                className="filter-dropdown"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            {incidentTypes.length > 0 && (
              <div className="filter-group">
                <label className="filter-label" htmlFor="type-filter">
                  Filter by Type:
                </label>
                <select
                  id="type-filter"
                  className="filter-dropdown"
                  value={selectedIncidentType}
                  onChange={(e) => setSelectedIncidentType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  {incidentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="incidents-table" role="table" aria-label="Incoming reports">
            <div className="table-head" role="row">
              <span>Incident Type</span>
              <span>Severity</span>
              <span>Responder</span>
              <span>Latitude</span>
              <span>Longitude</span>
              <span>Received Time</span>
              <span>Requested Time</span>
              <span>Photo</span>
              <span>Map</span>
            </div>
            <div className="table-body">
              {loading ? (
                <div className="empty-state">
                  <p>Loading incidents...</p>
                </div>
              ) : error ? (
                <div className="empty-state">
                  <p style={{ color: "#ff6b83" }}>Error: {error}</p>
                </div>
              ) : filteredIncidents.length === 0 ? (
                <div className="empty-state">
                  <p>
                    {selectedSeverity !== "all" || selectedIncidentType !== "all"
                      ? "No incidents match the selected filters."
                      : "No incidents reported yet."}
                  </p>
                </div>
              ) : (
                filteredIncidents
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((incident) => {
                    const duplicates = findDuplicateCoordinates(incidents, incident);
                    const hasDuplicates = duplicates.length > 0;
                    
                    return (
                      <div
                      key={incident.id}
                      className={`table-row ${selectedId === incident.id ? "selected" : ""} ${hasDuplicates ? "duplicate-location" : ""}`}
                      role="row"
                      onClick={() => {
                        if (hasDuplicates) {
                          setDuplicateWarning({ incident, duplicates });
                        } else {
                          setSelectedId((prev) => (prev === incident.id ? null : incident.id));
                        }
                      }}
                    >
                    <span>
                      {incident.incidentType || "N/A"}
                      {hasDuplicates && (
                        <span className="duplicate-warning-icon" title="Duplicate location detected">
                          ⚠️
                        </span>
                      )}
                    </span>
                    <span className={severityClass(incident.severity)}>
                      {severityLabel(incident.severity)}
                    </span>
                    <span className="responder-name-cell">
                      {getResponderName(incident.userId)}
                    </span>
                    <span>
                      {incident.latitude != null ? Number(incident.latitude).toFixed(6) : "N/A"}
                    </span>
                    <span>
                      {incident.longitude != null ? Number(incident.longitude).toFixed(6) : "N/A"}
                    </span>
                    <span>{formatDate(incident.createdAt)}</span>
                    <span>{formatDate(incident.timestamp)}</span>
                    <span>
                      {incident.photo ? (
                        <button
                          className="map-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoIncident(incident);
                          }}
                        >
                          Photo
                        </button>
                      ) : (
                        "No"
                      )}
                    </span>
                    <span>
                      <button
                        className="map-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMapIncident(incident);
                        }}
                      >
                        View
                      </button>
                    </span>
                      </div>
                    );
                  })
              )}
            </div>
            {filteredIncidents.length > 0 && (
              <div className="table-footer">
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Prev
                  </button>
                  <span className="page-info">
                    Page {page} of {Math.max(1, Math.ceil(filteredIncidents.length / pageSize))}
                  </span>
                  <button
                    className="page-btn"
                    onClick={() =>
                      setPage((p) =>
                        Math.min(Math.max(1, Math.ceil(filteredIncidents.length / pageSize)), p + 1)
                      )
                    }
                    disabled={page >= Math.ceil(filteredIncidents.length / pageSize)}
                  >
                    Next
                  </button>
                </div>
                <div className="rows-info">
                  Showing {(page - 1) * pageSize + 1}-
                  {Math.min(page * pageSize, filteredIncidents.length)} of {filteredIncidents.length}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {mapIncident && (
        <div className="map-modal" role="dialog" aria-modal="true">
          <div className="map-modal-content">
            <div className="map-modal-header">
              <div>
                <p className="label">Incident location</p>
                <h3>
                  {mapIncident.incidentType || "Incident"} • {mapIncident.id || "No ID"}
                </h3>
                <p className="muted small">
                  Lat: {mapIncident.latitude ?? "N/A"}, Lng: {mapIncident.longitude ?? "N/A"}
                </p>
              </div>
              <button className="close-btn" onClick={() => setMapIncident(null)}>
                Close
              </button>
            </div>
            <div className="map-modal-body">
              {mapIncident.latitude != null && mapIncident.longitude != null ? (
                <MapContainer
                  center={[mapIncident.latitude, mapIncident.longitude]}
                  zoom={10}
                  scrollWheelZoom
                  className="leaflet-shell"
                  key={mapIncident.id}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    tileSize={256}
                  />
                  <Marker position={[mapIncident.latitude, mapIncident.longitude]} icon={pinIcon}>
                    <Popup>
                      <div className="pin-popup">
                        <p className="pin-type">{mapIncident.incidentType}</p>
                        <p className="pin-meta">{mapIncident.location}</p>
                        <p className="pin-status">Severity: {mapIncident.severity ?? "N/A"}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="map-error-message">
                  <p>Coordinates not available for this incident.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {photoIncident && (
        <div className="map-modal" role="dialog" aria-modal="true">
          <div className="map-modal-content">
            <div className="map-modal-header">
              <div>
                <p className="label">Incident photo</p>
                <h3>
                  {photoIncident.incidentType || "Incident"} • {photoIncident.id || "No ID"}
                </h3>
                <p className="muted small">{formatDate(photoIncident.createdAt)}</p>
              </div>
              <button className="close-btn" onClick={() => setPhotoIncident(null)}>
                Close
              </button>
            </div>
            <div className="map-modal-body photo-body">
              {photoIncident.photo ? (
                <img
                  src={photoIncident.photo}
                  alt={photoIncident.incidentType || "Incident photo"}
                  className="incident-photo-img"
                />
              ) : (
                <div className="map-error-message">
                  <p>No photo available for this incident.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Location Warning Modal */}
      {duplicateWarning && (
        <div className="warning-modal" role="dialog" aria-modal="true" onClick={() => setDuplicateWarning(null)}>
          <div className="warning-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="warning-modal-header">
              <div>
                <span className="warning-icon-large">⚠️</span>
                <h3>Duplicate Location Detected</h3>
              </div>
              <button className="close-btn" onClick={() => setDuplicateWarning(null)}>
                Close
              </button>
            </div>
            <div className="warning-modal-body">
              <p className="warning-message">
                This location has already been reported to the system.
              </p>
              <div className="warning-details">
                <p><strong>Current Incident:</strong></p>
                <ul>
                  <li>ID: {duplicateWarning.incident.id || "N/A"}</li>
                  <li>Type: {duplicateWarning.incident.incidentType || "N/A"}</li>
                  <li>Severity: {severityLabel(duplicateWarning.incident.severity)}</li>
                  <li>
                    Coordinates: {Number(duplicateWarning.incident.latitude).toFixed(6)}, {Number(duplicateWarning.incident.longitude).toFixed(6)}
                  </li>
                </ul>
                <p><strong>Other Reports at This Location ({duplicateWarning.duplicates.length}):</strong></p>
                <ul className="duplicate-list">
                  {duplicateWarning.duplicates.map((dup, idx) => (
                    <li key={dup.id || idx}>
                      ID: {dup.id || "N/A"} | Type: {dup.incidentType || "N/A"} | Severity: {severityLabel(dup.severity)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="warning-modal-footer">
              <button className="close-btn" onClick={() => setDuplicateWarning(null)}>
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

