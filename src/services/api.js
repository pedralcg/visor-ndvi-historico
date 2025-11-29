import axios from "axios";

// Configuración de URL base
// Prioridad: Variable de entorno > Producción (Render) > Desarrollo (Local Flask)
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://ndvi-api-service.onrender.com"
    : "http://localhost:5001"); // Apuntar directo a Flask (5001)

console.log(`🌍 API Service configurado: ${API_BASE_URL}`);

// Instancia Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Timeout de 3 minutos para cálculos pesados de GEE
  timeout: 180000,
});

// Interceptor para manejo de errores global (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Endpoints organizados por funcionalidad
export const ndviService = {
  // Cálculo de índices (NDVI, NBR, etc.)
  calculateIndex: (data) => api.post("/api/ndvi", data),

  // Series temporales
  getTimeSeries: (data) => api.post("/api/timeseries/trend", data),

  // Análisis de umbrales
  analyzeThresholds: (data) => api.post("/api/analysis/thresholds", data),

  // Calculadora de umbrales (si existe el endpoint, basado en componentes)
  calculateThresholds: (data) =>
    api.post("/api/analysis/threshold-calculator", data),

  // Mapas de cambio
  getChangeMap: (data) => api.post("/api/analysis/change-map", data),

  // Detección de cambios
  detectChanges: (data) => api.post("/api/analysis/change-detection", data),

  // Composición temporal
  createComposite: (data) => api.post("/api/composite/temporal", data),

  // Comparación multi-índice
  compareIndices: (data) => api.post("/api/composite/multiindex", data),

  // Descargas
  downloadGeoTiff: (data) => api.post("/api/download/geotiff", data),
};

export default api;
