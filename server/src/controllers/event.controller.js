import {
  getAllEvents,
  getEventById,
} from "../services/event.service.js";

// ==========================================
// Get All Civic Events
// ==========================================
export const getAllEventsController = async (req, res) => {
  try {
    const events = await getAllEvents();

    return res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: events,
    });
  } catch (error) {
    console.error("Fetching events failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

// ==========================================
// Get Civic Event By ID
// ==========================================
export const getEventByIdController = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await getEventById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      data: event,
    });
  } catch (error) {
    console.error("Fetching event failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch event",
      error: error.message,
    });
  }
};