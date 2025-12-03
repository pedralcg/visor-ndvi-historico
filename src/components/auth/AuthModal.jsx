import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../contexts/AuthContext";
import { X, Mail, Lock, User, AlertCircle } from "lucide-react";

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

  // Estilos inline para el Portal (garantiza que funcione fuera del header)
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "20px",
    backdropFilter: "blur(5px)",
  };

  const modalStyle = {
    backgroundColor: "white",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "420px",
    position: "relative",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    maxHeight: "calc(100vh - 40px)",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    margin: "8px",
  };

  // Usamos createPortal para renderizar en document.body
  return createPortal(
    <div
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={modalStyle}
        className="animate-in fade-in zoom-in duration-300"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 10,
          }}
        >
          <X size={20} />
        </button>

        <div
          className="px-10 pt-10 pb-4 text-center"
          style={{
            paddingLeft: "40px",
            paddingRight: "40px",
            paddingTop: "40px",
            paddingBottom: "16px",
          }}
        >
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            {mode === "login" ? (
              <User className="text-green-600" size={24} />
            ) : (
              <Mail className="text-green-600" size={24} />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === "login" ? "Bienvenido de nuevo" : "Crear cuenta"}
          </h2>
          <p className="text-sm text-gray-500">
            {mode === "login"
              ? "Ingresa tus credenciales para acceder"
              : "Registrate para comenzar a analizar datos"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-10 pb-10 pt-4"
          style={{
            paddingLeft: "40px",
            paddingRight: "40px",
            paddingBottom: "40px",
            paddingTop: "16px",
          }}
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle
                size={18}
                className="text-red-500 mt-0.5 flex-shrink-0"
              />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {mode === "register" && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
                Nombre completo
              </label>
              <div className="relative group">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors"
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-gray-800 placeholder-gray-400"
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
              Email
            </label>
            <div className="relative group">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-gray-800 placeholder-gray-400"
                placeholder="nombre@ejemplo.com"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
              Contraseña
            </label>
            <div className="relative group">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors"
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-gray-800 placeholder-gray-400"
                placeholder="••••••••"
                required
              />
            </div>
            {mode === "register" && (
              <p className="mt-1.5 text-xs text-gray-400 ml-1">
                Mínimo 8 caracteres
              </p>
            )}
          </div>

          {mode === "register" && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
                Confirmar contraseña
              </label>
              <div className="relative group">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-gray-800 placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
            style={{ backgroundColor: "#16a34a", color: "white" }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Procesando...</span>
              </>
            ) : (
              <span>
                {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
              </span>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button
                type="button"
                onClick={switchMode}
                className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-all"
                style={{ color: "#16a34a" }}
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
