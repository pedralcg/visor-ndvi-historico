// components/ChangeDetectionApp.jsx - Detección de Cambios (Separado)
import React, { useState, useRef } from "react";
import {
  GitCompare,
  Activity,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
} from "lucide-react";
import MapView from "./MapView";
import {
  COLORS,
  SHADOWS,
  TYPOGRAPHY,
  ANIMATIONS,
  RADIUS,
} from "../styles/designTokens";

const RENDER_API_BASE_URL = "https://ndvi-api-service.onrender.com";
const FORCE_RENDER_API_LOCAL_TEST = true;

const API_BASE_URL =
  FORCE_RENDER_API_LOCAL_TEST === true || process.env.NODE_ENV === "production"
    ? RENDER_API_BASE_URL
    : "http://localhost:5000";

const S2_MIN_DATE = "2017-04";

export default function ChangeDetectionApp({ setCurrentApp }) {
  const getCurrentYearMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  };

  const [formData, setFormData] = useState({
    index: "NDVI",
    baselineStart: "2020-01",
    baselineEnd: "2020-12",
    comparisonStart: "2024-01",
    comparisonEnd: getCurrentYearMonth(),
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [geometry, setGeometry] = useState(null);
  const [changeMapLayer, setChangeMapLayer] = useState(null);
  const [viewMode, setViewMode] = useState("difference");
  const mapRef = useRef(null);

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

  const handleAnalyzeChanges = async () => {
    if (!geometry) {
      setError("Por favor, dibuja un área en el mapa primero");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analysis/change-map`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geometry: geometry,
          index: formData.index,
          baseline_start: formData.baselineStart,
          baseline_end: formData.baselineEnd,
          comparison_start: formData.comparisonStart,
          comparison_end: formData.comparisonEnd,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setResults(data);
        addChangeMapToMap(data);
      } else {
        setError(data.message || "Error al generar mapa de cambios");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const addChangeMapToMap = (data) => {
    if (!mapRef.current || !window.L) return;

    const map = mapRef.current.getMap();
    const layersControl = mapRef.current.getLayersControl();

    if (!map || !layersControl) return;

    clearMapLayer();

    const L = window.L;
    const tileUrl =
      viewMode === "difference"
        ? data.difference_map.tile_url
        : data.percent_change_map.tile_url;

    const newLayer = L.tileLayer(tileUrl, {
      opacity: 0.8,
      attribution: "Change Map",
    });

    newLayer.addTo(map);
    const layerName = `🗺️ ${
      viewMode === "difference" ? "Diferencia" : "% Cambio"
    } ${formData.index}`;
    layersControl.addOverlay(newLayer, layerName);

    setChangeMapLayer(newLayer);

    if (mapRef.current.updateLegend) {
      mapRef.current.updateLegend({
        html: getChangeLegendHTML(viewMode, formData.index),
      });
    }
  };

  const getChangeLegendHTML = (mode, index) => {
    if (mode === "difference") {
      return `
        <h4 style="margin-bottom:8px; font-size:14px; color:#1c1917; font-weight: 700;">
          Diferencia ${index}
        </h4>
        <div style="line-height:20px; font-size:12px; font-weight: 500; color: #57534e;">
          <i style="background:#8B0000; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> < -0.15 (Degradación severa)<br>
          <i style="background:#DC143C; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> -0.15 a -0.05 (Degradación moderada)<br>
          <i style="background:#FFFFFF; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px; border: 1px solid #e7e5e4;"></i> -0.05 a 0.05 (Sin cambio)<br>
          <i style="background:#32CD32; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.05 a 0.15 (Mejora moderada)<br>
          <i style="background:#006400; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> > 0.15 (Mejora significativa)
        </div>
      `;
    } else {
      return `
        <h4 style="margin-bottom:8px; font-size:14px; color:#1c1917; font-weight: 700;">
          Cambio Porcentual %
        </h4>
        <div style="line-height:20px; font-size:12px; font-weight: 500; color: #57534e;">
          <i style="background:#8B0000; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> < -50% (Gran pérdida)<br>
          <i style="background:#DC143C; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> -50% a -20% (Pérdida moderada)<br>
          <i style="background:#FFFFFF; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px; border: 1px solid #e7e5e4;"></i> -20% a 20% (Estable)<br>
          <i style="background:#32CD32; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 20% a 50% (Mejora moderada)<br>
          <i style="background:#006400; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> > 50% (Gran mejora)
        </div>
      `;
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (results) {
      addChangeMapToMap(results);
    }
  };

  const clearMapLayer = () => {
    if (changeMapLayer && mapRef.current) {
      const map = mapRef.current.getMap();
      const layersControl = mapRef.current.getLayersControl();

      if (map && layersControl) {
        try {
          layersControl.removeLayer(changeMapLayer);
          map.removeLayer(changeMapLayer);
        } catch (e) {
          console.warn("Error limpiando capa:", e);
        }
      }
      setChangeMapLayer(null);
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
    clearMapLayer();
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
    boxSizing: "border-box",
  };

  const headerStyle = {
    marginTop: 0,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "2px solid #8b5cf6",
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
        ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
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
            <GitCompare size={32} color="#8b5cf6" />
            Detección de Cambios
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
            Visualiza diferencias espaciales entre periodos
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
              📅 Periodo Baseline (Referencia)
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <select
                value={formData.baselineStart}
                onChange={(e) =>
                  setFormData({ ...formData, baselineStart: e.target.value })
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
                value={formData.baselineEnd}
                onChange={(e) =>
                  setFormData({ ...formData, baselineEnd: e.target.value })
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

            <label style={{ ...labelStyle, marginTop: 16 }}>
              <Calendar
                size={16}
                style={{ display: "inline", marginRight: "5px" }}
              />
              📊 Periodo Comparación (Actual)
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <select
                value={formData.comparisonStart}
                onChange={(e) =>
                  setFormData({ ...formData, comparisonStart: e.target.value })
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
                value={formData.comparisonEnd}
                onChange={(e) =>
                  setFormData({ ...formData, comparisonEnd: e.target.value })
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
              onClick={handleAnalyzeChanges}
              disabled={!geometry || loading}
              style={buttonStyle}
              onMouseEnter={(e) => {
                if (geometry && !loading) {
                  e.target.style.transform = "scale(1.02)";
                  e.target.style.boxShadow =
                    "0 4px 14px rgba(139, 92, 246, 0.4)";
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
                  <GitCompare size={20} />
                  Generar Mapa de Cambios
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
                <label style={{ ...labelStyle, marginBottom: 12 }}>
                  <Eye
                    size={16}
                    style={{ display: "inline", marginRight: "5px" }}
                  />
                  Tipo de Visualización
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleViewModeChange("difference")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      fontSize: "0.85rem",
                      background:
                        viewMode === "difference" ? "#8b5cf6" : "transparent",
                      color: viewMode === "difference" ? "#ffffff" : "#57534e",
                      border: `1px solid ${
                        viewMode === "difference" ? "#8b5cf6" : "#e7e5e4"
                      }`,
                      borderRadius: RADIUS.SM,
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Diferencia
                  </button>
                  <button
                    onClick={() => handleViewModeChange("percent")}
                    style={{
                      flex: 1,
                      padding: "10px",
                      fontSize: "0.85rem",
                      background:
                        viewMode === "percent" ? "#8b5cf6" : "transparent",
                      color: viewMode === "percent" ? "#ffffff" : "#57534e",
                      border: `1px solid ${
                        viewMode === "percent" ? "#8b5cf6" : "#e7e5e4"
                      }`,
                      borderRadius: RADIUS.SM,
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    % Cambio
                  </button>
                </div>
              </div>

              <div
                style={{
                  ...sectionStyle,
                  marginTop: 20,
                  background: "rgba(139, 92, 246, 0.08)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                }}
              >
                <h4
                  style={{
                    fontSize: "1rem",
                    margin: "0 0 12px 0",
                    color: "#1c1917",
                  }}
                >
                  📊 Estadísticas de Cambio
                </h4>
                <div style={{ fontSize: "0.9rem", lineHeight: "1.8" }}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Cambio medio:</strong>{" "}
                    <span
                      style={{
                        color:
                          results.statistics.mean_change > 0
                            ? "#047857"
                            : "#dc2626",
                        fontWeight: "700",
                      }}
                    >
                      {results.statistics.mean_change > 0 ? "+" : ""}
                      {results.statistics.mean_change}
                    </span>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Rango:</strong> {results.statistics.min_change} a{" "}
                    {results.statistics.max_change}
                  </div>
                  <div>
                    <strong>Desv. Est.:</strong> {results.statistics.std_change}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <h4
                  style={{
                    fontSize: "1rem",
                    margin: "0 0 12px 0",
                    color: "#1c1917",
                  }}
                >
                  🗺️ Distribución de Cambios
                </h4>

                {results.change_areas.high_degradation.area_ha > 0 && (
                  <div
                    style={{
                      padding: "10px 12px",
                      marginBottom: 8,
                      background: "rgba(220, 38, 38, 0.08)",
                      border: "1px solid rgba(220, 38, 38, 0.2)",
                      borderRadius: RADIUS.SM,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <TrendingDown size={18} color="#dc2626" />
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#dc2626",
                          fontSize: "0.9rem",
                        }}
                      >
                        Degradación severa
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: "700",
                          color: "#1c1917",
                          fontSize: "0.9rem",
                        }}
                      >
                        {results.change_areas.high_degradation.area_ha} ha
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#78716c" }}>
                        {results.change_areas.high_degradation.percentage}%
                      </div>
                    </div>
                  </div>
                )}

                {results.change_areas.moderate_degradation.area_ha > 0 && (
                  <div
                    style={{
                      padding: "10px 12px",
                      marginBottom: 8,
                      background: "rgba(234, 88, 12, 0.08)",
                      border: "1px solid rgba(234, 88, 12, 0.2)",
                      borderRadius: RADIUS.SM,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <TrendingDown size={18} color="#ea580c" />
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#ea580c",
                          fontSize: "0.9rem",
                        }}
                      >
                        Degradación moderada
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: "700",
                          color: "#1c1917",
                          fontSize: "0.9rem",
                        }}
                      >
                        {results.change_areas.moderate_degradation.area_ha} ha
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#78716c" }}>
                        {results.change_areas.moderate_degradation.percentage}%
                      </div>
                    </div>
                  </div>
                )}

                {results.change_areas.stable.area_ha > 0 && (
                  <div
                    style={{
                      padding: "10px 12px",
                      marginBottom: 8,
                      background: "rgba(250, 250, 249, 0.8)",
                      border: "1px solid #e7e5e4",
                      borderRadius: RADIUS.SM,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Minus size={18} color="#78716c" />
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#78716c",
                          fontSize: "0.9rem",
                        }}
                      >
                        Sin cambio
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: "700",
                          color: "#1c1917",
                          fontSize: "0.9rem",
                        }}
                      >
                        {results.change_areas.stable.area_ha} ha
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#78716c" }}>
                        {results.change_areas.stable.percentage}%
                      </div>
                    </div>
                  </div>
                )}

                {results.change_areas.moderate_improvement.area_ha > 0 && (
                  <div
                    style={{
                      padding: "10px 12px",
                      marginBottom: 8,
                      background: "rgba(163, 230, 53, 0.08)",
                      border: "1px solid rgba(163, 230, 53, 0.3)",
                      borderRadius: RADIUS.SM,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <TrendingUp size={18} color="#84cc16" />
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#84cc16",
                          fontSize: "0.9rem",
                        }}
                      >
                        Mejora moderada
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: "700",
                          color: "#1c1917",
                          fontSize: "0.9rem",
                        }}
                      >
                        {results.change_areas.moderate_improvement.area_ha} ha
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#78716c" }}>
                        {results.change_areas.moderate_improvement.percentage}%
                      </div>
                    </div>
                  </div>
                )}

                {results.change_areas.high_improvement.area_ha > 0 && (
                  <div
                    style={{
                      padding: "10px 12px",
                      marginBottom: 8,
                      background: "rgba(4, 120, 87, 0.08)",
                      border: "1px solid rgba(4, 120, 87, 0.2)",
                      borderRadius: RADIUS.SM,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <TrendingUp size={18} color="#047857" />
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#047857",
                          fontSize: "0.9rem",
                        }}
                      >
                        Mejora significativa
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: "700",
                          color: "#1c1917",
                          fontSize: "0.9rem",
                        }}
                      >
                        {results.change_areas.high_improvement.area_ha} ha
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#78716c" }}>
                        {results.change_areas.high_improvement.percentage}%
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: 20,
                  padding: 12,
                  background: "rgba(250, 250, 249, 0.8)",
                  borderRadius: RADIUS.MD,
                  border: "1px solid #e7e5e4",
                  fontSize: "0.85rem",
                  color: "#57534e",
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <strong>📅 Baseline:</strong> {results.baseline.period} (
                  {results.baseline.images} imágenes)
                </div>
                <div>
                  <strong>📊 Comparación:</strong> {results.comparison.period} (
                  {results.comparison.images} imágenes)
                </div>
              </div>

              <div
                style={{
                  marginTop: 20,
                  padding: 12,
                  background: "rgba(139, 92, 246, 0.05)",
                  borderRadius: RADIUS.MD,
                  border: "1px solid rgba(139, 92, 246, 0.15)",
                  fontSize: "0.8rem",
                  color: "#57534e",
                  lineHeight: "1.6",
                }}
              >
                <strong>ℹ️ Interpretación:</strong>
                <br />
                El mapa muestra los cambios píxel por píxel entre el periodo
                baseline y el periodo de comparación. Los colores rojos indican
                degradación, mientras que los verdes indican mejora. Las áreas
                blancas/grises representan zonas sin cambios significativos.
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
