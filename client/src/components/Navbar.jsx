import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  Map,
  BarChart3,
  Bell,
  FileText,
  Menu,
  X,
} from "lucide-react";

import "./navbar.css";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Events",
    path: "/events",
    icon: Activity,
  },
  {
    label: "Live Map",
    path: "/map",
    icon: Map,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Alerts",
    path: "/alerts",
    icon: Bell,
  },
  {
    label: "Report",
    path: "/reports",
    icon: FileText,
  },
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <header className="city-navbar">

      {/* =====================================================
          NAVBAR INNER
          ===================================================== */}
      <div className="city-navbar-inner">

        {/* ===================================================
            BRAND
            =================================================== */}
        <Link
          to="/dashboard"
          className="city-brand"
          onClick={closeMobileMenu}
        >
          <div className="city-brand-icon">
            <Activity size={21} strokeWidth={2.4} />
          </div>

          <div className="city-brand-text">
            <span className="city-brand-name">
              CityPulse
            </span>

            <span className="city-brand-subtitle">
              Smart City Intelligence
            </span>
          </div>
        </Link>

        {/* ===================================================
            DESKTOP NAVIGATION
            =================================================== */}
        <nav className="city-desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `city-nav-link ${
                    isActive ? "city-nav-link-active" : ""
                  }`
                }
              >
                <Icon
                  size={16}
                  strokeWidth={2}
                />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* ===================================================
            LIVE STATUS
            =================================================== */}
        <div className="city-navbar-status">
          <span className="city-status-dot" />

          <span>SYSTEMS LIVE</span>
        </div>

        {/* ===================================================
            MOBILE BUTTON
            =================================================== */}
        <button
          type="button"
          className="city-mobile-button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={
            mobileOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X size={21} />
          ) : (
            <Menu size={21} />
          )}
        </button>
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
          ===================================================== */}
      {mobileOpen && (
        <nav className="city-mobile-nav">

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `city-mobile-link ${
                    isActive
                      ? "city-mobile-link-active"
                      : ""
                  }`
                }
              >
                <Icon
                  size={18}
                  strokeWidth={2}
                />

                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Mobile status */}
          <div className="city-mobile-status">
            <span className="city-status-dot" />

            <span>SYSTEMS LIVE</span>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;