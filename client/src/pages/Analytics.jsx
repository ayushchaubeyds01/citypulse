import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  RefreshCw,
  TrendingUp,
  Radio,
  ShieldAlert,
  Users,
} from "lucide-react";

import "./Analytics.css";
import { getDashboardOverview } from "../services/api";

function Analytics() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalytics = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const result = await getDashboardOverview();

      setDashboard(result?.data || {});
    } catch (err) {
      console.error("Analytics fetch failed:", err);
      setError("Unable to load analytics data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const summary = dashboard?.summary || {
    totalEvents: 0,
    activeEvents: 0,
    resolvedEvents: 0,
  };

  const eventsBySource = dashboard?.eventsBySource || [];
  const eventsByType = dashboard?.eventsByType || [];
  const criticalEvents = dashboard?.criticalEvents || [];

  const resolutionRate = useMemo(() => {
    if (!summary.totalEvents) return 0;

    return Math.round(
      (summary.resolvedEvents / summary.totalEvents) * 100
    );
  }, [summary]);

  const highestSource = useMemo(() => {
    if (!eventsBySource.length) return null;

    return [...eventsBySource].sort(
      (a, b) => Number(b.count || 0) - Number(a.count || 0)
    )[0];
  }, [eventsBySource]);

  const highestType = useMemo(() => {
    if (!eventsByType.length) return null;

    return [...eventsByType].sort(
      (a, b) => Number(b.count || 0) - Number(a.count || 0)
    )[0];
  }, [eventsByType]);

  const maxSourceCount = Math.max(
    ...eventsBySource.map((item) => Number(item.count || 0)),
    1
  );

  const maxTypeCount = Math.max(
    ...eventsByType.map((item) => Number(item.count || 0)),
    1
  );

  if (loading) {
    return (
      <main className="analytics-page">
        <div className="analytics-shell">
          <div className="analytics-loading">
            <div className="analytics-skeleton analytics-skeleton-small" />
            <div className="analytics-skeleton analytics-skeleton-title" />
            <div className="analytics-skeleton analytics-skeleton-text" />

            <div className="analytics-loading-grid">
              <div className="analytics-skeleton analytics-card-skeleton" />
              <div className="analytics-skeleton analytics-card-skeleton" />
              <div className="analytics-skeleton analytics-card-skeleton" />
              <div className="analytics-skeleton analytics-card-skeleton" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="analytics-page">
        <div className="analytics-shell analytics-error-shell">
          <div className="analytics-error">
            <div className="analytics-error-icon">
              <AlertTriangle size={26} />
            </div>

            <h2>Analytics unavailable</h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => fetchAnalytics()}
              className="analytics-refresh-button"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="analytics-page">
      <div className="analytics-shell">

        {/* =========================================
            HEADER
        ========================================== */}

        <header className="analytics-header">
          <div>
            <div className="analytics-eyebrow">
              <span />
              CITYPULSE ANALYTICS
            </div>

            <h1>City Intelligence</h1>

            <p>
              Analyze civic activity, event patterns, sources and
              operational performance.
            </p>
          </div>

          <button
            type="button"
            className="analytics-refresh-button"
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "analytics-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </header>

        {/* =========================================
            KPI GRID
        ========================================== */}

        <section className="analytics-kpi-grid">

          <article className="analytics-kpi-card">
            <div className="analytics-kpi-top">
              <span>Total Events</span>

              <div className="analytics-kpi-icon cyan">
                <Activity size={18} />
              </div>
            </div>

            <strong>{summary.totalEvents}</strong>

            <small>
              Total civic activity recorded
            </small>
          </article>

          <article className="analytics-kpi-card">
            <div className="analytics-kpi-top">
              <span>Active Events</span>

              <div className="analytics-kpi-icon amber">
                <Radio size={18} />
              </div>
            </div>

            <strong>{summary.activeEvents}</strong>

            <small>
              Currently requiring monitoring
            </small>
          </article>

          <article className="analytics-kpi-card">
            <div className="analytics-kpi-top">
              <span>Resolution Rate</span>

              <div className="analytics-kpi-icon green">
                <CheckCircle2 size={18} />
              </div>
            </div>

            <strong>{resolutionRate}%</strong>

            <small>
              {summary.resolvedEvents} events resolved
            </small>
          </article>

          <article className="analytics-kpi-card">
            <div className="analytics-kpi-top">
              <span>Critical Events</span>

              <div className="analytics-kpi-icon red">
                <ShieldAlert size={18} />
              </div>
            </div>

            <strong>{criticalEvents.length}</strong>

            <small>
              High-priority events detected
            </small>
          </article>

        </section>

        {/* =========================================
            PERFORMANCE OVERVIEW
        ========================================== */}

        <section className="analytics-section">

          <div className="analytics-section-heading">
            <div>
              <span className="analytics-section-label">
                PERFORMANCE
              </span>

              <h2>Operational Overview</h2>

              <p>
                Current performance indicators across the city.
              </p>
            </div>

            <BarChart3 size={20} />
          </div>

          <div className="analytics-overview-grid">

            <div className="analytics-overview-card">

              <div className="analytics-overview-icon">
                <TrendingUp size={20} />
              </div>

              <div>
                <span>Resolution Performance</span>

                <strong>{resolutionRate}%</strong>

                <p>
                  Percentage of recorded events that have been
                  resolved.
                </p>
              </div>

            </div>

            <div className="analytics-overview-card">

              <div className="analytics-overview-icon">
                <Clock3 size={20} />
              </div>

              <div>
                <span>Active Monitoring</span>

                <strong>{summary.activeEvents}</strong>

                <p>
                  Events currently active in the CityPulse system.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* =========================================
            SOURCE ANALYTICS
        ========================================== */}

        <section className="analytics-section">

          <div className="analytics-section-heading">
            <div>
              <span className="analytics-section-label">
                DATA SOURCES
              </span>

              <h2>Events by Source</h2>

              <p>
                Understand which sources contribute the most
                civic intelligence.
              </p>
            </div>

            <Users size={20} />
          </div>

          <div className="analytics-source-list">

            {eventsBySource.length > 0 ? (
              eventsBySource.map((source) => {

                const count = Number(source.count || 0);

                const percentage = Math.round(
                  (count / maxSourceCount) * 100
                );

                return (
                  <div
                    className="analytics-source-row"
                    key={source.source}
                  >

                    <div className="analytics-source-info">
                      <span className="analytics-source-name">
                        {source.source || "Unknown"}
                      </span>

                      <span className="analytics-source-count">
                        {count}
                      </span>
                    </div>

                    <div className="analytics-progress">
                      <span
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="analytics-empty">
                No source analytics available.
              </div>
            )}

          </div>

          {highestSource && (
            <div className="analytics-insight">
              <TrendingUp size={16} />

              <span>
                <strong>{highestSource.source}</strong> is currently
                the largest event source with{" "}
                <strong>{highestSource.count}</strong> events.
              </span>
            </div>
          )}

        </section>

        {/* =========================================
            EVENT TYPE ANALYTICS
        ========================================== */}

        <section className="analytics-section">

          <div className="analytics-section-heading">
            <div>
              <span className="analytics-section-label">
                EVENT CLASSIFICATION
              </span>

              <h2>Events by Type</h2>

              <p>
                Distribution of civic incidents by category.
              </p>
            </div>

            <BarChart3 size={20} />
          </div>

          <div className="analytics-type-grid">

            {eventsByType.length > 0 ? (
              eventsByType.map((event) => {

                const count = Number(event.count || 0);

                const percentage = Math.round(
                  (count / maxTypeCount) * 100
                );

                return (
                  <div
                    className="analytics-type-card"
                    key={event.eventType}
                  >

                    <div className="analytics-type-top">
                      <div className="analytics-type-dot" />

                      <span>
                        {(event.eventType || "Unknown")
                          .replaceAll("_", " ")}
                      </span>

                      <strong>{count}</strong>
                    </div>

                    <div className="analytics-progress">
                      <span
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="analytics-empty">
                No event type analytics available.
              </div>
            )}

          </div>

          {highestType && (
            <div className="analytics-insight purple">
              <Activity size={16} />

              <span>
                <strong>
                  {highestType.eventType?.replaceAll("_", " ")}
                </strong>{" "}
                is currently the most common event category.
              </span>
            </div>
          )}

        </section>

        {/* =========================================
            SYSTEM HEALTH
        ========================================== */}

        <section className="analytics-system">

          <div className="analytics-system-status">
            <span className="analytics-live-dot" />

            <div>
              <strong>CityPulse Intelligence System</strong>

              <span>
                Backend • Data Sources • Analytics
              </span>
            </div>
          </div>

          <div className="analytics-system-badge">
            Operational
          </div>

        </section>

      </div>
    </main>
  );
}

export default Analytics;