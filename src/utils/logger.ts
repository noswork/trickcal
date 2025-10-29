/**
 * 日誌工具
 * 開發環境顯示詳細日誌，生產環境只顯示錯誤
 */

const isDev = import.meta.env.DEV

/**
 * 日誌級別
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * 日誌工具類
 */
export class Logger {
  /**
   * 調試日誌（僅開發環境）
   */
  static debug(...args: any[]): void {
    if (isDev) {
      console.log('[DEBUG]', ...args)
    }
  }

  /**
   * 信息日誌（僅開發環境）
   */
  static info(...args: any[]): void {
    if (isDev) {
      console.log('[INFO]', ...args)
    }
  }

  /**
   * 警告日誌（僅開發環境）
   */
  static warn(...args: any[]): void {
    if (isDev) {
      console.warn('[WARN]', ...args)
    }
  }

  /**
   * 錯誤日誌（所有環境）
   */
  static error(...args: any[]): void {
    console.error('[ERROR]', ...args)
  }

  /**
   * 成功日誌（僅開發環境）
   */
  static success(...args: any[]): void {
    if (isDev) {
      console.log('[SUCCESS]', ...args)
    }
  }

  /**
   * 帶標籤的日誌（僅開發環境）
   */
  static tagged(tag: string, level: LogLevel = LogLevel.INFO, ...args: any[]): void {
    if (!isDev && level !== LogLevel.ERROR) return

    const prefix = `[${tag.toUpperCase()}]`
    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(prefix, ...args)
        break
      case LogLevel.WARN:
        console.warn(prefix, ...args)
        break
      case LogLevel.ERROR:
        console.error(prefix, ...args)
        break
    }
  }
}

/**
 * 創建帶命名空間的日誌器
 */
export function createLogger(namespace: string) {
  return {
    debug: (...args: any[]) => Logger.tagged(namespace, LogLevel.DEBUG, ...args),
    info: (...args: any[]) => Logger.tagged(namespace, LogLevel.INFO, ...args),
    warn: (...args: any[]) => Logger.tagged(namespace, LogLevel.WARN, ...args),
    error: (...args: any[]) => Logger.tagged(namespace, LogLevel.ERROR, ...args),
    success: (...args: any[]) => Logger.success(`[${namespace}]`, ...args),
  }
}

/**
 * 默認導出
 */
export const logger = {
  debug: Logger.debug,
  info: Logger.info,
  warn: Logger.warn,
  error: Logger.error,
  success: Logger.success,
}

export default Logger

