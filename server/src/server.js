import "dotenv/config";
import app from "./app.js";
import connectDB from "./db.js";
import CivicEvent from "./models/civicEvent.model.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 CityPulse server running on port ${PORT}`);
      console.log("📦 CivicEvent model loaded successfully");
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();