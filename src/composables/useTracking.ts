/**
 * 使用追蹤 Composable
 * 用於追蹤用戶在各個頁面的互動操作
 */

import { UsageStorage } from '@/utils/storage'
import { createLogger } from '@/utils/logger'
import { useUsageStore } from '@/stores/usage'

const logger = createLogger('Tracking')

// 追蹤事件隊列
const trackingQueue: Array<{
  page_type: string
  action_type: string
  timestamp: number
}> = []

/**
 * 獲取當前頁面類型
 */
function getPageType(path: string): string {
  if (path === '/') return 'home'
  if (path.startsWith('/board')) return 'board'
  if (path.startsWith('/sweep')) return 'sweep'
  return 'other'
}

/**
 * 追蹤用戶操作
 */
export function trackAction(actionType: string, pageType?: string, metadata?: Record<string, any>) {
  try {
    // 如果沒有提供 pageType，嘗試從當前路徑獲取
    let actualPageType = pageType
    if (!actualPageType) {
      if (typeof window !== 'undefined') {
        actualPageType = getPageType(window.location.pathname.replace('/trickcal', ''))
      } else {
        actualPageType = 'unknown'
      }
    }
    
    // 添加到隊列
    trackingQueue.push({
      page_type: actualPageType,
      action_type: actionType,
      timestamp: Date.now()
    })
    
    // 保存到 localStorage（將由 UsageCounter 同步）
    UsageStorage.setPendingEvents(trackingQueue)
    
    // 即時更新計數器（提供即時反饋）
    if (typeof window !== 'undefined') {
      const usageStore = useUsageStore()
      usageStore.incrementLocalCount()
    }
    
    // 開發環境日誌
    if (metadata) {
      logger.info(`追蹤操作: ${actionType}`, metadata)
    } else {
      logger.info(`追蹤操作: ${actionType}`)
    }
  } catch (error) {
    logger.error('追蹤操作失敗:', error)
  }
}

/**
 * 使用追蹤 Hook
 */
export function useTracking(pageType?: string) {
  /**
   * Board 頁面操作追蹤
   */
  const boardActions = {
    // 切換層級
    changeLayer: (layer: string) => trackAction('board_change_layer', 'board', { layer }),
    
    // 切換格子類型
    changeCellType: (cellType: string) => trackAction('board_change_cell_type', 'board', { cellType }),
    
    // 切換角色擁有狀態
    toggleCharacter: (characterName: string) => trackAction('board_toggle_character', 'board', { characterName }),
    
    // 激活/取消激活格子
    toggleCell: (characterName: string, cellType: string, layer: string) => 
      trackAction('board_toggle_cell', 'board', { characterName, cellType, layer }),
    
    // 打開設置
    openSettings: () => trackAction('board_open_settings', 'board'),
    
    // 重置進度
    resetProgress: () => trackAction('board_reset_progress', 'board'),
  }

  /**
   * Sweep 頁面操作追蹤
   */
  const sweepActions = {
    // 選擇/取消選擇素材
    toggleMaterial: (materialName: string) => trackAction('sweep_toggle_material', 'sweep', { materialName }),
    
    // 清除所有選擇
    clearSelection: () => trackAction('sweep_clear_selection', 'sweep'),
    
    // 翻頁
    changePage: (page: number) => trackAction('sweep_change_page', 'sweep', { page }),
    
    // 搜索
    search: (searchTerm: string) => trackAction('sweep_search', 'sweep', { searchTerm: searchTerm.substring(0, 20) }),
  }

  /**
   * Home 頁面操作追蹤
   */
  const homeActions = {
    // 點擊工具卡片
    clickTool: (toolName: string) => trackAction('home_click_tool', 'home', { toolName }),
  }

  /**
   * 通用操作追蹤
   */
  const commonActions = {
    // 切換主題
    toggleTheme: (theme: string) => trackAction('common_toggle_theme', pageType, { theme }),
    
    // 切換語言
    changeLanguage: (language: string) => trackAction('common_change_language', pageType, { language }),
  }

  return {
    trackAction: (action: string, meta?: Record<string, any>) => trackAction(action, pageType, meta),
    board: boardActions,
    sweep: sweepActions,
    home: homeActions,
    common: commonActions,
  }
}

