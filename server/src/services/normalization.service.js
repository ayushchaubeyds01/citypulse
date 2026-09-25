export const normalizeEvent = (event) => {
  if (!event || typeof event !== "object") {
    throw new Error("Event data is required");
  }

  if (!event.source) {
    throw new Error("Event source is required");
  }

  if (!event.eventType) {
    throw new Error("Event type is required");
  }

  const zone = event.zone || event.location?.address;

  if (!zone) {
    throw new Error("Event zone is required");
  }

  return {
    source: event.source,
    eventType: event.eventType,
    zone,
    timestamp: event.timestamp || new Date(),
    severity: event.severity || "low",
    value: event.value ?? null,
    metadata: {
      title: event.title || "",
      description: event.description || "",
      unit: event.unit || "",
    },
  };
};