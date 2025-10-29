<template>
  <div class="layer-summary">
    <h3 class="summary-title">{{ $t('panel.layerSummary') }}</h3>
    
    <div class="summary-progress">
      <div class="progress-ring">
        <svg viewBox="0 0 120 120">
          <circle class="ring-bg" cx="60" cy="60" r="52"></circle>
          <circle 
            class="ring-progress" 
            cx="60" 
            cy="60" 
            r="52" 
            :stroke-dasharray="Math.PI * 104"
            :stroke-dashoffset="Math.PI * 104 * (1 - completionRate / 100)"
          ></circle>
        </svg>
        <span class="progress-text">{{ completionRate }}%</span>
      </div>
      
      <div class="summary-details">
        <p>{{ $t('panel.activated') }} <strong>{{ activatedSlots }}</strong> / {{ totalSlots }}</p>
        <p>{{ $t('panel.totalBonus') }} <strong>+{{ totalBonus.toFixed(1) }}%</strong></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBoardStore } from '@/stores/board'

const boardStore = useBoardStore()

const stats = computed(() => {
  if (!boardStore.gameData) return { totalSlots: 0, activatedSlots: 0, completionRate: 0, totalBonus: 0 }
  
  const layer = boardStore.currentLayer
  const characters = boardStore.gameData.characters
  let totalSlots = 0
  let activatedSlots = 0

  characters.forEach(char => {
    const boardTypes = char.boardTypes?.[layer]
    if (boardTypes && Array.isArray(boardTypes)) {
      totalSlots += boardTypes.length
      boardTypes.forEach(type => {
        const key = `${char.name}_${layer}_${type}`
        if (boardStore.userProgress.activatedCells[key]) {
          activatedSlots++
        }
      })
    }
  })

  const bonusPerCell = boardStore.gameData.boardConfig[layer]?.bonusPerCell || 0
  const totalBonus = activatedSlots * bonusPerCell
  const completionRate = totalSlots ? Math.round((activatedSlots / totalSlots) * 100) : 0

  return { totalSlots, activatedSlots, completionRate, totalBonus }
})

const totalSlots = computed(() => stats.value.totalSlots)
const activatedSlots = computed(() => stats.value.activatedSlots)
const completionRate = computed(() => stats.value.completionRate)
const totalBonus = computed(() => stats.value.totalBonus)
</script>

<style scoped>
.layer-summary {
  color: var(--text-primary);
}

.summary-title {
  margin: 0 0 1.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.summary-progress {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.progress-ring {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.progress-ring svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.ring-bg {
  fill: none;
  stroke: var(--progress-bg);
  stroke-width: 8;
}

.ring-progress {
  fill: none;
  stroke: var(--primary-color);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
}

.summary-details {
  flex: 1;
}

.summary-details p {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.summary-details p:last-child {
  margin-bottom: 0;
}

.summary-details strong {
  color: var(--text-primary);
  font-weight: 600;
}
</style>

