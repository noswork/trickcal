/**
 * Trickcal 統一的 localStorage 鍵名管理
 * 
 * 所有 localStorage 的鍵名都應該使用下劃線命名法
 * 格式：trickcal_[模組]_[項目]
 */

const TRICKCAL_STORAGE_KEYS = {
  // ==================== 全局設置 ====================
  theme: 'trickcal_theme',                    // 主題設置（light/dark）
  language: 'trickcal_language',              // 語言設置（zh-TW, en, etc.）
  
  // ==================== Board 模組 ====================
  board: {
    progress: 'trickcal_board_progress',      // 用戶進度（擁有的角色、啟動的格子）
    data: 'trickcal_board_data',              // 角色數據緩存
    dataTimestamp: 'trickcal_board_data_timestamp', // 數據時間戳
  },
  
  // ==================== Sweep 模組 ====================
  sweep: {
    selectedMaterials: 'trickcal_sweep_selected_materials', // 選中的素材
  },
  
  // ==================== 使用計數器 ====================
  usage: {
    sessionId: 'trickcal_usage_session_id',   // 會話 ID
    localCounter: 'trickcal_usage_local_counter', // 本地計數
    pendingEvents: 'trickcal_usage_pending_events', // 待同步事件
  },
  
  // ==================== 工具函數 ====================
  
  /**
   * 獲取儲存值
   * @param {string} key - 儲存鍵名
   * @param {*} defaultValue - 預設值
   * @returns {*} 儲存的值或預設值
   */
  get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.warn(`讀取 localStorage [${key}] 時發生錯誤:`, error);
      return defaultValue;
    }
  },
  
  /**
   * 設置儲存值
   * @param {string} key - 儲存鍵名
   * @param {*} value - 要儲存的值
   * @returns {boolean} 是否成功
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`儲存到 localStorage [${key}] 時發生錯誤:`, error);
      return false;
    }
  },
  
  /**
   * 刪除儲存值
   * @param {string} key - 儲存鍵名
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`刪除 localStorage [${key}] 時發生錯誤:`, error);
    }
  },
  
  /**
   * 清除所有 Trickcal 相關的儲存
   */
  clearAll() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('trickcal_')) {
        localStorage.removeItem(key);
      }
    });
  },
  
  /**
   * 獲取所有 Trickcal 儲存的統計信息
   * @returns {Object} 統計信息
   */
  getStats() {
    const keys = Object.keys(localStorage);
    const trickcalKeys = keys.filter(key => key.startsWith('trickcal_'));
    
    let totalSize = 0;
    trickcalKeys.forEach(key => {
      const value = localStorage.getItem(key);
      totalSize += (key.length + (value?.length || 0)) * 2; // 粗略估算（UTF-16）
    });
    
    return {
      count: trickcalKeys.length,
      sizeKB: (totalSize / 1024).toFixed(2),
      keys: trickcalKeys
    };
  }
};

// 導出為全局變量
if (typeof window !== 'undefined') {
  window.TRICKCAL_STORAGE_KEYS = TRICKCAL_STORAGE_KEYS;
}

// 兼容舊的鍵名（自動遷移）
(function migrateOldKeys() {
  const migrations = [
    // 遷移語言設置
    { old: 'trickcal-lang', new: TRICKCAL_STORAGE_KEYS.language },
    // 遷移 Sweep 選中素材
    { old: 'trickcal-selected-materials', new: TRICKCAL_STORAGE_KEYS.sweep.selectedMaterials },
    // 遷移使用計數器
    { old: 'trickcal-session-id', new: TRICKCAL_STORAGE_KEYS.usage.sessionId },
    { old: 'trickcal-local-counter', new: TRICKCAL_STORAGE_KEYS.usage.localCounter },
    { old: 'trickcal-pending-events', new: TRICKCAL_STORAGE_KEYS.usage.pendingEvents },
  ];
  
  migrations.forEach(({ old, new: newKey }) => {
    const oldValue = localStorage.getItem(old);
    if (oldValue !== null && localStorage.getItem(newKey) === null) {
      localStorage.setItem(newKey, oldValue);
      localStorage.removeItem(old);
      console.log(`已遷移 localStorage: ${old} → ${newKey}`);
    }
  });
})();

