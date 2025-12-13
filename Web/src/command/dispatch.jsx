import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./dashboard.css";
import { subscribeToIncidents } from "../firebase";

const toMillis = (value) => {
  if (!value) return 0;
  if (value.toDate) return value.toDate().getTime();
  if (value.seconds) return value.seconds * 1000;
  if (typeof value === "number") return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const formatDate = (value) => {
  if (!value) return "N/A";
  if (value.toDate) {
    return value.toDate().toLocaleString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString();
};

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

function Dispatch({ dispatchedTeams = [], setDispatchedTeams }) {
  const [incidents, setIncidents] = useState([]);
  const [dispatchState, setDispatchState] = useState({});
  const [mapIncident, setMapIncident] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToIncidents((data) => {
      const sorted = [...data].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
      setIncidents(sorted);
    });
    return () => unsubscribe();
  }, []);

  // Sync dispatch state with dispatchedTeams array
  useEffect(() => {
    if (dispatchedTeams && dispatchedTeams.length > 0) {
      setDispatchState((prev) => {
        const updated = { ...prev };
        dispatchedTeams.forEach((team) => {
          updated[team.incidentId] = {
            status: "Dispatched",
            at: team.dispatchedAt,
          };
        });
        return updated;
      });
    }
  }, [dispatchedTeams]);

  const handleDispatch = (incidentId) => {
    // Find the incident being dispatched
    const incident = incidents.find((inc) => inc.id === incidentId);
    
    if (incident) {
      // Update local dispatch state
      setDispatchState((prev) => ({
        ...prev,
        [incidentId]: {
          status: "Dispatched",
          at: new Date().toISOString(),
        },
      }));

      // Add to dispatched teams array (if not already dispatched)
      if (setDispatchedTeams) {
        setDispatchedTeams((prev) => {
          // Check if this incident is already in the array
          const alreadyDispatched = prev.some((team) => team.incidentId === incidentId);
          if (alreadyDispatched) {
            return prev; // Don't add duplicates
          }
          
          // Add new dispatched team object
          return [
            ...prev,
            {
              incidentId: incidentId,
              incidentType: incident.incidentType || "Unknown",
              severity: incident.severity,
              latitude: incident.latitude,
              longitude: incident.longitude,
              dispatchedAt: new Date().toISOString(),
              incident: incident, // Store full incident object
            },
          ];
        });
      }
    }
  };

  const statusLabel = (incidentId) =>
    dispatchState[incidentId]?.status || "Not dispatched";

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="label">Dispatch</p>
          <h2>Dispatch incoming reports</h2>
        </div>
        <span className="badge">Live Firestore feed</span>
      </div>

      <div className="dispatch-table" role="table" aria-label="Dispatch table">
        <div className="table-head" role="row">
          <span>incidentType</span>
          <span>severity</span>
          <span>Location</span>
          <span>Map</span>
          <span>Received Time</span>
          <span>Dispatch Status</span>
          <span>Dispatch</span>
        </div>

        <div className="table-body">
          {incidents.length === 0 ? (
            <div className="empty-state">
              <p>No incidents reported yet.</p>
            </div>
          ) : (
            incidents.map((incident) => {
              const dispatched = statusLabel(incident.id) === "Dispatched";
              return (
                <div key={incident.id} className="table-row" role="row">
                  <span>{incident.incidentType || "N/A"}</span>
                  <span>{incident.severity ?? "N/A"}</span>
                  <span>
                    {incident.latitude != null && incident.longitude != null
                      ? `${Number(incident.latitude).toFixed(6)}, ${Number(incident.longitude).toFixed(6)}`
                      : "N/A"}
                  </span>
                  <span>
                    {incident.latitude != null && incident.longitude != null ? (
                      <button
                        className="map-btn"
                        onClick={() => setMapIncident(incident)}
                        aria-label="View incident on map"
                      >
                        View
                      </button>
                    ) : (
                      "N/A"
                    )}
                  </span>
                  <span>{formatDate(incident.createdAt)}</span>
                  <span>
                    <span className={`status-pill ${dispatched ? "status-live" : "status-idle"}`}>
                      {dispatched ? "Dispatched" : "Not dispatched"}
                    </span>
                  </span>
                  <span>
                    <button
                      className="dispatch-btn"
                      disabled={dispatched}
                      onClick={() => handleDispatch(incident.id)}
                    >
                      {dispatched ? "Sent" : "Dispatch"}
                    </button>
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

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
                  <Marker
                    position={[mapIncident.latitude, mapIncident.longitude]}
                    icon={pinIcon}
                  >
                    <Popup>
                      <div className="pin-popup">
                        <p className="pin-type">{mapIncident.incidentType}</p>
                        <p className="pin-status">Severity: {mapIncident.severity ?? "N/A"}</p>
                        <p className="muted small">Time: {formatDate(mapIncident.createdAt)}</p>
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
    </section>
  );
}

export default Dispatch;

