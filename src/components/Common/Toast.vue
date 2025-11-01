<template>
  <Transition name="toast">
    <div v-if="visible" class="toast" :class="type">
      <div class="toast-icon">
        <svg v-if="type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else-if="type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <svg v-else-if="type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="toast-message">{{ message }}</div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

export interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  duration: 3000,
})

const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

function show() {
  visible.value = true
  
  if (timer) {
    clearTimeout(timer)
  }
  
  timer = setTimeout(() => {
    visible.value = false
  }, props.duration)
}

function hide() {
  visible.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

// 監聽 message 變化，自動顯示
watch(() => props.message, (newVal) => {
  if (newVal) {
    show()
  }
})

defineExpose({ show, hide })
</script>

<style scoped>
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 280px;
  max-width: 500px;
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-message {
  flex: 1;
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  word-break: break-word;
}

/* Success */
.toast.success {
  border-color: #10b981;
}

.toast.success .toast-icon {
  color: #10b981;
}

/* Error */
.toast.error {
  border-color: #ef4444;
}

.toast.error .toast-icon {
  color: #ef4444;
}

/* Warning */
.toast.warning {
  border-color: #f59e0b;
}

.toast.warning .toast-icon {
  color: #f59e0b;
}

/* Info */
.toast.info {
  border-color: #3b82f6;
}

.toast.info .toast-icon {
  color: #3b82f6;
}

/* Transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

@media (max-width: 768px) {
  .toast {
    top: 60px;
    min-width: calc(100vw - 2rem);
    max-width: calc(100vw - 2rem);
  }
}
</style>

