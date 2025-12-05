/**
 * useAnalysisHistory Hook
 *
 * Custom hook to add history functionality to analysis apps
 * Provides auto-save, load from history, and UI components
 */

import { useState } from "react";
import { ndviService } from "../services/api";
import historyStorage from "../services/historyStorage";

export const useAnalysisHistory = (appType, isAuthenticated) => {
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  /**
   * Auto-save analysis after successful calculation
   * @param {Object} params - Analysis parameters
   * @param {Object} results - Analysis results
   */
  const autoSaveAnalysis = async (params, results) => {
    if (!isAuthenticated || !results) return;

    try {
      const analysisData = {
        app_type: appType,
        name: `${params.index || appType} - ${
          params.date || new Date().toISOString().slice(0, 10)
        }`,
        parameters: params,
        summary: {
          mean_value: results.statistics?.mean || results.mean_ndvi,
          area_km2: results.geometry?.area_km2 || results.area_km2,
          preview_text: results.statistics?.mean
            ? `Mean: ${results.statistics.mean.toFixed(3)}`
            : "Analysis completed",
        },
      };

      await historyStorage.saveAnalysis(analysisData, ndviService.saveAnalysis);
      console.log("✓ Analysis auto-saved to history");
    } catch (error) {
      console.error("Error auto-saving analysis:", error);
      // Don't throw - analysis succeeded even if save failed
    }
  };

  /**
   * Load analysis from history
   * @param {Object} analysis - History analysis object
   * @param {Function} setters - Object with setter functions for form data
   */
  const loadFromHistory = (analysis, setters) => {
    if (!analysis.parameters) return;

    const { setGeometry, setFormData, setIndex, setDate } = setters;

    // Load geometry
    if (analysis.parameters.geometry && setGeometry) {
      setGeometry(analysis.parameters.geometry);
    }

    // Load date
    if (analysis.parameters.date && setDate) {
      setDate(analysis.parameters.date);
    } else if (analysis.parameters.date && setFormData) {
      setFormData((prev) => ({
        ...prev,
        selectedDate: analysis.parameters.date,
      }));
    }

    // Load index
    if (analysis.parameters.index && setIndex) {
      setIndex(analysis.parameters.index);
    } else if (analysis.parameters.index && setFormData) {
      setFormData((prev) => ({ ...prev, index: analysis.parameters.index }));
    }

    // Load other parameters
    if (analysis.parameters.start_date && setFormData) {
      setFormData((prev) => ({
        ...prev,
        start_date: analysis.parameters.start_date,
      }));
    }
    if (analysis.parameters.end_date && setFormData) {
      setFormData((prev) => ({
        ...prev,
        end_date: analysis.parameters.end_date,
      }));
    }

    console.log("✓ Analysis loaded from history");
  };

  /**
   * Manually save current analysis
   * @param {Object} params - Current analysis parameters
   * @param {Object} results - Current analysis results
   */
  const manualSaveAnalysis = (params, results) => {
    if (!results) {
      alert("No hay análisis para guardar");
      return;
    }
    setShowSaveModal(true);
  };

  return {
    showHistoryPanel,
    setShowHistoryPanel,
    showSaveModal,
    setShowSaveModal,
    autoSaveAnalysis,
    loadFromHistory,
    manualSaveAnalysis,
  };
};

export default useAnalysisHistory;
