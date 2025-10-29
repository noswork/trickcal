<template>
  <AppLayout>
    <div class="board-root with-background">
      <!-- 背景圖片 -->
      <img 
        class="background-image" 
        :src="getAssetUrl('assets/backgrounds/background.webp')" 
        alt=""
        aria-hidden="true"
      />
      <div class="background-overlay"></div>
      
      <main class="board-layout">
        <!-- 左側面板：層級總覽 -->
        <aside class="panel layer-panel" :class="{ 'mobile-open': leftPanelOpen }">
          <div class="panel-header">
            <h3>{{ $t('board.layerPanel') || '層級選擇' }}</h3>
            <button 
              class="panel-close" 
              @click="leftPanelOpen = false"
              aria-label="關閉面板"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="layer-tabs">
            <button
              v-for="layer in (['layer1', 'layer2', 'layer3'] as const)"
              :key="layer"
              class="tab-btn"
              :class="{ active: boardStore.currentLayer === layer }"
              @click="boardStore.currentLayer = layer"
            >
              {{ $t(`layers.${layer}`) }}
            </button>
          </div>
          <div class="panel-card">
            <LayerSummary />
          </div>
        </aside>

        <!-- 中央區域：棋盤 -->
        <section class="board-stage">
          <div class="board-stage-header">
            <h2>{{ $t(`layers.${boardStore.currentLayer}`) }}</h2>
            <button class="settings-btn" @click="showSettings = true">
              {{ $t('nav.settings') }}
            </button>
          </div>

          <div class="board-stage-body">
            <!-- 格子類型分頁 -->
            <div class="board-pagination">
              <button
                v-for="cellType in cellTypes"
                :key="cellType"
                class="page-btn"
                :class="{ active: boardStore.currentCellType === cellType }"
                @click="boardStore.currentCellType = cellType"
              >
                {{ $t(`cellTypes.${cellType}`) }}
              </button>
            </div>

            <!-- 格子類型標題 -->
            <CellTypeHeader
              :cell-type="boardStore.currentCellType"
              :activated="cellStats.activated"
              :total="cellStats.total"
            />

            <!-- 角色網格 -->
            <div class="board-grid">
              <CharacterCard
                v-for="char in filteredCharacters"
                :key="char.name"
                :character="char"
                :cell-type="boardStore.currentCellType"
                @click="handleCharacterClick(char)"
              />
            </div>

            <!-- 格子類型底部統計 -->
            <CellTypeFooter
              :cell-type="boardStore.currentCellType"
              :activated="cellStats.activated"
              :total="cellStats.total"
            />
          </div>
        </section>

        <!-- 右側面板：統計 -->
        <aside class="panel insight-panel" :class="{ 'mobile-open': rightPanelOpen }">
          <div class="panel-header">
            <h3>{{ $t('board.statsPanel') || '統計資訊' }}</h3>
            <button 
              class="panel-close" 
              @click="rightPanelOpen = false"
              aria-label="關閉面板"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="panel-card">
            <OwnershipStats />
          </div>
          <div class="panel-card">
            <ResourceSummary />
          </div>
        </aside>
      </main>

      <!-- 手機端浮動按鈕 -->
      <div class="mobile-fab-group">
        <FloatingButton
          icon="layers"
          :label="$t('board.layerPanel') || '層級選擇'"
          :is-active="leftPanelOpen"
          @click="toggleLeftPanel"
        />
        <FloatingButton
          icon="stats"
          :label="$t('board.statsPanel') || '統計資訊'"
          :is-active="rightPanelOpen"
          @click="toggleRightPanel"
        />
      </div>

      <!-- 遮罩層（手機端） -->
      <div 
        v-if="leftPanelOpen || rightPanelOpen" 
        class="mobile-overlay"
        @click="closeAllPanels"
      ></div>

      <!-- 設置面板 -->
      <CharacterSettings v-model:show="showSettings" />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useBoardStore } from '@/stores/board'
import { useTracking } from '@/composables/useTracking'
import AppLayout from '@/components/Layout/AppLayout.vue'
import LayerSummary from '@/components/Board/LayerSummary.vue'
import CharacterCard from '@/components/Board/CharacterCard.vue'
import CellTypeHeader from '@/components/Board/CellTypeHeader.vue'
import CellTypeFooter from '@/components/Board/CellTypeFooter.vue'
import OwnershipStats from '@/components/Board/OwnershipStats.vue'
import ResourceSummary from '@/components/Board/ResourceSummary.vue'
import CharacterSettings from '@/components/Board/CharacterSettings.vue'
import FloatingButton from '@/components/Board/FloatingButton.vue'
import type { Character } from '@/stores/board'
import { getAssetUrl } from '@/utils/assets'

const boardStore = useBoardStore()
const tracking = useTracking('board')
const showSettings = ref(false)
const leftPanelOpen = ref(false)
const rightPanelOpen = ref(false)

const cellTypes = ['attack', 'crit', 'hp', 'critResist', 'defense']

const filteredCharacters = computed(() => {
  if (!boardStore.characters || boardStore.characters.length === 0) return []
  
  return boardStore.characters.filter(char => {
    const boardTypes = char.boardTypes?.[boardStore.currentLayer]
    return boardTypes && boardTypes.includes(boardStore.currentCellType)
  })
})

const cellStats = computed(() => {
  const total = filteredCharacters.value.length
  let activated = 0
  
  filteredCharacters.value.forEach(char => {
    const cellKey = `${char.name}_${boardStore.currentLayer}_${boardStore.currentCellType}`
    if (boardStore.userProgress.activatedCells[cellKey] === true) {
      activated++
    }
  })
  
  return { total, activated }
})

function handleCharacterClick(char: Character) {
  boardStore.toggleCellActivation(char, boardStore.currentCellType)
  // 追蹤格子點擊
  tracking.board.toggleCell(char.name, boardStore.currentCellType, boardStore.currentLayer)
}

function toggleLeftPanel() {
  leftPanelOpen.value = !leftPanelOpen.value
  if (leftPanelOpen.value) {
    rightPanelOpen.value = false
  }
}

function toggleRightPanel() {
  rightPanelOpen.value = !rightPanelOpen.value
  if (rightPanelOpen.value) {
    leftPanelOpen.value = false
  }
}

function closeAllPanels() {
  leftPanelOpen.value = false
  rightPanelOpen.value = false
}

onMounted(async () => {
  await boardStore.loadGameData()
  boardStore.loadUserProgress()
})

// 追蹤層級切換
watch(() => boardStore.currentLayer, (newLayer) => {
  tracking.board.changeLayer(newLayer)
})

// 追蹤格子類型切換
watch(() => boardStore.currentCellType, (newType) => {
  tracking.board.changeCellType(newType)
})

// 追蹤設置打開
watch(showSettings, (value) => {
  if (value) {
    tracking.board.openSettings()
  }
})
</script>

<style scoped>
.board-root {
  position: relative;
  min-height: calc(100vh - 140px);
}

.with-background {
  position: relative;
  overflow: hidden;
}

.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -2;
  opacity: 0.3;
}

.background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--overlay-bg);
  z-index: -1;
}

.board-layout {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: 2rem;
}

.panel {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.layer-panel,
.insight-panel {
  position: sticky;
  top: 90px;
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.layer-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.panel-card {
  background: var(--panel-bg);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.panel-card:last-child {
  margin-bottom: 0;
}

.board-stage {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.board-stage-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.board-stage-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.settings-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--button-bg, rgba(0, 0, 0, 0.03));
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.settings-btn:hover {
  background: var(--button-hover, rgba(0, 0, 0, 0.08));
  border-color: var(--primary-color);
}

.board-pagination {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.page-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.page-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.page-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

/* 手機端浮動按鈕組 */
.mobile-fab-group {
  position: fixed;
  bottom: 2rem;
  right: 1rem;
  display: none;
  flex-direction: column;
  gap: 1rem;
  z-index: 1000;
}

.mobile-overlay {
  display: none;
}

.panel-header {
  display: none;
}

.panel-close {
  display: none;
}

@media (max-width: 1200px) {
  .board-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .layer-panel,
  .insight-panel {
    position: static;
    max-height: none;
  }
}

@media (max-width: 768px) {
  .board-layout {
    padding: 1rem;
    gap: 1rem;
    grid-template-columns: 1fr;
  }

  /* 隱藏側邊欄，改為抽屜式 */
  .layer-panel,
  .insight-panel {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 85%;
    max-width: 320px;
    height: 100vh;
    max-height: none;
    z-index: 1001;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
    padding: 1rem;
  }

  .layer-panel {
    left: 0;
  }

  .insight-panel {
    right: 0;
    left: auto;
    transform: translateX(100%);
  }

  .layer-panel.mobile-open {
    transform: translateX(0);
  }

  .insight-panel.mobile-open {
    transform: translateX(0);
  }

  /* 面板標題 */
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .panel-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .panel-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: var(--hover-bg);
    color: var(--text-secondary);
    transition: all 0.2s;
  }

  .panel-close:hover {
    background: var(--secondary-hover);
    color: var(--text-primary);
  }

  /* 顯示浮動按鈕 */
  .mobile-fab-group {
    display: flex;
  }

  /* 遮罩層 */
  .mobile-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }

  .board-stage {
    padding: 1rem;
  }

  .board-stage-header h2 {
    font-size: 1.25rem;
  }

  .layer-tabs {
    gap: 0.5rem;
  }

  .tab-btn {
    padding: 0.75rem;
  }

  .panel-card {
    padding: 1rem;
  }

  .board-pagination {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .page-btn {
    padding: 0.75rem;
    font-size: 0.875rem;
  }

  .board-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .board-root {
    min-height: calc(100vh - 60px);
  }

  .board-layout {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .board-stage {
    padding: 0.75rem;
    border-radius: 12px;
  }

  .layer-panel,
  .insight-panel {
    width: 90%;
    max-width: 300px;
    padding: 0.875rem;
  }

  .board-stage-header {
    margin-bottom: 1rem;
  }

  .board-stage-header h2 {
    font-size: 1.125rem;
  }

  .board-pagination {
    margin-bottom: 1rem;
    grid-template-columns: 1fr 1fr;
  }

  .page-btn {
    padding: 0.625rem;
    font-size: 0.8125rem;
  }

  .board-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .tab-btn {
    padding: 0.625rem;
    font-size: 0.8125rem;
  }

  .mobile-fab-group {
    bottom: 1.5rem;
    right: 0.75rem;
    gap: 0.75rem;
  }

  .panel-header h3 {
    font-size: 1rem;
  }

  .panel-card {
    padding: 0.875rem;
  }
}
</style>

