import { useEffect, useState, useMemo } from "react";
import { subscribeToIncidents } from "../firebase";
import "./analytics.css";

// Helper functions for severity
function getSeverityLevel(severity) {
  if (typeof severity === 'number') {
    return severity;
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

// Severity colors
const severityColors = {
  1: '#ff5c73', // Critical
  2: '#f6a934', // High
  3: '#4be3c5', // Medium
  4: '#96b3ff', // Low
  5: '#9ca3af', // Minimal
};

function Analytics() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time incidents
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToIncidents((data) => {
      setIncidents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper to parse date
  const parseDate = (timestamp) => {
    if (!timestamp) return null;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    if (timestamp.seconds && typeof timestamp.seconds === 'number') {
      return new Date(timestamp.seconds * 1000);
    }
    try {
      const parsed = new Date(timestamp);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    } catch (e) {}
    return null;
  };

  // Group incidents by severity
  const incidentsBySeverity = useMemo(() => {
    const grouped = {
      1: [], // Critical
      2: [], // High
      3: [], // Medium
      4: [], // Low
      5: [], // Minimal
    };

    incidents.forEach((inc) => {
      const level = getSeverityLevel(inc.severity);
      if (grouped[level]) {
        grouped[level].push(inc);
      }
    });

    return grouped;
  }, [incidents]);

  // Group incidents by day (last 7 days)
  const incidentsByDay = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create array for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date: new Date(date),
        count: 0,
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      });
    }

    // Count incidents per day
    incidents.forEach((inc) => {
      const incDate = parseDate(inc.createdAt);
      if (incDate) {
        const incDateOnly = new Date(incDate);
        incDateOnly.setHours(0, 0, 0, 0);

        const dayIndex = days.findIndex((day) => {
          const dayDateOnly = new Date(day.date);
          dayDateOnly.setHours(0, 0, 0, 0);
          return dayDateOnly.getTime() === incDateOnly.getTime();
        });

        if (dayIndex !== -1) {
          days[dayIndex].count++;
        }
      }
    });

    return days;
  }, [incidents]);

  // Group incidents by type
  const incidentsByType = useMemo(() => {
    const grouped = {};
    incidents.forEach((inc) => {
      const type = inc.incidentType || 'Unknown';
      grouped[type] = (grouped[type] || 0) + 1;
    });
    return grouped;
  }, [incidents]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = incidents.length;
    const critical = incidentsBySeverity[1].length;
    const high = incidentsBySeverity[2].length;
    const resolved = incidents.filter((inc) => inc.status?.toLowerCase().includes('resolved') || inc.status?.toLowerCase().includes('cleared')).length;

    return {
      total,
      critical,
      high,
      resolved,
      active: total - resolved,
    };
  }, [incidents, incidentsBySeverity]);

  // Get max count for scaling charts
  const maxSeverityCount = Math.max(...Object.values(incidentsBySeverity).map(arr => arr.length), 1);
  const maxDailyCount = Math.max(...incidentsByDay.map(day => day.count), 1);

  return (
    <div className="analytics-page">
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Incidents</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card critical">
          <div className="stat-label">Critical</div>
          <div className="stat-value">{stats.critical}</div>
        </div>
        <div className="stat-card high">
          <div className="stat-label">High Priority</div>
          <div className="stat-value">{stats.high}</div>
        </div>
        <div className="stat-card active">
          <div className="stat-label">Active</div>
          <div className="stat-value">{stats.active}</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-label">Resolved</div>
          <div className="stat-value">{stats.resolved}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Incidents by Severity Chart */}
        <div className="chart-panel">
          <div className="chart-header">
            <h3>Incidents by Severity</h3>
            <p className="chart-subtitle">Distribution across severity levels</p>
          </div>
          <div className="chart-container">
            {[1, 2, 3, 4, 5].map((level) => {
              const count = incidentsBySeverity[level].length;
              const percentage = maxSeverityCount > 0 ? (count / maxSeverityCount) * 100 : 0;
              const color = severityColors[level];
              const label = severityLabel(level);

              return (
                <div key={level} className="bar-chart-item">
                  <div className="bar-label-row">
                    <span className="bar-label">{label}</span>
                    <span className="bar-value">{count}</span>
                  </div>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Incidents Chart */}
        <div className="chart-panel">
          <div className="chart-header">
            <h3>Daily Incident Count</h3>
            <p className="chart-subtitle">Last 7 days</p>
          </div>
          <div className="chart-container daily-chart">
            <div className="daily-bars">
              {incidentsByDay.map((day, index) => {
                const percentage = maxDailyCount > 0 ? (day.count / maxDailyCount) * 100 : 0;
                // Use gradient colors based on count (higher = more critical color)
                const color = day.count === 0 
                  ? '#9ca3af' 
                  : day.count <= 2 
                  ? '#96b3ff' 
                  : day.count <= 5 
                  ? '#4be3c5' 
                  : day.count <= 10 
                  ? '#f6a934' 
                  : '#ff5c73';

                return (
                  <div key={index} className="daily-bar-item">
                    <div className="daily-bar-container">
                      <div
                        className="daily-bar-fill"
                        style={{
                          height: `${percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <div className="daily-bar-label">{day.label}</div>
                    <div className="daily-bar-value">{day.count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Incidents by Type Chart */}
        <div className="chart-panel">
          <div className="chart-header">
            <h3>Incidents by Type</h3>
            <p className="chart-subtitle">Distribution by incident type</p>
          </div>
          <div className="chart-container">
            {Object.entries(incidentsByType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count], index) => {
                const maxTypeCount = Math.max(...Object.values(incidentsByType));
                const percentage = maxTypeCount > 0 ? (count / maxTypeCount) * 100 : 0;
                // Cycle through colors
                const colors = ['#4be3c5', '#96b3ff', '#f6a934', '#ff5c73', '#9ca3af'];
                const color = colors[index % colors.length];

                return (
                  <div key={type} className="bar-chart-item">
                    <div className="bar-label-row">
                      <span className="bar-label">{type}</span>
                      <span className="bar-value">{count}</span>
                    </div>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <p>Loading analytics data...</p>
        </div>
      )}
    </div>
  );
}

export default Analytics;

