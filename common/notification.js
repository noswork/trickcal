/**
 * Trickcal 統一通知系統
 * 
 * 功能：
 * - 顯示成功、錯誤、警告、信息等不同類型的通知
 * - 自動消失或需要用戶確認
 * - 支援載入狀態指示器
 * - 統一的錯誤處理
 */

(function() {
  'use strict';

  // 通知類型
  const NotificationType = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  };

  // 通知管理器
  class NotificationManager {
    constructor() {
      this.container = null;
      this.notifications = new Map();
      this.notificationId = 0;
      this.initialized = false;
      this.pendingNotifications = [];
    }

    init() {
      if (this.initialized) return;
      
      // 創建通知容器
      this.container = document.createElement('div');
      this.container.className = 'trickcal-notification-container';
      document.body.appendChild(this.container);
      this.initialized = true;

      // 處理待顯示的通知
      if (this.pendingNotifications.length > 0) {
        this.pendingNotifications.forEach(options => this._doShow(options));
        this.pendingNotifications = [];
      }
    }

    ensureInitialized() {
      if (!this.initialized) {
        if (document.body) {
          this.init();
        } else {
          // 如果 body 還不存在，等待 DOM 準備好
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
          } else {
            // 使用 setTimeout 確保在下一個事件循環中 body 已存在
            setTimeout(() => this.init(), 0);
          }
        }
      }
    }

    /**
     * 顯示通知（公共方法）
     * @param {Object} options - 通知選項
     * @param {string} options.type - 通知類型（success, error, warning, info）
     * @param {string} options.title - 通知標題
     * @param {string} options.message - 通知內容
     * @param {number} options.duration - 持續時間（毫秒），0 表示不自動關閉
     * @param {Object} options.action - 操作按鈕 { text, handler }
     * @returns {string} 通知 ID
     */
    show(options) {
      this.ensureInitialized();
      
      if (!this.initialized) {
        // 如果還未初始化，暫存通知選項
        const id = `notification-${++this.notificationId}`;
        this.pendingNotifications.push({ ...options, _id: id });
        return id;
      }
      
      return this._doShow(options);
    }

    /**
     * 實際顯示通知（內部方法）
     * @private
     */
    _doShow({ type = NotificationType.INFO, title, message, duration = 3000, action = null, _id = null }) {
      const id = _id || `notification-${++this.notificationId}`;
      
      const notification = document.createElement('div');
      notification.className = `trickcal-notification trickcal-notification-${type}`;
      notification.setAttribute('data-id', id);
      notification.setAttribute('role', 'alert');
      notification.setAttribute('aria-live', 'polite');
      
      // 圖標
      const icon = this.getIcon(type);
      
      // 內容
      let content = '<div class="notification-content">';
      if (title) {
        content += `<div class="notification-title">${this.escapeHtml(title)}</div>`;
      }
      if (message) {
        content += `<div class="notification-message">${this.escapeHtml(message)}</div>`;
      }
      content += '</div>';
      
      // 操作按鈕
      let actionHtml = '';
      if (action) {
        actionHtml = `<button class="notification-action" type="button">${this.escapeHtml(action.text)}</button>`;
      }
      
      // 關閉按鈕
      const closeBtn = '<button class="notification-close" type="button" aria-label="關閉">&times;</button>';
      
      notification.innerHTML = `
        ${icon}
        ${content}
        ${actionHtml}
        ${closeBtn}
      `;
      
      // 綁定事件
      const closeButton = notification.querySelector('.notification-close');
      closeButton.addEventListener('click', () => this.hide(id));
      
      if (action && action.handler) {
        const actionButton = notification.querySelector('.notification-action');
        actionButton.addEventListener('click', () => {
          action.handler();
          this.hide(id);
        });
      }
      
      // 添加到容器
      this.container.appendChild(notification);
      this.notifications.set(id, notification);
      
      // 觸發動畫
      requestAnimationFrame(() => {
        notification.classList.add('notification-show');
      });
      
      // 自動關閉
      if (duration > 0) {
        setTimeout(() => this.hide(id), duration);
      }
      
      return id;
    }

    /**
     * 隱藏通知
     * @param {string} id - 通知 ID
     */
    hide(id) {
      const notification = this.notifications.get(id);
      if (!notification) return;
      
      notification.classList.remove('notification-show');
      notification.classList.add('notification-hide');
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        this.notifications.delete(id);
      }, 300);
    }

    /**
     * 隱藏所有通知
     */
    hideAll() {
      this.notifications.forEach((_, id) => this.hide(id));
    }

    /**
     * 顯示成功通知
     */
    success(message, title = '成功') {
      return this.show({ type: NotificationType.SUCCESS, title, message });
    }

    /**
     * 顯示錯誤通知
     */
    error(message, title = '錯誤') {
      return this.show({ type: NotificationType.ERROR, title, message, duration: 5000 });
    }

    /**
     * 顯示警告通知
     */
    warning(message, title = '警告') {
      return this.show({ type: NotificationType.WARNING, title, message, duration: 4000 });
    }

    /**
     * 顯示信息通知
     */
    info(message, title = '提示') {
      return this.show({ type: NotificationType.INFO, title, message });
    }

    /**
     * 獲取圖標 HTML
     */
    getIcon(type) {
      const icons = {
        success: '<svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        error: '<svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        warning: '<svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        info: '<svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
      };
      return icons[type] || icons.info;
    }

    /**
     * 轉義 HTML
     */
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // 載入指示器管理器
  class LoadingManager {
    constructor() {
      this.overlay = null;
      this.activeLoaders = new Set();
      this.loaderId = 0;
    }

    ensureOverlay() {
      if (!this.overlay && document.body) {
        this.createOverlay();
      }
    }

    /**
     * 顯示載入指示器
     * @param {string} message - 載入訊息
     * @returns {string} 載入器 ID
     */
    show(message = '載入中...') {
      const id = `loader-${++this.loaderId}`;
      this.activeLoaders.add(id);
      
      this.ensureOverlay();
      
      if (!this.overlay) {
        // 如果 DOM 還未準備好，延遲執行
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            this.ensureOverlay();
            if (this.overlay && this.activeLoaders.has(id)) {
              this.updateMessage(message);
              this.overlay.classList.add('loading-show');
            }
          });
        } else {
          setTimeout(() => {
            this.ensureOverlay();
            if (this.overlay && this.activeLoaders.has(id)) {
              this.updateMessage(message);
              this.overlay.classList.add('loading-show');
            }
          }, 0);
        }
        return id;
      }
      
      this.updateMessage(message);
      this.overlay.classList.add('loading-show');
      
      return id;
    }

    /**
     * 隱藏載入指示器
     * @param {string} id - 載入器 ID
     */
    hide(id) {
      this.activeLoaders.delete(id);
      
      // 如果沒有活動的載入器，隱藏覆蓋層
      if (this.activeLoaders.size === 0 && this.overlay) {
        this.overlay.classList.remove('loading-show');
      }
    }

    /**
     * 隱藏所有載入指示器
     */
    hideAll() {
      this.activeLoaders.clear();
      if (this.overlay) {
        this.overlay.classList.remove('loading-show');
      }
    }

    /**
     * 創建覆蓋層
     */
    createOverlay() {
      this.overlay = document.createElement('div');
      this.overlay.className = 'trickcal-loading-overlay';
      this.overlay.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <div class="loading-message">載入中...</div>
      `;
      document.body.appendChild(this.overlay);
    }

    /**
     * 更新訊息
     */
    updateMessage(message) {
      if (this.overlay) {
        const messageEl = this.overlay.querySelector('.loading-message');
        if (messageEl) {
          messageEl.textContent = message;
        }
      }
    }
  }

  // 錯誤處理器
  class ErrorHandler {
    constructor(notificationManager) {
      this.notificationManager = notificationManager;
      this.init();
    }

    init() {
      // 捕獲全局錯誤
      window.addEventListener('error', (event) => {
        console.error('全局錯誤:', event.error);
        this.handleError(event.error);
      });

      // 捕獲 Promise 拒絕
      window.addEventListener('unhandledrejection', (event) => {
        console.error('未處理的 Promise 拒絕:', event.reason);
        this.handleError(event.reason);
      });
    }

    /**
     * 處理錯誤
     * @param {Error} error - 錯誤對象
     * @param {Object} options - 選項
     */
    handleError(error, options = {}) {
      const {
        showNotification = true,
        retry = null,
        fallback = null,
      } = options;

      // 記錄錯誤
      console.error('錯誤處理器:', error);

      if (showNotification && this.notificationManager) {
        const action = retry ? {
          text: '重試',
          handler: retry,
        } : null;

        this.notificationManager.show({
          type: NotificationType.ERROR,
          title: '發生錯誤',
          message: error.message || '未知錯誤',
          duration: 5000,
          action,
        });
      }

      // 執行回退邏輯
      if (fallback) {
        try {
          fallback();
        } catch (fallbackError) {
          console.error('回退邏輯執行失敗:', fallbackError);
        }
      }
    }

    /**
     * 包裝異步函數，自動處理錯誤
     * @param {Function} fn - 異步函數
     * @param {Object} options - 選項
     * @returns {Function} 包裝後的函數
     */
    wrapAsync(fn, options = {}) {
      return async (...args) => {
        try {
          return await fn(...args);
        } catch (error) {
          this.handleError(error, options);
          throw error;
        }
      };
    }
  }

  // 初始化並暴露 API
  const notificationManager = new NotificationManager();
  const loadingManager = new LoadingManager();
  const errorHandler = new ErrorHandler(notificationManager);

  window.TrickcalNotification = {
    // 通知 API
    show: (options) => notificationManager.show(options),
    success: (message, title) => notificationManager.success(message, title),
    error: (message, title) => notificationManager.error(message, title),
    warning: (message, title) => notificationManager.warning(message, title),
    info: (message, title) => notificationManager.info(message, title),
    hide: (id) => notificationManager.hide(id),
    hideAll: () => notificationManager.hideAll(),
    
    // 載入 API
    showLoading: (message) => loadingManager.show(message),
    hideLoading: (id) => loadingManager.hide(id),
    hideAllLoading: () => loadingManager.hideAll(),
    
    // 錯誤處理 API
    handleError: (error, options) => errorHandler.handleError(error, options),
    wrapAsync: (fn, options) => errorHandler.wrapAsync(fn, options),
  };

  console.log('Trickcal 通知系統已初始化');
})();

