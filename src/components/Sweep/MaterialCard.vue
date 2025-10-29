<template>
  <button
    class="material-card"
    :class="{ selected }"
    type="button"
    :title="materialName"
  >
    <div class="card-image">
      <img
        :src="getGearImageUrl(materialName)"
        :alt="materialName"
        loading="lazy"
        decoding="async"
        @error="handleImageError"
      />
      <div class="card-placeholder">?</div>
    </div>
    <div class="card-tooltip">{{ materialName }}</div>
  </button>
</template>

<script setup lang="ts">
import { getGearImageUrl } from '@/utils/assets'

defineProps<{
  materialName: string
  selected: boolean
}>()

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
  const placeholder = target.nextElementSibling as HTMLElement
  if (placeholder) {
    placeholder.style.display = 'flex'
  }
}
</script>

<style scoped>
.material-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.material-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color);
}

.material-card.selected {
  border-color: var(--primary-color);
  background: var(--primary-bg);
}

.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: var(--image-bg);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--text-tertiary);
  background: var(--placeholder-bg);
}

.card-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 1000;
  text-align: center;
}

.card-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
}

.material-card:hover .card-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(-12px);
}
</style>

