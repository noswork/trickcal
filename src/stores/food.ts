import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type FoodPreferenceLevel = 'veryLike' | 'like' | 'dislike'
export type FoodRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface FoodPreferences {
  veryLike: string[]
  like: string[]
  dislike: string[]
}

export interface FoodData {
  [characterName: string]: FoodPreferences
}

export interface FoodInfo {
  rarity: FoodRarity
}

export interface FoodsMetadata {
  [foodName: string]: FoodInfo
}

export const useFoodStore = defineStore('food', () => {
  // 状态
  const foodData = ref<FoodData>({})
  const foodsMetadata = ref<FoodsMetadata>({})
  const selectedCharacter = ref<string | null>(null)
  const selectedFood = ref<string | null>(null)
  const isLoading = ref(false)
  
  // 稀有度排序权重
  const rarityWeight: Record<FoodRarity, number> = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5
  }
  
  // 所有食物列表（按稀有度排序）
  const allFoods = computed(() => {
    // 从 foods.json 获取所有食物（如果已加载）
    const foodsFromMetadata = Object.keys(foodsMetadata.value)
    
    // 如果有元数据，使用元数据中的食物列表；否则从角色偏好中提取
    const foodList = foodsFromMetadata.length > 0 
      ? foodsFromMetadata 
      : (() => {
          const foodSet = new Set<string>()
          Object.values(foodData.value).forEach(prefs => {
            prefs.veryLike.forEach(food => foodSet.add(food))
            prefs.like.forEach(food => foodSet.add(food))
            prefs.dislike.forEach(food => foodSet.add(food))
          })
          return Array.from(foodSet)
        })()
    
    return foodList.sort((a, b) => {
      const rarityA = foodsMetadata.value[a]?.rarity || 'common'
      const rarityB = foodsMetadata.value[b]?.rarity || 'common'
      const weightDiff = rarityWeight[rarityA] - rarityWeight[rarityB]
      
      // 如果稀有度相同，按名称排序
      if (weightDiff === 0) {
        return a.localeCompare(b, 'zh-TW')
      }
      
      return weightDiff
    })
  })
  
  // 获取指定角色的食物偏好
  const getCharacterFoodPreferences = (characterName: string): FoodPreferences | null => {
    return foodData.value[characterName] || null
  }
  
  // 获取喜欢某个食物的角色列表（按喜欢程度分类）
  const getCharactersForFood = (foodName: string) => {
    const result: Record<FoodPreferenceLevel, string[]> = {
      veryLike: [],
      like: [],
      dislike: []
    }
    
    Object.entries(foodData.value).forEach(([characterName, prefs]) => {
      if (prefs.veryLike.includes(foodName)) {
        result.veryLike.push(characterName)
      } else if (prefs.like.includes(foodName)) {
        result.like.push(characterName)
      } else if (prefs.dislike.includes(foodName)) {
        result.dislike.push(characterName)
      }
    })
    
    return result
  }
  
  // 获取食物对应的角色喜好程度
  const getFoodPreferenceForCharacter = (characterName: string, foodName: string): FoodPreferenceLevel | null => {
    const prefs = getCharacterFoodPreferences(characterName)
    if (!prefs) return null
    
    if (prefs.veryLike.includes(foodName)) return 'veryLike'
    if (prefs.like.includes(foodName)) return 'like'
    if (prefs.dislike.includes(foodName)) return 'dislike'
    
    return null
  }
  
  // 选择角色
  const selectCharacter = (characterName: string | null) => {
    selectedCharacter.value = characterName
    selectedFood.value = null // 清除食物选择
  }
  
  // 选择食物
  const selectFood = (foodName: string | null) => {
    selectedFood.value = foodName
    selectedCharacter.value = null // 清除角色选择
  }
  
  // 清除所有选择
  const clearSelection = () => {
    selectedCharacter.value = null
    selectedFood.value = null
  }
  
  // 加载数据
  const loadData = async () => {
    if (Object.keys(foodData.value).length > 0) {
      return // 已加载
    }
    
    isLoading.value = true
    try {
      // 同时加载食物偏好数据和食物元数据
      const [prefsResponse, metaResponse] = await Promise.all([
        fetch('/food/data.json'),
        fetch('/food/foods.json')
      ])
      
      if (!prefsResponse.ok) {
        throw new Error(`HTTP error! status: ${prefsResponse.status}`)
      }
      
      const prefsData = await prefsResponse.json()
      foodData.value = prefsData
      
      // 加载食物元数据（稀有度等）
      if (metaResponse.ok) {
        const metaData = await metaResponse.json()
        foodsMetadata.value = metaData
      }
    } catch (error) {
      console.error('加载食物数据失败:', error)
      foodData.value = {}
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    // 状态
    foodData,
    foodsMetadata,
    selectedCharacter,
    selectedFood,
    isLoading,
    
    // 计算属性
    allFoods,
    
    // 方法
    getCharacterFoodPreferences,
    getCharactersForFood,
    getFoodPreferenceForCharacter,
    selectCharacter,
    selectFood,
    clearSelection,
    loadData
  }
})

