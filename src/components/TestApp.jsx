// components/TestApp.jsx - Página de prueba moderna

import React, { useState } from "react";
import {
  Zap,
  Server,
  Database,
  Activity,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { COLORS, SHADOWS, ANIMATIONS, RADIUS } from "../styles/designTokens";

export default function TestApp({ setCurrentApp }) {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);

  // Simular pruebas del backend
  const runTests = () => {
    setIsLoading(true);
    setTestResults(null);

    setTimeout(() => {
      setTestResults({
        apiConnection: true,
        geoserver: true,
        database: true,
        responseTime: Math.floor(Math.random() * 100) + 50,
      });
      setIsLoading(false);
    }, 2000);
  };

  const containerStyle = {
    flex: 1,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    overflow: "auto",
  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: RADIUS.LG,
    padding: "40px",
    boxShadow: SHADOWS.CARD_DEFAULT,
    border: `1px solid #e7e5e4`,
    maxWidth: "700px",
    width: "100%",
    animation: "fadeInUp 0.6s ease-out",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: `2px solid #1d4ed8`,
  };

  const titleStyle = {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#1c1917",
    margin: 0,
  };

  const iconBoxStyle = {
    background: "rgba(29, 78, 216, 0.1)",
    padding: "12px",
    borderRadius: RADIUS.MD,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const descriptionStyle = {
    fontSize: "1rem",
    color: "#57534e",
    lineHeight: "1.6",
    marginBottom: "30px",
  };

  const servicesGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  };

  const serviceCardStyle = {
    background: "rgba(250, 250, 249, 0.8)",
    padding: "20px",
    borderRadius: RADIUS.MD,
    border: "1px solid #e7e5e4",
    textAlign: "center",
    transition: ANIMATIONS.TRANSITION_BASE,
  };

  const buttonStyle = {
    width: "100%",
    padding: "14px 24px",
    fontSize: "1rem",
    background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: RADIUS.MD,
    cursor: "pointer",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: ANIMATIONS.TRANSITION_BASE,
    boxShadow: SHADOWS.BUTTON,
    marginBottom: "15px",
  };

  const secondaryButtonStyle = {
    width: "100%",
    padding: "12px 20px",
    fontSize: "0.95rem",
    background: "transparent",
    color: "#57534e",
    border: "1px solid #e7e5e4",
    borderRadius: RADIUS.MD,
    cursor: "pointer",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: ANIMATIONS.TRANSITION_BASE,
  };

  const testResultsStyle = {
    background: "rgba(4, 120, 87, 0.05)",
    border: "1px solid rgba(4, 120, 87, 0.2)",
    borderRadius: RADIUS.MD,
    padding: "20px",
    marginTop: "20px",
    marginBottom: "20px",
  };

  const resultItemStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #e7e5e4",
  };

  const services = [
    { icon: Server, label: "API REST", color: "#1d4ed8" },
    { icon: Database, label: "GeoServer", color: "#047857" },
    { icon: Activity, label: "Monitoring", color: "#7c3aed" },
  ];

  return (
    <>
      <style>{`
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
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={headerStyle}>
            <div style={iconBoxStyle}>
              <Zap size={32} color="#1d4ed8" strokeWidth={2.5} />
            </div>
            <h2 style={titleStyle}>Geo-Backend Services</h2>
          </div>

          <p style={descriptionStyle}>
            Entorno de desarrollo para verificar la conectividad y
            funcionalidades del sistema backend. Ejecuta pruebas de diagnóstico
            para asegurar que todos los servicios geoespaciales están
            operativos.
          </p>

          <div style={servicesGridStyle}>
            {services.map((service, index) => (
              <div
                key={index}
                style={serviceCardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = SHADOWS.CARD_HOVER;
                  e.currentTarget.style.borderColor = service.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#e7e5e4";
                }}
              >
                <service.icon
                  size={32}
                  color={service.color}
                  style={{ marginBottom: "10px" }}
                />
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#1c1917",
                  }}
                >
                  {service.label}
                </div>
              </div>
            ))}
          </div>

          <button
            style={buttonStyle}
            onClick={runTests}
            disabled={isLoading}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(29, 78, 216, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = SHADOWS.BUTTON;
            }}
          >
            {isLoading ? (
              <>
                <RefreshCw
                  size={20}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Ejecutando pruebas...
              </>
            ) : (
              <>
                <Zap size={20} />
                Ejecutar Diagnóstico
              </>
            )}
          </button>

          {testResults && (
            <div style={testResultsStyle}>
              <h3
                style={{
                  margin: "0 0 15px 0",
                  fontSize: "1.1rem",
                  color: "#047857",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <CheckCircle size={20} />
                Resultados del Diagnóstico
              </h3>

              <div style={resultItemStyle}>
                <span style={{ fontWeight: "600", color: "#1c1917" }}>
                  📡 Conexión API
                </span>
                {testResults.apiConnection ? (
                  <CheckCircle size={20} color="#047857" />
                ) : (
                  <XCircle size={20} color="#dc2626" />
                )}
              </div>

              <div style={resultItemStyle}>
                <span style={{ fontWeight: "600", color: "#1c1917" }}>
                  🗺️ GeoServer
                </span>
                {testResults.geoserver ? (
                  <CheckCircle size={20} color="#047857" />
                ) : (
                  <XCircle size={20} color="#dc2626" />
                )}
              </div>

              <div style={resultItemStyle}>
                <span style={{ fontWeight: "600", color: "#1c1917" }}>
                  💾 Base de Datos
                </span>
                {testResults.database ? (
                  <CheckCircle size={20} color="#047857" />
                ) : (
                  <XCircle size={20} color="#dc2626" />
                )}
              </div>

              <div
                style={{
                  ...resultItemStyle,
                  borderBottom: "none",
                  paddingTop: "15px",
                }}
              >
                <span style={{ fontWeight: "600", color: "#1c1917" }}>
                  ⚡ Tiempo de Respuesta
                </span>
                <span
                  style={{
                    fontWeight: "700",
                    color: "#047857",
                    fontSize: "1.1rem",
                  }}
                >
                  {testResults.responseTime}ms
                </span>
              </div>
            </div>
          )}

          <button
            style={secondaryButtonStyle}
            onClick={() => setCurrentApp("home")}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(28, 25, 23, 0.05)";
              e.currentTarget.style.borderColor = "#57534e";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "#e7e5e4";
            }}
          >
            <ArrowLeft size={18} />
            Volver a Home
          </button>
        </div>
      </div>
    </>
  );
}
