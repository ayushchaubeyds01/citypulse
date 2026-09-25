import mongoose from "mongoose";

const civicEventSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      enum: ["weather", "traffic", "citizen"],
    },

    eventType: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      latitude: {
        type: Number,
        required: true,
      },

      longitude: {
        type: Number,
        required: true,
      },

      address: {
        type: String,
        default: "",
        trim: true,
      },
    },

    severity: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },

    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
    },

    value: {
      type: Number,
      default: null,
    },

    unit: {
      type: String,
      default: "",
      trim: true,
    },

    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const CivicEvent = mongoose.model("CivicEvent", civicEventSchema);

export default CivicEvent;