// src/styles/designTokens.js - Paleta Blanco Nórdico (Estilo Escandinavo)

// Paleta de Colores - Temática Ambiental limpia y minimalista
export const COLORS = {
  // Colores principales con saturación moderada
  PRIMARY: "#3b82f6", // Azul cielo vibrante
  SECONDARY: "#10b981", // Verde menta
  TERTIARY: "#8b5cf6", // Púrpura suave
  ACCENT: "#f59e0b", // Ámbar cálido

  // Fondos blancos puros
  BACKGROUND: "#ffffff", // Blanco puro
  BACKGROUND_SECONDARY: "#fafafa", // Blanco humo
  SURFACE: "#ffffff", // Blanco para tarjetas
  SURFACE_ELEVATED: "#ffffff", // Elevado con sombra

  // Bordes muy sutiles
  BORDER: "#f3f4f6",
  BORDER_FOCUS: "#10b981",
  BORDER_HOVER: "#e5e7eb",

  // Texto con contraste óptimo
  TEXT_DARK: "#111827", // Negro suave
  TEXT_MUTED: "#6b7280", // Gris medio
  TEXT_DISABLED: "#9ca3af", // Gris claro

  // Estados
  SUCCESS: "#10b981",
  ERROR: "#ef4444",
  WARNING: "#f59e0b",
  INFO: "#3b82f6",

  // Overlays y efectos
  OVERLAY: "rgba(17, 24, 39, 0.3)",
  GLASS_BG: "rgba(255, 255, 255, 0.95)",
  GLASS_BORDER: "rgba(243, 244, 246, 0.8)",
};

// Sombras muy sutiles y elegantes
export const SHADOWS = {
  CARD_DEFAULT: "0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.04)",
  CARD_HOVER:
    "0 8px 20px rgba(16, 185, 129, 0.12), 0 0 0 1px rgba(16, 185, 129, 0.08)",
  SIDEBAR: "1px 0 8px rgba(0, 0, 0, 0.04)",
  NAVBAR: "0 1px 2px rgba(0, 0, 0, 0.04)",
  BUTTON: "0 1px 2px rgba(0, 0, 0, 0.05)",
  BUTTON_HOVER: "0 4px 12px rgba(16, 185, 129, 0.2)",
  GLOW_PRIMARY: "0 0 16px rgba(59, 130, 246, 0.12)",
  GLOW_SECONDARY: "0 0 16px rgba(16, 185, 129, 0.12)",
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
