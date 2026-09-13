import { reactive } from 'vue'

// One shared list of toasts for the whole app
const state = reactive({ items: [] })
let nextId = 1

export function useToast() {
  function show(text, type = 'success', ms = 3200) {
    const id = nextId++
    state.items.push({ id, text, type })
    setTimeout(() => remove(id), ms)
  }
  function remove(id) {
    const i = state.items.findIndex((t) => t.id === id)
    if (i !== -1) state.items.splice(i, 1)
  }
  return {
    items: state.items,
    success: (t) => show(t, 'success'),
    error: (t) => show(t, 'error', 4500),
    remove,
  }
}
