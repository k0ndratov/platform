import { ref } from 'vue'
import { api } from '../api'

// Current user, shared between pages (loaded once)
const user = ref(null)
let loading = null

export function useUser() {
  async function load(force = false) {
    if (user.value && !force) return user.value
    if (!loading) loading = api.me().finally(() => (loading = null))
    user.value = await loading
    return user.value
  }
  return { user, load, set: (u) => (user.value = u) }
}
