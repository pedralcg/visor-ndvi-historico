import React, { useState, useEffect } from "react";
import { Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";

/**
 * BackendStatusIndicator - Componente para mostrar el estado del backend
 *
 * Detecta cuando el backend de Render está "despertando" y muestra
 * feedback visual al usuario con reintentos automáticos.
 */
const BackendStatusIndicator = ({ apiUrl, onStatusChange }) => {
  const [status, setStatus] = useState("checking"); // checking, online, waking, offline
  const [retryCount, setRetryCount] = useState(0);
  const [message, setMessage] = useState("Verificando conexión...");

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async (attempt = 0) => {
    try {
      setStatus("checking");
      setMessage("Verificando conexión con el servidor...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${apiUrl}/`, {
        signal: controller.signal,
        method: "GET",
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setStatus("online");
        setMessage("✅ Servidor conectado");
        setRetryCount(0);
        onStatusChange?.("online");
      } else {
        throw new Error("Backend not responding correctly");
      }
    } catch (error) {
      console.warn("Backend check failed:", error.message);

      if (attempt < 5) {
        // Render puede tardar hasta 60 segundos en despertar
        setStatus("waking");
        const nextAttempt = attempt + 1;
        const delay = Math.min(5000 * nextAttempt, 15000); // Max 15s entre intentos

        setRetryCount(nextAttempt);
        setMessage(
          `⏳ Iniciando servidor... Intento ${nextAttempt}/5 (esto puede tardar un minuto)`
        );

        setTimeout(() => checkBackendStatus(nextAttempt), delay);
        onStatusChange?.("waking");
      } else {
        setStatus("offline");
        setMessage(
          "❌ No se pudo conectar con el servidor. Por favor, recarga la página."
        );
        onStatusChange?.("offline");
      }
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    checkBackendStatus();
  };

  // No mostrar nada si está online
  if (status === "online") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: "16px",
        background: getBackgroundColor(status),
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        animation: "slideDown 0.3s ease-out",
      }}
    >
      {getIcon(status)}
      <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>{message}</span>

      {status === "offline" && (
        <button
          onClick={handleRetry}
          style={{
            marginLeft: "12px",
            padding: "8px 16px",
            background: "#ffffff",
            color: "#dc2626",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Reintentar
        </button>
      )}
    </div>
  );
};

const getBackgroundColor = (status) => {
  switch (status) {
    case "checking":
      return "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
    case "waking":
      return "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
    case "offline":
      return "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
    default:
      return "linear-gradient(135deg, #10b981 0%, #059669 100%)";
  }
};

const getIcon = (status) => {
  const iconProps = {
    size: 20,
    style: {
      animation: status === "waking" ? "spin 1s linear infinite" : "none",
    },
  };

  switch (status) {
    case "checking":
      return <Activity {...iconProps} />;
    case "waking":
      return <Clock {...iconProps} />;
    case "offline":
      return <AlertCircle {...iconProps} />;
    default:
      return <CheckCircle {...iconProps} />;
  }
};

export default BackendStatusIndicator;
