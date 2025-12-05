/**
 * HistoryPanel Component
 *
 * Sidebar panel for displaying and managing analysis history
 * - Slides in from the right
 * - Lists analyses grouped by date
 * - Search and filters
 * - Load, favorite, and delete actions
 */

import React, { useState, useEffect } from "react";
import { X, Search, Star, Clock, Filter } from "lucide-react";
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
import HistoryItem from "./HistoryItem";

const HistoryPanel = ({ isOpen, onClose, onLoadAnalysis, currentApp }) => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'favorites', 'app'
  const [error, setError] = useState(null);

  // Load analyses when panel opens`r`n  useEffect(() => {`r`n    if (isOpen) {`r`n      loadAnalyses();`r`n    }`r`n    // eslint-disable-next-line react-hooks/exhaustive-deps`r`n  }, [isOpen, filterType]);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = {
        limit: 50,
      };

      if (filterType === "favorites") {
        params.is_favorite = true;
      } else if (filterType === "app" && currentApp) {
        params.app_type = currentApp;
      }

      // Fetch from server
      const response = await ndviService.getHistory(params);

      if (response.status === "success" && response.data?.analyses) {
        setAnalyses(response.data.analyses);

        // Update LocalStorage cache
        historyStorage.syncWithServer(ndviService.getHistory);
      }
    } catch (err) {
      console.error("Error loading analyses:", err);
      setError("Error al cargar el historial");

      // Fallback to LocalStorage
      const localAnalyses = historyStorage.getFromLocal();
      setAnalyses(localAnalyses);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await historyStorage.toggleFavorite(id, ndviService.toggleFavorite);

      // Reload analyses
      loadAnalyses();
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este análisis?")) {
      return;
    }

    try {
      await ndviService.deleteAnalysis(id);
      historyStorage.deleteFromLocal(id);

      // Reload analyses
      loadAnalyses();
    } catch (err) {
      console.error("Error deleting analysis:", err);
      alert("Error al eliminar el análisis");
    }
  };

  // Filter analyses by search term
  const filteredAnalyses = analyses.filter((analysis) => {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    return (
      analysis.name.toLowerCase().includes(term) ||
      analysis.app_type.toLowerCase().includes(term) ||
      analysis.tags?.some((tag) => tag.toLowerCase().includes(term))
    );
  });

  // Group analyses by date
  const groupedAnalyses = groupByDate(filteredAnalyses);

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
          zIndex: Z_INDEX.MODAL - 1,
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "400px",
          maxWidth: "90vw",
          backgroundColor: COLORS.SURFACE,
          boxShadow: SHADOWS.XL,
          zIndex: Z_INDEX.MODAL,
          display: "flex",
          flexDirection: "column",
          animation: "slideInRight 0.3s ease-out",
          fontFamily: TYPOGRAPHY.FONT_FAMILY,
        }}
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
            📊 Historial
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: RADIUS.MD,
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
          >
            <X size={24} color={COLORS.TEXT_SECONDARY} />
          </button>
        </div>

        {/* Search and Filters */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${COLORS.BORDER}`,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search
              size={18}
              color={COLORS.TEXT_TERTIARY}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              placeholder="Buscar análisis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                border: `1px solid ${COLORS.BORDER}`,
                borderRadius: RADIUS.MD,
                fontSize: TYPOGRAPHY.FONT_SIZES.SM,
                fontFamily: TYPOGRAPHY.FONT_FAMILY,
                outline: "none",
                transition: ANIMATIONS.TRANSITION_BASE,
              }}
              onFocus={(e) => (e.target.style.borderColor = COLORS.PRIMARY)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.BORDER)}
            />
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "8px" }}>
            <FilterButton
              active={filterType === "all"}
              onClick={() => setFilterType("all")}
              icon={<Clock size={16} />}
              label="Todos"
            />
            <FilterButton
              active={filterType === "favorites"}
              onClick={() => setFilterType("favorites")}
              icon={<Star size={16} />}
              label="Favoritos"
            />
            {currentApp && (
              <FilterButton
                active={filterType === "app"}
                onClick={() => setFilterType("app")}
                icon={<Filter size={16} />}
                label="Esta app"
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
          }}
        >
          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: COLORS.TEXT_SECONDARY,
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: `3px solid ${COLORS.BORDER}`,
                  borderTop: `3px solid ${COLORS.PRIMARY}`,
                  borderRadius: "50%",
                  margin: "0 auto 16px",
                  animation: "spin 1s linear infinite",
                }}
              />
              Cargando...
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "16px",
                backgroundColor: `${COLORS.ERROR}10`,
                border: `1px solid ${COLORS.ERROR}`,
                borderRadius: RADIUS.MD,
                color: COLORS.ERROR,
                fontSize: TYPOGRAPHY.FONT_SIZES.SM,
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          {!loading && filteredAnalyses.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: COLORS.TEXT_SECONDARY,
              }}
            >
              <p style={{ margin: 0, fontSize: TYPOGRAPHY.FONT_SIZES.BASE }}>
                {searchTerm
                  ? "No se encontraron análisis"
                  : "No hay análisis guardados"}
              </p>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: TYPOGRAPHY.FONT_SIZES.SM,
                }}
              >
                {searchTerm
                  ? "Intenta con otro término de búsqueda"
                  : "Realiza un análisis para empezar"}
              </p>
            </div>
          )}

          {!loading &&
            Object.keys(groupedAnalyses).map((dateGroup) => (
              <div key={dateGroup} style={{ marginBottom: "24px" }}>
                <h3
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
                    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
                    color: COLORS.TEXT_SECONDARY,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {dateGroup}
                </h3>
                {groupedAnalyses[dateGroup].map((analysis) => (
                  <HistoryItem
                    key={analysis.id}
                    analysis={analysis}
                    onLoad={() => {
                      onLoadAnalysis(analysis);
                      onClose();
                    }}
                    onToggleFavorite={() => handleToggleFavorite(analysis.id)}
                    onDelete={() => handleDelete(analysis.id)}
                  />
                ))}
              </div>
            ))}
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
};

// Filter Button Component
const FilterButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    style={{
      padding: "8px 12px",
      border: `1px solid ${active ? COLORS.PRIMARY : COLORS.BORDER}`,
      borderRadius: RADIUS.MD,
      backgroundColor: active ? `${COLORS.PRIMARY}10` : "transparent",
      color: active ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY,
      fontSize: TYPOGRAPHY.FONT_SIZES.SM,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      transition: ANIMATIONS.TRANSITION_BASE,
      fontFamily: TYPOGRAPHY.FONT_FAMILY,
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = COLORS.BACKGROUND_SECONDARY;
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.backgroundColor = "transparent";
      }
    }}
  >
    {icon}
    {label}
  </button>
);

// Helper function to group analyses by date
const groupByDate = (analyses) => {
  const groups = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  analyses.forEach((analysis) => {
    const date = new Date(analysis.created_at);
    let groupKey;

    if (isSameDay(date, today)) {
      groupKey = "Hoy";
    } else if (isSameDay(date, yesterday)) {
      groupKey = "Ayer";
    } else if (isThisWeek(date)) {
      groupKey = "Esta semana";
    } else if (isThisMonth(date)) {
      groupKey = "Este mes";
    } else {
      groupKey = date.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      });
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(analysis);
  });

  return groups;
};

const isSameDay = (date1, date2) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const isThisWeek = (date) => {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  return date >= weekAgo && date < today;
};

const isThisMonth = (date) => {
  const today = new Date();
  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export default HistoryPanel;

