import CivicEvent from "../models/civicEvent.model.js";

// ==========================================
// Get All Civic Events
// ==========================================
export const getAllEvents = async () => {
  const events = await CivicEvent.find()
    .sort({ createdAt: -1 })
    .lean();

  return events;
};

// ==========================================
// Get Civic Event By ID
// ==========================================
export const getEventById = async (eventId) => {
  const event = await CivicEvent.findById(eventId).lean();

  return event;
};