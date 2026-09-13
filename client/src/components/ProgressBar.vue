<script setup>
defineProps({
  value: { type: Number, required: true }, // 0..100
  height: { type: Number, default: 8 },
})
</script>

<template>
  <div class="track" :style="{ height: `${height}px` }">
    <div class="fill" :style="{ width: `${Math.min(100, Math.max(0, value))}%` }" />
  </div>
</template>

<style scoped>
.track {
  width: 100%;
  background: var(--surface-3);
  border-radius: 999px;
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: 999px;
  background: var(--gradient-progress);
}
</style>
