import { useMemo, useState, useEffect } from "react";
import Dashboard from "./command/dashboard.jsx";
import History from "./command/history.jsx";
import Incidents from "./command/incidents.jsx";
import Dispatch from "./command/dispatch.jsx";
import Logistics from "./command/logistics.jsx";
import ResponderManagement from "./command/responder-management.jsx";
import Analytics from "./command/analytics.jsx";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  
  // Load dispatched teams from sessionStorage on mount
  const loadDispatchedTeams = () => {
    try {
      const stored = sessionStorage.getItem("dispatchedTeams");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading dispatched teams from sessionStorage:", error);
      return [];
    }
  };

  // Shared state for dispatched teams - array of dispatched incident objects
  const [dispatchedTeams, setDispatchedTeams] = useState(() => loadDispatchedTeams());

  // Save dispatched teams to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem("dispatchedTeams", JSON.stringify(dispatchedTeams));
    } catch (error) {
      console.error("Error saving dispatched teams to sessionStorage:", error);
    }
  }, [dispatchedTeams]);

  // Load resolved incidents from sessionStorage on mount
  const loadResolvedIncidents = () => {
    try {
      const stored = sessionStorage.getItem("resolvedIncidents");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading resolved incidents from sessionStorage:", error);
      return [];
    }
  };

  // Shared state for resolved incidents - array of resolved incident objects
  const [resolvedIncidents, setResolvedIncidents] = useState(() => loadResolvedIncidents());

  // Save resolved incidents to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem("resolvedIncidents", JSON.stringify(resolvedIncidents));
    } catch (error) {
      console.error("Error saving resolved incidents to sessionStorage:", error);
    }
  }, [resolvedIncidents]);

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

  // Page titles
  const pageTitles = {
    dashboard: "Command Center Dashboard",
    incidents: "Incidents Map",
    dispatch: "Dispatch Center",
    logistics: "Logistics & Resources",
    "responder-management": "Responder Management",
    analytics: "Analytics",
    // settings: "Settings",
  };

  // Render current page content
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <>
            <Dashboard liveIncidents={liveIncidents} historyItems={historyItems} dispatchedTeams={dispatchedTeams} resolvedIncidents={resolvedIncidents} />
          </>
        );
      case "incidents":
        return <Incidents />;
      case "dispatch":
        return <Dispatch dispatchedTeams={dispatchedTeams} setDispatchedTeams={setDispatchedTeams} resolvedIncidents={resolvedIncidents} setResolvedIncidents={setResolvedIncidents} />;
      case "logistics":
        return <Logistics />;
      case "responder-management":
        return <ResponderManagement />;
      case "analytics":
        return <Analytics />;
      // case "settings":
      //   return (
      //     <div className="page">
      //       <div className="panel">
      //         <h2>Settings</h2>
      //         <p className="muted">Settings page coming soon...</p>
      //       </div>
      //     </div>
      //   );
      default:
        return (
          <>
            <Dashboard liveIncidents={liveIncidents} historyItems={historyItems} dispatchedTeams={dispatchedTeams} resolvedIncidents={resolvedIncidents} />
          </>
        );
    }
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">ResQ</div>
        <nav>
          <a
            className={`nav-item ${currentPage === "dashboard" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("dashboard");
            }}
            href="#"
          >
            Dashboard
          </a>
          <a
            className={`nav-item ${currentPage === "incidents" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("incidents");
            }}
            href="#"
          >
            Incidents
          </a>
          <a
            className={`nav-item ${currentPage === "dispatch" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("dispatch");
            }}
            href="#"
          >
            Dispatch
          </a>
          {/* <a
            className={`nav-item ${currentPage === "logistics" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("logistics");
            }}
            href="#"
          >
            Logistics
          </a> */}
          <a
            className={`nav-item ${currentPage === "responder-management" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("responder-management");
            }}
            href="#"
          >
            Responder Management
          </a>
          <a
            className={`nav-item ${currentPage === "analytics" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("analytics");
            }}
            href="#"
          >
            Analytics
          </a>
          {/* <a
            className={`nav-item ${currentPage === "settings" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("settings");
            }}
            href="#"
          >
            Settings
          </a> */}
        </nav>
        <div className="sidebar-footer">Live sync enabled</div>
      </aside>

      <main className="main-area">
        <div className="topbar">
          <div>
            <p className="eyebrow">National Disaster Command</p>
            <h1>{pageTitles[currentPage] || "Command Center Dashboard"}</h1>
          </div>
          <div className="top-actions">
            <input className="search" placeholder="Search incidents" />
            <div className="avatar">RQ</div>
          </div>
        </div>

        {renderPage()}
      </main>
    </div>
  );
}

export default App;
