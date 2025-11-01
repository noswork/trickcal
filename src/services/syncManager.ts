/**
 * 同步管理器
 * 負責協調本地數據與 Google Drive 的同步
 */

import { googleDrive, type BackupData } from './googleDrive'
import { BACKUP_VERSION } from '@/config/google'
import { logger } from '@/utils/logger'

export interface SyncStatus {
  isInitialized: boolean
  isSignedIn: boolean
  isSyncing: boolean
  lastSyncTime: number | null
  lastError: string | null
}

export interface ConflictResolution {
  useLocal: boolean
  useCloud: boolean
  merge: boolean
}

class SyncManager {
  private status: SyncStatus = {
    isInitialized: false,
    isSignedIn: false,
    isSyncing: false,
    lastSyncTime: null,
    lastError: null,
  }

  private listeners: ((status: SyncStatus) => void)[] = []

  /**
   * 訂閱狀態變化
   */
  onStatusChange(callback: (status: SyncStatus) => void) {
    this.listeners.push(callback)
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) this.listeners.splice(index, 1)
    }
  }

  /**
   * 更新狀態並通知監聽器
   */
  private updateStatus(updates: Partial<SyncStatus>) {
    this.status = { ...this.status, ...updates }
    this.listeners.forEach((listener) => listener(this.status))
    // 保存同步狀態到 localStorage
    this.saveSyncStatus()
  }

  /**
   * 獲取當前狀態
   */
  getStatus(): SyncStatus {
    return { ...this.status }
  }

  /**
   * 保存同步狀態到 localStorage
   */
  private saveSyncStatus() {
    try {
      const statusToSave = {
        lastSyncTime: this.status.lastSyncTime,
      }
      localStorage.setItem('sync_status', JSON.stringify(statusToSave))
    } catch (error) {
      logger.error('保存同步狀態失敗:', error)
    }
  }

  /**
   * 從 localStorage 恢復同步狀態
   */
  private loadSyncStatus() {
    try {
      const savedStatus = localStorage.getItem('sync_status')
      if (savedStatus) {
        const status = JSON.parse(savedStatus)
        if (status.lastSyncTime) {
          this.status.lastSyncTime = status.lastSyncTime
        }
      }
    } catch (error) {
      logger.error('恢復同步狀態失敗:', error)
    }
  }

  /**
   * 初始化同步管理器
   */
  async initialize() {
    try {
      // 先恢復同步狀態
      this.loadSyncStatus()
      
      await googleDrive.init()
      const isSignedIn = googleDrive.checkSignedIn()
      
      this.updateStatus({
        isInitialized: true,
        isSignedIn,
      })

      // 不自動執行任何操作，讓用戶手動選擇

      logger.info('同步管理器初始化成功')
    } catch (error) {
      logger.error('同步管理器初始化失敗:', error)
      this.updateStatus({
        lastError: error instanceof Error ? error.message : '初始化失敗',
      })
      throw error
    }
  }

  /**
   * 登入
   */
  async signIn() {
    try {
      await googleDrive.signIn()
      this.updateStatus({ isSignedIn: true, lastError: null })
      
      // 不自動執行任何操作，讓用戶手動選擇
      
      logger.info('登入成功')
    } catch (error) {
      logger.error('登入失敗:', error)
      this.updateStatus({
        isSignedIn: false,
        lastError: error instanceof Error ? error.message : '登入失敗',
      })
      throw error
    }
  }

  /**
   * 登出
   */
  async signOut() {
    try {
      await googleDrive.signOut()
      this.updateStatus({
        isSignedIn: false,
        lastSyncTime: null,
        lastError: null,
      })
      // 清除保存的同步狀態
      localStorage.removeItem('sync_status')
      logger.info('登出成功')
    } catch (error) {
      logger.error('登出失敗:', error)
      this.updateStatus({
        lastError: error instanceof Error ? error.message : '登出失敗',
      })
      throw error
    }
  }

  /**
   * 獲取當前用戶信息
   */
  getCurrentUser() {
    return googleDrive.getCurrentUser()
  }

  /**
   * 檢查雲端備份
   * 返回雲端備份數據（如果存在）
   */
  async checkCloudBackup(): Promise<BackupData | null> {
    try {
      const file = await googleDrive.findBackupFile()
      
      if (!file || !file.id) {
        logger.info('雲端無備份檔案')
        return null
      }

      const cloudData = await googleDrive.downloadBackup(file.id)
      logger.info('找到雲端備份:', file.modifiedTime)
      return cloudData
    } catch (error) {
      logger.error('檢查雲端備份失敗:', error)
      return null
    }
  }

  /**
   * 創建備份數據
   */
  private createBackupData(boardData: any, sweepData: any): BackupData {
    return {
      version: BACKUP_VERSION,
      lastSync: new Date().toISOString(),
      board: boardData,
      sweep: sweepData,
      metadata: {
        device: navigator.userAgent,
        appVersion: '1.0.0',
        timestamp: Date.now(),
      },
    }
  }

  /**
   * 上傳到雲端
   */
  async uploadToCloud(boardData: any, sweepData: any): Promise<void> {
    if (!this.status.isSignedIn) {
      throw new Error('請先登入 Google')
    }

    this.updateStatus({ isSyncing: true, lastError: null })

    try {
      const backupData = this.createBackupData(boardData, sweepData)
      
      // 檢查是否已存在備份檔案
      const existingFile = await googleDrive.findBackupFile()
      const fileId = existingFile?.id

      // 上傳或更新
      await googleDrive.uploadBackup(backupData, fileId)

      this.updateStatus({
        isSyncing: false,
        lastSyncTime: Date.now(),
        lastError: null,
      })

      logger.info('上傳到雲端成功')
    } catch (error) {
      logger.error('上傳到雲端失敗:', error)
      this.updateStatus({
        isSyncing: false,
        lastError: error instanceof Error ? error.message : '上傳失敗',
      })
      throw error
    }
  }

  /**
   * 從雲端下載
   */
  async downloadFromCloud(): Promise<BackupData | null> {
    if (!this.status.isSignedIn) {
      throw new Error('請先登入 Google')
    }

    this.updateStatus({ isSyncing: true, lastError: null })

    try {
      const file = await googleDrive.findBackupFile()

      if (!file || !file.id) {
        this.updateStatus({ isSyncing: false })
        return null
      }

      const cloudData = await googleDrive.downloadBackup(file.id)

      this.updateStatus({
        isSyncing: false,
        lastSyncTime: Date.now(),
        lastError: null,
      })

      logger.info('從雲端下載成功')
      return cloudData
    } catch (error) {
      logger.error('從雲端下載失敗:', error)
      this.updateStatus({
        isSyncing: false,
        lastError: error instanceof Error ? error.message : '下載失敗',
      })
      throw error
    }
  }

  /**
   * 刪除雲端備份
   */
  async deleteCloudBackup(): Promise<void> {
    if (!this.status.isSignedIn) {
      throw new Error('請先登入 Google')
    }

    try {
      const file = await googleDrive.findBackupFile()
      
      if (file && file.id) {
        await googleDrive.deleteBackup(file.id)
        logger.info('刪除雲端備份成功')
      }
    } catch (error) {
      logger.error('刪除雲端備份失敗:', error)
      throw error
    }
  }

  /**
   * 比較本地和雲端數據，返回建議的操作
   */
  compareData(
    localData: { board: any; sweep: any; timestamp?: number },
    cloudData: BackupData
  ): 'useLocal' | 'useCloud' | 'conflict' {
    // 如果本地沒有時間戳，使用雲端
    if (!localData.timestamp) {
      return 'useCloud'
    }

    const localTime = localData.timestamp
    const cloudTime = new Date(cloudData.lastSync).getTime()

    // 時間差小於 1 分鐘，視為相同
    const timeDiff = Math.abs(localTime - cloudTime)
    if (timeDiff < 60000) {
      return 'useLocal' // 預設使用本地
    }

    // 雲端較新
    if (cloudTime > localTime) {
      return 'useCloud'
    }

    // 本地較新
    if (localTime > cloudTime) {
      return 'useLocal'
    }

    // 時間相同但數據可能不同
    return 'conflict'
  }

  /**
   * 自動同步（根據時間戳智能選擇）
   */
  async autoSync(
    localBoardData: any,
    localSweepData: any,
    localTimestamp?: number
  ): Promise<{ action: 'uploaded' | 'downloaded' | 'conflict'; data?: BackupData }> {
    const cloudData = await this.checkCloudBackup()

    if (!cloudData) {
      // 雲端無備份，上傳本地數據
      await this.uploadToCloud(localBoardData, localSweepData)
      return { action: 'uploaded' }
    }

    // 比較數據
    const comparison = this.compareData(
      { board: localBoardData, sweep: localSweepData, timestamp: localTimestamp },
      cloudData
    )

    if (comparison === 'useCloud') {
      return { action: 'downloaded', data: cloudData }
    } else if (comparison === 'useLocal') {
      await this.uploadToCloud(localBoardData, localSweepData)
      return { action: 'uploaded' }
    } else {
      // 衝突，需要用戶介入
      return { action: 'conflict', data: cloudData }
    }
  }
}

// 導出單例
export const syncManager = new SyncManager()

