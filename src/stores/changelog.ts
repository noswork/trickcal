import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChangelogStore = defineStore('changelog', () => {
  const content = ref<string>('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 獲取開發日誌內容
  async function fetchChangelog() {
    if (content.value) {
      return // 已載入過，不重複載入
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch('/CHANGELOG.md')
      if (!response.ok) {
        throw new Error('Failed to fetch changelog')
      }
      content.value = await response.text()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      console.error('Error loading changelog:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    content,
    loading,
    error,
    fetchChangelog
  }
})

