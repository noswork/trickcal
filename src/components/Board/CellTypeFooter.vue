<template>
  <div class="cell-footer">
    <div class="footer-left">
      <div class="footer-item">
        <img :src="getIconUrl('gold_crayon')" alt="金蠟筆" class="footer-icon" />
        <span class="footer-label">{{ $t('footer.costPerCell') }}</span>
        <span class="footer-value">{{ costPerCell }}</span>
      </div>
      <div class="footer-item">
        <span class="footer-label">{{ $t('footer.bonusPerCell') }}</span>
        <span class="footer-value bonus">+{{ bonusPerCell }}%</span>
      </div>
    </div>
    <div class="footer-right">
      <div class="bonus-stat">
        {{ $t('footer.totalBonus') }} <span class="bonus-value">+{{ totalBonus.toFixed(1) }}%</span>
      </div>
      <div class="crayon-needed">
        <img :src="getIconUrl('gold_crayon')" alt="金蠟筆" class="crayon-icon" />
        {{ $t('footer.crayonsNeeded') }} <span class="crayon-count">{{ crayonsNeeded }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBoardStore } from '@/stores/board'
import { getIconUrl } from '@/utils/assets'

const props = defineProps<{
  cellType: string
  activated: number
  total: number
}>()

const boardStore = useBoardStore()

const costMap: Record<string, number> = {
  layer1: 2,
  layer2: 4,
  layer3: 6
}

const costPerCell = computed(() => {
  return costMap[boardStore.currentLayer] || 2
})

const bonusPerCell = computed(() => {
  const bonuses: Record<string, number> = {
    layer1: 3,
    layer2: 4,
    layer3: 5
  }
  return bonuses[boardStore.currentLayer] || 3
})

const totalBonus = computed(() => {
  return props.activated * bonusPerCell.value
})

const crayonsNeeded = computed(() => {
  return (props.total - props.activated) * costPerCell.value
})
</script>

<style scoped>
.cell-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  gap: 1rem;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-icon,
.crayon-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.footer-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.footer-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.footer-value.bonus {
  color: var(--success-color);
}

.bonus-stat,
.crayon-needed {
  font-size: 0.875rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bonus-value,
.crayon-count {
  font-weight: 600;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .cell-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .footer-left,
  .footer-right {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    align-items: flex-start;
  }
}
</style>

