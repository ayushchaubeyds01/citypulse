import express from "express";

import {
  createCitizenReport,
  getCitizenReports,
} from "../controllers/report.controller.js";

const router = express.Router();

// ==========================================
// CREATE CITIZEN REPORT
// POST /api/reports
// ==========================================
router.post("/", createCitizenReport);

// ==========================================
// GET CITIZEN REPORTS
// GET /api/reports
// ==========================================
router.get("/", getCitizenReports);

export default router;