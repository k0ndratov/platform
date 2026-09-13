<script setup>
import { onMounted, onUnmounted } from 'vue'
import UiIcon from './UiIcon.vue'

defineProps({
  title: { type: String, default: '' },
})
const emit = defineEmits(['close'])

function onKey(e) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div class="backdrop" @click.self="emit('close')">
      <div class="modal" role="dialog" aria-modal="true">
        <header class="modal__head">
          <h3 class="modal__title">{{ title }}</h3>
          <button class="modal__close" aria-label="Close" @click="emit('close')"><UiIcon name="close" :size="20" /></button>
        </header>
        <div class="modal__body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="modal__foot">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 20, 0.7);
  display: grid;
  place-items: center;
  padding: 24px;
  z-index: 90;
}
.modal {
  width: 100%;
  max-width: 520px;
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px solid var(--surface-3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
.modal__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 0;
}
.modal__title {
  font-size: 18px;
}
.modal__close {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  padding: 4px;
}
.modal__close:hover {
  color: var(--text);
}
.modal__body {
  padding: 18px 24px 24px;
}
.modal__foot {
  display: flex;
  gap: 10px;
  padding: 0 24px 24px;
}
</style>
