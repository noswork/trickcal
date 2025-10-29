/**
 * 應用程式常量定義
 * 統一管理所有常量，避免字串拼寫錯誤
 */

/**
 * LocalStorage 鍵值
 */
export const STORAGE_KEYS = {
  /** 主題設定 */
  THEME: 'trickcal_theme',
  /** 語言設定 */
  LANGUAGE: 'trickcal_language',
  /** 金蠟筆記錄本進度 */
  BOARD_PROGRESS: 'trickcal_board_progress',
  /** 掃蕩工具選擇 */
  SWEEP_SELECTION: 'trickcal_sweep_selected_materials',
  /** 使用計數 Session ID */
  USAGE_SESSION_ID: 'trickcal_usage_session_id',
  /** 待同步的使用事件 */
  USAGE_PENDING_EVENTS: 'trickcal_usage_pending_events',
} as const

/**
 * Supabase 配置
 */
export const SUPABASE_CONFIG = {
  /** Supabase 項目 URL */
  URL: import.meta.env.VITE_SUPABASE_URL || 'https://phiemgvtolycpmpbgzan.supabase.co',
  /** Supabase 匿名金鑰 */
  ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaWVtZ3Z0b2x5Y3BtcGJnemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTQ5NDksImV4cCI6MjA3NjMzMDk0OX0.-nSfSQpKvD6Ye0GJ0BVJMamFWrHjqriQbXJ1n0T9Pas',
} as const

/**
 * API 配置
 */
export const API_CONFIG = {
  /** 同步間隔（毫秒）- 1 分鐘 */
  SYNC_INTERVAL: 60000,
} as const

/**
 * 應用程式配置
 */
export const APP_CONFIG = {
  /** 應用程式名稱 */
  NAME: 'Trickcal',
  /** 應用程式版本 */
  VERSION: '1.0.0',
} as const

