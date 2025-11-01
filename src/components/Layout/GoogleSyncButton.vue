<template>
  <div class="google-sync">
    <!-- 未登入狀態 -->
    <button
      v-if="!syncStore.isSignedIn"
      class="google-signin-btn"
      @click="handleSignIn"
      :disabled="syncStore.isSyncing"
    >
      <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>{{ $t('sync.signIn') }}</span>
    </button>

    <!-- 已登入狀態 -->
    <div v-else class="user-info">
      <button class="user-button" @click="toggleMenu" :disabled="syncStore.isSyncing">
        <img 
          v-if="syncStore.currentUser?.imageUrl" 
          :src="syncStore.currentUser.imageUrl" 
          :alt="syncStore.currentUser.name"
          class="user-avatar"
        />
        <div v-else class="user-avatar-placeholder">
          {{ syncStore.currentUser?.name?.[0] || 'U' }}
        </div>
        <svg class="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- 下拉選單 -->
      <div v-if="menuOpen" class="dropdown-menu" @click.stop>
        <div class="menu-header">
          <div class="user-name">{{ syncStore.currentUser?.name }}</div>
          <div class="user-email">{{ syncStore.currentUser?.email }}</div>
        </div>

        <div class="menu-divider"></div>

        <div class="sync-status">
          <div v-if="syncStore.isSyncing" class="status-item syncing">
            <div class="spinner"></div>
            <span>{{ $t('sync.syncing') }}</span>
          </div>
          <div v-else-if="syncStore.lastSyncTimeFormatted" class="status-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ $t('sync.lastSync', { time: syncStore.lastSyncTimeFormatted }) }}</span>
          </div>
          <div v-else class="status-item">
            <span>{{ $t('sync.notSynced') }}</span>
          </div>
        </div>

        <div class="menu-divider"></div>

        <button class="menu-item" @click="handleUpload" :disabled="syncStore.isSyncing">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ $t('sync.uploadToCloud') }}</span>
        </button>

        <button class="menu-item" @click="handleDownload" :disabled="syncStore.isSyncing">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ $t('sync.restoreFromCloud') }}</span>
        </button>

        <div class="menu-divider"></div>

        <button class="menu-item danger" @click="handleSignOut" :disabled="syncStore.isSyncing">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ $t('sync.signOut') }}</span>
        </button>
      </div>
    </div>

    <!-- 點擊外部關閉選單 -->
    <div v-if="menuOpen" class="menu-overlay" @click="closeMenu"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSyncStore } from '@/stores/sync'
import { toast } from '@/utils/toast'

const { t } = useI18n()
const syncStore = useSyncStore()
const menuOpen = ref(false)

// 初始化
onMounted(() => {
  syncStore.initialize()
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

async function handleSignIn() {
  try {
    await syncStore.signIn()
  } catch (error) {
    toast.error(t('sync.signInFailed', { error: error instanceof Error ? error.message : t('errors.noData') }))
  }
}

async function handleSignOut() {
  try {
    await syncStore.signOut()
    closeMenu()
  } catch (error) {
    toast.error(t('sync.signOutFailed', { error: error instanceof Error ? error.message : t('errors.noData') }))
  }
}

async function handleUpload() {
  try {
    await syncStore.uploadToCloud()
    closeMenu()
    toast.success(t('sync.uploadSuccess'))
  } catch (error) {
    toast.error(t('sync.uploadFailed', { error: error instanceof Error ? error.message : t('errors.noData') }))
  }
}

async function handleDownload() {
  try {
    await syncStore.restoreFromCloud()
    closeMenu()
    toast.success(t('sync.restoreSuccess'))
  } catch (error) {
    toast.error(t('sync.restoreFailed', { error: error instanceof Error ? error.message : t('errors.noData') }))
  }
}

// 點擊外部關閉選單
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.google-sync')) {
    closeMenu()
  }
}
</script>

<style scoped>
.google-sync {
  position: relative;
}

.google-signin-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.google-signin-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.2);
}

.google-signin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.google-icon {
  flex-shrink: 0;
}

.user-info {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  padding-right: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: var(--card-bg);
  cursor: pointer;
  transition: all 0.2s;
}

.user-button:hover:not(:disabled) {
  border-color: var(--primary-color);
}

.user-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.dropdown-icon {
  color: var(--text-secondary);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 280px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.menu-header {
  padding: 1rem;
  background: var(--hover-bg);
}

.user-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  word-break: break-word;
}

.sync-status {
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-item.syncing {
  color: var(--primary-color);
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--primary-color);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.menu-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.25rem 0;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item:hover:not(:disabled) {
  background: var(--hover-bg);
}

.menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-item.danger {
  color: var(--danger-color, #ef4444);
}

.menu-item.danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
}

.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}

@media (max-width: 768px) {
  .google-signin-btn {
    padding: 0.375rem;
    font-size: 0.8125rem;
    min-width: auto;
  }

  .google-signin-btn span {
    display: none;
  }

  .google-icon {
    width: 20px;
    height: 20px;
  }

  .user-button {
    padding: 0.25rem;
  }

  .user-avatar,
  .user-avatar-placeholder {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }

  .dropdown-icon {
    display: none;
  }

  .dropdown-menu {
    min-width: 260px;
    right: -0.5rem;
  }
}
</style>

