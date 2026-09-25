import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileBarChart,
  Filter,
  MapPin,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  Activity,
  Plus,
} from "lucide-react";

import { getCitizenReports } from "../services/api";
import "./Reports.css";

/* =========================================================
   DEMO GENERATED REPORTS
   These can remain until the report-generation system
   is connected to the backend.
   ========================================================= */

const GENERATED_REPORT_DATA = [
  {
    id: "activity-1",
    title: "Daily City Activity Report",
    type: "Activity",
    location: "Jaipur",
    period: "Today",
    events: 9,
    critical: 0,
    resolved: 0,
    status: "Ready",
    createdAt: "25 Sep 2026, 06:30 PM",
    isCitizenReport: false,
  },
  {
    id: "traffic-1",
    title: "Traffic Incident Report",
    type: "Traffic",
    location: "Jaipur",
    period: "Today",
    events: 3,
    critical: 1,
    resolved: 1,
    status: "Ready",
    createdAt: "25 Sep 2026, 05:45 PM",
    isCitizenReport: false,
  },
  {
    id: "weather-1",
    title: "Weather Intelligence Report",
    type: "Weather",
    location: "Jaipur",
    period: "This Week",
    events: 12,
    critical: 2,
    resolved: 8,
    status: "Ready",
    createdAt: "25 Sep 2026, 04:20 PM",
    isCitizenReport: false,
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

function statusClass(status) {
  if (
    status === "Ready" ||
    status === "Active" ||
    status === "Submitted" ||
    status === "Analyzing"
  ) {
    return "reports-status reports-status-ready";
  }

  return "reports-status";
}

function typeClass(type) {
  const map = {
    Activity: "reports-type-activity",
    Traffic: "reports-type-traffic",
    Weather: "reports-type-weather",
    Citizen: "reports-type-citizen",
  };

  return `reports-type ${map[type] || ""}`;
}

function formatDate(value) {
  if (!value) return "Recently";

  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Recently";
  }
}

/* =========================================================
   NORMALIZE CITIZEN REPORT
   ========================================================= */

function normalizeCitizenReport(report, index) {
  const severity = String(
    report?.severity || "medium"
  ).toLowerCase();

  const critical =
    severity === "critical" || severity === "high"
      ? 1
      : 0;

  const status =
    report?.status ||
    report?.reportStatus ||
    "Submitted";

  const title =
    report?.title ||
    report?.eventType ||
    report?.category ||
    "Citizen Civic Report";

  const location =
    report?.address ||
    report?.zone ||
    report?.location?.address ||
    "Location unavailable";

  return {
    id:
      report?._id ||
      report?.id ||
      `citizen-${index}`,

    title,

    type: "Citizen",

    location,

    period: "Citizen Report",

    events: 1,

    critical,

    resolved:
      status.toLowerCase() === "resolved"
        ? 1
        : 0,

    status,

    createdAt: formatDate(
      report?.createdAt ||
        report?.timestamp ||
        report?.reportedAt
    ),

    description:
      report?.description || "",

    severity,

    category:
      report?.category ||
      report?.eventType ||
      "other",

    isCitizenReport: true,

    originalData: report,
  };
}

/* =========================================================
   REPORTS PAGE
   ========================================================= */

function Reports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState(
    GENERATED_REPORT_DATA
  );

  const [filter, setFilter] = useState("All");

  const [search, setSearch] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =======================================================
     LOAD CITIZEN REPORTS
     ======================================================= */

  const loadReports = async () => {
    try {
      setError("");

      const response =
        await getCitizenReports();

      /*
       * Backend may return:
       *
       * { data: [...] }
       *
       * or
       *
       * { reports: [...] }
       *
       * or directly [...]
       */

      const citizenReports =
        Array.isArray(response)
          ? response
          : response?.data ||
            response?.reports ||
            response?.results ||
            [];

      const normalizedReports =
        citizenReports.map(
          normalizeCitizenReport
        );

      setReports([
        ...GENERATED_REPORT_DATA,
        ...normalizedReports,
      ]);
    } catch (err) {
      console.error(
        "Failed to load citizen reports:",
        err
      );

      setError(
        "Unable to load citizen reports."
      );

      /*
       * Keep generated reports visible even if
       * citizen report API is temporarily unavailable.
       */
      setReports([
        ...GENERATED_REPORT_DATA,
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    loadReports();
  }, []);

  /* =======================================================
     REFRESH
     ======================================================= */

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadReports();
  };

  /* =======================================================
     FILTERED REPORTS
     ======================================================= */

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesFilter =
        filter === "All" ||
        report.type === filter;

      const searchValue =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        report.title
          .toLowerCase()
          .includes(searchValue) ||
        report.type
          .toLowerCase()
          .includes(searchValue) ||
        report.location
          .toLowerCase()
          .includes(searchValue) ||
        report.description
          ?.toLowerCase()
          .includes(searchValue);

      return (
        matchesFilter &&
        matchesSearch
      );
    });
  }, [reports, filter, search]);

  /* =======================================================
     SUMMARY
     ======================================================= */

  const summary = useMemo(() => {
    const totalReports =
      reports.length;

    const totalEvents =
      reports.reduce(
        (sum, report) =>
          sum + Number(report.events || 0),
        0
      );

    const totalCritical =
      reports.reduce(
        (sum, report) =>
          sum + Number(report.critical || 0),
        0
      );

    const totalResolved =
      reports.reduce(
        (sum, report) =>
          sum + Number(report.resolved || 0),
        0
      );

    return {
      totalReports,
      totalEvents,
      totalCritical,
      totalResolved,
    };
  }, [reports]);

  /* =======================================================
     DOWNLOAD
     ======================================================= */

  const handleDownload = (report) => {
    const content = [
      "CITYPULSE REPORT",
      "",
      `Report: ${report.title}`,
      `Type: ${report.type}`,
      `Location: ${report.location}`,
      `Period: ${report.period}`,
      "",
      `Total Events: ${report.events}`,
      `Critical Events: ${report.critical}`,
      `Resolved Events: ${report.resolved}`,
      `Status: ${report.status}`,
      "",
      report.description
        ? `Description: ${report.description}`
        : "",
      "",
      `Generated: ${report.createdAt}`,
    ].join("\n");

    const blob = new Blob(
      [content],
      {
        type: "text/plain",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download =
      `${report.title
        .toLowerCase()
        .replaceAll(" ", "-")}.txt`;

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="reports-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="reports-header">

        <div className="reports-header-content">

          <div className="reports-eyebrow">
            <FileBarChart size={14} />
            CITYPULSE INTELLIGENCE
          </div>

          <h1>Reports</h1>

          <p>
            Generate, review and manage intelligence
            reports from city-wide activity and
            citizen reports.
          </p>

        </div>

        <div className="reports-header-actions">

          {/* SUBMIT REPORT */}

          <button
            type="button"
            className="reports-submit-button"
            onClick={() =>
              navigate("/report")
            }
          >
            <Plus size={16} />
            Submit Report
          </button>

          {/* REFRESH */}

          <button
            type="button"
            className="reports-refresh-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "reports-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

      </section>

      {/* ===================================================
          SYSTEM BAR
      =================================================== */}

      <section className="reports-system-bar">

        <div className="reports-system-left">

          <div className="reports-system-icon">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <span>
              REPORTING SYSTEM
            </span>

            <strong>
              Operational
            </strong>
          </div>

        </div>

        <div className="reports-system-time">
          <Clock3 size={14} />
          Reports updated automatically
        </div>

      </section>

      {/* ===================================================
          API ERROR
      =================================================== */}

      {error && (
        <div
          style={{
            margin: "16px 0",
            padding: "12px 16px",
            borderRadius: "10px",
            border:
              "1px solid rgba(239,68,68,.25)",
            background:
              "rgba(239,68,68,.08)",
            color: "#fca5a5",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* ===================================================
          SUMMARY
      =================================================== */}

      <section className="reports-summary-grid">

        <div className="reports-summary-card">

          <div className="reports-summary-icon reports-blue">
            <FileBarChart size={20} />
          </div>

          <div>
            <span>Total Reports</span>
            <strong>
              {summary.totalReports}
            </strong>
            <small>
              Generated reports
            </small>
          </div>

        </div>

        <div className="reports-summary-card">

          <div className="reports-summary-icon reports-cyan">
            <Activity size={20} />
          </div>

          <div>
            <span>Total Events</span>
            <strong>
              {summary.totalEvents}
            </strong>
            <small>
              Across all reports
            </small>
          </div>

        </div>

        <div className="reports-summary-card">

          <div className="reports-summary-icon reports-red">
            <ShieldAlert size={20} />
          </div>

          <div>
            <span>Critical Events</span>
            <strong>
              {summary.totalCritical}
            </strong>
            <small>
              Require attention
            </small>
          </div>

        </div>

        <div className="reports-summary-card">

          <div className="reports-summary-icon reports-green">
            <TrendingUp size={20} />
          </div>

          <div>
            <span>Resolved</span>
            <strong>
              {summary.totalResolved}
            </strong>
            <small>
              Successfully handled
            </small>
          </div>

        </div>

      </section>

      {/* ===================================================
          TOOLBAR
      =================================================== */}

      <section className="reports-toolbar">

        <div className="reports-toolbar-left">

          <div className="reports-toolbar-title">

            <BarChart3 size={18} />

            <div>
              <h2>City Reports</h2>

              <p>
                Intelligence reports and
                citizen submissions.
              </p>
            </div>

          </div>

        </div>

        <div className="reports-toolbar-actions">

          <div className="reports-search">

            <Activity size={15} />

            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          <div className="reports-filter">

            <Filter size={15} />

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Reports
              </option>

              <option value="Activity">
                Activity
              </option>

              <option value="Traffic">
                Traffic
              </option>

              <option value="Weather">
                Weather
              </option>

              <option value="Citizen">
                Citizen
              </option>
            </select>

          </div>

        </div>

      </section>

      {/* ===================================================
          REPORT LIST
      =================================================== */}

      <section className="reports-list">

        {loading ? (

          <div className="reports-empty">

            <RefreshCw
              size={24}
              className="reports-spin"
            />

            <h3>
              Loading reports...
            </h3>

            <p>
              Fetching the latest CityPulse
              reports.
            </p>

          </div>

        ) : filteredReports.length > 0 ? (

          filteredReports.map(
            (report) => (

              <article
                key={report.id}
                className="reports-card"
              >

                {/* LEFT */}

                <div className="reports-card-main">

                  <div className="reports-file-icon">
                    <FileBarChart size={21} />
                  </div>

                  <div className="reports-card-content">

                    <div className="reports-card-heading">

                      <h3>
                        {report.title}
                      </h3>

                      <span
                        className={typeClass(
                          report.type
                        )}
                      >
                        {report.type}
                      </span>

                    </div>

                    <div className="reports-card-meta">

                      <span>
                        <MapPin size={13} />
                        {report.location}
                      </span>

                      <span>
                        <CalendarDays size={13} />
                        {report.period}
                      </span>

                      <span>
                        <Clock3 size={13} />
                        {report.createdAt}
                      </span>

                    </div>

                    <div className="reports-card-stats">

                      <div>
                        <span>
                          Events
                        </span>

                        <strong>
                          {report.events}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Critical
                        </span>

                        <strong className="reports-critical-number">
                          {report.critical}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Resolved
                        </span>

                        <strong className="reports-resolved-number">
                          {report.resolved}
                        </strong>
                      </div>

                    </div>

                    {/* CITIZEN DESCRIPTION */}

                    {report.isCitizenReport &&
                      report.description && (
                        <p
                          style={{
                            marginTop:
                              "10px",
                            fontSize:
                              "13px",
                            lineHeight:
                              "1.6",
                            color:
                              "rgba(255,255,255,.55)",
                          }}
                        >
                          {
                            report.description
                          }
                        </p>
                      )}

                  </div>

                </div>

                {/* RIGHT */}

                <div className="reports-card-actions">

                  <span
                    className={statusClass(
                      report.status
                    )}
                  >
                    <CheckCircle2 size={13} />
                    {report.status}
                  </span>

                  <button
                    type="button"
                    className="reports-download"
                    onClick={() =>
                      handleDownload(
                        report
                      )
                    }
                  >
                    <Download size={15} />
                    Download
                  </button>

                </div>

              </article>
            )
          )

        ) : (

          <div className="reports-empty">

            <div className="reports-empty-icon">
              <FileBarChart size={24} />
            </div>

            <h3>
              No reports found
            </h3>

            <p>
              Try changing your search
              or report filter.
            </p>

          </div>

        )}

      </section>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer className="reports-footer">

        <div>

          <div className="reports-footer-dot" />

          <div>
            <strong>
              CityPulse Reporting Engine
            </strong>

            <span>
              Event Intelligence • Analytics • Reports
            </span>
          </div>

        </div>

        <span>
          Operational
        </span>

      </footer>

    </div>
  );
}

export default Reports;