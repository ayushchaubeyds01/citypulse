import Alert from "../models/alert.model.js";

// ==========================================
// Create Alert From Civic Event
// ==========================================

export const createAlertFromEvent = async (event) => {
  if (
    !["critical", "high", "medium"].includes(
      event.severity
    )
  ) {
    return null;
  }

  // Prevent duplicate active alert
  const existingAlert = await Alert.findOne({
    eventId: event._id,
    status: "active",
  });

  if (existingAlert) {
    console.log(
      "⚠️ Active alert already exists:",
      existingAlert._id
    );

    return existingAlert;
  }

  // ==========================================
  // Alert Content
  // ==========================================

  let title = "Civic Alert";

  let message =
    "A civic incident requires attention.";

  if (event.eventType === "waterlogging") {
    if (event.severity === "critical") {
      title = "Critical Waterlogging Alert";

      message =
        "Critical waterlogging has been reported and requires immediate emergency response.";
    } else if (event.severity === "high") {
      title = "High Waterlogging Alert";

      message =
        "Heavy waterlogging has been reported and requires immediate attention.";
    } else {
      title = "Waterlogging Alert";

      message =
        "Waterlogging has been reported and requires monitoring.";
    }
  }

  // ==========================================
  // Create Alert
  // ==========================================

  const alert = await Alert.create({
    eventId: event._id,

    severity: event.severity,

    title,

    message,

    status: "active",

    source: event.source || "system",
  });

  console.log(
    "🚨 Alert created:",
    alert._id
  );

  return alert;
};

// ==========================================
// Get Active Alerts
// ==========================================

export const getActiveAlerts = async () => {
  const alerts = await Alert.find({
    status: "active",
  })
    .populate("eventId")
    .sort({
      createdAt: -1,
    })
    .lean();

  console.log(
    `🚨 ${alerts.length} active alerts found`
  );

  return alerts;
};

// ==========================================
// Get All Alerts
// ==========================================

export const getAllAlerts = async () => {
  const alerts = await Alert.find()
    .populate("eventId")
    .sort({
      createdAt: -1,
    })
    .lean();

  return alerts;
};