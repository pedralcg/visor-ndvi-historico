// components/ThresholdAnalysisApp.jsx - Análisis con umbrales de alerta
import React, { useState, useRef } from "react";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Activity,
  Calendar,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import MapView from "./MapView";
import { COLORS, SHADOWS, ANIMATIONS, RADIUS } from "../styles/designTokens";

// Configuración de API
const RENDER_API_BASE_URL = "https://ndvi-api-service.onrender.com";
const FORCE_RENDER_API_LOCAL_TEST = true;

const API_BASE_URL =
  FORCE_RENDER_API_LOCAL_TEST === true || process.env.NODE_ENV === "production"
    ? RENDER_API_BASE_URL
    : "http://localhost:5000";

export default function ThresholdAnalysisApp({ setCurrentApp }) {
  const [formData, setFormData] = useState({
    index: "NDVI",
    startMonth: "2024-01",
    endMonth: "2025-10",
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [geometry, setGeometry] = useState(null);
  const mapRef = useRef(null);

  const generateMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      months.push(`${year}-${month}`);
    }
    return months;
  };

  const months = generateMonths();

  const handleAnalysis = async () => {
    if (!geometry) {
      setError("Por favor, dibuja un área en el mapa primero");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analysis/thresholds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geometry: geometry,
          index: formData.index,
          start_month: formData.startMonth,
          end_month: formData.endMonth,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setResults(data);
      } else {
        setError(data.message || "Error al procesar");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleGeometrySelected = (newGeometry) => {
    setGeometry(newGeometry);
    setResults(null);
    setError("");
  };

  const handleReset = () => {
    setGeometry(null);
    setResults(null);
    setError("");
  };

  // Preparar datos para el gráfico
  const chartData = results?.timeseries
    ? {
        labels: results.timeseries.map((p) => p.date),
        datasets: [
          {
            label: formData.index,
            data: results.timeseries.map((p) => p.mean),
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: results.timeseries.map((p) => {
              const alert = results.alerts.find((a) => a.date === p.date);
              if (alert?.level === "alerta") return "#dc2626";
              if (alert?.level === "advertencia") return "#ea580c";
              return "#8b5cf6";
            }),
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            fill: true,
          },
          // Línea de umbral sin afección
          {
            label: "Sin afección",
            data: Array(results.timeseries.length).fill(
              results.thresholds.sin_afeccion
            ),
            borderColor: "#047857",
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
          // Línea de umbral advertencia
          {
            label: "Advertencia",
            data: Array(results.timeseries.length).fill(
              results.thresholds.advertencia
            ),
            borderColor: "#ea580c",
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
          // Línea de umbral alerta
          {
            label: "Alerta",
            data: Array(results.timeseries.length).fill(
              results.thresholds.alerta
            ),
            borderColor: "#dc2626",
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          font: { size: 11 },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "#1c1917",
        callbacks: {
          label: (context) => {
            if (context.datasetIndex === 0) {
              return `${formData.index}: ${
                context.parsed.y?.toFixed(4) || "N/A"
              }`;
            }
            return `${context.dataset.label}: ${context.parsed.y?.toFixed(4)}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: { color: "#57534e" },
        grid: { color: "#e7e5e4" },
        title: { display: true, text: formData.index, color: "#1c1917" },
      },
      x: {
        ticks: { color: "#57534e", maxRotation: 45, minRotation: 45 },
        grid: { color: "#f5f5f4" },
      },
    },
  };

  const getAlertIcon = (level) => {
    if (level === "alerta") return <AlertTriangle size={18} color="#dc2626" />;
    if (level === "advertencia")
      return <AlertCircle size={18} color="#ea580c" />;
    return <CheckCircle size={18} color="#047857" />;
  };

  const getAlertColor = (level) => {
    if (level === "alerta")
      return {
        bg: "rgba(220, 38, 38, 0.08)",
        border: "#dc2626",
        text: "#dc2626",
      };
    if (level === "advertencia")
      return {
        bg: "rgba(234, 88, 12, 0.08)",
        border: "#ea580c",
        text: "#ea580c",
      };
    return { bg: "rgba(4, 120, 87, 0.08)", border: "#047857", text: "#047857" };
  };

  // Estilos (similares a TimeSeriesTrendApp)
  const containerStyle = {
    display: "flex",
    height: "100%",
    width: "100%",
    background:
      "linear-gradient(135deg, #fafaf9 0%, #f5f5f4 50%, #fafaf9 100%)",
    overflow: "hidden",
  };

  const sidebarStyle = {
    width: 420,
    padding: "28px 20px 28px 28px",
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    color: "#1c1917",
    borderRight: "1px solid #e7e5e4",
    boxShadow: "1px 0 10px rgba(28, 25, 23, 0.06)",
    flexShrink: 0,
    height: "100%",
    overflowY: "auto",
    boxSizing: "border-box",
  };

  const headerStyle = {
    marginTop: 0,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "2px solid #ea580c",
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#1c1917",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const sectionStyle = {
    marginBottom: 20,
    padding: 20,
    background: "rgba(250, 250, 249, 0.8)",
    borderRadius: RADIUS.LG,
    border: "1px solid #e7e5e4",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1c1917",
    marginBottom: 8,
  };

  const selectStyle = {
    width: "100%",
    padding: "12px 14px",
    fontSize: "0.95rem",
    border: "1px solid #e7e5e4",
    borderRadius: RADIUS.MD,
    background: "#ffffff",
    color: "#1c1917",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
  };

  const buttonStyle = {
    width: "100%",
    padding: "14px",
    fontSize: "1rem",
    background:
      geometry && !loading
        ? "linear-gradient(135deg, #ea580c 0%, #f97316 100%)"
        : "rgba(168, 162, 158, 0.3)",
    color: geometry && !loading ? "#ffffff" : "#a8a29e",
    border: "none",
    borderRadius: RADIUS.MD,
    cursor: geometry && !loading ? "pointer" : "not-allowed",
    fontWeight: "700",
    transition: ANIMATIONS.TRANSITION_BASE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: 20,
  };

  return (
    <div style={containerStyle}>
      <aside style={sidebarStyle}>
        <div style={{ paddingBottom: "20px" }}>
          <h2 style={headerStyle}>
            <AlertCircle size={32} color="#ea580c" />
            Análisis con Umbrales
          </h2>

          <div style={sectionStyle}>
            <label style={labelStyle}>
              <Activity
                size={16}
                style={{ display: "inline", marginRight: "5px" }}
              />
              Índice Espectral
            </label>
            <select
              value={formData.index}
              onChange={(e) =>
                setFormData({ ...formData, index: e.target.value })
              }
              style={selectStyle}
            >
              <option value="NDVI">NDVI - Vegetación</option>
              <option value="NBR">NBR - Áreas Quemadas</option>
              <option value="CIre">CIre - Clorofila</option>
              <option value="MSI">MSI - Estrés Hídrico</option>
            </select>

            <label style={{ ...labelStyle, marginTop: 16 }}>
              <Calendar
                size={16}
                style={{ display: "inline", marginRight: "5px" }}
              />
              Periodo de Análisis
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <select
                value={formData.startMonth}
                onChange={(e) =>
                  setFormData({ ...formData, startMonth: e.target.value })
                }
                style={selectStyle}
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={formData.endMonth}
                onChange={(e) =>
                  setFormData({ ...formData, endMonth: e.target.value })
                }
                style={selectStyle}
              >
                {months
                  .slice()
                  .reverse()
                  .map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={handleAnalysis}
              disabled={!geometry || loading}
              style={buttonStyle}
              onMouseEnter={(e) => {
                if (geometry && !loading) {
                  e.target.style.transform = "scale(1.02)";
                  e.target.style.boxShadow =
                    "0 4px 14px rgba(234, 88, 12, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "none";
              }}
            >
              {loading ? (
                <>
                  <Activity size={20} className="spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <AlertCircle size={20} />
                  Analizar Umbrales
                </>
              )}
            </button>
          </div>

          {error && (
            <div
              style={{
                padding: "12px",
                background: "rgba(220, 38, 38, 0.08)",
                border: "1px solid rgba(220, 38, 38, 0.25)",
                borderRadius: RADIUS.MD,
                color: "#dc2626",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: 20,
              }}
            >
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          {results && (
            <>
              {/* Gráfico */}
              <div style={{ marginTop: 20 }}>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    color: "#1c1917",
                    margin: "0 0 12px 0",
                  }}
                >
                  📈 Serie Temporal con Umbrales
                </h3>
                <div
                  style={{
                    height: "240px",
                    padding: "15px",
                    background: "#ffffff",
                    borderRadius: RADIUS.MD,
                    border: "1px solid #e7e5e4",
                  }}
                >
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Umbrales de Referencia */}
              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  background: "rgba(250, 250, 249, 0.8)",
                  borderRadius: RADIUS.MD,
                  border: "1px solid #e7e5e4",
                }}
              >
                <h4
                  style={{
                    fontSize: "1rem",
                    margin: "0 0 12px 0",
                    color: "#1c1917",
                  }}
                >
                  🎯 Umbrales de Referencia
                </h4>
                <div style={{ fontSize: "0.9rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      padding: "8px",
                      background: "rgba(4, 120, 87, 0.08)",
                      borderRadius: RADIUS.SM,
                    }}
                  >
                    <span>🟢 Sin afección:</span>
                    <strong>{results.thresholds.sin_afeccion}</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      padding: "8px",
                      background: "rgba(234, 88, 12, 0.08)",
                      borderRadius: RADIUS.SM,
                    }}
                  >
                    <span>🟡 Advertencia:</span>
                    <strong>{results.thresholds.advertencia}</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px",
                      background: "rgba(220, 38, 38, 0.08)",
                      borderRadius: RADIUS.SM,
                    }}
                  >
                    <span>🔴 Alerta:</span>
                    <strong>{results.thresholds.alerta}</strong>
                  </div>
                </div>
              </div>

              {/* Alertas Detectadas */}
              {results.alerts && results.alerts.length > 0 ? (
                <div
                  style={{
                    marginTop: 20,
                    padding: 16,
                    background: "rgba(220, 38, 38, 0.05)",
                    borderRadius: RADIUS.MD,
                    border: "1px solid rgba(220, 38, 38, 0.2)",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "1rem",
                      margin: "0 0 12px 0",
                      color: "#dc2626",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <AlertTriangle size={20} />
                    Alertas Detectadas ({results.alerts.length})
                  </h4>
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {results.alerts.map((alert, idx) => {
                      const colors = getAlertColor(alert.level);
                      return (
                        <div
                          key={idx}
                          style={{
                            padding: "10px 12px",
                            marginBottom: 8,
                            background: colors.bg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: RADIUS.SM,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "0.9rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            {getAlertIcon(alert.level)}
                            <span
                              style={{ fontWeight: "600", color: colors.text }}
                            >
                              {alert.date}
                            </span>
                          </div>
                          <span style={{ color: "#57534e" }}>
                            {alert.value.toFixed(4)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    marginTop: 20,
                    padding: 16,
                    background: "rgba(4, 120, 87, 0.08)",
                    borderRadius: RADIUS.MD,
                    border: "1px solid rgba(4, 120, 87, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#047857",
                  }}
                >
                  <CheckCircle size={20} />
                  <span style={{ fontWeight: "600" }}>
                    No se detectaron alertas en el periodo analizado
                  </span>
                </div>
              )}

              {/* Estadísticas */}
              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  background: "rgba(250, 250, 249, 0.8)",
                  borderRadius: RADIUS.MD,
                  border: "1px solid #e7e5e4",
                }}
              >
                <h4
                  style={{
                    fontSize: "1rem",
                    margin: "0 0 12px 0",
                    color: "#1c1917",
                  }}
                >
                  📊 Resumen del Análisis
                </h4>
                <div style={{ fontSize: "0.9rem", color: "#57534e" }}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Puntos analizados:</strong>{" "}
                    {results.timeseries.length}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Imágenes procesadas:</strong> {results.images_found}
                  </div>
                  <div>
                    <strong>Nivel de alerta:</strong>{" "}
                    <span
                      style={{
                        fontWeight: "700",
                        color:
                          results.alerts.length > 0 ? "#dc2626" : "#047857",
                      }}
                    >
                      {results.alerts.length > 0
                        ? `${results.alerts.length} alertas`
                        : "Sin alertas"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      <div style={{ flex: 1, height: "100%", overflow: "hidden" }}>
        <MapView
          onGeometrySelected={handleGeometrySelected}
          onReset={handleReset}
          ref={mapRef}
        />
      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
