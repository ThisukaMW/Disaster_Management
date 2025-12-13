import { useMemo, useState } from "react";
import Dashboard from "./command/dashboard.jsx";
import History from "./command/history.jsx";
import "./App.css";

function App() {
  const incidentsSeed = useMemo(
    () => [
      {
        id: "INC-5010",
        type: "Flood",
        severity: "High",
        status: "Evacuation in progress",
        location: "Colombo | 6.9271°N, 79.8612°E",
        lat: 6.9271,
        lng: 79.8612,
        dispatched: ["Rescue Boat Alpha", "Medical Team 3"],
        updated: "2 min ago",
      },
      {
        id: "INC-5012",
        type: "Wildfire",
        severity: "Critical",
        status: "Aerial support active",
        location: "Kandy | 7.2906°N, 80.6337°E",
        lat: 7.2906,
        lng: 80.6337,
        dispatched: ["Fire Crew 12", "Air Support 1"],
        updated: "4 min ago",
      },
      {
        id: "INC-5015",
        type: "Landslide",
        severity: "Medium",
        status: "Assessment under way",
        location: "Galle | 6.0535°N, 80.2210°E",
        lat: 6.0535,
        lng: 80.221,
        dispatched: ["Geo Survey", "Local Police"],
        updated: "7 min ago",
      },
      {
        id: "INC-5018",
        type: "Storm Surge",
        severity: "High",
        status: "Rescue teams mobilized",
        location: "Trincomalee | 8.5874°N, 81.2152°E",
        lat: 8.5874,
        lng: 81.2152,
        dispatched: ["Rescue Boat Delta", "Coast Guard"],
        updated: "11 min ago",
      },
      {
        id: "INC-5020",
        type: "Earthquake",
        severity: "Critical",
        status: "Medical triage",
        location: "Batticaloa | 7.7167°N, 81.7000°E",
        lat: 7.7167,
        lng: 81.7,
        dispatched: ["Medical Team 1", "Urban SAR"],
        updated: "15 min ago",
      },
    ],
    []
  );

  const [liveIncidents] = useState(() => incidentsSeed);
  const [historyItems] = useState(() => [
    { id: "INC-4990", type: "Flood", result: "Contained", time: "Today 08:10" },
    { id: "INC-4992", type: "Wildfire", result: "Ongoing patrol", time: "Today 07:45" },
    { id: "INC-4995", type: "Landslide", result: "Cleared", time: "Today 06:50" },
    { id: "INC-4997", type: "Storm Surge", result: "Evac complete", time: "Today 06:05" },
  ]);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">Command HQ</div>
        <nav>
          <a className="nav-item active">Dashboard</a>
          <a className="nav-item">Incidents</a>
          <a className="nav-item">Dispatch</a>
          <a className="nav-item">Logistics</a>
          <a className="nav-item">Settings</a>
        </nav>
        <div className="sidebar-footer">Live sync enabled</div>
      </aside>

      <main className="main-area">
        <div className="topbar">
          <div>
            <p className="eyebrow">National Disaster Command</p>
            <h1>Command Center Dashboard</h1>
          </div>
          <div className="top-actions">
            <input className="search" placeholder="Search incidents" />
            <div className="avatar">HQ</div>
          </div>
        </div>

        <Dashboard liveIncidents={liveIncidents} historyItems={historyItems} />
        <History items={historyItems} />
      </main>
    </div>
  );
}

export default App;
