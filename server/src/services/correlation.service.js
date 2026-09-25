import CivicEvent from "../models/civicEvent.model.js";

// ======================================================
// MULTI-SOURCE CORRELATION SERVICE
// ======================================================

export const calculateCorrelationRisk = async () => {
  try {
    // ==========================================
    // Fetch recent active events
    // ==========================================

    const events = await CivicEvent.find({
      status: "active",
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // ==========================================
    // Separate events by source
    // ==========================================

    const weatherEvents = events.filter(
      (event) => event.source === "weather"
    );

    const trafficEvents = events.filter(
      (event) => event.source === "traffic"
    );

    const citizenEvents = events.filter(
      (event) => event.source === "citizen"
    );

    // ==========================================
    // Waterlogging reports
    // ==========================================

    const waterloggingReports =
      citizenEvents.filter(
        (event) =>
          event.eventType === "waterlogging"
      );

    // ==========================================
    // Latest rainfall
    // ==========================================

    const latestRainEvent =
      weatherEvents[0] || null;

    const rainfall =
      Number(latestRainEvent?.value) || 0;

    // ==========================================
    // Latest traffic speed
    // ==========================================

    const latestTrafficEvent =
      trafficEvents[0] || null;

    const trafficSpeed =
      Number(latestTrafficEvent?.value) || 0;

    // ==========================================
    // Calculate Risk Score
    // ==========================================

    let riskScore = 0;

    // Rainfall contribution
    if (rainfall >= 50) {
      riskScore += 30;
    } else if (rainfall >= 30) {
      riskScore += 20;
    } else if (rainfall >= 10) {
      riskScore += 10;
    }

    // Traffic contribution
    if (
      trafficSpeed > 0 &&
      trafficSpeed <= 20
    ) {
      riskScore += 25;
    } else if (
      trafficSpeed > 20 &&
      trafficSpeed <= 40
    ) {
      riskScore += 15;
    }

    // Citizen reports contribution
    if (waterloggingReports.length >= 5) {
      riskScore += 35;
    } else if (
      waterloggingReports.length >= 3
    ) {
      riskScore += 25;
    } else if (
      waterloggingReports.length >= 1
    ) {
      riskScore += 10;
    }

    // ==========================================
    // Cap score at 100
    // ==========================================

    riskScore = Math.min(
      riskScore,
      100
    );

    // ==========================================
    // Determine severity
    // ==========================================

    let severity = "low";

    if (riskScore >= 80) {
      severity = "critical";
    } else if (riskScore >= 60) {
      severity = "high";
    } else if (riskScore >= 30) {
      severity = "medium";
    }

    // ==========================================
    // Generate reasons
    // ==========================================

    const reasons = [];

    if (rainfall >= 50) {
      reasons.push(
        `Heavy rainfall detected (${rainfall} mm)`
      );
    }

    if (
      trafficSpeed > 0 &&
      trafficSpeed <= 40
    ) {
      reasons.push(
        `Traffic slowdown detected (${trafficSpeed} km/h)`
      );
    }

    if (
      waterloggingReports.length > 0
    ) {
      reasons.push(
        `${waterloggingReports.length} citizen waterlogging report(s)`
      );
    }

    // ==========================================
    // Return correlation result
    // ==========================================

    return {
      riskScore,
      severity,

      signals: {
        rainfall,
        trafficSpeed,
        citizenWaterloggingReports:
          waterloggingReports.length,
      },

      reasons,

      correlated:
        reasons.length >= 2,
    };
  } catch (error) {
    console.error(
      "❌ Correlation calculation failed:",
      error
    );

    throw error;
  }
};