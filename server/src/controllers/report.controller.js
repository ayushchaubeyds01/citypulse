import CivicEvent from "../models/civicEvent.model.js";

import {
  evaluateAlertRules,
} from "../services/alertRules.service.js";

// ==========================================
// CREATE CITIZEN REPORT
// POST /api/reports
// ==========================================

export const createCitizenReport = async (req, res) => {
  try {
    console.log(
      "📥 Citizen report received:",
      req.body
    );

    const {
      category,
      zone,
      severity,
      description,
      latitude,
      longitude,
      address,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !category ||
      !zone ||
      !severity ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message:
          "category, zone, severity and description are required",
      });
    }

    // ==========================================
    // CONVERT COORDINATES
    // ==========================================

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (
      !Number.isFinite(parsedLatitude) ||
      !Number.isFinite(parsedLongitude)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid latitude and longitude are required",
      });
    }

    // ==========================================
    // CREATE CITIZEN EVENT
    // ==========================================

    const citizenReport =
      await CivicEvent.create({
        source: "citizen",

        eventType: category,

        title:
          `Citizen Report - ${category}`,

        description:
          description.trim(),

        location: {
          latitude: parsedLatitude,
          longitude: parsedLongitude,

          address:
            address?.trim() ||
            zone.trim(),
        },

        severity,

        status: "active",

        value: null,

        unit: "",

        timestamp: new Date(),
      });

    console.log(
      "✅ Citizen report created:",
      citizenReport._id
    );

    // ==========================================
    // ALERT RULE EVALUATION
    // ==========================================

    const alertRule =
      evaluateAlertRules(
        citizenReport.toObject()
      );

    if (alertRule) {
      console.log(
        "🚨 Alert rule matched:",
        alertRule
      );
    } else {
      console.log(
        "ℹ️ No alert rule matched for this event"
      );
    }

    // ==========================================
    // SUCCESS
    // ==========================================

    return res.status(201).json({
      success: true,

      message:
        "Citizen report submitted successfully",

      data: citizenReport,

      alert: alertRule
        ? {
            triggered: true,
            severity: alertRule.severity,
            title: alertRule.title,
            message: alertRule.message,
          }
        : {
            triggered: false,
          },
    });

  } catch (error) {
    console.error(
      "❌ Citizen report creation failed:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,

      message:
        "Failed to create citizen report",

      error: error.message,
    });
  }
};


// ==========================================
// GET CITIZEN REPORTS
// GET /api/reports
// ==========================================

export const getCitizenReports = async (
  req,
  res
) => {
  try {
    console.log(
      "📥 Fetching citizen reports..."
    );

    const reports =
      await CivicEvent.find({
        source: "citizen",
      }).sort({
        createdAt: -1,
      });

    console.log(
      `✅ ${reports.length} citizen reports found`
    );

    return res.status(200).json({
      success: true,

      message:
        "Citizen reports fetched successfully",

      data: reports,
    });

  } catch (error) {
    console.error(
      "❌ Failed to fetch citizen reports:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch citizen reports",

      error: error.message,
    });
  }
};