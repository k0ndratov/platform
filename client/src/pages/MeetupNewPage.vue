<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import UiButton from '../components/UiButton.vue'
import UiIcon from '../components/UiIcon.vue'
import { topics, places, durations } from '../data/meetups'
import { api } from '../api'
import { useToast } from '../composables/useToast'

const router = useRouter()
const toast = useToast()
const busy = ref(false)

const form = reactive({
  title: '',
  topic: 'Ideas',
  description: '',
  place: places[0],
  startNow: true,
  time: '',
  duration: 30,
  capacity: 8,
})

const submitted = ref(false)

const isValid = computed(() => form.title.trim().length >= 3 && (form.startNow || form.time))

function startsAtIso() {
  if (form.startNow) return null
  const [h, m] = form.time.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

async function submit() {
  submitted.value = true
  if (!isValid.value) return
  busy.value = true
  try {
    const meetup = await api.createMeetup({
      title: form.title.trim(),
      topic: form.topic,
      description: form.description.trim(),
      place: form.place,
      startsAt: startsAtIso(),
      duration: form.duration,
      capacity: form.capacity,
    })
    toast.success(form.startNow ? `"${meetup.title}" is live` : `"${meetup.title}" is scheduled`)
    router.push({ name: 'dashboard' })
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
        <h1 class="title">New meetup</h1>
      </div>
      <p class="subtitle muted">A quick meet for people who want to share ideas or just find new friends.</p>
    </AppHeader>

    <main class="container main">
      <form class="form" @submit.prevent="submit">
        <!-- Title -->
        <label class="field">
          <span class="field__label">What is it about?</span>
          <input
            v-model="form.title"
            class="input"
            type="text"
            maxlength="80"
            placeholder="e.g. Pet project ideas: what to build next?"
          />
          <span v-if="submitted && form.title.trim().length < 3" class="field__error">Please add a title (at least 3 letters).</span>
        </label>

        <!-- Topic -->
        <div class="field">
          <span class="field__label">Topic</span>
          <div class="chips">
            <button
              v-for="t in topics"
              :key="t"
              type="button"
              :class="['chip', { 'chip--active': form.topic === t }]"
              @click="form.topic = t"
            >
              {{ t }}
            </button>
          </div>
        </div>

        <!-- Description -->
        <label class="field">
          <span class="field__label">A few words <span class="muted">(optional)</span></span>
          <textarea
            v-model="form.description"
            class="input input--area"
            rows="3"
            maxlength="200"
            placeholder="No slides, just talk. Bring an idea and get feedback."
          />
          <span class="field__hint muted">{{ form.description.length }}/200</span>
        </label>

        <!-- Place -->
        <label class="field">
          <span class="field__label">Where</span>
          <span class="select">
            <UiIcon name="pin" :size="18" class="select__icon" />
            <select v-model="form.place" class="input input--select">
              <option v-for="p in places" :key="p" :value="p">{{ p }}</option>
            </select>
          </span>
        </label>

        <!-- When -->
        <div class="field">
          <span class="field__label">When</span>
          <div class="row">
            <div class="chips">
              <button type="button" :class="['chip', { 'chip--active': form.startNow }]" @click="form.startNow = true">
                Right now
              </button>
              <button type="button" :class="['chip', { 'chip--active': !form.startNow }]" @click="form.startNow = false">
                Later today
              </button>
            </div>
            <input v-if="!form.startNow" v-model="form.time" class="input input--time" type="time" />
          </div>
          <span v-if="submitted && !form.startNow && !form.time" class="field__error">Please pick a time.</span>
        </div>

        <!-- Duration + capacity -->
        <div class="two">
          <div class="field">
            <span class="field__label">Duration</span>
            <div class="chips">
              <button
                v-for="d in durations"
                :key="d"
                type="button"
                :class="['chip', { 'chip--active': form.duration === d }]"
                @click="form.duration = d"
              >
                {{ d }} min
              </button>
            </div>
          </div>

          <label class="field">
            <span class="field__label">Max people</span>
            <div class="stepper">
              <button type="button" class="stepper__btn" :disabled="form.capacity <= 2" @click="form.capacity--">−</button>
              <input v-model.number="form.capacity" class="stepper__value" type="number" min="2" max="30" />
              <button type="button" class="stepper__btn" :disabled="form.capacity >= 30" @click="form.capacity++">+</button>
            </div>
          </label>
        </div>

        <!-- Actions -->
        <div class="actions">
          <UiButton type="submit" :disabled="busy">
            {{ form.startNow ? 'Start meetup' : 'Schedule meetup' }} <UiIcon name="chevron-right" :size="14" />
          </UiButton>
          <RouterLink :to="{ name: 'dashboard' }"><UiButton variant="ghost">Cancel</UiButton></RouterLink>
        </div>
      </form>
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
.form {
  max-width: 640px;
  margin: 0 auto;
  padding: 32px;
  border-radius: var(--radius);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.field__label {
  font-weight: 600;
  font-size: 15px;
}
.field__hint {
  font-size: 12px;
  align-self: flex-end;
}
.field__error {
  font-size: 13px;
  color: #ff9c9c;
}

.input {
  width: 100%;
  padding: 12px 14px;
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
  min-height: 84px;
  line-height: 1.5;
}
.select {
  position: relative;
  display: block;
}
.select__icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}
.input--select {
  padding-left: 40px;
  appearance: none;
  cursor: pointer;
}
.input--time {
  width: 130px;
  color-scheme: dark;
}

.row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.two {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: start;
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  border: 1px solid var(--surface-3);
  background: transparent;
  color: var(--text-muted);
  border-radius: 999px;
  padding: 7px 16px;
  cursor: pointer;
  font-size: 14px;
}
.chip:hover {
  color: var(--text);
}
.chip--active {
  background: var(--green);
  border-color: var(--green);
  color: #1d2633;
  font-weight: 600;
}

.stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  overflow: hidden;
}
.stepper__btn {
  width: 40px;
  height: 40px;
  border: 0;
  background: transparent;
  color: var(--text);
  font-size: 18px;
  cursor: pointer;
}
.stepper__btn:hover:not(:disabled) {
  background: var(--surface-3);
}
.stepper__btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.stepper__value {
  width: 48px;
  text-align: center;
  border: 0;
  background: transparent;
  color: var(--text);
  font-weight: 700;
  outline: none;
  -moz-appearance: textfield;
}
.stepper__value::-webkit-inner-spin-button,
.stepper__value::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.actions {
  display: flex;
  gap: 12px;
  padding-top: 6px;
  border-top: 1px solid var(--surface-3);
  margin-top: 4px;
  padding-top: 24px;
}

@media (max-width: 640px) {
  .two {
    grid-template-columns: 1fr;
  }
}
</style>
