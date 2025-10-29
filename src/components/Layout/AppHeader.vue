<template>
  <header class="site-header">
    <nav class="site-nav">
      <div class="nav-brand">
        <router-link to="/" class="brand-link">
          <img :src="getAssetUrl('assets/favicons/favicon.webp')" alt="Trickcal" class="brand-icon" />
          <span class="brand-text">{{ $t('nav.title') }}</span>
        </router-link>
        <UsageCounter class="desktop-only" />
      </div>

      <!-- 桌面端：工具選擇器 -->
      <div class="nav-tools desktop-only">
        <ToolSelector />
      </div>

      <!-- 移動端：導航連結 -->
      <div class="nav-links mobile-only" :class="{ 'mobile-open': mobileMenuOpen }">
        <router-link to="/" class="nav-link" exact-active-class="active" @click="closeMobileMenu">
          {{ $t('nav.home') }}
        </router-link>
        <router-link to="/board" class="nav-link" active-class="active" @click="closeMobileMenu">
          {{ $t('nav.board') }}
        </router-link>
        <router-link to="/sweep" class="nav-link" active-class="active" @click="closeMobileMenu">
          {{ $t('nav.sweep') }}
        </router-link>
      </div>

      <div class="nav-actions">
        <button 
          class="icon-btn" 
          @click="toggleTheme" 
          :title="$t('nav.theme')"
          :aria-label="$t('nav.theme')"
        >
          <svg v-if="currentTheme === 'light'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 3V4M12 20V21M4 12H3M6.31412 6.31412L5.5 5.5M17.6859 6.31412L18.5 5.5M6.31412 17.69L5.5 18.5M17.6859 17.69L18.5 18.5M21 12H20M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <LanguageSelector />

        <button 
          class="icon-btn mobile-menu-btn" 
          @click="toggleMobileMenu"
          :aria-label="mobileMenuOpen ? '關閉選單' : '開啟選單'"
        >
          <svg v-if="!mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import LanguageSelector from './LanguageSelector.vue'
import ToolSelector from './ToolSelector.vue'
import UsageCounter from './UsageCounter.vue'
import { getAssetUrl } from '@/utils/assets'

const themeStore = useThemeStore()

const currentTheme = computed(() => themeStore.currentTheme)
const mobileMenuOpen = ref(false)

function toggleTheme() {
  themeStore.toggleTheme()
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}
</script>

<style scoped>
/* 強制使用自定義鼠標 */
.site-header,
.site-header *,
.site-nav,
.site-nav * {
  cursor: url('/assets/cursors/cursor.png') 0 0, auto !important;
}

.site-header button,
.site-header a,
.site-nav button,
.site-nav a,
.brand-link,
.nav-link,
.icon-btn,
.mobile-menu-btn {
  cursor: url('/assets/cursors/cursor.png') 0 0, pointer !important;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--header-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
}

.site-nav {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 2rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-self: start;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1.125rem;
}

.brand-icon {
  width: 32px;
  height: 32px;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.nav-tools {
  display: flex;
  justify-content: center;
  justify-self: center;
}

.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

.nav-link {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--hover-bg);
}

.nav-link.active {
  color: var(--primary-color);
  background: var(--primary-bg);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-self: end;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.icon-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.language-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s;
}

.language-select:hover {
  border-color: var(--primary-color);
}

.language-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-bg);
}

.mobile-menu-btn {
  display: none;
}

@media (max-width: 768px) {
  .site-nav {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
    display: flex;
    flex-wrap: nowrap;
  }

  .brand-text {
    display: none;
  }

  .brand-icon {
    width: 28px;
    height: 28px;
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: flex;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--header-bg);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);
    padding: 1rem;
    gap: 0.5rem;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s;
    z-index: 999;
    max-height: calc(100vh - 60px);
    overflow-y: auto;
  }

  .nav-links.mobile-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-link {
    padding: 0.75rem 1rem;
    font-size: 1rem;
    text-align: center;
    width: 100%;
  }

  .nav-actions {
    margin-left: auto;
    gap: 0.5rem;
  }

  .icon-btn {
    width: 36px;
    height: 36px;
  }

  .language-select {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
    min-width: 80px;
  }
}

@media (max-width: 480px) {
  .site-nav {
    padding: 0.5rem 0.75rem;
  }

  .brand-icon {
    width: 28px;
    height: 28px;
  }

  .icon-btn {
    width: 36px;
    height: 36px;
  }
}
</style>

