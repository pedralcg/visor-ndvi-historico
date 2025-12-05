import React, { useState, useEffect } from "react";
import { Search, Filter, UserPlus, RefreshCw } from "lucide-react";
import {
  COLORS,
  TYPOGRAPHY,
  SHADOWS,
  RADIUS,
  ANIMATIONS,
} from "../../../styles/designTokens";
import { ndviService } from "../../../services/api";
import UserList from "./UserList";
import UserEditor from "./UserEditor";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 20,
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
      };

      const response = await ndviService.getAdminUsers(params);

      if (response.status === "success" && response.data) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.pages || 1);
      } else {
        setError("Error al cargar usuarios");
      }
    } catch (err) {
      console.error("Error loading users:", err);
      setError(err.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = () => {
    loadUsers();
    handleCloseEditor();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <div style={{ fontFamily: TYPOGRAPHY.FONT_FAMILY }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              fontWeight: "800",
              color: COLORS.TEXT_PRIMARY,
              marginBottom: "8px",
            }}
          >
            Gestión de Usuarios
          </h1>
          <p
            style={{
              margin: 0,
              color: COLORS.TEXT_SECONDARY,
              fontSize: "1rem",
            }}
          >
            {users.length} usuario{users.length !== 1 ? "s" : ""} encontrado
            {users.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          style={{
            padding: "12px 24px",
            background: COLORS.PRIMARY,
            color: "#ffffff",
            border: "none",
            borderRadius: RADIUS.MD,
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: ANIMATIONS.TRANSITION_BASE,
            opacity: loading ? 0.6 : 1,
          }}
          onMouseOver={(e) => {
            if (!loading) e.currentTarget.style.opacity = "0.9";
          }}
          onMouseOut={(e) => {
            if (!loading) e.currentTarget.style.opacity = "1";
          }}
        >
          <RefreshCw
            size={18}
            style={{
              animation: loading ? "spin 1s linear infinite" : "none",
            }}
          />
          Actualizar
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: RADIUS.LG,
          padding: "24px",
          boxShadow: SHADOWS.MEDIUM,
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Search */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: COLORS.TEXT_SECONDARY,
              }}
            >
              Buscar
            </label>
            <div style={{ position: "relative" }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: COLORS.TEXT_SECONDARY,
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Nombre o email..."
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
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
          </div>

          {/* Role Filter */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: COLORS.TEXT_SECONDARY,
              }}
            >
              Rol
            </label>
            <select
              value={roleFilter}
              onChange={handleRoleFilter}
              style={{
                width: "100%",
                padding: "10px 12px",
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
              <option value="">Todos los roles</option>
              <option value="free">Gratuito</option>
              <option value="premium">Premium</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: COLORS.TEXT_SECONDARY,
              }}
            >
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              style={{
                width: "100%",
                padding: "10px 12px",
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
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="suspended">Suspendido</option>
            </select>
          </div>
        </div>
      </div>

      {/* User List */}
      {loading && users.length === 0 ? (
        <div
          style={{
            background: "#ffffff",
            borderRadius: RADIUS.LG,
            padding: "60px",
            boxShadow: SHADOWS.MEDIUM,
            textAlign: "center",
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
          <p style={{ color: COLORS.TEXT_SECONDARY }}>Cargando usuarios...</p>
        </div>
      ) : error ? (
        <div
          style={{
            background: "#ffffff",
            borderRadius: RADIUS.LG,
            padding: "40px",
            boxShadow: SHADOWS.MEDIUM,
            textAlign: "center",
          }}
        >
          <p style={{ color: COLORS.ERROR, marginBottom: "16px" }}>{error}</p>
          <button
            onClick={loadUsers}
            style={{
              padding: "10px 20px",
              background: COLORS.PRIMARY,
              color: "#ffffff",
              border: "none",
              borderRadius: RADIUS.MD,
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Reintentar
          </button>
        </div>
      ) : users.length === 0 ? (
        <div
          style={{
            background: "#ffffff",
            borderRadius: RADIUS.LG,
            padding: "60px",
            boxShadow: SHADOWS.MEDIUM,
            textAlign: "center",
          }}
        >
          <p style={{ color: COLORS.TEXT_SECONDARY, fontSize: "1.1rem" }}>
            No se encontraron usuarios
          </p>
        </div>
      ) : (
        <>
          <UserList
            users={users}
            onEditUser={handleEditUser}
            onRefresh={loadUsers}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "8px 16px",
                  background: page === 1 ? COLORS.BORDER : COLORS.PRIMARY,
                  color: page === 1 ? COLORS.TEXT_SECONDARY : "#ffffff",
                  border: "none",
                  borderRadius: RADIUS.MD,
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                }}
              >
                Anterior
              </button>

              <span
                style={{
                  padding: "8px 16px",
                  color: COLORS.TEXT_SECONDARY,
                  fontSize: "0.9rem",
                }}
              >
                Página {page} de {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: "8px 16px",
                  background:
                    page === totalPages ? COLORS.BORDER : COLORS.PRIMARY,
                  color:
                    page === totalPages ? COLORS.TEXT_SECONDARY : "#ffffff",
                  border: "none",
                  borderRadius: RADIUS.MD,
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                }}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* User Editor Modal */}
      {showEditor && selectedUser && (
        <UserEditor
          user={selectedUser}
          onClose={handleCloseEditor}
          onUserUpdated={handleUserUpdated}
        />
      )}

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
