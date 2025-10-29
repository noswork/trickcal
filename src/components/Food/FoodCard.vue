<template>
  <div 
    class="food-card"
    :class="{ 
      selected: selected,
      [`preference-${preferenceLevel}`]: preferenceLevel 
    }"
  >
    <div class="food-image">
      <img 
        :src="getFoodImageUrl(foodName)" 
        :alt="foodName"
        loading="lazy"
        decoding="async"
        @error="handleImageError"
      />
      <div class="food-fallback" style="display: none;">
        {{ foodName.charAt(0) }}
      </div>
    </div>
    
    <!-- 喜好程度图标 -->
    <div v-if="preferenceLevel" class="preference-icon">
      <img 
        :src="getPreferenceIconUrl(preferenceLevel)" 
        :alt="preferenceLevel"
        :title="getPreferenceText(preferenceLevel)"
        loading="lazy"
        decoding="async"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getAssetUrl } from '@/utils/assets'
import { useFoodTranslations } from '@/composables/useFoodTranslations'
import type { FoodPreferenceLevel } from '@/stores/food'

const props = defineProps<{
  foodName: string
  selected?: boolean
  preferenceLevel?: FoodPreferenceLevel | null
}>()

const { preferenceLabels } = useFoodTranslations()

function getFoodImageUrl(name: string) {
  return getAssetUrl(`assets/foods/${name}.webp`)
}

function getPreferenceIconUrl(level: FoodPreferenceLevel) {
  const iconMap = {
    veryLike: 'assets/icons/food_verylike.webp',
    like: 'assets/icons/food_like.webp',
    dislike: 'assets/icons/food_dislike.webp'
  }
  return getAssetUrl(iconMap[level])
}

function getPreferenceText(level: FoodPreferenceLevel) {
  return preferenceLabels.value[level]
}

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
.food-card {
  position: relative;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 0.25rem;
  transition: all 0.2s ease;
  cursor: pointer;
  aspect-ratio: 1;
}

.food-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.food-card.selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(91, 142, 244, 0.3);
  border-width: 3px;
}

.food-image {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--secondary-bg, rgba(0, 0, 0, 0.05));
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.food-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 1.5rem;
  color: var(--text-muted);
  font-weight: 700;
}

.preference-icon {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 32px;
  height: 32px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.preference-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .food-card {
    padding: 0.1875rem;
  }
  
  .preference-icon {
    width: 24px;
    height: 24px;
    top: 0.1875rem;
    right: 0.1875rem;
  }
}

@media (max-width: 480px) {
  .food-card {
    padding: 0.125rem;
    border-radius: 6px;
  }
  
  .preference-icon {
    width: 20px;
    height: 20px;
  }
}
</style>

