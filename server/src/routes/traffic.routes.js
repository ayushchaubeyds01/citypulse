import express from "express";
import { createTrafficEvent } from "../controllers/traffic.controller.js";

const router = express.Router();

router.post("/", createTrafficEvent);

export default router;  