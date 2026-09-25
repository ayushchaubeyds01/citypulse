import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertTriangle,
  ArrowLeft,
  ImagePlus,
  MapPin,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";

import { createCitizenReport } from "../services/api";
import "./CitizenReport.css";

function CitizenReport() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    eventType: "waterlogging",
    title: "",
    description: "",
    latitude: "26.9124",
    longitude: "75.7873",
    address: "Jaipur",
    severity: "medium",
  });

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // =========================================================
  // HANDLE PHOTO
  // =========================================================

  const handlePhotoChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;

    setPhoto(selectedFile);
    setError("");
  };

  // =========================================================
  // SUBMIT REPORT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      // -------------------------------------------------------
      // VALIDATION
      // -------------------------------------------------------

      if (!formData.description.trim()) {
        throw new Error("Please enter a description.");
      }

      if (!formData.address.trim()) {
        throw new Error("Please enter a zone/address.");
      }

      if (!formData.severity) {
        throw new Error("Please select severity.");
      }

      const latitude = Number(formData.latitude);
      const longitude = Number(formData.longitude);

      if (!Number.isFinite(latitude)) {
        throw new Error("Please enter a valid latitude.");
      }

      if (!Number.isFinite(longitude)) {
        throw new Error("Please enter a valid longitude.");
      }

      // -------------------------------------------------------
      // BACKEND PAYLOAD
      // -------------------------------------------------------

      const reportData = {
        category: formData.eventType,

        zone: formData.address.trim(),

        severity: formData.severity,

        title: formData.title.trim(),

        description: formData.description.trim(),

        latitude,

        longitude,

        address: formData.address.trim(),
      };

      // -------------------------------------------------------
      // PHOTO
      //
      // The current API accepts the normal report payload.
      // We keep the selected photo in the frontend until
      // multipart upload support is added to the backend.
      // -------------------------------------------------------

      console.log("Citizen report:", reportData);

      if (photo) {
        console.log("Citizen report photo:", photo);
      }

      // -------------------------------------------------------
      // API
      // -------------------------------------------------------

      const response =
        await createCitizenReport(reportData);

      // -------------------------------------------------------
      // RESPONSE CHECK
      // -------------------------------------------------------

      if (response?.success === false) {
        throw new Error(
          response?.message ||
            "Failed to submit citizen report."
        );
      }

      // -------------------------------------------------------
      // RETURN TO REPORTS
      // -------------------------------------------------------

      navigate("/reports", {
        replace: true,
        state: {
          reportSubmitted: true,
          message:
            response?.message ||
            "Citizen report submitted successfully.",
        },
      });
    } catch (err) {
      console.error(
        "Citizen report submission failed:",
        err
      );

      setError(
        err?.message ||
          "Failed to submit citizen report."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RESET
  // =========================================================

  const handleReset = () => {
    setFormData({
      eventType: "waterlogging",
      title: "",
      description: "",
      latitude: "26.9124",
      longitude: "75.7873",
      address: "Jaipur",
      severity: "medium",
    });

    setPhoto(null);
    setError("");
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="citizen-report-page">

      <div className="citizen-report-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="citizen-report-header">

          <button
            type="button"
            className="citizen-back-button"
            onClick={() => navigate("/reports")}
          >
            <ArrowLeft size={16} />
            Back to Reports
          </button>

          <div className="citizen-report-eyebrow">
            CITYPULSE • CIVIC REPORTING
          </div>

          <h1>
            Submit Citizen Report
          </h1>

          <p>
            Report a civic issue in your area and help
            CityPulse understand what is happening around
            the city.
          </p>

        </header>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="citizen-report-error">

            <AlertTriangle size={20} />

            <div>
              <strong>
                Submission Failed
              </strong>

              <span>
                {error}
              </span>
            </div>

          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="citizen-report-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              STEP 01 — EVENT
          ================================================= */}

          <section className="citizen-form-section">

            <div className="citizen-section-header">

              <div>

                <span className="citizen-section-label">
                  STEP 01
                </span>

                <h2>
                  Event Information
                </h2>

                <p>
                  Tell us what civic issue you observed.
                </p>

              </div>

              <div className="citizen-section-number">
                01
              </div>

            </div>

            <div className="citizen-form-grid">

              {/* EVENT TYPE */}

              <div className="citizen-field">

                <label htmlFor="eventType">
                  Event Type
                </label>

                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                >

                  <option value="waterlogging">
                    Waterlogging
                  </option>

                  <option value="fire">
                    Fire
                  </option>

                  <option value="accident">
                    Accident
                  </option>

                  <option value="traffic_update">
                    Traffic / Congestion
                  </option>

                  <option value="road_damage">
                    Road Damage
                  </option>

                  <option value="garbage">
                    Garbage
                  </option>

                  <option value="power_outage">
                    Power Outage
                  </option>

                  <option value="fallen_tree">
                    Fallen Tree
                  </option>

                  <option value="flood">
                    Flood
                  </option>

                  <option value="other">
                    Other Civic Issue
                  </option>

                </select>

              </div>

              {/* SEVERITY */}

              <div className="citizen-field">

                <label htmlFor="severity">
                  Severity
                </label>

                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                >

                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>

                  <option value="critical">
                    Critical
                  </option>

                </select>

              </div>

              {/* TITLE */}

              <div className="citizen-field citizen-field-full">

                <label htmlFor="title">
                  Report Title

                  <span>
                    Optional
                  </span>
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Example: Heavy waterlogging near main road"
                />

              </div>

              {/* DESCRIPTION */}

              <div className="citizen-field citizen-field-full">

                <label htmlFor="description">

                  Description

                  <span className="required">
                    Required
                  </span>

                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="6"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what you observed, when it happened, and any important details..."
                />

              </div>

              {/* PHOTO */}

              <div className="citizen-field citizen-field-full">

                <label htmlFor="photo">

                  Photo Evidence

                  <span>
                    Optional
                  </span>

                </label>

                <div className="citizen-photo-upload">

                  <ImagePlus size={20} />

                  <div>
                    <strong>
                      Add a photo
                    </strong>

                    <span>
                      Optional visual evidence can help
                      understand the reported issue.
                    </span>
                  </div>

                  <input
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />

                </div>

                {photo && (
                  <p className="citizen-photo-name">
                    Selected: {photo.name}
                  </p>
                )}

              </div>

            </div>

          </section>

          {/* =================================================
              STEP 02 — LOCATION
          ================================================= */}

          <section className="citizen-form-section">

            <div className="citizen-section-header">

              <div>

                <span className="citizen-section-label">
                  STEP 02
                </span>

                <h2>
                  Incident Location
                </h2>

                <p>
                  Help us identify where the issue occurred.
                </p>

              </div>

              <div className="citizen-section-number">
                02
              </div>

            </div>

            {/* LOCATION INFORMATION */}

            <div className="citizen-location-banner">

              <div className="citizen-location-icon">
                <MapPin size={20} />
              </div>

              <div>

                <strong>
                  Location matters
                </strong>

                <span>
                  Accurate location information helps
                  CityPulse correlate this report with
                  other city signals.
                </span>

              </div>

            </div>

            <div className="citizen-form-grid">

              {/* LATITUDE */}

              <div className="citizen-field">

                <label htmlFor="latitude">
                  Latitude
                </label>

                <input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="26.9124"
                />

              </div>

              {/* LONGITUDE */}

              <div className="citizen-field">

                <label htmlFor="longitude">
                  Longitude
                </label>

                <input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="75.7873"
                />

              </div>

              {/* ADDRESS */}

              <div className="citizen-field citizen-field-full">

                <label htmlFor="address">
                  Zone / Address
                  <span className="required">
                    Required
                  </span>
                </label>

                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Main Road, Jaipur"
                />

              </div>

            </div>

          </section>

          {/* =================================================
              TRUST / PRIVACY
          ================================================= */}

          <div className="citizen-trust-box">

            <ShieldCheck size={20} />

            <div>

              <strong>
                Your report becomes a city signal
              </strong>

              <p>
                A single citizen report is treated as a
                signal, not a confirmed incident. CityPulse
                may compare it with weather, traffic and
                other reports before identifying a possible
                disruption.
              </p>

            </div>

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="citizen-form-actions">

            <button
              type="button"
              className="citizen-reset-button"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>

            <button
              type="submit"
              className="citizen-submit-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <RefreshCw
                    size={17}
                    className="citizen-spin"
                  />

                  Submitting...
                </>
              ) : (
                <>
                  <Send size={17} />

                  Submit Report
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CitizenReport;