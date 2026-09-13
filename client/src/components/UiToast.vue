<script setup>
import UiIcon from './UiIcon.vue'
import { useToast } from '../composables/useToast'

const toast = useToast()
</script>

<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in toast.items" :key="t.id" :class="['toast', `toast--${t.type}`]" @click="toast.remove(t.id)">
        <UiIcon :name="t.type === 'success' ? 'check' : 'info'" :size="18" />
        <span>{{ t.text }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 24px;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
}
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  border: 1px solid var(--surface-3);
  color: var(--text);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  max-width: 360px;
}
.toast--success {
  border-left: 3px solid var(--green);
}
.toast--success svg {
  color: var(--green);
}
.toast--error {
  border-left: 3px solid #ff7a90;
}
.toast--error svg {
  color: #ff7a90;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
