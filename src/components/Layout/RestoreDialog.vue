<template>
  <Teleport to="body">
    <div v-if="syncStore.showRestoreDialog" class="dialog-overlay" @click="handleDismiss">
      <div class="dialog-container" @click.stop>
        <div class="dialog-header">
          <div class="dialog-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="dialog-title">發現雲端備份</h2>
        </div>

        <div class="dialog-body">
          <p class="dialog-message">
            我們在您的 Google Drive 中發現了之前的備份數據。
          </p>

          <div class="backup-info">
            <div class="info-item">
              <span class="info-label">備份時間：</span>
              <span class="info-value">{{ formatDate(syncStore.cloudBackupData?.lastSync) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">擁有角色：</span>
              <span class="info-value">{{ cloudOwnedCount }} 個</span>
            </div>
            <div class="info-item">
              <span class="info-label">已選素材：</span>
              <span class="info-value">{{ cloudMaterialsCount }} 個</span>
            </div>
          </div>

          <div class="comparison">
            <div class="comparison-column">
              <h4>本地數據</h4>
              <div class="comparison-stats">
                <div>角色：{{ localOwnedCount }} 個</div>
                <div>素材：{{ localMaterialsCount }} 個</div>
              </div>
            </div>
            <div class="comparison-divider">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="comparison-column">
              <h4>雲端數據</h4>
              <div class="comparison-stats">
                <div>角色：{{ cloudOwnedCount }} 個</div>
                <div>素材：{{ cloudMaterialsCount }} 個</div>
              </div>
            </div>
          </div>

          <p class="dialog-warning">
            ⚠️ 恢復雲端數據將會覆蓋您當前的本地數據，此操作無法撤銷。
          </p>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="handleDismiss" :disabled="isRestoring">
            繼續使用本地數據
          </button>
          <button class="btn btn-primary" @click="handleRestore" :disabled="isRestoring">
            <span v-if="isRestoring">恢復中...</span>
            <span v-else>恢復雲端數據</span>
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

const isRestoring = ref(false)

// 本地數據統計
const localOwnedCount = computed(() => boardStore.userProgress.ownedCharacters.size)
const localMaterialsCount = computed(() => sweepStore.selectedMaterials.size)

// 雲端數據統計
const cloudOwnedCount = computed(() => {
  return syncStore.cloudBackupData?.board?.ownedCharacters?.length || 0
})

const cloudMaterialsCount = computed(() => {
  return syncStore.cloudBackupData?.sweep?.selectedMaterials?.length || 0
})

function formatDate(dateString: string | undefined) {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleRestore() {
  try {
    isRestoring.value = true
    await syncStore.restoreFromCloud(syncStore.cloudBackupData)
    alert('恢復成功！')
  } catch (error) {
    alert('恢復失敗：' + (error instanceof Error ? error.message : '未知錯誤'))
  } finally {
    isRestoring.value = false
  }
}

function handleDismiss() {
  if (!isRestoring.value) {
    syncStore.dismissRestoreDialog()
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
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
  max-width: 500px;
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
  background: var(--primary-bg);
  color: var(--primary-color);
  margin-bottom: 1rem;
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
}

.backup-info {
  background: var(--hover-bg);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.info-item:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.info-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
}

.comparison {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--hover-bg);
  border-radius: 8px;
}

.comparison-column h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  text-align: center;
}

.comparison-stats {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  text-align: center;
}

.comparison-stats > div {
  padding: 0.25rem 0;
}

.comparison-divider {
  color: var(--text-secondary);
  opacity: 0.5;
}

.dialog-warning {
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid var(--danger-color, #ef4444);
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.dialog-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.625rem 1.25rem;
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

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

@media (max-width: 768px) {
  .dialog-container {
    max-width: 100%;
    margin: 1rem;
  }

  .comparison {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .comparison-divider {
    transform: rotate(90deg);
  }

  .dialog-footer {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>

