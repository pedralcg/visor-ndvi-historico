import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, Shield, ChevronDown } from "lucide-react";

const UserMenu = () => {
  const { user, logout, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Estilos
  const dropdownStyle = {
    position: "fixed",
    top: `${dropdownPosition.top}px`,
    right: `${dropdownPosition.right}px`,
    width: "280px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e7e5e4",
    padding: "0",
    zIndex: 50000,
    overflow: "hidden",
    animation: "fadeIn 0.2s ease-out",
  };

  const headerStyle = {
    padding: "20px",
    borderBottom: "1px solid #f5f5f4",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#fafaf9",
  };

  const avatarLargeStyle = {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#047857",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    fontWeight: "700",
    marginBottom: "12px",
    boxShadow: "0 2px 5px rgba(4, 120, 87, 0.2)",
  };

  const statsContainerStyle = {
    padding: "16px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  };

  const statBoxStyle = {
    backgroundColor: "#f5f5f4",
    borderRadius: "8px",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  };

  const statLabelStyle = {
    fontSize: "0.75rem",
    color: "#78716c",
    marginBottom: "4px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const statValueStyle = {
    fontSize: "0.9rem",
    color: "#1c1917",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const logoutButtonStyle = {
    width: "100%",
    padding: "14px",
    border: "none",
    borderTop: "1px solid #f5f5f4",
    backgroundColor: "transparent",
    color: "#dc2626",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background-color 0.2s",
  };

  const dropdownContent = isOpen && (
    <div ref={menuRef} style={dropdownStyle}>
      {/* Header con Avatar Grande */}
      <div style={headerStyle}>
        <div style={avatarLargeStyle}>{getInitials(user.name)}</div>
        <div style={{ fontSize: "1rem", fontWeight: "700", color: "#1c1917" }}>
          {user.name}
        </div>
        <div style={{ fontSize: "0.85rem", color: "#78716c" }}>
          {user.email}
        </div>
      </div>

      {/* Grid de Estadísticas/Info */}
      <div style={statsContainerStyle}>
        <div style={statBoxStyle}>
          <span style={statLabelStyle}>Rol</span>
          <div style={statValueStyle}>
            {user.role === "admin" && <Shield size={14} />}
            <span style={{ textTransform: "capitalize" }}>{user.role}</span>
          </div>
        </div>
        <div style={statBoxStyle}>
          <span style={statLabelStyle}>Análisis</span>
          <div style={statValueStyle}>{user.metadata?.analyses_count || 0}</div>
        </div>
      </div>

      {/* Botón Logout */}
      <button
        onClick={handleLogout}
        style={logoutButtonStyle}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#fef2f2")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
      >
        <LogOut size={16} />
        Cerrar Sesión
      </button>
    </div>
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: isOpen ? "rgba(28, 25, 23, 0.05)" : "transparent",
          border: "1px solid #e7e5e4",
          borderRadius: "10px",
          padding: "6px 12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          transition: "all 0.2s ease",
          height: "42px",
        }}
        onMouseEnter={(e) => {
          if (!isOpen)
            e.currentTarget.style.backgroundColor = "rgba(28, 25, 23, 0.05)";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-medium text-sm shadow-sm">
          {getInitials(user.name)}
        </div>

        <div className="hidden md:block text-left">
          <div className="text-sm font-bold text-gray-800 flex items-center gap-1 leading-tight">
            {user.name}
            {isAdmin && (
              <Shield size={12} className="text-green-600" title="Admin" />
            )}
          </div>
        </div>

        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {dropdownContent && createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default UserMenu;
