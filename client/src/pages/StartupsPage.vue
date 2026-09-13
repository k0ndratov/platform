<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import StartupCard from '../components/StartupCard.vue'
import UiButton from '../components/UiButton.vue'
import UiIcon from '../components/UiIcon.vue'
import { api } from '../api'
import { useUser } from '../composables/useUser'

const route = useRoute()
const { user, load: loadUser } = useUser()
const list = ref([])
const loading = ref(true)
const error = ref('')
const stage = ref('All')
const q = ref('')
const sort = ref(route.query.sort === 'match' ? 'match' : 'new')
const onlyOpen = ref(false)

onMounted(async () => {
  try {
    ;[list.value] = await Promise.all([api.startups(), loadUser()])
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
watch(() => route.query.sort, (v) => (sort.value = v === 'match' ? 'match' : 'new'))

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase()
  let items = list.value.filter(
    (s) =>
      (stage.value === 'All' || s.stage === stage.value) &&
      (!onlyOpen.value || s.lookingFor.length > 0) &&
      (!query || `${s.name} ${s.pitch} ${s.stack.join(' ')} ${s.lookingFor.map((r) => r.role).join(' ')}`.toLowerCase().includes(query)),
  )
  if (sort.value === 'match') items = [...items].sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0))
  return items
})
</script>

<template>
  <div>
    <AppHeader variant="page">
      <div class="title-row">
        <h1 class="title">Startups</h1>
      </div>
      <p class="subtitle muted">{{ list.length }} student startups on campus</p>
    </AppHeader>

    <main class="container main">
      <div class="toolbar">
        <div class="chips">
          <button v-for="f in ['All', 'Idea', 'MVP', 'Growth']" :key="f" :class="['chip', { 'chip--active': f === stage }]" @click="stage = f">{{ f }}</button>
          <button :class="['chip', { 'chip--active': onlyOpen }]" @click="onlyOpen = !onlyOpen">Looking for people</button>
        </div>
        <div class="sort">
          <button :class="['sort__opt', { 'sort__opt--active': sort === 'new' }]" @click="sort = 'new'">Newest</button>
          <button :class="['sort__opt', { 'sort__opt--active': sort === 'match' }]" @click="sort = 'match'">Best match</button>
        </div>
        <label class="search">
          <UiIcon name="search" :size="18" />
          <input v-model="q" type="search" placeholder="Search" class="search__input" />
        </label>
        <RouterLink :to="{ name: 'startup-new' }"><UiButton variant="outline"><UiIcon name="plus" :size="16" /> Create startup</UiButton></RouterLink>
      </div>

      <p v-if="error" class="muted">{{ error }}</p>
      <p v-else-if="loading" class="muted">Loading…</p>
      <div v-else-if="filtered.length" class="grid">
        <StartupCard v-for="s in filtered" :key="s.id" :startup="s" :show-match="sort === 'match'" />
      </div>
      <div v-else class="empty">
        <h4>No startups found</h4>
        <p class="muted">Try another filter, or publish your own startup.</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.title-row {
  display: flex;
  justify-content: center;
  margin-top: 86px;
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
  padding-block: 32px 80px;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
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
.chip--active {
  background: #c9a7ff;
  border-color: #c9a7ff;
  color: #1d2633;
  font-weight: 600;
}
.sort {
  display: flex;
  border: 1px solid var(--surface-3);
  border-radius: 8px;
  overflow: hidden;
}
.sort__opt {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  padding: 8px 14px;
  cursor: pointer;
  font-size: 13px;
}
.sort__opt--active {
  background: var(--surface-3);
  color: var(--text);
}
.search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 14px;
  border-radius: 8px;
  background: var(--surface-3);
  color: var(--text-dim);
  width: 220px;
}
.search__input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
  min-width: 0;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.empty {
  padding: 40px;
  border-radius: var(--radius);
  border: 1px dashed var(--surface-3);
  text-align: center;
}
.empty h4 {
  margin-bottom: 6px;
}
.empty p {
  margin: 0;
}
@media (max-width: 1100px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 760px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
