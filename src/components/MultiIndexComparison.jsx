// components/MultiIndexComparison.jsx - Comparación multi-índice
import React, { useState, useRef } from "react";
import { Grid3X3, Calendar, Activity, Layers, Eye, EyeOff } from "lucide-react";
import MapView from "./MapView";
import { COLORS, SHADOWS, ANIMATIONS, RADIUS } from "../styles/designTokens";

// Configuración de API
const RENDER_API_BASE_URL = "https://ndvi-api-service.onrender.com";
const FORCE_RENDER_API_LOCAL_TEST = true;

const API_BASE_URL =
  FORCE_RENDER_API_LOCAL_TEST === true || process.env.NODE_ENV === "production"
    ? RENDER_API_BASE_URL
    : "http://localhost:5000";

export default function MultiIndexComparison({ setCurrentApp }) {
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [selectedIndices, setSelectedIndices] = useState({
    NDVI: true,
    NBR: true,
    CIre: false,
    MSI: false,
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [geometry, setGeometry] = useState(null);
  const [visibleLayers, setVisibleLayers] = useState({});
  const mapRef = useRef(null);

  const indicesInfo = {
    NDVI: { name: "NDVI", color: "#047857", description: "Vegetación" },
    NBR: { name: "NBR", color: "#dc2626", description: "Áreas Quemadas" },
    CIre: { name: "CIre", color: "#7c3aed", description: "Clorofila" },
    MSI: { name: "MSI", color: "#1d4ed8", description: "Estrés Hídrico" },
  };

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
    setResults(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/indices/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geometry: geometry,
          date: date,
          indices: selectedList,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setResults(data);

        // Inicializar todas las capas como visibles
        const initialVisible = {};
        selectedList.forEach((idx) => {
          initialVisible[idx] = true;
        });
        setVisibleLayers(initialVisible);

        // Añadir capas al mapa
        if (mapRef.current) {
          // Limpiar capas anteriores
          const mapLayers = mapRef.current._layers;
          Object.keys(mapLayers).forEach((key) => {
            const layer = mapLayers[key];
            if (
              layer.options &&
              layer.options.attribution &&
              layer.options.attribution.startsWith("Index:")
            ) {
              mapRef.current.removeLayer(layer);
            }
          });

          // Añadir nuevas capas
          selectedList.forEach((idx, i) => {
            if (data.results[idx]?.tile_url) {
              window.L.tileLayer(data.results[idx].tile_url, {
                attribution: `Index:${idx}`,
                opacity: 0.7,
              }).addTo(mapRef.current);
            }
          });
        }
      } else {
        setError(data.message || "Error al procesar");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const toggleLayerVisibility = (indexName) => {
    if (!mapRef.current) return;

    const newVisible = {
      ...visibleLayers,
      [indexName]: !visibleLayers[indexName],
    };
    setVisibleLayers(newVisible);

    // Toggle layer en el mapa
    const mapLayers = mapRef.current._layers;
    Object.keys(mapLayers).forEach((key) => {
      const layer = mapLayers[key];
      if (layer.options && layer.options.attribution === `Index:${indexName}`) {
        if (newVisible[indexName]) {
          layer.setOpacity(0.7);
        } else {
          layer.setOpacity(0);
        }
      }
    });
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
    setVisibleLayers({});
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
    width: 400,
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

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    fontSize: "0.95rem",
    border: "1px solid #e7e5e4",
    borderRadius: RADIUS.MD,
    background: "#ffffff",
    color: "#1c1917",
    outline: "none",
    boxSizing: "border-box",
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

          <div style={sectionStyle}>
            <label style={labelStyle}>
              <Calendar
                size={16}
                style={{ display: "inline", marginRight: "5px" }}
              />
              Fecha de Análisis
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              style={inputStyle}
            />

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
                  Comparar Índices
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

          {results && (
            <>
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
                  Control de Capas
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {Object.keys(results.results).map((key) => (
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
                          color: visibleLayers[key]
                            ? indicesInfo[key].color
                            : "#a8a29e",
                        }}
                      >
                        {visibleLayers[key] ? (
                          <Eye size={18} />
                        ) : (
                          <EyeOff size={18} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resultados */}
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
                  📊 Valores Calculados
                </h4>
                <div style={{ fontSize: "0.9rem" }}>
                  {Object.keys(results.results).map((key) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px",
                        marginBottom: 8,
                        background: `${indicesInfo[key].color}10`,
                        borderRadius: RADIUS.SM,
                        border: `1px solid ${indicesInfo[key].color}30`,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "600",
                          color: indicesInfo[key].color,
                        }}
                      >
                        {key}:
                      </span>
                      <span style={{ fontWeight: "700", color: "#1c1917" }}>
                        {results.results[key].mean?.toFixed(4) || "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info */}
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
                <div style={{ marginBottom: 8 }}>
                  <strong>Fecha de imagen:</strong> {results.image_date}
                </div>
                <div>
                  <strong>Imágenes procesadas:</strong> {results.images_found}
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
