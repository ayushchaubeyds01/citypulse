import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ExternalLink,
  Siren,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { getActiveAlerts } from "../services/api";
import "./SecurityAlarm.css";

function SecurityAlarm() {
  const [alerts, setAlerts] = useState([]);
  const [alarmActive, setAlarmActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [buzzerEnabled, setBuzzerEnabled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  // =========================================================
  // FETCH ACTIVE ALERTS
  // =========================================================

  const fetchAlerts = async () => {
    try {
      const response = await getActiveAlerts();

      if (!response?.success) {
        return;
      }

      const activeAlerts = Array.isArray(response.data)
        ? response.data
        : [];

      setAlerts(activeAlerts);

      const dangerousAlerts = activeAlerts.filter(
        (alert) =>
          alert?.status === "active" &&
          (String(alert?.severity).toLowerCase() === "high" ||
            String(alert?.severity).toLowerCase() === "critical")
      );

      const hasDangerousAlert = dangerousAlerts.length > 0;

      setAlarmActive(hasDangerousAlert);

      // If a NEW dangerous alert appears, show the alarm again.
      if (hasDangerousAlert && dismissed) {
        setDismissed(false);
      }
    } catch (error) {
      console.error("Security alarm alert fetch failed:", error);
    }
  };

  // =========================================================
  // INITIAL FETCH + POLLING
  // =========================================================

  useEffect(() => {
    fetchAlerts();

    const interval = setInterval(() => {
      fetchAlerts();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================================================
  // CREATE AUDIO CONTEXT
  // =========================================================

  const getAudioContext = async () => {
    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      console.warn("Web Audio API is not supported.");
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
  };

  // =========================================================
  // START BUZZER
  // =========================================================

  const startAlarmSound = async () => {
    if (muted || !buzzerEnabled || oscillatorRef.current) {
      return;
    }

    try {
      const audioContext = await getAudioContext();

      if (!audioContext) {
        return;
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "square";

      oscillator.frequency.setValueAtTime(
        880,
        audioContext.currentTime
      );

      gainNode.gain.setValueAtTime(
        0.055,
        audioContext.currentTime
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();

      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;
    } catch (error) {
      console.error("Unable to start security buzzer:", error);
    }
  };

  // =========================================================
  // STOP BUZZER
  // =========================================================

  const stopAlarmSound = () => {
    try {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch {
          // Oscillator may already be stopped.
        }

        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }

      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
    } catch (error) {
      console.error("Unable to stop security buzzer:", error);
    }
  };

  // =========================================================
  // ENABLE BUZZER
  // =========================================================

  const handleEnableBuzzer = async () => {
    try {
      setBuzzerEnabled(true);
      setMuted(false);

      const audioContext = await getAudioContext();

      if (!audioContext) {
        return;
      }

      // Because this function is triggered by a user click,
      // the browser allows audio playback here.
      await startAlarmSound();
    } catch (error) {
      console.error("Unable to enable security buzzer:", error);
    }
  };

  // =========================================================
  // MUTE / UNMUTE
  // =========================================================

  const handleMuteToggle = async () => {
    if (muted) {
      setMuted(false);
      return;
    }

    setMuted(true);
    stopAlarmSound();
  };

  // =========================================================
  // KEEP BUZZER IN SYNC WITH ALERT STATE
  // =========================================================

  useEffect(() => {
    if (
      alarmActive &&
      buzzerEnabled &&
      !muted &&
      !dismissed
    ) {
      startAlarmSound();
    } else {
      stopAlarmSound();
    }

    return () => {
      stopAlarmSound();
    };
  }, [
    alarmActive,
    buzzerEnabled,
    muted,
    dismissed,
  ]);

  // =========================================================
  // CLEANUP
  // =========================================================

  useEffect(() => {
    return () => {
      stopAlarmSound();

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  // =========================================================
  // DANGEROUS ALERTS
  // =========================================================

  const dangerousAlerts = alerts.filter(
    (alert) =>
      alert?.status === "active" &&
      (String(alert?.severity).toLowerCase() === "high" ||
        String(alert?.severity).toLowerCase() === "critical")
  );

  const hasDangerousAlerts = dangerousAlerts.length > 0;

  // =========================================================
  // DON'T SHOW IF THERE IS NO DANGEROUS ALERT
  // =========================================================

  if (!alarmActive || !hasDangerousAlerts || dismissed) {
    return null;
  }

  // =========================================================
  // HIGHEST SEVERITY
  // =========================================================

  const isCritical = dangerousAlerts.some(
    (alert) =>
      String(alert?.severity).toLowerCase() === "critical"
  );

  const highestSeverity = isCritical ? "critical" : "high";

  // =========================================================
  // PRIMARY INCIDENT
  // =========================================================

  const primaryAlert = dangerousAlerts[0];

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className={`security-alarm-wrapper ${
        isCritical
          ? "security-alarm-critical"
          : "security-alarm-high"
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="security-alarm-card">

        {/* =================================================
            TOP SEVERITY ACCENT
        ================================================== */}

        <div className="security-alarm-accent" />

        {/* =================================================
            ICON
        ================================================== */}

        <div className="security-alarm-icon-wrap">
          <div className="security-alarm-icon-pulse" />

          <div className="security-alarm-icon">
            {isCritical ? (
              <Siren size={23} strokeWidth={2.2} />
            ) : (
              <AlertTriangle size={23} strokeWidth={2.2} />
            )}
          </div>
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================== */}

        <div className="security-alarm-content">

          {/* Eyebrow */}

          <div className="security-alarm-title-row">
            <span className="security-alarm-live-dot" />

            <span className="security-alarm-label">
              CITYPULSE SECURITY
            </span>

            <span className="security-alarm-status">
              LIVE
            </span>
          </div>

          {/* Heading */}

          <div className="security-alarm-title">
            <h2>
              {isCritical
                ? "Critical Security Alert"
                : "High Priority Alert"}
            </h2>

            <span
              className={`security-alarm-badge ${
                isCritical
                  ? "security-alarm-badge-critical"
                  : "security-alarm-badge-high"
              }`}
            >
              {highestSeverity.toUpperCase()}
            </span>
          </div>

          {/* Message */}

          <p className="security-alarm-message">
            <strong>Immediate attention required.</strong>{" "}
            CityPulse detected{" "}
            <strong>{dangerousAlerts.length}</strong>{" "}
            active{" "}
            {dangerousAlerts.length === 1
              ? "incident"
              : "incidents"}{" "}
            requiring attention.
          </p>

          {/* =================================================
              PRIMARY INCIDENT
          ================================================== */}

          {primaryAlert && (
            <div className="security-alarm-incident">
              <div className="security-alarm-incident-icon">
                {isCritical ? (
                  <Siren size={15} />
                ) : (
                  <AlertTriangle size={15} />
                )}
              </div>

              <div className="security-alarm-incident-content">
                <strong>
                  {primaryAlert.title ||
                    "High Priority Civic Incident"}
                </strong>

                <span>
                  {primaryAlert.location?.address ||
                    "Location unavailable"}
                </span>
              </div>

              <span className="security-alarm-incident-state">
                ACTIVE
              </span>
            </div>
          )}

          {/* More incidents */}

          {dangerousAlerts.length > 1 && (
            <span className="security-alarm-more">
              +{dangerousAlerts.length - 1} more active{" "}
              {dangerousAlerts.length - 1 === 1
                ? "incident"
                : "incidents"}
            </span>
          )}
        </div>

        {/* =================================================
            ACTIONS
        ================================================== */}

        <div className="security-alarm-actions">

          {/* Buzzer */}

          {!buzzerEnabled ? (
            <button
              type="button"
              className="security-alarm-buzzer"
              onClick={handleEnableBuzzer}
              aria-label="Enable security buzzer"
            >
              <Volume2 size={16} />

              <span>Enable Buzzer</span>
            </button>
          ) : (
            <button
              type="button"
              className={`security-alarm-control ${
                muted
                  ? "security-alarm-muted"
                  : "security-alarm-sound-on"
              }`}
              onClick={handleMuteToggle}
              aria-label={
                muted
                  ? "Enable security buzzer"
                  : "Mute security buzzer"
              }
              title={
                muted
                  ? "Enable buzzer"
                  : "Mute buzzer"
              }
            >
              {muted ? (
                <VolumeX size={17} />
              ) : (
                <Volume2 size={17} />
              )}

              <span>
                {muted ? "Muted" : "Buzzer On"}
              </span>
            </button>
          )}

          {/* View Alerts */}

          <button
            type="button"
            className="security-alarm-view"
            onClick={() => {
              window.location.href = "/alerts";
            }}
          >
            <span>View Alerts</span>
            <ExternalLink size={15} />
          </button>

          {/* Dismiss */}

          <button
            type="button"
            className="security-alarm-close"
            onClick={() => {
              setDismissed(true);
              setAlarmActive(false);
              stopAlarmSound();
            }}
            title="Dismiss alert notification"
            aria-label="Dismiss alert notification"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SecurityAlarm;