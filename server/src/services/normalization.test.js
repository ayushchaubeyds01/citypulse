import { normalizeEvent } from "./normalization.service.js";

const citizenEvent = {
  source: "citizen",
  eventType: "waterlogging",
  location: {
    address: "Main Road, Jaipur",
  },
  severity: "high",
  value: null,
  unit: "",
  title: "Citizen Report - waterlogging",
  description: "Heavy waterlogging reported near the main road.",
  timestamp: new Date(),
};

const normalizedEvent = normalizeEvent(citizenEvent);

console.log("Normalized Citizen Event:");
console.log(normalizedEvent);