import { detectAnomaly } from "../services/anomaly.service.js";

export const detectAnomalyController = (req, res) => {
  try {
    const { currentValue, baselineValue, threshold } = req.body;

    const result = detectAnomaly({
      currentValue,
      baselineValue,
      threshold,
    });

    return res.status(200).json({
      success: true,
      message: "Anomaly detection completed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Anomaly detection failed:", error);

    return res.status(400).json({
      success: false,
      message: "Anomaly detection failed",
      error: error.message,
    });
  }
};