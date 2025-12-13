import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./dashboard.css";

function severityClass(level) {
  return `pill severity-${level.toLowerCase()}`;
}

const pinIcon = L.divIcon({
  className: "pin-icon medium",
  html: '<div class="pin-bullet"></div>',
  iconSize: [24, 24],
});

function Dashboard({ liveIncidents, historyItems }) {
  const [tableIncidents, setTableIncidents] = useState(liveIncidents);
  const [selectedId, setSelectedId] = useState(null);
  const [mapIncident, setMapIncident] = useState(null);

  // Keep table in sync with upstream incidents.
  useEffect(() => {
    setTableIncidents(liveIncidents);
  }, [liveIncidents]);

  // Auto-refresh/rotate incoming reports every 2 minutes.
  useEffect(() => {
    const interval = setInterval(() => {
      setTableIncidents((prev) => {
        if (!prev.length) return prev;
        const [first, ...rest] = prev;
        return [...rest, { ...first, updated: "Just now" }];
      });
    }, 120_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <section className="summary-grid">
        <div className="summary-card">
          <p className="label">Active incidents</p>
          <p className="value">{liveIncidents.length}</p>
          <p className="muted">Updating every few seconds</p>
        </div>
        <div className="summary-card">
          <p className="label">Critical</p>
          <p className="value warning">
            {liveIncidents.filter((i) => i.severity === "Critical").length}
          </p>
          <p className="muted">Immediate attention</p>
        </div>
        <div className="summary-card">
          <p className="label">Teams dispatched</p>
          <p className="value">
            {liveIncidents.reduce((acc, i) => acc + i.dispatched.length, 0)}
          </p>
          <p className="muted">Across active responses</p>
        </div>
        <div className="summary-card">
          <p className="label">Resolved today</p>
          <p className="value success">{historyItems.length}</p>
          <p className="muted">Closed in the last shift</p>
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
          <div className="table">
            <div className="table-head">
              <span>ID</span>
              <span>Type</span>
              <span>Severity</span>
              <span>Status</span>
              <span>Location</span>
              <span>Dispatched</span>
              <span>Updated</span>
              <span>Map</span>
            </div>
            <div className="table-body">
              {tableIncidents.map((incident) => {
                const isSelected = incident.id === selectedId;
                return (
                  <div
                    key={incident.id}
                    className={`table-row${isSelected ? " selected" : ""}`}
                    onClick={() =>
                      setSelectedId((prev) => (prev === incident.id ? null : incident.id))
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId((prev) => (prev === incident.id ? null : incident.id));
                      }
                    }}
                  >
                  <span className="mono">{incident.id}</span>
                  <span>{incident.type}</span>
                  <span className={severityClass(incident.severity)}>{incident.severity}</span>
                  <span>{incident.status}</span>
                  <span>{incident.location}</span>
                  <span className="mono small">{incident.dispatched.join(" • ")}</span>
                  <span>{incident.updated}</span>
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
              })}
            </div>
          </div>
        </div>
      </section>

      {mapIncident && (
        <div className="map-modal">
          <div className="map-modal-content">
            <div className="map-modal-header">
              <div>
                <p className="label">Incident location</p>
                <h3>{mapIncident.id} • {mapIncident.type}</h3>
                <p className="muted small">
                  {mapIncident.location} | Lat: {mapIncident.lat}, Lng: {mapIncident.lng}
                </p>
              </div>
              <button className="close-btn" onClick={() => setMapIncident(null)}>
                Close
              </button>
            </div>
            <div className="map-modal-body">
              <MapContainer
                center={[mapIncident.lat, mapIncident.lng]}
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
                <Marker position={[mapIncident.lat, mapIncident.lng]} icon={pinIcon}>
                  <Popup>
                    <div className="pin-popup">
                      <p className="pin-type">{mapIncident.type}</p>
                      <p className="pin-meta">{mapIncident.location}</p>
                      <p className="pin-status">{mapIncident.status}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

