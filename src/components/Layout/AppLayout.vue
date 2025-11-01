<template>
  <div class="app-layout">
    <AppHeader />
    <main class="app-main">
      <slot />
    </main>
    <AppFooter />
    
    <!-- Google Drive 同步對話框 -->
    <RestoreDialog />
    <ConflictDialog />
  </div>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import RestoreDialog from './RestoreDialog.vue'
import ConflictDialog from './ConflictDialog.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  width: 100%;
}
</style>

