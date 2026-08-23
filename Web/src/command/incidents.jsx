import { useEffect, useState, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./incidents.css";
import { subscribeToIncidents } from "../firebase";

// Helper functions for severity
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

function severityLabel(level) {
  if (typeof level === 'number') {
    const severityMap = { 1: 'Critical', 2: 'High', 3: 'Medium', 4: 'Low', 5: 'Minimal' };
    return severityMap[level] || `Level ${level}`;
  }
  return String(level);
}

// Create different colored pin icons for each severity level
const createPinIcon = (severity) => {
  const level = getSeverityLevel(severity);
  let color, shadowColor;
  
  switch (level) {
    case 1: // Critical
      color = '#ff5c73';
      shadowColor = 'rgba(255, 92, 115, 0.4)';
      break;
    case 2: // High
      color = '#f6a934';
      shadowColor = 'rgba(246, 169, 52, 0.4)';
      break;
    case 3: // Medium
      color = '#4be3c5';
      shadowColor = 'rgba(75, 227, 197, 0.4)';
      break;
    case 4: // Low
      color = '#96b3ff';
      shadowColor = 'rgba(150, 179, 255, 0.4)';
      break;
    case 5: // Minimal
      color = '#9ca3af';
      shadowColor = 'rgba(156, 163, 175, 0.4)';
      break;
    default:
      color = '#4be3c5';
      shadowColor = 'rgba(75, 227, 197, 0.4)';
  }

  const pinSvg = encodeURIComponent(`
    <svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pinGradient-${level}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}"/>
          <stop offset="100%" stop-color="${color}dd"/>
        </linearGradient>
      </defs>
      <path d="M17 0C8 0 1 7.4 1 16.5C1 26.8 17 44 17 44C17 44 33 26.8 33 16.5C33 7.4 26 0 17 0Z" fill="url(#pinGradient-${level})"/>
      <circle cx="17" cy="16" r="6" fill="white" fill-opacity="0.9"/>
    </svg>
  `);

  return L.icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${pinSvg}`,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -40],
    className: `custom-pin severity-${level}`,
  });
};

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([7.8731, 80.7718]); // Center of Sri Lanka
  const [mapZoom, setMapZoom] = useState(7);
  const [selectedSeverity, setSelectedSeverity] = useState("all"); // "all", "low", "medium", "critical"
  const [selectedIncidentType, setSelectedIncidentType] = useState("all");
  const [sortBySeverity, setSortBySeverity] = useState(true); // Sort by severity high to low

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

  // Format date helper
  const formatDate = (value) => {
    if (!value) return "N/A";
    if (value.toDate && typeof value.toDate === 'function') {
      return value.toDate().toLocaleString();
    }
    if (value.seconds && typeof value.seconds === 'number') {
      return new Date(value.seconds * 1000).toLocaleString();
    }
    try {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleString();
      }
    } catch (e) {
      // Fall through
    }
    return String(value);
  };

  // Subscribe to real-time incidents
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToIncidents((data) => {
      setIncidents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sort incidents by severity (high to low: Critical first, then High, Medium, Low, Minimal)
  const sortedIncidents = useMemo(() => {
    if (!sortBySeverity) {
      return [...incidents]; // Return unsorted if sort is disabled
    }
    return [...incidents].sort((a, b) => {
      const severityA = getSeverityLevel(a.severity);
      const severityB = getSeverityLevel(b.severity);
      return severityA - severityB; // Lower number = higher priority (1=Critical)
    });
  }, [incidents, sortBySeverity]);

  // Group incidents by severity for the legend
  const incidentsBySeverity = useMemo(() => {
    return {
      critical: sortedIncidents.filter((inc) => getSeverityLevel(inc.severity) === 1),
      high: sortedIncidents.filter((inc) => getSeverityLevel(inc.severity) === 2),
      medium: sortedIncidents.filter((inc) => getSeverityLevel(inc.severity) === 3),
      low: sortedIncidents.filter((inc) => getSeverityLevel(inc.severity) === 4),
      minimal: sortedIncidents.filter((inc) => getSeverityLevel(inc.severity) === 5),
    };
  }, [sortedIncidents]);

  // Filter incidents by selected severity, type, and valid coordinates
  const filteredIncidents = useMemo(() => {
    let filtered = sortedIncidents;
    
    // Filter by severity if not "all"
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

    // Filter by incident type if not "all"
    if (selectedIncidentType !== "all") {
      filtered = filtered.filter((inc) => inc.incidentType === selectedIncidentType);
    }
    
    // Filter to only include incidents with valid coordinates
    return filtered.filter((inc) => inc.latitude != null && inc.longitude != null);
  }, [sortedIncidents, selectedSeverity, selectedIncidentType]);

  // Update map center when filtered incidents change
  useEffect(() => {
    if (filteredIncidents.length > 0) {
      const lats = filteredIncidents.map((inc) => Number(inc.latitude));
      const lngs = filteredIncidents.map((inc) => Number(inc.longitude));
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      setMapCenter([centerLat, centerLng]);
    }
  }, [filteredIncidents]);

  return (
    <div className="incidents-page">
      <div className="incidents-header">
        <div>
          <p className="label">Real-time incident map</p>
          <h1>Incidents by Severity</h1>
          <p className="muted">
            {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} on map
            {selectedSeverity !== "all" && ` (${selectedSeverity} severity)`}
            {loading && ' • Loading...'}
          </p>
        </div>
        <div className="incidents-controls">
          <div className="severity-filter">
            <label className="filter-label">Filter by Severity:</label>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${selectedSeverity === "all" ? "active" : ""}`}
                onClick={() => setSelectedSeverity("all")}
              >
                All
              </button>
              <button
                className={`filter-btn ${selectedSeverity === "critical" ? "active critical" : ""}`}
                onClick={() => setSelectedSeverity("critical")}
              >
                Critical
              </button>
              <button
                className={`filter-btn ${selectedSeverity === "high" ? "active high" : ""}`}
                onClick={() => setSelectedSeverity("high")}
              >
                High
              </button>
              <button
                className={`filter-btn ${selectedSeverity === "medium" ? "active medium" : ""}`}
                onClick={() => setSelectedSeverity("medium")}
              >
                Medium
              </button>
              <button
                className={`filter-btn ${selectedSeverity === "low" ? "active low" : ""}`}
                onClick={() => setSelectedSeverity("low")}
              >
                Low
              </button>
              <button
                className={`filter-btn ${selectedSeverity === "minimal" ? "active minimal" : ""}`}
                onClick={() => setSelectedSeverity("minimal")}
              >
                Minimal
              </button>
            </div>
          </div>
          <div className="severity-legend">
            <div className="legend-item">
              <div className="legend-marker critical"></div>
              <span>Critical ({incidentsBySeverity.critical.length})</span>
            </div>
            <div className="legend-item">
              <div className="legend-marker high"></div>
              <span>High ({incidentsBySeverity.high.length})</span>
            </div>
            <div className="legend-item">
              <div className="legend-marker medium"></div>
              <span>Medium ({incidentsBySeverity.medium.length})</span>
            </div>
            <div className="legend-item">
              <div className="legend-marker low"></div>
              <span>Low ({incidentsBySeverity.low.length})</span>
            </div>
            <div className="legend-item">
              <div className="legend-marker minimal"></div>
              <span>Minimal ({incidentsBySeverity.minimal.length})</span>
            </div>
          </div>
          <div className="filter-type-group">
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
          <div className="sort-control">
            <button
              className={`sort-btn ${sortBySeverity ? "active" : ""}`}
              onClick={() => setSortBySeverity(!sortBySeverity)}
              title="Sort by severity (High to Low)"
            >
              {sortBySeverity ? "✓ Sort by Severity" : "Sort by Severity"}
            </button>
          </div>
        </div>
      </div>

      <div className="incidents-map-container">
        {loading && incidents.length === 0 ? (
          <div className="map-loading">
            <p>Loading incidents map...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="map-empty">
            <p>
              {selectedSeverity !== "all"
                ? `No ${selectedSeverity} severity incidents with valid coordinates found.`
                : "No incidents with valid coordinates found."}
            </p>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            className="incidents-map"
            key={`map-${filteredIncidents.length}-${selectedSeverity}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              tileSize={256}
            />
            {filteredIncidents.map((incident) => (
              <Marker
                key={incident.id}
                position={[Number(incident.latitude), Number(incident.longitude)]}
                icon={createPinIcon(incident.severity)}
              >
                <Popup>
                  <div className="incident-popup">
                    <div className="popup-header">
                      <h3>{incident.incidentType || "Incident"}</h3>
                      <span className={`severity-badge severity-${getSeverityLevel(incident.severity)}`}>
                        {severityLabel(incident.severity)}
                      </span>
                    </div>
                    <div className="popup-body">
                      <p className="popup-field">
                        <strong>ID:</strong> {incident.id || "N/A"}
                      </p>
                      <p className="popup-field">
                        <strong>Location:</strong> {incident.location || `${incident.latitude?.toFixed(6)}, ${incident.longitude?.toFixed(6)}`}
                      </p>
                      <p className="popup-field">
                        <strong>Coordinates:</strong> {Number(incident.latitude).toFixed(6)}, {Number(incident.longitude).toFixed(6)}
                      </p>
                      <p className="popup-field">
                        <strong>Received:</strong> {formatDate(incident.createdAt)}
                      </p>
                      {incident.timestamp && (
                        <p className="popup-field">
                          <strong>Requested:</strong> {formatDate(incident.timestamp)}
                        </p>
                      )}
                      {incident.userId && (
                        <p className="popup-field small">
                          <strong>User ID:</strong> {incident.userId.substring(0, 8)}...
                        </p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Incident list sidebar */}
      <div className="incidents-list-panel">
        <div className="panel-header">
          <p className="label">Sorted by severity</p>
          <h2>All Incidents</h2>
        </div>
        <div className="incidents-list">
          {filteredIncidents.length === 0 ? (
            <div className="empty-state">
              <p>
                {selectedSeverity !== "all"
                  ? `No ${selectedSeverity} severity incidents found.`
                  : "No incidents reported yet."}
              </p>
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <div
                key={incident.id}
                className={`incident-list-item severity-${getSeverityLevel(incident.severity)}`}
              >
                <div className="item-marker"></div>
                <div className="item-content">
                  <div className="item-header">
                    <h4>{incident.incidentType || "Unknown Incident"}</h4>
                    <span className={`severity-pill severity-${getSeverityLevel(incident.severity)}`}>
                      {severityLabel(incident.severity)}
                    </span>
                  </div>
                  <p className="item-id">ID: {incident.id}</p>
                  {incident.latitude != null && incident.longitude != null ? (
                    <p className="item-coords">
                      {Number(incident.latitude).toFixed(4)}, {Number(incident.longitude).toFixed(4)}
                    </p>
                  ) : (
                    <p className="item-coords muted">No coordinates</p>
                  )}
                  <p className="item-time">{formatDate(incident.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Incidents;
