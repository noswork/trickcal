<template>
  <Teleport to="body">
    <div v-if="syncStore.showConflictDialog" class="dialog-overlay" @click.self="handleCancel">
      <div class="dialog-container">
        <div class="dialog-header">
          <div class="dialog-icon warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="dialog-title">數據衝突</h2>
        </div>

        <div class="dialog-body">
          <p class="dialog-message">
            您的本地數據和雲端數據都在最近被修改過，時間差異很小，我們無法自動判斷應該使用哪一個。請選擇您想要保留的版本：
          </p>

          <div class="comparison-grid">
            <div class="data-card local">
              <h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                本地數據
              </h3>
              <div class="data-stats">
                <div class="stat-item">
                  <span class="stat-label">擁有角色：</span>
                  <span class="stat-value">{{ localOwnedCount }} 個</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">已選素材：</span>
                  <span class="stat-value">{{ localMaterialsCount }} 個</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">更新時間：</span>
                  <span class="stat-value">剛剛</span>
                </div>
              </div>
              <button 
                class="choice-btn" 
                @click="handleUseLocal"
                :disabled="isResolving"
              >
                使用本地數據
              </button>
            </div>

            <div class="data-card cloud">
              <h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                雲端數據
              </h3>
              <div class="data-stats">
                <div class="stat-item">
                  <span class="stat-label">擁有角色：</span>
                  <span class="stat-value">{{ cloudOwnedCount }} 個</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">已選素材：</span>
                  <span class="stat-value">{{ cloudMaterialsCount }} 個</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">更新時間：</span>
                  <span class="stat-value">{{ formatDate(syncStore.conflictData?.lastSync) }}</span>
                </div>
              </div>
              <button 
                class="choice-btn" 
                @click="handleUseCloud"
                :disabled="isResolving"
              >
                使用雲端數據
              </button>
            </div>
          </div>

          <div class="warning-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>選擇一個版本後，另一個版本的數據將會被覆蓋。此操作無法撤銷，請謹慎選擇。</p>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="handleCancel" :disabled="isResolving">
            稍後決定
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSyncStore } from '@/stores/sync'
import { useBoardStore } from '@/stores/board'
import { useSweepStore } from '@/stores/sweep'

const syncStore = useSyncStore()
const boardStore = useBoardStore()
const sweepStore = useSweepStore()

const isResolving = ref(false)

// 本地數據統計
const localOwnedCount = computed(() => boardStore.userProgress.ownedCharacters.size)
const localMaterialsCount = computed(() => sweepStore.selectedMaterials.size)

// 雲端數據統計
const cloudOwnedCount = computed(() => {
  return syncStore.conflictData?.board?.ownedCharacters?.length || 0
})

const cloudMaterialsCount = computed(() => {
  return syncStore.conflictData?.sweep?.selectedMaterials?.length || 0
})

function formatDate(dateString: string | undefined) {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return '剛剛'
  if (diffMins < 60) return `${diffMins} 分鐘前`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} 小時前`
  
  return date.toLocaleString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleUseLocal() {
  try {
    isResolving.value = true
    await syncStore.resolveConflictWithLocal()
    alert('已使用本地數據覆蓋雲端！')
  } catch (error) {
    alert('操作失敗：' + (error instanceof Error ? error.message : '未知錯誤'))
  } finally {
    isResolving.value = false
  }
}

async function handleUseCloud() {
  try {
    isResolving.value = true
    await syncStore.resolveConflictWithCloud()
    alert('已使用雲端數據覆蓋本地！')
  } catch (error) {
    alert('操作失敗：' + (error instanceof Error ? error.message : '未知錯誤'))
  } finally {
    isResolving.value = false
  }
}

function handleCancel() {
  if (!isResolving.value) {
    syncStore.showConflictDialog = false
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.dialog-container {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-header {
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
}

.dialog-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.dialog-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.dialog-body {
  padding: 1.5rem;
}

.dialog-message {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  text-align: center;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.data-card {
  background: var(--hover-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.2s;
}

.data-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.data-card h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.data-stats {
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.stat-item:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.stat-label {
  color: var(--text-secondary);
}

.stat-value {
  color: var(--text-primary);
  font-weight: 500;
}

.choice-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: white;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.choice-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.choice-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.warning-box {
  display: flex;
  gap: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid var(--danger-color, #ef4444);
  padding: 1rem;
  border-radius: 4px;
}

.warning-box svg {
  flex-shrink: 0;
  color: var(--danger-color, #ef4444);
  margin-top: 0.125rem;
}

.warning-box p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.dialog-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
}

.btn {
  padding: 0.625rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--border-color);
}

@media (max-width: 768px) {
  .dialog-container {
    max-width: 100%;
    margin: 0.5rem;
  }

  .comparison-grid {
    grid-template-columns: 1fr;
  }

  .dialog-body {
    padding: 1rem;
  }
}
</style>

