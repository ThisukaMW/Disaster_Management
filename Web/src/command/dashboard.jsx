import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./dashboard.css";
import { subscribeToIncidents } from "../firebase";

function severityClass(level) {
  return `pill severity-${String(level).toLowerCase()}`;
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

function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [tableIncidents, setTableIncidents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mapIncident, setMapIncident] = useState(null);
  const [photoIncident, setPhotoIncident] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const toMillis = (value) => {
    if (!value) return 0;
    if (value.toDate) return value.toDate().getTime();
    if (value.seconds) return value.seconds * 1000;
    if (typeof value === "number") return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  };

  useEffect(() => {
    const unsubscribe = subscribeToIncidents((data) => {
      const sorted = [...data].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      setIncidents(sorted);
      setTableIncidents(sorted);
      setPage(1);
    });
    return () => unsubscribe();
  }, []);

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

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(tableIncidents.length / pageSize));
    setPage((prev) => Math.min(prev, maxPage));
  }, [tableIncidents]);

  const formatDate = (value) => {
    if (!value) return "N/A";
    if (value.toDate) {
      return value.toDate().toLocaleString();
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString();
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
            {incidents.filter((i) => i.severity === "Critical" || i.severity === 1).length}
          </p>
          <p className="muted">Immediate attention</p>
        </div>
        <div className="summary-card">
          <p className="label">Teams dispatched</p>
          <p className="value">
            {incidents.reduce((acc, i) => acc + (i.dispatched ? i.dispatched.length : 0), 0)}
          </p>
          <p className="muted">Across active responses</p>
        </div>
        <div className="summary-card">
          <p className="label">Resolved today</p>
          <p className="value success">—</p>
          <p className="muted">Coming soon</p>
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

          <div className="incidents-table" role="table" aria-label="Incoming reports">
            <div className="table-head" role="row">
              <span>incidentType</span>
              <span>severity</span>
              <span>latitude</span>
              <span>longitude</span>
              <span>Recieved Time</span>
              <span>Requested Time</span>
              <span>photo Time</span>
              <span>map</span>
              
            </div>
            <div className="table-body">
              {tableIncidents.length === 0 ? (
                <div className="empty-state">
                  <p>No incidents reported yet.</p>
                </div>
              ) : (
                tableIncidents
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((incident) => (
                  <div
                    key={incident.id}
                    className={`table-row ${selectedId === incident.id ? "selected" : ""}`}
                    role="row"
                    onClick={() =>
                      setSelectedId((prev) => (prev === incident.id ? null : incident.id))
                    }
                  >
                    <span>{incident.incidentType || "N/A"}</span>
                    <span className="severity-pill">{incident.severity ?? "N/A"}</span>
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
                ))
              )}
            </div>
            {tableIncidents.length > 0 && (
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
                    Page {page} of {Math.max(1, Math.ceil(tableIncidents.length / pageSize))}
                  </span>
                  <button
                    className="page-btn"
                    onClick={() =>
                      setPage((p) =>
                        Math.min(Math.max(1, Math.ceil(tableIncidents.length / pageSize)), p + 1)
                      )
                    }
                    disabled={page >= Math.ceil(tableIncidents.length / pageSize)}
                  >
                    Next
                  </button>
                </div>
                <div className="rows-info">
                  Showing {(page - 1) * pageSize + 1}-
                  {Math.min(page * pageSize, tableIncidents.length)} of {tableIncidents.length}
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
    </div>
  );
}

export default Dashboard;

