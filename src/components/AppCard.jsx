// src/components/AppCard.jsx - Modern Minimalist Design

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { COLORS, SHADOWS, RADIUS, ANIMATIONS } from "../styles/designTokens";

const AppCard = ({
  title,
  description,
  icon: Icon,
  color,
  onClick,
  appKey,
  index = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isFuture = appKey === "future";

  // Card base style - clean and minimal
  const cardBaseStyle = {
    backgroundColor: COLORS.SURFACE,
    padding: "1.75rem",
    borderRadius: RADIUS.XL,
    border: `1px solid ${
      isHovered && !isFuture ? color + "40" : COLORS.BORDER
    }`,
    boxShadow: isHovered && !isFuture ? SHADOWS.LG : SHADOWS.DEFAULT,
    textAlign: "left",
    transition: ANIMATIONS.TRANSITION_BASE,
    transform: isHovered && !isFuture ? "translateY(-4px)" : "translateY(0)",
    cursor: isFuture ? "not-allowed" : "pointer",
    display: "flex",
    flexDirection: "column",
    minHeight: "240px",
    position: "relative",
    opacity: isFuture ? 0.6 : 1,
    overflow: "hidden",
    animation: `cardFadeIn 0.5s ease-out ${index * 0.08}s backwards`,
  };

  // Subtle top accent
  const topAccentStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: color,
    opacity: isHovered && !isFuture ? 1 : 0,
    transition: ANIMATIONS.TRANSITION_BASE,
  };

  const contentWrapperStyle = {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100%",
  };

  const iconBoxStyle = {
    backgroundColor: color + "15",
    color: color,
    padding: "0.875rem",
    borderRadius: RADIUS.LG,
    marginBottom: "1.25rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    transition: ANIMATIONS.TRANSITION_BASE,
    transform: isHovered && !isFuture ? "scale(1.05)" : "scale(1)",
  };

  const cardTitleStyle = {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: "0.75rem",
    lineHeight: "1.4",
    letterSpacing: "-0.01em",
  };

  const cardDescriptionStyle = {
    fontSize: "0.875rem",
    color: COLORS.TEXT_SECONDARY,
    marginBottom: "1.25rem",
    lineHeight: "1.6",
    flexGrow: 1,
  };

  const arrowContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: color,
    fontSize: "0.875rem",
    fontWeight: "500",
    marginTop: "auto",
    opacity: isFuture ? 0 : 1,
  };

  const arrowStyle = {
    transition: ANIMATIONS.TRANSITION_BASE,
    transform: isHovered && !isFuture ? "translateX(4px)" : "translateX(0)",
  };

  // Future badge - cleaner design
  const futureBadgeStyle = {
    position: "absolute",
    top: "1.25rem",
    right: "1.25rem",
    fontSize: "0.6875rem",
    fontWeight: "600",
    padding: "0.375rem 0.75rem",
    borderRadius: RADIUS.MD,
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    border: `1px solid ${COLORS.BORDER}`,
    color: COLORS.TEXT_TERTIARY,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    zIndex: 10,
  };

  return (
    <>
      <style>{`
        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        style={cardBaseStyle}
        onClick={() => !isFuture && onClick(appKey)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={topAccentStyle} />

        {isFuture && <span style={futureBadgeStyle}>Próximamente</span>}

        <div style={contentWrapperStyle}>
          <div style={iconBoxStyle}>
            <Icon size={24} strokeWidth={2} />
          </div>

          <h3 style={cardTitleStyle}>{title}</h3>

          <p style={cardDescriptionStyle}>{description}</p>

          {!isFuture && (
            <div style={arrowContainerStyle}>
              <span>Explorar</span>
              <ArrowRight size={18} style={arrowStyle} strokeWidth={2} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AppCard;
