// components/ContactoApp.jsx - Formulario de contacto con EmailJS

import React, { useState } from "react";
import {
  Mail,
  User,
  MessageSquare,
  Send,
  CheckCircle,
  ArrowLeft,
  MapPin,
  Phone,
  Github,
  Linkedin,
  AlertCircle,
} from "lucide-react";
import {
  COLORS,
  SHADOWS,
  ANIMATIONS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
} from "../styles/designTokens";
import emailjs from "@emailjs/browser";

// ⚙️ CONFIGURACIÓN DE EMAILJS
const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.REACT_APP_EMAILJS_SERVICE_ID,
  TEMPLATE_ID: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
  PUBLIC_KEY: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
};

export default function ContactoApp({ setCurrentApp }) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    if (!formData.asunto.trim()) newErrors.asunto = "El asunto es requerido";
    if (!formData.mensaje.trim()) newErrors.mensaje = "El mensaje es requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(false);

    try {
      // Enviar email usando EmailJS
      const templateParams = {
        from_name: formData.nombre,
        from_email: formData.email,
        to_email: "pedralcg.dev@gmail.com",
        subject: formData.asunto,
        message: formData.mensaje,
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      console.log("Email enviado exitosamente:", response);

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ nombre: "", email: "", asunto: "", mensaje: "" });

      // Resetear mensaje de éxito después de 5 segundos
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error("Error al enviar email:", error);
      setIsSubmitting(false);
      setSubmitError(true);

      // Resetear mensaje de error después de 5 segundos
      setTimeout(() => setSubmitError(false), 5000);
    }
  };

  const containerStyle = {
    flex: 1,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: `${SPACING[10]} ${SPACING[5]}`,
    overflow: "auto",
  };

  const contentWrapperStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: SPACING[10],
    maxWidth: "1200px",
    width: "100%",
    animation: "fadeInUp 0.6s ease-out",
  };

  const cardStyle = {
    background: COLORS.SURFACE,
    borderRadius: RADIUS.LG,
    padding: SPACING[10],
    boxShadow: SHADOWS.DEFAULT,
    border: `1px solid ${COLORS.BORDER}`,
  };

  const headerStyle = {
    marginBottom: SPACING[8],
  };

  const titleStyle = {
    fontSize: TYPOGRAPHY.FONT_SIZES["3XL"],
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.EXTRABOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING[2],
    display: "flex",
    alignItems: "center",
    gap: SPACING[3],
  };

  const subtitleStyle = {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.RELAXED,
  };

  const formGroupStyle = {
    marginBottom: SPACING[5],
  };

  const labelStyle = {
    display: "block",
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING[2],
  };

  const inputStyle = {
    width: "100%",
    padding: `${SPACING[3]} ${SPACING[3]}`,
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    border: `1px solid ${COLORS.BORDER}`,
    borderRadius: RADIUS.MD,
    background: COLORS.SURFACE,
    color: COLORS.TEXT_PRIMARY,
    transition: ANIMATIONS.TRANSITION_BASE,
    outline: "none",
    boxSizing: "border-box",
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: "120px",
    resize: "vertical",
    fontFamily: "inherit",
  };

  const errorStyle = {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.ERROR,
    marginTop: SPACING[1],
  };

  const submitButtonStyle = {
    width: "100%",
    padding: `${SPACING[3]} ${SPACING[6]}`,
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    background: submitSuccess ? COLORS.SUCCESS : COLORS.PRIMARY,
    color: COLORS.SURFACE,
    border: "none",
    borderRadius: RADIUS.MD,
    cursor: isSubmitting ? "not-allowed" : "pointer",
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING[2],
    transition: ANIMATIONS.TRANSITION_BASE,
    boxShadow: SHADOWS.MD,
    marginTop: SPACING[2],
  };

  const infoCardStyle = {
    background: COLORS.BACKGROUND_SECONDARY,
    padding: SPACING[5],
    borderRadius: RADIUS.MD,
    border: `1px solid ${COLORS.BORDER}`,
    marginBottom: SPACING[5],
  };

  const infoItemStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: SPACING[4],
    marginBottom: SPACING[5],
    padding: SPACING[4],
    background: COLORS.SURFACE,
    borderRadius: RADIUS.MD,
    border: `1px solid ${COLORS.BORDER}`,
  };

  const socialLinksStyle = {
    display: "flex",
    gap: SPACING[4],
    marginTop: SPACING[6],
  };

  const socialButtonStyle = {
    width: "45px",
    height: "45px",
    borderRadius: RADIUS.FULL,
    border: `1px solid ${COLORS.BORDER}`,
    background: COLORS.SURFACE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: ANIMATIONS.TRANSITION_BASE,
  };

  const backButtonStyle = {
    padding: `${SPACING[3]} ${SPACING[5]}`,
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    background: "transparent",
    color: COLORS.TEXT_SECONDARY,
    border: `1px solid ${COLORS.BORDER}`,
    borderRadius: RADIUS.MD,
    cursor: "pointer",
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING[2],
    transition: ANIMATIONS.TRANSITION_BASE,
    marginTop: SPACING[5],
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        @media (max-width: 968px) {
          .content-wrapper {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={containerStyle}>
        <div style={contentWrapperStyle} className="content-wrapper">
          {/* Columna Izquierda - Formulario */}
          <div style={cardStyle}>
            <div style={headerStyle}>
              <h2 style={titleStyle}>
                <Mail size={32} color="#1d4ed8" />
                Contáctanos
              </h2>
              <p style={subtitleStyle}>
                ¿Tienes alguna pregunta sobre nuestros servicios geoespaciales?
                Completa el formulario y te responderemos a la brevedad.
              </p>
            </div>

            {submitSuccess && (
              <div
                style={{
                  background: "rgba(4, 120, 87, 0.08)",
                  border: "1px solid rgba(4, 120, 87, 0.25)",
                  borderRadius: RADIUS.MD,
                  padding: "15px",
                  marginBottom: "25px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#047857",
                  fontWeight: "600",
                }}
              >
                <CheckCircle size={20} />
                ¡Mensaje enviado con éxito! Te contactaremos pronto.
              </div>
            )}

            {submitError && (
              <div
                style={{
                  background: "rgba(220, 38, 38, 0.08)",
                  border: "1px solid rgba(220, 38, 38, 0.25)",
                  borderRadius: RADIUS.MD,
                  padding: "15px",
                  marginBottom: "25px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#dc2626",
                  fontWeight: "600",
                }}
              >
                <AlertCircle size={20} />
                Error al enviar el mensaje. Por favor, intenta nuevamente.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  <User
                    size={16}
                    style={{ display: "inline", marginRight: "5px" }}
                  />
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    borderColor: errors.nombre ? "#dc2626" : "#e7e5e4",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#047857")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.nombre
                      ? "#dc2626"
                      : "#e7e5e4")
                  }
                  placeholder="Tu nombre"
                />
                {errors.nombre && <div style={errorStyle}>{errors.nombre}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  <Mail
                    size={16}
                    style={{ display: "inline", marginRight: "5px" }}
                  />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    borderColor: errors.email ? "#dc2626" : "#e7e5e4",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#047857")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.email
                      ? "#dc2626"
                      : "#e7e5e4")
                  }
                  placeholder="tu@email.com"
                />
                {errors.email && <div style={errorStyle}>{errors.email}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  <MessageSquare
                    size={16}
                    style={{ display: "inline", marginRight: "5px" }}
                  />
                  Asunto
                </label>
                <input
                  type="text"
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    borderColor: errors.asunto ? "#dc2626" : "#e7e5e4",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#047857")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.asunto
                      ? "#dc2626"
                      : "#e7e5e4")
                  }
                  placeholder="¿En qué podemos ayudarte?"
                />
                {errors.asunto && <div style={errorStyle}>{errors.asunto}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Mensaje</label>
                <textarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  style={{
                    ...textareaStyle,
                    borderColor: errors.mensaje ? "#dc2626" : "#e7e5e4",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#047857")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.mensaje
                      ? "#dc2626"
                      : "#e7e5e4")
                  }
                  placeholder="Escribe tu mensaje aquí..."
                />
                {errors.mensaje && (
                  <div style={errorStyle}>{errors.mensaje}</div>
                )}
              </div>

              <button
                type="submit"
                style={submitButtonStyle}
                disabled={isSubmitting}
                onMouseEnter={(e) => {
                  if (!isSubmitting && !submitSuccess) {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 14px rgba(29, 78, 216, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = SHADOWS.BUTTON;
                }}
              >
                {isSubmitting ? (
                  <>
                    <Send
                      size={20}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    Enviando...
                  </>
                ) : submitSuccess ? (
                  <>
                    <CheckCircle size={20} />
                    Mensaje Enviado
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Enviar Mensaje
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Columna Derecha - Información */}
          <div>
            <div style={cardStyle}>
              <div style={headerStyle}>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "#1c1917",
                    marginBottom: "15px",
                  }}
                >
                  Información de Contacto
                </h3>
                <p style={subtitleStyle}>
                  Estamos aquí para ayudarte con tus proyectos de análisis
                  geoespacial y monitoreo ambiental.
                </p>
              </div>

              <div style={infoItemStyle}>
                <div
                  style={{
                    background: "rgba(4, 120, 87, 0.1)",
                    padding: "12px",
                    borderRadius: RADIUS.MD,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={24} color="#047857" />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: "700",
                      color: "#1c1917",
                      marginBottom: "5px",
                    }}
                  >
                    Ubicación
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#57534e" }}>
                    Mula, Murcia, España
                  </div>
                </div>
              </div>

              <div style={infoItemStyle}>
                <div
                  style={{
                    background: "rgba(29, 78, 216, 0.1)",
                    padding: "12px",
                    borderRadius: RADIUS.MD,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Mail size={24} color="#1d4ed8" />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: "700",
                      color: "#1c1917",
                      marginBottom: "5px",
                    }}
                  >
                    Email
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#57534e" }}>
                    pedralcg.dev@gmail.com
                  </div>
                </div>
              </div>

              <div style={infoItemStyle}>
                <div
                  style={{
                    background: "rgba(124, 58, 237, 0.1)",
                    padding: "12px",
                    borderRadius: RADIUS.MD,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Phone size={24} color="#7c3aed" />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: "700",
                      color: "#1c1917",
                      marginBottom: "5px",
                    }}
                  >
                    Teléfono
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#57534e" }}>
                    +34 XXX XXX XXX
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: "30px",
                  paddingTop: "25px",
                  borderTop: "1px solid #e7e5e4",
                }}
              >
                <div
                  style={{
                    fontWeight: "700",
                    color: "#1c1917",
                    marginBottom: "15px",
                  }}
                >
                  Síguenos
                </div>
                <div style={socialLinksStyle}>
                  <button
                    style={socialButtonStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(29, 78, 216, 0.1)";
                      e.currentTarget.style.borderColor = "#1d4ed8";
                      e.currentTarget.style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.borderColor = "#e7e5e4";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    onClick={() => window.open("https://github.com", "_blank")}
                  >
                    <Github size={20} color="#1c1917" />
                  </button>
                  <button
                    style={socialButtonStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(29, 78, 216, 0.1)";
                      e.currentTarget.style.borderColor = "#1d4ed8";
                      e.currentTarget.style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.borderColor = "#e7e5e4";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    onClick={() =>
                      window.open("https://linkedin.com", "_blank")
                    }
                  >
                    <Linkedin size={20} color="#1c1917" />
                  </button>
                </div>
              </div>
            </div>

            <button
              style={backButtonStyle}
              onClick={() => setCurrentApp("home")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(28, 25, 23, 0.05)";
                e.currentTarget.style.borderColor = "#57534e";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "#e7e5e4";
              }}
            >
              <ArrowLeft size={18} />
              Volver a Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
