<template>
  <div id="app" :data-theme="theme">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const theme = computed(() => themeStore.currentTheme)
</script>

<style>
/* 全局樣式將在 styles/main.css 中定義 */
</style>

