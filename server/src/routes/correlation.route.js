import express from "express";

import {
  getCorrelationRiskController,
} from "../controllers/correlation.controller.js";

const router = express.Router();

// ==========================================
// Multi-Source Correlation Risk
// GET /api/correlation/risk
// ==========================================

router.get(
  "/risk",
  getCorrelationRiskController
);

export default router;