import express from "express";
import {
  detectAnomalyController,
} from "../controllers/anomaly.controller.js";

const router = express.Router();

router.post("/", detectAnomalyController);

export default router;