<script setup>
import { ref } from 'vue'
import UiIcon from './UiIcon.vue'

const props = defineProps({
  modelValue: { type: Array, required: true },
  placeholder: { type: String, default: 'Type and press Enter' },
  suggestions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const draft = ref('')

function add(value) {
  const v = (value ?? draft.value).trim()
  if (!v) return
  const exists = props.modelValue.some((x) => x.toLowerCase() === v.toLowerCase())
  if (!exists) emit('update:modelValue', [...props.modelValue, v])
  draft.value = ''
}

function remove(i) {
  emit('update:modelValue', props.modelValue.filter((_, idx) => idx !== i))
}

function onKeydown(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    add()
  } else if (e.key === 'Backspace' && !draft.value && props.modelValue.length) {
    remove(props.modelValue.length - 1)
  }
}
</script>

<template>
  <div class="tags">
    <div class="tags__box">
      <span v-for="(t, i) in modelValue" :key="t" class="tag">
        {{ t }}
        <button type="button" class="tag__x" :aria-label="`Remove ${t}`" @click="remove(i)">
          <UiIcon name="close" :size="12" />
        </button>
      </span>
      <input v-model="draft" class="tags__input" :placeholder="modelValue.length ? '' : placeholder" @keydown="onKeydown" @blur="add()" />
    </div>
    <div v-if="suggestions.length" class="tags__suggest">
      <button
        v-for="sg in suggestions.filter((x) => !modelValue.includes(x))"
        :key="sg"
        type="button"
        class="suggest"
        @click="add(sg)"
      >
        + {{ sg }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.tags__box {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--surface-3);
  background: var(--surface-2);
  cursor: text;
}
.tags__box:focus-within {
  border-color: var(--green);
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px 4px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.07);
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
}
.tag__x {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px;
  display: flex;
}
.tag__x:hover {
  color: var(--text);
}
.tags__input {
  flex: 1;
  min-width: 120px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
  padding: 4px 4px;
}
.tags__input::placeholder {
  color: var(--text-dim);
}
.tags__suggest {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.suggest {
  border: 1px dashed var(--surface-3);
  background: transparent;
  color: var(--text-muted);
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 12px;
  cursor: pointer;
}
.suggest:hover {
  color: var(--text);
  border-color: var(--text-muted);
}
</style>
