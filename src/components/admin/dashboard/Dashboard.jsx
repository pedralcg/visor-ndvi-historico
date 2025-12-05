import React, { useState, useEffect } from "react";
import { Users, Activity, TrendingUp, BarChart } from "lucide-react";
import {
  COLORS,
  TYPOGRAPHY,
  SHADOWS,
  RADIUS,
  ANIMATIONS,
} from "../../../styles/designTokens";
import { ndviService } from "../../../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar estadísticas del backend
      const response = await ndviService.getAdminStats();

      if (response.status === "success") {
        setStats(response.data || response.stats);
      } else {
        setError("Error al cargar estadísticas");
      }
    } catch (err) {
      console.error("Error loading stats:", err);
      setError(err.message || "Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "400px",
          fontFamily: TYPOGRAPHY.FONT_FAMILY,
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: COLORS.TEXT_SECONDARY,
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              border: `4px solid ${COLORS.BORDER}`,
              borderTop: `4px solid ${COLORS.PRIMARY}`,
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite",
            }}
          />
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: RADIUS.LG,
          padding: "40px",
          boxShadow: SHADOWS.MEDIUM,
          textAlign: "center",
          fontFamily: TYPOGRAPHY.FONT_FAMILY,
        }}
      >
        <p style={{ color: COLORS.ERROR, marginBottom: "16px" }}>{error}</p>
        <button
          onClick={loadStats}
          style={{
            padding: "10px 20px",
            background: COLORS.PRIMARY,
            color: "#ffffff",
            border: "none",
            borderRadius: RADIUS.MD,
            cursor: "pointer",
            fontWeight: "600",
            transition: ANIMATIONS.TRANSITION_BASE,
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  const metrics = [
    {
      id: "total_users",
      label: "Total Usuarios",
      value: stats?.users?.total || 0,
      icon: Users,
      color: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.1)",
    },
    {
      id: "active_users",
      label: "Usuarios Activos",
      value: stats?.users?.active || 0,
      icon: Activity,
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.1)",
    },
    {
      id: "new_users",
      label: "Nuevos (7 días)",
      value: stats?.users?.new_this_week || 0,
      icon: TrendingUp,
      color: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.1)",
    },
    {
      id: "admin_users",
      label: "Administradores",
      value: stats?.users?.admins || 0,
      icon: BarChart,
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.1)",
    },
  ];

  return (
    <div style={{ fontFamily: TYPOGRAPHY.FONT_FAMILY }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "2rem",
            fontWeight: "800",
            color: COLORS.TEXT_PRIMARY,
            marginBottom: "8px",
          }}
        >
          Dashboard
        </h1>
        <p
          style={{
            margin: 0,
            color: COLORS.TEXT_SECONDARY,
            fontSize: "1rem",
          }}
        >
          Resumen general del sistema
        </p>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.id}
              style={{
                background: "#ffffff",
                borderRadius: RADIUS.LG,
                padding: "24px",
                boxShadow: SHADOWS.MEDIUM,
                transition: ANIMATIONS.TRANSITION_BASE,
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = SHADOWS.LARGE;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = SHADOWS.MEDIUM;
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: RADIUS.MD,
                    background: metric.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={24} color={metric.color} />
                </div>
              </div>

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "2rem",
                    fontWeight: "800",
                    color: COLORS.TEXT_PRIMARY,
                    marginBottom: "4px",
                  }}
                >
                  {metric.value.toLocaleString()}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    color: COLORS.TEXT_SECONDARY,
                    fontWeight: "500",
                  }}
                >
                  {metric.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {/* User Status */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: RADIUS.LG,
            padding: "24px",
            boxShadow: SHADOWS.MEDIUM,
          }}
        >
          <h3
            style={{
              margin: "0 0 20px 0",
              fontSize: "1.1rem",
              fontWeight: "700",
              color: COLORS.TEXT_PRIMARY,
            }}
          >
            Estado de Usuarios
          </h3>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                background: "rgba(16, 185, 129, 0.05)",
                borderRadius: RADIUS.MD,
                borderLeft: "3px solid #10b981",
              }}
            >
              <span
                style={{ color: COLORS.TEXT_SECONDARY, fontSize: "0.9rem" }}
              >
                Activos
              </span>
              <span
                style={{
                  fontWeight: "700",
                  color: "#10b981",
                  fontSize: "1.1rem",
                }}
              >
                {stats?.users?.active || 0}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                background: "rgba(239, 68, 68, 0.05)",
                borderRadius: RADIUS.MD,
                borderLeft: "3px solid #ef4444",
              }}
            >
              <span
                style={{ color: COLORS.TEXT_SECONDARY, fontSize: "0.9rem" }}
              >
                Inactivos
              </span>
              <span
                style={{
                  fontWeight: "700",
                  color: "#ef4444",
                  fontSize: "1.1rem",
                }}
              >
                {stats?.users?.inactive || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: RADIUS.LG,
            padding: "24px",
            boxShadow: SHADOWS.MEDIUM,
          }}
        >
          <h3
            style={{
              margin: "0 0 20px 0",
              fontSize: "1.1rem",
              fontWeight: "700",
              color: COLORS.TEXT_PRIMARY,
            }}
          >
            Acciones Rápidas
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              style={{
                padding: "12px 16px",
                background: "transparent",
                border: `1px solid ${COLORS.BORDER}`,
                borderRadius: RADIUS.MD,
                color: COLORS.TEXT_PRIMARY,
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: ANIMATIONS.TRANSITION_BASE,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(59, 130, 246, 0.05)";
                e.currentTarget.style.borderColor = COLORS.PRIMARY;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = COLORS.BORDER;
              }}
            >
              📊 Ver Analytics Completo
            </button>

            <button
              style={{
                padding: "12px 16px",
                background: "transparent",
                border: `1px solid ${COLORS.BORDER}`,
                borderRadius: RADIUS.MD,
                color: COLORS.TEXT_PRIMARY,
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: ANIMATIONS.TRANSITION_BASE,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(59, 130, 246, 0.05)";
                e.currentTarget.style.borderColor = COLORS.PRIMARY;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = COLORS.BORDER;
              }}
            >
              📝 Ver Logs del Sistema
            </button>

            <button
              onClick={loadStats}
              style={{
                padding: "12px 16px",
                background: COLORS.PRIMARY,
                border: "none",
                borderRadius: RADIUS.MD,
                color: "#ffffff",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.9rem",
                fontWeight: "600",
                transition: ANIMATIONS.TRANSITION_BASE,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              🔄 Actualizar Datos
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
