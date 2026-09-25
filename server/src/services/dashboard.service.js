import CivicEvent from "../models/civicEvent.model.js";

import {
  getEventSummary,
  getEventsBySource,
  getEventsByType,
} from "./analytics.service.js";

// ==========================================
// Get Dashboard Overview
// ==========================================
export const getDashboardOverview = async () => {
  // Get analytics
  const summary = await getEventSummary();
  const eventsBySource = await getEventsBySource();
  const eventsByType = await getEventsByType();

  // Get latest events
  const recentEvents = await CivicEvent.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Get high and medium severity active events
  const criticalEvents = await CivicEvent.find({
    status: "active",
    severity: {
      $in: ["high", "medium"],
    },
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return {
    summary,
    eventsBySource,
    eventsByType,
    recentEvents,
    criticalEvents,
  };
};