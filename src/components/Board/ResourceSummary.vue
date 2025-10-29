<template>
  <div class="resource-summary">
    <h3>{{ $t('panel.resourceSummary') }}</h3>
    
    <div class="stat-row">
      <img src="/assets/icons/gold_crayon.png" alt="金蠟筆" class="stat-icon">
      <span class="stat-label">{{ $t('panel.currentLayerNeed') }}</span>
      <span class="stat-value resource">{{ currentLayerCrayons }}</span>
    </div>
    
    <div class="stat-row">
      <img src="/assets/icons/gold_crayon.png" alt="金蠟筆" class="stat-icon">
      <span class="stat-label">{{ $t('panel.allLayersNeed') }}</span>
      <span class="stat-value resource">{{ totalCrayons }}</span>
    </div>
    
    <div class="stat-row">
      <span class="stat-label">{{ $t('panel.currentLayerBonus') }}</span>
      <span class="stat-value percent">+{{ currentLayerBonus.toFixed(1) }}%</span>
    </div>
    
    <div class="stat-row">
      <span class="stat-label">{{ $t('panel.allLayersBonus') }}</span>
      <span class="stat-value percent">+{{ allLayersBonus.toFixed(1) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBoardStore } from '@/stores/board'

const boardStore = useBoardStore()

const costMap: Record<string, number> = { 'layer1': 2, 'layer2': 4, 'layer3': 6 }

const currentLayerCrayons = computed(() => {
  if (!boardStore.gameData) return 0
  const layer = boardStore.currentLayer
  const cost = costMap[layer] || 2
  
  let total = 0
  let activated = 0
  
  boardStore.gameData.characters.forEach(char => {
    const types = char.boardTypes?.[layer]
    if (types && Array.isArray(types)) {
      total += types.length
      types.forEach(type => {
        const key = `${char.name}_${layer}_${type}`
        if (boardStore.userProgress.activatedCells[key]) activated++
      })
    }
  })
  
  return (total - activated) * cost
})

const totalCrayons = computed(() => {
  if (!boardStore.gameData) return 0
  
  return Object.keys(boardStore.gameData.boardConfig).reduce((sum, layer) => {
    const cost = costMap[layer] || 2
    let total = 0
    let activated = 0
    
    boardStore.gameData!.characters.forEach(char => {
      const types = char.boardTypes?.[layer]
      if (types && Array.isArray(types)) {
        total += types.length
        types.forEach(type => {
          const key = `${char.name}_${layer}_${type}`
          if (boardStore.userProgress.activatedCells[key]) activated++
        })
      }
    })
    
    return sum + ((total - activated) * cost)
  }, 0)
})

const currentLayerBonus = computed(() => {
  if (!boardStore.gameData) return 0
  const layer = boardStore.currentLayer
  const bonusPerCell = boardStore.gameData.boardConfig[layer]?.bonusPerCell || 0
  
  let activated = 0
  boardStore.gameData.characters.forEach(char => {
    const types = char.boardTypes?.[layer]
    if (types && Array.isArray(types)) {
      types.forEach(type => {
        const key = `${char.name}_${layer}_${type}`
        if (boardStore.userProgress.activatedCells[key]) activated++
      })
    }
  })
  
  return activated * bonusPerCell
})

const allLayersBonus = computed(() => {
  if (!boardStore.gameData) return 0
  
  return Object.keys(boardStore.gameData.boardConfig).reduce((sum, layer) => {
    const bonusPerCell = boardStore.gameData!.boardConfig[layer]?.bonusPerCell || 0
    let activated = 0
    
    boardStore.gameData!.characters.forEach(char => {
      const types = char.boardTypes?.[layer]
      if (types && Array.isArray(types)) {
        types.forEach(type => {
          const key = `${char.name}_${layer}_${type}`
          if (boardStore.userProgress.activatedCells[key]) activated++
        })
      }
    })
    
    return sum + (activated * bonusPerCell)
  }, 0)
})
</script>

<style scoped>
.resource-summary {
  color: var(--text-primary);
}

.resource-summary h3 {
  margin: 0 0 1.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.stat-label {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  flex-shrink: 0;
}

.stat-value.percent {
  color: var(--success-color);
}

.stat-value.resource {
  color: var(--warning-color);
}
</style>

