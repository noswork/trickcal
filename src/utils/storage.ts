/**
 * LocalStorage 工具類
 * 統一管理 localStorage 操作，提供錯誤處理和類型安全
 */

import { STORAGE_KEYS } from '@/constants'
import type { Theme } from '@/stores/theme'
import type { Locale } from '@/i18n'

/**
 * 通用 Storage 工具
 */
export class Storage {
  /**
   * 從 localStorage 讀取數據
   */
  static get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue ?? null
      
      try {
        return JSON.parse(item) as T
      } catch {
        // 如果不是 JSON，直接返回字串
        return item as T
      }
    } catch (error) {
      console.error(`Failed to get ${key} from localStorage:`, error)
      return defaultValue ?? null
    }
  }

  /**
   * 保存數據到 localStorage
   */
  static set<T>(key: string, value: T): boolean {
    try {
      const stringValue = typeof value === 'string' 
        ? value 
        : JSON.stringify(value)
      localStorage.setItem(key, stringValue)
      return true
    } catch (error) {
      console.error(`Failed to set ${key} to localStorage:`, error)
      return false
    }
  }

  /**
   * 從 localStorage 移除數據
   */
  static remove(key: string): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error)
      return false
    }
  }

  /**
   * 清空所有 localStorage
   */
  static clear(): boolean {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
      return false
    }
  }

  /**
   * 檢查 key 是否存在
   */
  static has(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null
    } catch {
      return false
    }
  }
}

/**
 * 主題存儲工具
 */
export const ThemeStorage = {
  get: (): Theme => {
    const saved = Storage.get<string>(STORAGE_KEYS.THEME)
    return (saved === 'light' || saved === 'dark') ? saved : 'dark'
  },
  set: (theme: Theme): boolean => {
    return Storage.set(STORAGE_KEYS.THEME, theme)
  },
}

/**
 * 語言存儲工具
 */
export const LanguageStorage = {
  get: (): Locale => {
    const saved = Storage.get<string>(STORAGE_KEYS.LANGUAGE)
    const supportedLocales: Locale[] = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko']
    return saved && supportedLocales.includes(saved as Locale) 
      ? (saved as Locale) 
      : 'zh-TW'
  },
  set: (lang: Locale): boolean => {
    return Storage.set(STORAGE_KEYS.LANGUAGE, lang)
  },
}

/**
 * 棋盤進度存儲工具
 */
export const BoardProgressStorage = {
  get: () => {
    return Storage.get<{
      ownedCharacters: string[]
      activatedCells: Record<string, boolean>
    }>(STORAGE_KEYS.BOARD_PROGRESS)
  },
  set: (progress: {
    ownedCharacters: string[]
    activatedCells: Record<string, boolean>
  }): boolean => {
    return Storage.set(STORAGE_KEYS.BOARD_PROGRESS, progress)
  },
}

/**
 * 掃蕩選擇存儲工具
 */
export const SweepSelectionStorage = {
  get: (): string[] => {
    return Storage.get<string[]>(STORAGE_KEYS.SWEEP_SELECTION) || []
  },
  set: (materials: string[]): boolean => {
    return Storage.set(STORAGE_KEYS.SWEEP_SELECTION, materials)
  },
}

/**
 * 使用計數存儲工具
 */
export const UsageStorage = {
  getSessionId: (): string | null => {
    return Storage.get<string>(STORAGE_KEYS.USAGE_SESSION_ID)
  },
  setSessionId: (sessionId: string): boolean => {
    return Storage.set(STORAGE_KEYS.USAGE_SESSION_ID, sessionId)
  },
  getPendingEvents: () => {
    return Storage.get<Array<{
      page_type: string
      action_type: string
      timestamp: number
    }>>(STORAGE_KEYS.USAGE_PENDING_EVENTS) || []
  },
  setPendingEvents: (events: Array<{
    page_type: string
    action_type: string
    timestamp: number
  }>): boolean => {
    return Storage.set(STORAGE_KEYS.USAGE_PENDING_EVENTS, events)
  },
  clearPendingEvents: (): boolean => {
    return Storage.remove(STORAGE_KEYS.USAGE_PENDING_EVENTS)
  },
}

