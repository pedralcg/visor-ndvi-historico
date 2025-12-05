import React, { useState } from "react";
import { Users, BarChart3, Settings, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import {
  COLORS,
  TYPOGRAPHY,
  SHADOWS,
  RADIUS,
  ANIMATIONS,
} from "../../styles/designTokens";
import Dashboard from "./dashboard/Dashboard";
import UserManagement from "./users/UserManagement";

export default function AdminPanel({ setCurrentApp }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Verificar que el usuario es admin
  if (!user || user.role !== "admin") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: TYPOGRAPHY.FONT_FAMILY,
          background: "linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)",
        }}
      >
        <div
          style={{
            padding: "40px",
            background: "#ffffff",
            borderRadius: RADIUS.LG,
            boxShadow: SHADOWS.LARGE,
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <h2 style={{ color: COLORS.ERROR, marginBottom: "16px" }}>
            Acceso Denegado
          </h2>
          <p style={{ color: COLORS.TEXT_SECONDARY, marginBottom: "24px" }}>
            Solo los administradores pueden acceder a este panel.
          </p>
          <button
            onClick={() => setCurrentApp(null)}
            style={{
              padding: "12px 24px",
              background: COLORS.PRIMARY,
              color: "#ffffff",
              border: "none",
              borderRadius: RADIUS.MD,
              cursor: "pointer",
              fontWeight: "600",
              transition: ANIMATIONS.TRANSITION_BASE,
            }}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "Usuarios", icon: Users },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    setCurrentApp(null);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        fontFamily: TYPOGRAPHY.FONT_FAMILY,
        background: "linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? "280px" : "80px",
          background: "linear-gradient(180deg, #1c1917 0%, #292524 100%)",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          transition: ANIMATIONS.TRANSITION_BASE,
          boxShadow: SHADOWS.LARGE,
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {sidebarOpen && (
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Admin Panel
              </h1>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "0.75rem",
                  color: "rgba(255, 255, 255, 0.6)",
                }}
              >
                NDVI Viewer
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              padding: "8px",
              borderRadius: RADIUS.SM,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: ANIMATIONS.TRANSITION_BASE,
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: "100%",
                  padding: sidebarOpen ? "14px 24px" : "14px",
                  background: isActive
                    ? "rgba(59, 130, 246, 0.15)"
                    : "transparent",
                  border: "none",
                  borderLeft: isActive
                    ? "3px solid #3b82f6"
                    : "3px solid transparent",
                  color: isActive ? "#3b82f6" : "rgba(255, 255, 255, 0.7)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "0.95rem",
                  fontWeight: isActive ? "600" : "500",
                  transition: ANIMATIONS.TRANSITION_BASE,
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.color = "#ffffff";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                  }
                }}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {sidebarOpen && (
            <div
              style={{
                padding: "12px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: RADIUS.MD,
                marginBottom: "12px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "#ffffff",
                }}
              >
                {user.name}
              </p>
              <p
                style={{
                  margin: "2px 0 0 0",
                  fontSize: "0.75rem",
                  color: "rgba(255, 255, 255, 0.6)",
                }}
              >
                {user.email}
              </p>
              <span
                style={{
                  display: "inline-block",
                  marginTop: "8px",
                  padding: "4px 8px",
                  background: "rgba(59, 130, 246, 0.2)",
                  color: "#3b82f6",
                  fontSize: "0.7rem",
                  fontWeight: "600",
                  borderRadius: RADIUS.SM,
                  textTransform: "uppercase",
                }}
              >
                Admin
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(220, 38, 38, 0.1)",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              borderRadius: RADIUS.MD,
              color: "#ef4444",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              gap: "8px",
              fontSize: "0.9rem",
              fontWeight: "600",
              transition: ANIMATIONS.TRANSITION_BASE,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(220, 38, 38, 0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(220, 38, 38, 0.1)";
            }}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>

          {sidebarOpen && (
            <button
              onClick={() => setCurrentApp(null)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "8px",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: RADIUS.MD,
                color: "rgba(255, 255, 255, 0.7)",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: "500",
                transition: ANIMATIONS.TRANSITION_BASE,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
              }}
            >
              ← Volver al Visor
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: "32px",
          background: "transparent",
        }}
      >
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "settings" && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: RADIUS.LG,
              padding: "40px",
              boxShadow: SHADOWS.MEDIUM,
              textAlign: "center",
            }}
          >
            <Settings
              size={48}
              color={COLORS.TEXT_SECONDARY}
              style={{ marginBottom: "16px" }}
            />
            <h2 style={{ color: COLORS.TEXT_PRIMARY, marginBottom: "8px" }}>
              Configuración
            </h2>
            <p style={{ color: COLORS.TEXT_SECONDARY }}>
              Esta sección estará disponible próximamente.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
