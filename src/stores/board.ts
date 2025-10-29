import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BoardProgressStorage } from '@/utils/storage'
import { Logger } from '@/utils/logger'

export interface Character {
  name: string
  en: string
  stars: number
  role: string
  personality: string
  race: string
  attackType: string
  deployRow: string
  boardTypes: {
    layer1?: string[]
    layer2?: string[]
    layer3?: string[]
  }
}

export interface GameData {
  characters: Character[]
  boardConfig: {
    [key: string]: {
      name: string
      bonusPerCell: number
      background: string | null
    }
  }
  cellTypes: {
    [key: string]: {
      name: string
      color: string
      icon: string
      costPerLayer?: {
        [key: string]: number
      }
    }
  }
  personalities: {
    [key: string]: {
      icon: string
    }
  }
  races: string[]
  attackTypes: {
    [key: string]: {
      icon: string
    }
  }
  deployRows: {
    [key: string]: {
      icon: string
    }
  }
  roles: string[]
}

export interface UserProgress {
  ownedCharacters: Set<string>
  activatedCells: Record<string, boolean>
}

export const useBoardStore = defineStore('board', () => {
  const gameData = ref<GameData | null>(null)
  const userProgress = ref<UserProgress>({
    ownedCharacters: new Set(),
    activatedCells: {}
  })

  const currentLayer = ref<'layer1' | 'layer2' | 'layer3'>('layer1')
  const currentCellType = ref<string>('attack')

  // 載入遊戲數據
  async function loadGameData() {
    try {
      const baseUrl = import.meta.env.BASE_URL
      const response = await fetch(`${baseUrl}board/data.json`)
      if (!response.ok) throw new Error('Failed to load game data')
      const data = await response.json()
      
      // 正規化資源路徑
      normalizeAssetPaths(data)
      gameData.value = data
    } catch (error) {
      Logger.error('載入遊戲數據失敗:', error)
      throw error
    }
  }

  // 正規化資源路徑
  function normalizeAssetPaths(data: GameData) {
    const fix = (p: string | null | undefined): string | null => {
      if (!p || typeof p !== 'string') return p || null
      if (p.startsWith('/assets/')) return p
      if (p.startsWith('../assets/')) return p.replace(/^\.\.\//, '/')
      if (p.startsWith('assets/')) return '/' + p
      return p
    }

    if (data.boardConfig) {
      Object.values(data.boardConfig).forEach(cfg => {
        if (cfg && cfg.background) cfg.background = fix(cfg.background)
      })
    }
    if (data.cellTypes) {
      Object.values(data.cellTypes).forEach(ct => {
        if (ct && ct.icon) ct.icon = fix(ct.icon) || ''
      })
    }
    if (data.personalities) {
      Object.values(data.personalities).forEach(p => {
        if (p && p.icon) p.icon = fix(p.icon) || ''
      })
    }
    if (data.attackTypes) {
      Object.values(data.attackTypes).forEach(a => {
        if (a && a.icon) a.icon = fix(a.icon) || ''
      })
    }
    if (data.deployRows) {
      Object.values(data.deployRows).forEach(d => {
        if (d && d.icon) d.icon = fix(d.icon) || ''
      })
    }
  }

  // 載入用戶進度
  function loadUserProgress() {
    const saved = BoardProgressStorage.get()
    if (saved) {
      try {
        userProgress.value = {
          ownedCharacters: new Set(saved.ownedCharacters || []),
          activatedCells: saved.activatedCells || {}
        }
      } catch (error) {
        Logger.error('載入用戶進度失敗:', error)
      }
    }
  }

  // 保存用戶進度
  function saveUserProgress() {
    const data = {
      ownedCharacters: Array.from(userProgress.value.ownedCharacters),
      activatedCells: userProgress.value.activatedCells
    }
    BoardProgressStorage.set(data)
  }

  // 切換角色擁有狀態
  function toggleCharacterOwnership(characterName: string) {
    if (userProgress.value.ownedCharacters.has(characterName)) {
      userProgress.value.ownedCharacters.delete(characterName)
      // 移除所有相關的啟動格子
      Object.keys(userProgress.value.activatedCells).forEach(key => {
        if (key.startsWith(characterName + '_')) {
          delete userProgress.value.activatedCells[key]
        }
      })
    } else {
      userProgress.value.ownedCharacters.add(characterName)
    }
    saveUserProgress()
  }

  // 切換格子啟動狀態
  function toggleCellActivation(character: Character, cellType: string) {
    const cellKey = `${character.name}_${currentLayer.value}_${cellType}`
    const isOwned = userProgress.value.ownedCharacters.has(character.name)

    if (!isOwned) {
      userProgress.value.ownedCharacters.add(character.name)
    } else if (!userProgress.value.activatedCells[cellKey]) {
      userProgress.value.activatedCells[cellKey] = true
    } else {
      userProgress.value.activatedCells[cellKey] = false
    }
    
    saveUserProgress()
  }

  // 重置所有進度
  function resetAllProgress() {
    userProgress.value = {
      ownedCharacters: new Set(),
      activatedCells: {}
    }
    saveUserProgress()
  }

  // 計算統計數據
  const stats = computed(() => {
    if (!gameData.value) return null

    const totalCharacters = gameData.value.characters.length
    const ownedCharacters = userProgress.value.ownedCharacters.size
    const ownedRate = totalCharacters ? Math.round((ownedCharacters / totalCharacters) * 100) : 0

    const activatedCells = Object.values(userProgress.value.activatedCells).filter(Boolean).length
    const totalCells = gameData.value.characters.reduce((sum, char) => {
      const boards = char.boardTypes || {}
      return sum + Object.values(boards).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0)
    }, 0)
    const activationRate = totalCells ? Math.round((activatedCells / totalCells) * 100) : 0

    return {
      totalCharacters,
      ownedCharacters,
      ownedRate,
      activatedCells,
      totalCells,
      activationRate
    }
  })

  return {
    gameData,
    userProgress,
    currentLayer,
    currentCellType,
    stats,
    loadGameData,
    loadUserProgress,
    saveUserProgress,
    toggleCharacterOwnership,
    toggleCellActivation,
    resetAllProgress
  }
})

