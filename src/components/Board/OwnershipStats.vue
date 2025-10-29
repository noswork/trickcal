<template>
  <div class="ownership-stats">
    <h3>{{ $t('panel.ownershipStats') }}</h3>
    
    <div class="stat-row">
      <span class="stat-label">{{ $t('panel.ownedCharacters') }}</span>
      <span class="stat-value count">{{ stats?.ownedCharacters || 0 }} / {{ stats?.totalCharacters || 0 }}</span>
    </div>
    
    <div class="stat-row">
      <span class="stat-label">{{ $t('panel.ownershipRate') }}</span>
      <span class="stat-value percent">{{ stats?.ownedRate || 0 }}%</span>
    </div>
    
    <div class="stat-row">
      <span class="stat-label">{{ $t('panel.activatedCells') }}</span>
      <span class="stat-value count">{{ stats?.activatedCells || 0 }} / {{ stats?.totalCells || 0 }}</span>
    </div>
    
    <div class="stat-row">
      <span class="stat-label">{{ $t('panel.cellCompletionRate') }}</span>
      <span class="stat-value percent">{{ stats?.activationRate || 0 }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBoardStore } from '@/stores/board'

const boardStore = useBoardStore()
const stats = computed(() => boardStore.stats)
</script>

<style scoped>
.ownership-stats {
  color: var(--text-primary);
}

.ownership-stats h3 {
  margin: 0 0 1.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-value.percent,
.stat-value.count {
  color: var(--primary-color);
}
</style>

