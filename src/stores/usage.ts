/**
 * 使用計數 Store
 * 管理全局的使用計數狀態，提供即時反饋
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUsageStore = defineStore('usage', () => {
  const localCount = ref(0)
  const remoteCount = ref(0)
  const isUpdating = ref(false)

  const totalCount = ref(0)

  /**
   * 增加本地計數（即時反饋）
   */
  function incrementLocalCount() {
    localCount.value++
    totalCount.value++
    
    // 顯示更新動畫
    isUpdating.value = true
    setTimeout(() => {
      isUpdating.value = false
    }, 300)
  }

  /**
   * 設置遠端計數
   */
  function setRemoteCount(count: number) {
    remoteCount.value = count
    totalCount.value = remoteCount.value + localCount.value
  }

  /**
   * 同步完成後重置本地計數
   */
  function resetLocalCount() {
    localCount.value = 0
  }

  /**
   * 更新總計數
   */
  function updateTotalCount() {
    totalCount.value = remoteCount.value + localCount.value
  }

  return {
    localCount,
    remoteCount,
    totalCount,
    isUpdating,
    incrementLocalCount,
    setRemoteCount,
    resetLocalCount,
    updateTotalCount,
  }
})

