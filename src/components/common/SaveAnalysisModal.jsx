/**
 * SaveAnalysisModal Component
 *
 * Modal for saving analysis with custom name and options
 * - Input for analysis name
 * - Checkbox for marking as favorite
 * - Optional tags input
 * - Save to both LocalStorage and MongoDB
 */

import React, { useState } from "react";
import { X, Save, Star, Tag } from "lucide-react";
import {
  COLORS,
  TYPOGRAPHY,
  SHADOWS,
  RADIUS,
  ANIMATIONS,
  Z_INDEX,
} from "../../styles/designTokens";
import { ndviService } from "../../services/api";
import historyStorage from "../../services/historyStorage";

const SaveAnalysisModal = ({ isOpen, onClose, analysisData, appType }) => {
  const [name, setName] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      // Generate default name
      const now = new Date();
      const defaultName = `Análisis ${now.toLocaleDateString(
        "es-ES"
      )} ${now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
      setName(defaultName);
      setIsFavorite(false);
      setTags("");
      setError(null);
    }
  }, [isOpen]);

  const handleSave = async () => {
    // Validate
    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Parse tags
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Prepare data
      const dataToSave = {
        app_type: appType,
        name: name.trim(),
        parameters: analysisData.parameters,
        summary: analysisData.summary || {},
        is_favorite: isFavorite,
        tags: tagArray,
      };

      // Save using historyStorage (saves to both local and server)
      await historyStorage.saveAnalysis(dataToSave, ndviService.saveAnalysis);

      // Close modal
      onClose(true); // true indicates success
    } catch (err) {
      console.error("Error saving analysis:", err);
      setError("Error al guardar el análisis. Se guardó localmente.");
      // Don't close modal on error
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: Z_INDEX.MODAL,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          style={{
            backgroundColor: COLORS.SURFACE,
            borderRadius: RADIUS.LG,
            boxShadow: SHADOWS.XL,
            width: "90%",
            maxWidth: "500px",
            maxHeight: "90vh",
            overflow: "auto",
            animation: "scaleIn 0.2s ease-out",
            fontFamily: TYPOGRAPHY.FONT_FAMILY,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px",
              borderBottom: `1px solid ${COLORS.BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: TYPOGRAPHY.FONT_SIZES.XL,
                fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
                color: COLORS.TEXT_PRIMARY,
              }}
            >
              💾 Guardar Análisis
            </h2>
            <button
              onClick={onClose}
              disabled={saving}
              style={{
                background: "none",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                padding: "8px",
                borderRadius: RADIUS.MD,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: ANIMATIONS.TRANSITION_BASE,
                opacity: saving ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!saving)
                  e.currentTarget.style.backgroundColor =
                    COLORS.BACKGROUND_SECONDARY;
              }}
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <X size={24} color={COLORS.TEXT_SECONDARY} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: "24px" }}>
            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: `${COLORS.ERROR}10`,
                  border: `1px solid ${COLORS.ERROR}`,
                  borderRadius: RADIUS.MD,
                  color: COLORS.ERROR,
                  fontSize: TYPOGRAPHY.FONT_SIZES.SM,
                  marginBottom: "20px",
                }}
              >
                {error}
              </div>
            )}

            {/* Name Input */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: TYPOGRAPHY.FONT_SIZES.SM,
                  fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
                  color: COLORS.TEXT_PRIMARY,
                }}
              >
                Nombre del análisis *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Análisis Viñedo Norte - Junio 2024"
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${COLORS.BORDER}`,
                  borderRadius: RADIUS.MD,
                  fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
                  fontFamily: TYPOGRAPHY.FONT_FAMILY,
                  outline: "none",
                  transition: ANIMATIONS.TRANSITION_BASE,
                  opacity: saving ? 0.6 : 1,
                }}
                onFocus={(e) => (e.target.style.borderColor = COLORS.PRIMARY)}
                onBlur={(e) => (e.target.style.borderColor = COLORS.BORDER)}
              />
            </div>

            {/* Favorite Checkbox */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: saving ? "not-allowed" : "pointer",
                  padding: "12px",
                  borderRadius: RADIUS.MD,
                  transition: ANIMATIONS.TRANSITION_BASE,
                  opacity: saving ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!saving)
                    e.currentTarget.style.backgroundColor =
                      COLORS.BACKGROUND_SECONDARY;
                }}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  disabled={saving}
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                />
                <Star
                  size={18}
                  fill={isFavorite ? COLORS.WARNING : "none"}
                  color={isFavorite ? COLORS.WARNING : COLORS.TEXT_TERTIARY}
                />
                <span
                  style={{
                    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
                    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
                    color: COLORS.TEXT_PRIMARY,
                  }}
                >
                  Marcar como favorito
                </span>
              </label>
              <p
                style={{
                  margin: "4px 0 0 46px",
                  fontSize: TYPOGRAPHY.FONT_SIZES.XS,
                  color: COLORS.TEXT_TERTIARY,
                }}
              >
                Los favoritos se guardan permanentemente
              </p>
            </div>

            {/* Tags Input */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "8px",
                  fontSize: TYPOGRAPHY.FONT_SIZES.SM,
                  fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
                  color: COLORS.TEXT_PRIMARY,
                }}
              >
                <Tag size={14} />
                Etiquetas (opcional)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ej: viñedo, verano, 2024 (separadas por comas)"
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${COLORS.BORDER}`,
                  borderRadius: RADIUS.MD,
                  fontSize: TYPOGRAPHY.FONT_SIZES.SM,
                  fontFamily: TYPOGRAPHY.FONT_FAMILY,
                  outline: "none",
                  transition: ANIMATIONS.TRANSITION_BASE,
                  opacity: saving ? 0.6 : 1,
                }}
                onFocus={(e) => (e.target.style.borderColor = COLORS.PRIMARY)}
                onBlur={(e) => (e.target.style.borderColor = COLORS.BORDER)}
              />
            </div>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={onClose}
                disabled={saving}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "transparent",
                  border: `1px solid ${COLORS.BORDER}`,
                  borderRadius: RADIUS.MD,
                  color: COLORS.TEXT_SECONDARY,
                  fontSize: TYPOGRAPHY.FONT_SIZES.SM,
                  fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
                  cursor: saving ? "not-allowed" : "pointer",
                  transition: ANIMATIONS.TRANSITION_BASE,
                  opacity: saving ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!saving)
                    e.currentTarget.style.backgroundColor =
                      COLORS.BACKGROUND_SECONDARY;
                }}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                style={{
                  padding: "12px 24px",
                  backgroundColor:
                    saving || !name.trim() ? COLORS.BORDER : COLORS.PRIMARY,
                  border: "none",
                  borderRadius: RADIUS.MD,
                  color: "#ffffff",
                  fontSize: TYPOGRAPHY.FONT_SIZES.SM,
                  fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
                  cursor: saving || !name.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: ANIMATIONS.TRANSITION_BASE,
                }}
                onMouseEnter={(e) => {
                  if (!saving && name.trim())
                    e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {saving ? (
                  <>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid #ffffff",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default SaveAnalysisModal;
