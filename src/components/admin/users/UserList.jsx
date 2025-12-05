import React from "react";
import { Edit2, CheckCircle, XCircle, AlertCircle, Shield } from "lucide-react";
import {
  COLORS,
  TYPOGRAPHY,
  SHADOWS,
  RADIUS,
  ANIMATIONS,
} from "../../../styles/designTokens";

export default function UserList({ users, onEditUser, onRefresh }) {
  const getRoleBadge = (role) => {
    const badges = {
      admin: {
        color: "#f59e0b",
        bg: "rgba(245, 158, 11, 0.1)",
        label: "Admin",
      },
      premium: {
        color: "#8b5cf6",
        bg: "rgba(139, 92, 246, 0.1)",
        label: "Premium",
      },
      free: {
        color: "#6b7280",
        bg: "rgba(107, 114, 128, 0.1)",
        label: "Gratuito",
      },
    };

    const badge = badges[role] || badges.free;

    return (
      <span
        style={{
          padding: "4px 12px",
          background: badge.bg,
          color: badge.color,
          fontSize: "0.75rem",
          fontWeight: "600",
          borderRadius: RADIUS.FULL,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: {
        color: "#10b981",
        bg: "rgba(16, 185, 129, 0.1)",
        label: "Activo",
        icon: CheckCircle,
      },
      inactive: {
        color: "#6b7280",
        bg: "rgba(107, 114, 128, 0.1)",
        label: "Inactivo",
        icon: XCircle,
      },
      suspended: {
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.1)",
        label: "Suspendido",
        icon: AlertCircle,
      },
    };

    const badge = badges[status] || badges.active;
    const Icon = badge.icon;

    return (
      <span
        style={{
          padding: "4px 12px",
          background: badge.bg,
          color: badge.color,
          fontSize: "0.75rem",
          fontWeight: "600",
          borderRadius: RADIUS.FULL,
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: RADIUS.LG,
        boxShadow: SHADOWS.MEDIUM,
        overflow: "hidden",
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
      }}
    >
      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
                borderBottom: `2px solid ${COLORS.BORDER}`,
              }}
            >
              <th
                style={{
                  padding: "16px 24px",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: COLORS.TEXT_SECONDARY,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Usuario
              </th>
              <th
                style={{
                  padding: "16px 24px",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: COLORS.TEXT_SECONDARY,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Rol
              </th>
              <th
                style={{
                  padding: "16px 24px",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: COLORS.TEXT_SECONDARY,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Estado
              </th>
              <th
                style={{
                  padding: "16px 24px",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: COLORS.TEXT_SECONDARY,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Límites
              </th>
              <th
                style={{
                  padding: "16px 24px",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: COLORS.TEXT_SECONDARY,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Último Acceso
              </th>
              <th
                style={{
                  padding: "16px 24px",
                  textAlign: "center",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: COLORS.TEXT_SECONDARY,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.id}
                style={{
                  borderBottom: `1px solid ${COLORS.BORDER}`,
                  transition: ANIMATIONS.TRANSITION_BASE,
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.02)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Usuario */}
                <td style={{ padding: "16px 24px" }}>
                  <div>
                    <div
                      style={{
                        fontWeight: "600",
                        color: COLORS.TEXT_PRIMARY,
                        marginBottom: "4px",
                        fontSize: "0.95rem",
                      }}
                    >
                      {user.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: COLORS.TEXT_SECONDARY,
                      }}
                    >
                      {user.email}
                    </div>
                  </div>
                </td>

                {/* Rol */}
                <td style={{ padding: "16px 24px" }}>
                  {getRoleBadge(user.role)}
                </td>

                {/* Estado */}
                <td style={{ padding: "16px 24px" }}>
                  {getStatusBadge(user.status)}
                </td>

                {/* Límites */}
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ fontSize: "0.85rem" }}>
                    <div
                      style={{
                        color: COLORS.TEXT_SECONDARY,
                        marginBottom: "2px",
                      }}
                    >
                      📊 {user.permissions?.max_requests_day || 0}/día
                    </div>
                    <div style={{ color: COLORS.TEXT_SECONDARY }}>
                      📏 {user.permissions?.max_area_km2 || 0} km²
                    </div>
                  </div>
                </td>

                {/* Último Acceso */}
                <td style={{ padding: "16px 24px" }}>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: COLORS.TEXT_SECONDARY,
                    }}
                  >
                    {formatDate(user.last_login)}
                  </div>
                </td>

                {/* Acciones */}
                <td style={{ padding: "16px 24px", textAlign: "center" }}>
                  <button
                    onClick={() => onEditUser(user)}
                    style={{
                      padding: "8px 16px",
                      background: COLORS.PRIMARY,
                      color: "#ffffff",
                      border: "none",
                      borderRadius: RADIUS.MD,
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: ANIMATIONS.TRANSITION_BASE,
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.opacity = "0.9";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div
          style={{
            padding: "60px 24px",
            textAlign: "center",
            color: COLORS.TEXT_SECONDARY,
          }}
        >
          <Shield size={48} style={{ marginBottom: "16px", opacity: 0.3 }} />
          <p style={{ fontSize: "1.1rem", margin: 0 }}>
            No hay usuarios para mostrar
          </p>
        </div>
      )}
    </div>
  );
}
