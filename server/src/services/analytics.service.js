import CivicEvent from "../models/civicEvent.model.js";

// ==========================================
// Get Overall Event Summary
// ==========================================
export const getEventSummary = async () => {
  const totalEvents = await CivicEvent.countDocuments();

  const activeEvents = await CivicEvent.countDocuments({
    status: "active",
  });

  const resolvedEvents = await CivicEvent.countDocuments({
    status: "resolved",
  });

  return {
    totalEvents,
    activeEvents,
    resolvedEvents,
  };
};

// ==========================================
// Get Events Grouped By Source
// ==========================================
export const getEventsBySource = async () => {
  const result = await CivicEvent.aggregate([
    {
      $group: {
        _id: "$source",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]);

  return result.map((item) => ({
    source: item._id,
    count: item.count,
  }));
};

// ==========================================
// Get Events Grouped By Event Type
// ==========================================
export const getEventsByType = async () => {
  const result = await CivicEvent.aggregate([
    {
      $group: {
        _id: "$eventType",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]);

  return result.map((item) => ({
    eventType: item._id,
    count: item.count,
  }));
};