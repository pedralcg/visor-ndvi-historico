// components/NdviApp.jsx - Actualizado con nuevos datos del backend
import React, { useState, useRef } from "react";
import {
  Layers,
  Calendar,
  Activity,
  Download,
  AlertTriangle,
  Info,
  TrendingUp,
  Database,
} from "lucide-react";
import MapView from "./MapView";
import NDVIChart from "./NDVIChart";
import {
  COLORS,
  SHADOWS,
  TYPOGRAPHY,
  ANIMATIONS,
  RADIUS,
} from "../styles/designTokens";

import { ndviService } from "../services/api";

const S2_MIN_DATE = "2015-06-23";

// Definir leyendas para cada índice
const getIndexLegendHTML = (indexName) => {
  const legends = {
    NDVI: `
      <h4 style="margin-bottom:8px; font-size:14px; color:#1c1917; font-weight: 700;">
        NDVI - Índice de Vegetación
      </h4>
      <div style="line-height:20px; font-size:12px; font-weight: 500; color: #57534e;">
        <i style="background:#8b0000; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> -1.0 a -0.2 (Agua/Nieve)<br>
        <i style="background:#d2b48c; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> -0.2 a 0.1 (Suelo desnudo)<br>
        <i style="background:#ffff00; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.1 a 0.3 (Vegetación escasa)<br>
        <i style="background:#9acd32; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.3 a 0.5 (Vegetación moderada)<br>
        <i style="background:#228b22; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.5 a 0.7 (Vegetación densa)<br>
        <i style="background:#006400; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.7 a 1.0 (Vegetación muy densa)
      </div>
    `,
    NBR: `
      <h4 style="margin-bottom:8px; font-size:14px; color:#1c1917; font-weight: 700;">
        NBR - Índice de Áreas Quemadas
      </h4>
      <div style="line-height:20px; font-size:12px; font-weight: 500; color: #57534e;">
        <i style="background:#ffffff; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px; border: 1px solid #e7e5e4;"></i> -1.0 a -0.25 (Agua)<br>
        <i style="background:#ff0000; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> -0.25 a 0.1 (Área quemada severa)<br>
        <i style="background:#ff6347; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.1 a 0.27 (Área quemada moderada)<br>
        <i style="background:#ffa500; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.27 a 0.44 (Área quemada leve)<br>
        <i style="background:#90ee90; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.44 a 0.66 (Vegetación regenerándose)<br>
        <i style="background:#228b22; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.66 a 1.0 (Vegetación saludable)
      </div>
    `,
    CIre: `
      <h4 style="margin-bottom:8px; font-size:14px; color:#1c1917; font-weight: 700;">
        CIre - Índice de Clorofila
      </h4>
      <div style="line-height:20px; font-size:12px; font-weight: 500; color: #57534e;">
        <i style="background:#8b4513; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.0 a 1.0 (Sin vegetación)<br>
        <i style="background:#ffff00; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 1.0 a 2.0 (Clorofila baja)<br>
        <i style="background:#adff2f; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 2.0 a 3.0 (Clorofila moderada)<br>
        <i style="background:#32cd32; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 3.0 a 4.0 (Clorofila alta)<br>
        <i style="background:#228b22; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 4.0 a 5.0 (Clorofila muy alta)<br>
        <i style="background:#006400; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> > 5.0 (Clorofila extrema)
      </div>
    `,
    MSI: `
      <h4 style="margin-bottom:8px; font-size:14px; color:#1c1917; font-weight: 700;">
        MSI - Índice de Estrés Hídrico
      </h4>
      <div style="line-height:20px; font-size:12px; font-weight: 500; color: #57534e;">
        <i style="background:#006400; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.0 a 0.5 (Sin estrés hídrico)<br>
        <i style="background:#228b22; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.5 a 1.0 (Estrés muy bajo)<br>
        <i style="background:#9acd32; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 1.0 a 1.5 (Estrés bajo)<br>
        <i style="background:#ffff00; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 1.5 a 2.0 (Estrés moderado)<br>
        <i style="background:#ffa500; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 2.0 a 2.5 (Estrés alto)<br>
        <i style="background:#ff0000; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> > 2.5 (Estrés severo)
      </div>
    `,
  };
  return legends[indexName] || legends.NDVI;
};

export default function NdviApp({ setCurrentApp }) {
  const [formData, setFormData] = useState({
    index: "NDVI",
    selectedDate: (() => {
      const d = new Date();
      return d.toISOString().slice(0, 10);
    })(),
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [geometry, setGeometry] = useState(null);
  const [indexTileLayer, setIndexTileLayer] = useState(null);
  const [ndviHistory, setNdviHistory] = useState([]);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [downloadingGeoTiff, setDownloadingGeoTiff] = useState(false);
  const mapRef = useRef(null);

  // Manejar cambio de índice
  const handleIndexChange = (newIndex) => {
    setFormData({ ...formData, index: newIndex });
    setResults(null);
    setError("");
    setNdviHistory([]);

    // Limpiar capa anterior
    if (indexTileLayer && mapRef.current) {
      const map = mapRef.current.getMap();
      const layersControl = mapRef.current.getLayersControl();

      if (map && layersControl) {
        try {
          layersControl.removeLayer(indexTileLayer);
          map.removeLayer(indexTileLayer);
        } catch (e) {
          console.warn("Error al limpiar capa:", e);
        }
      }
      setIndexTileLayer(null);
    }
  };

  const handleAnalysis = async () => {
    if (!geometry) {
      setError("Por favor, dibuja un área o punto en el mapa primero");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await ndviService.calculateIndex({
        geometry: geometry,
        date: formData.selectedDate,
        index: formData.index,
      });

      const data = response.data;

      if (data.status === "success") {
        setResults(data);

        // Añadir al historial
        const imageDate =
          data.imagery?.image_used?.date ||
          data.image_date ||
          formData.selectedDate;
        const indexKey = `mean_${formData.index.toLowerCase()}`;
        const newEntry = {
          date: imageDate,
          mean_ndvi: data.statistics?.mean || data[indexKey] || data.mean_ndvi,
          geometryHash: JSON.stringify(geometry),
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
          return newHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
        });

        // Añadir capa de índice al mapa
        if (data.tile_url && mapRef.current) {
          const map = mapRef.current.getMap();
          const layersControl = mapRef.current.getLayersControl();

          if (map && layersControl && window.L) {
            const L = window.L;

            // Remover capa anterior si existe
            if (indexTileLayer) {
              try {
                layersControl.removeLayer(indexTileLayer);
                map.removeLayer(indexTileLayer);
              } catch (e) {
                console.warn("Error removiendo capa anterior:", e);
              }
            }

            // Crear nueva capa del índice
            const newLayer = L.tileLayer(data.tile_url, {
              opacity: 0.7,
              attribution: `${formData.index} Layer`,
            });

            // Añadir al mapa
            newLayer.addTo(map);

            // Añadir al control de capas como overlay
            const layerName = `📊 ${formData.index} - ${imageDate}`;
            layersControl.addOverlay(newLayer, layerName);

            setIndexTileLayer(newLayer);

            // Actualizar leyenda del mapa
            if (mapRef.current.updateLegend) {
              mapRef.current.updateLegend({
                html: getIndexLegendHTML(formData.index),
              });
            }
          }
        }
      } else if (data.status === "warning") {
        setError(data.message || "No hay datos disponibles para esta fecha");
        setResults(data);
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
    setNdviHistory([]);

    // Limpiar capa de índice
    if (indexTileLayer && mapRef.current) {
      const map = mapRef.current.getMap();
      const layersControl = mapRef.current.getLayersControl();

      if (map && layersControl) {
        try {
          layersControl.removeLayer(indexTileLayer);
          map.removeLayer(indexTileLayer);
        } catch (e) {
          console.warn("Error al limpiar capa:", e);
        }
      }
      setIndexTileLayer(null);
    }
  };

  const downloadCSV = () => {
    if (!ndviHistory || ndviHistory.length === 0) return;

    const csv = [
      ["Fecha", formData.index],
      ...ndviHistory.map((point) => [point.date, point.mean_ndvi || ""]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `index_${formData.index}_${formData.selectedDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadGeoTiff = async () => {
    if (!geometry || !results) {
      setError("No hay datos disponibles para descargar");
      return;
    }

    // Validar tamaño del área
    const areaKm2 =
      geometryInfo.area_km2 || results?.area_km2 || currentAreaKm2;

    if (areaKm2 > 100) {
      alert(
        `❌ Área demasiado grande\n\n` +
          `El área seleccionada es de ${areaKm2.toFixed(2)} km².\n\n` +
          `El límite máximo para descarga es 100 km².\n\n` +
          `Por favor, selecciona un área más pequeña.`
      );
      return;
    }

    if (areaKm2 > 50) {
      const confirmLarge = window.confirm(
        `⚠️ Área grande detectada\n\n` +
          `El área es de ${areaKm2.toFixed(2)} km².\n\n` +
          `La descarga puede tardar varios minutos.\n` +
          `Recomendamos áreas menores a 50 km² para una descarga óptima.\n\n` +
          `¿Deseas continuar?`
      );

      if (!confirmLarge) return;
    }

    setDownloadingGeoTiff(true);
    setError("");

    try {
      const response = await ndviService.downloadGeoTiff({
        geometry: geometry,
        date: formData.selectedDate,
        index: formData.index,
      });

      const data = response.data;

      if (data.status === "success") {
        // Descargar el archivo
        window.open(data.download_url, "_blank");

        // Mostrar mensaje de éxito
        alert(
          `✅ Descarga iniciada\n\n` +
            `Archivo: ${data.filename}\n` +
            `Área: ${data.area_km2?.toFixed(2)} km²\n` +
            `Fecha de imagen: ${data.image_date}\n\n` +
            `⚠️ El enlace es válido por 24 horas.`
        );
      } else {
        setError(data.message || "Error al generar el GeoTIFF");
        alert(`❌ Error\n\n${data.message}`);
      }
    } catch (err) {
      console.error("Error descargando GeoTIFF:", err);
      const errorMsg = "Error de conexión al generar GeoTIFF";
      setError(errorMsg);
      alert(`❌ ${errorMsg}\n\nVerifica que el servidor esté activo.`);
    } finally {
      setDownloadingGeoTiff(false);
    }
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
    borderBottom: "2px solid #047857",
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
      geometry && !loading
        ? "linear-gradient(135deg, #047857 0%, #059669 100%)"
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

  // Extraer datos de la respuesta (compatibilidad con backend nuevo y viejo)
  const stats = results?.statistics || {};
  const imagery = results?.imagery || {};
  const geometryInfo = results?.geometry || {};

  const currentIndexValue =
    stats.mean ||
    results?.[`mean_${formData.index.toLowerCase()}`] ||
    results?.mean_ndvi;
  const currentImageDate = imagery.image_used?.date || results?.image_date;
  const currentAreaKm2 = geometryInfo.area_km2 || results?.area_km2;
  const currentAreaHa = geometryInfo.area_ha;
  const imagesAvailable = imagery.images_available || [];
  const imagesCount = imagery.images_count || results?.images_found;
  const cloudPercentage =
    imagery.image_used?.cloud_percentage || results?.cloud_percentage;
  const satellite = imagery.image_used?.satellite;
  const tile = imagery.image_used?.tile;

  // Modal de imágenes disponibles
  const ImagesModal = () => {
    if (!showImagesModal) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
        onClick={() => setShowImagesModal(false)}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: RADIUS.LG,
            padding: "30px",
            maxWidth: "600px",
            width: "100%",
            maxHeight: "80vh",
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
              paddingBottom: "15px",
              borderBottom: "2px solid #e7e5e4",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.3rem", color: "#1c1917" }}>
              🛰️ Imágenes Disponibles ({imagesCount})
            </h3>
            <button
              onClick={() => setShowImagesModal(false)}
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
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            {imagesAvailable.map((img, idx) => (
              <div
                key={idx}
                style={{
                  padding: "12px 16px",
                  marginBottom: "10px",
                  background:
                    img.date === currentImageDate
                      ? "rgba(4, 120, 87, 0.08)"
                      : "#fafaf9",
                  border: `1px solid ${
                    img.date === currentImageDate ? "#047857" : "#e7e5e4"
                  }`,
                  borderRadius: RADIUS.MD,
                  fontSize: "0.9rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <strong style={{ color: "#1c1917" }}>📅 {img.date}</strong>
                  {img.date === currentImageDate && (
                    <span
                      style={{
                        color: "#047857",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                      }}
                    >
                      ✓ USADA
                    </span>
                  )}
                </div>
                <div style={{ color: "#57534e", fontSize: "0.85rem" }}>
                  ☁️ Nubes: {img.cloud_percentage}% | 🗺️ Tile:{" "}
                  {img.tile || "N/A"}
                </div>
              </div>
            ))}
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
            <Layers size={32} color="#047857" />
            Análisis Espectral
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
            Cálculo y descarga de índices espectrales
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
              Fecha de Cálculo
            </label>
            <input
              type="date"
              value={formData.selectedDate}
              onChange={(e) =>
                setFormData({ ...formData, selectedDate: e.target.value })
              }
              min={S2_MIN_DATE}
              style={inputStyle}
            />

            <button
              onClick={handleAnalysis}
              disabled={!geometry || loading}
              style={buttonStyle}
              onMouseEnter={(e) => {
                if (geometry && !loading) {
                  e.target.style.transform = "scale(1.02)";
                  e.target.style.boxShadow = "0 4px 14px rgba(4, 120, 87, 0.4)";
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
                  <Layers size={20} />
                  Calcular {formData.index}
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

          {ndviHistory.length > 0 && (
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
                    📈 Historial de {formData.index}
                  </h3>
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
                <div
                  style={{
                    padding: "15px",
                    background: "#ffffff",
                    borderRadius: RADIUS.MD,
                    border: "1px solid #e7e5e4",
                  }}
                >
                  <NDVIChart
                    ndviHistory={ndviHistory}
                    indexName={formData.index}
                  />
                </div>
              </div>
            </>
          )}

          {results && (
            <>
              {/* Estadísticas del Índice */}
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
                  <TrendingUp size={18} />
                  Estadísticas de {formData.index}
                </h4>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#57534e",
                    lineHeight: "1.8",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      paddingBottom: 8,
                      borderBottom: "1px solid #f5f5f4",
                    }}
                  >
                    <span>🌿 Valor medio:</span>
                    <strong style={{ color: "#047857", fontSize: "1.1rem" }}>
                      {currentIndexValue != null
                        ? currentIndexValue.toFixed(4)
                        : "—"}
                    </strong>
                  </div>
                  {stats.min != null && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span>📉 Mínimo:</span>
                      <strong style={{ color: "#1c1917" }}>
                        {stats.min.toFixed(4)}
                      </strong>
                    </div>
                  )}
                  {stats.max != null && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span>📈 Máximo:</span>
                      <strong style={{ color: "#1c1917" }}>
                        {stats.max.toFixed(4)}
                      </strong>
                    </div>
                  )}
                  {stats.median != null && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span>📊 Mediana:</span>
                      <strong style={{ color: "#1c1917" }}>
                        {stats.median.toFixed(4)}
                      </strong>
                    </div>
                  )}
                  {stats.std != null && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span>📏 Desv. estándar:</span>
                      <strong style={{ color: "#1c1917" }}>
                        {stats.std.toFixed(4)}
                      </strong>
                    </div>
                  )}
                  {stats.range != null && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: "1px solid #f5f5f4",
                      }}
                    >
                      <span>↔️ Rango:</span>
                      <strong style={{ color: "#1c1917" }}>
                        {stats.range.toFixed(4)}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de Imágenes */}
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
                  <Database size={18} />
                  Información de Imágenes
                </h4>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#57534e",
                    lineHeight: "1.8",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span>📅 Imagen usada:</span>
                    <strong style={{ color: "#1c1917" }}>
                      {currentImageDate || "—"}
                    </strong>
                  </div>
                  {satellite && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span>🛰️ Satélite:</span>
                      <strong style={{ color: "#1c1917" }}>{satellite}</strong>
                    </div>
                  )}
                  {cloudPercentage != null && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span>☁️ Nubosidad:</span>
                      <strong style={{ color: "#1c1917" }}>
                        {cloudPercentage}%
                      </strong>
                    </div>
                  )}
                  {tile && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span>🗺️ Tile MGRS:</span>
                      <strong style={{ color: "#1c1917" }}>{tile}</strong>
                    </div>
                  )}
                  {imagesAvailable.length > 0 && (
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: "1px solid #f5f5f4",
                      }}
                    >
                      <button
                        onClick={() => setShowImagesModal(true)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          background: "rgba(4, 120, 87, 0.08)",
                          border: "1px solid rgba(4, 120, 87, 0.25)",
                          borderRadius: RADIUS.MD,
                          cursor: "pointer",
                          color: "#047857",
                          fontWeight: "600",
                          fontSize: "0.9rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "rgba(4, 120, 87, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "rgba(4, 120, 87, 0.08)";
                        }}
                      >
                        <Info size={16} />
                        Ver {imagesCount} imágenes disponibles
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Geometría */}
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
                  📐 Área de Interés
                </h4>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#57534e",
                    lineHeight: "1.8",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span>Área (km²):</span>
                    <strong style={{ color: "#1c1917" }}>
                      {currentAreaKm2 != null
                        ? `${currentAreaKm2.toFixed(4)} km²`
                        : "—"}
                    </strong>
                  </div>
                  {currentAreaHa != null && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span>Área (ha):</span>
                      <strong style={{ color: "#1c1917" }}>
                        {currentAreaHa.toFixed(4)} ha
                      </strong>
                    </div>
                  )}
                  {geometryInfo.area_m2 != null && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span>Área (m²):</span>
                      <strong style={{ color: "#1c1917" }}>
                        {geometryInfo.area_m2.toFixed(2)} m²
                      </strong>
                    </div>
                  )}
                  {geometryInfo.type && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Tipo:</span>
                      <strong style={{ color: "#1c1917" }}>
                        {geometryInfo.type}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de descarga GeoTIFF */}
              <div style={{ marginTop: 20 }}>
                <button
                  onClick={downloadGeoTiff}
                  disabled={downloadingGeoTiff}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: downloadingGeoTiff
                      ? "rgba(168, 162, 158, 0.3)"
                      : "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
                    color: downloadingGeoTiff ? "#a8a29e" : "#ffffff",
                    border: "none",
                    borderRadius: RADIUS.MD,
                    cursor: downloadingGeoTiff ? "not-allowed" : "pointer",
                    fontWeight: "700",
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    transition: ANIMATIONS.TRANSITION_BASE,
                  }}
                  onMouseEnter={(e) => {
                    if (!downloadingGeoTiff) {
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
                  {downloadingGeoTiff ? (
                    <>
                      <Activity size={20} className="spin" />
                      Generando GeoTIFF...
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      Descargar GeoTIFF
                    </>
                  )}
                </button>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: "0.75rem",
                    color: "#78716c",
                    textAlign: "center",
                    lineHeight: "1.4",
                  }}
                >
                  ℹ️ Descarga la imagen ráster en formato GeoTIFF
                  <br />
                  (Resolución: 10m, Proyección: WGS84)
                </div>
              </div>
            </>
          )}

          <button
            onClick={handleReset}
            style={{
              marginTop: 25,
              background: "rgba(220, 38, 38, 0.08)",
              color: "#dc2626",
              border: "1px solid rgba(220, 38, 38, 0.25)",
              borderRadius: RADIUS.MD,
              padding: "12px",
              cursor: "pointer",
              width: "100%",
              fontWeight: "700",
              fontSize: "0.9rem",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(220, 38, 38, 0.15)";
              e.target.style.borderColor = "#dc2626";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(220, 38, 38, 0.08)";
              e.target.style.borderColor = "rgba(220, 38, 38, 0.25)";
            }}
          >
            🔄 Reiniciar Visor
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, height: "100%", overflow: "hidden" }}>
        <MapView
          onGeometrySelected={handleGeometrySelected}
          onReset={handleReset}
          ref={mapRef}
        />
      </div>

      <ImagesModal />

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
