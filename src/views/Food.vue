<template>
  <AppLayout>
    <div class="food-root">
      <img 
        class="background-image" 
        :src="getAssetUrl('assets/backgrounds/background.webp')" 
        alt=""
        aria-hidden="true"
      />
      <div class="background-overlay"></div>

      <main class="food-layout">
        <!-- 左侧面板：角色列表 -->
        <section class="panel character-panel">
          <header>
            <h2>{{ $t('food.characters') || '角色' }}</h2>
            <button 
              v-if="selectedCharacter || selectedFood" 
              class="clear-selection" 
              type="button" 
              @click="clearSelection"
            >
              {{ $t('food.clear') || '清除选择' }}
            </button>
          </header>

          <div class="search-row">
            <label for="character-search">{{ $t('food.searchCharacter') || '搜索角色' }}</label>
            <input
              id="character-search"
              v-model="characterSearchTerm"
              type="search"
              :placeholder="$t('food.searchCharacterPlaceholder') || '输入角色名称'"
            />
          </div>

          <!-- 当选择食物时，按喜好程度分组显示角色 -->
          <template v-if="selectedFood">
            <div v-if="charactersForSelectedFood.veryLike.length > 0" class="character-group">
              <h3 class="group-title">
                <img :src="getAssetUrl('assets/icons/food_verylike.webp')" :alt="preferenceLabels.veryLike" class="group-icon" />
                {{ preferenceLabels.veryLike }}
              </h3>
              <div class="character-grid">
                <FoodCharacterCard
                  v-for="charName in charactersForSelectedFood.veryLike"
                  :key="charName"
                  :character="getCharacterByName(charName)"
                  :preference-level="'veryLike'"
                  @click="selectCharacter(charName)"
                />
              </div>
            </div>

            <div v-if="charactersForSelectedFood.like.length > 0" class="character-group">
              <h3 class="group-title">
                <img :src="getAssetUrl('assets/icons/food_like.webp')" :alt="preferenceLabels.like" class="group-icon" />
                {{ preferenceLabels.like }}
              </h3>
              <div class="character-grid">
                <FoodCharacterCard
                  v-for="charName in charactersForSelectedFood.like"
                  :key="charName"
                  :character="getCharacterByName(charName)"
                  :preference-level="'like'"
                  @click="selectCharacter(charName)"
                />
              </div>
            </div>

            <div v-if="charactersForSelectedFood.dislike.length > 0" class="character-group">
              <h3 class="group-title">
                <img :src="getAssetUrl('assets/icons/food_dislike.webp')" :alt="preferenceLabels.dislike" class="group-icon" />
                {{ preferenceLabels.dislike }}
              </h3>
              <div class="character-grid">
                <FoodCharacterCard
                  v-for="charName in charactersForSelectedFood.dislike"
                  :key="charName"
                  :character="getCharacterByName(charName)"
                  :preference-level="'dislike'"
                  @click="selectCharacter(charName)"
                />
              </div>
            </div>
          </template>

          <!-- 默认显示所有角色 -->
          <div v-else class="character-grid">
            <FoodCharacterCard
              v-for="char in filteredCharacters"
              :key="char.name"
              :character="char"
              :selected="selectedCharacter === char.name"
              @click="selectCharacter(char.name)"
            />
          </div>
        </section>

        <!-- 右侧面板：食物列表 -->
        <section class="panel food-panel">
          <header>
            <h2>{{ $t('food.foods') || '食物' }}</h2>
          </header>

          <div class="search-row">
            <label for="food-search">{{ $t('food.searchFood') || '搜索食物' }}</label>
            <input
              id="food-search"
              v-model="foodSearchTerm"
              type="search"
              :placeholder="$t('food.searchFoodPlaceholder') || '输入食物名称'"
            />
          </div>

          <div class="food-grid">
            <FoodCard
              v-for="food in filteredFoods"
              :key="food"
              :food-name="food"
              :selected="selectedFood === food"
              :preference-level="selectedCharacter ? getFoodPreferenceForCharacter(selectedCharacter, food) : null"
              @click="selectFood(food)"
            />
          </div>
        </section>
      </main>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFoodStore } from '@/stores/food'
import { useCharactersStore } from '@/stores/characters'
import { useTracking } from '@/composables/useTracking'
import { useFoodTranslations } from '@/composables/useFoodTranslations'
import AppLayout from '@/components/Layout/AppLayout.vue'
import FoodCard from '@/components/Food/FoodCard.vue'
import FoodCharacterCard from '@/components/Food/FoodCharacterCard.vue'
import { getAssetUrl } from '@/utils/assets'

const foodStore = useFoodStore()
const charactersStore = useCharactersStore()
const tracking = useTracking('food')
const { loadTranslations, preferenceLabels } = useFoodTranslations()

const characterSearchTerm = ref('')
const foodSearchTerm = ref('')

// 性格排序权重
const personalityOrder: Record<string, number> = {
  '冷靜': 1,
  '狂亂': 2,
  '天真': 3,
  '活潑': 4,
  '憂鬱': 5
}

// 获取所有角色（按性格排序）
const allCharacters = computed(() => {
  const chars = charactersStore.getAllCharacters()
  return chars.sort((a, b) => {
    const orderA = personalityOrder[a.personality] || 999
    const orderB = personalityOrder[b.personality] || 999
    
    // 如果性格相同，按名称排序
    if (orderA === orderB) {
      return a.name.localeCompare(b.name, 'zh-TW')
    }
    
    return orderA - orderB
  })
})

// 计算属性
const filteredCharacters = computed(() => {
  if (!allCharacters.value || allCharacters.value.length === 0) return []
  
  if (!characterSearchTerm.value) return allCharacters.value
  
  const term = characterSearchTerm.value.toLowerCase()
  return allCharacters.value.filter(char => 
    char.name.toLowerCase().includes(term) || 
    char.name.toLowerCase().includes(term)
  )
})

const filteredFoods = computed(() => {
  let foods = foodStore.allFoods
  
  // 如果选中了角色，只显示该角色相关的食物
  if (selectedCharacter.value) {
    const preferences = foodStore.getCharacterFoodPreferences(selectedCharacter.value)
    if (preferences) {
      const relatedFoods = new Set([
        ...preferences.veryLike,
        ...preferences.like,
        ...preferences.dislike
      ])
      foods = foods.filter(food => relatedFoods.has(food))
    }
  }
  
  // 再根据搜索词过滤
  if (foodSearchTerm.value) {
    const term = foodSearchTerm.value.toLowerCase()
    foods = foods.filter(food => food.toLowerCase().includes(term))
  }
  
  return foods
})

const selectedCharacter = computed(() => foodStore.selectedCharacter)
const selectedFood = computed(() => foodStore.selectedFood)

const charactersForSelectedFood = computed(() => {
  if (!selectedFood.value) {
    return { veryLike: [], like: [], dislike: [] }
  }
  return foodStore.getCharactersForFood(selectedFood.value)
})

// 方法
function getCharacterByName(name: string) {
  const char = charactersStore.getCharacter(name)
  if (char) return char
  
  return {
    name: name,
    en: name,
    personality: '天真',
    stars: 1,
    attackType: '物理',
    deployRow: '前排',
    role: '输出',
    race: '未知'
  }
}

function getFoodPreferenceForCharacter(characterName: string, foodName: string) {
  return foodStore.getFoodPreferenceForCharacter(characterName, foodName)
}

function selectCharacter(charName: string) {
  if (selectedCharacter.value === charName) {
    foodStore.clearSelection()
  } else {
    foodStore.selectCharacter(charName)
    // 追踪角色选择
    tracking.food.selectCharacter(charName)
  }
}

function selectFood(foodName: string) {
  if (selectedFood.value === foodName) {
    foodStore.clearSelection()
  } else {
    foodStore.selectFood(foodName)
    // 追踪食物选择
    tracking.food.selectFood(foodName)
  }
}

function clearSelection() {
  foodStore.clearSelection()
  // 追踪清除选择
  tracking.food.clearSelection()
}

onMounted(async () => {
  await Promise.all([
    foodStore.loadData(),
    charactersStore.loadCharacters(),
    loadTranslations()
  ])
})
</script>

<style scoped>
.food-root {
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

.food-layout {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 2rem;
}

.panel {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.panel header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.panel header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.clear-selection {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--button-bg);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s;
}

.clear-selection:hover {
  background: var(--button-hover);
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

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.5rem;
}

.food-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
}

.character-group {
  margin-bottom: 2rem;
}

.character-group:last-child {
  margin-bottom: 0;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.group-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .food-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .food-layout {
    padding: 1rem;
    gap: 1.5rem;
  }

  .panel {
    padding: 1.5rem;
  }

  .panel header h2 {
    font-size: 1.25rem;
  }

  .character-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 0.375rem;
  }

  .food-grid {
    grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
    gap: 0.5rem;
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
  .food-layout {
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

  .character-grid {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 0.25rem;
  }

  .food-grid {
    grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
    gap: 0.375rem;
  }

  .clear-selection {
    font-size: 0.8125rem;
    padding: 0.375rem 0.75rem;
  }

  .group-title {
    font-size: 1rem;
  }

  .group-icon {
    width: 20px;
    height: 20px;
  }
}
</style>

