/**
 * 同步 Store
 * 管理 Google Drive 同步狀態和操作
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { syncManager, type SyncStatus } from '@/services/syncManager'
import { useBoardStore } from './board'
import { useSweepStore } from './sweep'
import { logger } from '@/utils/logger'

export const useSyncStore = defineStore('sync', () => {
  const boardStore = useBoardStore()
  const sweepStore = useSweepStore()

  // 同步狀態
  const status = ref<SyncStatus>({
    isInitialized: false,
    isSignedIn: false,
    isSyncing: false,
    lastSyncTime: null,
    lastError: null,
  })

  // 衝突數據（當本地和雲端都有數據且不一致時）
  const conflictData = ref<any>(null)
  const showConflictDialog = ref(false)

  // 恢復對話框
  const showRestoreDialog = ref(false)
  const cloudBackupData = ref<any>(null)

  // 是否已登入
  const isSignedIn = computed(() => status.value.isSignedIn)

  // 是否正在同步
  const isSyncing = computed(() => status.value.isSyncing)

  // 最後同步時間（格式化）
  const lastSyncTimeFormatted = computed(() => {
    if (!status.value.lastSyncTime) return null
    const date = new Date(status.value.lastSyncTime)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  })

  // 當前用戶
  const currentUser = ref<{
    id: string
    name: string
    email: string
    imageUrl: string
  } | null>(null)

  /**
   * 初始化同步管理器
   */
  async function initialize() {
    try {
      // 訂閱狀態變化
      syncManager.onStatusChange((newStatus) => {
        status.value = newStatus
        
        // 更新用戶信息
        if (newStatus.isSignedIn) {
          currentUser.value = syncManager.getCurrentUser()
        } else {
          currentUser.value = null
        }
      })

      await syncManager.initialize()
      // 初始化完成，不自動執行任何同步操作
      logger.info('同步管理器初始化成功')
    } catch (error) {
      logger.error('初始化同步管理器失敗:', error)
    }
  }

  /**
   * 登入 Google
   */
  async function signIn() {
    try {
      await syncManager.signIn()
      // 等待一下確保用戶信息已獲取
      await new Promise(resolve => setTimeout(resolve, 500))
      currentUser.value = syncManager.getCurrentUser()
      logger.info('登入成功，用戶信息:', currentUser.value)
      // 不自動執行任何操作，讓用戶手動選擇上傳或下載
    } catch (error) {
      logger.error('登入失敗:', error)
      throw error
    }
  }

  /**
   * 登出 Google
   */
  async function signOut() {
    try {
      await syncManager.signOut()
      currentUser.value = null
      conflictData.value = null
      showConflictDialog.value = false
      showRestoreDialog.value = false
    } catch (error) {
      logger.error('登出失敗:', error)
      throw error
    }
  }

  /**
   * 獲取本地數據
   */
  function getLocalData() {
    return {
      board: {
        ownedCharacters: Array.from(boardStore.userProgress.ownedCharacters),
        activatedCells: boardStore.userProgress.activatedCells,
      },
      sweep: {
        selectedMaterials: Array.from(sweepStore.selectedMaterials),
      },
      timestamp: Date.now(),
    }
  }

  /**
   * 應用雲端數據到本地
   */
  function applyCloudData(cloudData: any) {
    try {
      // 應用 board 數據
      if (cloudData.board) {
        boardStore.userProgress.ownedCharacters = new Set(
          cloudData.board.ownedCharacters || []
        )
        boardStore.userProgress.activatedCells = cloudData.board.activatedCells || {}
        if (typeof boardStore.saveUserProgress === 'function') {
          boardStore.saveUserProgress()
        }
      }

      // 應用 sweep 數據
      if (cloudData.sweep) {
        sweepStore.selectedMaterials = new Set(cloudData.sweep.selectedMaterials || [])
        if (typeof sweepStore.saveSelection === 'function') {
          sweepStore.saveSelection()
        }
      }

      logger.info('應用雲端數據成功')
    } catch (error) {
      logger.error('應用雲端數據失敗:', error)
      throw error
    }
  }

  /**
   * 檢查雲端備份狀態（不自動執行任何操作）
   */
  async function checkCloudBackupStatus() {
    try {
      const cloudData = await syncManager.checkCloudBackup()
      
      if (!cloudData) {
        logger.info('雲端無備份')
        return null
      }

      logger.info(`找到雲端備份: ${cloudData.timestamp}`)
      return cloudData
    } catch (error) {
      logger.error('檢查雲端備份失敗:', error)
      return null
    }
  }

  /**
   * 上傳到雲端
   */
  async function uploadToCloud() {
    const localData = getLocalData()
    await syncManager.uploadToCloud(localData.board, localData.sweep)
  }

  /**
   * 從雲端恢復
   */
  async function restoreFromCloud(cloudData?: any) {
    try {
      const dataToRestore = cloudData || (await syncManager.downloadFromCloud())
      
      if (!dataToRestore) {
        throw new Error('無雲端備份可恢復')
      }

      applyCloudData(dataToRestore)
      
      // 關閉對話框
      showRestoreDialog.value = false
      showConflictDialog.value = false
      conflictData.value = null
    } catch (error) {
      logger.error('從雲端恢復失敗:', error)
      throw error
    }
  }

  /**
   * 解決衝突 - 使用本地數據
   */
  async function resolveConflictWithLocal() {
    try {
      await uploadToCloud()
      showConflictDialog.value = false
      conflictData.value = null
    } catch (error) {
      logger.error('上傳本地數據失敗:', error)
      throw error
    }
  }

  /**
   * 解決衝突 - 使用雲端數據
   */
  async function resolveConflictWithCloud() {
    try {
      if (!conflictData.value) {
        throw new Error('無衝突數據')
      }
      await restoreFromCloud(conflictData.value)
    } catch (error) {
      logger.error('使用雲端數據失敗:', error)
      throw error
    }
  }

  /**
   * 忽略恢復提示
   */
  function dismissRestoreDialog() {
    showRestoreDialog.value = false
    cloudBackupData.value = null
  }

  /**
   * 刪除雲端備份
   */
  async function deleteCloudBackup() {
    try {
      await syncManager.deleteCloudBackup()
      logger.info('雲端備份已刪除')
    } catch (error) {
      logger.error('刪除雲端備份失敗:', error)
      throw error
    }
  }

  /**
   * 手動同步（用戶主動觸發）
   */
  async function manualSync() {
    try {
      const localData = getLocalData()
      const result = await syncManager.autoSync(
        localData.board,
        localData.sweep,
        localData.timestamp
      )

      if (result.action === 'downloaded' && result.data) {
        // 下載了雲端數據，提示用戶是否應用
        cloudBackupData.value = result.data
        showRestoreDialog.value = true
      } else if (result.action === 'conflict' && result.data) {
        // 衝突，顯示衝突對話框
        conflictData.value = result.data
        showConflictDialog.value = true
      } else if (result.action === 'uploaded') {
        logger.info('本地數據已上傳到雲端')
      }
    } catch (error) {
      logger.error('手動同步失敗:', error)
      throw error
    }
  }

  return {
    // 狀態
    status,
    isSignedIn,
    isSyncing,
    lastSyncTimeFormatted,
    currentUser,
    
    // 對話框狀態
    showConflictDialog,
    conflictData,
    showRestoreDialog,
    cloudBackupData,

    // 方法
    initialize,
    signIn,
    signOut,
    checkCloudBackupStatus,
    uploadToCloud,
    restoreFromCloud,
    resolveConflictWithLocal,
    resolveConflictWithCloud,
    dismissRestoreDialog,
    deleteCloudBackup,
    manualSync,
  }
})

