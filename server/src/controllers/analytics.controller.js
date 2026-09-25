import CivicEvent from "../models/civicEvent.model.js";

// ==========================================
// GET ANALYTICS OVERVIEW
// ==========================================
export const getAnalyticsOverviewController = async (req, res) => {
  try {
    // ------------------------------------------
    // Summary
    // ------------------------------------------
    const totalEvents = await CivicEvent.countDocuments();

    const activeEvents = await CivicEvent.countDocuments({
      status: "active",
    });

    const resolvedEvents = await CivicEvent.countDocuments({
      status: "resolved",
    });

    // ------------------------------------------
    // Critical Events
    // ------------------------------------------
    const criticalEvents = await CivicEvent.find({
      severity: { $in: ["critical", "high"] },
      status: "active",
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // ------------------------------------------
    // Recent Events
    // ------------------------------------------
    const recentEvents = await CivicEvent.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // ------------------------------------------
    // Events By Source
    // ------------------------------------------
    const eventsBySource = await CivicEvent.aggregate([
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          source: "$_id",
          count: 1,
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // ------------------------------------------
    // Events By Type
    // ------------------------------------------
    const eventsByType = await CivicEvent.aggregate([
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          eventType: "$_id",
          count: 1,
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // ------------------------------------------
    // Response
    // ------------------------------------------
    return res.status(200).json({
      success: true,
      message: "Analytics overview fetched successfully",

      data: {
        summary: {
          totalEvents,
          activeEvents,
          resolvedEvents,
        },

        criticalEvents,

        recentEvents,

        eventsBySource,

        eventsByType,
      },
    });
  } catch (error) {
    console.error(
      "❌ Analytics overview failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics overview",
      error: error.message,
    });
  }
};


// ==========================================
// GET EVENT SUMMARY
// ==========================================
export const getEventSummaryController = async (req, res) => {
  try {
    const totalEvents = await CivicEvent.countDocuments();

    const activeEvents = await CivicEvent.countDocuments({
      status: "active",
    });

    const resolvedEvents = await CivicEvent.countDocuments({
      status: "resolved",
    });

    return res.status(200).json({
      success: true,
      message: "Event summary fetched successfully",
      data: {
        totalEvents,
        activeEvents,
        resolvedEvents,
      },
    });
  } catch (error) {
    console.error("❌ Event summary failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch event summary",
      error: error.message,
    });
  }
};


// ==========================================
// GET EVENTS BY SOURCE
// ==========================================
export const getEventsBySourceController = async (req, res) => {
  try {
    const data = await CivicEvent.aggregate([
      {
        $group: {
          _id: "$source",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          source: "$_id",
          count: 1,
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Events grouped by source fetched successfully",
      data,
    });
  } catch (error) {
    console.error(
      "❌ Events by source failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch events by source",
      error: error.message,
    });
  }
};


// ==========================================
// GET EVENTS BY TYPE
// ==========================================
export const getEventsByTypeController = async (req, res) => {
  try {
    const data = await CivicEvent.aggregate([
      {
        $group: {
          _id: "$eventType",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          eventType: "$_id",
          count: 1,
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Events grouped by type fetched successfully",
      data,
    });
  } catch (error) {
    console.error(
      "❌ Events by type failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch events by type",
      error: error.message,
    });
  }
};