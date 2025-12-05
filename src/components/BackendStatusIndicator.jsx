import React, { useState, useEffect } from "react";
import { Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";
import {
  COLORS,
  SHADOWS,
  Z_INDEX,
  RADIUS,
  ANIMATIONS,
} from "../styles/designTokens";

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
        zIndex: Z_INDEX.MODAL + 100, // Ensure it's on top of everything
        padding: "1rem",
        background: getBackgroundColor(status),
        color: COLORS.SURFACE,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        boxShadow: SHADOWS.MD,
        animation: "slideDown 0.3s ease-out",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {getIcon(status)}
      <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>{message}</span>

      {status === "offline" && (
        <button
          onClick={handleRetry}
          style={{
            marginLeft: "0.75rem",
            padding: "0.5rem 1rem",
            background: COLORS.SURFACE,
            color: COLORS.ERROR,
            border: "none",
            borderRadius: RADIUS.MD,
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.9rem",
            boxShadow: SHADOWS.SM,
            transition: ANIMATIONS.TRANSITION_BASE,
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
      return `linear-gradient(135deg, ${COLORS.PRIMARY} 0%, ${COLORS.SECONDARY} 100%)`;
    case "waking":
      return "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"; // Amber for waking
    case "offline":
      return `linear-gradient(135deg, ${COLORS.ERROR} 0%, #b91c1c 100%)`;
    default:
      return `linear-gradient(135deg, ${COLORS.SUCCESS} 0%, #059669 100%)`;
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
