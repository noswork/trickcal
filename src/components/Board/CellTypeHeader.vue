<template>
  <div class="cell-header">
    <div class="cell-title">
      <div class="cell-icon" :class="cellType">
        <img 
          :src="getAssetUrl(cellTypeData.icon)" 
          :alt="$t(`cellTypes.${cellType}`)"
          @error="handleImageError"
        />
      </div>
      <div>
        <h3>{{ $t(`cellTypes.${cellType}`) }}</h3>
        <span class="cell-total">{{ $t(`layers.${boardStore.currentLayer}`) }}</span>
      </div>
    </div>
    <div class="cell-stats">
      <div class="cell-count">{{ activated }} / {{ total }}</div>
      <div class="cell-sub">{{ $t('panel.activated') }}</div>
      <div class="cell-percentages">
        <span class="activation-rate">
          {{ $t('panel.activationRate') }} {{ activationRate }}%
        </span>
        <span class="percentage-divider">·</span>
        <span class="bonus-percent">
          {{ $t('panel.totalBonus') }} +{{ totalBonusPercent }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBoardStore } from '@/stores/board'
import { getAssetUrl } from '@/utils/assets'

const props = defineProps<{
  cellType: string
  activated: number
  total: number
}>()

const boardStore = useBoardStore()

const cellTypeData = computed(() => {
  const types: Record<string, { icon: string; color: string }> = {
    attack: { icon: 'assets/icons/board_atk.webp', color: '#ff6b6b' },
    crit: { icon: 'assets/icons/board_crit.webp', color: '#fab005' },
    hp: { icon: 'assets/icons/board_hp.webp', color: '#ff8787' },
    critResist: { icon: 'assets/icons/board_critResist.webp', color: '#74c0fc' },
    defense: { icon: 'assets/icons/board_def.webp', color: '#da77f2' }
  }
  return types[props.cellType] || { icon: '', color: '#666' }
})

// 激活率百分比
const activationRate = computed(() => {
  return props.total > 0
    ? ((props.activated / props.total) * 100).toFixed(1)
    : '0.0'
})

// 總加成百分比
const totalBonusPercent = computed(() => {
  const bonusPerCell = boardStore.boardData?.boardConfig[boardStore.currentLayer]?.bonusPerCell || 0
  return (props.activated * bonusPerCell).toFixed(1)
})

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}
</script>

<style scoped>
.cell-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--border-color);
  gap: 1rem;
}

.cell-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cell-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-image: url('/assets/icons/board_base_3.webp');
  background-size: cover;
  background-position: center;
}

.cell-icon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.cell-title h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.cell-total {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.cell-stats {
  text-align: right;
}

.cell-count {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
}

.cell-sub {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.cell-percentages {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.activation-rate {
  color: var(--primary-color);
  font-weight: 600;
}

.bonus-percent {
  color: var(--success-color);
  font-weight: 600;
}

.percentage-divider {
  display: none;
}

@media (max-width: 768px) {
  .cell-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .cell-stats {
    text-align: left;
    width: 100%;
  }

  .cell-icon {
    width: 40px;
    height: 40px;
  }

  .cell-icon img {
    width: 28px;
    height: 28px;
  }

  .cell-title h3 {
    font-size: 1.125rem;
  }

  .cell-percentages {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.375rem;
  }

  .percentage-divider {
    display: inline;
    color: var(--text-secondary);
    margin: 0 0.25rem;
  }
}

@media (max-width: 480px) {
  .cell-percentages {
    font-size: 0.8125rem;
    gap: 0.375rem;
  }
}
</style>

