/**
 * Toast 通知服務
 */

import { createApp, h, type Component } from 'vue'
import Toast from '@/components/Common/Toast.vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  message: string
  type?: ToastType
  duration?: number
}

let toastContainer: HTMLElement | null = null
let currentToastApp: any = null

function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    document.body.appendChild(toastContainer)
  }
  return toastContainer
}

function showToast(options: ToastOptions) {
  const container = ensureContainer()
  
  // 移除現有的 toast
  if (currentToastApp) {
    currentToastApp.unmount()
    currentToastApp = null
  }
  
  // 創建新的 toast
  const toastApp = createApp({
    render() {
      return h(Toast, {
        message: options.message,
        type: options.type || 'info',
        duration: options.duration || 3000,
      })
    }
  })
  
  currentToastApp = toastApp
  const toastInstance = toastApp.mount(container)
  
  // 自動清理
  setTimeout(() => {
    if (currentToastApp === toastApp) {
      toastApp.unmount()
      currentToastApp = null
    }
  }, (options.duration || 3000) + 500)
  
  return toastInstance
}

export const toast = {
  success(message: string, duration = 3000) {
    return showToast({ message, type: 'success', duration })
  },
  
  error(message: string, duration = 4000) {
    return showToast({ message, type: 'error', duration })
  },
  
  warning(message: string, duration = 3500) {
    return showToast({ message, type: 'warning', duration })
  },
  
  info(message: string, duration = 3000) {
    return showToast({ message, type: 'info', duration })
  },
  
  show(options: ToastOptions) {
    return showToast(options)
  }
}

