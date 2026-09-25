import {
  calculateCorrelationRisk,
} from "../services/correlation.service.js";

// ======================================================
// GET CORRELATION RISK
// GET /api/correlation/risk
// ======================================================

export const getCorrelationRiskController = async (
  req,
  res
) => {
  try {
    console.log(
      "🧠 Calculating multi-source correlation risk..."
    );

    const result =
      await calculateCorrelationRisk();

    console.log(
      "✅ Correlation result:",
      result
    );

    return res.status(200).json({
      success: true,
      message:
        "Multi-source correlation calculated successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "❌ Correlation controller failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to calculate correlation risk",
      error: error.message,
    });
  }
};