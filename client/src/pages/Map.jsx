import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Car,
  CloudRain,
  Crosshair,
  Layers,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";

import "./Map.css";

/* =========================================================
   DEMO MAP DATA
   API WILL BE CONNECTED LATER
   ========================================================= */

const INITIAL_EVENTS = [
  {
    id: 1,
    title: "Traffic Congestion",
    type: "traffic",
    severity: "high",
    location: "MI Road, Jaipur",
    coordinates: { x: 58, y: 38 },
  },
  {
    id: 2,
    title: "Heavy Rainfall",
    type: "weather",
    severity: "medium",
    location: "C-Scheme, Jaipur",
    coordinates: { x: 38, y: 54 },
  },
  {
    id: 3,
    title: "Citizen Report",
    type: "citizen",
    severity: "critical",
    location: "Tonk Road, Jaipur",
    coordinates: { x: 72, y: 64 },
  },
  {
    id: 4,
    title: "Road Blockage",
    type: "traffic",
    severity: "medium",
    location: "Ajmer Road, Jaipur",
    coordinates: { x: 27, y: 34 },
  },
  {
    id: 5,
    title: "Water Logging",
    type: "weather",
    severity: "high",
    location: "Malviya Nagar, Jaipur",
    coordinates: { x: 64, y: 76 },
  },
];

/* =========================================================
   ICONS
   ========================================================= */

const eventIcons = {
  traffic: Car,
  weather: CloudRain,
  citizen: Users,
};

const eventColors = {
  traffic: "traffic",
  weather: "weather",
  citizen: "citizen",
};

/* =========================================================
   HELPERS
   ========================================================= */

function formatType(type) {
  return type?.replaceAll("_", " ") || "Unknown";
}

function getSeverityClass(severity) {
  return `severity-${severity?.toLowerCase() || "normal"}`;
}

/* =========================================================
   MAP PAGE
   ========================================================= */

function Map() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [search, setSearch] = useState("");

  const [activeLayer, setActiveLayer] = useState("all");

  const [isRefreshing, setIsRefreshing] = useState(false);

  /* =======================================================
     FILTER EVENTS
     ======================================================= */

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesLayer =
        activeLayer === "all" || event.type === activeLayer;

      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        event.title.toLowerCase().includes(searchValue) ||
        event.location.toLowerCase().includes(searchValue);

      return matchesLayer && matchesSearch;
    });
  }, [events, search, activeLayer]);

  /* =======================================================
     REFRESH
     ======================================================= */

  const handleRefresh = () => {
    setIsRefreshing(true);

    setTimeout(() => {
      setEvents([...INITIAL_EVENTS]);
      setIsRefreshing(false);
    }, 700);
  };

  /* =======================================================
     CENTER MAP
     ======================================================= */

  const handleCenterMap = () => {
    setSelectedEvent(null);
    setSearch("");
    setActiveLayer("all");
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="map-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="map-header">

        <div>
          <div className="map-eyebrow">
            <span className="map-live-dot" />
            CITYPULSE LIVE MAP
          </div>

          <h1>City Intelligence Map</h1>

          <p>
            Monitor live civic activity, incidents and risk zones
            across the city.
          </p>
        </div>

        <button
          className="map-refresh-button"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            size={16}
            className={isRefreshing ? "map-spin" : ""}
          />

          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>

      </section>

      {/* ===================================================
          MAP TOOLBAR
      =================================================== */}

      <section className="map-toolbar">

        {/* Search */}

        <div className="map-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search location or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button onClick={() => setSearch("")}>
              <X size={15} />
            </button>
          )}

        </div>

        {/* Layers */}

        <div className="map-layer-buttons">

          <button
            className={activeLayer === "all" ? "active" : ""}
            onClick={() => setActiveLayer("all")}
          >
            <Layers size={15} />
            All
          </button>

          <button
            className={activeLayer === "traffic" ? "active" : ""}
            onClick={() => setActiveLayer("traffic")}
          >
            <Car size={15} />
            Traffic
          </button>

          <button
            className={activeLayer === "weather" ? "active" : ""}
            onClick={() => setActiveLayer("weather")}
          >
            <CloudRain size={15} />
            Weather
          </button>

          <button
            className={activeLayer === "citizen" ? "active" : ""}
            onClick={() => setActiveLayer("citizen")}
          >
            <Users size={15} />
            Citizen
          </button>

        </div>

      </section>

      {/* ===================================================
          MAP CONTAINER
      =================================================== */}

      <section className="map-card">

        {/* MAP TOP BAR */}

        <div className="map-card-header">

          <div className="map-location">

            <div className="map-location-icon">
              <Navigation size={17} />
            </div>

            <div>
              <strong>Jaipur, Rajasthan</strong>

              <span>
                Live city activity
              </span>
            </div>

          </div>

          <button
            className="map-center-button"
            onClick={handleCenterMap}
            title="Reset map"
          >
            <Crosshair size={17} />
            Recenter
          </button>

        </div>

        {/* =================================================
            MAP VISUAL
        ================================================= */}

        <div className="map-viewport">

          {/* Grid */}

          <div className="map-grid" />

          {/* Roads */}

          <div className="map-road map-road-one" />
          <div className="map-road map-road-two" />
          <div className="map-road map-road-three" />
          <div className="map-road map-road-four" />

          {/* City blocks */}

          <div className="map-block block-one" />
          <div className="map-block block-two" />
          <div className="map-block block-three" />
          <div className="map-block block-four" />
          <div className="map-block block-five" />
          <div className="map-block block-six" />

          {/* Event markers */}

          {filteredEvents.map((event) => {

            const Icon =
              eventIcons[event.type] || MapPin;

            return (
              <button
                key={event.id}
                className={`map-marker ${eventColors[event.type]} ${getSeverityClass(
                  event.severity
                )} ${
                  selectedEvent?.id === event.id
                    ? "selected"
                    : ""
                }`}
                style={{
                  left: `${event.coordinates.x}%`,
                  top: `${event.coordinates.y}%`,
                }}
                onClick={() => setSelectedEvent(event)}
                title={event.title}
              >
                <span className="map-marker-pulse" />

                <span className="map-marker-icon">
                  <Icon size={16} />
                </span>
              </button>
            );
          })}

          {/* Map overlay */}

          <div className="map-overlay-top">
            <span>
              <span className="map-live-dot" />
              LIVE
            </span>

            <span>
              {filteredEvents.length} active markers
            </span>
          </div>

          {/* Selected Event */}

          {selectedEvent && (
            <div className="map-event-popup">

              <button
                className="map-popup-close"
                onClick={() => setSelectedEvent(null)}
              >
                <X size={15} />
              </button>

              <div className="map-popup-icon">
                {(() => {
                  const Icon =
                    eventIcons[selectedEvent.type] ||
                    MapPin;

                  return <Icon size={18} />;
                })()}
              </div>

              <div className="map-popup-content">

                <div className="map-popup-type">
                  {formatType(selectedEvent.type)}
                </div>

                <h3>
                  {selectedEvent.title}
                </h3>

                <div className="map-popup-location">
                  <MapPin size={13} />
                  {selectedEvent.location}
                </div>

                <span
                  className={`map-popup-severity ${getSeverityClass(
                    selectedEvent.severity
                  )}`}
                >
                  {selectedEvent.severity}
                </span>

              </div>

            </div>
          )}

          {/* No result */}

          {filteredEvents.length === 0 && (
            <div className="map-empty">

              <MapPin size={25} />

              <strong>
                No events found
              </strong>

              <span>
                Try another search or map layer.
              </span>

            </div>
          )}

        </div>

        {/* =================================================
            MAP FOOTER
        ================================================= */}

        <div className="map-card-footer">

          <div className="map-legend">

            <span>
              <i className="legend-dot traffic" />
              Traffic
            </span>

            <span>
              <i className="legend-dot weather" />
              Weather
            </span>

            <span>
              <i className="legend-dot citizen" />
              Citizen
            </span>

          </div>

          <span className="map-footer-status">
            <span className="map-live-dot" />
            Live monitoring active
          </span>

        </div>

      </section>

      {/* ===================================================
          MAP SUMMARY
      =================================================== */}

      <section className="map-summary-grid">

        <div className="map-summary-card">

          <div className="summary-icon blue">
            <MapPin size={18} />
          </div>

          <div>
            <span>Total markers</span>
            <strong>{events.length}</strong>
          </div>

        </div>

        <div className="map-summary-card">

          <div className="summary-icon orange">
            <ShieldAlert size={18} />
          </div>

          <div>
            <span>High priority</span>

            <strong>
              {
                events.filter(
                  (event) =>
                    event.severity === "high" ||
                    event.severity === "critical"
                ).length
              }
            </strong>
          </div>

        </div>

        <div className="map-summary-card">

          <div className="summary-icon red">
            <AlertTriangle size={18} />
          </div>

          <div>
            <span>Critical</span>

            <strong>
              {
                events.filter(
                  (event) =>
                    event.severity === "critical"
                ).length
              }
            </strong>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Map;