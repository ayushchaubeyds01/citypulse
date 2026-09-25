import express from "express";

import {
  getDashboardOverviewController,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

// Dashboard overview
router.get("/overview", getDashboardOverviewController);

export default router;