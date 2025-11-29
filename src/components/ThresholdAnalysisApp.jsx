// components/ThresholdAnalysisApp.jsx - Análisis con umbrales + Gestión de Perfiles
import React, { useState, useRef } from "react";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Activity,
  Calendar,
  Download,
  Maximize2,
  Settings,
  Upload,
  FolderOpen,
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
import {
  COLORS,
  SHADOWS,
  TYPOGRAPHY,
  ANIMATIONS,
  RADIUS,
} from "../styles/designTokens";

import { ndviService } from "../services/api";

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

const DEFAULT_THRESHOLDS = {
  NDVI: {
    sin_afeccion: 0.6,
    advertencia: 0.4,
    alerta: 0.3,
  },
  NBR: {
    sin_afeccion: 0.3,
    advertencia: 0.1,
    alerta: -0.1,
  },
  CIre: {
    sin_afeccion: 1.5,
    advertencia: 1.0,
    alerta: 0.7,
  },
  MSI: {
    sin_afeccion: 0.8,
    advertencia: 1.2,
    alerta: 1.5,
  },
};

export default function ThresholdAnalysisApp({ setCurrentApp }) {
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
  const [chartExpanded, setChartExpanded] = useState(false);
  const [showThresholdEditor, setShowThresholdEditor] = useState(false);
  const [customThresholds, setCustomThresholds] = useState(
    DEFAULT_THRESHOLDS.NDVI
  );
  const [tempThresholds, setTempThresholds] = useState(DEFAULT_THRESHOLDS.NDVI);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [loadedProfileName, setLoadedProfileName] = useState("");
  const mapRef = useRef(null);

  React.useEffect(() => {
    loadSavedProfiles();
  }, []);

  const loadSavedProfiles = async () => {
    try {
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
    const newThresholds = DEFAULT_THRESHOLDS[newIndex];
    setCustomThresholds(newThresholds);
    setTempThresholds(newThresholds);
    setResults(null);
    setError("");
    setLoadedProfileName("");
  };

  const handleLoadProfile = (profile) => {
    if (profile.index !== formData.index) {
      if (
        window.confirm(
          `Este perfil es para ${profile.index}. ¿Deseas cambiar el índice a ${profile.index}?`
        )
      ) {
        setFormData({ ...formData, index: profile.index });
      } else {
        return;
      }
    }

    setCustomThresholds(profile.thresholds);
    setTempThresholds(profile.thresholds);
    setLoadedProfileName(profile.name);
    setShowProfileSelector(false);

    alert(
      `✅ Perfil "${
        profile.name
      }" aplicado.\n\n📊 Umbrales:\n🟢 Sin afección: ${profile.thresholds.sin_afeccion.toFixed(
        4
      )}\n🟡 Advertencia: ${profile.thresholds.advertencia.toFixed(
        4
      )}\n🔴 Alerta: ${profile.thresholds.alerta.toFixed(
        4
      )}\n\nAhora puedes analizar tu área con estos umbrales.`
    );
  };

  const handleImportProfile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        if (!imported.suggested_thresholds || !imported.index) {
          alert(
            "❌ Archivo de perfil inválido. Asegúrate de que el archivo JSON contiene los campos requeridos."
          );
          return;
        }

        // Aplicar directamente los umbrales del perfil importado
        if (imported.index !== formData.index) {
          if (
            window.confirm(
              `Este perfil es para ${imported.index}. ¿Deseas cambiar el índice a ${imported.index}?`
            )
          ) {
            setFormData({ ...formData, index: imported.index });
          } else {
            return;
          }
        }

        const thresholds = imported.suggested_thresholds;
        const profileName =
          imported.profile_name || `Perfil ${imported.index} importado`;

        setCustomThresholds(thresholds);
        setTempThresholds(thresholds);
        setLoadedProfileName(profileName);

        alert(
          `✅ Perfil "${profileName}" importado y aplicado.\n\n📊 Umbrales:\n🟢 Sin afección: ${thresholds.sin_afeccion.toFixed(
            4
          )}\n🟡 Advertencia: ${thresholds.advertencia.toFixed(
            4
          )}\n🔴 Alerta: ${thresholds.alerta.toFixed(
            4
          )}\n\n✨ Ahora puedes analizar tu área con estos umbrales.`
        );
      } catch (error) {
        alert(
          `❌ Error al importar perfil: ${error.message}\n\nVerifica que el archivo sea un JSON válido exportado desde la Calculadora de Umbrales.`
        );
      }
    };
    reader.readAsText(file);
    event.target.value = "";
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
      const response = await ndviService.analyzeThresholds({
        geometry: geometry,
        index: formData.index,
        start_month: formData.startMonth,
        end_month: formData.endMonth,
        custom_thresholds: customThresholds,
      });

      const data = response.data;

      if (data.status === "success") {
        const resultsWithCustomThresholds = {
          ...data,
          thresholds: customThresholds,
        };
        setResults(resultsWithCustomThresholds);
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
  };

  const downloadCSV = () => {
    if (!results?.timeseries) return;

    const csv = [
      [
        "Fecha",
        formData.index,
        "Nivel",
        "Umbral Sin Afección",
        "Umbral Advertencia",
        "Umbral Alerta",
      ],
      ...results.timeseries.map((point) => {
        const alert = results.alerts.find((a) => a.date === point.date);
        return [
          point.date,
          point.mean || "",
          alert?.level || "normal",
          customThresholds.sin_afeccion,
          customThresholds.advertencia,
          customThresholds.alerta,
        ];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `threshold_analysis_${formData.index}_${formData.startMonth}_${formData.endMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
    padding: "10px 12px",
    fontSize: "0.9rem",
    border: "1px solid #e7e5e4",
    borderRadius: RADIUS.SM,
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

  const chartData = results?.timeseries
    ? {
        labels: results.timeseries.map((p) => p.date),
        datasets: [
          {
            type: "line",
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
          {
            type: "line",
            label: "Sin afección",
            data: Array(results.timeseries.length).fill(
              customThresholds.sin_afeccion
            ),
            borderColor: "#047857",
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
          {
            type: "line",
            label: "Advertencia",
            data: Array(results.timeseries.length).fill(
              customThresholds.advertencia
            ),
            borderColor: "#ea580c",
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
          {
            type: "line",
            label: "Alerta",
            data: Array(results.timeseries.length).fill(
              customThresholds.alerta
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
        borderColor: "#8b5cf6",
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
        ticks: { color: "#57534e", font: { size: 12, weight: "500" } },
        grid: { color: "#e7e5e4" },
        title: {
          display: true,
          text: formData.index,
          color: "#1c1917",
          font: { size: 13, weight: "600" },
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
              Análisis con Umbrales - {formData.index}
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
            <Chart type="line" data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    );
  };

  const ThresholdEditorModal = () => {
    if (!showThresholdEditor) return null;

    const handleSave = () => {
      setCustomThresholds(tempThresholds);
      setShowThresholdEditor(false);
      setLoadedProfileName(""); // Limpiar nombre de perfil al editar manualmente
      if (results) {
        const updatedResults = {
          ...results,
          thresholds: tempThresholds,
        };
        setResults(updatedResults);
      }
    };

    const handleResetThresholds = () => {
      const defaults = DEFAULT_THRESHOLDS[formData.index];
      setTempThresholds(defaults);
    };

    const handleCancel = () => {
      setTempThresholds(customThresholds);
      setShowThresholdEditor(false);
    };

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
          padding: "20px",
        }}
        onClick={handleCancel}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: RADIUS.LG,
            padding: "30px",
            maxWidth: "500px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "1.3rem",
                color: "#1c1917",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Settings size={24} color="#ea580c" />
              Configurar Umbrales - {formData.index}
            </h3>
            <button
              onClick={handleCancel}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "2rem",
                cursor: "pointer",
                color: "#57534e",
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Selector de perfiles guardados */}
          {savedProfiles.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={() => setShowProfileSelector(!showProfileSelector)}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "0.9rem",
                  background: "transparent",
                  color: "#3b82f6",
                  border: "1px solid #3b82f6",
                  borderRadius: RADIUS.SM,
                  cursor: "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <FolderOpen size={16} />
                Cargar Perfil Guardado (
                {savedProfiles.filter((p) => p.index === formData.index).length}
                )
              </button>

              {showProfileSelector && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    background: "rgba(59, 130, 246, 0.05)",
                    borderRadius: RADIUS.MD,
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    maxHeight: "180px",
                    overflowY: "auto",
                  }}
                >
                  {savedProfiles
                    .filter((p) => p.index === formData.index)
                    .map((profile) => (
                      <div
                        key={profile.id}
                        style={{
                          padding: "8px",
                          marginBottom: 8,
                          background: "#ffffff",
                          borderRadius: RADIUS.SM,
                          border: "1px solid #e7e5e4",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setTempThresholds(profile.thresholds);
                          setShowProfileSelector(false);
                        }}
                      >
                        <strong>{profile.name}</strong>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#78716c",
                            marginTop: 4,
                          }}
                        >
                          🟢 {profile.thresholds.sin_afeccion.toFixed(3)} | 🟡{" "}
                          {profile.thresholds.advertencia.toFixed(3)} | 🔴{" "}
                          {profile.thresholds.alerta.toFixed(3)}
                        </div>
                      </div>
                    ))}
                  {savedProfiles.filter((p) => p.index === formData.index)
                    .length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#78716c",
                        fontSize: "0.85rem",
                      }}
                    >
                      No hay perfiles para {formData.index}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Botón de importar perfil */}
          <div style={{ marginBottom: 24 }}>
            <label
              htmlFor="import-profile-analysis"
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                fontSize: "0.9rem",
                background: "transparent",
                color: "#8b5cf6",
                border: "1px solid #8b5cf6",
                borderRadius: RADIUS.SM,
                cursor: "pointer",
                fontWeight: "600",
                textAlign: "center",
                boxSizing: "border-box",
              }}
            >
              <Upload
                size={16}
                style={{
                  display: "inline",
                  marginRight: "6px",
                  verticalAlign: "middle",
                }}
              />
              Importar Perfil JSON
            </label>
            <input
              id="import-profile-analysis"
              type="file"
              accept=".json"
              onChange={(e) => {
                handleImportProfile(e);
                setShowThresholdEditor(false);
              }}
              style={{ display: "none" }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ ...labelStyle, marginBottom: 12 }}>
              🟢 Sin Afección (Normal)
            </label>
            <input
              type="number"
              step="0.01"
              value={tempThresholds.sin_afeccion}
              onChange={(e) =>
                setTempThresholds({
                  ...tempThresholds,
                  sin_afeccion: parseFloat(e.target.value),
                })
              }
              style={inputStyle}
              placeholder="Ej: 0.6"
            />
            <p
              style={{
                fontSize: "0.8rem",
                color: "#78716c",
                margin: "6px 0 0 0",
              }}
            >
              Valores por encima de este umbral se consideran saludables
            </p>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ ...labelStyle, marginBottom: 12 }}>
              🟡 Advertencia (Precaución)
            </label>
            <input
              type="number"
              step="0.01"
              value={tempThresholds.advertencia}
              onChange={(e) =>
                setTempThresholds({
                  ...tempThresholds,
                  advertencia: parseFloat(e.target.value),
                })
              }
              style={inputStyle}
              placeholder="Ej: 0.4"
            />
            <p
              style={{
                fontSize: "0.8rem",
                color: "#78716c",
                margin: "6px 0 0 0",
              }}
            >
              Valores entre este umbral y el de alerta requieren atención
            </p>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ ...labelStyle, marginBottom: 12 }}>
              🔴 Alerta (Crítico)
            </label>
            <input
              type="number"
              step="0.01"
              value={tempThresholds.alerta}
              onChange={(e) =>
                setTempThresholds({
                  ...tempThresholds,
                  alerta: parseFloat(e.target.value),
                })
              }
              style={inputStyle}
              placeholder="Ej: 0.3"
            />
            <p
              style={{
                fontSize: "0.8rem",
                color: "#78716c",
                margin: "6px 0 0 0",
              }}
            >
              Valores por debajo de este umbral son críticos
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "30px",
            }}
          >
            <button
              onClick={handleResetThresholds}
              style={{
                flex: 1,
                padding: "12px",
                fontSize: "0.95rem",
                background: "transparent",
                color: "#57534e",
                border: "1px solid #e7e5e4",
                borderRadius: RADIUS.MD,
                cursor: "pointer",
                fontWeight: "600",
                transition: ANIMATIONS.TRANSITION_BASE,
              }}
            >
              Restaurar
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: "12px",
                fontSize: "0.95rem",
                background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: RADIUS.MD,
                cursor: "pointer",
                fontWeight: "700",
                transition: ANIMATIONS.TRANSITION_BASE,
              }}
            >
              Aplicar
            </button>
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
            <AlertCircle size={32} color="#ea580c" />
            Análisis con Umbrales
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
            Monitoreo con alertas personalizables
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

          {/* NUEVA SECCIÓN: Configuración de Umbrales */}
          <div
            style={{
              ...sectionStyle,
              background: "rgba(234, 88, 12, 0.05)",
              border: "1px solid rgba(234, 88, 12, 0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#1c1917",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Settings size={20} color="#ea580c" />
                Umbrales de Alerta
              </h3>
            </div>

            {loadedProfileName && (
              <div
                style={{
                  padding: "10px 12px",
                  marginBottom: 12,
                  background: "rgba(139, 92, 246, 0.1)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: RADIUS.SM,
                  fontSize: "0.85rem",
                  color: "#6d28d9",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FolderOpen size={16} />
                {loadedProfileName}
              </div>
            )}

            <div style={{ fontSize: "0.9rem", marginBottom: 12 }}>
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
                <span style={{ fontWeight: "600" }}>🟢 Sin afección:</span>
                <strong>{customThresholds.sin_afeccion}</strong>
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
                <span style={{ fontWeight: "600" }}>🟡 Advertencia:</span>
                <strong>{customThresholds.advertencia}</strong>
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
                <span style={{ fontWeight: "600" }}>🔴 Alerta:</span>
                <strong>{customThresholds.alerta}</strong>
              </div>
            </div>

            {/* Botones de acción */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  setTempThresholds(customThresholds);
                  setShowThresholdEditor(true);
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  fontSize: "0.9rem",
                  background:
                    "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: RADIUS.MD,
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: ANIMATIONS.TRANSITION_BASE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                }}
              >
                <Settings size={16} />
                Editar
              </button>
              <label
                htmlFor="import-profile-sidebar"
                style={{
                  flex: 1,
                  padding: "10px",
                  fontSize: "0.9rem",
                  background: "transparent",
                  color: "#8b5cf6",
                  border: "1px solid #8b5cf6",
                  borderRadius: RADIUS.MD,
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: ANIMATIONS.TRANSITION_BASE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(139, 92, 246, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                }}
              >
                <Upload size={16} />
                Importar
              </label>
              <input
                id="import-profile-sidebar"
                type="file"
                accept=".json"
                onChange={handleImportProfile}
                style={{ display: "none" }}
              />
            </div>

            {savedProfiles.filter((p) => p.index === formData.index).length >
              0 && (
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
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(59, 130, 246, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                }}
              >
                <FolderOpen size={16} />
                Perfiles guardados (
                {savedProfiles.filter((p) => p.index === formData.index).length}
                )
              </button>
            )}

            {showProfileSelector &&
              savedProfiles.filter((p) => p.index === formData.index).length >
                0 && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    background: "rgba(59, 130, 246, 0.05)",
                    borderRadius: RADIUS.MD,
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    maxHeight: "180px",
                    overflowY: "auto",
                  }}
                >
                  {savedProfiles
                    .filter((p) => p.index === formData.index)
                    .map((profile) => (
                      <div
                        key={profile.id}
                        style={{
                          padding: "10px",
                          marginBottom: 8,
                          background: "#ffffff",
                          borderRadius: RADIUS.SM,
                          border: "1px solid #e7e5e4",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          transition: ANIMATIONS.TRANSITION_BASE,
                        }}
                        onClick={() => handleLoadProfile(profile)}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#f5f5f4";
                          e.target.style.borderColor = "#3b82f6";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "#ffffff";
                          e.target.style.borderColor = "#e7e5e4";
                        }}
                      >
                        <div style={{ fontWeight: "600", marginBottom: 4 }}>
                          {profile.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#78716c" }}>
                          🟢 {profile.thresholds.sin_afeccion.toFixed(3)} | 🟡{" "}
                          {profile.thresholds.advertencia.toFixed(3)} | 🔴{" "}
                          {profile.thresholds.alerta.toFixed(3)}
                        </div>
                      </div>
                    ))}
                </div>
              )}

            <p
              style={{
                fontSize: "0.8rem",
                color: "#78716c",
                margin: "12px 0 0 0",
                lineHeight: "1.5",
              }}
            >
              💡 Importa perfiles calculados o edítalos manualmente según tus
              necesidades
            </p>
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
                    📈 {formData.index} con Umbrales
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
                  <Chart type="line" data={chartData} options={chartOptions} />
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
                  🎯 Umbrales Activos
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
                    <strong>{customThresholds.sin_afeccion}</strong>
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
                    <strong>{customThresholds.advertencia}</strong>
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
                    <strong>{customThresholds.alerta}</strong>
                  </div>
                  {loadedProfileName && (
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: "1px solid #e7e5e4",
                        fontSize: "0.85rem",
                        color: "#8b5cf6",
                        fontWeight: "600",
                      }}
                    >
                      📂 Perfil aplicado: {loadedProfileName}
                    </div>
                  )}
                </div>
              </div>

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
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#57534e",
                    lineHeight: "1.8",
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <strong>Puntos analizados:</strong>{" "}
                    {results.timeseries.length}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Imágenes procesadas:</strong>{" "}
                    {results.images_found || 0}
                  </div>
                  <div style={{ marginBottom: 8 }}>
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
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid #e7e5e4",
                      fontSize: "0.85rem",
                      color: "#78716c",
                    }}
                  >
                    ℹ️ Las alertas se generan cuando los valores del índice
                    cruzan los umbrales configurados. Puedes importar perfiles
                    calculados o personalizar los valores manualmente.
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
      <ThresholdEditorModal />

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
