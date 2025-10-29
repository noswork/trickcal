<template>
  <div 
    class="character-card"
    :class="{
      owned: isOwned,
      activated: isActivated,
      [`personality-${personalityClass}`]: true
    }"
  >
    <div class="character-avatar">
      <img 
        :src="getCharacterImageUrl(character.en)" 
        :alt="character.name"
        loading="lazy"
        decoding="async"
        @error="handleImageError"
      />
      <div class="character-fallback" style="display: none;">
        {{ character.name.charAt(0) }}
      </div>
    </div>
    
    <div class="character-stars">
      <img 
        v-for="n in character.stars" 
        :key="n" 
        :src="getIconUrl('unit_star')" 
        alt="★" 
        class="star-icon"
        loading="lazy"
        decoding="async"
      />
    </div>

    <div class="character-icons-left">
      <img 
        v-if="personalityIcon" 
        :src="getAssetUrl(personalityIcon)" 
        :alt="character.personality"
        :title="character.personality"
        class="char-icon"
        loading="lazy"
        decoding="async"
      />
      <img 
        v-if="attackTypeIcon" 
        :src="getAssetUrl(attackTypeIcon)" 
        :alt="character.attackType"
        :title="character.attackType"
        class="char-icon"
        loading="lazy"
        decoding="async"
      />
    </div>

    <div class="character-icons-right">
      <img 
        v-if="deployRowIcon" 
        :src="getAssetUrl(deployRowIcon)" 
        :alt="character.deployRow"
        :title="character.deployRow"
        class="char-icon"
        loading="lazy"
        decoding="async"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBoardStore } from '@/stores/board'
import type { Character } from '@/stores/board'
import { getAssetUrl, getCharacterImageUrl, getIconUrl } from '@/utils/assets'

const props = defineProps<{
  character: Character
  cellType: string
}>()

const boardStore = useBoardStore()

const isOwned = computed(() => 
  boardStore.userProgress.ownedCharacters.has(props.character.name)
)

const isActivated = computed(() => {
  const cellKey = `${props.character.name}_${boardStore.currentLayer}_${props.cellType}`
  return boardStore.userProgress.activatedCells[cellKey] === true
})

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

const personalityIcon = computed(() => {
  const icons: Record<string, string> = {
    '天真': 'assets/icons/unit_personality_naive.webp',
    '冷靜': 'assets/icons/unit_personality_cool.webp',
    '憂鬱': 'assets/icons/unit_personality_gloomy.webp',
    '活潑': 'assets/icons/unit_personality_jolly.webp',
    '狂亂': 'assets/icons/unit_personality_mad.webp'
  }
  return icons[props.character.personality] || ''
})

const attackTypeIcon = computed(() => {
  const icons: Record<string, string> = {
    '物理': 'assets/icons/unit_attack_physic.webp',
    '魔法': 'assets/icons/unit_attack_magic.webp'
  }
  return icons[props.character.attackType] || ''
})

const deployRowIcon = computed(() => {
  const icons: Record<string, string> = {
    '前排': 'assets/icons/unit_position_front.webp',
    '中排': 'assets/icons/unit_position_middle.webp',
    '後排': 'assets/icons/unit_position_back.webp'
  }
  return icons[props.character.deployRow] || ''
})

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
.character-card {
  position: relative;
  background: var(--bg-tertiary, rgba(64, 64, 64, 0.88));
  border: 2px solid var(--border-color);
  border-radius: 6px;
  padding: 0;
  transition: all 0.2s ease;
  overflow: visible;
}

.character-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary-color);
}

.character-card.owned {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 5px rgba(91, 142, 244, 0.5), 0 0 15px rgba(91, 142, 244, 0.3);
  border-width: 3px;
}

.character-card.activated {
  border-color: var(--success-color);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.6), 0 0 15px rgba(76, 175, 80, 0.4);
  border-width: 3px;
}

.character-card.activated::before {
  content: '';
  position: absolute;
  top: 3px;
  right: 3px;
  width: 18px;
  height: 18px;
  background: var(--success-color);
  border-radius: 50%;
  z-index: 10;
}

.character-card.activated::after {
  content: '';
  position: absolute;
  top: 3px;
  right: 3px;
  width: 18px;
  height: 18px;
  background-image: url('/assets/icons/check.webp');
  background-size: 12px 12px;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 11;
}

/* 性格背景顏色 */
.character-card.personality-cool .character-avatar {
  background: var(--personality-cool-bg);
}

.character-card.personality-mad .character-avatar {
  background: var(--personality-mad-bg);
}

.character-card.personality-naive .character-avatar {
  background: var(--personality-naive-bg);
}

.character-card.personality-jolly .character-avatar {
  background: var(--personality-jolly-bg);
}

.character-card.personality-gloomy .character-avatar {
  background: var(--personality-gloomy-bg);
}

.character-avatar {
  width: 100%;
  aspect-ratio: 1;
  background: var(--secondary-bg, rgba(0, 0, 0, 0.05));
  border-radius: 4px;
  margin: 0;
  display: block;
  font-size: 1.5rem;
  color: var(--text-muted);
  font-weight: 700;
  overflow: hidden;
  position: relative;
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
  position: absolute;
  top: 0;
  left: 0;
}

.character-stars {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1px;
  z-index: 5;
  padding: 2px 4px;
  border-radius: 4px;
}

.star-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.character-icons-left {
  position: absolute;
  bottom: 20px;
  left: 3px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 5;
}

.character-icons-left .char-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 50%;
  padding: 2px;
}

.character-icons-right {
  position: absolute;
  bottom: 20px;
  right: 3px;
  display: flex;
  z-index: 5;
}

.character-icons-right .char-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 50%;
  padding: 2px;
}

/* 手機端優化 */
@media (max-width: 768px) {
  .star-icon {
    width: 14px;
    height: 14px;
  }
  
  .character-icons-left .char-icon,
  .character-icons-right .char-icon {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .star-icon {
    width: 12px;
    height: 12px;
  }
  
  .character-icons-left .char-icon,
  .character-icons-right .char-icon {
    width: 14px;
    height: 14px;
  }
  
  .character-icons-left {
    bottom: 18px;
    left: 2px;
  }
  
  .character-icons-right {
    bottom: 18px;
    right: 2px;
  }
  
  .character-card.activated::before,
  .character-card.activated::after {
    top: 2px;
    right: 2px;
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 360px) {
  .character-stars {
    padding: 1px 2px;
  }
  
  .star-icon {
    width: 10px;
    height: 10px;
  }
}
</style>

