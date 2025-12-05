import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, Shield, ChevronDown } from "lucide-react";
import {
  COLORS,
  SHADOWS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
  Z_INDEX,
  ANIMATIONS,
} from "../../styles/designTokens";

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

  // Estilos usando Design Tokens
  const dropdownStyle = {
    position: "fixed",
    top: `${dropdownPosition.top}px`,
    right: `${dropdownPosition.right}px`,
    width: "280px",
    backgroundColor: COLORS.SURFACE,
    borderRadius: RADIUS.LG,
    boxShadow: SHADOWS.XL,
    border: `1px solid ${COLORS.BORDER}`,
    padding: "0",
    zIndex: Z_INDEX.DROPDOWN,
    overflow: "hidden",
    animation: "fadeIn 0.2s ease-out",
  };

  const headerStyle = {
    padding: SPACING[5],
    borderBottom: `1px solid ${COLORS.BACKGROUND_SECONDARY}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
  };

  const avatarLargeStyle = {
    width: "48px",
    height: "48px",
    borderRadius: RADIUS.FULL,
    backgroundColor: COLORS.SECONDARY,
    color: COLORS.SURFACE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    marginBottom: SPACING[3],
    boxShadow: SHADOWS.MD,
  };

  const statsContainerStyle = {
    padding: SPACING[4],
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: SPACING[3],
  };

  const statBoxStyle = {
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    borderRadius: RADIUS.MD,
    padding: SPACING[2],
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  };

  const statLabelStyle = {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING[1],
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const statValueStyle = {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    display: "flex",
    alignItems: "center",
    gap: SPACING[1],
  };

  const logoutButtonStyle = {
    width: "100%",
    padding: SPACING[3],
    border: "none",
    borderTop: `1px solid ${COLORS.BACKGROUND_SECONDARY}`,
    backgroundColor: "transparent",
    color: COLORS.ERROR,
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING[2],
    transition: ANIMATIONS.TRANSITION_BASE,
  };

  const dropdownContent = isOpen && (
    <div ref={menuRef} style={dropdownStyle}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* Header con Avatar Grande */}
      <div style={headerStyle}>
        <div style={avatarLargeStyle}>{getInitials(user.name)}</div>
        <div
          style={{
            fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
            fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
            color: COLORS.TEXT_PRIMARY,
          }}
        >
          {user.name}
        </div>
        <div
          style={{
            fontSize: TYPOGRAPHY.FONT_SIZES.SM,
            color: COLORS.TEXT_SECONDARY,
          }}
        >
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
        onMouseEnter={(e) =>
          (e.target.style.backgroundColor = `${COLORS.ERROR}10`)
        }
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
          backgroundColor: isOpen ? COLORS.BACKGROUND_SECONDARY : "transparent",
          border: `1px solid ${COLORS.BORDER}`,
          borderRadius: RADIUS.LG,
          padding: `${SPACING[1]} ${SPACING[3]}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: SPACING[2],
          transition: ANIMATIONS.TRANSITION_BASE,
          height: "42px",
        }}
        onMouseEnter={(e) => {
          if (!isOpen)
            e.currentTarget.style.backgroundColor = COLORS.BACKGROUND_SECONDARY;
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: RADIUS.FULL,
            backgroundColor: COLORS.SECONDARY,
            color: COLORS.SURFACE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
            fontSize: TYPOGRAPHY.FONT_SIZES.SM,
            boxShadow: SHADOWS.SM,
          }}
        >
          {getInitials(user.name)}
        </div>

        <div className="hidden md:block text-left">
          <div
            style={{
              fontSize: TYPOGRAPHY.FONT_SIZES.SM,
              fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
              color: COLORS.TEXT_PRIMARY,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              lineHeight: 1.2,
            }}
          >
            {user.name}
            {isAdmin && (
              <Shield size={12} color={COLORS.SECONDARY} title="Admin" />
            )}
          </div>
        </div>

        <ChevronDown
          size={16}
          color={COLORS.TEXT_TERTIARY}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: ANIMATIONS.TRANSITION_BASE,
          }}
        />
      </button>

      {dropdownContent && createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default UserMenu;
