import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { ThemeStorage } from '@/utils/storage'

export type Theme = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>(ThemeStorage.get())

  function setTheme(theme: Theme) {
    currentTheme.value = theme
    ThemeStorage.set(theme)
    document.body.dataset.theme = theme
  }

  function toggleTheme() {
    setTheme(currentTheme.value === 'light' ? 'dark' : 'light')
  }

  // 初始化時設置 body 的 theme
  document.body.dataset.theme = currentTheme.value

  // 監聽主題變化
  watch(currentTheme, (newTheme) => {
    document.body.dataset.theme = newTheme
  })

  return {
    currentTheme,
    setTheme,
    toggleTheme
  }
})

