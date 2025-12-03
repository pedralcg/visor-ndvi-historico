// src/styles/designTokens.js - Modern Minimalist Design System

// ===== COLORS - Modern & Clean =====
export const COLORS = {
  // Primary Colors - Vibrant but refined
  PRIMARY: "#2563eb", // Modern blue
  SECONDARY: "#10b981", // Emerald green
  TERTIARY: "#8b5cf6", // Vibrant purple
  ACCENT: "#ef4444", // Coral red

  // Backgrounds - Clean whites and subtle grays
  BACKGROUND: "#ffffff",
  BACKGROUND_SECONDARY: "#f9fafb",
  SURFACE: "#ffffff",
  SURFACE_ELEVATED: "#ffffff",

  // Borders - Subtle and clean
  BORDER: "#e5e7eb",
  BORDER_FOCUS: "#10b981",
  BORDER_HOVER: "#d1d5db",

  // Text - High contrast for readability
  TEXT_PRIMARY: "#111827",
  TEXT_SECONDARY: "#6b7280",
  TEXT_TERTIARY: "#9ca3af",
  TEXT_DISABLED: "#d1d5db",

  // States
  SUCCESS: "#10b981",
  ERROR: "#ef4444",
  WARNING: "#f59e0b",
  INFO: "#3b82f6",

  // Overlays and effects
  OVERLAY: "rgba(17, 24, 39, 0.5)",
  GLASS_BG: "rgba(255, 255, 255, 0.95)",
  GLASS_BORDER: "rgba(229, 231, 235, 0.8)",
};

// ===== SHADOWS - Soft and subtle =====
export const SHADOWS = {
  NONE: "none",
  SM: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  MD: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  LG: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  XL: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  "2XL": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  INNER: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",

  // Legacy support (mapped to new values)
  CARD_DEFAULT:
    "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  CARD_HOVER:
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  SIDEBAR: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  NAVBAR: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  BUTTON: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  BUTTON_HOVER:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  GLOW_PRIMARY: "0 0 20px rgba(37, 99, 235, 0.15)",
  GLOW_SECONDARY: "0 0 20px rgba(16, 185, 129, 0.15)",
};

// ===== TYPOGRAPHY - Modern and readable =====
export const TYPOGRAPHY = {
  FONT_FAMILY:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  FONT_MONO: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",

  FONT_SIZES: {
    XS: "0.75rem", // 12px
    SM: "0.875rem", // 14px
    BASE: "1rem", // 16px
    LG: "1.125rem", // 18px
    XL: "1.25rem", // 20px
    "2XL": "1.5rem", // 24px
    "3XL": "1.875rem", // 30px
    "4XL": "2.25rem", // 36px
  },

  FONT_WEIGHTS: {
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
    EXTRABOLD: 800,
  },

  LINE_HEIGHTS: {
    TIGHT: 1.25,
    NORMAL: 1.5,
    RELAXED: 1.75,
  },
};

// ===== ANIMATIONS - Smooth and polished =====
export const ANIMATIONS = {
  TRANSITION_FAST: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
  TRANSITION_BASE: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  TRANSITION_SLOW: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

  EASING: {
    DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
    IN: "cubic-bezier(0.4, 0, 1, 1)",
    OUT: "cubic-bezier(0, 0, 0.2, 1)",
    IN_OUT: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

// ===== SPACING - Consistent and generous =====
export const SPACING = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px

  // Legacy support
  XS: "0.25rem",
  SM: "0.5rem",
  MD: "1rem",
  LG: "1.5rem",
  XL: "2rem",
  XXL: "3rem",
};

// ===== RADIUS - Rounded and modern =====
export const RADIUS = {
  NONE: "0",
  SM: "0.25rem", // 4px
  DEFAULT: "0.375rem", // 6px
  MD: "0.5rem", // 8px
  LG: "0.75rem", // 12px
  XL: "1rem", // 16px
  "2XL": "1.5rem", // 24px
  FULL: "9999px",
};

// ===== Z-INDEX - Layering hierarchy =====
export const Z_INDEX = {
  BASE: 1,
  DROPDOWN: 10,
  STICKY: 100,
  NAVBAR: 1000,
  MODAL: 2000,
  TOOLTIP: 3000,
  NOTIFICATION: 4000,
};
