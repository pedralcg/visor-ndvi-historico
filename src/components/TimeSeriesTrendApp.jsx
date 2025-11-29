// components/TimeSeriesTrendApp.jsx - Series Temporales COMPLETO CORREGIDO
import React, { useState, useRef } from "react";
import {
  TrendingUp,
  Calendar,
  Activity,
  Download,
  AlertTriangle,
  Maximize2,
} from "lucide-react";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import MapView from "./MapView";
import {
  COLORS,
  SHADOWS,
  TYPOGRAPHY,
  ANIMATIONS,
  RADIUS,
} from "../styles/designTokens";

import { ndviService } from "../services/api";

// Registrar plugins de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Fecha mínima de Sentinel-2
const S2_MIN_DATE = "2017-04";

export default function TimeSeriesTrendApp({ setCurrentApp }) {
  // Función auxiliar para obtener el mes actual
  const getCurrentYearMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  };

  const [formData, setFormData] = useState({
    index: "NDVI",
    startMonth: "2023-01",
    endMonth: getCurrentYearMonth(),
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [geometry, setGeometry] = useState(null);
  const [slopeTileLayer, setSlopeTileLayer] = useState(null);
  const [chartExpanded, setChartExpanded] = useState(false);
  const mapRef = useRef(null);

  // Generar lista de meses desde S2_MIN_DATE hasta hoy
  const generateMonths = () => {
    const months = [];
    const [startYear, startMonth] = S2_MIN_DATE.split("-").map(Number);
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth());

    let current = new Date(startYear, startMonth - 1);

    while (current <= endDate) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      months.push(`${year}-${month}`);
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  };

  const months = generateMonths();

  // Definir leyendas de PENDIENTE (slope) para cada índice
  const getSlopeLegendHTML = (indexName) => {
    const legends = {
      NDVI: `
        <h4 style="margin-bottom:8px; font-size:14px; color:#1c1917; font-weight: 700;">
          Pendiente NDVI (año⁻¹)
        </h4>
        <div style="line-height:20px; font-size:12px; font-weight: 500; color: #57534e;">
          <i style="background:#dc2626; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> ≤ -0.05 (Degradación rápida)<br>
          <i style="background:#f59e0b; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> -0.05 a -0.02 (Degradación leve)<br>
          <i style="background:#ffffff; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px; border: 1px solid #e7e5e4;"></i> -0.02 a 0.02 (Estable)<br>
          <i style="background:#a3e635; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.02 a 0.05 (Mejora leve)<br>
          <i style="background:#047857; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> ≥ 0.05 (Mejora rápida)
        </div>
      `,
      NBR: `
        <h4 style="margin-bottom:8px; font-size:14px; color:#1c1917; font-weight: 700;">
          Pendiente NBR (año⁻¹)
        </h4>
        <div style="line-height:20px; font-size:12px; font-weight: 500; color: #57534e;">
          <i style="background:#dc2626; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> ≤ -0.05 (Mayor daño)<br>
          <i style="background:#f59e0b; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> -0.05 a -0.02 (Daño moderado)<br>
          <i style="background:#ffffff; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px; border: 1px solid #e7e5e4;"></i> -0.02 a 0.02 (Estable)<br>
          <i style="background:#a3e635; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.02 a 0.05 (Recuperación leve)<br>
          <i style="background:#047857; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> ≥ 0.05 (Recuperación rápida)
        </div>
      `,
      CIre: `
        <h4 style="margin-bottom:8px; font-size:14px; color:#1c1917; font-weight: 700;">
          Pendiente CIre (año⁻¹)
        </h4>
        <div style="line-height:20px; font-size:12px; font-weight: 500; color: #57534e;">
          <i style="background:#dc2626; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> ≤ -0.05 (Pérdida clorofila)<br>
          <i style="background:#f59e0b; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> -0.05 a -0.02 (Reducción leve)<br>
          <i style="background:#ffffff; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px; border: 1px solid #e7e5e4;"></i> -0.02 a 0.02 (Estable)<br>
          <i style="background:#a3e635; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.02 a 0.05 (Aumento leve)<br>
          <i style="background:#047857; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> ≥ 0.05 (Aumento rápido)
        </div>
      `,
      MSI: `
        <h4 style="margin-bottom:8px; font-size:14px; color:#1c1917; font-weight: 700;">
          Pendiente MSI (año⁻¹)
        </h4>
        <div style="line-height:20px; font-size:12px; font-weight: 500; color: #57534e;">
          <i style="background:#047857; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> ≤ -0.05 (Menos estrés)<br>
          <i style="background:#a3e635; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> -0.05 a -0.02 (Mejora leve)<br>
          <i style="background:#ffffff; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px; border: 1px solid #e7e5e4;"></i> -0.02 a 0.02 (Estable)<br>
          <i style="background:#f59e0b; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.02 a 0.05 (Más estrés)<br>
          <i style="background:#dc2626; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> ≥ 0.05 (Estrés severo)
        </div>
      `,
    };
    return legends[indexName] || legends.NDVI;
  };

  // Manejar cambio de índice
  const handleIndexChange = (newIndex) => {
    setFormData({ ...formData, index: newIndex });
    setResults(null);
    setError("");

    // Limpiar capa anterior
    if (slopeTileLayer && mapRef.current) {
      const map = mapRef.current.getMap();
      const layersControl = mapRef.current.getLayersControl();

      if (map && layersControl) {
        try {
          layersControl.removeLayer(slopeTileLayer);
          map.removeLayer(slopeTileLayer);
        } catch (e) {
          console.warn("Error al limpiar capa:", e);
        }
      }
      setSlopeTileLayer(null);
    }
  };

  const handleAnalysis = async () => {
    if (!geometry) {
      setError("Por favor, dibuja un área en el mapa primero");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await ndviService.getTimeSeries({
        geometry: geometry,
        index: formData.index,
        start_month: formData.startMonth,
        end_month: formData.endMonth,
      });

      const data = response.data;

      if (data.status === "success") {
        setResults(data);

        // Añadir capa de pendiente al mapa
        if (data.slope_tile_url && mapRef.current) {
          const map = mapRef.current.getMap();
          const layersControl = mapRef.current.getLayersControl();

          if (map && layersControl && window.L) {
            const L = window.L;

            // Remover capa anterior si existe
            if (slopeTileLayer) {
              try {
                layersControl.removeLayer(slopeTileLayer);
                map.removeLayer(slopeTileLayer);
              } catch (e) {
                console.warn("Error removiendo capa anterior:", e);
              }
            }

            // Crear nueva capa de pendientes
            const newLayer = L.tileLayer(data.slope_tile_url, {
              opacity: 0.7,
              attribution: "Slope Layer",
            });

            // Añadir al mapa
            newLayer.addTo(map);

            // Añadir al control de capas como overlay
            const layerName = `📊 Pendiente ${formData.index}`;
            layersControl.addOverlay(newLayer, layerName);

            setSlopeTileLayer(newLayer);

            // Actualizar leyenda del mapa con la leyenda de PENDIENTES
            if (mapRef.current.updateLegend) {
              mapRef.current.updateLegend({
                html: getSlopeLegendHTML(formData.index),
              });
            }
          }
        }
      } else {
        setError(data.message || "Error al procesar la solicitud");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(
        err.response?.data?.message || "Error de conexión con el servidor"
      );
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

    // Limpiar capa de pendiente
    if (slopeTileLayer && mapRef.current) {
      const map = mapRef.current.getMap();
      const layersControl = mapRef.current.getLayersControl();

      if (map && layersControl) {
        try {
          layersControl.removeLayer(slopeTileLayer);
          map.removeLayer(slopeTileLayer);
        } catch (e) {
          console.warn("Error al limpiar capa:", e);
        }
      }
      setSlopeTileLayer(null);
    }
  };

  const downloadCSV = () => {
    if (!results?.timeseries) return;

    const csv = [
      ["Fecha", formData.index, "Delta"],
      ...results.timeseries.map((point) => [
        point.date,
        point.mean || "",
        point.delta || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timeseries_${formData.index}_${formData.startMonth}_${formData.endMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Estilos
  const containerStyle = {
    display: "flex",
    height: "100%",
    width: "100%",
    fontFamily:
      TYPOGRAPHY?.FONT_FAMILY ||
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
    overflowX: "hidden",
    boxSizing: "border-box",
  };

  const headerStyle = {
    marginTop: 0,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "2px solid #7c3aed",
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
    backdropFilter: "blur(8px)",
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
        ? "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)"
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

  // Datos del gráfico COMBO (línea + barras)
  const chartData = results?.timeseries
    ? {
        labels: results.timeseries.map((p) => p.date),
        datasets: [
          // Barras de delta negativo (rojo)
          {
            type: "bar",
            label: "Δ Decreciente",
            data: results.timeseries.map((p) =>
              p.delta !== null && p.delta < 0 ? p.delta : null
            ),
            backgroundColor: "rgba(220, 38, 38, 0.7)",
            borderColor: "#dc2626",
            borderWidth: 1,
            yAxisID: "y1",
          },
          // Barras de delta positivo (verde)
          {
            type: "bar",
            label: "Δ Creciente",
            data: results.timeseries.map((p) =>
              p.delta !== null && p.delta > 0 ? p.delta : null
            ),
            backgroundColor: "rgba(4, 120, 87, 0.7)",
            borderColor: "#047857",
            borderWidth: 1,
            yAxisID: "y1",
          },
          // Línea del índice
          {
            type: "line",
            label: formData.index,
            data: results.timeseries.map((p) => p.mean),
            borderColor: "#7c3aed",
            backgroundColor: "rgba(124, 58, 237, 0.1)",
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: "#7c3aed",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            fill: true,
            yAxisID: "y",
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          font: { size: 11 },
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "#1c1917",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#7c3aed",
        borderWidth: 2,
        padding: 12,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            if (value !== null && value !== undefined) {
              return `${label}: ${value.toFixed(4)}`;
            }
            return "";
          },
        },
      },
    },
    scales: {
      y: {
        type: "linear",
        position: "left",
        ticks: { color: "#57534e", font: { size: 12, weight: "500" } },
        grid: { color: "#e7e5e4" },
        title: {
          display: true,
          text: formData.index,
          color: "#1c1917",
          font: { size: 13, weight: "600" },
        },
      },
      y1: {
        type: "linear",
        position: "right",
        ticks: { color: "#57534e", font: { size: 11 } },
        grid: { display: false },
        title: {
          display: true,
          text: `Δ ${formData.index}`,
          color: "#1c1917",
          font: { size: 12, weight: "600" },
        },
      },
      x: {
        ticks: {
          color: "#57534e",
          font: { size: 11 },
          maxRotation: 45,
          minRotation: 45,
        },
        grid: { color: "#f5f5f4" },
      },
    },
  };

  // Modal del gráfico expandido
  const ChartModal = () => {
    if (!chartExpanded) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
        onClick={() => setChartExpanded(false)}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: RADIUS.LG,
            padding: "30px",
            maxWidth: "1200px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#1c1917" }}>
              Serie Temporal - {formData.index}
            </h3>
            <button
              onClick={() => setChartExpanded(false)}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "2rem",
                cursor: "pointer",
                color: "#57534e",
              }}
            >
              ×
            </button>
          </div>
          <div style={{ height: "600px" }}>
            <Chart type="bar" data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <aside style={sidebarStyle}>
        <div style={{ paddingBottom: "20px" }}>
          <h2 style={headerStyle}>
            <TrendingUp size={32} color="#7c3aed" />
            Series Temporales con Tendencia
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "0.85rem",
              color: "#78716c",
              marginTop: "-16px",
              marginBottom: "24px",
            }}
          >
            Análisis de tendencias
          </p>

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
              onChange={(e) => handleIndexChange(e.target.value)}
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
                    "0 4px 14px rgba(124, 58, 237, 0.4)";
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
                  Procesando...
                </>
              ) : (
                <>
                  <TrendingUp size={20} />
                  Calcular Tendencia
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
              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      color: "#1c1917",
                      margin: 0,
                    }}
                  >
                    📈 {formData.index} + Δ Mensual
                  </h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setChartExpanded(true)}
                      style={{
                        padding: "6px 12px",
                        background: "transparent",
                        border: "1px solid #e7e5e4",
                        borderRadius: RADIUS.MD,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.85rem",
                        color: "#57534e",
                      }}
                    >
                      <Maximize2 size={16} />
                      Expandir
                    </button>
                    <button
                      onClick={downloadCSV}
                      style={{
                        padding: "6px 12px",
                        background: "transparent",
                        border: "1px solid #e7e5e4",
                        borderRadius: RADIUS.MD,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.85rem",
                        color: "#57534e",
                      }}
                    >
                      <Download size={16} />
                      CSV
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    height: "240px",
                    padding: "15px",
                    background: "#ffffff",
                    borderRadius: RADIUS.MD,
                    border: "1px solid #e7e5e4",
                  }}
                >
                  <Chart type="bar" data={chartData} options={chartOptions} />
                </div>
              </div>

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
                  📊 Estadísticas de Tendencia
                </h4>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#57534e",
                    lineHeight: "1.8",
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <strong>Pendiente media:</strong>{" "}
                    <span
                      style={{
                        color:
                          results.slope_stats?.mean > 0 ? "#047857" : "#dc2626",
                        fontWeight: "700",
                      }}
                    >
                      {results.slope_stats?.mean?.toFixed(5) || "N/A"} año⁻¹
                    </span>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Rango:</strong>{" "}
                    {results.slope_stats?.min?.toFixed(5) || "N/A"} a{" "}
                    {results.slope_stats?.max?.toFixed(5) || "N/A"}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Imágenes procesadas:</strong>{" "}
                    {results.images_found || 0}
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid #e7e5e4",
                      fontSize: "0.85rem",
                      color: "#78716c",
                    }}
                  >
                    ℹ️ El índice mensual se calcula promediando todas las
                    imágenes válidas del mes (sin nubes excesivas y con píxeles
                    no enmascarados).
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

      <ChartModal />

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
