// components/HomePage.jsx - Diseño moderno con temática ambiental/satelital

import React from "react";
import { Globe, Satellite, Zap, TrendingUp, Grid3X3 } from "lucide-react";
import AppCard from "./AppCard.jsx";
import { COLORS, TYPOGRAPHY } from "../styles/designTokens";

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
    padding: "60px 20px",
    background: `linear-gradient(135deg, #fafaf9 0%, #f5f5f4 50%, #fafaf9 100%)`,
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
    overflowY: "auto",
    position: "relative",
  };

  // Efecto de grid sutil de fondo (evoca coordenadas satelitales)
  const backgroundGridStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(rgba(28, 25, 23, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(28, 25, 23, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: "50px 50px",
    pointerEvents: "none",
    zIndex: 0,
  };

  // Efecto de scanline sutil (simula escaneo satelital)
  const scanlineStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background:
      "linear-gradient(90deg, transparent, rgba(4, 120, 87, 0.2), transparent)",
    animation: "scanline 8s linear infinite",
    pointerEvents: "none",
    zIndex: 1,
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
    marginBottom: "70px",
    padding: "0 20px",
  };

  const titleStyle = {
    fontSize: "4rem",
    fontWeight: "800",
    background:
      "linear-gradient(135deg, #1d4ed8 0%, #047857 50%, #059669 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    letterSpacing: "-2px",
    filter: "drop-shadow(0 2px 8px rgba(4, 120, 87, 0.15))",
  };

  const globeContainerStyle = {
    marginLeft: "20px",
    display: "inline-flex",
    alignItems: "center",
    animation: "float 6s ease-in-out infinite",
  };

  const subtitleStyle = {
    fontSize: "1.35rem",
    color: "#57534e",
    fontWeight: "300",
    lineHeight: "1.8",
    maxWidth: "750px",
    margin: "0 auto 15px auto",
    letterSpacing: "0.3px",
  };

  const highlightStyle = {
    color: "#047857",
    fontWeight: "500",
  };

  const infoTextStyle = {
    fontSize: "1rem",
    color: "#78716c",
    fontWeight: "400",
    marginTop: "25px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  };

  const techBadgeStyle = {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "6px",
    backgroundColor: "rgba(4, 120, 87, 0.08)",
    border: "1px solid rgba(4, 120, 87, 0.2)",
    color: "#047857",
    fontSize: "0.85rem",
    fontWeight: "600",
    marginLeft: "8px",
  };

  const appsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "35px",
    marginTop: "40px",
    padding: "0",
    marginBottom: "80px",
  };

  const footerStyle = {
    marginTop: "60px",
    fontSize: "0.9rem",
    color: "#78716c",
    borderTop: "1px solid rgba(28, 25, 23, 0.08)",
    paddingTop: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "center",
  };

  const authorStyle = {
    color: "#57534e",
    fontWeight: "500",
  };

  const applications = [
    {
      key: "ndvi",
      title: "Visor NDVI Sentinel-2",
      description:
        "Calcula y visualiza series temporales del Índice de Vegetación con imágenes satelitales Sentinel-2. Análisis multitemporal de cobertura vegetal.",
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
      icon: Grid3X3,
      color: "#ea580c",
    },
    {
      key: "multiindex",
      title: "Comparación Multi-índice",
      description:
        "Compara múltiples índices espectrales (NDVI, NBR, CIre, MSI) para una misma fecha y área. Análisis integral de la cobertura vegetal.",
      icon: Zap,
      color: "#1d4ed8",
    },
    {
      key: "test",
      title: "Geo-Backend Services",
      description:
        "Entorno de desarrollo para verificación de conectividad y funcionalidades del API. Diagnóstico del estado del sistema geoserver.",
      icon: Zap,
      color: "#1d4ed8",
    },
    {
      key: "future",
      title: "Análisis de Tendencias",
      description:
        "Herramienta predictiva para analizar tendencias multianuales en cobertura terrestre y salud de ecosistemas mediante machine learning.",
      icon: TrendingUp,
      color: "#7c3aed",
    },
  ];

  return (
    <>
      <style>{fadeInAnimation}</style>
      <div style={pageStyle}>
        <div style={backgroundGridStyle} />
        <div style={scanlineStyle} />

        <div style={contentContainerStyle}>
          <header style={headerStyle}>
            <h1 style={titleStyle}>
              GeoVisor
              <span style={globeContainerStyle}>
                <Satellite size={50} strokeWidth={1.5} color="#047857" />
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
              <span style={techBadgeStyle}>RESTful APIs</span>
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
