import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Clock3,
  Droplets,
  ExternalLink,
  MapPin,
  RefreshCw,
  Radio,
  ShieldCheck,
  Siren,
  TrafficCone,
  Users,
  Zap,
  Ambulance,
  Volume2,
  VolumeX,
  Waves,
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
    label: "Citizen",
  },

  traffic: {
    icon: TrafficCone,
    color: "traffic",
    label: "Traffic",
  },

  weather: {
    icon: CloudRain,
    color: "weather",
    label: "Weather",
  },

  emergency: {
    icon: Ambulance,
    color: "emergency",
    label: "Emergency",
  },

  system: {
    icon: Activity,
    color: "system",
    label: "System",
  },
};

/* =========================================================
   HELPERS
========================================================= */

function formatEventType(value = "") {
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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
  const value = String(severity).toLowerCase();

  if (value === "critical") return "severity-critical";
  if (value === "high") return "severity-high";
  if (value === "medium") return "severity-medium";

  return "severity-normal";
}

function getSeverityIcon(severity = "") {
  const value = String(severity).toLowerCase();

  if (value === "critical") return Siren;
  if (value === "high") return AlertTriangle;

  return Activity;
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
     SECURITY CENTER STATE
  ======================================================= */

  const [buzzerEnabled, setBuzzerEnabled] = useState(false);
  const [muted, setMuted] = useState(false);

  /* =======================================================
     AUDIO REFERENCES
  ======================================================= */

  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const buzzerIntervalRef = useRef(null);

  /* =======================================================
     SECURITY BUZZER
  ======================================================= */

  const stopBuzzerSound = () => {
    try {
      if (buzzerIntervalRef.current) {
        clearInterval(buzzerIntervalRef.current);
        buzzerIntervalRef.current = null;
      }

      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch {
          // Oscillator may already be stopped.
        }

        try {
          oscillatorRef.current.disconnect();
        } catch {
          // Ignore disconnect errors.
        }

        oscillatorRef.current = null;
      }

      if (gainNodeRef.current) {
        try {
          gainNodeRef.current.disconnect();
        } catch {
          // Ignore disconnect errors.
        }

        gainNodeRef.current = null;
      }
    } catch (error) {
      console.error("Unable to stop buzzer:", error);
    }
  };

  const playBuzzerSound = () => {
    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) {
        console.warn(
          "Web Audio API is not supported in this browser."
        );
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const oscillator =
        audioContext.createOscillator();

      const gainNode =
        audioContext.createGain();

      /* Buzzer tone */
      oscillator.type = "square";

      oscillator.frequency.setValueAtTime(
        880,
        audioContext.currentTime
      );

      /* Start almost silent */
      gainNode.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime
      );

      /* Quick attack */
      gainNode.gain.exponentialRampToValueAtTime(
        0.25,
        audioContext.currentTime + 0.03
      );

      /* Quick release */
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.35
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();

      oscillator.stop(
        audioContext.currentTime + 0.4
      );

      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;

      oscillator.onended = () => {
        try {
          oscillator.disconnect();
        } catch {
          // Ignore.
        }

        try {
          gainNode.disconnect();
        } catch {
          // Ignore.
        }

        if (oscillatorRef.current === oscillator) {
          oscillatorRef.current = null;
        }

        if (gainNodeRef.current === gainNode) {
          gainNodeRef.current = null;
        }
      };
    } catch (error) {
      console.error(
        "Buzzer sound failed:",
        error
      );
    }
  };

  const startBuzzerSound = () => {
    stopBuzzerSound();

    if (muted) return;

    playBuzzerSound();

    buzzerIntervalRef.current =
      setInterval(() => {
        if (!muted) {
          playBuzzerSound();
        }
      }, 900);
  };

  const handleBuzzerToggle = () => {
    if (buzzerEnabled) {
      stopBuzzerSound();

      setBuzzerEnabled(false);
      setMuted(false);

      return;
    }

    /*
     * The first sound is triggered directly
     * by the user's button click.
     * This is important because browsers
     * block automatic audio playback.
     */
    setBuzzerEnabled(true);
    setMuted(false);

    playBuzzerSound();

    buzzerIntervalRef.current =
      setInterval(() => {
        playBuzzerSound();
      }, 900);
  };

  const handleMuteToggle = () => {
    setMuted((currentMuted) => {
      const nextMuted = !currentMuted;

      if (nextMuted) {
        stopBuzzerSound();
      } else if (buzzerEnabled) {
        startBuzzerSound();
      }

      return nextMuted;
    });
  };

  /* =======================================================
     CLEANUP AUDIO
  ======================================================= */

  useEffect(() => {
    return () => {
      stopBuzzerSound();

      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {
          // Ignore close errors.
        }

        audioContextRef.current = null;
      }
    };
  }, []);

  /* =======================================================
     FETCH DASHBOARD
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

      if (!result?.data) {
        throw new Error("Invalid dashboard response");
      }

      setDashboard(result.data);
    } catch (err) {
      console.error(
        "Dashboard fetch failed:",
        err
      );

      setError(
        "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* =======================================================
     DASHBOARD DATA
  ======================================================= */

  const summary = dashboard?.summary || {
    totalEvents: 0,
    activeEvents: 0,
    resolvedEvents: 0,
  };

  const eventsBySource =
    dashboard?.eventsBySource || [];

  const eventsByType =
    dashboard?.eventsByType || [];

  const recentEvents =
    dashboard?.recentEvents || [];

  const criticalEvents =
    dashboard?.criticalEvents || [];

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const activeEvents = useMemo(() => {
    return recentEvents.filter(
      (event) =>
        String(
          event?.status || "active"
        ).toLowerCase() !== "resolved"
    );
  }, [recentEvents]);

  const criticalCount = useMemo(() => {
    const backendCritical =
      dashboard?.summary?.criticalEvents;

    if (typeof backendCritical === "number") {
      return backendCritical;
    }

    return criticalEvents.length;
  }, [dashboard, criticalEvents]);

  const citizenReports = useMemo(() => {
    const citizenSource =
      eventsBySource.find(
        (source) =>
          String(
            source?.source
          ).toLowerCase() === "citizen"
      );

    return citizenSource?.count || 0;
  }, [eventsBySource]);

  const trafficEvents = useMemo(() => {
    const trafficSource =
      eventsBySource.find(
        (source) =>
          String(
            source?.source
          ).toLowerCase() === "traffic"
      );

    return trafficSource?.count || 0;
  }, [eventsBySource]);

  const resolutionRate = useMemo(() => {
    if (!summary.totalEvents) return 0;

    return Math.round(
      (summary.resolvedEvents /
        summary.totalEvents) *
        100
    );
  }, [summary]);

  const trafficStatus = useMemo(() => {
    if (!trafficEvents) return "Normal";

    if (trafficEvents > 100) {
      return "Heavy";
    }

    if (trafficEvents > 50) {
      return "Moderate";
    }

    return "Normal";
  }, [trafficEvents]);

  const securityAlerts = useMemo(() => {
    return criticalEvents.filter((event) => {
      const severity = String(
        event?.severity || ""
      ).toLowerCase();

      return (
        severity === "critical" ||
        severity === "high"
      );
    });
  }, [criticalEvents]);

  const primarySecurityAlert =
    securityAlerts[0];

  const securityAlarmActive =
    securityAlerts.length > 0;

  /* =======================================================
     SOURCE MAX VALUE
  ======================================================= */

  const sourceMax = useMemo(() => {
    if (!eventsBySource.length) return 1;

    return Math.max(
      ...eventsBySource.map(
        (item) =>
          Number(item?.count) || 0
      ),
      1
    );
  }, [eventsBySource]);

  /* =======================================================
     EVENT TYPE MAX
  ======================================================= */

  const eventTypeMax = useMemo(() => {
    if (!eventsByType.length) return 1;

    return Math.max(
      ...eventsByType.map(
        (item) =>
          Number(item?.count) || 0
      ),
      1
    );
  }, [eventsByType]);

  /* =======================================================
     KPI CARDS
  ======================================================= */

  const kpis = [
    {
      id: "alerts",
      label: "Alerts",
      value: summary.activeEvents,
      change:
        summary.activeEvents > 0
          ? "Requires attention"
          : "No active alerts",
      icon: Bell,
      type: "alerts",
    },

    {
      id: "critical",
      label: "Critical",
      value: criticalCount,
      change:
        criticalCount > 0
          ? "High priority"
          : "No critical events",
      icon: Siren,
      type: "critical",
    },

    {
      id: "traffic",
      label: "Traffic",
      value:
        trafficEvents > 0
          ? `${Math.min(
              100,
              Math.max(
                10,
                Math.round(
                  (trafficEvents /
                    Math.max(
                      summary.totalEvents ||
                        1,
                      1
                    )) *
                    100
                )
              )
            )}%`
          : "0%",
      change: trafficStatus,
      icon: TrafficCone,
      type: "traffic",
    },

    {
      id: "reports",
      label: "Reports",
      value: citizenReports,
      change:
        citizenReports > 0
          ? "Citizen activity"
          : "No reports",
      icon: Users,
      type: "reports",
    },
  ];

  /* =======================================================
     CITY SERVICES
  ======================================================= */

  const cityServices = [
    {
      id: "traffic",
      name: "Traffic",
      icon: TrafficCone,
      status: "Operational",
      type: "traffic",
    },

    {
      id: "water",
      name: "Water",
      icon: Droplets,
      status: "Operational",
      type: "water",
    },

    {
      id: "electricity",
      name: "Electricity",
      icon: Zap,
      status: "Operational",
      type: "electricity",
    },

    {
      id: "emergency",
      name: "Emergency",
      icon: Ambulance,
      status:
        securityAlarmActive
          ? "Attention Required"
          : "Operational",
      type: securityAlarmActive
        ? "warning"
        : "emergency",
    },
  ];

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

            <div className="dashboard-kpi-grid">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    className="skeleton skeleton-card"
                    key={item}
                  />
                )
              )}
            </div>

            <div className="dashboard-main-grid">
              <div className="skeleton skeleton-map" />
              <div className="skeleton skeleton-security" />
            </div>

            <div className="dashboard-main-grid">
              <div className="skeleton skeleton-chart" />
              <div className="skeleton skeleton-incidents" />
            </div>

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

            <h2>
              Dashboard unavailable
            </h2>

            <p>{error}</p>

            <button
              className="dashboard-button"
              onClick={() =>
                fetchDashboard()
              }
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
     RENDER
  ======================================================= */

  return (
    <div className="dashboard-page">

      <div className="dashboard-container">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="dashboard-topbar">

          <div className="dashboard-brand">

            <div className="dashboard-brand-mark">
              <Radio size={18} />
            </div>

            <div>
              <strong>
                CITYPULSE
              </strong>

              <span>
                Smart City Operations
              </span>
            </div>

          </div>

          <div className="dashboard-top-actions">

            <button
              className="dashboard-icon-button"
              title="Notifications"
            >
              <Bell size={18} />

              {criticalCount > 0 && (
                <span className="notification-dot">
                  {criticalCount > 9
                    ? "9+"
                    : criticalCount}
                </span>
              )}
            </button>

            <div className="dashboard-admin">

              <div className="admin-avatar">
                A
              </div>

              <div>
                <strong>
                  Admin
                </strong>

                <span>
                  Administrator
                </span>
              </div>

            </div>

            <div className="dashboard-live-status">
              <span />
              LIVE
            </div>

          </div>

        </header>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="dashboard-welcome">

          <div>

            <span className="dashboard-eyebrow">
              CITY OPERATIONS CENTER
            </span>

            <h1>
              Good evening, Admin
              <span className="welcome-wave">
                👋
              </span>
            </h1>

            <p>
              Here's what's happening
              across Jaipur right now.
            </p>

          </div>

          <button
            className="dashboard-button refresh-button"
            onClick={() =>
              fetchDashboard(true)
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </section>

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <section className="dashboard-kpi-grid">

          {kpis.map((kpi) => {
            const Icon = kpi.icon;

            return (
              <article
                key={kpi.id}
                className={`dashboard-kpi-card kpi-${kpi.type}`}
              >

                <div className="kpi-top">

                  <span className="kpi-label">
                    {kpi.label}
                  </span>

                  <div className="kpi-icon">
                    <Icon size={18} />
                  </div>

                </div>

                <strong className="kpi-value">
                  {String(
                    kpi.value
                  ).padStart(
                    typeof kpi.value ===
                      "number"
                      ? 2
                      : 0,
                    "0"
                  )}
                </strong>

                <span className="kpi-change">
                  {kpi.change}
                </span>

              </article>
            );
          })}

        </section>

        {/* =================================================
            SYSTEM STATUS
        ================================================= */}

        <section className="dashboard-system-bar">

          <div className="system-status-left">

            <div className="system-icon">
              <ShieldCheck size={18} />
            </div>

            <div>

              <span className="system-label">
                SYSTEM STATUS
              </span>

              <strong className="system-online">
                <i />
                All systems operational
              </strong>

            </div>

          </div>

          <div className="system-status-right">

            <Clock3 size={14} />

            <span>
              Live monitoring active
            </span>

            <span className="system-divider" />

            <span>
              Resolution {resolutionRate}%
            </span>

          </div>

        </section>

        {/* =================================================
            MAP + SECURITY CENTER
        ================================================= */}

        <section className="dashboard-main-grid">

          {/* INCIDENT MAP */}

          <article className="dashboard-panel incident-map-panel">

            <div className="panel-header">

              <div>

                <span className="panel-eyebrow">
                  LIVE OPERATIONS
                </span>

                <h2>
                  City Incident Map
                </h2>

                <p>
                  Current incident activity
                  across Jaipur.
                </p>

              </div>

              <div className="panel-live">
                <span />
                LIVE
              </div>

            </div>

            <div className="incident-map">

              <div className="map-grid" />

              <div className="map-road map-road-one" />
              <div className="map-road map-road-two" />
              <div className="map-road map-road-three" />

              {recentEvents
                .slice(0, 8)
                .map(
                  (
                    event,
                    index
                  ) => {

                    const severity =
                      String(
                        event?.severity ||
                          "normal"
                      ).toLowerCase();

                    return (
                      <div
                        key={
                          event?._id ||
                          `map-${index}`
                        }
                        className={`map-marker map-marker-${severity}`}
                        style={{
                          "--marker-x":
                            `${15 + ((index * 19) % 72)}%`,
                          "--marker-y":
                            `${20 + ((index * 29) % 62)}%`,
                        }}
                        title={
                          event?.title ||
                          "City incident"
                        }
                      >
                        <span />
                      </div>
                    );
                  }
                )}

              {recentEvents.length ===
                0 && (
                <div className="map-empty">

                  <MapPin size={24} />

                  <span>
                    No active incidents
                  </span>

                </div>
              )}

              <div className="map-location-label">
                Jaipur
              </div>

            </div>

            <div className="map-legend">

              <span>
                <i className="legend-dot legend-traffic" />
                Traffic
              </span>

              <span>
                <i className="legend-dot legend-emergency" />
                Emergency
              </span>

              <span>
                <i className="legend-dot legend-weather" />
                Weather
              </span>

              <span>
                <i className="legend-dot legend-normal" />
                Normal
              </span>

            </div>

          </article>

          {/* SECURITY CENTER */}

          <article
            className={`dashboard-panel security-center ${
              securityAlarmActive
                ? "security-center-active"
                : ""
            }`}
          >

            <div className="panel-header">

              <div>

                <span className="panel-eyebrow">
                  SECURITY
                </span>

                <h2>
                  Security Center
                </h2>

                <p>
                  High-priority incident
                  monitoring.
                </p>

              </div>

              <div className="security-status-icon">

                {securityAlarmActive ? (
                  <Siren size={18} />
                ) : (
                  <ShieldCheck size={18} />
                )}

              </div>

            </div>

            {securityAlarmActive ? (

              <div className="security-alert-content">

                <div className="security-alert-header">

                  <div className="security-alert-icon">
                    <Siren size={22} />
                  </div>

                  <div>

                    <span>
                      {String(
                        primarySecurityAlert?.severity ||
                          "HIGH"
                      ).toUpperCase()}
                    </span>

                    <strong>
                      {primarySecurityAlert?.title ||
                        "Critical Security Alert"}
                    </strong>

                  </div>

                </div>

                <div className="security-alert-location">

                  <MapPin size={14} />

                  <span>
                    {primarySecurityAlert
                      ?.location?.address ||
                      "Location unavailable"}
                  </span>

                </div>

                <p className="security-alert-description">

                  {primarySecurityAlert
                    ?.description ||
                    `${securityAlerts.length} high-priority incident${
                      securityAlerts.length !==
                      1
                        ? "s"
                        : ""
                    } require attention.`}

                </p>

                {/* =================================================
                    BUZZER CONTROLS
                ================================================= */}

                <div className="security-alarm-controls">

                  <button
                    type="button"
                    className={`security-buzzer-button ${
                      buzzerEnabled
                        ? "active"
                        : ""
                    }`}
                    onClick={
                      handleBuzzerToggle
                    }
                  >

                    {buzzerEnabled ? (
                      <Volume2 size={16} />
                    ) : (
                      <VolumeX size={16} />
                    )}

                    {buzzerEnabled
                      ? "Buzzer Active"
                      : "Enable Buzzer"}

                  </button>

                  {buzzerEnabled && (
                    <button
                      type="button"
                      className="security-mute-button"
                      onClick={
                        handleMuteToggle
                      }
                    >

                      {muted ? (
                        <VolumeX size={16} />
                      ) : (
                        <Volume2 size={16} />
                      )}

                      {muted
                        ? "Muted"
                        : "Sound On"}

                    </button>
                  )}

                </div>

                <button
                  type="button"
                  className="security-view-button"
                  onClick={() => {
                    window.location.href =
                      "/alerts";
                  }}
                >
                  View Alert
                  <ExternalLink size={15} />
                </button>

              </div>

            ) : (

              <div className="security-clear-state">

                <div className="security-clear-icon">
                  <CheckCircle2 size={28} />
                </div>

                <strong>
                  No Critical Alerts
                </strong>

                <span>
                  CityPulse security
                  monitoring is operating
                  normally.
                </span>

                <div className="security-clear-status">
                  <span />
                  Security system
                  operational
                </div>

              </div>

            )}

          </article>

        </section>

        {/* =================================================
            ACTIVITY + LIVE INCIDENTS
        ================================================= */}

        <section className="dashboard-main-grid dashboard-secondary-grid">

          {/* ALERT ACTIVITY */}

          <article className="dashboard-panel activity-panel">

            <div className="panel-header">

              <div>

                <span className="panel-eyebrow">
                  ANALYTICS
                </span>

                <h2>
                  Alert Activity
                </h2>

                <p>
                  Recent civic activity
                  trend.
                </p>

              </div>

              <div className="panel-icon">
                <BarChart3 size={18} />
              </div>

            </div>

            <div className="activity-chart">

              <div className="chart-y-axis">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>

              <div className="chart-area">

                <div className="chart-grid-lines">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>

                <div className="chart-bars">

                  {[
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                    "Sun",
                  ].map(
                    (
                      day,
                      index
                    ) => {

                      const eventCount =
                        eventsByType[
                          index %
                            Math.max(
                              eventsByType.length,
                              1
                            )
                        ]?.count || 0;

                      const height =
                        eventCount > 0
                          ? Math.min(
                              90,
                              Math.max(
                                18,
                                eventCount
                              )
                            )
                          : [
                              35,
                              52,
                              42,
                              68,
                              55,
                              76,
                              62,
                            ][index];

                      return (
                        <div
                          className="chart-column"
                          key={day}
                        >

                          <div className="chart-bar-track">

                            <div
                              className="chart-bar"
                              style={{
                                height: `${height}%`,
                              }}
                            />

                          </div>

                          <span>
                            {day}
                          </span>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            </div>

          </article>

          {/* LIVE INCIDENTS */}

          <article className="dashboard-panel live-incidents-panel">

            <div className="panel-header">

              <div>

                <span className="panel-eyebrow">
                  LIVE FEED
                </span>

                <h2>
                  Live Incidents
                </h2>

                <p>
                  Latest events requiring
                  attention.
                </p>

              </div>

              <div className="panel-live">
                <span />
                LIVE
              </div>

            </div>

            <div className="live-incidents-list">

              {recentEvents
                .slice(0, 5)
                .map((event) => {

                  const severity =
                    String(
                      event?.severity ||
                        "normal"
                    ).toLowerCase();

                  const SeverityIcon =
                    getSeverityIcon(
                      severity
                    );

                  return (
                    <div
                      className="live-incident"
                      key={event._id}
                    >

                      <div
                        className={`live-incident-icon ${getSeverityClass(
                          severity
                        )}`}
                      >
                        <SeverityIcon
                          size={15}
                        />
                      </div>

                      <div className="live-incident-content">

                        <strong>
                          {event.title ||
                            "Untitled Event"}
                        </strong>

                        <span>
                          <MapPin size={11} />

                          {event.location
                            ?.address ||
                            "Location unavailable"}
                        </span>

                      </div>

                      <ChevronRight
                        size={15}
                        className="live-incident-arrow"
                      />

                    </div>
                  );
                })}

              {recentEvents.length ===
                0 && (
                <div className="live-empty">

                  <CheckCircle2 size={22} />

                  <span>
                    No live incidents
                  </span>

                </div>
              )}

            </div>

            <button
              type="button"
              className="view-all-button"
              onClick={() => {
                window.location.href =
                  "/alerts";
              }}
            >
              View all incidents
              <ChevronRight size={15} />
            </button>

          </article>

        </section>

        {/* =================================================
            SOURCE / TYPE ANALYTICS
        ================================================= */}

        <section className="dashboard-analytics-grid">

          {/* EVENTS BY SOURCE */}

          <article className="dashboard-panel analytics-panel">

            <div className="panel-header">

              <div>

                <span className="panel-eyebrow">
                  DATA SOURCES
                </span>

                <h2>
                  Events by Source
                </h2>

              </div>

              <Radio size={18} />

            </div>

            <div className="source-list">

              {eventsBySource.map(
                (source) => {

                  const config =
                    sourceConfig[
                      String(
                        source.source
                      ).toLowerCase()
                    ] || {
                      icon: Activity,
                      color: "system",
                      label:
                        source.source,
                    };

                  const Icon =
                    config.icon;

                  const count =
                    Number(
                      source.count
                    ) || 0;

                  const percentage =
                    Math.round(
                      (count /
                        sourceMax) *
                        100
                    );

                  return (
                    <div
                      className="source-analytics-row"
                      key={
                        source.source
                      }
                    >

                      <div className="source-analytics-main">

                        <div
                          className={`source-analytics-icon ${config.color}`}
                        >
                          <Icon size={16} />
                        </div>

                        <div>

                          <strong>
                            {config.label ||
                              source.source}
                          </strong>

                          <span>
                            {count} events
                          </span>

                        </div>

                      </div>

                      <div className="source-progress">

                        <div className="source-progress-track">

                          <div
                            className={`source-progress-fill ${config.color}`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                        <b>
                          {count}
                        </b>

                      </div>

                    </div>
                  );
                }
              )}

              {eventsBySource.length ===
                0 && (
                <div className="empty-state">
                  No source data
                  available.
                </div>
              )}

            </div>

          </article>

          {/* EVENTS BY TYPE */}

          <article className="dashboard-panel analytics-panel">

            <div className="panel-header">

              <div>

                <span className="panel-eyebrow">
                  EVENT ANALYTICS
                </span>

                <h2>
                  Events by Type
                </h2>

              </div>

              <BarChart3 size={18} />

            </div>

            <div className="type-analytics-list">

              {eventsByType.map(
                (event) => {

                  const count =
                    Number(
                      event.count
                    ) || 0;

                  const percentage =
                    Math.round(
                      (count /
                        eventTypeMax) *
                        100
                    );

                  return (
                    <div
                      className="type-analytics-row"
                      key={
                        event.eventType
                      }
                    >

                      <div className="type-analytics-top">

                        <span>
                          {formatEventType(
                            event.eventType
                          )}
                        </span>

                        <b>
                          {count}
                        </b>

                      </div>

                      <div className="type-progress-track">

                        <div
                          className="type-progress-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

              {eventsByType.length ===
                0 && (
                <div className="empty-state">
                  No event type data
                  available.
                </div>
              )}

            </div>

          </article>

        </section>

        {/* =================================================
            CITY SERVICES
        ================================================= */}

        <section className="dashboard-panel city-services-panel">

          <div className="panel-header">

            <div>

              <span className="panel-eyebrow">
                INFRASTRUCTURE
              </span>

              <h2>
                City Services
              </h2>

              <p>
                Current operational status
                of connected city
                services.
              </p>

            </div>

            <div className="panel-icon">
              <Waves size={18} />
            </div>

          </div>

          <div className="city-services-grid">

            {cityServices.map(
              (service) => {

                const Icon =
                  service.icon;

                return (
                  <div
                    className={`city-service service-${service.type}`}
                    key={service.id}
                  >

                    <div className="city-service-icon">
                      <Icon size={18} />
                    </div>

                    <div className="city-service-info">

                      <strong>
                        {service.name}
                      </strong>

                      <span>
                        <i />
                        {service.status}
                      </span>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </section>

        {/* =================================================
            RECENT EVENTS TABLE
        ================================================= */}

        <section className="dashboard-panel recent-events-panel">

          <div className="panel-header">

            <div>

              <span className="panel-eyebrow">
                EVENT LOG
              </span>

              <h2>
                Recent Events
              </h2>

              <p>
                Latest civic activity
                received by CityPulse.
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

            {recentEvents.map(
              (event) => {

                const severity =
                  String(
                    event?.severity ||
                      "normal"
                  ).toLowerCase();

                return (
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
                          {event.title ||
                            "Untitled event"}
                        </strong>

                        <span>
                          {formatDate(
                            event.createdAt
                          )}
                        </span>

                      </div>

                    </div>

                    <div className="event-location">

                      <MapPin size={13} />

                      {event.location
                        ?.address ||
                        "Location unavailable"}

                    </div>

                    <div>

                      <span className="source-badge">
                        {event.source ||
                          "unknown"}
                      </span>

                    </div>

                    <div>

                      <span
                        className={`severity-badge ${getSeverityClass(
                          severity
                        )}`}
                      >
                        {severity}
                      </span>

                    </div>

                    <ChevronRight
                      className="event-arrow"
                      size={17}
                    />

                  </div>
                );
              }
            )}

            {recentEvents.length ===
              0 && (
              <div className="empty-events">

                <Activity size={25} />

                <p>
                  No recent events
                  found.
                </p>

              </div>
            )}

          </div>

        </section>

        {/* =================================================
            CRITICAL EVENTS
        ================================================= */}

        <section className="dashboard-panel critical-panel">

          <div className="critical-header">

            <div className="critical-title">

              <div className="critical-icon">
                <AlertTriangle size={18} />
              </div>

              <div>

                <span className="panel-eyebrow">
                  PRIORITY MONITOR
                </span>

                <h2>
                  Critical Events
                </h2>

                <p>
                  High-priority events
                  requiring attention.
                </p>

              </div>

            </div>

            {criticalEvents.length >
              0 && (
              <span className="critical-count">
                {criticalEvents.length} Active
              </span>
            )}

          </div>

          <div className="critical-content">

            {criticalEvents.length >
            0 ? (

              criticalEvents.map(
                (event) => {

                  const severity =
                    String(
                      event?.severity ||
                        "critical"
                    ).toLowerCase();

                  return (
                    <div
                      className="critical-event"
                      key={event._id}
                    >

                      <div className="critical-event-info">

                        <strong>
                          {event.title ||
                            "Critical Event"}
                        </strong>

                        <span>

                          <MapPin size={12} />

                          {event.location
                            ?.address ||
                            "Location unavailable"}

                        </span>

                      </div>

                      <span
                        className={`severity-badge ${getSeverityClass(
                          severity
                        )}`}
                      >
                        {severity}
                      </span>

                    </div>
                  );
                }
              )

            ) : (

              <div className="no-critical">

                <CheckCircle2 size={19} />

                <div>

                  <strong>
                    No critical events
                  </strong>

                  <span>
                    CityPulse has no
                    high-priority events
                    requiring attention.
                  </span>

                </div>

              </div>
            )}

          </div>

        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="dashboard-footer">

          <div className="footer-status">

            <div className="footer-status-icon">
              <CheckCircle2 size={16} />
            </div>

            <section>

              <strong>
                CityPulse Systems Online
              </strong>

              <span>
                Backend • Data Sources •
                Monitoring • Dashboard
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