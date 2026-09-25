import express from "express";

import {
  getActiveAlertsController,
} from "../controllers/alert.controller.js";

const router = express.Router();

// ==========================================
// Get Active Alerts
// GET /api/alerts
// ==========================================

router.get(
  "/",
  getActiveAlertsController
);

export default router;