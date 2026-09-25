import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ============================================================
// GLOBAL COMPONENTS
// ============================================================

import Navbar from "./components/Navbar";
import SecurityAlarm from "./components/SecurityAlarm";

// ============================================================
// PAGES
// ============================================================

import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Map from "./pages/Map";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import CitizenReport from "./pages/CitizenReport";
import Reports from "./pages/Reports";

// ============================================================
// CITYPULSE BACKGROUND
// ============================================================

function CityPulseBackground() {
  return (
    <div
      className="cp-background"
      aria-hidden="true"
    >
      {/* Atmospheric glows */}

      <div className="cp-gradient-glow cp-glow-one" />
      <div className="cp-gradient-glow cp-glow-two" />
      <div className="cp-gradient-glow cp-glow-three" />

      {/* Digital grid */}

      <div className="cp-grid" />

      {/* Network lines */}

      <div className="cp-network">
        <span className="cp-line line-1" />
        <span className="cp-line line-2" />
        <span className="cp-line line-3" />
        <span className="cp-line line-4" />
        <span className="cp-line line-5" />
        <span className="cp-line line-6" />
      </div>

      {/* Network nodes */}

      <span className="cp-node node-1" />
      <span className="cp-node node-2" />
      <span className="cp-node node-3" />
      <span className="cp-node node-4" />
      <span className="cp-node node-5" />
      <span className="cp-node node-6" />
      <span className="cp-node node-7" />
      <span className="cp-node node-8" />

      {/* Floating particles */}

      <span className="cp-particle particle-1" />
      <span className="cp-particle particle-2" />
      <span className="cp-particle particle-3" />
      <span className="cp-particle particle-4" />
      <span className="cp-particle particle-5" />
      <span className="cp-particle particle-6" />
    </div>
  );
}

// ============================================================
// CITYPULSE APPLICATION
// ============================================================

function App() {
  return (
    <BrowserRouter>
      <div className="citypulse-app">

        {/* ====================================================
            GLOBAL BACKGROUND
        ===================================================== */}

        <CityPulseBackground />

        {/* ====================================================
            GLOBAL NAVBAR
        ===================================================== */}

        <Navbar />

        {/* ====================================================
            GLOBAL SECURITY ALARM
           
            This stays OUTSIDE the Routes so the buzzer/
            security notification can appear from ANY page.
        ===================================================== */}

        <SecurityAlarm />

        {/* ====================================================
            MAIN APPLICATION
        ===================================================== */}

        <main className="cp-app-content">

          <Routes>

            {/* ==================================================
                ROOT
            ================================================== */}

            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            {/* ==================================================
                DASHBOARD
            ================================================== */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* ==================================================
                EVENTS
            ================================================== */}

            <Route
              path="/events"
              element={<Events />}
            />

            <Route
              path="/events/:eventId"
              element={<EventDetails />}
            />

            {/* ==================================================
                LIVE MAP
            ================================================== */}

            <Route
              path="/map"
              element={<Map />}
            />

            {/* ==================================================
                ALERTS
            ================================================== */}

            <Route
              path="/alerts"
              element={<Alerts />}
            />

            {/* ==================================================
                ANALYTICS
            ================================================== */}

            <Route
              path="/analytics"
              element={<Analytics />}
            />

            {/* ==================================================
                CITIZEN REPORT
            ================================================== */}

            <Route
              path="/report"
              element={<CitizenReport />}
            />

            {/* ==================================================
                REPORTS
            ================================================== */}

            <Route
              path="/reports"
              element={<Reports />}
            />

            {/* ==================================================
                FALLBACK
            ================================================== */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

          </Routes>

        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;