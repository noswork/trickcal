<template>
  <div class="settings-panel" :class="{ active: show }">
    <div class="settings-content">
      <h2>{{ $t('settings.title') }}</h2>
      <p class="settings-desc">{{ $t('settings.description') }}</p>
      
      <div class="character-grid">
        <div
          v-for="char in characters"
          :key="char.name"
          class="character-card"
          :class="[
            { owned: boardStore.userProgress.ownedCharacters.has(char.name) },
            personalityClass(char.personality)
          ]"
          @click="toggleOwnership(char.name)"
        >
          <div class="card-image">
            <img 
              :src="getCharacterImageUrl(char.en)" 
              :alt="char.name"
              @error="handleImageError"
            />
            <div class="card-placeholder">?</div>
            
            <!-- 星級顯示 -->
            <div class="character-stars">
              <img 
                v-for="n in char.stars" 
                :key="n" 
                :src="getIconUrl('unit_star')" 
                alt="★" 
                class="star-icon"
                loading="lazy"
              />
            </div>
            
            <!-- 左側圖標 -->
            <div class="character-icons-left">
              <img 
                :src="getAssetUrl(personalityIcon(char.personality))" 
                :alt="char.personality" 
                :title="char.personality"
                class="char-icon"
                loading="lazy"
              />
              <img 
                :src="getAssetUrl(attackTypeIcon(char.attackType))" 
                :alt="char.attackType"
                :title="char.attackType" 
                class="char-icon"
                loading="lazy"
              />
            </div>
            
            <!-- 右側圖標 -->
            <div class="character-icons-right">
              <img 
                :src="getAssetUrl(deployRowIcon(char.deployRow))" 
                :alt="char.deployRow"
                :title="char.deployRow" 
                class="char-icon"
                loading="lazy"
              />
            </div>
          </div>
          <div class="card-name">{{ char.name }}</div>
        </div>
      </div>
      
      <div class="settings-actions">
        <button class="btn btn-secondary" @click="handleReset">{{ $t('settings.resetAll') }}</button>
        <button class="btn btn-primary" @click="emit('update:show', false)">{{ $t('settings.close') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBoardStore } from '@/stores/board'
import { getAssetUrl, getCharacterImageUrl, getIconUrl } from '@/utils/assets'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const { t } = useI18n()
const boardStore = useBoardStore()

const characters = computed(() => boardStore.gameData?.characters || [])

function toggleOwnership(characterName: string) {
  boardStore.toggleCharacterOwnership(characterName)
}

function handleReset() {
  if (confirm(t('settings.confirmReset'))) {
    boardStore.resetAllProgress()
  }
}

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
  const placeholder = target.nextElementSibling as HTMLElement
  if (placeholder) {
    placeholder.style.display = 'flex'
  }
}

function personalityClass(personality: string) {
  const map: Record<string, string> = {
    '冷靜': 'personality-cool',
    '狂亂': 'personality-mad',
    '天真': 'personality-naive',
    '活潑': 'personality-jolly',
    '憂鬱': 'personality-gloomy'
  }
  return map[personality] || ''
}

function personalityIcon(personality: string) {
  const icons: Record<string, string> = {
    '天真': 'assets/icons/unit_personality_naive.webp',
    '冷靜': 'assets/icons/unit_personality_cool.webp',
    '憂鬱': 'assets/icons/unit_personality_gloomy.webp',
    '活潑': 'assets/icons/unit_personality_jolly.webp',
    '狂亂': 'assets/icons/unit_personality_mad.webp'
  }
  return icons[personality] || ''
}

function attackTypeIcon(attackType: string) {
  const icons: Record<string, string> = {
    '物理': 'assets/icons/unit_attack_physic.webp',
    '魔法': 'assets/icons/unit_attack_magic.webp'
  }
  return icons[attackType] || ''
}

function deployRowIcon(deployRow: string) {
  const icons: Record<string, string> = {
    '前排': 'assets/icons/unit_position_front.webp',
    '中排': 'assets/icons/unit_position_middle.webp',
    '後排': 'assets/icons/unit_position_back.webp'
  }
  return icons[deployRow] || ''
}
</script>

<style scoped>
.settings-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.settings-panel.active {
  opacity: 1;
  pointer-events: all;
}

.settings-content {
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  overflow-y: auto;
}

.settings-content h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.settings-desc {
  margin: 0 0 1.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.character-card {
  position: relative;
  background: var(--bg-tertiary, rgba(64, 64, 64, 0.88));
  border: 2px solid var(--border-color);
  border-radius: 6px;
  padding: 0;
  cursor: pointer;
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

/* 性格背景色 */
.character-card.personality-cool .card-image {
  background: var(--personality-cool-bg);
}

.character-card.personality-mad .card-image {
  background: var(--personality-mad-bg);
}

.character-card.personality-naive .card-image {
  background: var(--personality-naive-bg);
}

.character-card.personality-jolly .card-image {
  background: var(--personality-jolly-bg);
}

.character-card.personality-gloomy .card-image {
  background: var(--personality-gloomy-bg);
}

.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  margin: 0;
  border-radius: 4px;
  overflow: hidden;
  display: block;
  background: var(--secondary-bg, rgba(0, 0, 0, 0.05));
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 45%;
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

.card-name {
  display: none;
}

/* 星級顯示 */
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

.character-stars .star-icon {
  width: 12px !important;
  height: 12px !important;
  object-fit: contain;
}

/* 角色圖標 */
.character-icons-left {
  position: absolute;
  bottom: 20px;
  left: 3px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 5;
}

.character-icons-right {
  position: absolute;
  bottom: 20px;
  right: 3px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 5;
}

.character-icons-left .char-icon,
.character-icons-right .char-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 50%;
  padding: 2px;
}

.settings-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--secondary-bg);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--secondary-hover);
}
</style>

