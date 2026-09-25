import { getDashboardOverview } from "../services/dashboard.service.js";

// ==========================================
// Get Dashboard Overview
// ==========================================
export const getDashboardOverviewController = async (req, res) => {
  try {
    const dashboard = await getDashboardOverview();

    return res.status(200).json({
      success: true,
      message: "Dashboard overview fetched successfully",
      data: dashboard,
    });
  } catch (error) {
    console.error("Dashboard overview failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard overview",
      error: error.message,
    });
  }
};