<template>
  <AppLayout>
    <div class="home-root with-background">
      <img 
        class="background-image" 
        :src="getAssetUrl('assets/backgrounds/background.webp')" 
        alt=""
        aria-hidden="true"
      />
      <div class="background-overlay" aria-hidden="true"></div>

      <div class="site-container home-layout">
        <section class="hero-section">
          <div class="hero-content">
            <span class="hero-eyebrow">{{ $t('hero.eyebrow') }}</span>
            <h1 class="hero-title">{{ $t('hero.title') }}</h1>
            <p class="hero-description">{{ $t('hero.description') }}</p>
          </div>
        </section>

        <section class="tool-section">
          <header>
            <h2 class="section-title">{{ $t('tools.heading') }}</h2>
          </header>
          <div class="tool-grid">
            <router-link to="/board" class="tool-card" @click="handleToolClick('board')">
              <div class="tool-icon">
                <img :src="getIconUrl('gold_crayon')" alt="" />
              </div>
              <div>
                <h3>{{ $t('tools.board.name') }}</h3>
                <p>{{ $t('tools.board.description') }}</p>
              </div>
            </router-link>

            <router-link to="/sweep" class="tool-card" @click="handleToolClick('sweep')">
              <div class="tool-icon">
                <img :src="getAssetUrl('assets/favicons/favicon.webp')" alt="" />
              </div>
              <div>
                <h3>{{ $t('tools.sweep.name') }}</h3>
                <p>{{ $t('tools.sweep.description') }}</p>
              </div>
            </router-link>
          </div>
        </section>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/Layout/AppLayout.vue'
import { getAssetUrl, getIconUrl } from '@/utils/assets'
import { useTracking } from '@/composables/useTracking'

const tracking = useTracking('home')

function handleToolClick(toolName: string) {
  tracking.home.clickTool(toolName)
}
</script>

<style scoped>
.home-root {
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

.site-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.home-layout {
  padding: 4rem 2rem;
}

.hero-section {
  text-align: center;
  margin-bottom: 4rem;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-eyebrow {
  display: inline-block;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  background: var(--primary-bg);
  color: var(--primary-color);
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
}

.hero-title {
  margin: 0 0 1rem;
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.hero-description {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.tool-section {
  max-width: 900px;
  margin: 0 auto;
}

.section-title {
  margin: 0 0 2rem;
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.tool-card {
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.tool-icon {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-bg);
  border-radius: 12px;
}

.tool-icon img {
  width: 40px;
  height: 40px;
}

.tool-card h3 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.tool-card p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .home-layout {
    padding: 2rem 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .tool-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .tool-card {
    padding: 1.5rem;
  }
}
</style>

