// components/ThresholdCalculatorApp.jsx - Calculadora de Umbrales (Simplificada)
import React, { useState, useRef } from "react";
import {
  Calculator,
  Activity,
  Calendar,
  Download,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Save,
  Zap,
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

const RENDER_API_BASE_URL = "https://ndvi-api-service.onrender.com";
const FORCE_RENDER_API_LOCAL_TEST = true;

const API_BASE_URL =
  FORCE_RENDER_API_LOCAL_TEST === true || process.env.NODE_ENV === "production"
    ? RENDER_API_BASE_URL
    : "http://localhost:5000";

const S2_MIN_DATE = "2017-04";

export default function ThresholdCalculatorApp({ setCurrentApp }) {
  const getCurrentYearMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  };

  const [formData, setFormData] = useState({
    index: "NDVI",
    startMonth: "2017-04",
    endMonth: getCurrentYearMonth(),
    method: "percentiles",
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [geometry, setGeometry] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const mapRef = useRef(null);

  React.useEffect(() => {
    loadSavedProfiles();
  }, []);

  const loadSavedProfiles = async () => {
    try {
      // Intentar cargar desde localStorage
      const stored = localStorage.getItem("threshold_profiles");
      if (stored) {
        const profiles = JSON.parse(stored);
        setSavedProfiles(profiles);
      }
    } catch (error) {
      console.log("No hay perfiles guardados aún");
    }
  };

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

  const handleIndexChange = (newIndex) => {
    setFormData({ ...formData, index: newIndex });
    setResults(null);
    setError("");
  };

  const handleCalculate = async () => {
    if (!geometry) {
      setError("Por favor, dibuja un área en el mapa primero");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/thresholds/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geometry: geometry,
          index: formData.index,
          start_month: formData.startMonth,
          end_month: formData.endMonth,
          method: formData.method,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setResults(data);
      } else {
        setError(data.message || "Error al calcular umbrales");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error de conexión con el servidor");
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

  const handleSaveProfile = async () => {
    if (!results || !profileName.trim()) {
      alert("Por favor, ingresa un nombre para el perfil");
      return;
    }

    const profile = {
      id: `profile_${Date.now()}`,
      name: profileName,
      index: formData.index,
      method: formData.method,
      thresholds: results.suggested_thresholds,
      statistics: results.statistics,
      period: {
        start: formData.startMonth,
        end: formData.endMonth,
      },
      date_created: new Date().toISOString(),
    };

    try {
      // Guardar en localStorage
      const currentProfiles = savedProfiles || [];
      const updatedProfiles = [...currentProfiles, profile];
      localStorage.setItem(
        "threshold_profiles",
        JSON.stringify(updatedProfiles)
      );

      alert(`✅ Perfil "${profileName}" guardado exitosamente`);
      setProfileName("");
      await loadSavedProfiles();
    } catch (error) {
      alert(`❌ Error al guardar perfil: ${error.message}`);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    if (!window.confirm("¿Estás seguro de eliminar este perfil?")) return;

    try {
      const updatedProfiles = savedProfiles.filter((p) => p.id !== profileId);
      localStorage.setItem(
        "threshold_profiles",
        JSON.stringify(updatedProfiles)
      );
      await loadSavedProfiles();
      alert("✅ Perfil eliminado");
    } catch (error) {
      alert(`❌ Error al eliminar: ${error.message}`);
    }
  };

  const handleLoadProfile = (profile) => {
    // Cargar la configuración del perfil
    setFormData({
      ...formData,
      index: profile.index,
      method: profile.method,
      startMonth: profile.period.start,
      endMonth: profile.period.end,
    });

    // Cargar los resultados directamente si existen
    if (profile.thresholds && profile.statistics) {
      setResults({
        suggested_thresholds: profile.thresholds,
        statistics: profile.statistics,
        histogram: null, // No tenemos el histograma guardado
        timeseries: null, // No tenemos la serie temporal guardada
      });
      setProfileName(profile.name);
    }

    setShowProfileSelector(false);
    alert(
      `✅ Perfil "${
        profile.name
      }" cargado exitosamente.\n\n📊 Umbrales:\n🟢 Sin afección: ${profile.thresholds.sin_afeccion.toFixed(
        4
      )}\n🟡 Advertencia: ${profile.thresholds.advertencia.toFixed(
        4
      )}\n🔴 Alerta: ${profile.thresholds.alerta.toFixed(
        4
      )}\n\nSi deseas recalcular con un área diferente, dibuja en el mapa y haz clic en "Calcular Umbrales".`
    );
  };

  const downloadJSON = () => {
    if (!results) return;

    const exportData = {
      profile_name: profileName || `Perfil_${formData.index}_${Date.now()}`,
      index: formData.index,
      method: formData.method,
      period: {
        start: formData.startMonth,
        end: formData.endMonth,
      },
      suggested_thresholds: results.suggested_thresholds,
      statistics: results.statistics,
      generated_at: new Date().toISOString(),
      app_version: "2.0",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `threshold_profile_${formData.index}_${
      formData.method
    }_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleImportProfile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        if (!imported.suggested_thresholds || !imported.index) {
          alert(
            "❌ Archivo de perfil inválido. Asegúrate de que el archivo JSON contiene los campos requeridos."
          );
          return;
        }

        // Crear perfil a partir del archivo importado
        const profile = {
          id: `profile_imported_${Date.now()}`,
          name:
            imported.profile_name ||
            `Importado_${imported.index}_${new Date().toLocaleDateString()}`,
          index: imported.index,
          method: imported.method,
          thresholds: imported.suggested_thresholds,
          statistics: imported.statistics,
          period: imported.period,
          date_created: new Date().toISOString(),
        };

        // Guardar en localStorage
        const currentProfiles = savedProfiles || [];
        const updatedProfiles = [...currentProfiles, profile];
        localStorage.setItem(
          "threshold_profiles",
          JSON.stringify(updatedProfiles)
        );

        // Cargar el perfil inmediatamente
        setFormData({
          ...formData,
          index: profile.index,
          method: profile.method,
          startMonth: profile.period.start,
          endMonth: profile.period.end,
        });

        setResults({
          suggested_thresholds: profile.thresholds,
          statistics: profile.statistics,
          histogram: null,
          timeseries: null,
        });

        setProfileName(profile.name);

        await loadSavedProfiles();
        alert(
          `✅ Perfil "${
            profile.name
          }" importado y cargado correctamente.\n\n📊 Umbrales:\n🟢 Sin afección: ${profile.thresholds.sin_afeccion.toFixed(
            4
          )}\n🟡 Advertencia: ${profile.thresholds.advertencia.toFixed(
            4
          )}\n🔴 Alerta: ${profile.thresholds.alerta.toFixed(4)}`
        );
      } catch (error) {
        alert(
          `❌ Error al importar perfil: ${error.message}\n\nVerifica que el archivo sea un JSON válido exportado desde esta aplicación.`
        );
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const getMethodDescription = (method) => {
    const descriptions = {
      percentiles:
        "Calcula umbrales basándose en percentiles de la distribución histórica (P25, P50, P75)",
      std_deviation:
        "Utiliza la media y desviación estándar para definir umbrales (±1σ, ±2σ)",
      seasonal:
        "Analiza patrones estacionales para establecer umbrales por época del año",
    };
    return descriptions[method] || "";
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
    borderBottom: "2px solid #3b82f6",
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
        ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
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

  // Datos del histograma
  const histogramData = results?.histogram
    ? {
        labels: results.histogram.bins.map((bin) => bin.toFixed(2)),
        datasets: [
          {
            type: "bar",
            label: "Frecuencia",
            data: results.histogram.frequencies,
            backgroundColor: "rgba(59, 130, 246, 0.6)",
            borderColor: "#3b82f6",
            borderWidth: 1,
          },
        ],
      }
    : null;

  const histogramOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1c1917",
        callbacks: {
          label: (context) => `Frecuencia: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        ticks: { color: "#57534e", font: { size: 11 } },
        grid: { color: "#e7e5e4" },
        title: {
          display: true,
          text: "Frecuencia",
          color: "#1c1917",
          font: { size: 12, weight: "600" },
        },
      },
      x: {
        ticks: { color: "#57534e", font: { size: 10 }, maxRotation: 45 },
        grid: { color: "#f5f5f4" },
        title: {
          display: true,
          text: `Valor ${formData.index}`,
          color: "#1c1917",
          font: { size: 12, weight: "600" },
        },
      },
    },
  };

  // Datos de la serie temporal con percentiles
  const timeSeriesData = results?.timeseries
    ? {
        labels: results.timeseries.map((p) => p.date),
        datasets: [
          {
            type: "line",
            label: formData.index,
            data: results.timeseries.map((p) => p.mean),
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 3,
            fill: true,
          },
          {
            type: "line",
            label: "Umbral Normal (P75)",
            data: Array(results.timeseries.length).fill(
              results.suggested_thresholds.sin_afeccion
            ),
            borderColor: "#047857",
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
          {
            type: "line",
            label: "Umbral Advertencia (P50)",
            data: Array(results.timeseries.length).fill(
              results.suggested_thresholds.advertencia
            ),
            borderColor: "#ea580c",
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
          {
            type: "line",
            label: "Umbral Alerta (P25)",
            data: Array(results.timeseries.length).fill(
              results.suggested_thresholds.alerta
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

  const timeSeriesOptions = {
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
          font: { size: 10 },
          usePointStyle: true,
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: "#1c1917",
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
        ticks: { color: "#57534e", font: { size: 11 } },
        grid: { color: "#e7e5e4" },
        title: {
          display: true,
          text: formData.index,
          color: "#1c1917",
          font: { size: 12, weight: "600" },
        },
      },
      x: {
        ticks: {
          color: "#57534e",
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 45,
        },
        grid: { color: "#f5f5f4" },
      },
    },
  };

  return (
    <div style={containerStyle}>
      <aside style={sidebarStyle}>
        <div style={{ paddingBottom: "20px" }}>
          <h2 style={headerStyle}>
            <Calculator size={32} color="#3b82f6" />
            Calculadora de Umbrales
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
            Análisis estadístico de índices espectrales
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

            {savedProfiles.length > 0 && (
              <button
                onClick={() => setShowProfileSelector(!showProfileSelector)}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "0.85rem",
                  background: "transparent",
                  color: "#3b82f6",
                  border: "1px solid #3b82f6",
                  borderRadius: RADIUS.SM,
                  cursor: "pointer",
                  fontWeight: "600",
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                📂 Cargar Perfil ({savedProfiles.length})
              </button>
            )}

            {showProfileSelector && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "rgba(59, 130, 246, 0.05)",
                  borderRadius: RADIUS.MD,
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                <h4
                  style={{
                    fontSize: "0.9rem",
                    margin: "0 0 10px 0",
                    color: "#1c1917",
                  }}
                >
                  Perfiles Guardados
                </h4>
                {savedProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    style={{
                      padding: "8px",
                      marginBottom: 8,
                      background: "#ffffff",
                      borderRadius: RADIUS.SM,
                      border: "1px solid #e7e5e4",
                      fontSize: "0.85rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <strong>{profile.name}</strong>
                        <div style={{ fontSize: "0.75rem", color: "#78716c" }}>
                          {profile.index} | {profile.method} |{" "}
                          {new Date(profile.date_created).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          onClick={() => handleLoadProfile(profile)}
                          style={{
                            padding: "4px 8px",
                            fontSize: "0.75rem",
                            background: "#3b82f6",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: RADIUS.SM,
                            cursor: "pointer",
                          }}
                        >
                          Cargar
                        </button>
                        <button
                          onClick={() => handleDeleteProfile(profile.id)}
                          style={{
                            padding: "4px 8px",
                            fontSize: "0.75rem",
                            background: "#dc2626",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: RADIUS.SM,
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label style={{ ...labelStyle, marginTop: 16 }}>
              <BarChart3
                size={16}
                style={{ display: "inline", marginRight: "5px" }}
              />
              Método de Cálculo
            </label>
            <select
              value={formData.method}
              onChange={(e) =>
                setFormData({ ...formData, method: e.target.value })
              }
              style={selectStyle}
            >
              <option value="percentiles">Percentiles (Recomendado)</option>
              <option value="std_deviation">Desviación Estándar</option>
              <option value="seasonal">Análisis Estacional</option>
            </select>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#78716c",
                margin: "8px 0 0 0",
                lineHeight: "1.4",
              }}
            >
              {getMethodDescription(formData.method)}
            </p>

            <label style={{ ...labelStyle, marginTop: 16 }}>
              <Calendar
                size={16}
                style={{ display: "inline", marginRight: "5px" }}
              />
              Periodo Histórico
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
              onClick={handleCalculate}
              disabled={!geometry || loading}
              style={buttonStyle}
              onMouseEnter={(e) => {
                if (geometry && !loading) {
                  e.target.style.transform = "scale(1.02)";
                  e.target.style.boxShadow =
                    "0 4px 14px rgba(59, 130, 246, 0.4)";
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
                  Calculando...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Calcular Umbrales
                </>
              )}
            </button>
          </div>

          {results && (
            <>
              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  background: "rgba(59, 130, 246, 0.08)",
                  borderRadius: RADIUS.MD,
                  border: "1px solid rgba(59, 130, 246, 0.2)",
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
                  <TrendingUp size={18} color="#3b82f6" />
                  Umbrales Sugeridos
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
                    <strong>
                      {results.suggested_thresholds.sin_afeccion.toFixed(4)}
                    </strong>
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
                    <strong>
                      {results.suggested_thresholds.advertencia.toFixed(4)}
                    </strong>
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
                    <strong>
                      {results.suggested_thresholds.alerta.toFixed(4)}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: "1px solid #e7e5e4",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Nombre del perfil (ej: Trigo_Verano)"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    style={{
                      ...inputStyle,
                      marginBottom: 10,
                      fontSize: "0.85rem",
                      padding: "8px 10px",
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px", marginBottom: 8 }}>
                    <button
                      onClick={handleSaveProfile}
                      style={{
                        flex: 1,
                        padding: "8px",
                        fontSize: "0.85rem",
                        background:
                          "linear-gradient(135deg, #059669 0%, #047857 100%)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: RADIUS.SM,
                        cursor: "pointer",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Save size={14} />
                      Guardar
                    </button>
                    <button
                      onClick={downloadJSON}
                      style={{
                        flex: 1,
                        padding: "8px",
                        fontSize: "0.85rem",
                        background: "transparent",
                        color: "#57534e",
                        border: "1px solid #e7e5e4",
                        borderRadius: RADIUS.SM,
                        cursor: "pointer",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Download size={14} />
                      Exportar
                    </button>
                  </div>
                  <label
                    htmlFor="import-profile"
                    style={{
                      display: "block",
                      padding: "8px",
                      fontSize: "0.85rem",
                      background: "transparent",
                      color: "#3b82f6",
                      border: "1px solid #3b82f6",
                      borderRadius: RADIUS.SM,
                      cursor: "pointer",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    📥 Importar Perfil JSON
                  </label>
                  <input
                    id="import-profile"
                    type="file"
                    accept=".json"
                    onChange={handleImportProfile}
                    style={{ display: "none" }}
                  />
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
                  📊 Estadísticas de la Distribución
                </h4>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#57534e",
                    lineHeight: "1.8",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <strong>Media:</strong>{" "}
                      {results.statistics.mean.toFixed(4)}
                    </div>
                    <div>
                      <strong>Mediana:</strong>{" "}
                      {results.statistics.median.toFixed(4)}
                    </div>
                    <div>
                      <strong>Desv. Est.:</strong>{" "}
                      {results.statistics.std.toFixed(4)}
                    </div>
                    <div>
                      <strong>Mínimo:</strong>{" "}
                      {results.statistics.min.toFixed(4)}
                    </div>
                    <div>
                      <strong>Máximo:</strong>{" "}
                      {results.statistics.max.toFixed(4)}
                    </div>
                    <div>
                      <strong>Muestras:</strong> {results.statistics.count}
                    </div>
                  </div>
                  {results.statistics.p10 !== undefined && (
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: "1px solid #e7e5e4",
                        fontSize: "0.8rem",
                        color: "#78716c",
                      }}
                    >
                      <strong>Percentiles:</strong>
                      <div style={{ marginTop: 6 }}>
                        P10: {results.statistics.p10?.toFixed(4)} | P25:{" "}
                        {results.statistics.p25?.toFixed(4)} | P50:{" "}
                        {results.statistics.p50?.toFixed(4)} | P75:{" "}
                        {results.statistics.p75?.toFixed(4)} | P90:{" "}
                        {results.statistics.p90?.toFixed(4)}
                      </div>
                    </div>
                  )}
                  {profileName && (
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: "1px solid #e7e5e4",
                        fontSize: "0.85rem",
                        color: "#3b82f6",
                        fontWeight: "600",
                      }}
                    >
                      📂 Perfil cargado: {profileName}
                    </div>
                  )}
                </div>
              </div>

              {results.histogram && (
                <div style={{ marginTop: 20 }}>
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      color: "#1c1917",
                      margin: "0 0 12px 0",
                    }}
                  >
                    📊 Distribución de Valores
                  </h3>
                  <div
                    style={{
                      height: "200px",
                      padding: "15px",
                      background: "#ffffff",
                      borderRadius: RADIUS.MD,
                      border: "1px solid #e7e5e4",
                    }}
                  >
                    <Chart
                      type="bar"
                      data={histogramData}
                      options={histogramOptions}
                    />
                  </div>
                </div>
              )}

              {results.timeseries && (
                <div style={{ marginTop: 20 }}>
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      color: "#1c1917",
                      margin: "0 0 12px 0",
                    }}
                  >
                    📈 Serie Histórica con Umbrales
                  </h3>
                  <div
                    style={{
                      height: "220px",
                      padding: "15px",
                      background: "#ffffff",
                      borderRadius: RADIUS.MD,
                      border: "1px solid #e7e5e4",
                    }}
                  >
                    <Chart
                      type="line"
                      data={timeSeriesData}
                      options={timeSeriesOptions}
                    />
                  </div>
                </div>
              )}

              <div
                style={{
                  marginTop: 20,
                  padding: 12,
                  background: "rgba(59, 130, 246, 0.05)",
                  borderRadius: RADIUS.MD,
                  border: "1px solid rgba(59, 130, 246, 0.15)",
                  fontSize: "0.8rem",
                  color: "#57534e",
                  lineHeight: "1.6",
                }}
              >
                <strong>ℹ️ Interpretación:</strong>
                <br />
                {results.statistics.count ? (
                  <>
                    Los umbrales calculados se basan en el análisis estadístico
                    de {results.statistics.count} observaciones históricas. El
                    método <strong>{formData.method}</strong> utiliza la
                    distribución de valores para identificar rangos normales, de
                    advertencia y críticos de forma objetiva.
                  </>
                ) : (
                  <>
                    Este perfil ha sido importado. Los umbrales fueron
                    calculados previamente usando el método{" "}
                    <strong>{formData.method}</strong>. Puedes usar estos
                    valores directamente en otras aplicaciones o recalcularlos
                    dibujando un área en el mapa.
                  </>
                )}
              </div>
            </>
          )}

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
                marginTop: 20,
              }}
            >
              <AlertTriangle size={18} />
              {error}
            </div>
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
