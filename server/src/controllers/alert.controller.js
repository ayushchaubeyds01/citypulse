import {
  getActiveAlerts,
} from "../services/alert.service.js";

// ==========================================
// Get Active Alerts
// GET /api/alerts
// ==========================================

export const getActiveAlertsController = async (
  req,
  res
) => {
  try {
    console.log("📥 Fetching active alerts...");

    const alerts = await getActiveAlerts();

    console.log(
      `🚨 ${alerts.length} active alerts found`
    );

    return res.status(200).json({
      success: true,

      message:
        "Active alerts fetched successfully",

      data: alerts,
    });
  } catch (error) {
    console.error(
      "❌ Failed to fetch active alerts:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch active alerts",

      error: error.message,
    });
  }
};