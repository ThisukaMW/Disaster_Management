import "./dashboard.css";

const zones = [
  {
    name: "Western",
    command: "Colombo Ops",
    contact: "011-555-0101",
    humans: { strikeTeams: 12, medics: 8, engineers: 5, volunteers: 54 },
    resources: [
      { label: "Ambulances", available: 6, total: 8 },
      { label: "Rescue boats", available: 3, total: 4 },
      { label: "4x4 trucks", available: 10, total: 12 },
      { label: "Generators", available: 14, total: 18 },
    ],
  },
  {
    name: "Southern",
    command: "Galle Ops",
    contact: "091-555-0144",
    humans: { strikeTeams: 9, medics: 6, engineers: 4, volunteers: 38 },
    resources: [
      { label: "Ambulances", available: 4, total: 6 },
      { label: "Rescue boats", available: 5, total: 6 },
      { label: "4x4 trucks", available: 8, total: 10 },
      { label: "Generators", available: 9, total: 12 },
    ],
  },
  {
    name: "Central",
    command: "Kandy Ops",
    contact: "081-555-0110",
    humans: { strikeTeams: 7, medics: 5, engineers: 3, volunteers: 30 },
    resources: [
      { label: "Ambulances", available: 3, total: 5 },
      { label: "Rescue boats", available: 2, total: 3 },
      { label: "4x4 trucks", available: 7, total: 9 },
      { label: "Generators", available: 8, total: 10 },
    ],
  },
  {
    name: "Eastern",
    command: "Trinco Ops",
    contact: "026-555-0185",
    humans: { strikeTeams: 6, medics: 4, engineers: 3, volunteers: 28 },
    resources: [
      { label: "Ambulances", available: 3, total: 4 },
      { label: "Rescue boats", available: 4, total: 5 },
      { label: "4x4 trucks", available: 6, total: 8 },
      { label: "Generators", available: 6, total: 9 },
    ],
  },
];

const sumTotals = zones.reduce(
  (acc, z) => {
    acc.strikeTeams += z.humans.strikeTeams;
    acc.medics += z.humans.medics;
    acc.engineers += z.humans.engineers;
    acc.volunteers += z.humans.volunteers;
    return acc;
  },
  { strikeTeams: 0, medics: 0, engineers: 0, volunteers: 0 }
);

const pill = (label, value, tone = "neutral") => (
  <span
    className="pill"
    style={{
      background:
        tone === "neutral"
          ? "rgba(126,159,255,0.12)"
          : tone === "good"
          ? "rgba(75,227,197,0.16)"
          : "rgba(255,92,115,0.16)",
      color: tone === "warn" ? "#ff6b83" : tone === "good" ? "#4be3c5" : "#cfe0ff",
      border: "1px solid rgba(255,255,255,0.08)",
      marginRight: "8px",
    }}
  >
    {label}: {value}
  </span>
);

function Logistics() {
  return (
    <div className="page">
      <section className="summary-grid">
        <div className="summary-card">
          <p className="label">Strike Teams</p>
          <p className="value">{sumTotals.strikeTeams}</p>
          <p className="muted">Across all zones</p>
        </div>
        <div className="summary-card">
          <p className="label">Medics</p>
          <p className="value">{sumTotals.medics}</p>
          <p className="muted">Field-ready staff</p>
        </div>
        <div className="summary-card">
          <p className="label">Engineers</p>
          <p className="value">{sumTotals.engineers}</p>
          <p className="muted">Infra & utilities</p>
        </div>
        <div className="summary-card">
          <p className="label">Volunteers</p>
          <p className="value">{sumTotals.volunteers}</p>
          <p className="muted">Community support</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="label">Logistics</p>
            <h2>Available forces & resources by zone</h2>
          </div>
          <span className="badge neutral">Updated live on shift change</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1rem",
          }}
        >
          {zones.map((zone) => (
            <div key={zone.name} className="panel" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                <div>
                  <p className="label">{zone.command}</p>
                  <h3 style={{ margin: "0.1rem 0", color: "#eaf2ff" }}>{zone.name} Zone</h3>
                  <p className="muted">Contact: {zone.contact}</p>
                </div>
                <span className="status-pill status-live">Ready</span>
              </div>

              <div style={{ margin: "0.6rem 0" }}>
                {pill("Strike teams", zone.humans.strikeTeams, "good")}
                {pill("Medics", zone.humans.medics, "good")}
                {pill("Engineers", zone.humans.engineers, "neutral")}
                {pill("Volunteers", zone.humans.volunteers, "neutral")}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {zone.resources.map((res) => {
                  const pct = Math.round((res.available / res.total) * 100);
                  const tone = pct >= 70 ? "#4be3c5" : pct >= 40 ? "#f6a934" : "#ff6b83";
                  return (
                    <div key={res.label} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <div style={{ minWidth: 130, color: "#cfe0ff", fontWeight: 700 }}>{res.label}</div>
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, height: 10, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            background: tone,
                            height: "100%",
                            transition: "width 0.2s ease",
                          }}
                        />
                      </div>
                      <div style={{ color: "#9bb0d3", minWidth: 70, textAlign: "right" }}>
                        {res.available}/{res.total}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Logistics;

