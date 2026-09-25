import express from "express";

import {
  getAllEventsController,
  getEventByIdController,
} from "../controllers/event.controller.js";

const router = express.Router();

// ==========================================
// Get All Civic Events
// GET /api/events
// ==========================================
router.get("/", getAllEventsController);

// ==========================================
// Get Civic Event By ID
// GET /api/events/:eventId
// ==========================================
router.get("/:eventId", getEventByIdController);

export default router;