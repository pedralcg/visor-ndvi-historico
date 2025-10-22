// src/components/AppCard.jsx - Diseño moderno con glassmorphism

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

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

  // Animación de entrada escalonada
  const cardBaseStyle = {
    backgroundColor: "#ffffff",
    backdropFilter: "blur(10px)",
    padding: "30px",
    borderRadius: "16px",
    border: `1px solid ${isHovered && !isFuture ? color + "60" : "#e7e5e4"}`,
    boxShadow:
      isHovered && !isFuture
        ? `0 20px 40px -10px ${color}30, 0 0 0 1px ${color}20`
        : "0 1px 3px rgba(28, 25, 23, 0.08), 0 1px 2px rgba(28, 25, 23, 0.06)",
    textAlign: "left",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    transform:
      isHovered && !isFuture
        ? "translateY(-8px) scale(1.02)"
        : "translateY(0) scale(1)",
    cursor: isFuture ? "not-allowed" : "pointer",
    display: "flex",
    flexDirection: "column",
    minHeight: "260px",
    position: "relative",
    opacity: isFuture ? 0.5 : 1,
    overflow: "hidden",
    animation: `cardFadeIn 0.6s ease-out ${index * 0.1}s backwards`,
  };

  // Efecto de brillo sutil en el borde superior
  const topGlowStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
    opacity: isHovered && !isFuture ? 1 : 0,
    transition: "opacity 0.3s ease",
  };

  // Patrón de fondo sutil
  const backgroundPatternStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `radial-gradient(circle at 2px 2px, ${color}10 1px, transparent 1px)`,
    backgroundSize: "24px 24px",
    opacity: isHovered && !isFuture ? 0.5 : 0,
    transition: "opacity 0.4s ease",
    pointerEvents: "none",
  };

  const contentWrapperStyle = {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100%",
  };

  const iconBoxStyle = {
    backgroundColor: color + "20",
    color: color,
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "20px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    transition: "all 0.3s ease",
    transform:
      isHovered && !isFuture
        ? "rotate(-5deg) scale(1.1)"
        : "rotate(0) scale(1)",
    boxShadow: isHovered && !isFuture ? `0 0 20px ${color}40` : "none",
  };

  const cardTitleStyle = {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "12px",
    lineHeight: "1.3",
    letterSpacing: "-0.5px",
  };

  const cardDescriptionStyle = {
    fontSize: "0.95rem",
    color: "#57534e",
    marginBottom: "20px",
    lineHeight: "1.6",
    flexGrow: 1,
  };

  const arrowContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: color,
    fontSize: "0.9rem",
    fontWeight: "600",
    marginTop: "auto",
    opacity: isFuture ? 0 : 1,
  };

  const arrowStyle = {
    transition: "transform 0.3s ease",
    transform: isHovered && !isFuture ? "translateX(5px)" : "translateX(0)",
  };

  // Badge de próximamente mejorado
  const futureBadgeStyle = {
    position: "absolute",
    top: "20px",
    right: "20px",
    fontSize: "0.7rem",
    fontWeight: "700",
    padding: "6px 12px",
    borderRadius: "8px",
    backgroundColor: "rgba(168, 162, 158, 0.15)",
    border: "1px solid rgba(168, 162, 158, 0.3)",
    color: "#78716c",
    letterSpacing: "0.5px",
    zIndex: 10,
    backdropFilter: "blur(5px)",
  };

  return (
    <>
      <style>{`
        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
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
        <div style={topGlowStyle} />
        <div style={backgroundPatternStyle} />

        {isFuture && <span style={futureBadgeStyle}>PRÓXIMAMENTE</span>}

        <div style={contentWrapperStyle}>
          <div style={iconBoxStyle}>
            <Icon size={28} strokeWidth={2} />
          </div>

          <h3 style={cardTitleStyle}>{title}</h3>

          <p style={cardDescriptionStyle}>{description}</p>

          {!isFuture && (
            <div style={arrowContainerStyle}>
              <span>Explorar</span>
              <ArrowRight size={20} style={arrowStyle} strokeWidth={2.5} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AppCard;
