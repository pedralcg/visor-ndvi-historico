import React, { useState } from "react";
import { X, Save, User, Shield, AlertTriangle } from "lucide-react";
import {
  COLORS,
  TYPOGRAPHY,
  SHADOWS,
  RADIUS,
  ANIMATIONS,
} from "../../../styles/designTokens";
import { ndviService } from "../../../services/api";
import PermissionsEditor from "./PermissionsEditor";

export default function UserEditor({ user, onClose, onUserUpdated }) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    role: user.role || "free",
    status: user.status || "active",
  });
  const [permissions, setPermissions] = useState(user.permissions || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData((prev) => ({ ...prev, role: newRole }));

    // Actualizar permisos según el rol
    const rolePermissions = {
      free: {
        ndvi_app: true,
        change_detection: false,
        timeseries: false,
        threshold_calculator: true,
        threshold_analysis: false,
        compositor: false,
        export_data: true,
        save_profiles: true,
        api_access: false,
        max_area_km2: 50,
        max_requests_day: 5,
      },
      premium: {
        ndvi_app: true,
        change_detection: true,
        timeseries: true,
        threshold_calculator: true,
        threshold_analysis: true,
        compositor: true,
        export_data: true,
        save_profiles: true,
        api_access: true,
        max_area_km2: 500,
        max_requests_day: 200,
      },
      admin: {
        ndvi_app: true,
        change_detection: true,
        timeseries: true,
        threshold_calculator: true,
        threshold_analysis: true,
        compositor: true,
        export_data: true,
        save_profiles: true,
        api_access: true,
        max_area_km2: 999999,
        max_requests_day: 999999,
      },
    };

    setPermissions(rolePermissions[newRole] || rolePermissions.free);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Actualizar información básica
      await ndviService.updateAdminUser(user.id, {
        name: formData.name,
        email: formData.email,
        status: formData.status,
      });

      // Actualizar rol si cambió
      if (formData.role !== user.role) {
        await ndviService.updateUserRole(user.id, formData.role);
      }

      // Actualizar permisos personalizados
      await ndviService.updateUserPermissions(user.id, permissions);

      setSuccess(true);
      setTimeout(() => {
        onUserUpdated();
      }, 1000);
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.response?.data?.message || "Error al actualizar usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      setLoading(true);
      setError(null);
      await ndviService.activateUser(user.id);
      setSuccess(true);
      setTimeout(() => {
        onUserUpdated();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Error al activar usuario");
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    const reason = prompt("Motivo de suspensión:");
    if (!reason) return;

    try {
      setLoading(true);
      setError(null);
      await ndviService.suspendUser(user.id, reason);
      setSuccess(true);
      setTimeout(() => {
        onUserUpdated();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Error al suspender usuario");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: RADIUS.LG,
          boxShadow: SHADOWS.LARGE,
          width: "100%",
          maxWidth: "700px",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: `1px solid ${COLORS.BORDER}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: "800",
                color: COLORS.TEXT_PRIMARY,
              }}
            >
              Editar Usuario
            </h2>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "0.9rem",
                color: COLORS.TEXT_SECONDARY,
              }}
            >
              {user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: RADIUS.SM,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: ANIMATIONS.TRANSITION_BASE,
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(0, 0, 0, 0.05)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <X size={24} color={COLORS.TEXT_SECONDARY} />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: `1px solid ${COLORS.BORDER}`,
            background: "#fafaf9",
          }}
        >
          {[
            { id: "info", label: "Información", icon: User },
            { id: "permissions", label: "Permisos", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: "16px",
                  background: isActive ? "#ffffff" : "transparent",
                  border: "none",
                  borderBottom: isActive
                    ? `2px solid ${COLORS.PRIMARY}`
                    : "2px solid transparent",
                  color: isActive ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: isActive ? "600" : "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: ANIMATIONS.TRANSITION_BASE,
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "24px",
          }}
        >
          {/* Messages */}
          {error && (
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(239, 68, 68, 0.1)",
                border: `1px solid rgba(239, 68, 68, 0.3)`,
                borderRadius: RADIUS.MD,
                color: "#dc2626",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(16, 185, 129, 0.1)",
                border: `1px solid rgba(16, 185, 129, 0.3)`,
                borderRadius: RADIUS.MD,
                color: "#059669",
                marginBottom: "20px",
              }}
            >
              ✓ Usuario actualizado correctamente
            </div>
          )}

          {/* Info Tab */}
          {activeTab === "info" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: COLORS.TEXT_PRIMARY,
                  }}
                >
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `1px solid ${COLORS.BORDER}`,
                    borderRadius: RADIUS.MD,
                    fontSize: "0.95rem",
                    fontFamily: TYPOGRAPHY.FONT_FAMILY,
                    outline: "none",
                    transition: ANIMATIONS.TRANSITION_BASE,
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = COLORS.PRIMARY)
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = COLORS.BORDER)
                  }
                />
              </div>

              {/* Email */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: COLORS.TEXT_PRIMARY,
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `1px solid ${COLORS.BORDER}`,
                    borderRadius: RADIUS.MD,
                    fontSize: "0.95rem",
                    fontFamily: TYPOGRAPHY.FONT_FAMILY,
                    outline: "none",
                    transition: ANIMATIONS.TRANSITION_BASE,
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = COLORS.PRIMARY)
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = COLORS.BORDER)
                  }
                />
              </div>

              {/* Role */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: COLORS.TEXT_PRIMARY,
                  }}
                >
                  Rol
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `1px solid ${COLORS.BORDER}`,
                    borderRadius: RADIUS.MD,
                    fontSize: "0.95rem",
                    fontFamily: TYPOGRAPHY.FONT_FAMILY,
                    outline: "none",
                    cursor: "pointer",
                    background: "#ffffff",
                    transition: ANIMATIONS.TRANSITION_BASE,
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = COLORS.PRIMARY)
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = COLORS.BORDER)
                  }
                >
                  <option value="free">Gratuito (5 análisis/día)</option>
                  <option value="premium">Premium (200 análisis/día)</option>
                  <option value="admin">Administrador (sin límites)</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: COLORS.TEXT_PRIMARY,
                  }}
                >
                  Estado
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `1px solid ${COLORS.BORDER}`,
                    borderRadius: RADIUS.MD,
                    fontSize: "0.95rem",
                    fontFamily: TYPOGRAPHY.FONT_FAMILY,
                    outline: "none",
                    cursor: "pointer",
                    background: "#ffffff",
                    transition: ANIMATIONS.TRANSITION_BASE,
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = COLORS.PRIMARY)
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = COLORS.BORDER)
                  }
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </div>

              {/* Quick Actions */}
              <div
                style={{
                  marginTop: "12px",
                  padding: "16px",
                  background: "#fafaf9",
                  borderRadius: RADIUS.MD,
                  border: `1px solid ${COLORS.BORDER}`,
                }}
              >
                <p
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: COLORS.TEXT_SECONDARY,
                  }}
                >
                  Acciones Rápidas
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  {formData.status !== "active" && (
                    <button
                      onClick={handleActivate}
                      disabled={loading}
                      style={{
                        padding: "8px 16px",
                        background: "#10b981",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: RADIUS.MD,
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      Activar
                    </button>
                  )}
                  {formData.status !== "suspended" && (
                    <button
                      onClick={handleSuspend}
                      disabled={loading}
                      style={{
                        padding: "8px 16px",
                        background: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: RADIUS.MD,
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      Suspender
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === "permissions" && (
            <PermissionsEditor
              permissions={permissions}
              onChange={setPermissions}
              role={formData.role}
            />
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "20px 24px",
            borderTop: `1px solid ${COLORS.BORDER}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            background: "#fafaf9",
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: "transparent",
              border: `1px solid ${COLORS.BORDER}`,
              borderRadius: RADIUS.MD,
              color: COLORS.TEXT_SECONDARY,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.9rem",
              fontWeight: "600",
              transition: ANIMATIONS.TRANSITION_BASE,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: loading ? COLORS.BORDER : COLORS.PRIMARY,
              color: "#ffffff",
              border: "none",
              borderRadius: RADIUS.MD,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.9rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: ANIMATIONS.TRANSITION_BASE,
            }}
          >
            <Save size={18} />
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
