<template>
  <div class="usage-counter">
    <span class="counter-label">{{ $t('footer.usageCount') }}</span>
    <span class="counter-value" :class="{ updating: usageStore.isUpdating }">{{ formattedCount }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG, API_CONFIG } from '@/constants'
import { UsageStorage } from '@/utils/storage'
import { createLogger } from '@/utils/logger'
import { useUsageStore } from '@/stores/usage'

const logger = createLogger('UsageCounter')
const route = useRoute()
const usageStore = useUsageStore()

const supabase = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY)

// 根據路由自動獲取頁面類型
const pageType = computed(() => {
  const path = route.path
  if (path === '/') return 'home'
  if (path.startsWith('/board')) return 'board'
  if (path.startsWith('/sweep')) return 'sweep'
  return 'other'
})

const sessionId = ref('')

const formattedCount = computed(() => {
  return new Intl.NumberFormat('en-US').format(usageStore.totalCount)
})

let syncTimer: ReturnType<typeof setInterval> | null = null
const pendingEvents: Array<{page_type: string; action_type: string; timestamp: number}> = []

// 生成session ID
function generateSessionId() {
  const stored = UsageStorage.getSessionId()
  if (stored) {
    return stored
  }
  const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  UsageStorage.setSessionId(newId)
  return newId
}

// 追蹤使用事件
function track(actionType = 'page_view') {
  // 使用 store 增加計數（提供即時反饋）
  usageStore.incrementLocalCount()
  
  // 添加到待同步事件
  pendingEvents.push({
    page_type: pageType.value,
    action_type: actionType,
    timestamp: Date.now()
  })
  
  // 保存待同步事件
  UsageStorage.setPendingEvents(pendingEvents)
}

// 從Supabase載入計數
async function loadRemoteCount() {
  try {
    const { data, error } = await supabase
      .from('total_usage_count')
      .select('total_count')
      .single()
    
    if (error) {
      logger.error('載入使用計數時發生錯誤:', error)
      return 0
    }
    
    const count = data?.total_count || 0
    usageStore.setRemoteCount(count)
    return count
  } catch (err) {
    logger.error('載入使用計數時發生錯誤:', err)
    return 0
  }
}

// 同步待處理事件到 Supabase
async function syncPendingEvents() {
  if (pendingEvents.length === 0) return
  
  try {
    const events = pendingEvents.map(event => ({
      session_id: sessionId.value,
      page_type: event.page_type,
      action_type: event.action_type,
      created_at: new Date(event.timestamp).toISOString()
    }))
    
    const { error } = await supabase
      .from('usage_events')
      .insert(events)
    
    if (error) {
      logger.error('同步事件時發生錯誤:', error)
      return
    }
    
    // 更新遠端計數
    usageStore.setRemoteCount(usageStore.remoteCount + pendingEvents.length)
    
    // 清除待處理事件
    pendingEvents.length = 0
    usageStore.resetLocalCount()
    usageStore.updateTotalCount()
    UsageStorage.clearPendingEvents()
    
    logger.success('事件同步成功')
  } catch (err) {
    logger.error('同步事件時發生錯誤:', err)
  }
}

// 初始化
onMounted(async () => {
  sessionId.value = generateSessionId()
  
  // 載入遠端計數
  await loadRemoteCount()
  
  // 載入本地待同步事件
  try {
    const events = UsageStorage.getPendingEvents()
    if (events.length > 0) {
      pendingEvents.push(...events)
      // 更新 store 的本地計數
      for (let i = 0; i < events.length; i++) {
        usageStore.incrementLocalCount()
      }
    }
  } catch (e) {
    logger.error('載入本地事件失敗:', e)
  }
  
  // 追蹤首次頁面訪問
  track('page_view')
  
  // 立即同步一次
  await syncPendingEvents()
  
  // 定期同步
  syncTimer = setInterval(() => {
    if (pendingEvents.length > 0) {
      syncPendingEvents()
    }
  }, API_CONFIG.SYNC_INTERVAL)
})

// 監聽路由變化，自動追蹤頁面訪問
watch(() => route.path, (newPath, oldPath) => {
  // 只在路由真的改變時追蹤
  if (newPath !== oldPath) {
    logger.info(`頁面切換: ${oldPath} → ${newPath} (${pageType.value})`)
    track('page_view')
  }
})

// 清理
onUnmounted(() => {
  if (syncTimer) {
    clearInterval(syncTimer)
  }
  
  // 嘗試發送剩餘事件
  if (pendingEvents.length > 0) {
    // 使用fetch與keepalive確保在頁面卸載時仍能發送
    const events = pendingEvents.map(event => ({
      session_id: sessionId.value,
      page_type: event.page_type,
      action_type: event.action_type,
      created_at: new Date(event.timestamp).toISOString()
    }))
    
    fetch(`${SUPABASE_CONFIG.URL}/rest/v1/usage_events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_CONFIG.ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(events),
      keepalive: true
    }).catch(err => logger.error('發送最終事件時發生錯誤:', err))
  }
})

// 暴露方法供父組件使用
defineExpose({
  track
})
</script>

<style scoped>
/* 強制使用自定義鼠標 */
.usage-counter,
.usage-counter * {
  cursor: url('/assets/cursors/cursor.png') 0 0, auto !important;
}

.usage-counter {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: var(--secondary-bg);
  border-radius: 8px;
  font-size: 0.75rem;
}

.counter-label {
  color: var(--text-secondary);
}

.counter-value {
  font-weight: 600;
  color: var(--primary-color);
  transition: transform 0.3s ease;
}

.counter-value.updating {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .usage-counter {
    font-size: 0.6875rem;
    padding: 0.25rem 0.5rem;
    gap: 0.375rem;
  }
}
</style>

