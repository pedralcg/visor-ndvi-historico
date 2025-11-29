// components/CompositorApp.jsx - VERSIÓN COMPLETA MEJORADA
import React, { useState, useRef, useEffect } from "react";
import {
  Layers,
  Calendar,
  Image,
  Download,
  AlertTriangle,
  Eye,
  Activity,
  Database,
  Check,
} from "lucide-react";
import MapView from "./MapView";
import {
  COLORS,
  SHADOWS,
  TYPOGRAPHY,
  ANIMATIONS,
  RADIUS,
} from "../styles/designTokens";

import { ndviService } from "../services/api";
const S2_MIN_DATE = "2015-06-23";

// ===== LEYENDAS DE ÍNDICES =====
const getIndexLegendHTML = (indexName) => {
  const legends = {
    NDVI: `
      <h4 style="margin-bottom:8px; font-size:13px; color:#1c1917; font-weight: 700;">
        NDVI - Índice de Vegetación
      </h4>
      <div style="line-height:18px; font-size:11px; font-weight: 500; color: #57534e;">
        <i style="background:#8b0000; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> -1.0 a -0.2 (Agua/Nieve)<br>
        <i style="background:#d2b48c; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> -0.2 a 0.1 (Suelo desnudo)<br>
        <i style="background:#ffff00; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 0.1 a 0.3 (Vegetación escasa)<br>
        <i style="background:#9acd32; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 0.3 a 0.5 (Vegetación moderada)<br>
        <i style="background:#228b22; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 0.5 a 0.7 (Vegetación densa)<br>
        <i style="background:#006400; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 0.7 a 1.0 (Vegetación muy densa)
      </div>
    `,
    NBR: `
      <h4 style="margin-bottom:8px; font-size:13px; color:#1c1917; font-weight: 700;">
        NBR - Índice de Áreas Quemadas
      </h4>
      <div style="line-height:18px; font-size:11px; font-weight: 500; color: #57534e;">
        <i style="background:#ffffff; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px; border: 1px solid #e7e5e4;"></i> -1.0 a -0.25 (Agua)<br>
        <i style="background:#ff0000; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> -0.25 a 0.1 (Quemada severa)<br>
        <i style="background:#ff6347; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 0.1 a 0.27 (Quemada moderada)<br>
        <i style="background:#ffa500; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 0.27 a 0.44 (Quemada leve)<br>
        <i style="background:#90ee90; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 0.44 a 0.66 (Regenerándose)<br>
        <i style="background:#228b22; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 0.66 a 1.0 (Vegetación saludable)
      </div>
    `,
    CIre: `
      <h4 style="margin-bottom:8px; font-size:13px; color:#1c1917; font-weight: 700;">
        CIre - Índice de Clorofila
      </h4>
      <div style="line-height:18px; font-size:11px; font-weight: 500; color: #57534e;">
        <i style="background:#8b4513; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 0.0 a 1.0 (Sin vegetación)<br>
        <i style="background:#ffff00; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 1.0 a 2.0 (Clorofila baja)<br>
        <i style="background:#adff2f; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 2.0 a 3.0 (Clorofila moderada)<br>
        <i style="background:#32cd32; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 3.0 a 4.0 (Clorofila alta)<br>
        <i style="background:#228b22; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 4.0 a 5.0 (Clorofila muy alta)<br>
        <i style="background:#006400; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> > 5.0 (Clorofila extrema)
      </div>
    `,
    MSI: `
      <h4 style="margin-bottom:8px; font-size:13px; color:#1c1917; font-weight: 700;">
        MSI - Índice de Estrés Hídrico
      </h4>
      <div style="line-height:18px; font-size:11px; font-weight: 500; color: #57534e;">
        <i style="background:#006400; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 0.0 a 0.5 (Sin estrés)<br>
        <i style="background:#228b22; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 0.5 a 1.0 (Estrés muy bajo)<br>
        <i style="background:#9acd32; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 1.0 a 1.5 (Estrés bajo)<br>
        <i style="background:#ffff00; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 1.5 a 2.0 (Estrés moderado)<br>
        <i style="background:#ffa500; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> 2.0 a 2.5 (Estrés alto)<br>
        <i style="background:#ff0000; display:inline-block; width:16px; height:9px; float:left; margin-right:6px; border-radius: 2px;"></i> > 2.5 (Estrés severo)
      </div>
    `,
  };
  return legends[indexName] || "";
};

// ===== CONFIGURACIÓN DE COMPOSICIONES =====
const COMPOSICIONES = {
  RGB: { nombre: "RGB", descripcion: "Color Natural", icon: "🌍" },
  "Falso Color IR": {
    nombre: "Infrarrojo",
    descripcion: "Vegetación",
    icon: "🌿",
  },
  "Falso Color Agricola": {
    nombre: "Agrícola",
    descripcion: "Cultivos",
    icon: "🌾",
  },
  "Falso Color SWIR": { nombre: "SWIR", descripcion: "Humedad", icon: "💧" },
  "Deteccion Quemado": {
    nombre: "Quemado",
    descripcion: "Incendios",
    icon: "🔥",
  },
};

const INDICES_DISPONIBLES = {
  NDVI: { nombre: "NDVI", descripcion: "Vegetación", color: "#10b981" },
  NBR: { nombre: "NBR", descripcion: "Quemado", color: "#f59e0b" },
  CIre: { nombre: "CIre", descripcion: "Clorofila", color: "#22c55e" },
  MSI: { nombre: "MSI", descripcion: "Estrés Hídrico", color: "#3b82f6" },
};

export default function CompositorApp({ setCurrentApp }) {
  const [formData, setFormData] = useState({
    selectedDate: new Date().toISOString().slice(0, 10),
    maxNubes: 30,
    composicionesSeleccionadas: Object.keys(COMPOSICIONES),
    indicesSeleccionados: Object.keys(INDICES_DISPONIBLES),
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [geometry, setGeometry] = useState(null);
  const [activeTab, setActiveTab] = useState("composiciones");
  const [activeLayers, setActiveLayers] = useState([]);
  const mapRef = useRef(null);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".download-dropdown") &&
        !e.target.closest("button")
      ) {
        document.querySelectorAll(".download-dropdown").forEach((d) => {
          d.style.display = "none";
        });
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ===== FUNCIÓN PARA DESCARGAR INSTRUCCIONES TXT =====
  const downloadInstructions = (instructions, filename) => {
    const blob = new Blob([instructions], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ===== HANDLER: ANÁLISIS =====
  const handleAnalisis = async () => {
    if (!geometry) {
      setError("Por favor, dibuja un área o punto en el mapa primero");
      return;
    }

    if (
      formData.composicionesSeleccionadas.length === 0 &&
      formData.indicesSeleccionados.length === 0
    ) {
      setError("Selecciona al menos una composición o índice");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);
    clearAllLayers();

    try {
      const response = await ndviService.createComposite({
        geometry: geometry,
        date: formData.selectedDate,
        max_cloud: formData.maxNubes,
        composiciones: formData.composicionesSeleccionadas,
        indices: formData.indicesSeleccionados,
      });

      const data = response.data;

      if (data.status === "success") {
        setResults(data);

        if (data.composiciones && Object.keys(data.composiciones).length > 0) {
          const firstKey = Object.keys(data.composiciones)[0];
          addLayerToMap("composicion", firstKey, data.composiciones[firstKey]);
        } else if (data.indices && Object.keys(data.indices).length > 0) {
          const firstKey = Object.keys(data.indices)[0];
          addLayerToMap("indice", firstKey, data.indices[firstKey]);
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

  // ===== GESTIÓN DE CAPAS EN EL MAPA =====
  const addLayerToMap = (type, key, data) => {
    if (!data.tile_url || !mapRef.current) return;

    const map = mapRef.current.getMap();
    const layersControl = mapRef.current.getLayersControl();

    if (!map || !layersControl || !window.L) return;

    const L = window.L;
    const imageDate = results?.imagery?.image_used?.date || results?.image_date;
    const layerName =
      type === "composicion"
        ? `🎨 ${COMPOSICIONES[key]?.nombre || key}`
        : `📊 ${key}`;

    const newLayer = L.tileLayer(data.tile_url, {
      opacity: 0.7,
      attribution: `${layerName} - ${imageDate}`,
    });

    newLayer.addTo(map);
    layersControl.addOverlay(newLayer, `${layerName} - ${imageDate}`);

    if (type === "indice" && mapRef.current.updateLegend) {
      mapRef.current.updateLegend({
        html: getIndexLegendHTML(key),
      });
    }

    setActiveLayers((prev) => [
      ...prev,
      { type, key, layer: newLayer, name: layerName },
    ]);
  };

  const removeLayerFromMap = (layerToRemove) => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();
    const layersControl = mapRef.current.getLayersControl();

    if (map && layersControl) {
      try {
        layersControl.removeLayer(layerToRemove.layer);
        map.removeLayer(layerToRemove.layer);
      } catch (e) {
        console.warn("Error removiendo capa:", e);
      }
    }

    setActiveLayers((prev) =>
      prev.filter(
        (l) => l.key !== layerToRemove.key || l.type !== layerToRemove.type
      )
    );
  };

  const clearAllLayers = () => {
    activeLayers.forEach((layerRef) => {
      removeLayerFromMap(layerRef);
    });
    setActiveLayers([]);
  };

  const toggleLayer = (type, key, data) => {
    const existingLayer = activeLayers.find(
      (l) => l.type === type && l.key === key
    );

    if (existingLayer) {
      removeLayerFromMap(existingLayer);
    } else {
      addLayerToMap(type, key, data);
    }
  };

  const isLayerActive = (type, key) => {
    return activeLayers.some((l) => l.type === type && l.key === key);
  };

  const handleGeometrySelected = (newGeometry) => {
    setGeometry(newGeometry);
    setResults(null);
    setError("");
    clearAllLayers();
  };

  const handleReset = () => {
    setGeometry(null);
    setResults(null);
    setError("");
    clearAllLayers();
  };

  const toggleComposicion = (key) => {
    setFormData((prev) => ({
      ...prev,
      composicionesSeleccionadas: prev.composicionesSeleccionadas.includes(key)
        ? prev.composicionesSeleccionadas.filter((c) => c !== key)
        : [...prev.composicionesSeleccionadas, key],
    }));
  };

  const toggleIndice = (key) => {
    setFormData((prev) => ({
      ...prev,
      indicesSeleccionados: prev.indicesSeleccionados.includes(key)
        ? prev.indicesSeleccionados.filter((i) => i !== key)
        : [...prev.indicesSeleccionados, key],
    }));
  };

  // ===== DATOS EXTRAÍDOS =====
  const imagery = results?.imagery || {};
  const geometryInfo = results?.geometry || {};
  const currentImageDate = imagery.image_used?.date || results?.image_date;
  const currentAreaKm2 = geometryInfo.area_km2 || results?.area_km2;
  const imagesCount = imagery.images_available || results?.images_found;
  const cloudPercentage =
    imagery.image_used?.cloud_percentage || results?.cloud_percentage;
  const coverage = imagery.image_used?.coverage;
  const dateDiff = imagery.image_used?.date_difference_days;

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        fontFamily:
          TYPOGRAPHY?.FONT_FAMILY ||
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background:
          "linear-gradient(135deg, #fafaf9 0%, #f5f5f4 50%, #fafaf9 100%)",
        overflow: "hidden",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: 380,
          padding: "24px 18px 24px 24px",
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
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 20,
            paddingBottom: 14,
            borderBottom: "2px solid #7c3aed",
            fontSize: "1.6rem",
            fontWeight: "800",
            color: "#1c1917",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Image size={28} color="#7c3aed" />
          Multi-Compositor
        </h2>

        {/* FECHA Y NUBES */}
        <div
          style={{
            marginBottom: 16,
            padding: 16,
            background: "rgba(250, 250, 249, 0.8)",
            borderRadius: RADIUS?.LG || 12,
            border: "1px solid #e7e5e4",
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#1c1917",
              marginBottom: 6,
            }}
          >
            <Calendar
              size={14}
              style={{ display: "inline", marginRight: "4px" }}
            />
            Fecha
          </label>
          <input
            type="date"
            value={formData.selectedDate}
            onChange={(e) =>
              setFormData({ ...formData, selectedDate: e.target.value })
            }
            min={S2_MIN_DATE}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: "0.9rem",
              border: "1px solid #e7e5e4",
              borderRadius: RADIUS?.MD || 8,
              background: "#ffffff",
              color: "#1c1917",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#1c1917",
              marginTop: 12,
              marginBottom: 6,
            }}
          >
            ☁️ Máx. Nubes (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.maxNubes}
            onChange={(e) =>
              setFormData({ ...formData, maxNubes: parseInt(e.target.value) })
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: "0.9rem",
              border: "1px solid #e7e5e4",
              borderRadius: RADIUS?.MD || 8,
              background: "#ffffff",
              color: "#1c1917",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* COMPOSICIONES - PILLS */}
        <div
          style={{
            marginBottom: 16,
            padding: 16,
            background: "rgba(250, 250, 249, 0.8)",
            borderRadius: RADIUS?.LG || 12,
            border: "1px solid #e7e5e4",
          }}
        >
          <label
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#1c1917",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
            }}
          >
            <Layers size={14} />
            Composiciones ({formData.composicionesSeleccionadas.length}/
            {Object.keys(COMPOSICIONES).length})
          </label>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            {Object.entries(COMPOSICIONES).map(([key, comp]) => {
              const isSelected =
                formData.composicionesSeleccionadas.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleComposicion(key)}
                  style={{
                    padding: "6px 12px",
                    background: isSelected
                      ? "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)"
                      : "#ffffff",
                    color: isSelected ? "#ffffff" : "#57534e",
                    border: `1.5px solid ${isSelected ? "#7c3aed" : "#e7e5e4"}`,
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.2s",
                    outline: "none",
                    whiteSpace: "nowrap",
                    boxShadow: isSelected
                      ? "0 2px 6px rgba(124, 58, 237, 0.25)"
                      : "none",
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "#fafaf9";
                      e.currentTarget.style.borderColor = "#7c3aed";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.borderColor = "#e7e5e4";
                    }
                  }}
                >
                  <span style={{ fontSize: "0.9rem" }}>{comp.icon}</span>
                  <span>{comp.nombre}</span>
                  {isSelected && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ÍNDICES - PILLS */}
        <div
          style={{
            marginBottom: 16,
            padding: 16,
            background: "rgba(250, 250, 249, 0.8)",
            borderRadius: RADIUS?.LG || 12,
            border: "1px solid #e7e5e4",
          }}
        >
          <label
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#1c1917",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
            }}
          >
            <Eye size={14} />
            Índices ({formData.indicesSeleccionados.length}/
            {Object.keys(INDICES_DISPONIBLES).length})
          </label>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            {Object.entries(INDICES_DISPONIBLES).map(([key, idx]) => {
              const isSelected = formData.indicesSeleccionados.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleIndice(key)}
                  style={{
                    padding: "6px 12px",
                    background: isSelected ? idx.color : "#ffffff",
                    color: isSelected ? "#ffffff" : "#57534e",
                    border: `1.5px solid ${isSelected ? idx.color : "#e7e5e4"}`,
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    transition: "all 0.2s",
                    outline: "none",
                    whiteSpace: "nowrap",
                    boxShadow: isSelected ? `0 2px 6px ${idx.color}40` : "none",
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "#fafaf9";
                      e.currentTarget.style.borderColor = idx.color;
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.borderColor = "#e7e5e4";
                    }
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: isSelected ? "#ffffff" : idx.color,
                    }}
                  />
                  <span>{idx.nombre}</span>
                  {isSelected && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* BOTONES */}
        <button
          onClick={handleAnalisis}
          disabled={!geometry || loading}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "0.95rem",
            background:
              geometry && !loading
                ? "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)"
                : "rgba(168, 162, 158, 0.3)",
            color: geometry && !loading ? "#ffffff" : "#a8a29e",
            border: "none",
            borderRadius: RADIUS?.MD || 8,
            cursor: geometry && !loading ? "pointer" : "not-allowed",
            fontWeight: "700",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {loading ? (
            <>
              <Activity size={18} className="spin" />
              Procesando...
            </>
          ) : (
            <>
              <Image size={18} />
              Generar
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          style={{
            marginTop: 10,
            background: "rgba(220, 38, 38, 0.08)",
            color: "#dc2626",
            border: "1px solid rgba(220, 38, 38, 0.25)",
            borderRadius: RADIUS?.MD || 8,
            padding: "10px",
            cursor: "pointer",
            width: "100%",
            fontWeight: "700",
            fontSize: "0.85rem",
          }}
        >
          🔄 Reiniciar
        </button>

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: "10px",
              background: "rgba(220, 38, 38, 0.08)",
              border: "1px solid rgba(220, 38, 38, 0.25)",
              borderRadius: RADIUS?.MD || 8,
              color: "#dc2626",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {results && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              background: "rgba(124, 58, 237, 0.08)",
              borderRadius: RADIUS?.MD || 8,
              border: "1px solid rgba(124, 58, 237, 0.25)",
            }}
          >
            <h4
              style={{
                fontSize: "0.9rem",
                margin: "0 0 10px 0",
                color: "#1c1917",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Database size={16} />
              Información
            </h4>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#57534e",
                lineHeight: "1.6",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span>📅 Imagen:</span>
                <strong style={{ color: "#7c3aed" }}>
                  {currentImageDate || "—"}
                </strong>
              </div>
              {dateDiff != null && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span>📏 Diferencia:</span>
                  <strong>{dateDiff} días</strong>
                </div>
              )}
              {coverage != null && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span>✅ Cobertura:</span>
                  <strong
                    style={{ color: coverage >= 80 ? "#22c55e" : "#f59e0b" }}
                  >
                    {coverage.toFixed(1)}%
                  </strong>
                </div>
              )}
              {cloudPercentage != null && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span>☁️ Nubes:</span>
                  <strong>{cloudPercentage}%</strong>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>🗺️ Área:</span>
                <strong>
                  {currentAreaKm2 != null
                    ? `${currentAreaKm2.toFixed(2)} km²`
                    : "—"}
                </strong>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* MAPA - 2/3 */}
        <div
          style={{ height: "66.66%", minHeight: "400px", position: "relative" }}
        >
          <MapView
            onGeometrySelected={handleGeometrySelected}
            onReset={handleReset}
            ref={mapRef}
          />
        </div>

        {/* RESULTADOS - 1/3 */}
        <div
          style={{
            height: "33.33%",
            overflowY: "auto",
            padding: "16px 20px",
            background: "#fafaf9",
            borderTop: "2px solid #e7e5e4",
          }}
        >
          {!results ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#78716c",
              }}
            >
              <Image size={48} color="#d6d3d1" />
              <h3
                style={{ marginTop: 16, fontSize: "1.1rem", color: "#57534e" }}
              >
                Dibuja un área en el mapa
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  textAlign: "center",
                  maxWidth: 400,
                  margin: "8px 0 0 0",
                }}
              >
                Selecciona composiciones e índices y haz clic en "Generar"
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "16px",
                  borderBottom: "2px solid #e7e5e4",
                }}
              >
                <button
                  style={{
                    padding: "10px 16px",
                    background: "transparent",
                    border: "none",
                    borderBottom: `3px solid ${
                      activeTab === "composiciones" ? "#7c3aed" : "transparent"
                    }`,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color:
                      activeTab === "composiciones" ? "#7c3aed" : "#78716c",
                  }}
                  onClick={() => setActiveTab("composiciones")}
                >
                  🎨 Composiciones (
                  {results.composiciones
                    ? Object.keys(results.composiciones).length
                    : 0}
                  )
                </button>
                <button
                  style={{
                    padding: "10px 16px",
                    background: "transparent",
                    border: "none",
                    borderBottom: `3px solid ${
                      activeTab === "indices" ? "#7c3aed" : "transparent"
                    }`,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: activeTab === "indices" ? "#7c3aed" : "#78716c",
                  }}
                  onClick={() => setActiveTab("indices")}
                >
                  📈 Índices (
                  {results.indices ? Object.keys(results.indices).length : 0})
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "12px",
                }}
              >
                {/* COMPOSICIONES */}
                {activeTab === "composiciones" &&
                  results.composiciones &&
                  Object.entries(results.composiciones).map(([key, data]) => (
                    <div
                      key={key}
                      style={{
                        background: "#ffffff",
                        borderRadius: 10,
                        padding: "12px",
                        border: `2px solid ${
                          isLayerActive("composicion", key)
                            ? "#7c3aed"
                            : "#e7e5e4"
                        }`,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "120px",
                          background: "#e7e5e4",
                          borderRadius: 6,
                          marginBottom: "8px",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {data.thumbnail_url ? (
                          <img
                            src={data.thumbnail_url}
                            alt={key}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span
                            style={{ color: "#78716c", fontSize: "0.75rem" }}
                          >
                            Cargando...
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>
                          {COMPOSICIONES[key]?.icon}
                        </span>
                        <h4
                          style={{
                            margin: 0,
                            fontSize: "0.85rem",
                            color: "#1c1917",
                            fontWeight: "700",
                          }}
                        >
                          {COMPOSICIONES[key]?.nombre || key}
                        </h4>
                      </div>

                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => toggleLayer("composicion", key, data)}
                          style={{
                            flex: 1,
                            padding: "8px",
                            background: isLayerActive("composicion", key)
                              ? "#7c3aed"
                              : "rgba(124, 58, 237, 0.1)",
                            color: isLayerActive("composicion", key)
                              ? "#ffffff"
                              : "#7c3aed",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                          }}
                        >
                          {isLayerActive("composicion", key) ? (
                            <Check size={12} />
                          ) : (
                            <Eye size={12} />
                          )}
                          {isLayerActive("composicion", key) ? "Activa" : "Ver"}
                        </button>

                        {/* Menú desplegable de descarga - Compacto */}
                        <div style={{ flex: 1, position: "relative" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const dropdown =
                                e.currentTarget.nextElementSibling;
                              const isOpen = dropdown.style.display === "block";
                              document
                                .querySelectorAll(".download-dropdown")
                                .forEach((d) => (d.style.display = "none"));
                              dropdown.style.display = isOpen
                                ? "none"
                                : "block";
                            }}
                            style={{
                              width: "100%",
                              padding: "8px",
                              background: "#7c3aed",
                              color: "white",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                            }}
                          >
                            <Download size={12} />
                            <span style={{ fontSize: "0.7rem" }}>▴</span>
                          </button>

                          <div
                            className="download-dropdown"
                            style={{
                              display: "none",
                              position: "absolute",
                              bottom: "calc(100% + 4px)",
                              left: 0,
                              right: 0,
                              background: "#ffffff",
                              border: "1px solid #e7e5e4",
                              borderRadius: 8,
                              boxShadow: "0 -4px 16px rgba(0,0,0,0.12)",
                              zIndex: 1000,
                              overflow: "hidden",
                              minWidth: "220px",
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(data.download_url, "_blank");
                                e.currentTarget.parentElement.style.display =
                                  "none";
                              }}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                background: "transparent",
                                border: "none",
                                borderBottom: "1px solid #f5f5f4",
                                textAlign: "left",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                color: "#1c1917",
                                transition: "background 0.15s",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.background = "#fafaf9")
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
                              }
                            >
                              <span style={{ fontSize: "1rem" }}>📦</span>
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    fontWeight: "600",
                                    lineHeight: "1.3",
                                  }}
                                >
                                  GeoTIFF
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.6rem",
                                    color: "#78716c",
                                  }}
                                >
                                  3 bandas individuales
                                </div>
                              </div>
                            </button>

                            {data.instructions_txt && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadInstructions(
                                    data.instructions_txt,
                                    `INSTRUCCIONES_${data.filename.replace(
                                      ".tif",
                                      ".txt"
                                    )}`
                                  );
                                  e.currentTarget.parentElement.style.display =
                                    "none";
                                }}
                                style={{
                                  width: "100%",
                                  padding: "8px 10px",
                                  background: "transparent",
                                  border: "none",
                                  borderBottom: "1px solid #f5f5f4",
                                  textAlign: "left",
                                  cursor: "pointer",
                                  fontSize: "0.7rem",
                                  color: "#1c1917",
                                  transition: "background 0.15s",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                                onMouseOver={(e) =>
                                  (e.currentTarget.style.background = "#fafaf9")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.style.background =
                                    "transparent")
                                }
                              >
                                <span style={{ fontSize: "1rem" }}>📄</span>
                                <div style={{ flex: 1 }}>
                                  <div
                                    style={{
                                      fontWeight: "600",
                                      lineHeight: "1.3",
                                    }}
                                  >
                                    Instrucciones
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.6rem",
                                      color: "#78716c",
                                    }}
                                  >
                                    Guía QGIS/ArcGIS
                                  </div>
                                </div>
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(data.download_url_png, "_blank");
                                e.currentTarget.parentElement.style.display =
                                  "none";
                              }}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                background: "transparent",
                                border: "none",
                                textAlign: "left",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                color: "#1c1917",
                                transition: "background 0.15s",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.background = "#fafaf9")
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
                              }
                            >
                              <span style={{ fontSize: "1rem" }}>🎨</span>
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    fontWeight: "600",
                                    lineHeight: "1.3",
                                  }}
                                >
                                  PNG
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.6rem",
                                    color: "#78716c",
                                  }}
                                >
                                  Imagen png
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* ÍNDICES */}
                {activeTab === "indices" &&
                  results.indices &&
                  Object.entries(results.indices).map(([key, data]) => (
                    <div
                      key={key}
                      style={{
                        background: "#ffffff",
                        borderRadius: 10,
                        padding: "12px",
                        border: `2px solid ${
                          isLayerActive("indice", key)
                            ? INDICES_DISPONIBLES[key]?.color
                            : "#e7e5e4"
                        }`,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "120px",
                          background: "#e7e5e4",
                          borderRadius: 6,
                          marginBottom: "8px",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {data.thumbnail_url ? (
                          <img
                            src={data.thumbnail_url}
                            alt={key}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span
                            style={{ color: "#78716c", fontSize: "0.75rem" }}
                          >
                            Cargando...
                          </span>
                        )}
                      </div>
                      <h4
                        style={{
                          margin: "0 0 6px 0",
                          fontSize: "0.85rem",
                          color: "#1c1917",
                          fontWeight: "700",
                        }}
                      >
                        {INDICES_DISPONIBLES[key]?.nombre || key}
                      </h4>

                      {data.statistics?.mean != null && (
                        <div
                          style={{
                            padding: "8px",
                            background: "rgba(124, 58, 237, 0.08)",
                            borderRadius: 6,
                            marginBottom: "8px",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "6px",
                              fontSize: "0.7rem",
                            }}
                          >
                            <div>
                              <div style={{ color: "#78716c" }}>Media</div>
                              <div
                                style={{
                                  fontWeight: "700",
                                  color: "#7c3aed",
                                  fontSize: "0.8rem",
                                }}
                              >
                                {data.statistics.mean.toFixed(3)}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: "#78716c" }}>Mediana</div>
                              <div
                                style={{
                                  fontWeight: "700",
                                  color: "#1c1917",
                                  fontSize: "0.8rem",
                                }}
                              >
                                {data.statistics.median?.toFixed(3) || "—"}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: "#78716c" }}>Mín</div>
                              <div
                                style={{
                                  fontWeight: "700",
                                  color: "#dc2626",
                                  fontSize: "0.8rem",
                                }}
                              >
                                {data.statistics.min?.toFixed(3) || "—"}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: "#78716c" }}>Máx</div>
                              <div
                                style={{
                                  fontWeight: "700",
                                  color: "#22c55e",
                                  fontSize: "0.8rem",
                                }}
                              >
                                {data.statistics.max?.toFixed(3) || "—"}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => toggleLayer("indice", key, data)}
                          style={{
                            flex: 1,
                            padding: "8px",
                            background: isLayerActive("indice", key)
                              ? INDICES_DISPONIBLES[key]?.color
                              : `${INDICES_DISPONIBLES[key]?.color}20`,
                            color: isLayerActive("indice", key)
                              ? "#ffffff"
                              : INDICES_DISPONIBLES[key]?.color,
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                          }}
                        >
                          {isLayerActive("indice", key) ? (
                            <Check size={12} />
                          ) : (
                            <Eye size={12} />
                          )}
                          {isLayerActive("indice", key) ? "Activa" : "Ver"}
                        </button>
                        <button
                          onClick={() =>
                            window.open(data.download_url, "_blank")
                          }
                          style={{
                            flex: 1,
                            padding: "8px",
                            background:
                              INDICES_DISPONIBLES[key]?.color || "#7c3aed",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                          }}
                        >
                          <Download size={12} />
                          GeoTIFF
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
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
