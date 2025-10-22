// src/styles/designTokens.js - Paleta Gris Cálido Premium

// Paleta de Colores - Balance perfecto entre claridad y calidez
export const COLORS = {
  // Colores principales vibrantes
  PRIMARY: "#1d4ed8", // Azul profundo
  SECONDARY: "#047857", // Verde bosque
  TERTIARY: "#7c3aed", // Púrpura intenso
  ACCENT: "#dc2626", // Rojo (alertas)

  // Fondos con tono cálido sutil
  BACKGROUND: "#fafaf9", // Gris cálido muy claro
  BACKGROUND_SECONDARY: "#f5f5f4", // Gris piedra claro
  SURFACE: "#ffffff", // Blanco puro
  SURFACE_ELEVATED: "#fefefe", // Blanco con sombra

  // Bordes naturales
  BORDER: "#e7e5e4",
  BORDER_FOCUS: "#047857",
  BORDER_HOVER: "#d6d3d1",

  // Texto con calidez
  TEXT_DARK: "#1c1917", // Negro cálido
  TEXT_MUTED: "#57534e", // Gris piedra
  TEXT_DISABLED: "#a8a29e", // Gris piedra claro

  // Estados
  SUCCESS: "#047857",
  ERROR: "#dc2626",
  WARNING: "#ea580c",
  INFO: "#1d4ed8",

  // Overlays y efectos
  OVERLAY: "rgba(28, 25, 23, 0.35)",
  GLASS_BG: "rgba(255, 255, 255, 0.9)",
  GLASS_BORDER: "rgba(231, 229, 228, 0.7)",
};

// Sombras con tono cálido
export const SHADOWS = {
  CARD_DEFAULT:
    "0 1px 3px rgba(28, 25, 23, 0.08), 0 1px 2px rgba(28, 25, 23, 0.06)",
  CARD_HOVER:
    "0 10px 24px rgba(4, 120, 87, 0.18), 0 0 0 1px rgba(4, 120, 87, 0.1)",
  SIDEBAR: "1px 0 10px rgba(28, 25, 23, 0.06)",
  NAVBAR: "0 1px 3px rgba(28, 25, 23, 0.08)",
  BUTTON: "0 1px 2px rgba(28, 25, 23, 0.08)",
  BUTTON_HOVER: "0 4px 14px rgba(4, 120, 87, 0.28)",
  GLOW_PRIMARY: "0 0 20px rgba(29, 78, 216, 0.18)",
  GLOW_SECONDARY: "0 0 20px rgba(4, 120, 87, 0.18)",
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
