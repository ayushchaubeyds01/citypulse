const API_BASE_URL = "http://localhost:5000/api";

// ==========================================
// GET DASHBOARD OVERVIEW
// GET /api/dashboard/overview
// ==========================================

export const getDashboardOverview = async () => {
  const response = await fetch(
    `${API_BASE_URL}/dashboard/overview`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch dashboard overview"
    );
  }

  return await response.json();
};


// ==========================================
// GET ALL CIVIC EVENTS
// GET /api/events
// ==========================================

export const getAllEvents = async () => {
  const response = await fetch(
    `${API_BASE_URL}/events`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch events"
    );
  }

  return await response.json();
};


// ==========================================
// GET EVENT BY ID
// GET /api/events/:eventId
// ==========================================

export const getEventById = async (eventId) => {
  if (!eventId) {
    throw new Error(
      "Event ID is required"
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/events/${eventId}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch event"
    );
  }

  return await response.json();
};


// ==========================================
// GET ANALYTICS OVERVIEW
// GET /api/analytics/overview
// ==========================================

export const getAnalyticsOverview = async () => {
  const response = await fetch(
    `${API_BASE_URL}/analytics/overview`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch analytics overview"
    );
  }

  return await response.json();
};


// ==========================================
// GET ACTIVE ALERTS
// GET /api/alerts
// ==========================================
// Used by:
// SecurityAlarm.jsx
//
// Only active HIGH / CRITICAL events should
// be returned by the backend alert API.
// ==========================================

export const getActiveAlerts = async () => {
  const response = await fetch(
    `${API_BASE_URL}/alerts`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch active alerts"
    );
  }

  return await response.json();
};


// ==========================================
// CREATE CITIZEN REPORT
// POST /api/reports
// ==========================================

export const createCitizenReport = async (
  reportData
) => {
  const response = await fetch(
    `${API_BASE_URL}/reports`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(reportData),
    }
  );

  if (!response.ok) {
    let message =
      "Failed to create citizen report";

    try {
      const errorData =
        await response.json();

      message =
        errorData?.message || message;
    } catch {
      // Ignore invalid error response
    }

    throw new Error(message);
  }

  return await response.json();
};


// ==========================================
// GET CITIZEN REPORTS
// GET /api/reports
// ==========================================

export const getCitizenReports = async () => {
  const response = await fetch(
    `${API_BASE_URL}/reports`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch citizen reports"
    );
  }

  return await response.json();
};


// ==========================================
// DEFAULT EXPORT
// ==========================================

const api = {
  getDashboardOverview,
  getAllEvents,
  getEventById,
  getAnalyticsOverview,
  getActiveAlerts,
  createCitizenReport,
  getCitizenReports,
};

export default api;