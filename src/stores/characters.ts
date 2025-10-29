import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Logger } from '@/utils/logger'

export interface CharacterInfo {
  name: string
  en: string
  personality: string
  stars: number
  attackType: string
  deployRow: string
  role: string
  race: string
}

export interface CharactersData {
  [key: string]: CharacterInfo
}

export const useCharactersStore = defineStore('characters', () => {
  const charactersData = ref<CharactersData>({})
  const isLoaded = ref(false)

  // 載入角色數據
  async function loadCharacters() {
    if (isLoaded.value) return

    try {
      const baseUrl = import.meta.env.BASE_URL
      const response = await fetch(`${baseUrl}shared/characters.json`)
      if (!response.ok) throw new Error('Failed to load characters data')
      const data = await response.json()
      charactersData.value = data
      isLoaded.value = true
    } catch (error) {
      Logger.error('載入角色數據失敗:', error)
      throw error
    }
  }

  // 根據英文名稱獲取角色資訊
  function getCharacter(en: string): CharacterInfo | undefined {
    return charactersData.value[en]
  }

  // 獲取所有角色（以陣列形式）
  function getAllCharacters(): CharacterInfo[] {
    return Object.values(charactersData.value)
  }

  // 根據中文名稱查找角色
  function findByName(name: string): CharacterInfo | undefined {
    return Object.values(charactersData.value).find(char => char.name === name)
  }

  return {
    charactersData,
    isLoaded,
    loadCharacters,
    getCharacter,
    getAllCharacters,
    findByName
  }
})

