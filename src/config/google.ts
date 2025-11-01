/**
 * Google OAuth 配置
 * 使用說明：
 * 1. 前往 https://console.cloud.google.com/
 * 2. 創建新專案或選擇現有專案
 * 3. 啟用 Google Drive API
 * 4. 建立 OAuth 2.0 用戶端 ID（網頁應用程式）
 * 5. 將您的網域加入「已授權的 JavaScript 來源」
 *    範例：https://yourdomain.com, http://localhost:5173
 * 6. 將以下網址加入「已授權的重新導向 URI」
 *    範例：https://yourdomain.com, http://localhost:5173
 * 7. 複製用戶端 ID 並貼到下方 CLIENT_ID
 */

export const GOOGLE_CONFIG = {
  // 請替換為您的 Google OAuth Client ID
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
  
  // API Key (可選，用於公開資料訪問)
  API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || '',
  
  // OAuth 範圍 - 訪問應用專屬資料夾和用戶基本資訊
  SCOPES: 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
  
  // Discovery docs
  DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
}

// 備份檔案名稱
export const BACKUP_FILENAME = 'trickcal-backup.json'

// 備份數據版本
export const BACKUP_VERSION = '1.0.0'

