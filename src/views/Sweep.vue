<template>
  <AppLayout>
    <div class="sweep-root">
      <img 
        class="background-image" 
        :src="getAssetUrl('assets/backgrounds/background.png')" 
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

          <div class="search-row">
            <label for="material-search">{{ $t('catalog.searchLabel') }}</label>
            <input
              id="material-search"
              v-model="searchTerm"
              type="search"
              :placeholder="$t('catalog.searchPlaceholder')"
            />
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
                <li v-for="stage in sweepStore.plan" :key="stage">
                  <div class="stage-header">
                    <span>{{ stage }}</span>
                    <span>{{ $t('plan.energyPerStage', { energy: 10 }) }}</span>
                  </div>
                  <div class="stage-materials">
                    <MaterialChip
                      v-for="material in getStageMaterials(stage)"
                      :key="material"
                      :material-name="material"
                      @click="toggleMaterial(material)"
                    />
                  </div>
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
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSweepStore } from '@/stores/sweep'
import AppLayout from '@/components/Layout/AppLayout.vue'
import MaterialCard from '@/components/Sweep/MaterialCard.vue'
import MaterialChip from '@/components/Sweep/MaterialChip.vue'
import { getAssetUrl } from '@/utils/assets'

const { t } = useI18n()
const sweepStore = useSweepStore()

const searchTerm = ref('')
const currentPage = ref(1)
const pageSize = 24

const filteredMaterials = computed(() => {
  if (!searchTerm.value) return sweepStore.materials
  
  const term = searchTerm.value.toLowerCase()
  const filtered = sweepStore.materials.filter(name => 
    name.toLowerCase().includes(term)
  )
  
  // 搜索時重置到第一頁
  if (currentPage.value > 1) {
    currentPage.value = 1
  }
  
  return filtered
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
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function toggleMaterial(material: string) {
  sweepStore.toggleMaterial(material)
}

function clearSelection() {
  sweepStore.clearSelection()
}

function getStageMaterials(stage: string) {
  const materials = sweepStore.stageData[stage] || []
  return materials.filter(m => sweepStore.selectedMaterials.has(m))
}

onMounted(async () => {
  await sweepStore.loadData()
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
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.panel {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.panel header {
  margin-bottom: 1.5rem;
}

.panel header h2 {
  margin: 0;
  font-size: 1.5rem;
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
  cursor: pointer;
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
  cursor: pointer;
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

.search-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
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
  padding: 1.5rem;
  background: var(--panel-bg);
  border-radius: 12px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.plan-warning {
  padding: 1rem;
  background: var(--warning-bg);
  border-left: 4px solid var(--warning-color);
  border-radius: 8px;
  color: var(--warning-text);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.plan-details {
  background: var(--panel-bg);
  border-radius: 12px;
  padding: 1rem;
}

.plan-details summary {
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  margin-bottom: 1rem;
}

.stage-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.stage-list li {
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.stage-list li:last-child {
  margin-bottom: 0;
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.stage-materials {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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

