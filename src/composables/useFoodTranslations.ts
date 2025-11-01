import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * 食物翻譯 composable
 * 統一使用 vue-i18n 系統，從 src/i18n/locales/ 讀取翻譯
 */
export function useFoodTranslations() {
  const { t } = useI18n()

  // 不再需要手動載入，vue-i18n 會自動處理
  const loadTranslations = async () => {
    // 保持接口相容性，但實際上什麼都不做
    return Promise.resolve()
  }

  // 翻譯函數，支持嵌套的 key
  const tFood = (key: string): string => {
    return t(`food.${key}`)
  }

  // 翻譯食物名稱
  const translateFood = (foodName: string): string => {
    return t(`food.items.${foodName}`, foodName) // 如果找不到翻譯，返回原名稱
  }

  // 偏好標籤
  const preferenceLabels = computed(() => ({
    veryLike: t('food.preferences.veryLike'),
    like: t('food.preferences.like'),
    dislike: t('food.preferences.dislike')
  }))

  return {
    loadTranslations,
    tFood,
    translateFood,
    preferenceLabels
  }
}

