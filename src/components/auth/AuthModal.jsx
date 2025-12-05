import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../contexts/AuthContext";
import { X, Mail, Lock, User, AlertCircle } from "lucide-react";
import {
  COLORS,
  SHADOWS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
  Z_INDEX,
  ANIMATIONS,
} from "../../styles/designTokens";

const AuthModal = ({ isOpen, onClose, initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const validateForm = () => {
    if (mode === "register") {
      if (!formData.name || formData.name.length < 2) {
        setError("El nombre debe tener al menos 2 caracteres");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden");
        return false;
      }
      if (formData.password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres");
        return false;
      }
    }

    if (!formData.email || !formData.email.includes("@")) {
      setError("Email inválido");
      return false;
    }

    if (!formData.password) {
      setError("La contraseña es requerida");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.name);
      }
      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        (mode === "login" ? "Error al iniciar sesión" : "Error al registrarse");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setFormData({
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
    });
  };

  // Estilos usando Design Tokens
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.OVERLAY,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: Z_INDEX.MODAL,
    padding: SPACING[5],
    backdropFilter: "blur(5px)",
  };

  const modalStyle = {
    backgroundColor: COLORS.SURFACE,
    borderRadius: RADIUS["2XL"],
    width: "100%",
    maxWidth: "420px",
    position: "relative",
    boxShadow: SHADOWS["2XL"],
    maxHeight: "calc(100vh - 40px)",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    margin: SPACING[2],
    animation: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  const inputContainerStyle = {
    marginBottom: SPACING[4],
  };

  const labelStyle = {
    display: "block",
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    color: COLORS.TEXT_SECONDARY,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: SPACING[1],
    marginLeft: SPACING[1],
  };

  const inputWrapperStyle = {
    position: "relative",
  };

  const iconStyle = {
    position: "absolute",
    left: SPACING[3],
    top: "50%",
    transform: "translateY(-50%)",
    color: COLORS.TEXT_TERTIARY,
    transition: ANIMATIONS.TRANSITION_BASE,
  };

  const inputStyle = {
    width: "100%",
    paddingLeft: SPACING[10],
    paddingRight: SPACING[4],
    paddingTop: SPACING[3],
    paddingBottom: SPACING[3],
    backgroundColor: COLORS.BACKGROUND_SECONDARY,
    border: `1px solid ${COLORS.BORDER}`,
    borderRadius: RADIUS.XL,
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_PRIMARY,
    outline: "none",
    transition: ANIMATIONS.TRANSITION_BASE,
  };

  const buttonStyle = {
    width: "100%",
    padding: `${SPACING[3]} ${SPACING[4]}`,
    backgroundColor: COLORS.SECONDARY,
    color: COLORS.SURFACE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    borderRadius: RADIUS.XL,
    border: "none",
    cursor: "pointer",
    transition: ANIMATIONS.TRANSITION_BASE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING[2],
    boxShadow: SHADOWS.MD,
    marginTop: SPACING[2],
  };

  // Usamos createPortal para renderizar en document.body
  return createPortal(
    <div
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .auth-input:focus {
          background-color: ${COLORS.SURFACE};
          border-color: ${COLORS.SECONDARY};
          box-shadow: 0 0 0 3px ${COLORS.SECONDARY}20;
        }
        .auth-input:focus + svg {
          color: ${COLORS.SECONDARY};
        }
      `}</style>

      <div style={modalStyle}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: SPACING[4],
            right: SPACING[4],
            zIndex: 10,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: COLORS.TEXT_TERTIARY,
            padding: SPACING[2],
            borderRadius: RADIUS.FULL,
            transition: ANIMATIONS.TRANSITION_BASE,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.BACKGROUND_SECONDARY;
            e.currentTarget.style.color = COLORS.TEXT_PRIMARY;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = COLORS.TEXT_TERTIARY;
          }}
        >
          <X size={20} />
        </button>

        <div
          style={{
            padding: `${SPACING[10]} ${SPACING[10]} ${SPACING[4]}`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: `${COLORS.SECONDARY}15`,
              borderRadius: RADIUS.FULL,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              marginBottom: SPACING[4],
            }}
          >
            {mode === "login" ? (
              <User color={COLORS.SECONDARY} size={24} />
            ) : (
              <Mail color={COLORS.SECONDARY} size={24} />
            )}
          </div>
          <h2
            style={{
              fontSize: TYPOGRAPHY.FONT_SIZES["2XL"],
              fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
              color: COLORS.TEXT_PRIMARY,
              marginBottom: SPACING[2],
            }}
          >
            {mode === "login" ? "Bienvenido de nuevo" : "Crear cuenta"}
          </h2>
          <p
            style={{
              fontSize: TYPOGRAPHY.FONT_SIZES.SM,
              color: COLORS.TEXT_SECONDARY,
            }}
          >
            {mode === "login"
              ? "Ingresa tus credenciales para acceder"
              : "Registrate para comenzar a analizar datos"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            padding: `${SPACING[4]} ${SPACING[10]} ${SPACING[10]}`,
          }}
        >
          {error && (
            <div
              style={{
                marginBottom: SPACING[4],
                padding: SPACING[3],
                backgroundColor: `${COLORS.ERROR}10`,
                border: `1px solid ${COLORS.ERROR}30`,
                borderRadius: RADIUS.XL,
                display: "flex",
                alignItems: "start",
                gap: SPACING[3],
                fontSize: TYPOGRAPHY.FONT_SIZES.SM,
              }}
            >
              <AlertCircle
                size={18}
                color={COLORS.ERROR}
                style={{ marginTop: "2px", flexShrink: 0 }}
              />
              <p style={{ color: COLORS.ERROR, margin: 0 }}>{error}</p>
            </div>
          )}

          {mode === "register" && (
            <div style={inputContainerStyle}>
              <label style={labelStyle}>Nombre completo</label>
              <div style={inputWrapperStyle}>
                <User size={18} style={iconStyle} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={inputStyle}
                  className="auth-input"
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </div>
            </div>
          )}

          <div style={inputContainerStyle}>
            <label style={labelStyle}>Email</label>
            <div style={inputWrapperStyle}>
              <Mail size={18} style={iconStyle} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
                className="auth-input"
                placeholder="nombre@ejemplo.com"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: SPACING[6] }}>
            <label style={labelStyle}>Contraseña</label>
            <div style={inputWrapperStyle}>
              <Lock size={18} style={iconStyle} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={inputStyle}
                className="auth-input"
                placeholder="••••••••"
                required
              />
            </div>
            {mode === "register" && (
              <p
                style={{
                  marginTop: SPACING[1],
                  fontSize: TYPOGRAPHY.FONT_SIZES.XS,
                  color: COLORS.TEXT_TERTIARY,
                  marginLeft: SPACING[1],
                }}
              >
                Mínimo 8 caracteres
              </p>
            )}
          </div>

          {mode === "register" && (
            <div style={{ marginBottom: SPACING[6] }}>
              <label style={labelStyle}>Confirmar contraseña</label>
              <div style={inputWrapperStyle}>
                <Lock size={18} style={iconStyle} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={inputStyle}
                  className="auth-input"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = SHADOWS.LG;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = SHADOWS.MD;
              }
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span>Procesando...</span>
              </>
            ) : (
              <span>
                {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
              </span>
            )}
          </button>

          <div style={{ marginTop: SPACING[6], textAlign: "center" }}>
            <p
              style={{
                fontSize: TYPOGRAPHY.FONT_SIZES.SM,
                color: COLORS.TEXT_SECONDARY,
              }}
            >
              {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button
                type="button"
                onClick={switchMode}
                style={{
                  background: "none",
                  border: "none",
                  color: COLORS.SECONDARY,
                  fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
                  cursor: "pointer",
                  padding: 0,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.textDecoration = "underline")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.textDecoration = "none")
                }
              >
                {mode === "login" ? "Regístrate gratis" : "Inicia sesión"}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;
