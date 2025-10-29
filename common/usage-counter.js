/**
 * Trickcal 通用使用計數器模組
 * 
 * 功能：
 * - 追蹤所有頁面的使用情況
 * - 顯示全站總使用次數
 * - 自動同步到 Supabase
 * - 離線支援（本地緩存）
 * 
 * 使用方式：
 * 1. 在 HTML 中引入：<script src="../common/usage-counter.js"></script>
 * 2. 初始化：TrickcalUsageCounter.init({ pageType: 'sweep' })
 * 3. 追蹤事件：TrickcalUsageCounter.track('button_click')
 */

(function() {
  'use strict';

  // Supabase 配置
  // 注意：這些憑證是公開的，安全性由 Supabase RLS 政策控制
  const SUPABASE_URL = "https://phiemgvtolycpmpbgzan.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaWVtZ3Z0b2x5Y3BtcGJnemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTQ5NDksImV4cCI6MjA3NjMzMDk0OX0.-nSfSQpKvD6Ye0GJ0BVJMamFWrHjqriQbXJ1n0T9Pas";

  // 本地儲存鍵 - 使用統一的鍵名管理
  const STORAGE_KEYS = {
    sessionId: 'trickcal_usage_session_id',
    localCounter: 'trickcal_usage_local_counter',
    pendingEvents: 'trickcal_usage_pending_events',
  };

  // 狀態
  let supabase = null;
  let sessionId = null;
  let pageType = 'unknown';
  let counterElement = null;
  
  let localState = {
    count: 0,           // 本地計數
    remoteCount: 0,     // 遠端計數
    pendingEvents: [],  // 待同步事件
    syncTimer: null,    // 同步計時器
  };

  // 初始化 Supabase 客戶端
  function initSupabase() {
    if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
      console.warn('Supabase SDK 未載入，使用計數器功能將不可用');
      return false;
    }
    
    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return true;
    } catch (err) {
      console.error('無法初始化 Supabase 客戶端:', err);
      return false;
    }
  }

  // 生成或載入 Session ID
  function ensureSessionId() {
    let stored = localStorage.getItem(STORAGE_KEYS.sessionId);
    if (!stored) {
      stored = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(STORAGE_KEYS.sessionId, stored);
    }
    sessionId = stored;
  }

  // 載入本地狀態
  function loadLocalState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.localCounter);
      if (stored) {
        const parsed = JSON.parse(stored);
        localState.count = parsed.count || 0;
      }
      
      const storedEvents = localStorage.getItem(STORAGE_KEYS.pendingEvents);
      if (storedEvents) {
        localState.pendingEvents = JSON.parse(storedEvents) || [];
      }
    } catch (err) {
      console.error('載入本地計數器狀態時發生錯誤:', err);
      localState.count = 0;
      localState.pendingEvents = [];
    }
  }

  // 儲存本地狀態
  function saveLocalState() {
    try {
      localStorage.setItem(STORAGE_KEYS.localCounter, JSON.stringify({
        count: localState.count
      }));
      localStorage.setItem(STORAGE_KEYS.pendingEvents, JSON.stringify(localState.pendingEvents));
    } catch (err) {
      console.error('儲存本地計數器狀態時發生錯誤:', err);
    }
  }

  // 載入遠端計數
  async function loadRemoteCount() {
    if (!supabase) return 0;
    
    try {
      const { data, error } = await supabase
        .from('total_usage_count')
        .select('total_count')
        .single();
      
      if (error) {
        console.error('載入使用計數時發生錯誤:', error);
        return 0;
      }
      
      return data?.total_count || 0;
    } catch (err) {
      console.error('載入使用計數時發生錯誤:', err);
      return 0;
    }
  }

  // 更新顯示
  function updateDisplay() {
    if (!counterElement) return;
    
    const total = localState.remoteCount + localState.count;
    counterElement.textContent = formatNumber(total);
  }

  // 格式化數字（千分位）
  function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
  }

  // 追蹤使用事件
  function track(actionType = 'interaction') {
    // 增加本地計數
    localState.count++;
    
    // 新增待同步事件
    localState.pendingEvents.push({
      page_type: pageType,
      action_type: actionType,
      timestamp: Date.now()
    });
    
    // 儲存到 localStorage
    saveLocalState();
    
    // 更新顯示（帶動畫）
    if (counterElement) {
      counterElement.classList.add('updating');
      updateDisplay();
      
      setTimeout(() => {
        counterElement.classList.remove('updating');
      }, 300);
    }
  }

  // 同步待處理事件到 Supabase
  async function syncPendingEvents() {
    if (!supabase || localState.pendingEvents.length === 0) {
      return;
    }
    
    try {
      console.log(`同步 ${localState.pendingEvents.length} 個待處理事件...`);
      
      // 準備批次插入
      const events = localState.pendingEvents.map(event => ({
        session_id: sessionId,
        page_type: event.page_type,
        action_type: event.action_type,
        created_at: new Date(event.timestamp).toISOString()
      }));
      
      // 一次性插入所有事件
      const { error } = await supabase
        .from('usage_events')
        .insert(events);
      
      if (error) {
        console.error('同步事件時發生錯誤:', error);
        return;
      }
      
      // 更新遠端計數
      localState.remoteCount += localState.pendingEvents.length;
      
      // 清除待處理事件和本地計數
      localState.pendingEvents = [];
      localState.count = 0;
      
      // 儲存狀態
      saveLocalState();
      
      // 更新顯示
      updateDisplay();
      
      console.log('事件同步成功');
      
    } catch (err) {
      console.error('同步事件時發生錯誤:', err);
    }
  }

  // 開始定期同步（每分鐘）
  function startPeriodicSync() {
    // 清除現有計時器
    if (localState.syncTimer) {
      clearInterval(localState.syncTimer);
    }
    
    // 每 60 秒同步一次
    localState.syncTimer = setInterval(() => {
      syncPendingEvents();
    }, 60000);
    
    console.log('已啟動定期同步（每分鐘）');
  }

  // 處理頁面卸載 - 發送剩餘事件
  function handleBeforeUnload() {
    if (!supabase || localState.pendingEvents.length === 0) {
      return;
    }
    
    // 使用 fetch 與 keepalive 旗標來確保在頁面卸載時仍能發送
    const events = localState.pendingEvents.map(event => ({
      session_id: sessionId,
      page_type: event.page_type,
      action_type: event.action_type,
      created_at: new Date(event.timestamp).toISOString()
    }));
    
    fetch(`${SUPABASE_URL}/rest/v1/usage_events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(events),
      keepalive: true
    }).catch(err => console.error('發送最終事件時發生錯誤:', err));
  }

  // 初始化使用計數器
  async function init(options = {}) {
    // 設定頁面類型
    pageType = options.pageType || 'unknown';
    
    // 設定計數器元素
    counterElement = options.element || document.querySelector('.counter-value');
    
    if (!counterElement) {
      console.warn('找不到計數器顯示元素');
    }
    
    // 初始化 Supabase
    if (!initSupabase()) {
      if (counterElement) {
        counterElement.textContent = '0';
      }
      return;
    }
    
    // 確保有 Session ID
    ensureSessionId();
    
    // 載入本地狀態
    loadLocalState();
    
    // 載入遠端計數
    localState.remoteCount = await loadRemoteCount();
    
    // 更新顯示
    updateDisplay();
    
    // 開始定期同步
    startPeriodicSync();
    
    // 設定頁面卸載處理器
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    console.log(`使用計數器已初始化 (頁面類型: ${pageType})`);
  }

  // 暴露公開 API
  window.TrickcalUsageCounter = {
    init,
    track,
    getCount: () => localState.remoteCount + localState.count,
    sync: syncPendingEvents,
  };
})();

