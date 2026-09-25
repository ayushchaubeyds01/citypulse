// ==========================================
// CityPulse Alert Rules
// ==========================================

const ALERT_RULES = {
  // ========================================
  // WATERLOGGING
  // ========================================

  waterlogging: {
    high: {
      condition: (event) =>
        event.eventType === "waterlogging" &&
        event.severity === "high",

      alertSeverity: "high",

      title: "High Waterlogging Alert",

      message:
        "Heavy waterlogging has been reported and requires immediate attention.",
    },

    critical: {
      condition: (event) =>
        event.eventType === "waterlogging" &&
        event.severity === "critical",

      alertSeverity: "critical",

      title: "Critical Waterlogging Alert",

      message:
        "Critical waterlogging has been detected. Immediate response is required.",
    },
  },

  // ========================================
  // WEATHER
  // ========================================

  weather: {
    moderateRain: {
      condition: (event) =>
        event.eventType === "moderate_rain" &&
        typeof event.value === "number" &&
        event.value >= 50,

      alertSeverity: "medium",

      title: "Moderate Rain Alert",

      message:
        "Moderate rainfall has been detected in the affected area.",
    },

    heavyRain: {
      condition: (event) =>
        event.eventType === "moderate_rain" &&
        typeof event.value === "number" &&
        event.value >= 80,

      alertSeverity: "high",

      title: "Heavy Rain Alert",

      message:
        "Heavy rainfall has been detected and may cause civic disruption.",
    },

    extremeRain: {
      condition: (event) =>
        event.eventType === "moderate_rain" &&
        typeof event.value === "number" &&
        event.value >= 120,

      alertSeverity: "critical",

      title: "Extreme Rainfall Alert",

      message:
        "Extreme rainfall has been detected. Immediate civic response may be required.",
    },
  },

  // ========================================
  // TRAFFIC
  // ========================================

  traffic: {
    slowTraffic: {
      condition: (event) =>
        event.eventType === "traffic_update" &&
        typeof event.value === "number" &&
        event.value < 30,

      alertSeverity: "medium",

      title: "Traffic Congestion Alert",

      message:
        "Traffic speed has dropped significantly in the affected area.",
    },

    severeTraffic: {
      condition: (event) =>
        event.eventType === "traffic_update" &&
        typeof event.value === "number" &&
        event.value < 15,

      alertSeverity: "high",

      title: "Severe Traffic Alert",

      message:
        "Severe traffic congestion has been detected.",
    },
  },

  // ========================================
  // CITIZEN REPORTS
  // ========================================

  citizen: {
    highPriority: {
      condition: (event) =>
        event.source === "citizen" &&
        event.severity === "high",

      alertSeverity: "high",

      title: "High Priority Citizen Report",

      message:
        "A high-priority civic issue has been reported by a citizen.",
    },

    criticalPriority: {
      condition: (event) =>
        event.source === "citizen" &&
        event.severity === "critical",

      alertSeverity: "critical",

      title: "Critical Citizen Report",

      message:
        "A critical civic issue has been reported by a citizen.",
    },
  },
};

// ==========================================
// Evaluate Event Against Alert Rules
// ==========================================

export const evaluateAlertRules = (event) => {
  const matchedRules = [];

  Object.values(ALERT_RULES).forEach((category) => {
    Object.values(category).forEach((rule) => {
      try {
        if (rule.condition(event)) {
          matchedRules.push({
            severity: rule.alertSeverity,
            title: rule.title,
            message: rule.message,
          });
        }
      } catch (error) {
        console.error(
          "Alert rule evaluation failed:",
          error
        );
      }
    });
  });

  // ========================================
  // No Rule Matched
  // ========================================

  if (matchedRules.length === 0) {
    return null;
  }

  // ========================================
  // Return Highest Severity
  // ========================================

  const severityPriority = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };

  matchedRules.sort(
    (a, b) =>
      severityPriority[b.severity] -
      severityPriority[a.severity]
  );

  return matchedRules[0];
};

export default ALERT_RULES;