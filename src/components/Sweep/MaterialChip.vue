<template>
  <div class="material-chip" @click="$emit('click')" :title="materialName">
    <img
      :src="getGearImageUrl(materialName)"
      :alt="materialName"
      @error="handleImageError"
    />
  </div>
</template>

<script setup lang="ts">
import { getGearImageUrl } from '@/utils/assets'

defineProps<{
  materialName: string
}>()

defineEmits<{
  click: []
}>()

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement
  target.style.opacity = '0'
}
</script>

<style scoped>
.material-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  background: var(--chip-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: all 0.2s;
  cursor: pointer;
}

.material-chip:hover {
  background: var(--chip-hover);
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.material-chip img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  display: block;
}
</style>

