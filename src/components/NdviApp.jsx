// frontend/src/components/NdviApp.jsx - Diseño moderno oscuro
import React, { useState, useCallback, useRef } from "react";
import MapView from "./MapView";
import NDVIChart from "./NDVIChart";
import {
  COLORS,
  TYPOGRAPHY,
  SHADOWS,
  ANIMATIONS,
  RADIUS,
} from "../styles/designTokens";
import "../App.css";

// Configuración de API
const RENDER_API_BASE_URL = "https://ndvi-api-service.onrender.com";
const FORCE_RENDER_API_LOCAL_TEST = undefined;

const API_BASE_URL =
  FORCE_RENDER_API_LOCAL_TEST === true || process.env.NODE_ENV === "production"
    ? RENDER_API_BASE_URL
    : "http://localhost:5000";

const API_URL = `${API_BASE_URL}/api/ndvi`;
const S2_MIN_DATE = "2015-06-23";

export default function NdviApp() {
  const [ndviHistory, setNdviHistory] = useState([]);
  const [ndviData, setNdviData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [geometry, setGeometry] = useState(null);
  const [lastNdviDate, setLastNdviDate] = useState(null);
  const mapRef = useRef(null);

  const executeNdviRequest = useCallback(
    async (currentGeometry, currentDate) => {
      if (!currentGeometry) {
        setMessage("❌ Por favor, dibuja un área o punto en el mapa primero.");
        return;
      }
      try {
        setLoading(true);
        setMessage(`🛰️ Calculando NDVI para ${currentDate}...`);

        const body = { geometry: currentGeometry, date: currentDate };
        const resp = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!resp.ok) {
          throw new Error(
            `Error de servidor: ${resp.status} ${resp.statusText}`
          );
        }

        const data = await resp.json();

        if (data.status === "success") {
          setMessage("✅ Cálculo completado.");
          setNdviData(data);
          const imageDate = data.image_date || currentDate;
          setLastNdviDate(imageDate);

          const newEntry = {
            date: imageDate,
            mean_ndvi: data.mean_ndvi,
            geometryHash: JSON.stringify(currentGeometry),
          };

          setNdviHistory((prevHistory) => {
            const existingIndex = prevHistory.findIndex(
              (e) => e.date === newEntry.date
            );
            let newHistory;
            if (existingIndex !== -1) {
              newHistory = [...prevHistory];
              newHistory[existingIndex] = newEntry;
            } else {
              newHistory = [...prevHistory, newEntry];
            }
            return newHistory.sort(
              (a, b) => new Date(a.date) - new Date(b.date)
            );
          });
        } else if (data.status === "warning") {
          setMessage(data.message || "⚠️ No hay datos NDVI disponibles");
          setNdviData(data);
          setLastNdviDate(null);
        } else {
          setMessage(data.message || "⚠️ Error al obtener NDVI");
          setNdviData(null);
          setLastNdviDate(null);
        }
      } catch (error) {
        console.error("❌ Error en la solicitud de NDVI:", error);
        setMessage(`❌ Error de conexión o datos: ${error.message}`);
        setNdviData(null);
        setLastNdviDate(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleGeometrySelected = (newGeometry) => {
    setGeometry(newGeometry);
    if (!newGeometry) {
      handleReset();
    } else {
      const geometryHash = JSON.stringify(newGeometry);
      const firstEntry = ndviHistory.length > 0 ? ndviHistory[0] : null;
      if (firstEntry && firstEntry.geometryHash !== geometryHash) {
        setNdviHistory([]);
        setNdviData(null);
        setLastNdviDate(null);
        setMessage(
          "Geometría actualizada. Haz clic en 'Calcular NDVI' para la fecha seleccionada."
        );
      }
    }
  };

  const handleCalculateNdvi = () => {
    executeNdviRequest(geometry, selectedDate);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setMessage("");
  };

  const handleReset = () => {
    setGeometry(null);
    setNdviData(null);
    setNdviHistory([]);
    setLastNdviDate(null);
    setLoading(false);
    setMessage("");
    if (mapRef.current && mapRef.current.clearAllNdviLayers) {
      mapRef.current.clearAllNdviLayers();
    }
  };

  const lastNdviEntry =
    ndviHistory.length > 0 ? ndviHistory[ndviHistory.length - 1] : null;
  const currentNdviValue = lastNdviEntry?.mean_ndvi;
  const currentImageDate = lastNdviEntry?.date;
  const currentAreaKm2 = ndviData?.area_km2;
  const currentImagesFound = ndviData?.images_found;

  // Estilos modernos
  const containerStyle = {
    display: "flex",
    height: "100%",
    width: "100%",
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
    background:
      "linear-gradient(135deg, #fafaf9 0%, #f5f5f4 50%, #fafaf9 100%)",
    overflow: "hidden",
  };

  const sidebarStyle = {
    width: 400,
    padding: "28px 20px 28px 28px",
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    color: "#1c1917",
    borderRight: `1px solid #e7e5e4`,
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
    borderBottom: `2px solid #047857`,
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#1c1917",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const controlsPanelStyle = {
    marginBottom: 25,
    padding: 20,
    background: "rgba(250, 250, 249, 0.8)",
    backdropFilter: "blur(8px)",
    borderRadius: RADIUS.LG,
    border: `1px solid #e7e5e4`,
  };

  const labelStyle = {
    display: "block",
    marginBottom: 16,
    fontSize: "0.95rem",
    color: "#1c1917",
    width: "100%",
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    padding: "12px 14px",
    marginTop: 8,
    fontSize: 14,
    border: `1px solid #e7e5e4`,
    borderRadius: RADIUS.MD,
    background: "#ffffff",
    color: "#1c1917",
    transition: ANIMATIONS.TRANSITION_BASE,
    outline: "none",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    width: "100%",
    padding: "14px",
    background: geometry
      ? `linear-gradient(135deg, #047857 0%, #059669 100%)`
      : "rgba(168, 162, 158, 0.3)",
    color: geometry ? "#ffffff" : "#a8a29e",
    border: "none",
    borderRadius: RADIUS.MD,
    cursor: geometry ? "pointer" : "not-allowed",
    fontWeight: "700",
    fontSize: "0.95rem",
    transition: ANIMATIONS.TRANSITION_BASE,
    opacity: loading || !geometry ? 0.6 : 1,
    boxShadow:
      geometry && !loading ? "0 1px 2px rgba(28, 25, 23, 0.08)" : "none",
    transform: "scale(1)",
  };

  const messageStyle = {
    marginTop: 16,
    minHeight: "auto",
    fontSize: "0.9rem",
    padding: "10px 14px",
    borderRadius: RADIUS.MD,
    background: message.startsWith("❌")
      ? "rgba(220, 38, 38, 0.08)"
      : "rgba(4, 120, 87, 0.08)",
    border: `1px solid ${
      message.startsWith("❌")
        ? "rgba(220, 38, 38, 0.25)"
        : "rgba(4, 120, 87, 0.25)"
    }`,
    color: message.startsWith("❌") ? "#dc2626" : "#047857",
    fontWeight: "600",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  };

  const detailsPanelStyle = {
    marginTop: 20,
    fontSize: 14,
    color: "#57534e",
    background: "rgba(250, 250, 249, 0.8)",
    backdropFilter: "blur(8px)",
    padding: 20,
    borderRadius: RADIUS.LG,
    border: `1px solid #e7e5e4`,
  };

  const detailRowStyle = {
    margin: "10px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const resetButtonStyle = {
    marginTop: 25,
    marginBottom: 0,
    background: "rgba(220, 38, 38, 0.08)",
    color: "#dc2626",
    border: `1px solid rgba(220, 38, 38, 0.25)`,
    borderRadius: RADIUS.MD,
    padding: "12px",
    cursor: "pointer",
    width: "calc(100% - 8px)",
    fontWeight: "700",
    transition: ANIMATIONS.TRANSITION_BASE,
    fontSize: "0.9rem",
  };

  return (
    <div style={containerStyle}>
      <aside style={sidebarStyle}>
        <div style={{ paddingBottom: "20px" }}>
          <h2 style={headerStyle}>
            🛰️ Visor <span style={{ color: "#047857" }}>NDVI</span>
          </h2>

          <div style={controlsPanelStyle}>
            <label style={labelStyle}>
              <strong>📅 Fecha de cálculo</strong>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={S2_MIN_DATE}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#047857")}
                onBlur={(e) => (e.target.style.borderColor = "#e7e5e4")}
              />
            </label>

            <button
              onClick={handleCalculateNdvi}
              disabled={loading || !geometry}
              style={buttonStyle}
              onMouseEnter={(e) => {
                if (geometry && !loading) {
                  e.target.style.transform = "scale(1.02)";
                  e.target.style.boxShadow =
                    "0 4px 14px rgba(4, 120, 87, 0.28)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = geometry
                  ? "0 1px 2px rgba(28, 25, 23, 0.08)"
                  : "none";
              }}
            >
              {loading ? "⏳ Calculando..." : "🚀 Calcular NDVI"}
            </button>
          </div>

          {message && <div style={messageStyle}>{message}</div>}

          <div style={{ marginTop: 24 }}>
            <h3
              style={{ marginBottom: 16, color: "#1c1917", fontSize: "1.1rem" }}
            >
              📈 Historial de NDVI
            </h3>
            <NDVIChart ndviHistory={ndviHistory} />
          </div>

          {ndviData && (
            <div style={detailsPanelStyle}>
              <div style={detailRowStyle}>
                <span>🗓 Imagen (Última):</span>
                <strong style={{ color: "#1c1917" }}>
                  {currentImageDate || "—"}
                </strong>
              </div>
              <div style={detailRowStyle}>
                <span>📸 Imágenes candidatas:</span>
                <strong style={{ color: "#1c1917" }}>
                  {currentImagesFound ?? "—"}
                </strong>
              </div>
              <div style={detailRowStyle}>
                <span>📐 Área AOI:</span>
                <strong style={{ color: "#1c1917" }}>
                  {currentAreaKm2 != null
                    ? `${currentAreaKm2.toFixed(2)} km²`
                    : "—"}
                </strong>
              </div>
              <div
                style={{
                  ...detailRowStyle,
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: `1px solid #e7e5e4`,
                }}
              >
                <span style={{ fontSize: "1rem" }}>🌿 NDVI medio:</span>
                <strong style={{ color: "#047857", fontSize: "1.2rem" }}>
                  {currentNdviValue != null ? currentNdviValue.toFixed(3) : "—"}
                </strong>
              </div>
            </div>
          )}

          <button
            onClick={handleReset}
            style={resetButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(220, 38, 38, 0.15)";
              e.target.style.borderColor = "#dc2626";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(220, 38, 38, 0.08)";
              e.target.style.borderColor = "rgba(220, 38, 38, 0.25)";
            }}
          >
            🔄 Reiniciar visor
          </button>
        </div>
      </aside>

      {/* Contenedor del mapa - ocupa todo el espacio restante */}
      <div style={{ flex: 1, height: "100%", overflow: "hidden" }}>
        <MapView
          onGeometrySelected={handleGeometrySelected}
          ndviTileUrl={ndviData?.tile_url}
          onReset={handleReset}
          lastNdviDate={lastNdviDate}
          ref={mapRef}
        />
      </div>
    </div>
  );
}

//TODO Mejorar logica de la aplicación
