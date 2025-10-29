<template>
  <div class="tool-selector" v-click-outside="closeDropdown">
    <button 
      class="tool-selector-trigger"
      :class="{ active: isOpen }"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      aria-haspopup="true"
    >
      <div class="current-tool">
        <img 
          :src="getAssetUrl(currentTool.icon)" 
          :alt="currentTool.name"
          class="tool-icon"
          loading="lazy"
        />
        <span class="tool-name">{{ $t(currentTool.nameKey) }}</span>
      </div>
      <svg 
        class="dropdown-arrow" 
        :class="{ rotated: isOpen }"
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none"
      >
        <path 
          d="M6 9L12 15L18 9" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="tool-dropdown">
        <div class="dropdown-header">
          <h3>{{ $t('nav.selectTool') }}</h3>
        </div>
        <div class="tool-list">
          <button
            v-for="tool in tools"
            :key="tool.path"
            class="tool-item"
            :class="{ active: $route.path === tool.path }"
            @click="selectTool(tool)"
          >
            <img 
              :src="getAssetUrl(tool.icon)" 
              :alt="tool.name"
              class="tool-icon"
              loading="lazy"
            />
            <div class="tool-info">
              <span class="tool-name">{{ $t(tool.nameKey) }}</span>
              <span class="tool-description">{{ $t(tool.descriptionKey) }}</span>
            </div>
            <div v-if="tool.badge" class="tool-badge">{{ tool.badge }}</div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getAssetUrl } from '@/utils/assets'

const router = useRouter()
const route = useRoute()
const { t: $t } = useI18n()

const isOpen = ref(false)

// 工具列表配置
const tools = [
  {
    path: '/',
    name: 'Home',
    nameKey: 'nav.home',
    descriptionKey: 'nav.homeDescription',
    icon: 'assets/icons/home.png',
    badge: null as string | null
  },
  {
    path: '/board',
    name: 'Board',
    nameKey: 'nav.board',
    descriptionKey: 'nav.boardDescription',
    icon: 'assets/icons/gold_crayon.png',
    badge: null as string | null
  },
  {
    path: '/sweep',
    name: 'Sweep',
    nameKey: 'nav.sweep',
    descriptionKey: 'nav.sweepDescription',
    icon: 'assets/icons/sweep.png',
    badge: null as string | null
  }
]

// 當前工具
const currentTool = computed(() => {
  return tools.find(tool => tool.path === route.path) || tools[0]
})

// 切換下拉清單
function toggleDropdown() {
  isOpen.value = !isOpen.value
}

// 關閉下拉清單
function closeDropdown() {
  isOpen.value = false
}

// 選擇工具
function selectTool(tool: typeof tools[0]) {
  if (tool.path !== route.path) {
    router.push(tool.path)
  }
  closeDropdown()
}

// 點擊外部關閉指令
const vClickOutside = {
  mounted(el: HTMLElement & { clickOutsideEvent?: (event: Event) => void }, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: HTMLElement & { clickOutsideEvent?: (event: Event) => void }) {
    if (el.clickOutsideEvent) {
      document.removeEventListener('click', el.clickOutsideEvent)
    }
  }
}
</script>

<style scoped>
.tool-selector {
  position: relative;
  display: inline-block;
}

.tool-selector-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--site-font);
  min-width: 140px;
}

.tool-selector-trigger:hover {
  border-color: var(--primary-color);
  background: var(--primary-bg);
}

.tool-selector-trigger.active {
  border-color: var(--primary-color);
  background: var(--primary-bg);
}

.current-tool {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.tool-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.tool-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.dropdown-arrow {
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.tool-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  overflow: hidden;
  min-width: 280px;
}

.dropdown-header {
  padding: 1rem 1rem 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.dropdown-header h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tool-list {
  padding: 0.5rem;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-family: var(--site-font);
  position: relative;
}

.tool-item:hover {
  background: var(--hover-bg);
}

.tool-item.active {
  background: var(--primary-bg);
  border: 1px solid var(--primary-color);
}

.tool-item .tool-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  flex-shrink: 0;
}

.tool-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.tool-item .tool-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.tool-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.3;
}

.tool-badge {
  background: var(--primary-color);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 下拉動畫 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .tool-selector-trigger {
    min-width: 120px;
    padding: 0.375rem 0.5rem;
  }
  
  .tool-name {
    font-size: 0.8125rem;
  }
  
  .tool-dropdown {
    min-width: 260px;
  }
  
  .tool-item {
    padding: 0.625rem;
  }
  
  .tool-item .tool-icon {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .tool-selector-trigger {
    min-width: 100px;
  }
  
  .tool-name {
    display: none;
  }
  
  .tool-dropdown {
    min-width: 240px;
  }
}
</style>
