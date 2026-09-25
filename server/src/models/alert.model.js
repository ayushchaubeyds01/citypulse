import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CivicEvent",
      required: true,
      index: true,
    },

    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "acknowledged", "resolved"],
      default: "active",
      index: true,
    },

    source: {
      type: String,
      default: "system",
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    acknowledgedAt: {
      type: Date,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;