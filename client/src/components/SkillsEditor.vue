<script setup>
import { ref } from 'vue'
import UiModal from './UiModal.vue'
import UiButton from './UiButton.vue'
import TagInput from './TagInput.vue'
import { api } from '../api'
import { useToast } from '../composables/useToast'
import { useUser } from '../composables/useUser'

const props = defineProps({
  skills: { type: Array, required: true },
})
const emit = defineEmits(['close', 'saved'])

const toast = useToast()
const { set } = useUser()
const draft = ref([...props.skills])
const busy = ref(false)

const suggestions = ['Vue', 'React', 'JavaScript', 'TypeScript', 'Rails', 'Node.js', 'Python', 'Go', 'Rust', 'C', 'PostgreSQL', 'Figma', 'UI design', 'Product', 'Marketing', 'DevOps']

async function save() {
  busy.value = true
  try {
    const user = await api.updateSkills(draft.value)
    set(user)
    toast.success('Skills saved')
    emit('saved', user)
    emit('close')
  } catch (e) {
    toast.error(e.message)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <UiModal title="Your skills" @close="emit('close')">
    <p class="muted hint">Startups that need these skills will appear in "Matches your skills".</p>
    <TagInput v-model="draft" placeholder="Add a skill and press Enter" :suggestions="suggestions" />
    <template #footer>
      <UiButton :disabled="busy" @click="save">Save</UiButton>
      <UiButton variant="ghost" @click="emit('close')">Cancel</UiButton>
    </template>
  </UiModal>
</template>

<style scoped>
.hint {
  margin: 0 0 14px;
  font-size: 13px;
}
</style>
