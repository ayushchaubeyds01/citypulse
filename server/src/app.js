import express from "express";
import cors from "cors";

// ==========================================
// Routes
// ==========================================

import weatherRoutes from "./routes/weather.routes.js";
import trafficRoutes from "./routes/traffic.routes.js";
import reportRoutes from "./routes/report.routes.js";
import eventRoutes from "./routes/event.routes.js";
import normalizationRoutes from "./routes/normalization.routes.js";
import anomalyRoutes from "./routes/anomaly.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import alertRoutes from "./routes/alert.routes.js";

const app = express();

// ==========================================
// Middleware
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// Health Check
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CityPulse API is running",
  });
});

// ==========================================
// API Routes
// ==========================================

// Weather
app.use("/api/weather", weatherRoutes);

// Traffic
app.use("/api/traffic", trafficRoutes);

// Citizen Reports
app.use("/api/reports", reportRoutes);

// All Civic Events
app.use("/api/events", eventRoutes);

// Event Normalization
app.use("/api/normalize", normalizationRoutes);

// Anomaly Detection
app.use("/api/anomaly", anomalyRoutes);

// Analytics
app.use("/api/analytics", analyticsRoutes);

// Dashboard
app.use("/api/dashboard", dashboardRoutes);

// Alerts
app.use("/api/alerts", alertRoutes);

// ==========================================
// 404 Handler
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// ==========================================
// Global Error Handler
// ==========================================

app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);

  res.status(err.status || 500).json({
    success: false,
    message:
      err.message || "Internal server error",
  });
});

export default app;