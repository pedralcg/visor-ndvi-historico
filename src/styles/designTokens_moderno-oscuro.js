// src/styles/designTokens.js - Sistema de diseño moderno oscuro

// Paleta de Colores - Temática Ambiental/Satelital
export const COLORS = {
  // Colores principales (tonos ambientales)
  PRIMARY: "#60a5fa", // Azul cielo (datos, servicios)
  SECONDARY: "#34d399", // Verde esmeralda (vegetación, NDVI, éxito)
  TERTIARY: "#a78bfa", // Púrpura (análisis, futuro)
  ACCENT: "#fbbf24", // Ámbar (alertas, warnings)

  // Fondos oscuros
  BACKGROUND: "#0a0f1c", // Fondo principal oscuro profundo
  BACKGROUND_SECONDARY: "#1a2332", // Fondo secundario
  SURFACE: "rgba(15, 23, 42, 0.8)", // Superficie con transparencia
  SURFACE_ELEVATED: "rgba(30, 41, 59, 0.9)", // Superficie elevada

  // Bordes y divisores
  BORDER: "rgba(255, 255, 255, 0.08)",
  BORDER_FOCUS: "rgba(52, 211, 153, 0.4)",
  BORDER_HOVER: "rgba(255, 255, 255, 0.15)",

  // Texto
  TEXT_DARK: "#f1f5f9", // Texto principal claro
  TEXT_MUTED: "#94a3b8", // Texto secundario
  TEXT_DISABLED: "#64748b", // Texto deshabilitado

  // Estados
  SUCCESS: "#34d399",
  ERROR: "#f87171",
  WARNING: "#fbbf24",
  INFO: "#60a5fa",

  // Overlays y efectos
  OVERLAY: "rgba(0, 0, 0, 0.5)",
  GLASS_BG: "rgba(15, 23, 42, 0.6)",
  GLASS_BORDER: "rgba(255, 255, 255, 0.1)",
};

// Sombras con efectos de color
export const SHADOWS = {
  CARD_DEFAULT:
    "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
  CARD_HOVER:
    "0 20px 40px -10px rgba(52, 211, 153, 0.25), 0 0 0 1px rgba(52, 211, 153, 0.1)",
  SIDEBAR: "2px 0 20px rgba(0, 0, 0, 0.4)",
  NAVBAR: "0 2px 10px rgba(0, 0, 0, 0.3)",
  BUTTON: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
  BUTTON_HOVER: "0 8px 16px -4px rgba(52, 211, 153, 0.3)",
  GLOW_PRIMARY: "0 0 20px rgba(96, 165, 250, 0.3)",
  GLOW_SECONDARY: "0 0 20px rgba(52, 211, 153, 0.3)",
};

// Tipografía
export const TYPOGRAPHY = {
  FONT_FAMILY:
    "'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
  FONT_MONO: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
};

// Animaciones y transiciones
export const ANIMATIONS = {
  TRANSITION_FAST: "all 0.2s ease",
  TRANSITION_BASE: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  TRANSITION_SLOW: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
};

// Espaciado
export const SPACING = {
  XS: "4px",
  SM: "8px",
  MD: "16px",
  LG: "24px",
  XL: "32px",
  XXL: "48px",
};

// Radios de borde
export const RADIUS = {
  SM: "6px",
  MD: "10px",
  LG: "16px",
  XL: "24px",
  FULL: "9999px",
};

// Z-index hierarchy
export const Z_INDEX = {
  BASE: 1,
  DROPDOWN: 10,
  STICKY: 100,
  NAVBAR: 1000,
  MODAL: 2000,
  TOOLTIP: 3000,
};
