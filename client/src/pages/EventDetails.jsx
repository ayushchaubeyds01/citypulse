import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  MapPin,
  RefreshCw,
} from "lucide-react";

import { getEventById } from "../services/api";

function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // Fetch Event
  // ==========================================
  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getEventById(eventId);

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to fetch event"
        );
      }

      setEvent(response.data);
    } catch (err) {
      console.error("Event details fetch failed:", err);

      setError(
        err?.message || "Unable to load event."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Initial Load
  // ==========================================
  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  // ==========================================
  // Format Event Type
  // ==========================================
  const formatEventType = (value) => {
    if (!value) {
      return "Unknown";
    }

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // ==========================================
  // Format Date
  // ==========================================
  const formatDate = (date) => {
    if (!date) {
      return "Unknown time";
    }

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ==========================================
  // Severity Badge
  // ==========================================
  const getSeverityClass = (severity) => {
    switch (severity) {
      case "critical":
        return "border-red-500/30 bg-red-500/10 text-red-400";

      case "high":
        return "border-orange-500/30 bg-orange-500/10 text-orange-400";

      case "medium":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

      case "low":
        return "border-green-500/30 bg-green-500/10 text-green-400";

      default:
        return "border-slate-700 bg-slate-800 text-slate-400";
    }
  };

  // ==========================================
  // Loading State
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-400" />

            <p className="mt-4 text-slate-400">
              Loading event...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Error State
  // ==========================================
  if (error || !event) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900 p-8 text-center">

            <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />

            <h2 className="mt-4 text-xl font-semibold text-white">
              Event Not Found
            </h2>

            <p className="mt-2 text-slate-400">
              {error ||
                "The requested event could not be found."}
            </p>

            <div className="mt-6 flex justify-center gap-3">

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>

              <button
                type="button"
                onClick={fetchEvent}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Event Details UI
  // ==========================================
  return (
    <div className="min-h-screen p-6">

      {/* ======================================
          Header
      ====================================== */}
      <div className="mb-8">

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <p className="mt-6 text-sm font-medium text-blue-400">
          CITYPULSE
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Event Details
        </h1>

        <p className="mt-2 text-slate-400">
          Detailed information about this civic event.
        </p>

      </div>

      {/* ======================================
          Main Content
      ====================================== */}
      <div className="mx-auto max-w-5xl">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          {/* ==================================
              Event Header
          ================================== */}
          <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <div className="flex flex-wrap items-center gap-3">

                <h2 className="text-2xl font-bold text-white">
                  {event.title || "Civic Event"}
                </h2>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${getSeverityClass(
                    event.severity
                  )}`}
                >
                  {event.severity || "unknown"}
                </span>

              </div>

              <p className="mt-2 text-sm text-slate-500">
                {formatEventType(event.eventType)}
              </p>

            </div>

            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium capitalize text-blue-400">
              {event.status || "active"}
            </span>

          </div>

          {/* ==================================
              Description
          ================================== */}
          <div className="mt-6">

            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Description
            </h3>

            <p className="mt-2 text-sm leading-7 text-slate-300">
              {event.description ||
                "No description available."}
            </p>

          </div>

          {/* ==================================
              Information Grid
          ================================== */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">

            {/* Location */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

              <div className="flex items-center gap-3">

                <MapPin className="h-5 w-5 text-blue-400" />

                <div>
                  <p className="text-xs text-slate-500">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-medium text-white">
                    {event.location?.address ||
                      "Location unavailable"}
                  </p>
                </div>

              </div>

            </div>

            {/* Reported Time */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

              <div className="flex items-center gap-3">

                <Clock className="h-5 w-5 text-blue-400" />

                <div>
                  <p className="text-xs text-slate-500">
                    Reported At
                  </p>

                  <p className="mt-1 text-sm font-medium text-white">
                    {formatDate(event.timestamp)}
                  </p>
                </div>

              </div>

            </div>

            {/* Source */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

              <p className="text-xs text-slate-500">
                Source
              </p>

              <p className="mt-1 text-sm font-medium capitalize text-white">
                {event.source || "Unknown"}
              </p>

            </div>

            {/* Event Type */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

              <p className="text-xs text-slate-500">
                Event Type
              </p>

              <p className="mt-1 text-sm font-medium text-white">
                {formatEventType(event.eventType)}
              </p>

            </div>

            {/* Severity */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

              <p className="text-xs text-slate-500">
                Severity
              </p>

              <div className="mt-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${getSeverityClass(
                    event.severity
                  )}`}
                >
                  {event.severity || "Unknown"}
                </span>
              </div>

            </div>

            {/* Status */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

              <p className="text-xs text-slate-500">
                Status
              </p>

              <p className="mt-1 text-sm font-medium capitalize text-white">
                {event.status || "Unknown"}
              </p>

            </div>

            {/* Value */}
            {event.value !== null &&
              event.value !== undefined && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                  <p className="text-xs text-slate-500">
                    Measured Value
                  </p>

                  <p className="mt-1 text-sm font-medium text-white">
                    {event.value}
                    {event.unit
                      ? ` ${event.unit}`
                      : ""}
                  </p>

                </div>
              )}

            {/* Coordinates */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

              <p className="text-xs text-slate-500">
                Coordinates
              </p>

              <p className="mt-1 text-sm font-medium text-white">
                {event.location?.latitude},{" "}
                {event.location?.longitude}
              </p>

            </div>

          </div>

          {/* ==================================
              Event ID
          ================================== */}
          <div className="mt-8 border-t border-slate-800 pt-5">

            <p className="text-xs text-slate-500">
              Event ID
            </p>

            <p className="mt-1 break-all font-mono text-xs text-slate-400">
              {event._id}
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default EventDetails;