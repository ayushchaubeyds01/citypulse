import express from "express";
import { createWeatherEvent } from "../controllers/weather.controller.js";

const router = express.Router();

router.post("/", createWeatherEvent);

export default router;