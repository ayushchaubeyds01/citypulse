import express from "express";
import {
  normalizeEventController,
} from "../controllers/normalization.controller.js";

const router = express.Router();

router.post("/", normalizeEventController);

export default router;