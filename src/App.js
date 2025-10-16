import React, { useState, useCallback, useRef } from "react";
import MapView from "./components/MapView";
import NDVIChart from "./components/NDVIChart";

// =========================================================================
// !!! CONFIGURACIÓN DE URL DINÁMICA DE API !!!
// 1. URL de Render (Producción)
const RENDER_API_BASE_URL = "https://ndvi-api-service.onrender.com";

// 2. Bandera de Prueba Local:
// Valor por defecto: 'undefined'.
// Para FORZAR la conexión del frontend local al backend de Render, cambia a 'true'.
const FORCE_RENDER_API_LOCAL_TEST = undefined;

// 3. Lógica de autodetección (NODE_ENV)
// Elige la URL base según el entorno:
// a) Si FORCE_RENDER_API_LOCAL_TEST es 'true', usa Render (prueba híbrida).
// b) Si está en modo 'production', usa Render (despliegue final).
// c) Por defecto (modo 'development'), usa el backend local (http://localhost:5000).
const API_BASE_URL =
  FORCE_RENDER_API_LOCAL_TEST === true || process.env.NODE_ENV === "production"
    ? RENDER_API_BASE_URL
    : "http://localhost:5000";

// URL completa de la API, incluyendo el endpoint /api/ndvi
const API_URL = `${API_BASE_URL}/api/ndvi`;
// =========================================================================

// Definición de una fecha mínima de Sentinel-2
const S2_MIN_DATE = "2015-06-23";

function App() {
  const [ndviHistory, setNdviHistory] = useState([]); // Almacena el historial
  const [ndviData, setNdviData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [geometry, setGeometry] = useState(null);
  const [lastNdviDate, setLastNdviDate] = useState(null); // Fecha de la imagen utilizada
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
          // Establecer la fecha de la imagen real para MapView
          const imageDate = data.image_date || currentDate;
          setLastNdviDate(imageDate); // <-- CRÍTICO: Guardamos la fecha

          // Crear una nueva entrada para el historial
          const newEntry = {
            date: imageDate,
            mean_ndvi: data.mean_ndvi,
            geometryHash: JSON.stringify(currentGeometry),
          };

          // Lógica de actualización del historial
          setNdviHistory((prevHistory) => {
            const existingIndex = prevHistory.findIndex(
              (e) => e.date === newEntry.date
            );
            let newHistory;

            if (existingIndex !== -1) {
              // Actualizar entrada existente
              newHistory = [...prevHistory];
              newHistory[existingIndex] = newEntry;
            } else {
              // Añadir nueva entrada
              newHistory = [...prevHistory, newEntry];
            }
            // Asegurar que el historial esté ordenado por fecha
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

      // Limpiar historial si la geometría dibujada cambia
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

    // Llamar a la función de limpieza de MapView si estuviera disponible
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

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Inter, Roboto, sans-serif",
        background: "#F5F7FA",
      }}
    >
      <aside
        style={{
          width: 380,
          padding: 24,
          background: "#FFFFFF",
          color: "#3A4145",
          borderRight: "1px solid #E4E7EB",
          boxShadow: "2px 0 10px rgba(0,0,0,0.05)",
          overflowY: "auto",
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            borderBottom: "2px solid #00B8D9",
            paddingBottom: 10,
            color: "#3A4145",
          }}
        >
          Visor Satelital <span style={{ color: "#00B8D9" }}>NDVI</span>
        </h2>

        {/* CONTROLES */}
        <div
          style={{
            marginBottom: 25,
            padding: 15,
            background: "#F5F7FA",
            borderRadius: 8,
            border: "1px solid #E4E7EB",
          }}
        >
          <label
            style={{ display: "block", marginBottom: 15, fontSize: "0.95rem" }}
          >
            <strong>Fecha de cálculo:</strong>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={S2_MIN_DATE}
              style={{
                display: "block",
                width: "100%",
                padding: 10,
                marginTop: 8,
                fontSize: 14,
                border: "1px solid #CFD8DC",
                borderRadius: 4,
                background: "white",
                color: "#3A4145",
              }}
            />
          </label>

          <button
            onClick={handleCalculateNdvi}
            disabled={loading || !geometry}
            style={{
              width: "100%",
              padding: "12px",
              background: geometry ? "#00C853" : "#B0BEC5",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: geometry ? "pointer" : "not-allowed",
              fontWeight: "bold",
              transition: "background 0.3s, opacity 0.3s",
              opacity: loading || !geometry ? 0.7 : 1,
              boxShadow: geometry ? "0 4px 6px rgba(0, 200, 83, 0.3)" : "none",
            }}
          >
            {loading ? "⏳ Calculando..." : "🚀 Calcular NDVI"}
          </button>
        </div>

        {/* MENSAJES */}
        <div style={{ marginTop: 10, minHeight: 40, fontSize: "0.9rem" }}>
          {message && (
            <p
              style={{
                color: message.startsWith("❌") ? "#E57373" : "#00C853",
                fontWeight: "bold",
              }}
            >
              {message}
            </p>
          )}
        </div>

        {/* HISTORIAL Y DETALLES */}
        <div style={{ marginTop: 10 }}>
          <h3 style={{ marginBottom: 10, color: "#3A4145" }}>
            📈 Historial de NDVI
          </h3>
          <NDVIChart ndviHistory={ndviHistory} />
        </div>

        {ndviData && (
          <div
            style={{
              marginTop: 15,
              fontSize: 14,
              color: "#546E7A",
              background: "#F5F7FA",
              padding: 15,
              borderRadius: 8,
              border: "1px solid #E4E7EB",
            }}
          >
            <p style={{ margin: "4px 0" }}>
              <strong>🗓 Imagen (Última Vis.):</strong> {currentImageDate || "—"}
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>📸 Imágenes candidatas:</strong>{" "}
              {currentImagesFound ?? "—"}
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>📐 Área AOI (Última):</strong>{" "}
              {currentAreaKm2 != null
                ? `${currentAreaKm2.toFixed(2)} km²`
                : "—"}
            </p>
            <p
              style={{ margin: "4px 0", color: "#00C853", fontWeight: "bold" }}
            >
              <strong>🌿 NDVI medio (Último):</strong>{" "}
              {currentNdviValue != null ? currentNdviValue.toFixed(3) : "—"}
            </p>
          </div>
        )}

        {/* BOTÓN REINICIAR */}
        <button
          onClick={handleReset}
          style={{
            marginTop: 25,
            background: "#E4E7EB",
            color: "#3A4145",
            border: "1px solid #CFD8DC",
            borderRadius: 4,
            padding: "10px",
            cursor: "pointer",
            width: "100%",
            fontWeight: "bold",
            transition: "background 0.3s",
          }}
        >
          🔄 Reiniciar visor (Borra capas y datos)
        </button>
      </aside>

      <div style={{ flex: 1 }}>
        <MapView
          onGeometrySelected={handleGeometrySelected}
          ndviTileUrl={ndviData?.tile_url}
          onReset={handleReset}
          lastNdviDate={lastNdviDate} // <-- CRÍTICO: Se pasa la fecha para nombrar la capa
          ref={mapRef}
        />
      </div>
    </div>
  );
}

export default App;
