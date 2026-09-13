<script setup>
defineProps({
  inner: Boolean, // lighter nested card
})
</script>

<template>
  <div :class="['card', { 'card--inner': inner }]">
    <slot />
  </div>
</template>

<style scoped>
.card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 24px;
}
.card--inner {
  background: var(--surface-2);
}
</style>
