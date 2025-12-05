// components/Navbar.jsx - Modern Minimalist Design

import React, { useState } from "react";
import {
  Satellite,
  Home,
  Mail,
  Grid3X3,
  LogIn,
  ChevronDown,
  TrendingUp,
  AlertTriangle,
  Calculator,
  GitCompare,
  Zap,
  Image,
} from "lucide-react";
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
  const [isAppsOpen, setIsAppsOpen] = useState(false);
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
        [
          "ndvi",
          "timeseries",
          "thresholds",
          "multiindex",
          "test",
          "compositor",
          "change-detection",
          "thresholds-calculator",
        ].includes(currentApp));
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

  const APPS_MENU = [
    { key: "compositor", label: "Composiciones de Imagenes", icon: Image },
    { key: "ndvi", label: "Análisis Espectral", icon: Satellite },
    {
      key: "timeseries",
      label: "Series Temporales con Tendencia",
      icon: TrendingUp,
    },
    {
      key: "thresholds",
      label: "Análisis con Umbrales de Alerta",
      icon: AlertTriangle,
    },
    {
      key: "thresholds-calculator",
      label: "Calculadora de Umbrales",
      icon: Calculator,
    },
    { key: "change-detection", label: "Detección de Cambio", icon: GitCompare },
    { key: "multiindex", label: "Comparación Multi-índice", icon: Zap },
  ];

  const dropdownMenuStyle = {
    position: "absolute",
    top: "100%",
    left: "0",
    marginTop: "0.5rem",
    backgroundColor: COLORS.SURFACE,
    border: `1px solid ${COLORS.BORDER}`,
    borderRadius: RADIUS.MD,
    boxShadow: SHADOWS.MD,
    padding: "0.5rem",
    minWidth: "280px",
    display: isAppsOpen ? "flex" : "none",
    flexDirection: "column",
    gap: "0.25rem",
    zIndex: Z_INDEX.NAVBAR + 10,
  };

  const getDropdownItemStyle = (appKey) => {
    const isHovered = hoveredItem === `app-${appKey}`;
    const isActive = currentApp === appKey;

    return {
      padding: "0.75rem 1rem",
      borderRadius: RADIUS.SM,
      textDecoration: "none",
      fontSize: "0.875rem",
      fontWeight: isActive ? "600" : "500",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      transition: ANIMATIONS.TRANSITION_BASE,
      cursor: "pointer",
      color: isActive ? COLORS.SECONDARY : COLORS.TEXT_PRIMARY,
      backgroundColor: isActive
        ? `${COLORS.SECONDARY}10`
        : isHovered
        ? COLORS.BACKGROUND_SECONDARY
        : "transparent",
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
          <button
            style={getLinkStyle("home")}
            onClick={() => handleAppChange("home")}
            onMouseEnter={() => setHoveredItem("home")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Home size={18} /> Home
          </button>
        </li>
        <li>
          <div style={{ position: "relative" }}>
            <button
              style={{
                ...getLinkStyle("apps"),
                background: isAppsOpen
                  ? `${COLORS.SECONDARY}10`
                  : getLinkStyle("apps").backgroundColor,
                color: isAppsOpen
                  ? COLORS.SECONDARY
                  : getLinkStyle("apps").color,
              }}
              onClick={() => setIsAppsOpen(!isAppsOpen)}
              onMouseEnter={() => setHoveredItem("apps")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Grid3X3 size={18} />
              Aplicaciones
              <ChevronDown
                size={16}
                style={{
                  transform: isAppsOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: ANIMATIONS.TRANSITION_BASE,
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {isAppsOpen && (
              <>
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: Z_INDEX.NAVBAR + 5,
                    cursor: "default",
                  }}
                  onClick={() => setIsAppsOpen(false)}
                />
                <div style={dropdownMenuStyle}>
                  {APPS_MENU.map((app) => {
                    const Icon = app.icon;
                    return (
                      <div
                        key={app.key}
                        style={getDropdownItemStyle(app.key)}
                        onClick={() => {
                          handleAppChange(app.key);
                          setIsAppsOpen(false);
                        }}
                        onMouseEnter={() => setHoveredItem(`app-${app.key}`)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <Icon size={18} />
                        {app.label}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </li>
        <li>
          <button
            style={getLinkStyle("contact")}
            onClick={() => handleAppChange("contact")}
            onMouseEnter={() => setHoveredItem("contact")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Mail size={18} /> Contacto
          </button>
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
