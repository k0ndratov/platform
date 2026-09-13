<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import UiButton from '../components/UiButton.vue'
import UiIcon from '../components/UiIcon.vue'
import TagInput from '../components/TagInput.vue'
import StartupCard from '../components/StartupCard.vue'
import { api } from '../api'
import { useToast } from '../composables/useToast'
import { useUser } from '../composables/useUser'

const router = useRouter()
const toast = useToast()
const { user, load: loadUser } = useUser()
loadUser()
const busy = ref(false)

const stages = [
  { id: 'Idea', text: 'Just an idea, looking for people' },
  { id: 'MVP', text: 'First version exists' },
  { id: 'Growth', text: 'Real users, growing' },
]
const colors = ['#25c1cb', '#3f95d2', '#7c46d5', '#b070ff', '#44eb99', '#3ed9c3', '#f2a541', '#ff7a90']
const stackSuggestions = ['Vue', 'React', 'Rails', 'Node.js', 'Python', 'Go', 'C', 'PostgreSQL']
const skillSuggestions = ['Vue', 'JavaScript', 'Rails', 'Python', 'Figma', 'UI design', 'Product', 'Marketing']

const form = reactive({
  name: '',
  pitch: '',
  description: '',
  problem: '',
  solution: '',
  stage: 'Idea',
  color: colors[0],
  stack: [],
  roles: [],
  links: [],
})

const submitted = ref(false)

function addRole() {
  form.roles.push({ role: '', text: '', skills: [] })
}
function removeRole(i) {
  form.roles.splice(i, 1)
}
function addLink() {
  form.links.push({ label: '', url: '' })
}
function removeLink(i) {
  form.links.splice(i, 1)
}

const initials = computed(() => {
  const words = form.name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return '??'
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
})

// Object in the same shape as the API startup summary, used by the preview card
const preview = computed(() => ({
  slug: 'preview',
  name: form.name.trim() || 'Your startup',
  pitch: form.pitch.trim() || 'One sentence about what you build and for whom.',
  stage: form.stage,
  color: form.color,
  logo: initials.value,
  stack: form.stack,
  founders: [user.value?.login ?? 'you'],
  team: [{ login: user.value?.login ?? 'you' }],
  match: null,
  isMember: false,
  lookingFor: form.roles.filter((r) => r.role.trim()).map((r) => ({ ...r, role: r.role.trim() })),
}))

const errors = computed(() => {
  const e = {}
  if (form.name.trim().length < 2) e.name = 'Please add a name (at least 2 letters).'
  if (form.pitch.trim().length < 10) e.pitch = 'A short pitch helps people understand the idea (at least 10 letters).'
  if (form.roles.some((r) => !r.role.trim())) e.roles = 'Every open role needs a name, or remove the empty one.'
  return e
})
const isValid = computed(() => Object.keys(errors.value).length === 0)

async function submit() {
  submitted.value = true
  if (!isValid.value) return
  busy.value = true
  try {
    const startup = await api.createStartup({
      name: form.name.trim(),
      pitch: form.pitch.trim(),
      description: form.description.trim(),
      problem: form.problem.trim(),
      solution: form.solution.trim(),
      stage: form.stage,
      color: form.color,
      stack: form.stack,
      roles: form.roles.map((r) => ({ role: r.role.trim(), text: r.text.trim(), skills: r.skills })),
      links: form.links.filter((l) => l.label.trim() && l.url.trim()),
    })
    toast.success(`"${startup.name}" is published`)
    router.push({ name: 'startup', params: { slug: startup.slug } })
  } catch (e) {
    toast.error(e.message)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div>
    <AppHeader variant="page">
      <div class="title-row">
        <RouterLink :to="{ name: 'dashboard' }" class="back" aria-label="Back"><UiIcon name="arrow-left" :size="26" /></RouterLink>
        <h1 class="title">New startup</h1>
      </div>
      <p class="subtitle muted">Tell the campus what you build. You can edit everything later.</p>
    </AppHeader>

    <main class="container main">
      <div class="layout">
        <form class="form" @submit.prevent="submit">
          <!-- Basics -->
          <section class="group">
            <h3 class="group__title">Basics</h3>

            <div class="name-row">
              <label class="field field--grow">
                <span class="field__label">Name</span>
                <input v-model="form.name" class="input" type="text" maxlength="40" placeholder="e.g. PeerDesk" />
                <span v-if="submitted && errors.name" class="field__error">{{ errors.name }}</span>
              </label>

              <div class="field">
                <span class="field__label">Logo color</span>
                <div class="colors">
                  <button
                    v-for="c in colors"
                    :key="c"
                    type="button"
                    :class="['color', { 'color--active': form.color === c }]"
                    :style="{ background: c }"
                    :aria-label="c"
                    @click="form.color = c"
                  >
                    <span v-if="form.color === c">{{ initials }}</span>
                  </button>
                </div>
              </div>
            </div>

            <label class="field">
              <span class="field__label">Pitch <span class="muted">(one sentence)</span></span>
              <input
                v-model="form.pitch"
                class="input"
                type="text"
                maxlength="120"
                placeholder="Find a free desk in any cluster in real time."
              />
              <span class="field__hint muted">{{ form.pitch.length }}/120</span>
              <span v-if="submitted && errors.pitch" class="field__error">{{ errors.pitch }}</span>
            </label>

            <div class="field">
              <span class="field__label">Stage</span>
              <div class="stages">
                <button
                  v-for="st in stages"
                  :key="st.id"
                  type="button"
                  :class="['stage-opt', { 'stage-opt--active': form.stage === st.id }]"
                  @click="form.stage = st.id"
                >
                  <span :class="['stage', `stage--${st.id.toLowerCase()}`]">{{ st.id }}</span>
                  <span class="stage-opt__text">{{ st.text }}</span>
                </button>
              </div>
            </div>
          </section>

          <!-- About -->
          <section class="group">
            <h3 class="group__title">About</h3>

            <label class="field">
              <span class="field__label">Description <span class="muted">(optional)</span></span>
              <textarea
                v-model="form.description"
                class="input input--area"
                rows="4"
                maxlength="600"
                placeholder="What is it, how does it work, who is it for?"
              />
            </label>

            <div class="two">
              <label class="field">
                <span class="field__label">Problem</span>
                <textarea v-model="form.problem" class="input input--area" rows="3" maxlength="300" placeholder="What is painful today?" />
              </label>
              <label class="field">
                <span class="field__label">Solution</span>
                <textarea v-model="form.solution" class="input input--area" rows="3" maxlength="300" placeholder="How do you fix it?" />
              </label>
            </div>

            <div class="field">
              <span class="field__label">Stack</span>
              <TagInput v-model="form.stack" placeholder="Vue, Rails, PostgreSQL…" :suggestions="stackSuggestions" />
            </div>
          </section>

          <!-- Team -->
          <section class="group">
            <div class="group__head">
              <h3 class="group__title">Open roles</h3>
              <span class="muted small">People with matching skills will see your startup on their main page.</span>
            </div>

            <div v-if="form.roles.length" class="roles">
              <div v-for="(r, i) in form.roles" :key="i" class="role">
                <div class="role__head">
                  <input v-model="r.role" class="input" type="text" maxlength="40" placeholder="Role, e.g. Frontend dev" />
                  <button type="button" class="icon-btn" aria-label="Remove role" @click="removeRole(i)">
                    <UiIcon name="close" :size="18" />
                  </button>
                </div>
                <input v-model="r.text" class="input" type="text" maxlength="120" placeholder="What will this person do?" />
                <TagInput v-model="r.skills" placeholder="Skills needed: Vue, Figma…" :suggestions="skillSuggestions" />
              </div>
            </div>
            <span v-if="submitted && errors.roles" class="field__error">{{ errors.roles }}</span>

            <button type="button" class="add" @click="addRole"><UiIcon name="plus" :size="16" /> Add role</button>
          </section>

          <!-- Links -->
          <section class="group">
            <h3 class="group__title">Links <span class="muted">(optional)</span></h3>

            <div v-if="form.links.length" class="links">
              <div v-for="(l, i) in form.links" :key="i" class="link-row">
                <input v-model="l.label" class="input input--label" type="text" maxlength="20" placeholder="GitLab" />
                <input v-model="l.url" class="input" type="url" placeholder="https://" />
                <button type="button" class="icon-btn" aria-label="Remove link" @click="removeLink(i)">
                  <UiIcon name="close" :size="18" />
                </button>
              </div>
            </div>

            <button type="button" class="add" @click="addLink"><UiIcon name="plus" :size="16" /> Add link</button>
          </section>

          <!-- Actions -->
          <div class="actions">
            <UiButton type="submit" :disabled="busy">Publish startup <UiIcon name="chevron-right" :size="14" /></UiButton>
            <RouterLink :to="{ name: 'dashboard' }"><UiButton variant="ghost">Cancel</UiButton></RouterLink>
            <span v-if="submitted && !isValid" class="field__error actions__error">Please fix the fields above.</span>
          </div>
        </form>

        <!-- Live preview -->
        <aside class="preview">
          <div class="preview__sticky">
            <div class="preview__head">
              <h3>Preview</h3>
              <span class="muted small">This is how your card will look on the main page.</span>
            </div>
            <div class="preview__card">
              <StartupCard :startup="preview" />
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<style scoped>
.title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 86px;
}
.back {
  color: var(--text);
  display: flex;
}
.title {
  font-size: 24px;
}
.subtitle {
  text-align: center;
  margin: 14px 0 40px;
  font-size: 15px;
}

.main {
  padding-block: 40px 80px;
}
.layout {
  display: grid;
  grid-template-columns: 1fr 384px;
  gap: 32px;
  align-items: start;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.group {
  padding: 28px 32px;
  border-radius: var(--radius);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.group__title {
  font-size: 16px;
}
.group__head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.small {
  font-size: 13px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.field--grow {
  flex: 1;
}
.field__label {
  font-weight: 600;
  font-size: 14px;
}
.field__hint {
  font-size: 12px;
  align-self: flex-end;
  margin-top: -4px;
}
.field__error {
  font-size: 13px;
  color: #ff9c9c;
}

.input {
  width: 100%;
  padding: 11px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--surface-3);
  background: var(--surface-2);
  color: var(--text);
  outline: none;
  transition: border-color 0.15s;
}
.input::placeholder {
  color: var(--text-dim);
}
.input:focus {
  border-color: var(--green);
}
.input--area {
  resize: vertical;
  line-height: 1.5;
}
.input--label {
  width: 140px;
  flex-shrink: 0;
}

.name-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}
.colors {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 200px;
}
.color {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 2px solid transparent;
  cursor: pointer;
  color: #1d2633;
  font-weight: 800;
  font-size: 11px;
  transition: transform 0.1s;
}
.color:hover {
  transform: scale(1.08);
}
.color--active {
  border-color: #fff;
}

.stages {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.stage-opt {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--surface-3);
  background: var(--surface-2);
  color: var(--text-muted);
  cursor: pointer;
  text-align: left;
}
.stage-opt:hover {
  color: var(--text);
}
.stage-opt--active {
  border-color: var(--green);
  color: var(--text);
}
.stage-opt__text {
  font-size: 13px;
}
.stage {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
.stage--idea {
  background: rgba(124, 70, 213, 0.25);
  color: #c9a7ff;
}
.stage--mvp {
  background: rgba(63, 149, 210, 0.25);
  color: #8fd0ff;
}
.stage--growth {
  background: rgba(68, 235, 153, 0.2);
  color: var(--green);
}

.two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.roles {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.role {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  border: 1px solid var(--surface-3);
}
.role .input,
.role :deep(.tags__box) {
  background: var(--surface);
}
.role__head {
  display: flex;
  gap: 8px;
  align-items: center;
}
.icon-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: grid;
  place-items: center;
}
.icon-btn:hover {
  background: var(--surface-3);
  color: var(--text);
}
.add {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px dashed var(--surface-3);
  background: transparent;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  padding: 10px 16px;
  cursor: pointer;
}
.add:hover {
  color: var(--text);
  border-color: var(--text-muted);
}

.links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.link-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 4px 0 0;
}
.actions__error {
  margin-left: 4px;
}

.preview__sticky {
  position: sticky;
  top: 24px;
}
.preview__head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}
.preview__head h3 {
  font-size: 16px;
}
.preview__card {
  pointer-events: none;
}

@media (max-width: 1000px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .preview__sticky {
    position: static;
  }
}
@media (max-width: 640px) {
  .two,
  .stages {
    grid-template-columns: 1fr;
  }
  .name-row {
    flex-direction: column;
  }
}
</style>
