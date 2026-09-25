import { normalizeEvent } from "../services/normalization.service.js";

export const normalizeEventController = (req, res) => {
  try {
    const normalizedEvent = normalizeEvent(req.body);

    return res.status(200).json({
      success: true,
      message: "Event normalized successfully",
      data: normalizedEvent,
    });
  } catch (error) {
    console.error("Normalization failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to normalize event",
      error: error.message,
    });
  }
};