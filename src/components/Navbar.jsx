// components/Navbar.jsx - Diseño moderno con glassmorphism

import React, { useState } from "react";
import { Satellite, Home, Mail, Grid3X3, LogIn, UserPlus } from "lucide-react";
import { COLORS, SHADOWS, ANIMATIONS, Z_INDEX } from "../styles/designTokens";

const Navbar = ({ setCurrentApp, currentApp }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const navStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    color: "#1c1917",
    padding: "0 30px",
    height: "70px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(28, 25, 23, 0.08)",
    borderBottom: `1px solid #e7e5e4`,
    flexShrink: 0,
    position: "relative",
    zIndex: Z_INDEX.NAVBAR,
  };

  const logoStyle = {
    fontSize: "1.5rem",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    gap: "12px",
    transition: ANIMATIONS.TRANSITION_BASE,
    userSelect: "none",
  };

  const logoTextStyle = {
    background: "linear-gradient(135deg, #1d4ed8 0%, #047857 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  };

  const handleAppChange = (appName) => {
    setCurrentApp(appName);
  };

  const linkBaseStyle = {
    padding: "10px 18px",
    borderRadius: "10px",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: ANIMATIONS.TRANSITION_BASE,
    cursor: "pointer",
    position: "relative",
    border: "1px solid transparent",
  };

  const getLinkStyle = (appKey) => {
    const isActive =
      currentApp === appKey ||
      (appKey === "apps" &&
        ["ndvi", "timeseries", "thresholds", "multiindex", "test"].includes(
          currentApp
        ));
    const isHovered = hoveredItem === appKey;

    return {
      ...linkBaseStyle,
      color: isActive ? "#047857" : "#78716c",
      backgroundColor: isActive
        ? "rgba(4, 120, 87, 0.12)"
        : isHovered
        ? "rgba(28, 25, 23, 0.05)"
        : "transparent",
      borderColor: isActive ? "rgba(4, 120, 87, 0.25)" : "transparent",
      transform: isHovered && !isActive ? "translateY(-2px)" : "translateY(0)",
    };
  };

  const actionButtonBase = {
    backgroundColor: "transparent",
    border: "1px solid #e7e5e4",
    borderRadius: "10px",
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: ANIMATIONS.TRANSITION_BASE,
    color: "#78716c",
  };

  const getLoginButtonStyle = () => {
    const isHovered = hoveredItem === "login";
    return {
      ...actionButtonBase,
      backgroundColor: isHovered ? "rgba(29, 78, 216, 0.08)" : "transparent",
      borderColor: isHovered ? "rgba(29, 78, 216, 0.3)" : "#e7e5e4",
      color: isHovered ? "#1d4ed8" : "#78716c",
      transform: isHovered ? "translateY(-2px)" : "translateY(0)",
    };
  };

  const getRegisterButtonStyle = () => {
    const isHovered = hoveredItem === "register";
    return {
      ...actionButtonBase,
      backgroundColor: isHovered
        ? "rgba(4, 120, 87, 0.15)"
        : "rgba(4, 120, 87, 0.08)",
      borderColor: isHovered ? "#047857" : "rgba(4, 120, 87, 0.25)",
      color: "#047857",
      transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      boxShadow: isHovered ? "0 4px 14px rgba(4, 120, 87, 0.28)" : "none",
    };
  };

  return (
    <nav style={navStyle}>
      {/* LOGO */}
      <div
        style={logoStyle}
        onClick={() => handleAppChange("home")}
        onMouseEnter={() => setHoveredItem("logo")}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <Satellite
          size={28}
          color="#047857"
          style={{
            filter:
              hoveredItem === "logo" ? `drop-shadow(0 0 8px #047857)` : "none",
            transition: ANIMATIONS.TRANSITION_BASE,
          }}
        />
        <span style={logoTextStyle}>GeoVisor</span>
      </div>

      {/* Navegación Principal */}
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          gap: "8px",
        }}
      >
        <li>
          <a
            style={getLinkStyle("home")}
            onClick={() => handleAppChange("home")}
            onMouseEnter={() => setHoveredItem("home")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Home size={18} /> Home
          </a>
        </li>
        <li>
          <a
            style={getLinkStyle("apps")}
            onClick={() => handleAppChange("ndvi")}
            onMouseEnter={() => setHoveredItem("apps")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Grid3X3 size={18} /> Aplicaciones
          </a>
        </li>
        <li>
          <a
            style={getLinkStyle("contact")}
            onClick={() => handleAppChange("contact")}
            onMouseEnter={() => setHoveredItem("contact")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Mail size={18} /> Contacto
          </a>
        </li>
      </ul>

      {/* Acciones (Login/Registro) */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          style={getLoginButtonStyle()}
          onMouseEnter={() => setHoveredItem("login")}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => console.log("Navegar a Login")}
        >
          <LogIn size={18} /> Login
        </button>
        <button
          style={getRegisterButtonStyle()}
          onMouseEnter={() => setHoveredItem("register")}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => console.log("Navegar a Registro")}
        >
          <UserPlus size={18} /> Registro
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
