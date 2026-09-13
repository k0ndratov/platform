<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import UiCard from '../components/UiCard.vue'
import UiButton from '../components/UiButton.vue'
import UiIcon from '../components/UiIcon.vue'
import ProgressBar from '../components/ProgressBar.vue'
import TagInput from '../components/TagInput.vue'
import { api } from '../api'
import { useToast } from '../composables/useToast'
import { useUser } from '../composables/useUser'
import { skillGroups } from '../data/skills'
import { BIO_MAX } from '../../../shared/rules.js'

const toast = useToast()
const { user, load: loadUser, set } = useUser()

// Drafts: what the user is editing. `user` keeps the saved version.
const bio = ref('')
const skills = ref([])
const recommended = ref([])
const busy = reactive({ bio: false, skills: false })

const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i])
const bioChanged = computed(() => Boolean(user.value) && bio.value.trim() !== user.value.bio)
const skillsChanged = computed(() => Boolean(user.value) && !sameList(skills.value, user.value.skills))

function resetDrafts(u) {
  bio.value = u.bio
  skills.value = [...u.skills]
}

async function loadRecommended() {
  recommended.value = (await api.recommendedStartups()).slice(0, 3)
}

onMounted(async () => {
  try {
    const [u] = await Promise.all([loadUser(), loadRecommended()])
    resetDrafts(u)
  } catch (e) {
    toast.error(e.message)
  }
})

const hasSkill = (s) => skills.value.some((x) => x.toLowerCase() === s.toLowerCase())
function toggleSkill(s) {
  skills.value = hasSkill(s) ? skills.value.filter((x) => x.toLowerCase() !== s.toLowerCase()) : [...skills.value, s]
}

async function save(field) {
  busy[field] = true
  try {
    const body = field === 'bio' ? { bio: bio.value.trim() } : { skills: skills.value }
    const u = await api.updateProfile(body)
    set(u)
    resetDrafts(u)
    if (field === 'skills') await loadRecommended()
    toast.success(field === 'bio' ? 'Bio saved' : 'Skills saved')
  } catch (e) {
    toast.error(e.message)
  } finally {
    busy[field] = false
  }
}
</script>

<template>
  <div>
    <AppHeader variant="page">
      <div class="title-row">
        <template v-if="user">
          <span class="big-avatar">{{ user.avatar }}</span>
          <div>
            <h1 class="title">{{ user.login }}</h1>
            <p class="subtitle muted">{{ user.program }} · {{ user.cohort }} · {{ user.campus }}</p>
          </div>
        </template>
        <h1 v-else class="title">Loading…</h1>
      </div>
    </AppHeader>

    <main v-if="user" class="container main">
      <div class="layout">
        <div class="col">
          <UiCard>
            <h3 class="section-title">About me</h3>
            <p class="text muted small hint">A few lines about you: what you build, what you want to learn, what you can help with.</p>
            <textarea v-model="bio" class="input input--area" rows="5" :maxlength="BIO_MAX" placeholder="Tell other students about yourself" />
            <div class="row">
              <span class="muted small">{{ bio.length }}/{{ BIO_MAX }}</span>
              <UiButton :disabled="busy.bio || !bioChanged" @click="save('bio')">Save bio</UiButton>
            </div>
          </UiCard>

          <UiCard>
            <h3 class="section-title">Skills <span class="muted count">{{ skills.length }}</span></h3>
            <p class="text muted small hint">
              Pick what you know or type your own. Startups that need these skills appear in "Matches your skills" on the dashboard.
            </p>
            <TagInput v-model="skills" placeholder="Type a skill and press Enter" />
            <div v-for="g in skillGroups" :key="g.title" class="group">
              <div class="group__title muted">{{ g.title }}</div>
              <div class="chips">
                <button
                  v-for="s in g.skills"
                  :key="s"
                  type="button"
                  :class="['chip', { 'chip--on': hasSkill(s) }]"
                  :aria-pressed="hasSkill(s)"
                  @click="toggleSkill(s)"
                >
                  <UiIcon v-if="hasSkill(s)" name="check" :size="12" />
                  {{ s }}
                </button>
              </div>
            </div>
            <div class="row row--end">
              <UiButton variant="ghost" :disabled="busy.skills || !skillsChanged" @click="resetDrafts(user)">Reset</UiButton>
              <UiButton :disabled="busy.skills || !skillsChanged" @click="save('skills')">Save skills</UiButton>
            </div>
          </UiCard>
        </div>

        <aside class="col">
          <UiCard>
            <h3 class="aside-title">Level {{ user.level }}</h3>
            <ProgressBar :value="user.levelProgress" :height="10" />
            <p class="muted small progress-note">{{ user.levelProgress }}% on the way to level {{ user.level + 1 }}</p>
            <hr class="divider" />
            <dl class="facts">
              <div><dt><UiIcon name="doc" :size="18" /> Program</dt><dd>{{ user.program }}</dd></div>
              <div><dt><UiIcon name="users" :size="18" /> Cohort</dt><dd>{{ user.cohort }}</dd></div>
              <div><dt><UiIcon name="pin" :size="18" /> Campus</dt><dd>{{ user.campus }}</dd></div>
            </dl>
          </UiCard>

          <UiCard>
            <h3 class="aside-title">Startups for your skills</h3>
            <ul v-if="recommended.length" class="matches">
              <li v-for="s in recommended" :key="s.id">
                <RouterLink :to="{ name: 'startup', params: { slug: s.slug } }" class="match">
                  <span class="match__logo" :style="{ background: s.color }">{{ s.logo }}</span>
                  <span class="match__body">
                    <span class="match__name">{{ s.name }}</span>
                    <span class="muted small">{{ s.match.matched.length }} of {{ s.match.needed.length }} skills match</span>
                  </span>
                </RouterLink>
              </li>
            </ul>
            <p v-else class="muted small text">No matches yet. Pick a few skills and save.</p>
            <RouterLink :to="{ name: 'startups', query: { sort: 'match' } }" class="all-link">All matches <UiIcon name="chevrons" :size="14" /></RouterLink>
          </UiCard>
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
  gap: 18px;
  margin-top: 78px;
}
.big-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--gradient-brand);
  color: #1d2633;
  font-weight: 800;
  font-size: 26px;
  display: grid;
  place-items: center;
}
.title {
  font-size: 24px;
}
.subtitle {
  margin: 4px 0 0;
  font-size: 14px;
}

.main {
  padding-block: 32px 80px;
}
.layout {
  display: grid;
  grid-template-columns: 1fr 384px;
  gap: 32px;
  align-items: start;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.section-title {
  font-size: 16px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.count {
  font-weight: 500;
  font-size: 14px;
}
.text {
  margin: 0;
  line-height: 1.55;
}
.small {
  font-size: 13px;
}
.hint {
  margin-bottom: 14px;
}
.input {
  width: 100%;
  padding: 11px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--surface-3);
  background: var(--surface-2);
  color: var(--text);
  outline: none;
}
.input:focus {
  border-color: var(--green);
}
.input--area {
  resize: vertical;
  line-height: 1.5;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
}
.row--end {
  justify-content: flex-end;
  margin-top: 18px;
}

/* Skill groups */
.group {
  margin-top: 16px;
}
.group__title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 8px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1px solid var(--surface-3);
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.chip:hover {
  border-color: var(--green);
  color: var(--text);
}
.chip--on {
  background: rgba(68, 235, 153, 0.15);
  border-color: var(--green);
  color: var(--green);
}

/* Aside */
.aside-title {
  font-size: 17px;
  margin-bottom: 12px;
}
.progress-note {
  margin: 8px 0 0;
}
.divider {
  border: 0;
  border-top: 1px solid var(--surface-3);
  margin: 22px 0;
}
.facts {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.facts > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.facts dt {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}
.facts dd {
  margin: 0;
  color: var(--text-muted);
  text-align: right;
}
.matches {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.match {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  color: var(--text);
  text-decoration: none;
}
.match:hover {
  background: var(--surface-3);
}
.match__logo {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  color: #1d2633;
  font-weight: 800;
  font-size: 12px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.match__body {
  display: flex;
  flex-direction: column;
}
.match__name {
  font-weight: 600;
}
.all-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 14px;
  font-size: 14px;
  color: var(--link);
  text-decoration: none;
}

@media (max-width: 1000px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
