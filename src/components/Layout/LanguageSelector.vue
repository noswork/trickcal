<template>
  <div class="language-selector" v-click-outside="closeDropdown">
    <button 
      class="language-btn" 
      @click="toggleDropdown"
      :aria-label="$t('nav.language')"
      :aria-expanded="isOpen"
    >
      <span class="language-text">{{ currentLanguageName }}</span>
      <svg 
        class="dropdown-icon" 
        :class="{ open: isOpen }"
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none"
      >
        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <transition name="dropdown">
      <div v-if="isOpen" class="language-dropdown">
        <button
          v-for="lang in languages"
          :key="lang.value"
          class="language-option"
          :class="{ active: currentLocale === lang.value }"
          @click="selectLanguage(lang.value)"
        >
          <span class="option-text">{{ lang.label }}</span>
          <svg v-if="currentLocale === lang.value" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLanguage, type Locale } from '@/i18n'

const { locale } = useI18n()
const currentLocale = ref<Locale>(locale.value as Locale)
const isOpen = ref(false)

const languages = [
  { value: 'zh-TW' as Locale, label: '繁體中文' },
  { value: 'zh-CN' as Locale, label: '简体中文' },
  { value: 'en' as Locale, label: 'English' },
  { value: 'ja' as Locale, label: '日本語' },
  { value: 'ko' as Locale, label: '한국어' }
]

const currentLanguageName = computed(() => {
  return languages.find(l => l.value === currentLocale.value)?.label || '繁體中文'
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

function selectLanguage(lang: Locale) {
  currentLocale.value = lang
  setLanguage(lang)
  closeDropdown()
}

// 點擊外部關閉下拉選單的指令
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
/* 強制使用自定義鼠標 */
.language-selector,
.language-selector * {
  cursor: url('/assets/cursors/cursor.png') 0 0, auto !important;
}

.language-btn,
.language-option,
.language-selector button {
  cursor: url('/assets/cursors/cursor.png') 0 0, pointer !important;
}

.language-selector {
  position: relative;
}

.language-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--button-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 120px;
}

.language-btn:hover {
  background: var(--button-hover);
  border-color: var(--primary-color);
}

.language-text {
  flex: 1;
  text-align: left;
}

.dropdown-icon {
  transition: transform 0.2s;
  flex-shrink: 0;
}

.dropdown-icon.open {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 150px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  z-index: 1000;
  overflow: hidden;
}

.language-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.875rem;
  text-align: left;
  transition: background 0.2s;
}

.language-option:hover {
  background: var(--hover-bg);
}

.language-option.active {
  background: var(--primary-bg);
  color: var(--primary-color);
  font-weight: 600;
}

.option-text {
  flex: 1;
}

/* 下拉動畫 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .language-btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
    min-width: 90px;
  }

  .language-dropdown {
    min-width: 130px;
  }

  .language-option {
    padding: 0.625rem 0.875rem;
    font-size: 0.8125rem;
  }
}
</style>

