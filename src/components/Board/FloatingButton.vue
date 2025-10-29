<template>
  <button 
    class="floating-btn"
    :class="{ active: isActive }"
    @click="$emit('click')"
    :aria-label="label"
  >
    <svg 
      v-if="icon === 'layers'" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <svg 
      v-else-if="icon === 'stats'" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <svg 
      v-else-if="icon === 'close'" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <svg 
      v-else-if="icon === 'menu'" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span v-if="badge" class="badge">{{ badge }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: 'layers' | 'stats' | 'close' | 'menu'
  label: string
  isActive?: boolean
  badge?: string | number
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.floating-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 16px;
  background: var(--primary-color);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(255, 95, 114, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
}

.floating-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2), 0 12px 32px rgba(255, 95, 114, 0.4);
}

.floating-btn:active {
  transform: translateY(0);
}

.floating-btn.active {
  background: var(--text-secondary);
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--warning-color);
  color: var(--warning-text);
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 10px;
  border: 2px solid var(--card-bg);
}

[data-theme="dark"] .badge {
  color: #1a1a1a;
}
</style>

