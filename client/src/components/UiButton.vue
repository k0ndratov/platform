<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | outline | ghost
  type: { type: String, default: 'button' },
  disabled: Boolean,
})
</script>

<template>
  <button :type="type" :class="['btn', `btn--${variant}`]" :disabled="disabled">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 500;
  transition: filter 0.15s, background 0.15s;
}
.btn:disabled {
  opacity: 0.6;
  cursor: default;
}
.btn--primary {
  background: var(--green);
  color: #1d2633;
}
.btn--primary:hover:not(:disabled) {
  filter: brightness(1.08);
}
.btn--outline {
  background: transparent;
  color: var(--text);
  border-color: var(--text-muted);
}
.btn--outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
}
.btn--ghost {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
}
.btn--ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}
</style>
