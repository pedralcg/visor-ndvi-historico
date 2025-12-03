// components/HomePage.jsx - Modern Minimalist Design

import React from "react";
import {
  AlertTriangle,
  Calculator,
  Satellite,
  Zap,
  TrendingUp,
  Grid3X3,
  Image,
  GitCompare,
} from "lucide-react";
import AppCard from "./AppCard.jsx";
import {
  COLORS,
  TYPOGRAPHY,
  SHADOWS,
  RADIUS,
  SPACING,
} from "../styles/designTokens";

// Animación de entrada suave
const fadeInAnimation = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-10px) rotate(2deg);
    }
  }
  
  @keyframes scanline {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(100%);
    }
  }
`;

const HomePage = ({ setCurrentApp }) => {
  const pageStyle = {
    minHeight: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "4rem 1.5rem",
    background: COLORS.BACKGROUND,
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
    overflowY: "auto",
    position: "relative",
  };

  // Subtle background grid
  const backgroundGridStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(${COLORS.BORDER} 1px, transparent 1px),
      linear-gradient(90deg, ${COLORS.BORDER} 1px, transparent 1px)
    `,
    backgroundSize: "60px 60px",
    opacity: 0.4,
    pointerEvents: "none",
    zIndex: 0,
  };

  const contentContainerStyle = {
    maxWidth: "1100px",
    width: "100%",
    color: "#1c1917",
    textAlign: "center",
    position: "relative",
    zIndex: 2,
    animation: "fadeInUp 0.8s ease-out",
  };

  const headerStyle = {
    marginBottom: "4rem",
    padding: "0 1.5rem",
  };

  const titleStyle = {
    fontSize: "3.5rem",
    fontWeight: "700",
    background: `linear-gradient(135deg, ${COLORS.PRIMARY} 0%, ${COLORS.SECONDARY} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "1.5rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    letterSpacing: "-0.02em",
  };

  const globeContainerStyle = {
    marginLeft: "1.25rem",
    display: "inline-flex",
    alignItems: "center",
    animation: "float 6s ease-in-out infinite",
  };

  const subtitleStyle = {
    fontSize: "1.25rem",
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "400",
    lineHeight: "1.7",
    maxWidth: "700px",
    margin: "0 auto 1rem auto",
  };

  const highlightStyle = {
    color: COLORS.SECONDARY,
    fontWeight: "500",
  };

  const infoTextStyle = {
    fontSize: "0.875rem",
    color: COLORS.TEXT_TERTIARY,
    fontWeight: "400",
    marginTop: "1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  };

  const techBadgeStyle = {
    display: "inline-block",
    padding: "0.25rem 0.75rem",
    borderRadius: RADIUS.MD,
    backgroundColor: `${COLORS.SECONDARY}10`,
    border: `1px solid ${COLORS.SECONDARY}30`,
    color: COLORS.SECONDARY,
    fontSize: "0.75rem",
    fontWeight: "500",
    marginLeft: "0.5rem",
  };

  const appsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
    marginTop: "3rem",
    padding: "0",
    marginBottom: "5rem",
  };

  const footerStyle = {
    marginTop: "4rem",
    fontSize: "0.875rem",
    color: COLORS.TEXT_TERTIARY,
    borderTop: `1px solid ${COLORS.BORDER}`,
    paddingTop: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    alignItems: "center",
  };

  const authorStyle = {
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "500",
  };

  const applications = [
    {
      key: "compositor",
      title: "Composiciones de Imagenes Sentinel 2",
      description: "Composiciones espectrales e índices para análisis rápido.",
      icon: Image,
      color: "#047857",
    },
    {
      key: "ndvi",
      title: "Análisis Espectral",
      description:
        "Calcula, visualiza y descarga Índices Espectrales con imágenes satelitales Sentinel-2.",
      icon: Satellite,
      color: "#047857",
    },
    {
      key: "timeseries",
      title: "Series Temporales con Tendencia",
      description:
        "Analiza la evolución mensual de índices espectrales y visualiza la tendencia (pendiente) global del área de interés a lo largo del tiempo.",
      icon: TrendingUp,
      color: "#7c3aed",
    },
    {
      key: "thresholds",
      title: "Análisis con Umbrales de Alerta",
      description:
        "Monitoreo temporal con umbrales de alerta automáticos. Detecta degradación, estrés hídrico y cambios anómalos en la vegetación.",
      icon: AlertTriangle,
      color: "#ea580c",
    },
    {
      key: "thresholds-calculator",
      title: "Calculadora de Umbrales",
      description:
        "Calcula umbrales óptimos basados en análisis histórico estadístico.",
      icon: Calculator,
      color: "#3b82f6",
    },
    {
      key: "change-detection",
      title: "Detección de Cambio",
      description:
        "Visualiza diferencias espaciales entre dos periodos temporales.",
      icon: GitCompare,
      color: "#8b5cf6",
    },
    {
      key: "multiindex",
      title: "Comparación Multi-índice",
      description:
        "Compara múltiples índices espectrales (NDVI, NBR, CIre, MSI) para una misma fecha y área. Análisis integral de la cobertura vegetal.",
      icon: Zap,
      color: "#1d4ed8",
    },
    // {
    //   key: "test",
    //   title: "Geo-Backend Services",
    //   description:
    //     "Entorno de desarrollo para verificación de conectividad y funcionalidades del API. Diagnóstico del estado del sistema geoserver.",
    //   icon: Zap,
    //   color: "#1d4ed8",
    // },
    // {
    //   key: "future",
    //   title: "Análisis de Tendencias",
    //   description:
    //     "Herramienta predictiva para analizar tendencias multianuales en cobertura terrestre y salud de ecosistemas mediante machine learning.",
    //   icon: TrendingUp,
    //   color: "#7c3aed",
    // },
  ];

  return (
    <>
      <style>{fadeInAnimation}</style>
      <div style={pageStyle}>
        <div style={backgroundGridStyle} />

        <div style={contentContainerStyle}>
          <header style={headerStyle}>
            <h1 style={titleStyle}>
              GeoVisor
              <span style={globeContainerStyle}>
                <Satellite
                  size={44}
                  strokeWidth={1.5}
                  color={COLORS.SECONDARY}
                />
              </span>
            </h1>

            <p style={subtitleStyle}>
              Plataforma de{" "}
              <span style={highlightStyle}>análisis geoespacial satelital</span>{" "}
              para el monitoreo ambiental y agrícola de precisión
            </p>

            <p style={infoTextStyle}>
              Powered by
              <span style={techBadgeStyle}>React</span>
              <span style={techBadgeStyle}>Google Earth Engine</span>
              <span style={techBadgeStyle}>Sentinel-2</span>
            </p>
          </header>

          <div style={appsGridStyle}>
            {applications.map((app, index) => (
              <AppCard
                key={app.key}
                appKey={app.key}
                title={app.title}
                description={app.description}
                icon={app.icon}
                color={app.color}
                onClick={setCurrentApp}
                index={index}
              />
            ))}
          </div>

          <footer style={footerStyle}>
            <div style={authorStyle}>Desarrollado por Pedro Alcoba Gómez</div>
            <div>&copy; {new Date().getFullYear()} GeoVisor Platform</div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default HomePage;
