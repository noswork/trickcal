<template>
  <AppLayout>
    <div class="sweep-root">
      <img 
        class="background-image" 
        :src="getAssetUrl('assets/backgrounds/background.webp')" 
        alt=""
        aria-hidden="true"
      />
      <div class="background-overlay"></div>

      <main class="sweep-layout">
        <!-- 素材圖鑑面板 -->
        <section class="panel catalog-panel">
          <header>
            <h2>{{ $t('catalog.title') }}</h2>
            <div class="header-actions">
              <button class="clear-selection" type="button" @click="clearSelection">
                {{ $t('catalog.clear') }}
              </button>
              <div class="catalog-controls">
                <button class="catalog-nav prev" type="button" @click="prevPage" :disabled="currentPage === 1">
                  ‹
                </button>
                <span class="page-indicator">{{ pageText }}</span>
                <button class="catalog-nav next" type="button" @click="nextPage" :disabled="currentPage === totalPages">
                  ›
                </button>
              </div>
            </div>
          </header>

          <div class="filter-section">
            <div class="search-row">
              <label for="material-search">{{ $t('catalog.searchLabel') }}</label>
              <input
                id="material-search"
                v-model="searchTerm"
                type="search"
                :placeholder="$t('catalog.searchPlaceholder')"
              />
            </div>
          </div>

          <div class="catalog-grid">
            <MaterialCard
              v-for="material in paginatedMaterials"
              :key="material"
              :material-name="material"
              :selected="sweepStore.selectedMaterials.has(material)"
              @click="toggleMaterial(material)"
            />
          </div>
        </section>

        <!-- 方案面板 -->
        <section class="panel plan-panel">
          <header>
            <h2>{{ $t('plan.title') }}</h2>
          </header>

          <div v-if="sweepStore.selectedMaterials.size === 0" class="plan-summary">
            {{ $t('plan.empty') }}
          </div>

          <template v-else>
            <div class="plan-summary">
              {{ $t('plan.summary', { stages: sweepStore.plan.length }) }}
            </div>

            <div v-if="sweepStore.missingMaterials.length > 0" class="plan-warning">
              {{ $t('plan.warning', { count: sweepStore.missingMaterials.length }) }}
            </div>

            <details class="plan-details" open>
              <summary>{{ $t('plan.detailSummary') }}</summary>
              <ul class="stage-list">
                <li v-for="stage in sweepStore.plan" :key="stage" class="stage-item">
                  <details class="stage-details" open>
                    <summary class="stage-header">
                      <div class="stage-title">
                        <span>{{ stage }}</span>
                      </div>
                      <span class="stage-energy">{{ $t('plan.energyPerStage', { energy: 10 }) }}</span>
                    </summary>
                    
                    <div class="stage-content">
                      <div class="stage-materials">
                        <MaterialChip
                          v-for="material in getStageMaterials(stage)"
                          :key="material"
                          :material-name="material"
                          @click="toggleMaterial(material)"
                        />
                      </div>
                      
                      <!-- 顯示替代關卡信息 -->
                      <div v-if="sweepStore.alternativeStages.has(stage)" class="alternative-stages">
                        <div class="alternative-header">
                          {{ $t('plan.alternativeStagesHint') }}
                        </div>
                        <div class="alternative-stages-scroll">
                          <div 
                            v-for="alt in sweepStore.alternativeStages.get(stage)" 
                            :key="alt.stage"
                            class="alternative-item"
                          >
                            <div class="alternative-stage-name">{{ alt.stage }}</div>
                            <div class="alternative-blueprints">
                              <MaterialChip
                                v-for="materialName in alt.materials"
                                :key="materialName"
                                :material-name="materialName"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>
                </li>
              </ul>
            </details>
          </template>
        </section>
      </main>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSweepStore } from '@/stores/sweep'
import { useTracking } from '@/composables/useTracking'
import AppLayout from '@/components/Layout/AppLayout.vue'
import MaterialCard from '@/components/Sweep/MaterialCard.vue'
import MaterialChip from '@/components/Sweep/MaterialChip.vue'
import { getAssetUrl } from '@/utils/assets'

const { t } = useI18n()
const sweepStore = useSweepStore()
const tracking = useTracking('sweep')

const searchTerm = ref('')
const currentPage = ref(1)
const pageSize = 24

const filteredMaterials = computed(() => {
  // 根據搜索詞過濾
  let filtered = sweepStore.materials
  
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(name => 
      name.toLowerCase().includes(term)
    )
  }
  
  return filtered
})

// 監聽搜索條件變化，重置到第一頁
watch(searchTerm, () => {
  currentPage.value = 1
})

const totalPages = computed(() => 
  Math.max(1, Math.ceil(filteredMaterials.value.length / pageSize))
)

const paginatedMaterials = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredMaterials.value.slice(start, start + pageSize)
})

const pageText = computed(() => 
  t('catalog.page', {
    current: currentPage.value,
    total: totalPages.value
  })
)

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    tracking.sweep.changePage(currentPage.value)
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    tracking.sweep.changePage(currentPage.value)
  }
}

function toggleMaterial(material: string) {
  sweepStore.toggleMaterial(material)
  tracking.sweep.toggleMaterial(material)
}

function clearSelection() {
  sweepStore.clearSelection()
  tracking.sweep.clearSelection()
}

function getStageMaterials(stage: string) {
  const materials = sweepStore.stageData[stage] || []
  return materials.filter(m => sweepStore.selectedMaterials.has(m))
}

onMounted(async () => {
  await sweepStore.loadData()
})

// 追蹤搜索（使用 debounce 避免過多追蹤）
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchTerm, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (value.trim().length > 0) {
      tracking.sweep.search(value.trim())
    }
  }, 500) // 500ms debounce
})
</script>

<style scoped>
.sweep-root {
  position: relative;
  min-height: calc(100vh - 140px);
}

.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -2;
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

.sweep-layout {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 480px;
  gap: 2rem;
}

.panel {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.panel header {
  margin-bottom: 1rem;
}

.panel header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.clear-selection {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--button-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s;
}

.clear-selection:hover {
  background: var(--button-hover);
}

.catalog-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.catalog-nav {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--button-bg);
  color: var(--text-primary);
  font-size: 1.25rem;
  transition: all 0.2s;
}

.catalog-nav:hover:not(:disabled) {
  background: var(--button-hover);
}

.catalog-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-row label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.search-row input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.search-row input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
}

.plan-panel {
  position: sticky;
  top: 90px;
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.plan-summary {
  padding: 1rem;
  background: var(--panel-bg);
  border-radius: 8px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  margin-bottom: 0.75rem;
}

.plan-warning {
  padding: 0.75rem;
  background: var(--warning-bg);
  border-left: 3px solid var(--warning-color);
  border-radius: 6px;
  color: var(--warning-text);
  font-size: 0.8125rem;
  margin-bottom: 0.75rem;
}

.plan-details {
  background: var(--panel-bg);
  border-radius: 8px;
  padding: 0.75rem;
}

.plan-details summary {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.stage-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.stage-list li {
  margin-bottom: 0.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
}

.stage-list li:last-child {
  margin-bottom: 0;
}

.stage-details {
  border: none;
}

.stage-details[open] > summary::before {
  transform: rotate(90deg);
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  user-select: none;
  list-style: none;
  position: relative;
}

.stage-header::-webkit-details-marker {
  display: none;
}

.stage-header::before {
  content: '▶';
  position: absolute;
  left: -0.5rem;
  font-size: 0.625rem;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.stage-header:hover {
  background: var(--panel-bg);
}

.stage-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stage-energy {
  color: var(--text-secondary);
}

.stage-content {
  padding: 0 0.75rem 0.75rem 0.75rem;
}

.stage-materials {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.alternative-stages {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--border-color);
}

.alternative-header {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.alternative-stages .alternative-stages-scroll {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 0.5rem;
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 0.5rem;
}

.alternative-stages-scroll::-webkit-scrollbar {
  width: 6px;
}

.alternative-stages-scroll::-webkit-scrollbar-track {
  background: var(--panel-bg);
  border-radius: 3px;
}

.alternative-stages-scroll::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.alternative-stages-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

.alternative-stages .alternative-item {
  padding: 0.5rem;
  background: var(--panel-bg);
  border-radius: 6px;
  border: 1px solid var(--border-color);
  display: flex !important;
  flex-direction: column !important;
  height: 100%;
  min-width: 0;
}

.alternative-stage-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.375rem;
}

.alternative-blueprints {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  flex: 1;
}

.alternative-blueprints .material-chip {
  padding: 0.25rem;
}

.alternative-blueprints .material-chip img {
  width: 32px;
  height: 32px;
}

@media (max-width: 1200px) {
  .sweep-layout {
    grid-template-columns: 1fr;
  }

  .plan-panel {
    position: static;
    max-height: none;
  }
}

@media (max-width: 768px) {
  .sweep-layout {
    padding: 1rem;
    gap: 1.5rem;
  }

  .panel {
    padding: 1.5rem;
  }

  .panel header h2 {
    font-size: 1.25rem;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .catalog-controls {
    width: 100%;
    justify-content: center;
  }

  .catalog-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.75rem;
  }

  .search-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-row label {
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .sweep-layout {
    padding: 0.75rem;
    gap: 1rem;
  }

  .panel {
    padding: 1rem;
    border-radius: 12px;
  }

  .panel header h2 {
    font-size: 1.125rem;
  }

  .catalog-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .clear-selection {
    font-size: 0.8125rem;
    padding: 0.375rem 0.75rem;
  }

  .catalog-nav {
    width: 28px;
    height: 28px;
    font-size: 1.125rem;
  }

  .page-indicator {
    font-size: 0.8125rem;
  }
}
</style>

