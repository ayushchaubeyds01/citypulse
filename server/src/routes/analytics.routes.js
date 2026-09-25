import express from "express";

import {
  getAnalyticsOverviewController,
  getEventSummaryController,
  getEventsBySourceController,
  getEventsByTypeController,
} from "../controllers/analytics.controller.js";

const router = express.Router();

// ==========================================
// Analytics Overview
// ==========================================
router.get(
  "/overview",
  getAnalyticsOverviewController
);

// ==========================================
// Overall Event Summary
// ==========================================
router.get(
  "/summary",
  getEventSummaryController
);

// ==========================================
// Events By Source
// ==========================================
router.get(
  "/source",
  getEventsBySourceController
);

// ==========================================
// Events By Type
// ==========================================
router.get(
  "/type",
  getEventsByTypeController
);

export default router;