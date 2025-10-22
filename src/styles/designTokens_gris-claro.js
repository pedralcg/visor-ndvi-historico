// src/styles/designTokens.js - Paleta Gris Claro Minimalista

// Paleta de Colores - Temática Ambiental con fondo claro
export const COLORS = {
  // Colores principales (mantenemos los acentos vibrantes)
  PRIMARY: "#2563eb", // Azul más profundo
  SECONDARY: "#059669", // Verde esmeralda oscuro
  TERTIARY: "#7c3aed", // Púrpura vibrante
  ACCENT: "#ea580c", // Naranja (alertas)

  // Fondos claros con sutileza
  BACKGROUND: "#f8fafc", // Gris muy claro (casi blanco)
  BACKGROUND_SECONDARY: "#f1f5f9", // Gris claro secundario
  SURFACE: "#ffffff", // Blanco puro para tarjetas
  SURFACE_ELEVATED: "#fefefe", // Blanco con elevación

  // Bordes y divisores suaves
  BORDER: "#e2e8f0",
  BORDER_FOCUS: "#10b981",
  BORDER_HOVER: "#cbd5e1",

  // Texto optimizado para fondo claro
  TEXT_DARK: "#0f172a", // Texto principal oscuro
  TEXT_MUTED: "#475569", // Texto secundario
  TEXT_DISABLED: "#94a3b8", // Texto deshabilitado

  // Estados
  SUCCESS: "#059669",
  ERROR: "#dc2626",
  WARNING: "#ea580c",
  INFO: "#2563eb",

  // Overlays y efectos para tema claro
  OVERLAY: "rgba(15, 23, 42, 0.4)",
  GLASS_BG: "rgba(255, 255, 255, 0.85)",
  GLASS_BORDER: "rgba(226, 232, 240, 0.6)",
};

// Sombras sutiles para tema claro
export const SHADOWS = {
  CARD_DEFAULT: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)",
  CARD_HOVER:
    "0 10px 25px rgba(5, 150, 105, 0.15), 0 0 0 1px rgba(5, 150, 105, 0.1)",
  SIDEBAR: "1px 0 10px rgba(0, 0, 0, 0.06)",
  NAVBAR: "0 1px 3px rgba(0, 0, 0, 0.08)",
  BUTTON: "0 1px 2px rgba(0, 0, 0, 0.08)",
  BUTTON_HOVER: "0 4px 12px rgba(5, 150, 105, 0.25)",
  GLOW_PRIMARY: "0 0 20px rgba(37, 99, 235, 0.15)",
  GLOW_SECONDARY: "0 0 20px rgba(5, 150, 105, 0.15)",
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
