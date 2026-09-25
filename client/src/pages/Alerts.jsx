import { useEffect, useMemo, useRef, useState } from "react";

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Siren,
  Activity,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";

import "./Alerts.css";

function formatDate(value) {
  if (!value) return "Recently";

  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Recently";
  }
}

function normalizeSeverity(value = "") {
  return value.toLowerCase();
}

function severityLabel(value = "") {
  if (!value) return "Normal";

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function getSeverityClass(value = "") {
  const severity = normalizeSeverity(value);

  if (severity === "critical") return "alert-severity-critical";
  if (severity === "high") return "alert-severity-high";
  if (severity === "medium") return "alert-severity-medium";

  return "alert-severity-normal";
}

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  // =========================================================
  // BUZZER STATE
  // =========================================================

  const [buzzerEnabled, setBuzzerEnabled] = useState(false);
  const [buzzerMuted, setBuzzerMuted] = useState(false);
  const [alarmAcknowledged, setAlarmAcknowledged] = useState(false);

  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const buzzerIntervalRef = useRef(null);

  // =========================================================
  // DEMO ALERT DATA
  // =========================================================

  const demoAlerts = [
    {
      _id: "alert-1",
      title: "Heavy Traffic Detected",
      description:
        "Unusual traffic congestion has been detected in the central city area.",
      severity: "high",
      status: "active",
      source: "traffic",
      location: {
        address: "MI Road, Jaipur",
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: "alert-2",
      title: "Heavy Rain Warning",
      description:
        "Weather monitoring systems indicate heavy rainfall activity.",
      severity: "medium",
      status: "active",
      source: "weather",
      location: {
        address: "Vaishali Nagar, Jaipur",
      },
      createdAt: new Date(
        Date.now() - 1000 * 60 * 20
      ).toISOString(),
    },
    {
      _id: "alert-3",
      title: "Citizen Emergency Report",
      description:
        "A citizen has reported a potential public safety issue.",
      severity: "critical",
      status: "active",
      source: "citizen",
      location: {
        address: "C-Scheme, Jaipur",
      },
      createdAt: new Date(
        Date.now() - 1000 * 60 * 45
      ).toISOString(),
    },
    {
      _id: "alert-4",
      title: "Road Obstruction Resolved",
      description:
        "Previously reported road obstruction has been successfully resolved.",
      severity: "normal",
      status: "resolved",
      source: "traffic",
      location: {
        address: "Tonk Road, Jaipur",
      },
      createdAt: new Date(
        Date.now() - 1000 * 60 * 90
      ).toISOString(),
    },
  ];

  // =========================================================
  // LOAD ALERTS
  // =========================================================

  const loadAlerts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      await new Promise((resolve) =>
        setTimeout(resolve, 350)
      );

      setAlerts(demoAlerts);

      // New alert data should allow the alarm to trigger again
      setAlarmAcknowledged(false);
    } catch (err) {
      console.error("Alerts loading failed:", err);
      setError("Unable to load alerts.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts();

    // Check for new alerts periodically.
    const interval = setInterval(() => {
      loadAlerts(true);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================================================
  // SUMMARY
  // =========================================================

  const summary = useMemo(() => {
    const critical = alerts.filter(
      (alert) =>
        normalizeSeverity(alert.severity) === "critical"
    ).length;

    const high = alerts.filter(
      (alert) =>
        normalizeSeverity(alert.severity) === "high"
    ).length;

    const medium = alerts.filter(
      (alert) =>
        normalizeSeverity(alert.severity) === "medium"
    ).length;

    const active = alerts.filter(
      (alert) => alert.status !== "resolved"
    ).length;

    return {
      total: alerts.length,
      active,
      critical,
      high,
      medium,
    };
  }, [alerts]);

  // =========================================================
  // DANGEROUS ALERTS
  // =========================================================

  const dangerousAlerts = useMemo(() => {
    return alerts.filter(
      (alert) =>
        alert.status !== "resolved" &&
        (normalizeSeverity(alert.severity) === "high" ||
          normalizeSeverity(alert.severity) === "critical")
    );
  }, [alerts]);

  const hasDangerousAlert = dangerousAlerts.length > 0;

  const highestSeverity = useMemo(() => {
    if (
      dangerousAlerts.some(
        (alert) =>
          normalizeSeverity(alert.severity) === "critical"
      )
    ) {
      return "critical";
    }

    if (
      dangerousAlerts.some(
        (alert) =>
          normalizeSeverity(alert.severity) === "high"
      )
    ) {
      return "high";
    }

    return null;
  }, [dangerousAlerts]);

  // =========================================================
  // CREATE AUDIO CONTEXT
  // =========================================================

  const createAudioContext = async () => {
    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) {
        console.warn(
          "Web Audio API is not supported by this browser."
        );
        return null;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      return audioContext;
    } catch (error) {
      console.error(
        "Unable to create audio context:",
        error
      );

      return null;
    }
  };

  // =========================================================
  // START BUZZER
  // =========================================================

  const startBuzzer = async () => {
    if (
      !buzzerEnabled ||
      buzzerMuted ||
      !hasDangerousAlert ||
      alarmAcknowledged
    ) {
      return;
    }

    if (oscillatorRef.current) {
      return;
    }

    const audioContext = await createAudioContext();

    if (!audioContext) {
      return;
    }

    try {
      const oscillator =
        audioContext.createOscillator();

      const gainNode =
        audioContext.createGain();

      oscillator.type = "square";

      oscillator.frequency.setValueAtTime(
        highestSeverity === "critical"
          ? 1000
          : 800,
        audioContext.currentTime
      );

      gainNode.gain.setValueAtTime(
        0.12,
        audioContext.currentTime
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();

      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;

      // Alternate frequency to create a siren/buzzer effect.
      let highTone = true;

      buzzerIntervalRef.current = setInterval(() => {
        if (
          !oscillatorRef.current ||
          !audioContextRef.current
        ) {
          return;
        }

        highTone = !highTone;

        const frequency =
          highestSeverity === "critical"
            ? highTone
              ? 1100
              : 700
            : highTone
            ? 900
            : 600;

        try {
          oscillator.frequency.setValueAtTime(
            frequency,
            audioContext.currentTime
          );
        } catch {
          // Audio context may have already stopped.
        }
      }, 350);
    } catch (error) {
      console.error(
        "Unable to start buzzer:",
        error
      );
    }
  };

  // =========================================================
  // STOP BUZZER
  // =========================================================

  const stopBuzzer = () => {
    try {
      if (buzzerIntervalRef.current) {
        clearInterval(buzzerIntervalRef.current);
        buzzerIntervalRef.current = null;
      }

      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch {
          // Already stopped.
        }

        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }

      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
    } catch (error) {
      console.error(
        "Unable to stop buzzer:",
        error
      );
    }
  };

  // =========================================================
  // ENABLE BUZZER
  // =========================================================

  const handleEnableBuzzer = async () => {
    setBuzzerEnabled(true);
    setBuzzerMuted(false);
    setAlarmAcknowledged(false);

    const audioContext = await createAudioContext();

    if (!audioContext) {
      return;
    }

    // Start immediately if dangerous alert exists.
    if (hasDangerousAlert) {
      try {
        const oscillator =
          audioContext.createOscillator();

        const gainNode =
          audioContext.createGain();

        oscillator.type = "square";

        oscillator.frequency.setValueAtTime(
          900,
          audioContext.currentTime
        );

        gainNode.gain.setValueAtTime(
          0.12,
          audioContext.currentTime
        );

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();

        oscillatorRef.current = oscillator;
        gainNodeRef.current = gainNode;

        let highTone = true;

        buzzerIntervalRef.current = setInterval(() => {
          if (
            !oscillatorRef.current ||
            !audioContextRef.current
          ) {
            return;
          }

          highTone = !highTone;

          try {
            oscillator.frequency.setValueAtTime(
              highestSeverity === "critical"
                ? highTone
                  ? 1100
                  : 700
                : highTone
                ? 900
                : 600,
              audioContext.currentTime
            );
          } catch {
            // Ignore stopped audio context.
          }
        }, 350);
      } catch (error) {
        console.error(
          "Unable to enable buzzer:",
          error
        );
      }
    }
  };

  // =========================================================
  // MUTE BUZZER
  // =========================================================

  const handleMuteBuzzer = () => {
    setBuzzerMuted(true);
    stopBuzzer();
  };

  // =========================================================
  // ACKNOWLEDGE ALARM
  // =========================================================

  const handleAcknowledgeAlarm = () => {
    setAlarmAcknowledged(true);
    stopBuzzer();
  };

  // =========================================================
  // AUTOMATIC BUZZER RESPONSE
  // =========================================================

  useEffect(() => {
    if (
      buzzerEnabled &&
      !buzzerMuted &&
      !alarmAcknowledged &&
      hasDangerousAlert
    ) {
      startBuzzer();
    } else {
      stopBuzzer();
    }

    return () => {
      stopBuzzer();
    };
  }, [
    buzzerEnabled,
    buzzerMuted,
    alarmAcknowledged,
    hasDangerousAlert,
    highestSeverity,
  ]);

  // =========================================================
  // CLEANUP AUDIO
  // =========================================================

  useEffect(() => {
    return () => {
      stopBuzzer();

      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {
          // Ignore already closed context.
        }

        audioContextRef.current = null;
      }
    };
  }, []);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredAlerts = useMemo(() => {
    if (filter === "all") return alerts;

    if (filter === "active") {
      return alerts.filter(
        (alert) => alert.status !== "resolved"
      );
    }

    if (filter === "critical") {
      return alerts.filter(
        (alert) =>
          normalizeSeverity(alert.severity) ===
          "critical"
      );
    }

    if (filter === "high") {
      return alerts.filter(
        (alert) =>
          normalizeSeverity(alert.severity) === "high"
      );
    }

    if (filter === "resolved") {
      return alerts.filter(
        (alert) => alert.status === "resolved"
      );
    }

    return alerts;
  }, [alerts, filter]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="alerts-page">
        <div className="alerts-container">
          <div className="alerts-loading">
            <div className="alerts-skeleton alerts-skeleton-small" />
            <div className="alerts-skeleton alerts-skeleton-title" />
            <div className="alerts-skeleton alerts-skeleton-text" />

            <div className="alerts-summary-grid">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="alerts-skeleton alerts-skeleton-card"
                />
              ))}
            </div>

            <div className="alerts-skeleton alerts-skeleton-large" />
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <main className="alerts-page">
        <div className="alerts-container">
          <div className="alerts-error">
            <div className="alerts-error-icon">
              <AlertTriangle size={28} />
            </div>

            <h2>Alerts unavailable</h2>

            <p>{error}</p>

            <button
              className="alerts-primary-button"
              onClick={() => loadAlerts()}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="alerts-page">
      <div className="alerts-container">

        {/* =================================================
            SECURITY BUZZER
        ================================================== */}

        {hasDangerousAlert && (
          <section
            className={`alerts-buzzer ${
              highestSeverity === "critical"
                ? "alerts-buzzer-critical"
                : "alerts-buzzer-high"
            } ${
              buzzerEnabled &&
              !buzzerMuted &&
              !alarmAcknowledged
                ? "alerts-buzzer-active"
                : ""
            }`}
          >
            <div className="alerts-buzzer-icon">
              <Siren size={22} />
            </div>

            <div className="alerts-buzzer-content">
              <div className="alerts-buzzer-title">
                <strong>
                  {highestSeverity === "critical"
                    ? "CRITICAL SECURITY ALERT"
                    : "HIGH PRIORITY ALERT"}
                </strong>

                <span>
                  {dangerousAlerts.length} active{" "}
                  {dangerousAlerts.length === 1
                    ? "incident"
                    : "incidents"}
                </span>
              </div>

              <p>
                Immediate attention required. CityPulse
                detected a high-priority civic incident.
              </p>
            </div>

            <div className="alerts-buzzer-actions">
              {!buzzerEnabled ? (
                <button
                  type="button"
                  className="alerts-buzzer-button"
                  onClick={handleEnableBuzzer}
                >
                  <Volume2 size={16} />
                  Enable Buzzer
                </button>
              ) : buzzerMuted ? (
                <button
                  type="button"
                  className="alerts-buzzer-button"
                  onClick={() => {
                    setBuzzerMuted(false);
                    setAlarmAcknowledged(false);
                  }}
                >
                  <Volume2 size={16} />
                  Unmute
                </button>
              ) : (
                <button
                  type="button"
                  className="alerts-buzzer-button"
                  onClick={handleMuteBuzzer}
                >
                  <VolumeX size={16} />
                  Mute
                </button>
              )}

              {buzzerEnabled && (
                <button
                  type="button"
                  className="alerts-buzzer-ack"
                  onClick={handleAcknowledgeAlarm}
                >
                  <CheckCircle2 size={16} />
                  Acknowledge
                </button>
              )}
            </div>
          </section>
        )}

        {/* =================================================
            HEADER
        ================================================== */}

        <section className="alerts-header">
          <div className="alerts-header-content">

            <div className="alerts-eyebrow">
              <span className="alerts-eyebrow-dot" />
              CITYPULSE MONITORING
            </div>

            <h1>Alerts & Incidents</h1>

            <p>
              Monitor high-priority civic events, safety warnings and
              operational alerts across the city.
            </p>
          </div>

          <button
            className="alerts-refresh-button"
            onClick={() => loadAlerts(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "alerts-spin" : ""}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </section>

        {/* =================================================
            SYSTEM STATUS
        ================================================== */}

        <section className="alerts-system-bar">
          <div className="alerts-system-left">

            <div className="alerts-system-icon">
              <ShieldAlert size={19} />
            </div>

            <div>
              <span>Alert Monitoring</span>

              <strong>
                <i />
                Operational
              </strong>
            </div>
          </div>

          <div className="alerts-system-time">
            <Clock3 size={14} />
            Real-time monitoring active
          </div>
        </section>

        {/* =================================================
            BUZZER STATUS
        ================================================== */}

        <section className="alerts-buzzer-status">

          <div className="alerts-buzzer-status-left">
            <div
              className={`alerts-buzzer-status-dot ${
                buzzerEnabled && !buzzerMuted
                  ? "alerts-buzzer-status-live"
                  : ""
              }`}
            />

            <div>
              <strong>
                Security Buzzer
              </strong>

              <span>
                {!buzzerEnabled
                  ? "Not enabled"
                  : buzzerMuted
                  ? "Muted"
                  : hasDangerousAlert
                  ? "Monitoring HIGH / CRITICAL alerts"
                  : "Armed and monitoring"}
              </span>
            </div>
          </div>

          {!buzzerEnabled && (
            <button
              type="button"
              className="alerts-enable-small"
              onClick={handleEnableBuzzer}
            >
              <Zap size={14} />
              Enable
            </button>
          )}

          {buzzerEnabled && buzzerMuted && (
            <button
              type="button"
              className="alerts-enable-small"
              onClick={() => {
                setBuzzerMuted(false);
                setAlarmAcknowledged(false);
              }}
            >
              <Volume2 size={14} />
              Unmute
            </button>
          )}
        </section>

        {/* =================================================
            SUMMARY
        ================================================== */}

        <section className="alerts-summary-grid">

          <article className="alert-summary-card">
            <div className="alert-summary-top">
              <span>Total Alerts</span>

              <div className="alert-summary-icon alert-icon-blue">
                <Bell size={18} />
              </div>
            </div>

            <strong>
              {String(summary.total).padStart(2, "0")}
            </strong>

            <small>All monitored alerts</small>
          </article>

          <article className="alert-summary-card">
            <div className="alert-summary-top">
              <span>Active</span>

              <div className="alert-summary-icon alert-icon-orange">
                <Activity size={18} />
              </div>
            </div>

            <strong>
              {String(summary.active).padStart(2, "0")}
            </strong>

            <small>Currently requiring attention</small>
          </article>

          <article className="alert-summary-card">
            <div className="alert-summary-top">
              <span>Critical</span>

              <div className="alert-summary-icon alert-icon-red">
                <Siren size={18} />
              </div>
            </div>

            <strong>
              {String(summary.critical).padStart(2, "0")}
            </strong>

            <small>Highest priority incidents</small>
          </article>

          <article className="alert-summary-card">
            <div className="alert-summary-top">
              <span>High Priority</span>

              <div className="alert-summary-icon alert-icon-yellow">
                <AlertTriangle size={18} />
              </div>
            </div>

            <strong>
              {String(summary.high).padStart(2, "0")}
            </strong>

            <small>High severity incidents</small>
          </article>

        </section>

        {/* =================================================
            ALERT LIST
        ================================================== */}

        <section className="alerts-panel">

          <div className="alerts-panel-header">

            <div>
              <span className="alerts-section-label">
                INCIDENT CENTER
              </span>

              <h2>Active Alerts</h2>

              <p>
                Review and monitor the latest city incidents.
              </p>
            </div>

            <div className="alerts-count">
              {filteredAlerts.length} alerts
            </div>
          </div>

          {/* FILTERS */}

          <div className="alerts-filters">

            <button
              className={
                filter === "all"
                  ? "alerts-filter-active"
                  : ""
              }
              onClick={() => setFilter("all")}
            >
              All
            </button>

            <button
              className={
                filter === "active"
                  ? "alerts-filter-active"
                  : ""
              }
              onClick={() => setFilter("active")}
            >
              Active
            </button>

            <button
              className={
                filter === "critical"
                  ? "alerts-filter-active"
                  : ""
              }
              onClick={() => setFilter("critical")}
            >
              Critical
            </button>

            <button
              className={
                filter === "high"
                  ? "alerts-filter-active"
                  : ""
              }
              onClick={() => setFilter("high")}
            >
              High
            </button>

            <button
              className={
                filter === "resolved"
                  ? "alerts-filter-active"
                  : ""
              }
              onClick={() => setFilter("resolved")}
            >
              Resolved
            </button>

          </div>

          {/* ALERTS */}

          <div className="alerts-list">

            {filteredAlerts.length === 0 ? (
              <div className="alerts-empty">

                <div className="alerts-empty-icon">
                  <CheckCircle2 size={25} />
                </div>

                <h3>No alerts found</h3>

                <p>
                  There are no incidents matching the selected filter.
                </p>

              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <article
                  key={alert._id}
                  className={`alert-item ${
                    normalizeSeverity(alert.severity) ===
                    "critical"
                      ? "alert-item-critical"
                      : ""
                  }`}
                >

                  <div className="alert-item-icon">
                    {normalizeSeverity(
                      alert.severity
                    ) === "critical" ? (
                      <Siren size={19} />
                    ) : (
                      <AlertTriangle size={19} />
                    )}
                  </div>

                  <div className="alert-item-main">

                    <div className="alert-item-title-row">

                      <h3>
                        {alert.title ||
                          "Untitled Alert"}
                      </h3>

                      <span
                        className={`alert-severity ${getSeverityClass(
                          alert.severity
                        )}`}
                      >
                        {severityLabel(
                          alert.severity
                        )}
                      </span>

                    </div>

                    <p className="alert-item-description">
                      {alert.description ||
                        "No additional information available."}
                    </p>

                    <div className="alert-item-meta">

                      <span>
                        <MapPin size={13} />
                        {alert.location?.address ||
                          "Location unavailable"}
                      </span>

                      <span>
                        <Clock3 size={13} />
                        {formatDate(
                          alert.createdAt
                        )}
                      </span>

                      <span className="alert-source">
                        {alert.source || "system"}
                      </span>

                    </div>

                  </div>

                  <div className="alert-item-status">

                    {alert.status === "resolved" ? (
                      <span className="alert-resolved">
                        <CheckCircle2 size={14} />
                        Resolved
                      </span>
                    ) : (
                      <span className="alert-active">
                        <i />
                        Active
                      </span>
                    )}

                  </div>

                </article>
              ))
            )}

          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================== */}

        <footer className="alerts-footer">

          <div>
            <CheckCircle2 size={16} />

            <div>
              <strong>
                CityPulse Alert System
              </strong>

              <span>
                Monitoring backend • data sources • civic incidents
              </span>
            </div>
          </div>

          <span>OPERATIONAL</span>

        </footer>

      </div>
    </main>
  );
}

export default Alerts;