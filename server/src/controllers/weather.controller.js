import generateWeatherEvent from "../services/weather.service.js";

export const createWeatherEvent = async (req, res) => {
  try {
    const weatherEvent = await generateWeatherEvent();

    return res.status(201).json({
      success: true,
      message: "Weather event created successfully",
      data: weatherEvent,
    });
  } catch (error) {
    console.error("Weather controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create weather event",
      error: error.message,
    });
  }
};