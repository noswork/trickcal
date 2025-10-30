<template>
  <AppLayout>
    <div class="changelog-root">
      <div class="site-container">
        <header class="changelog-header">
          <h1 class="page-title">開發日誌</h1>
          <p class="page-description">記錄專案的更新與改進歷程</p>
        </header>

        <!-- 載入中狀態 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>載入中...</p>
        </div>

        <!-- 錯誤狀態 -->
        <div v-else-if="error" class="error-state">
          <p>載入失敗: {{ error }}</p>
        </div>

        <!-- Markdown 內容 -->
        <div v-else-if="htmlContent" class="changelog-content" v-html="htmlContent"></div>

        <!-- 空狀態 -->
        <div v-else class="empty-state">
          <p>目前沒有任何開發日誌</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { marked } from 'marked'
import AppLayout from '@/components/Layout/AppLayout.vue'
import { useChangelogStore } from '@/stores/changelog'

const store = useChangelogStore()

const loading = computed(() => store.loading)
const error = computed(() => store.error)
const htmlContent = computed(() => {
  if (!store.content) return ''
  return marked(store.content)
})

onMounted(() => {
  store.fetchChangelog()
})
</script>

<style scoped>
.changelog-root {
  min-height: calc(100vh - 140px);
  padding: 4rem 2rem;
  background: var(--bg-primary);
}

.site-container {
  max-width: 900px;
  margin: 0 auto;
}

/* Header */
.changelog-header {
  text-align: center;
  margin-bottom: 4rem;
}

.page-title {
  margin: 0 0 1rem;
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-primary);
}

.page-description {
  margin: 0 0 2rem;
  font-size: 1.125rem;
  color: var(--text-secondary);
}

/* Loading & Error States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  color: var(--error-color, #ef4444);
}

/* Markdown Content Styles */
.changelog-content {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 3rem;
  line-height: 1.8;
}

.changelog-content :deep(h1) {
  margin: 0 0 2rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 1rem;
}

.changelog-content :deep(h2) {
  margin: 3rem 0 1.5rem;
  font-size: 2rem;
  font-weight: 600;
  color: var(--primary-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
}

.changelog-content :deep(h3) {
  margin: 2rem 0 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.changelog-content :deep(p) {
  margin: 0 0 1rem;
  color: var(--text-secondary);
}

.changelog-content :deep(ul) {
  margin: 0 0 1.5rem;
  padding-left: 2rem;
  list-style: none;
}

.changelog-content :deep(ul li) {
  margin-bottom: 0.75rem;
  color: var(--text-primary);
  position: relative;
  padding-left: 1.5rem;
}

.changelog-content :deep(ul li::before) {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-weight: bold;
  font-size: 1.2em;
}

.changelog-content :deep(code) {
  padding: 0.2rem 0.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
  color: var(--primary-color);
}

.changelog-content :deep(pre) {
  padding: 1.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow-x: auto;
  margin: 0 0 1.5rem;
}

.changelog-content :deep(pre code) {
  padding: 0;
  background: none;
  border: none;
  color: var(--text-primary);
}

.changelog-content :deep(strong) {
  font-weight: 600;
  color: var(--text-primary);
}

.changelog-content :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
  transition: opacity 0.2s;
}

.changelog-content :deep(a:hover) {
  opacity: 0.8;
  text-decoration: underline;
}

.changelog-content :deep(blockquote) {
  margin: 1.5rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid var(--primary-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.changelog-content :deep(hr) {
  margin: 2rem 0;
  border: none;
  border-top: 1px solid var(--border-color);
}

/* Responsive */
@media (max-width: 768px) {
  .changelog-root {
    padding: 2rem 1rem;
  }

  .changelog-header {
    margin-bottom: 2rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-description {
    font-size: 1rem;
  }

  .changelog-content {
    padding: 2rem 1.5rem;
  }

  .changelog-content :deep(h1) {
    font-size: 2rem;
  }

  .changelog-content :deep(h2) {
    font-size: 1.5rem;
  }

  .changelog-content :deep(h3) {
    font-size: 1.25rem;
  }

  .changelog-content :deep(ul) {
    padding-left: 1.5rem;
  }

  .changelog-content :deep(ul li) {
    padding-left: 1rem;
  }
}
</style>

