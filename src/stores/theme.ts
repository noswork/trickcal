import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'trickcal_theme'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>(getInitialTheme())

  function getInitialTheme(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY)
    return (saved === 'light' || saved === 'dark') ? saved : 'dark'
  }

  function setTheme(theme: Theme) {
    currentTheme.value = theme
    localStorage.setItem(STORAGE_KEY, theme)
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

