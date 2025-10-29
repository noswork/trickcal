import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface FoodTranslations {
  pageTitle: string
  preferences: {
    veryLike: string
    like: string
    dislike: string
  }
  foods: Record<string, string>
}

const foodTranslations = ref<FoodTranslations | null>(null)
let currentLocale = ''

export function useFoodTranslations() {
  const { locale } = useI18n()

  const loadTranslations = async () => {
    const localeValue = locale.value
    
    // 如果已經載入過相同語言，直接返回
    if (currentLocale === localeValue && foodTranslations.value) {
      return
    }

    try {
      const baseUrl = import.meta.env.BASE_URL
      const response = await fetch(`${baseUrl}assets/lang/food/${localeValue}.json`)
      
      if (!response.ok) {
        throw new Error(`Failed to load food translations for ${localeValue}`)
      }
      
      foodTranslations.value = await response.json()
      currentLocale = localeValue
    } catch (error) {
      console.error('Error loading food translations:', error)
      // 回退到繁體中文
      if (localeValue !== 'zh-TW') {
        try {
          const baseUrl = import.meta.env.BASE_URL
          const response = await fetch(`${baseUrl}assets/lang/food/zh-TW.json`)
          foodTranslations.value = await response.json()
          currentLocale = 'zh-TW'
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError)
        }
      }
    }
  }

  const tFood = (key: string): string => {
    if (!foodTranslations.value) return key
    
    // 處理嵌套的 key，例如 "preferences.veryLike"
    const keys = key.split('.')
    let value: any = foodTranslations.value
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  const translateFood = (foodName: string): string => {
    return tFood(`foods.${foodName}`)
  }

  const preferenceLabels = computed(() => ({
    veryLike: tFood('preferences.veryLike'),
    like: tFood('preferences.like'),
    dislike: tFood('preferences.dislike')
  }))

  return {
    loadTranslations,
    tFood,
    translateFood,
    preferenceLabels,
    foodTranslations: computed(() => foodTranslations.value)
  }
}

