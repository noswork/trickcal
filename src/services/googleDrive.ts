/**
 * Google Drive API 服務層
 * 負責與 Google Drive API 互動
 * 使用新版 Google Identity Services (GIS)
 */

import { GOOGLE_CONFIG, BACKUP_FILENAME } from '@/config/google'
import { logger } from '@/utils/logger'

// 宣告全域變數
declare const google: any
declare const gapi: any

export interface BackupData {
  version: string
  lastSync: string
  board: any
  sweep: any
  metadata: {
    device: string
    appVersion: string
    timestamp: number
  }
}

class GoogleDriveService {
  private isInitialized = false
  private isSignedIn = false
  private accessToken: string | null = null
  private tokenClient: any = null
  private currentUser: any = null
  private tokenExpiryTime: number = 0

  /**
   * 初始化 Google API Client
   */
  async init(): Promise<void> {
    if (this.isInitialized) return

    try {
      // 等待 gapi 載入
      await this.loadGapi()

      // 初始化 gapi.client
      await new Promise<void>((resolve, reject) => {
        gapi.load('client', async () => {
          try {
            await gapi.client.init({
              apiKey: GOOGLE_CONFIG.API_KEY,
              discoveryDocs: GOOGLE_CONFIG.DISCOVERY_DOCS,
            })
            resolve()
          } catch (error) {
            reject(error)
          }
        })
      })

      // 等待 Google Identity Services 載入
      await this.loadGIS()

      // 初始化 Token Client (新版 OAuth)
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        scope: GOOGLE_CONFIG.SCOPES,
        callback: (response: any) => {
          // 這個 callback 只用於處理 token 刷新
          // 實際的登入處理在 signIn() 方法中
          if (response.error) {
            logger.error('Token 取得失敗:', response)
            this.isSignedIn = false
            this.accessToken = null
            this.saveAuthState()
            return
          }
          
          logger.info('Token callback 被觸發')
        },
      })

      this.isInitialized = true
      
      // 恢復登入狀態
      await this.loadAuthState()
      
      logger.info('Google Drive API 初始化成功')
    } catch (error) {
      logger.error('Google Drive API 初始化失敗:', error)
      throw error
    }
  }

  /**
   * 等待 gapi 載入
   */
  private loadGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof gapi !== 'undefined') {
        resolve()
        return
      }

      const checkGapi = setInterval(() => {
        if (typeof gapi !== 'undefined') {
          clearInterval(checkGapi)
          resolve()
        }
      }, 100)

      setTimeout(() => {
        clearInterval(checkGapi)
        reject(new Error('gapi 載入逾時'))
      }, 10000)
    })
  }

  /**
   * 等待 Google Identity Services 載入
   */
  private loadGIS(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.accounts) {
        resolve()
        return
      }

      const checkGoogle = setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts) {
          clearInterval(checkGoogle)
          resolve()
        }
      }, 100)

      setTimeout(() => {
        clearInterval(checkGoogle)
        reject(new Error('Google Identity Services 載入逾時'))
      }, 10000)
    })
  }

  /**
   * 登入 Google
   */
  async signIn(): Promise<void> {
    if (!this.isInitialized) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      try {
        // 更新 callback 來處理 Promise
        const originalCallback = this.tokenClient.callback
        this.tokenClient.callback = async (response: any) => {
          if (response.error) {
            logger.error('Google 登入失敗:', response)
            reject(new Error(response.error))
            return
          }
          
          this.accessToken = response.access_token
          this.isSignedIn = true
          this.tokenExpiryTime = Date.now() + (response.expires_in || 3600) * 1000
          gapi.client.setToken({ access_token: this.accessToken })
          
          // 等待獲取用戶信息完成
          await this.fetchUserInfo()
          
          // 保存登入狀態
          this.saveAuthState()
          
          logger.info('Google 登入成功')
          
          // 恢復原始 callback
          this.tokenClient.callback = originalCallback
          resolve()
        }

        // 請求存取權杖
        this.tokenClient.requestAccessToken({ prompt: 'consent' })
      } catch (error) {
        logger.error('Google 登入失敗:', error)
        reject(error)
      }
    })
  }

  /**
   * 登出 Google
   */
  async signOut(): Promise<void> {
    if (!this.isInitialized) return

    try {
      if (this.accessToken) {
        google.accounts.oauth2.revoke(this.accessToken, () => {
          logger.info('Access token 已撤銷')
        })
      }
      
      this.accessToken = null
      this.isSignedIn = false
      this.currentUser = null
      this.tokenExpiryTime = 0
      gapi.client.setToken(null)
      
      // 清除保存的狀態
      this.saveAuthState()
      
      logger.info('Google 登出成功')
    } catch (error) {
      logger.error('Google 登出失敗:', error)
      throw error
    }
  }

  /**
   * 檢查是否已登入
   */
  checkSignedIn(): boolean {
    return this.isSignedIn && this.accessToken !== null
  }

  /**
   * 獲取當前用戶信息
   */
  getCurrentUser() {
    if (!this.isSignedIn) return null
    return this.currentUser
  }

  /**
   * 獲取用戶資訊（使用 Google OAuth2 userinfo API）
   */
  private async fetchUserInfo() {
    if (!this.accessToken) return

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (response.ok) {
        const userInfo = await response.json()
        this.currentUser = {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          imageUrl: userInfo.picture,
        }
        this.saveAuthState()
        logger.info('獲取用戶資訊成功')
      }
    } catch (error) {
      logger.error('獲取用戶資訊失敗:', error)
    }
  }

  /**
   * 保存登入狀態到 localStorage
   */
  private saveAuthState() {
    try {
      const state = {
        isSignedIn: this.isSignedIn,
        accessToken: this.accessToken,
        tokenExpiryTime: this.tokenExpiryTime,
        currentUser: this.currentUser,
      }
      localStorage.setItem('google_auth_state', JSON.stringify(state))
    } catch (error) {
      logger.error('保存登入狀態失敗:', error)
    }
  }

  /**
   * 從 localStorage 恢復登入狀態
   */
  private async loadAuthState() {
    try {
      const savedState = localStorage.getItem('google_auth_state')
      if (!savedState) return

      const state = JSON.parse(savedState)
      
      // 檢查 token 是否過期
      if (state.tokenExpiryTime && Date.now() < state.tokenExpiryTime) {
        this.isSignedIn = state.isSignedIn
        this.accessToken = state.accessToken
        this.tokenExpiryTime = state.tokenExpiryTime
        this.currentUser = state.currentUser
        
        if (this.accessToken) {
          gapi.client.setToken({ access_token: this.accessToken })
          logger.info('恢復登入狀態成功，用戶信息:', this.currentUser)
          
          // 如果沒有用戶信息，嘗試重新獲取
          if (!this.currentUser || !this.currentUser.imageUrl) {
            logger.info('用戶信息不完整，重新獲取...')
            await this.fetchUserInfo()
          }
        }
      } else {
        // Token 已過期，清除狀態
        localStorage.removeItem('google_auth_state')
        logger.info('Token 已過期')
      }
    } catch (error) {
      logger.error('恢復登入狀態失敗:', error)
    }
  }

  /**
   * 搜尋備份檔案
   */
  async findBackupFile(): Promise<gapi.client.drive.File | null> {
    if (!this.isSignedIn) {
      throw new Error('請先登入 Google')
    }

    try {
      const response = await gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        fields: 'files(id, name, modifiedTime, size)',
        q: `name='${BACKUP_FILENAME}'`,
      })

      const files = response.result.files || []
      return files.length > 0 ? files[0] : null
    } catch (error) {
      logger.error('搜尋備份檔案失敗:', error)
      throw error
    }
  }

  /**
   * 下載備份檔案
   */
  async downloadBackup(fileId: string): Promise<BackupData> {
    if (!this.isSignedIn) {
      throw new Error('請先登入 Google')
    }

    try {
      const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
      })

      logger.info('從 Google Drive 下載備份成功')
      return response.result as any as BackupData
    } catch (error) {
      logger.error('下載備份檔案失敗:', error)
      throw error
    }
  }

  /**
   * 上傳備份檔案
   */
  async uploadBackup(data: BackupData, existingFileId?: string): Promise<string> {
    if (!this.isSignedIn) {
      throw new Error('請先登入 Google')
    }

    try {
      const boundary = '-------314159265358979323846'
      const delimiter = `\r\n--${boundary}\r\n`
      const closeDelimiter = `\r\n--${boundary}--`

      // 更新檔案時不能包含 parents 欄位
      const metadata = existingFileId
        ? {
            name: BACKUP_FILENAME,
            mimeType: 'application/json',
          }
        : {
            name: BACKUP_FILENAME,
            mimeType: 'application/json',
            parents: ['appDataFolder'],
          }

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(data, null, 2) +
        closeDelimiter

      const request = existingFileId
        ? gapi.client.request({
            path: `/upload/drive/v3/files/${existingFileId}`,
            method: 'PATCH',
            params: { uploadType: 'multipart' },
            headers: {
              'Content-Type': `multipart/related; boundary="${boundary}"`,
            },
            body: multipartRequestBody,
          })
        : gapi.client.request({
            path: '/upload/drive/v3/files',
            method: 'POST',
            params: { uploadType: 'multipart' },
            headers: {
              'Content-Type': `multipart/related; boundary="${boundary}"`,
            },
            body: multipartRequestBody,
          })

      const response = await request
      logger.info('上傳備份到 Google Drive 成功')
      return response.result.id
    } catch (error) {
      logger.error('上傳備份檔案失敗:', error)
      throw error
    }
  }

  /**
   * 刪除備份檔案
   */
  async deleteBackup(fileId: string): Promise<void> {
    if (!this.isSignedIn) {
      throw new Error('請先登入 Google')
    }

    try {
      await gapi.client.drive.files.delete({
        fileId: fileId,
      })
      logger.info('刪除 Google Drive 備份成功')
    } catch (error) {
      logger.error('刪除備份檔案失敗:', error)
      throw error
    }
  }
}

// 導出單例
export const googleDrive = new GoogleDriveService()

