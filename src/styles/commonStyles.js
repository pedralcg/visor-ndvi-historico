// Common sidebar styles for all applications
import {
  COLORS,
  SHADOWS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
} from "../styles/designTokens";

export const modernSidebarStyle = {
  width: "380px",
  backgroundColor: COLORS.SURFACE,
  borderRight: `1px solid ${COLORS.BORDER}`,
  boxShadow: SHADOWS.SM,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  fontFamily: TYPOGRAPHY.FONT_FAMILY,
};

export const sidebarHeaderStyle = {
  padding: SPACING[6],
  borderBottom: `1px solid ${COLORS.BORDER}`,
  backgroundColor: COLORS.BACKGROUND,
};

export const sidebarTitleStyle = {
  fontSize: TYPOGRAPHY.FONT_SIZES.LG,
  fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
  color: COLORS.TEXT_PRIMARY,
  marginBottom: SPACING[2],
  display: "flex",
  alignItems: "center",
  gap: SPACING[2],
};

export const sidebarSubtitleStyle = {
  fontSize: TYPOGRAPHY.FONT_SIZES.SM,
  color: COLORS.TEXT_SECONDARY,
  lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL,
};

export const sidebarContentStyle = {
  padding: SPACING[6],
  flex: 1,
  overflowY: "auto",
};

export const formGroupStyle = {
  marginBottom: SPACING[5],
};

export const labelStyle = {
  display: "block",
  fontSize: TYPOGRAPHY.FONT_SIZES.SM,
  fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  color: COLORS.TEXT_PRIMARY,
  marginBottom: SPACING[2],
};

export const inputStyle = {
  width: "100%",
  padding: `${SPACING[2]} ${SPACING[3]}`,
  fontSize: TYPOGRAPHY.FONT_SIZES.SM,
  border: `1px solid ${COLORS.BORDER}`,
  borderRadius: RADIUS.MD,
  backgroundColor: COLORS.SURFACE,
  color: COLORS.TEXT_PRIMARY,
  transition: "all 0.2s ease",
  outline: "none",
};

export const inputFocusStyle = {
  borderColor: COLORS.BORDER_FOCUS,
  boxShadow: `0 0 0 3px ${COLORS.SECONDARY}15`,
};

export const buttonPrimaryStyle = {
  width: "100%",
  padding: `${SPACING[3]} ${SPACING[4]}`,
  fontSize: TYPOGRAPHY.FONT_SIZES.SM,
  fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  color: "#ffffff",
  backgroundColor: COLORS.SECONDARY,
  border: "none",
  borderRadius: RADIUS.MD,
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: SHADOWS.SM,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: SPACING[2],
};

export const buttonSecondaryStyle = {
  ...buttonPrimaryStyle,
  backgroundColor: "transparent",
  color: COLORS.TEXT_SECONDARY,
  border: `1px solid ${COLORS.BORDER}`,
  boxShadow: "none",
};

export const errorMessageStyle = {
  padding: SPACING[3],
  backgroundColor: `${COLORS.ERROR}10`,
  border: `1px solid ${COLORS.ERROR}30`,
  borderRadius: RADIUS.MD,
  color: COLORS.ERROR,
  fontSize: TYPOGRAPHY.FONT_SIZES.SM,
  marginBottom: SPACING[4],
  display: "flex",
  alignItems: "start",
  gap: SPACING[2],
};

export const infoMessageStyle = {
  padding: SPACING[3],
  backgroundColor: `${COLORS.INFO}10`,
  border: `1px solid ${COLORS.INFO}30`,
  borderRadius: RADIUS.MD,
  color: COLORS.INFO,
  fontSize: TYPOGRAPHY.FONT_SIZES.SM,
  marginBottom: SPACING[4],
  display: "flex",
  alignItems: "start",
  gap: SPACING[2],
};
