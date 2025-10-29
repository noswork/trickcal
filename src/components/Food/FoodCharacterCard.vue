<template>
  <div 
    class="food-character-card"
    :class="{
      selected: selected,
      [`personality-${personalityClass}`]: true,
      [`preference-${preferenceLevel}`]: preferenceLevel
    }"
  >
    <div class="character-avatar">
      <img 
        :src="getCharacterImageUrl(character.name)" 
        :alt="character.name"
        loading="lazy"
        decoding="async"
        @error="handleImageError"
      />
      <div class="character-fallback" style="display: none;">
        {{ character.name.charAt(0) }}
      </div>
    </div>
    
    <!-- 喜好程度标签 -->
    <div v-if="preferenceLevel" class="preference-badge">
      <img 
        :src="getPreferenceIconUrl(preferenceLevel)" 
        :alt="getPreferenceText(preferenceLevel)"
        :title="getPreferenceText(preferenceLevel)"
        loading="lazy"
        decoding="async"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getAssetUrl, getCharacterImageUrl } from '@/utils/assets'
import type { FoodPreferenceLevel } from '@/stores/food'

interface Character {
  name: string
  en: string
  personality: string
  stars: number
  attackType: string
  deployRow: string
  role: string
  race: string
}

const props = defineProps<{
  character: Character
  selected?: boolean
  preferenceLevel?: FoodPreferenceLevel | null
}>()

const personalityClass = computed(() => {
  const map: Record<string, string> = {
    '冷靜': 'cool',
    '狂亂': 'mad',
    '天真': 'naive',
    '活潑': 'jolly',
    '憂鬱': 'gloomy'
  }
  return map[props.character.personality] || ''
})

function getPreferenceIconUrl(level: FoodPreferenceLevel) {
  const iconMap = {
    veryLike: 'assets/icons/food_verylike.webp',
    like: 'assets/icons/food_like.webp',
    dislike: 'assets/icons/food_dislike.webp'
  }
  return getAssetUrl(iconMap[level])
}

function getPreferenceText(level: FoodPreferenceLevel) {
  const textMap = {
    veryLike: '非常喜欢',
    like: '喜欢',
    dislike: '不喜欢'
  }
  return textMap[level]
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
.food-character-card {
  position: relative;
  background: var(--bg-tertiary, rgba(64, 64, 64, 0.88));
  border: 2px solid var(--border-color);
  border-radius: 6px;
  padding: 0;
  transition: all 0.2s ease;
  cursor: pointer;
  overflow: hidden;
  aspect-ratio: 1;
}

.food-character-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.food-character-card.selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(91, 142, 244, 0.3);
  border-width: 3px;
}

/* 性格背景颜色 */
.food-character-card.personality-cool .character-avatar {
  background: var(--personality-cool-bg);
}

.food-character-card.personality-mad .character-avatar {
  background: var(--personality-mad-bg);
}

.food-character-card.personality-naive .character-avatar {
  background: var(--personality-naive-bg);
}

.food-character-card.personality-jolly .character-avatar {
  background: var(--personality-jolly-bg);
}

.food-character-card.personality-gloomy .character-avatar {
  background: var(--personality-gloomy-bg);
}

.character-avatar {
  width: 100%;
  height: 100%;
  background: var(--secondary-bg, rgba(0, 0, 0, 0.05));
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.character-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 45%;
  display: block;
}

.character-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 1.5rem;
  color: var(--text-muted);
  font-weight: 700;
  position: absolute;
  top: 0;
  left: 0;
}

.preference-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 28px;
  height: 28px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  padding: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.preference-badge img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .preference-badge {
    width: 20px;
    height: 20px;
    top: 0.1875rem;
    right: 0.1875rem;
  }
}

@media (max-width: 480px) {
  .preference-badge {
    width: 18px;
    height: 18px;
  }
}
</style>

