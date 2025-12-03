// components/Navbar.jsx - Modern Minimalist Design

import React, { useState } from "react";
import { Satellite, Home, Mail, Grid3X3, LogIn } from "lucide-react";
import {
  COLORS,
  SHADOWS,
  ANIMATIONS,
  RADIUS,
  Z_INDEX,
} from "../styles/designTokens";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./auth/AuthModal";
import UserMenu from "./auth/UserMenu";

const Navbar = ({ setCurrentApp, currentApp }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const navStyle = {
    backgroundColor: COLORS.SURFACE,
    color: COLORS.TEXT_PRIMARY,
    padding: "0 2rem",
    height: "64px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: SHADOWS.SM,
    borderBottom: `1px solid ${COLORS.BORDER}`,
    flexShrink: 0,
    position: "relative",
    zIndex: Z_INDEX.NAVBAR,
  };

  const logoStyle = {
    fontSize: "1.25rem",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    gap: "0.75rem",
    transition: ANIMATIONS.TRANSITION_BASE,
    userSelect: "none",
  };

  const logoTextStyle = {
    background: `linear-gradient(135deg, ${COLORS.PRIMARY} 0%, ${COLORS.SECONDARY} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontWeight: "700",
    letterSpacing: "-0.02em",
  };

  const handleAppChange = (appName) => {
    setCurrentApp(appName);
  };

  const linkBaseStyle = {
    padding: "0.5rem 1rem",
    borderRadius: RADIUS.MD,
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: ANIMATIONS.TRANSITION_BASE,
    cursor: "pointer",
    position: "relative",
    border: "none",
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
      color: isActive ? COLORS.SECONDARY : COLORS.TEXT_SECONDARY,
      backgroundColor: isActive
        ? `${COLORS.SECONDARY}15`
        : isHovered
        ? COLORS.BACKGROUND_SECONDARY
        : "transparent",
      fontWeight: isActive ? "600" : "500",
    };
  };

  const actionButtonBase = {
    backgroundColor: "transparent",
    border: `1px solid ${COLORS.BORDER}`,
    borderRadius: RADIUS.MD,
    padding: "0.5rem 1.25rem",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: ANIMATIONS.TRANSITION_BASE,
    color: COLORS.TEXT_SECONDARY,
  };

  const getLoginButtonStyle = () => {
    const isHovered = hoveredItem === "login";
    return {
      ...actionButtonBase,
      backgroundColor: isHovered ? `${COLORS.PRIMARY}08` : "transparent",
      borderColor: isHovered ? COLORS.PRIMARY : COLORS.BORDER,
      color: isHovered ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY,
    };
  };

  const getRegisterButtonStyle = () => {
    const isHovered = hoveredItem === "register";
    return {
      ...actionButtonBase,
      backgroundColor: isHovered
        ? `${COLORS.SECONDARY}20`
        : `${COLORS.SECONDARY}10`,
      borderColor: isHovered ? COLORS.SECONDARY : `${COLORS.SECONDARY}40`,
      color: COLORS.SECONDARY,
      boxShadow: isHovered ? SHADOWS.SM : "none",
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
          size={24}
          color={COLORS.SECONDARY}
          style={{
            filter:
              hoveredItem === "logo"
                ? `drop-shadow(0 0 6px ${COLORS.SECONDARY})`
                : "none",
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
          gap: "0.25rem",
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

      {/* Auth section - conditional rendering */}
      {isAuthenticated ? (
        <UserMenu />
      ) : (
        <button
          style={getLoginButtonStyle()}
          onMouseEnter={() => setHoveredItem("login")}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => setShowAuthModal(true)}
        >
          <LogIn size={18} /> Iniciar Sesión
        </button>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </nav>
  );
};

export default Navbar;
