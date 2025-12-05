/**
 * HistoryItem Component
 *
 * Individual analysis item in the history list
 * - Displays analysis name, date, app type, and summary
 * - Actions: Load, Toggle Favorite, Delete
 */

import React, { useState } from "react";
import { Play, Star, Trash2, Calendar, Tag } from "lucide-react";
import {
  COLORS,
  TYPOGRAPHY,
  SHADOWS,
  RADIUS,
  ANIMATIONS,
} from "../../styles/designTokens";

const HistoryItem = ({ analysis, onLoad, onToggleFavorite, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  // App type labels
  const appLabels = {
    ndvi: "NDVI",
    change_detection: "Detección de Cambio",
    timeseries: "Series Temporales",
    threshold_calculator: "Calc. Umbrales",
    threshold_analysis: "Análisis Umbrales",
    compositor: "Compositor",
    multiindex: "Multi-índice",
  };

  // App type colors
  const appColors = {
    ndvi: "#10b981",
    change_detection: "#f59e0b",
    timeseries: "#3b82f6",
    threshold_calculator: "#8b5cf6",
    threshold_analysis: "#ec4899",
    compositor: "#06b6d4",
    multiindex: "#6366f1",
  };

  const appLabel = appLabels[analysis.app_type] || analysis.app_type;
  const appColor = appColors[analysis.app_type] || COLORS.PRIMARY;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins}min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      style={{
        backgroundColor: COLORS.SURFACE,
        border: `1px solid ${isHovered ? COLORS.PRIMARY : COLORS.BORDER}`,
        borderRadius: RADIUS.LG,
        padding: "16px",
        marginBottom: "12px",
        transition: ANIMATIONS.TRANSITION_BASE,
        cursor: "pointer",
        boxShadow: isHovered ? SHADOWS.MD : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
                fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
                color: COLORS.TEXT_PRIMARY,
                lineHeight: 1.3,
              }}
            >
              {analysis.name}
            </h4>
            {analysis.is_favorite && (
              <Star size={14} fill={COLORS.WARNING} color={COLORS.WARNING} />
            )}
          </div>

          {/* App Type Badge */}
          <div
            style={{
              display: "inline-block",
              padding: "2px 8px",
              backgroundColor: `${appColor}15`,
              color: appColor,
              borderRadius: RADIUS.SM,
              fontSize: TYPOGRAPHY.FONT_SIZES.XS,
              fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
              marginBottom: "8px",
            }}
          >
            {appLabel}
          </div>
        </div>
      </div>

      {/* Summary */}
      {analysis.summary && (
        <div
          style={{
            fontSize: TYPOGRAPHY.FONT_SIZES.SM,
            color: COLORS.TEXT_SECONDARY,
            marginBottom: "12px",
            lineHeight: 1.5,
          }}
        >
          {analysis.summary.preview_text ||
            (analysis.summary.mean_value &&
              `Valor medio: ${analysis.summary.mean_value.toFixed(2)}`) ||
            (analysis.summary.area_km2 &&
              `Área: ${analysis.summary.area_km2.toFixed(2)} km²`)}
        </div>
      )}

      {/* Tags */}
      {analysis.tags && analysis.tags.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "6px",
            marginBottom: "12px",
            flexWrap: "wrap",
          }}
        >
          {analysis.tags.map((tag, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 6px",
                backgroundColor: COLORS.BACKGROUND_SECONDARY,
                borderRadius: RADIUS.SM,
                fontSize: TYPOGRAPHY.FONT_SIZES.XS,
                color: COLORS.TEXT_TERTIARY,
              }}
            >
              <Tag size={10} />
              {tag}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: TYPOGRAPHY.FONT_SIZES.XS,
            color: COLORS.TEXT_TERTIARY,
          }}
        >
          <Calendar size={12} />
          {formatDate(analysis.created_at)}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "4px" }}>
          {/* Load Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLoad();
            }}
            style={{
              padding: "6px 12px",
              backgroundColor: COLORS.PRIMARY,
              color: "#ffffff",
              border: "none",
              borderRadius: RADIUS.MD,
              fontSize: TYPOGRAPHY.FONT_SIZES.XS,
              fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: ANIMATIONS.TRANSITION_BASE,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Play size={12} />
            Cargar
          </button>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            style={{
              padding: "6px",
              backgroundColor: "transparent",
              border: `1px solid ${COLORS.BORDER}`,
              borderRadius: RADIUS.MD,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: ANIMATIONS.TRANSITION_BASE,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                COLORS.BACKGROUND_SECONDARY)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            title={
              analysis.is_favorite
                ? "Quitar de favoritos"
                : "Marcar como favorito"
            }
          >
            <Star
              size={14}
              fill={analysis.is_favorite ? COLORS.WARNING : "none"}
              color={
                analysis.is_favorite ? COLORS.WARNING : COLORS.TEXT_TERTIARY
              }
            />
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{
              padding: "6px",
              backgroundColor: "transparent",
              border: `1px solid ${COLORS.BORDER}`,
              borderRadius: RADIUS.MD,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: ANIMATIONS.TRANSITION_BASE,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${COLORS.ERROR}10`;
              e.currentTarget.style.borderColor = COLORS.ERROR;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = COLORS.BORDER;
            }}
            title="Eliminar análisis"
          >
            <Trash2 size={14} color={COLORS.ERROR} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryItem;
