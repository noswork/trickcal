<template>
  <div class="usage-counter">
    <span class="counter-label">總使用次數</span>
    <span class="counter-value" :class="{ updating: isUpdating }">{{ formattedCount }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

const props = defineProps<{
  pageType?: string
}>()

const SUPABASE_URL = 'https://phiemgvtolycpmpbgzan.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaWVtZ3Z0b2x5Y3BtcGJnemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTQ5NDksImV4cCI6MjA3NjMzMDk0OX0.-nSfSQpKvD6Ye0GJ0BVJMamFWrHjqriQbXJ1n0T9Pas'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const localCount = ref(0)
const remoteCount = ref(0)
const isUpdating = ref(false)
const sessionId = ref('')

const totalCount = computed(() => remoteCount.value + localCount.value)

const formattedCount = computed(() => {
  return new Intl.NumberFormat('en-US').format(totalCount.value)
})

let syncTimer: ReturnType<typeof setInterval> | null = null
const pendingEvents: Array<{page_type: string; action_type: string; timestamp: number}> = []

// 生成session ID
function generateSessionId() {
  const stored = localStorage.getItem('trickcal_usage_session_id')
  if (stored) {
    return stored
  }
  const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  localStorage.setItem('trickcal_usage_session_id', newId)
  return newId
}

// 追蹤使用事件
function track(actionType = 'page_view') {
  localCount.value++
  isUpdating.value = true
  
  // 添加到待同步事件
  pendingEvents.push({
    page_type: props.pageType || 'unknown',
    action_type: actionType,
    timestamp: Date.now()
  })
  
  // 保存到localStorage
  localStorage.setItem('trickcal_usage_pending_events', JSON.stringify(pendingEvents))
  
  setTimeout(() => {
    isUpdating.value = false
  }, 300)
}

// 從Supabase載入計數
async function loadRemoteCount() {
  try {
    const { data, error } = await supabase
      .from('total_usage_count')
      .select('total_count')
      .single()
    
    if (error) {
      console.error('載入使用計數時發生錯誤:', error)
      return 0
    }
    
    return data?.total_count || 0
  } catch (err) {
    console.error('載入使用計數時發生錯誤:', err)
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
      console.error('同步事件時發生錯誤:', error)
      return
    }
    
    // 更新遠端計數
    remoteCount.value += pendingEvents.length
    
    // 清除待處理事件
    pendingEvents.length = 0
    localCount.value = 0
    localStorage.removeItem('trickcal_usage_pending_events')
    
    console.log('事件同步成功')
  } catch (err) {
    console.error('同步事件時發生錯誤:', err)
  }
}

// 初始化
onMounted(async () => {
  sessionId.value = generateSessionId()
  
  // 載入遠端計數
  remoteCount.value = await loadRemoteCount()
  
  // 載入本地待同步事件
  try {
    const stored = localStorage.getItem('trickcal_usage_pending_events')
    if (stored) {
      const events = JSON.parse(stored)
      pendingEvents.push(...events)
      localCount.value = events.length
    }
  } catch (e) {
    console.error('載入本地事件失敗:', e)
  }
  
  // 追蹤頁面訪問
  track('page_view')
  
  // 立即同步一次
  await syncPendingEvents()
  
  // 定期同步
  syncTimer = setInterval(() => {
    if (pendingEvents.length > 0) {
      syncPendingEvents()
    }
  }, 60000) // 每分鐘同步一次
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
    }).catch(err => console.error('發送最終事件時發生錯誤:', err))
  }
})

// 暴露方法供父組件使用
defineExpose({
  track
})
</script>

<style scoped>
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

