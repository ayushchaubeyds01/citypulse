import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  Car,
  ChevronRight,
  CloudRain,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  Users,
  X,
  Zap,
} from "lucide-react";

import "./Events.css";

/* =========================================================
   MOCK DATA
   ---------------------------------------------------------
   Temporary data is used here so the Events page works
   independently from Axios/backend.
   We will connect the API later.
   ========================================================= */

const initialEvents = [
  {
    id: 1,
    title: "Traffic congestion detected",
    description:
      "Heavy traffic has been reported near the main intersection.",
    type: "traffic",
    source: "traffic",
    severity: "high",
    status: "active",
    location: "Jaipur, Rajasthan",
    createdAt: "25 Sep 2026, 06:42 PM",
  },
  {
    id: 2,
    title: "Heavy rainfall reported",
    description:
      "Continuous rainfall detected across multiple city zones.",
    type: "weather",
    source: "weather",
    severity: "medium",
    status: "active",
    location: "Jaipur, Rajasthan",
    createdAt: "25 Sep 2026, 06:20 PM",
  },
  {
    id: 3,
    title: "Citizen road complaint",
    description:
      "Citizen reported damaged road infrastructure.",
    type: "citizen",
    source: "citizen",
    severity: "high",
    status: "active",
    location: "Malviya Nagar, Jaipur",
    createdAt: "25 Sep 2026, 05:58 PM",
  },
  {
    id: 4,
    title: "Waterlogging reported",
    description:
      "Water accumulation reported after rainfall.",
    type: "weather",
    source: "citizen",
    severity: "medium",
    status: "resolved",
    location: "Vaishali Nagar, Jaipur",
    createdAt: "25 Sep 2026, 04:35 PM",
  },
  {
    id: 5,
    title: "Road accident reported",
    description:
      "Traffic incident reported by the connected traffic source.",
    type: "traffic",
    source: "traffic",
    severity: "critical",
    status: "active",
    location: "Tonk Road, Jaipur",
    createdAt: "25 Sep 2026, 03:48 PM",
  },
];

/* =========================================================
   SOURCE CONFIG
   ========================================================= */

const sourceConfig = {
  citizen: {
    label: "Citizen",
    icon: Users,
    className: "event-source-citizen",
  },

  traffic: {
    label: "Traffic",
    icon: Car,
    className: "event-source-traffic",
  },

  weather: {
    label: "Weather",
    icon: CloudRain,
    className: "event-source-weather",
  },
};

/* =========================================================
   SEVERITY
   ========================================================= */

const severityConfig = {
  critical: {
    label: "Critical",
    className: "severity-critical",
  },

  high: {
    label: "High",
    className: "severity-high",
  },

  medium: {
    label: "Medium",
    className: "severity-medium",
  },

  low: {
    label: "Low",
    className: "severity-low",
  },
};

/* =========================================================
   STATUS
   ========================================================= */

const statusConfig = {
  active: {
    label: "Active",
    className: "status-active",
  },

  resolved: {
    label: "Resolved",
    className: "status-resolved",
  },
};

/* =========================================================
   EVENTS PAGE
   ========================================================= */

function Events() {
  const [events, setEvents] = useState(initialEvents);

  const [searchTerm, setSearchTerm] = useState("");

  const [severityFilter, setSeverityFilter] =
    useState("all");

  const [sourceFilter, setSourceFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [refreshing, setRefreshing] =
    useState(false);

  /* =======================================================
     REFRESH
     ======================================================= */

  const handleRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setEvents([...initialEvents]);
      setRefreshing(false);
    }, 700);
  };

  /* =======================================================
     CLEAR FILTERS
     ======================================================= */

  const clearFilters = () => {
    setSearchTerm("");
    setSeverityFilter("all");
    setSourceFilter("all");
    setStatusFilter("all");
  };

  /* =======================================================
     FILTER EVENTS
     ======================================================= */

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        !search ||
        event.title.toLowerCase().includes(search) ||
        event.description
          .toLowerCase()
          .includes(search) ||
        event.location.toLowerCase().includes(search);

      const matchesSeverity =
        severityFilter === "all" ||
        event.severity === severityFilter;

      const matchesSource =
        sourceFilter === "all" ||
        event.source === sourceFilter;

      const matchesStatus =
        statusFilter === "all" ||
        event.status === statusFilter;

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesSource &&
        matchesStatus
      );
    });
  }, [
    events,
    searchTerm,
    severityFilter,
    sourceFilter,
    statusFilter,
  ]);

  /* =======================================================
     COUNTS
     ======================================================= */

  const counts = useMemo(() => {
    return {
      total: events.length,

      active: events.filter(
        (event) => event.status === "active"
      ).length,

      critical: events.filter(
        (event) => event.severity === "critical"
      ).length,

      resolved: events.filter(
        (event) => event.status === "resolved"
      ).length,
    };
  }, [events]);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="events-page">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <section className="events-header">

        <div className="events-header-content">

          <div className="events-eyebrow">
            <span className="events-eyebrow-dot" />

            CITY ACTIVITY
          </div>

          <h1 className="events-title">
            Events
          </h1>

          <p className="events-description">
            Monitor, filter and review real-time civic
            events across the city.
          </p>
        </div>

        <button
          type="button"
          className="events-refresh-button"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            size={16}
            className={
              refreshing
                ? "events-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </section>

      {/* ===================================================
          SUMMARY
      =================================================== */}

      <section className="events-summary">

        <div className="event-summary-card">

          <div className="event-summary-icon event-summary-total">
            <Activity size={19} />
          </div>

          <div>
            <span>Total Events</span>
            <strong>{counts.total}</strong>
          </div>

        </div>

        <div className="event-summary-card">

          <div className="event-summary-icon event-summary-active">
            <Zap size={19} />
          </div>

          <div>
            <span>Active</span>
            <strong>{counts.active}</strong>
          </div>

        </div>

        <div className="event-summary-card">

          <div className="event-summary-icon event-summary-critical">
            <AlertTriangle size={19} />
          </div>

          <div>
            <span>Critical</span>
            <strong>{counts.critical}</strong>
          </div>

        </div>

        <div className="event-summary-card">

          <div className="event-summary-icon event-summary-resolved">
            <Activity size={19} />
          </div>

          <div>
            <span>Resolved</span>
            <strong>{counts.resolved}</strong>
          </div>

        </div>

      </section>

      {/* ===================================================
          FILTER BAR
      =================================================== */}

      <section className="events-filter-panel">

        <div className="events-filter-top">

          <div className="events-filter-title">

            <div className="events-filter-icon">
              <Filter size={17} />
            </div>

            <div>
              <h2>Event Filters</h2>

              <p>
                Narrow down city activity.
              </p>
            </div>

          </div>

          <button
            type="button"
            className="events-clear-button"
            onClick={clearFilters}
          >
            <X size={14} />

            Clear filters
          </button>

        </div>

        <div className="events-filter-grid">

          {/* Search */}

          <div className="events-search-wrapper">

            <Search
              size={17}
              className="events-search-icon"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search events..."
              className="events-search-input"
            />

          </div>

          {/* Severity */}

          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(
                event.target.value
              )
            }
            className="events-select"
          >
            <option value="all">
              All Severity
            </option>

            <option value="critical">
              Critical
            </option>

            <option value="high">
              High
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="low">
              Low
            </option>
          </select>

          {/* Source */}

          <select
            value={sourceFilter}
            onChange={(event) =>
              setSourceFilter(
                event.target.value
              )
            }
            className="events-select"
          >
            <option value="all">
              All Sources
            </option>

            <option value="citizen">
              Citizen
            </option>

            <option value="traffic">
              Traffic
            </option>

            <option value="weather">
              Weather
            </option>
          </select>

          {/* Status */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="events-select"
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="resolved">
              Resolved
            </option>
          </select>

        </div>

      </section>

      {/* ===================================================
          EVENT LIST
      =================================================== */}

      <section className="events-list-section">

        <div className="events-list-header">

          <div>

            <p className="events-section-label">
              LIVE FEED
            </p>

            <h2>
              City Events
            </h2>

          </div>

          <span className="events-result-count">
            {filteredEvents.length} events
          </span>

        </div>

        <div className="events-list">

          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {

              const source =
                sourceConfig[event.source] ||
                sourceConfig.citizen;

              const SourceIcon =
                source.icon;

              const severity =
                severityConfig[
                  event.severity
                ] ||
                severityConfig.low;

              const status =
                statusConfig[
                  event.status
                ] ||
                statusConfig.active;

              return (
                <article
                  key={event.id}
                  className="event-row"
                >

                  {/* Event Icon */}

                  <div
                    className={`event-source-icon ${source.className}`}
                  >
                    <SourceIcon size={19} />
                  </div>

                  {/* Main */}

                  <div className="event-main">

                    <div className="event-main-top">

                      <h3>
                        {event.title}
                      </h3>

                      <span
                        className={`event-severity ${severity.className}`}
                      >
                        {severity.label}
                      </span>

                    </div>

                    <p className="event-description">
                      {event.description}
                    </p>

                    <div className="event-meta">

                      <span>
                        <MapPin size={13} />

                        {event.location}
                      </span>

                      <span>
                        <CalendarDays size={13} />

                        {event.createdAt}
                      </span>

                      <span className="event-source-label">
                        {source.label}
                      </span>

                    </div>

                  </div>

                  {/* Right */}

                  <div className="event-right">

                    <span
                      className={`event-status ${status.className}`}
                    >
                      {status.label}
                    </span>

                    <button
                      type="button"
                      className="event-view-button"
                      title="View event"
                    >
                      <ChevronRight size={17} />
                    </button>

                  </div>

                </article>
              );
            })
          ) : (

            <div className="events-empty">

              <div className="events-empty-icon">
                <Search size={22} />
              </div>

              <h3>
                No events found
              </h3>

              <p>
                Try changing your filters
                or search query.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>

            </div>
          )}

        </div>

      </section>

    </div>
  );
}

export default Events;