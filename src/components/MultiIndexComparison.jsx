// components/MultiIndexComparison.jsx - Comparación Multi-índice con Series Temporales
import React, { useState, useRef } from "react";
import {
  Grid3X3,
  Calendar,
  Activity,
  Layers,
  Eye,
  EyeOff,
  Download,
  Maximize2,
} from "lucide-react";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import MapView from "./MapView";
import { ANIMATIONS, RADIUS } from "../styles/designTokens";
import { ndviService } from "../services/api";

// Registrar Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const S2_MIN_DATE = "2017-04";

export default function MultiIndexComparison({ setCurrentApp }) {
  // Estado
  const getCurrentYearMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  };

  const [startMonth, setStartMonth] = useState("2023-01");
  const [endMonth, setEndMonth] = useState(getCurrentYearMonth());
  const [selectedIndices, setSelectedIndices] = useState({
    NDVI: true,
    NBR: true,
    CIre: false,
    MSI: false,
  });
  const [loading, setLoading] = useState(false);
  const [timeseriesResults, setTimeseriesResults] = useState({});
  const [error, setError] = useState("");
  const [geometry, setGeometry] = useState(null);
  const [chartExpanded, setChartExpanded] = useState(false);
  const mapRef = useRef(null);
  const layersRef = useRef({});

  const indicesInfo = {
    NDVI: {
      name: "NDVI",
      color: "#047857",
      description: "Vegetación",
      min: -0.2,
      max: 1.0,
    },
    NBR: {
      name: "NBR",
      color: "#f59e0b",
      description: "Áreas Quemadas",
      min: -0.5,
      max: 1.0,
    },
    CIre: {
      name: "CIre",
      color: "#7c3aed",
      description: "Clorofila",
      min: 0,
      max: 3.0,
    },
    MSI: {
      name: "MSI",
      color: "#dc2626",
      description: "Estrés Hídrico",
      min: 0,
      max: 2.5,
    },
  };

  // Generar lista de meses
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

  const handleCompare = async () => {
    if (!geometry) {
      setError("Por favor, dibuja un área en el mapa primero");
      return;
    }

    const selectedList = Object.keys(selectedIndices).filter(
      (key) => selectedIndices[key]
    );

    if (selectedList.length === 0) {
      setError("Selecciona al menos un índice");
      return;
    }

    setLoading(true);
    setError("");
    setTimeseriesResults({});

    try {
      // Llamar al endpoint de series temporales para cada índice seleccionado
      const promises = selectedList.map(async (indexName) => {
        const response = await ndviService.getTimeSeries({
          geometry: geometry,
          index: indexName,
          start_month: startMonth,
          end_month: endMonth,
        });

        const data = response.data;

        if (data.status === "success") {
          return { indexName, data };
        } else {
          throw new Error(data.message || "Error al procesar");
        }
      });

      const results = await Promise.all(promises);

      // Organizar resultados por índice
      const organizedResults = {};
      results.forEach(({ indexName, data }) => {
        organizedResults[indexName] = data;
      });

      setTimeseriesResults(organizedResults);

      // Añadir capas al mapa (última imagen de cada índice)
      if (mapRef.current && window.L) {
        // Limpiar capas anteriores
        Object.keys(layersRef.current).forEach((key) => {
          const layer = layersRef.current[key];
          if (layer && mapRef.current.hasLayer(layer)) {
            mapRef.current.removeLayer(layer);
          }
        });
        layersRef.current = {};

        // Obtener última imagen para cada índice
        for (const indexName of selectedList) {
          try {
            const lastDateResponse = await ndviService.calculateIndex({
              geometry: geometry,
              date: new Date().toISOString().slice(0, 10),
              index: indexName,
            });

            const lastDateData = lastDateResponse.data;

            if (lastDateData.status === "success" && lastDateData.tile_url) {
              const tileLayer = window.L.tileLayer(lastDateData.tile_url, {
                attribution: `Index:${indexName}`,
                opacity: 0.7,
                maxZoom: 18,
                tileSize: 256,
              });

              tileLayer.addTo(mapRef.current);
              layersRef.current[indexName] = tileLayer;

              console.log(`✅ Capa ${indexName} añadida`);
            }
          } catch (layerError) {
            console.warn(`Error al añadir capa ${indexName}:`, layerError);
          }
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setError(`Error de conexión: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleLayerVisibility = (indexName) => {
    if (!mapRef.current || !layersRef.current[indexName]) {
      console.warn(`No se puede toggle capa ${indexName}`);
      return;
    }

    const layer = layersRef.current[indexName];
    if (layer) {
      const currentOpacity = layer.options.opacity;
      layer.setOpacity(currentOpacity > 0 ? 0 : 0.7);
    }
  };

  const handleGeometrySelected = (newGeometry) => {
    setGeometry(newGeometry);
    setTimeseriesResults({});
    setError("");
  };

  const handleReset = () => {
    // Limpiar capas del mapa
    if (mapRef.current) {
      Object.keys(layersRef.current).forEach((key) => {
        const layer = layersRef.current[key];
        if (layer && mapRef.current.hasLayer(layer)) {
          mapRef.current.removeLayer(layer);
        }
      });
      layersRef.current = {};
    }

    setGeometry(null);
    setTimeseriesResults({});
    setError("");
  };

  const downloadCSV = () => {
    if (Object.keys(timeseriesResults).length === 0) return;

    // Obtener todas las fechas únicas
    const allDates = new Set();
    Object.values(timeseriesResults).forEach((result) => {
      result.timeseries.forEach((point) => allDates.add(point.date));
    });

    const sortedDates = Array.from(allDates).sort();

    // Crear CSV con todas las series
    const headers = ["Fecha", ...Object.keys(timeseriesResults)];
    const rows = sortedDates.map((date) => {
      const row = [date];
      Object.keys(timeseriesResults).forEach((indexName) => {
        const point = timeseriesResults[indexName].timeseries.find(
          (p) => p.date === date
        );
        row.push(point?.mean?.toFixed(4) || "");
      });
      return row;
    });

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `multi_index_comparison_${startMonth}_${endMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Datos del gráfico combinado
  const getChartData = () => {
    if (Object.keys(timeseriesResults).length === 0) return null;

    // Obtener todas las fechas únicas
    const allDates = new Set();
    Object.values(timeseriesResults).forEach((result) => {
      result.timeseries.forEach((point) => allDates.add(point.date));
    });

    const sortedDates = Array.from(allDates).sort();

    // Crear datasets para cada índice
    const datasets = Object.keys(timeseriesResults).map((indexName) => {
      const indexConfig = indicesInfo[indexName];
      const timeseries = timeseriesResults[indexName].timeseries;

      // Mapear valores a las fechas
      const data = sortedDates.map((date) => {
        const point = timeseries.find((p) => p.date === date);
        return point?.mean || null;
      });

      return {
        label: indexConfig.name,
        data: data,
        borderColor: indexConfig.color,
        backgroundColor: `${indexConfig.color}20`,
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: indexConfig.color,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        fill: true,
        yAxisID: indexName === "MSI" ? "y1" : "y", // MSI en eje derecho
      };
    });

    return {
      labels: sortedDates,
      datasets: datasets,
    };
  };

  const chartData = getChartData();

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
          font: { size: 11, weight: "600" },
          usePointStyle: true,
          padding: 12,
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return datasets.map((dataset, i) => ({
              text: dataset.label,
              fillStyle: dataset.borderColor,
              strokeStyle: dataset.borderColor,
              lineWidth: 3,
              hidden: !chart.isDatasetVisible(i),
              index: i,
            }));
          },
        },
      },
      tooltip: {
        backgroundColor: "#1c1917",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#7c3aed",
        borderWidth: 2,
        padding: 12,
        displayColors: true,
        boxPadding: 6,
        callbacks: {
          title: (context) => `📅 ${context[0].label}`,
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
        ticks: {
          color: "#57534e",
          font: { size: 11, weight: "500" },
        },
        grid: { color: "#e7e5e4" },
        title: {
          display: true,
          text: "NDVI / NBR / CIre",
          color: "#1c1917",
          font: { size: 12, weight: "600" },
        },
      },
      y1: {
        type: "linear",
        position: "right",
        display: Object.keys(timeseriesResults).includes("MSI"),
        ticks: {
          color: "#57534e",
          font: { size: 11, weight: "500" },
        },
        grid: { display: false },
        title: {
          display: true,
          text: "MSI",
          color: "#dc2626",
          font: { size: 12, weight: "600" },
        },
      },
      x: {
        ticks: {
          color: "#57534e",
          font: { size: 10, weight: "500" },
          maxRotation: 45,
          minRotation: 45,
        },
        grid: { color: "#f5f5f4" },
      },
    },
  };

  // Modal del gráfico expandido
  const ChartModal = () => {
    if (!chartExpanded || !chartData) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.85)",
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
            maxWidth: "1400px",
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
              Comparación Multi-índice - Serie Temporal
            </h3>
            <button
              onClick={() => setChartExpanded(false)}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "2rem",
                cursor: "pointer",
                color: "#57534e",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
          <div style={{ height: "650px" }}>
            <Chart type="line" data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    );
  };

  // Estilos
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
    borderBottom: "2px solid #1d4ed8",
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
    marginBottom: 12,
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

  const checkboxContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  const checkboxItemStyle = {
    display: "flex",
    alignItems: "center",
    padding: "10px 12px",
    background: "#ffffff",
    border: "1px solid #e7e5e4",
    borderRadius: RADIUS.MD,
    cursor: "pointer",
    transition: ANIMATIONS.TRANSITION_BASE,
  };

  const buttonStyle = {
    width: "100%",
    padding: "14px",
    fontSize: "1rem",
    background:
      geometry && !loading && Object.values(selectedIndices).some((v) => v)
        ? "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)"
        : "rgba(168, 162, 158, 0.3)",
    color:
      geometry && !loading && Object.values(selectedIndices).some((v) => v)
        ? "#ffffff"
        : "#a8a29e",
    border: "none",
    borderRadius: RADIUS.MD,
    cursor:
      geometry && !loading && Object.values(selectedIndices).some((v) => v)
        ? "pointer"
        : "not-allowed",
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
            <Grid3X3 size={32} color="#1d4ed8" />
            Comparación Multi-índice
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
            Series temporales comparadas
          </p>

          <div style={sectionStyle}>
            <label style={labelStyle}>
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
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                style={selectStyle}
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={endMonth}
                onChange={(e) => setEndMonth(e.target.value)}
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

            <label style={{ ...labelStyle, marginTop: 16 }}>
              <Layers
                size={16}
                style={{ display: "inline", marginRight: "5px" }}
              />
              Seleccionar Índices
            </label>
            <div style={checkboxContainerStyle}>
              {Object.keys(indicesInfo).map((key) => (
                <div
                  key={key}
                  style={{
                    ...checkboxItemStyle,
                    borderColor: selectedIndices[key]
                      ? indicesInfo[key].color
                      : "#e7e5e4",
                    background: selectedIndices[key]
                      ? `${indicesInfo[key].color}10`
                      : "#ffffff",
                  }}
                  onClick={() =>
                    setSelectedIndices({
                      ...selectedIndices,
                      [key]: !selectedIndices[key],
                    })
                  }
                >
                  <input
                    type="checkbox"
                    checked={selectedIndices[key]}
                    onChange={() => {}}
                    style={{ marginRight: "10px", cursor: "pointer" }}
                  />
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontWeight: "700",
                        color: indicesInfo[key].color,
                      }}
                    >
                      {indicesInfo[key].name}
                    </span>
                    <span
                      style={{
                        marginLeft: "8px",
                        color: "#57534e",
                        fontSize: "0.85rem",
                      }}
                    >
                      {indicesInfo[key].description}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleCompare}
              disabled={
                !geometry ||
                loading ||
                !Object.values(selectedIndices).some((v) => v)
              }
              style={buttonStyle}
              onMouseEnter={(e) => {
                if (
                  geometry &&
                  !loading &&
                  Object.values(selectedIndices).some((v) => v)
                ) {
                  e.target.style.transform = "scale(1.02)";
                  e.target.style.boxShadow =
                    "0 4px 14px rgba(29, 78, 216, 0.4)";
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
                  Comparando...
                </>
              ) : (
                <>
                  <Grid3X3 size={20} />
                  Comparar Series Temporales
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
                marginBottom: 20,
              }}
            >
              {error}
            </div>
          )}

          {chartData && (
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
                    style={{ fontSize: "1.1rem", color: "#1c1917", margin: 0 }}
                  >
                    📈 Series Temporales
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
                    height: "280px",
                    padding: "15px",
                    background: "#ffffff",
                    borderRadius: RADIUS.MD,
                    border: "1px solid #e7e5e4",
                  }}
                >
                  <Chart type="line" data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Control de Capas */}
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
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Layers size={18} />
                  Control de Capas (Última fecha)
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {Object.keys(timeseriesResults).map((key) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        background: "#ffffff",
                        borderRadius: RADIUS.SM,
                        border: `1px solid ${indicesInfo[key].color}40`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: indicesInfo[key].color,
                          }}
                        />
                        <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                          {key}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleLayerVisibility(key)}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                          color: indicesInfo[key].color,
                        }}
                      >
                        {layersRef.current[key]?.options?.opacity > 0 ? (
                          <Eye size={18} />
                        ) : (
                          <EyeOff size={18} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen Estadístico */}
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
                  📊 Resumen por Índice
                </h4>
                <div style={{ fontSize: "0.9rem" }}>
                  {Object.keys(timeseriesResults).map((key) => {
                    const values = timeseriesResults[key].timeseries
                      .map((p) => p.mean)
                      .filter((v) => v !== null);
                    const mean =
                      values.length > 0
                        ? values.reduce((a, b) => a + b, 0) / values.length
                        : null;
                    const min = values.length > 0 ? Math.min(...values) : null;
                    const max = values.length > 0 ? Math.max(...values) : null;

                    return (
                      <div
                        key={key}
                        style={{
                          padding: "12px",
                          marginBottom: 10,
                          background: `${indicesInfo[key].color}10`,
                          borderRadius: RADIUS.SM,
                          border: `1px solid ${indicesInfo[key].color}30`,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "700",
                            color: indicesInfo[key].color,
                            marginBottom: 6,
                          }}
                        >
                          {key} - {indicesInfo[key].description}
                        </div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#57534e",
                            lineHeight: 1.6,
                          }}
                        >
                          <div>
                            <strong>Media:</strong>{" "}
                            {mean !== null ? mean.toFixed(4) : "N/A"}
                          </div>
                          <div>
                            <strong>Rango:</strong>{" "}
                            {min !== null && max !== null
                              ? `${min.toFixed(4)} a ${max.toFixed(4)}`
                              : "N/A"}
                          </div>
                          <div>
                            <strong>Puntos:</strong> {values.length} meses
                          </div>
                          <div>
                            <strong>Imágenes:</strong>{" "}
                            {timeseriesResults[key].images_found || 0}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Información del Área */}
              {Object.keys(timeseriesResults).length > 0 && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 16,
                    background: "rgba(250, 250, 249, 0.8)",
                    borderRadius: RADIUS.MD,
                    border: "1px solid #e7e5e4",
                    fontSize: "0.9rem",
                    color: "#57534e",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "1rem",
                      margin: "0 0 12px 0",
                      color: "#1c1917",
                    }}
                  >
                    📍 Información del Área
                  </h4>
                  {Object.values(timeseriesResults)[0].geometry && (
                    <>
                      <div style={{ marginBottom: 6 }}>
                        <strong>Área:</strong>{" "}
                        {Object.values(timeseriesResults)[0].geometry.area_ha}{" "}
                        ha (
                        {Object.values(timeseriesResults)[0].geometry.area_km2}{" "}
                        km²)
                      </div>
                      <div>
                        <strong>Periodo:</strong> {startMonth} a {endMonth}
                      </div>
                    </>
                  )}
                  {!Object.values(timeseriesResults)[0].geometry && (
                    <>
                      <div style={{ marginBottom: 6 }}>
                        <strong>Área:</strong>{" "}
                        {Object.values(timeseriesResults)[0].area_km2} km²
                      </div>
                      <div>
                        <strong>Periodo:</strong> {startMonth} a {endMonth}
                      </div>
                    </>
                  )}
                </div>
              )}
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
