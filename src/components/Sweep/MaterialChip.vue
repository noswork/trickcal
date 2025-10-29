<template>
  <div class="material-chip" @click="$emit('click')">
    <img
      :src="`/assets/gears/${materialName}.png`"
      :alt="materialName"
      @error="handleImageError"
    />
    <span>{{ materialName }}</span>
  </div>
</template>

<script setup lang="ts">
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
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--chip-bg);
  border: 1px solid var(--border-color);
  border-radius: 50px;
  font-size: 0.75rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.material-chip:hover {
  background: var(--chip-hover);
  border-color: var(--primary-color);
}

.material-chip img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
}

.material-chip span {
  white-space: nowrap;
}
</style>

