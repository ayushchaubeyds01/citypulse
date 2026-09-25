import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Clock3,
  MapPin,
  RefreshCw,
  Radio,
  ShieldCheck,
  Users,
  Car,
  Zap,
} from "lucide-react";

import { getDashboardOverview } from "../services/api";
import "./Dashboard.css";

/* =========================================================
   SOURCE CONFIG
========================================================= */

const sourceConfig = {
  citizen: {
    icon: Users,
    color: "citizen",
  },
  traffic: {
    icon: Car,
    color: "traffic",
  },
  weather: {
    icon: CloudRain,
    color: "weather",
  },
};

/* =========================================================
   HELPERS
========================================================= */

function formatEventType(value = "") {
  return value.replaceAll("_", " ");
}

function formatDate(value) {
  if (!value) return "Recently";

  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Recently";
  }
}

function getSeverityClass(severity = "") {
  const value = severity.toLowerCase();

  if (value === "critical") return "severity-critical";
  if (value === "high") return "severity-high";
  if (value === "medium") return "severity-medium";

  return "severity-normal";
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* =======================================================
     FETCH DATA
  ======================================================= */

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const result = await getDashboardOverview();

      setDashboard(result.data);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* =======================================================
     DATA
  ======================================================= */

  const summary = dashboard?.summary || {
    totalEvents: 0,
    activeEvents: 0,
    resolvedEvents: 0,
  };

  const eventsBySource = dashboard?.eventsBySource || [];
  const eventsByType = dashboard?.eventsByType || [];
  const recentEvents = dashboard?.recentEvents || [];
  const criticalEvents = dashboard?.criticalEvents || [];

  const resolutionRate = useMemo(() => {
    if (!summary.totalEvents) return 0;

    return Math.round(
      (summary.resolvedEvents / summary.totalEvents) * 100
    );
  }, [summary]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-loading">
            <div className="skeleton skeleton-small" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" />

            <div className="dashboard-stat-grid">
              {[1, 2, 3].map((item) => (
                <div
                  className="skeleton skeleton-card"
                  key={item}
                />
              ))}
            </div>

            <div className="skeleton skeleton-large" />
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container dashboard-error-wrapper">
          <div className="dashboard-error-card">
            <div className="error-icon">
              <AlertTriangle size={28} />
            </div>

            <h2>Dashboard unavailable</h2>

            <p>{error}</p>

            <button
              className="dashboard-button"
              onClick={() => fetchDashboard()}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     STAT CARDS
  ======================================================= */

  const stats = [
    {
      title: "Total Events",
      value: summary.totalEvents,
      description: "All civic events",
      icon: Activity,
      type: "cyan",
    },
    {
      title: "Active Events",
      value: summary.activeEvents,
      description: "Currently active",
      icon: Radio,
      type: "amber",
    },
    {
      title: "Resolved Events",
      value: summary.resolvedEvents,
      description: `${resolutionRate}% resolution rate`,
      icon: CheckCircle2,
      type: "green",
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="dashboard-hero">

          <div className="hero-content">

            <div className="hero-label">
              
              
            </div>

            <h1>Civic Intelligence</h1>

            <p>
              Monitor real-time civic events, anomalies and
              city activity through a unified intelligence
              interface.
            </p>

          </div>

          <button
            className="dashboard-button refresh-button"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

        </section>

        {/* =================================================
            SYSTEM STATUS
        ================================================= */}

        <section className="system-status">

          <div className="system-status-left">

            <div className="system-icon">
              <ShieldCheck size={19} />
            </div>

            <div>
              <span className="system-label">
                SYSTEM STATUS
              </span>

              <div className="system-online">
                <span />
                All systems operational
              </div>
            </div>

          </div>

          <div className="system-updated">
            <Clock3 size={14} />
            Live monitoring active
          </div>

        </section>

        {/* =================================================
            SECTION HEADER
        ================================================= */}

        <div className="section-heading">
          <div>
            <span>OVERVIEW</span>
            <h2>City Activity</h2>
          </div>
        </div>

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <section className="dashboard-stat-grid">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                className={`dashboard-stat-card stat-${stat.type}`}
                key={stat.title}
              >

                <div className="stat-card-content">

                  <div>
                    <p>{stat.title}</p>

                    <strong>
                      {String(stat.value).padStart(2, "0")}
                    </strong>

                    <span>{stat.description}</span>
                  </div>

                  <div className="stat-icon">
                    <Icon size={21} />
                  </div>

                </div>

              </div>
            );
          })}

        </section>

        {/* =================================================
            SOURCE + TYPE
        ================================================= */}

        <section className="dashboard-two-column">

          {/* EVENTS BY SOURCE */}

          <div className="dashboard-panel">

            <div className="panel-header">

              <div>
                <h3>Events by Source</h3>
                <p>
                  Distribution across connected data sources.
                </p>
              </div>

              <div className="panel-icon cyan">
                <Radio size={17} />
              </div>

            </div>

            <div className="panel-list">

              {eventsBySource.map((source) => {

                const config =
                  sourceConfig[source.source] || {
                    icon: Activity,
                    color: "cyan",
                  };

                const Icon = config.icon;

                return (
                  <div
                    className="source-row"
                    key={source.source}
                  >

                    <div className="source-info">

                      <div
                        className={`source-icon ${config.color}`}
                      >
                        <Icon size={17} />
                      </div>

                      <div>
                        <strong>
                          {source.source}
                        </strong>

                        <span>
                          Data source
                        </span>
                      </div>

                    </div>

                    <b>{source.count}</b>

                  </div>
                );
              })}

              {eventsBySource.length === 0 && (
                <div className="empty-state">
                  No source data available.
                </div>
              )}

            </div>

          </div>

          {/* EVENTS BY TYPE */}

          <div className="dashboard-panel">

            <div className="panel-header">

              <div>
                <h3>Events by Type</h3>
                <p>
                  Current distribution of civic event types.
                </p>
              </div>

              <div className="panel-icon purple">
                <BarChart3 size={17} />
              </div>

            </div>

            <div className="panel-list">

              {eventsByType.map((event) => (

                <div
                  className="type-row"
                  key={event.eventType}
                >

                  <div className="type-name">
                    <span />
                    {formatEventType(event.eventType)}
                  </div>

                  <b>{event.count}</b>

                </div>

              ))}

              {eventsByType.length === 0 && (
                <div className="empty-state">
                  No event type data available.
                </div>
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            RECENT EVENTS
        ================================================= */}

        <section className="dashboard-panel recent-events-panel">

          <div className="panel-header">

            <div>
              <h3>Recent Events</h3>

              <p>
                Latest civic activity received by CityPulse.
              </p>
            </div>

            <div className="live-feed">
              <span />
              Live activity feed
            </div>

          </div>

          <div className="events-table">

            <div className="events-table-head">
              <span>EVENT</span>
              <span>LOCATION</span>
              <span>SOURCE</span>
              <span>SEVERITY</span>
              <span />
            </div>

            {recentEvents.map((event) => (

              <div
                className="event-row"
                key={event._id}
              >

                <div className="event-main">

                  <div className="event-icon">
                    <Zap size={15} />
                  </div>

                  <div>
                    <strong>
                      {event.title || "Untitled event"}
                    </strong>

                    <span>
                      {formatDate(event.createdAt)}
                    </span>
                  </div>

                </div>

                <div className="event-location">
                  <MapPin size={13} />

                  {event.location?.address ||
                    "Location unavailable"}
                </div>

                <div>
                  <span className="source-badge">
                    {event.source || "unknown"}
                  </span>
                </div>

                <div>
                  <span
                    className={`severity-badge ${getSeverityClass(
                      event.severity
                    )}`}
                  >
                    {event.severity || "normal"}
                  </span>
                </div>

                <ChevronRight
                  className="event-arrow"
                  size={17}
                />

              </div>

            ))}

            {recentEvents.length === 0 && (
              <div className="empty-events">
                <Activity size={25} />
                <p>No recent events found.</p>
              </div>
            )}

          </div>

        </section>

        {/* =================================================
            CRITICAL EVENTS
        ================================================= */}

        <section className="critical-panel">

          <div className="critical-header">

            <div className="critical-title">

              <div className="critical-icon">
                <AlertTriangle size={18} />
              </div>

              <div>
                <h3>Critical Events</h3>

                <p>
                  High-priority events requiring attention.
                </p>
              </div>

            </div>

            {criticalEvents.length > 0 && (
              <span className="critical-count">
                {criticalEvents.length} Active
              </span>
            )}

          </div>

          <div className="critical-content">

            {criticalEvents.length > 0 ? (

              criticalEvents.map((event) => (

                <div
                  className="critical-event"
                  key={event._id}
                >

                  <div>
                    <strong>{event.title}</strong>

                    <span>
                      <MapPin size={12} />
                      {event.location?.address ||
                        "Location unavailable"}
                    </span>
                  </div>

                  <span
                    className={`severity-badge ${getSeverityClass(
                      event.severity
                    )}`}
                  >
                    {event.severity}
                  </span>

                </div>

              ))

            ) : (

              <div className="no-critical">

                <CheckCircle2 size={19} />

                <div>
                  <strong>No critical events</strong>

                  <span>
                    CityPulse has no high-priority events
                    requiring attention.
                  </span>
                </div>

              </div>

            )}

          </div>

        </section>

        {/* =================================================
            FOOTER STATUS
        ================================================= */}

        <footer className="dashboard-footer">

          <div className="footer-status">

            <div>
              <CheckCircle2 size={16} />
            </div>

            <section>
              <strong>
                CityPulse Systems Online
              </strong>

              <span>
                Backend • Data Sources • Dashboard
              </span>
            </section>

          </div>

          <span className="operational">
            ● Operational
          </span>

        </footer>

      </div>
    </div>
  );
}

export default Dashboard;