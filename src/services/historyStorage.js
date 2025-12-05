/**
 * History Storage Manager
 *
 * Manages analysis history in LocalStorage with sync to server
 * - Keeps last 10 analyses in LocalStorage
 * - Syncs with MongoDB backend
 * - Provides offline capability
 */

const STORAGE_KEY = "analysis_history";
const MAX_LOCAL_ITEMS = 10;

/**
 * Save analysis to LocalStorage
 * @param {Object} analysis - Analysis object to save
 */
export const saveToLocal = (analysis) => {
  try {
    const history = getFromLocal();

    // Add new analysis at the beginning
    history.unshift({
      ...analysis,
      local_id: `local_${Date.now()}`,
      synced: !!analysis.id, // True if has server ID
      saved_at: new Date().toISOString(),
    });

    // Keep only last 10
    const trimmed = history.slice(0, MAX_LOCAL_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

    console.log("✓ Analysis saved to LocalStorage");
    return true;
  } catch (error) {
    console.error("Error saving to LocalStorage:", error);
    return false;
  }
};

/**
 * Get all analyses from LocalStorage
 * @returns {Array} Array of analysis objects
 */
export const getFromLocal = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading from LocalStorage:", error);
    return [];
  }
};

/**
 * Get analysis by ID from LocalStorage
 * @param {string} id - Analysis ID (server or local)
 * @returns {Object|null} Analysis object or null
 */
export const getByIdFromLocal = (id) => {
  try {
    const history = getFromLocal();
    return history.find((a) => a.id === id || a.local_id === id) || null;
  } catch (error) {
    console.error("Error getting analysis from LocalStorage:", error);
    return null;
  }
};

/**
 * Update analysis in LocalStorage
 * @param {string} id - Analysis ID
 * @param {Object} updates - Fields to update
 */
export const updateInLocal = (id, updates) => {
  try {
    const history = getFromLocal();
    const index = history.findIndex((a) => a.id === id || a.local_id === id);

    if (index !== -1) {
      history[index] = { ...history[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      console.log("✓ Analysis updated in LocalStorage");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error updating in LocalStorage:", error);
    return false;
  }
};

/**
 * Delete analysis from LocalStorage
 * @param {string} id - Analysis ID
 */
export const deleteFromLocal = (id) => {
  try {
    const history = getFromLocal();
    const filtered = history.filter((a) => a.id !== id && a.local_id !== id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log("✓ Analysis deleted from LocalStorage");
    return true;
  } catch (error) {
    console.error("Error deleting from LocalStorage:", error);
    return false;
  }
};

/**
 * Sync LocalStorage with server
 * Fetches latest 10 analyses from server and updates local cache
 * @param {Function} getHistoryFn - Function to fetch history from server
 */
export const syncWithServer = async (getHistoryFn) => {
  try {
    console.log("🔄 Syncing with server...");

    // Fetch latest 10 from server
    const response = await getHistoryFn({ limit: MAX_LOCAL_ITEMS });

    if (response.status === "success" && response.data?.analyses) {
      const serverAnalyses = response.data.analyses.map((a) => ({
        ...a,
        synced: true,
        saved_at: a.created_at,
      }));

      // Replace local storage with server data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serverAnalyses));

      console.log(`✓ Synced ${serverAnalyses.length} analyses from server`);
      return serverAnalyses;
    }

    return [];
  } catch (error) {
    console.error("Error syncing with server:", error);
    // Return local data if sync fails
    return getFromLocal();
  }
};

/**
 * Clear all analyses from LocalStorage
 */
export const clearLocal = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("✓ LocalStorage cleared");
    return true;
  } catch (error) {
    console.error("Error clearing LocalStorage:", error);
    return false;
  }
};

/**
 * Get storage info
 * @returns {Object} Storage statistics
 */
export const getStorageInfo = () => {
  try {
    const history = getFromLocal();
    const data = localStorage.getItem(STORAGE_KEY);
    const sizeKB = data ? (new Blob([data]).size / 1024).toFixed(2) : 0;

    return {
      count: history.length,
      maxCount: MAX_LOCAL_ITEMS,
      sizeKB: parseFloat(sizeKB),
      synced: history.filter((a) => a.synced).length,
      unsynced: history.filter((a) => !a.synced).length,
    };
  } catch (error) {
    console.error("Error getting storage info:", error);
    return {
      count: 0,
      maxCount: MAX_LOCAL_ITEMS,
      sizeKB: 0,
      synced: 0,
      unsynced: 0,
    };
  }
};

/**
 * Save analysis to both LocalStorage and Server
 * @param {Object} analysisData - Analysis data to save
 * @param {Function} saveToServerFn - Function to save to server
 * @returns {Promise<Object>} Saved analysis with server ID
 */
export const saveAnalysis = async (analysisData, saveToServerFn) => {
  try {
    // Save to LocalStorage immediately (optimistic update)
    saveToLocal(analysisData);

    // Save to server in background
    const response = await saveToServerFn(analysisData);

    if (response.status === "success" && response.data) {
      // Update local with server ID
      updateInLocal(analysisData.local_id || analysisData.id, {
        id: response.data.id,
        synced: true,
      });

      return response.data;
    }

    return null;
  } catch (error) {
    console.error("Error saving analysis:", error);
    // Analysis is still in LocalStorage even if server save fails
    throw error;
  }
};

/**
 * Toggle favorite status (both local and server)
 * @param {string} id - Analysis ID
 * @param {Function} toggleServerFn - Function to toggle on server
 */
export const toggleFavorite = async (id, toggleServerFn) => {
  // Get current analysis before try block
  const analysis = getByIdFromLocal(id);

  try {
    if (analysis) {
      // Update local immediately
      updateInLocal(id, {
        is_favorite: !analysis.is_favorite,
      });
    }

    // Update server
    const response = await toggleServerFn(id);

    if (response.status === "success" && response.data) {
      // Sync with server response
      updateInLocal(id, {
        is_favorite: response.data.is_favorite,
      });

      return response.data;
    }

    return null;
  } catch (error) {
    console.error("Error toggling favorite:", error);
    // Revert local change if server update fails
    if (analysis) {
      updateInLocal(id, {
        is_favorite: analysis.is_favorite,
      });
    }
    throw error;
  }
};

const historyStorage = {
  saveToLocal,
  getFromLocal,
  getByIdFromLocal,
  updateInLocal,
  deleteFromLocal,
  syncWithServer,
  clearLocal,
  getStorageInfo,
  saveAnalysis,
  toggleFavorite,
};

export default historyStorage;
