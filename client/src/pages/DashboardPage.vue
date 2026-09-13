<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import ProgressBar from '../components/ProgressBar.vue'
import UiIcon from '../components/UiIcon.vue'
import UiButton from '../components/UiButton.vue'
import MeetupCard from '../components/MeetupCard.vue'
import StartupCard from '../components/StartupCard.vue'
import SkillsEditor from '../components/SkillsEditor.vue'
import { api } from '../api'
import { useUser } from '../composables/useUser'
import { useToast } from '../composables/useToast'
import { topics } from '../data/meetups'

const { user, load: loadUser } = useUser()
const toast = useToast()

const loading = ref(true)
const error = ref('')
const meetups = ref({ live: [], upcoming: [] })
const startups = ref([])
const recommended = ref([])
const search = ref('')
const filter = ref('All')
const editingSkills = ref(false)
const track = ref(null)

const filters = ['All', ...topics]

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const [m, s, r] = await Promise.all([api.meetups(), api.startups(), api.recommendedStartups(), loadUser()])
    meetups.value = m
    startups.value = s
    recommended.value = r.slice(0, 3)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
onMounted(loadAll)

// Refresh meetups every minute so "min ago" / "min left" stay correct
let timer
onMounted(() => (timer = setInterval(async () => (meetups.value = await api.meetups().catch(() => meetups.value)), 60_000)))
onUnmounted(() => clearInterval(timer))

const q = computed(() => search.value.trim().toLowerCase())
function matchesSearch(text) {
  return !q.value || text.toLowerCase().includes(q.value)
}

const liveMeetups = computed(() =>
  meetups.value.live.filter(
    (m) => (filter.value === 'All' || m.topic === filter.value) && matchesSearch(`${m.title} ${m.description} ${m.host.login} ${m.place}`),
  ),
)
const upcoming = computed(() =>
  meetups.value.upcoming.filter((m) => matchesSearch(`${m.title} ${m.host.login} ${m.place} ${m.topic}`)).slice(0, 5),
)
const visibleStartups = computed(() =>
  startups.value.filter((s) => matchesSearch(`${s.name} ${s.pitch} ${s.stack.join(' ')}`)),
)

function replaceMeetup(updated) {
  for (const key of ['live', 'upcoming']) {
    const i = meetups.value[key].findIndex((m) => m.id === updated.id)
    if (i !== -1) meetups.value[key][i] = updated
  }
}

async function onSkillsSaved() {
  recommended.value = (await api.recommendedStartups()).slice(0, 3)
}

function scrollCarousel(dir) {
  const el = track.value
  if (!el) return
  const card = el.querySelector('.slide')
  const step = card ? card.offsetWidth + 24 : 400
  el.scrollBy({ left: dir * step * 2, behavior: 'smooth' })
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div>
    <AppHeader variant="dashboard">
      <div class="hero container">
        <label class="search">
          <UiIcon name="search" :size="22" />
          <input v-model="search" type="search" placeholder="Search meetups, startups, people" class="search__input" />
        </label>

        <div v-if="user" class="profile">
          <div class="profile__level">
            <span class="profile__lvl">lvl {{ user.level }}: {{ user.levelProgress }}%</span>
            <ProgressBar :value="user.levelProgress" />
          </div>
          <div class="profile__avatar"><UiIcon name="user" :size="90" /></div>
          <div class="profile__info">
            <div class="profile__name">{{ user.login }}</div>
            <div class="profile__program">{{ user.program }} <span class="muted">{{ user.cohort }}</span></div>
          </div>
        </div>
      </div>
    </AppHeader>

    <main class="container main">
      <p v-if="error" class="error-box">
        Could not load data: {{ error }}. <a href="#" @click.prevent="loadAll">Try again</a>
      </p>

      <!-- ===== Meetups zone ===== -->
      <span class="eyebrow eyebrow--green"><UiIcon name="users" :size="14" /> Meetups</span>

      <section class="head">
        <div>
          <h2 class="head__title"><span class="live-dot" /> Happening right now</h2>
          <p class="head__sub muted">
            <template v-if="loading">Loading…</template>
            <template v-else>{{ meetups.live.length }} quick meetups on campus. Join one or start your own.</template>
          </p>
        </div>
        <RouterLink :to="{ name: 'meetup-new' }">
          <UiButton><UiIcon name="plus" :size="16" /> Create meetup</UiButton>
        </RouterLink>
      </section>

      <div class="chips">
        <button v-for="f in filters" :key="f" :class="['chip', { 'chip--active': f === filter }]" @click="filter = f">
          {{ f }}
        </button>
      </div>

      <section v-if="loading" class="grid">
        <div v-for="i in 3" :key="i" class="skeleton" />
      </section>
      <section v-else-if="liveMeetups.length" class="grid">
        <MeetupCard v-for="m in liveMeetups" :key="m.id" :meetup="m" @update="replaceMeetup" />
      </section>
      <div v-else class="empty">
        <h4>Nothing is happening right now</h4>
        <p class="muted">Be the first: start a quick meetup and people on campus will see it here.</p>
      </div>

      <section class="upcoming">
        <div class="upcoming__head">
          <h3>Starting soon today</h3>
          <RouterLink :to="{ name: 'meetups' }">All meetups</RouterLink>
        </div>

        <ul v-if="upcoming.length" class="list">
          <li v-for="u in upcoming" :key="u.id" class="row">
            <span class="row__time">{{ fmtTime(u.startsAt) }}</span>
            <div class="row__body">
              <div class="row__title">{{ u.title }}</div>
              <div class="row__meta muted">
                <span><UiIcon name="user" :size="14" /> {{ u.host.login }}</span>
                <span><UiIcon name="pin" :size="14" /> {{ u.place }}</span>
                <span><UiIcon name="users" :size="14" /> {{ u.members.length }}/{{ u.capacity }}</span>
              </div>
            </div>
            <span class="tag">{{ u.topic }}</span>
            <UiButton v-if="u.host.id === user?.id" variant="ghost" disabled>Your meetup</UiButton>
            <UiButton
              v-else
              variant="ghost"
              @click="(u.joined ? api.leaveMeetup(u.id) : api.joinMeetup(u.id)).then(replaceMeetup).catch((e) => toast.error(e.message))"
            >
              <UiIcon v-if="u.joined" name="check" :size="14" /> {{ u.joined ? "You're in" : "I'll come" }}
            </UiButton>
          </li>
        </ul>
        <p v-else-if="!loading" class="muted">No more meetups today.</p>
      </section>

      <section class="promo">
        <div>
          <h3 class="promo__title">Have something to share?</h3>
          <p class="promo__text">Start a 30-minute meetup. Pick a place on campus, add a topic, and people nearby will see it here.</p>
        </div>
        <RouterLink :to="{ name: 'meetup-new' }">
          <UiButton>Create meetup <UiIcon name="arrow-right" :size="18" /></UiButton>
        </RouterLink>
      </section>
    </main>

    <!-- ===== Startups zone ===== -->
    <section class="band">
      <div class="container band__inner">
        <div class="band__head">
          <div>
            <span class="eyebrow eyebrow--purple"><UiIcon name="rocket" :size="14" /> Startups</span>
            <h2 class="band__title">Build something with others</h2>
            <p class="band__text muted">
              Student startups from this campus. Join a team, share feedback, or become the first user.
            </p>
          </div>
          <RouterLink :to="{ name: 'startup-new' }">
            <UiButton variant="outline"><UiIcon name="plus" :size="16" /> Create startup</UiButton>
          </RouterLink>
        </div>

        <section class="startups">
          <div class="upcoming__head">
            <div>
              <h3>Startups on campus</h3>
              <p class="head__sub muted">Student projects that are looking for teammates, feedback, or first users.</p>
            </div>
            <div class="carousel__nav">
              <RouterLink :to="{ name: 'startups' }">All startups</RouterLink>
              <button class="arrow" aria-label="Previous" @click="scrollCarousel(-1)"><UiIcon name="chevron-left" /></button>
              <button class="arrow" aria-label="Next" @click="scrollCarousel(1)"><UiIcon name="chevron-right" /></button>
            </div>
          </div>

          <div v-if="loading" class="grid"><div v-for="i in 3" :key="i" class="skeleton" /></div>
          <div v-else-if="visibleStartups.length" ref="track" class="carousel">
            <div v-for="st in visibleStartups" :key="st.id" class="slide">
              <StartupCard :startup="st" />
            </div>
          </div>
          <p v-else class="muted">No startups match your search.</p>
        </section>

        <section class="startups">
          <div class="upcoming__head">
            <div>
              <h3>Matches your skills</h3>
              <p class="head__sub muted">Startups that need what you already know. Based on your profile skills.</p>
            </div>
            <div class="carousel__nav">
              <RouterLink :to="{ name: 'startups', query: { sort: 'match' } }">All matches</RouterLink>
              <a href="#" @click.prevent="editingSkills = true">Edit skills</a>
            </div>
          </div>

          <div v-if="user" class="my-skills">
            <span class="my-skills__label muted">Your skills:</span>
            <span v-for="sk in user.skills" :key="sk" class="tag tag--mine">{{ sk }}</span>
            <button v-if="!user.skills.length" class="add-skills" @click="editingSkills = true">+ Add skills</button>
          </div>

          <div v-if="recommended.length" class="grid grid--startups">
            <StartupCard v-for="st in recommended" :key="st.id" :startup="st" show-match />
          </div>
          <p v-else-if="!loading" class="muted">No matches yet. Add skills to your profile to see startups that need them.</p>
        </section>
      </div>
    </section>

    <div class="page-bottom" />

    <SkillsEditor v-if="editingSkills && user" :skills="user.skills" @close="editingSkills = false" @saved="onSkillsSaved" />
  </div>
</template>

<style scoped>
.hero {
  padding-top: 92px;
}
.search {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 660px;
  max-width: 100%;
  height: 46px;
  padding: 0 18px;
  margin: 0 auto;
  border-radius: 8px;
  background: var(--surface-3);
  color: var(--text-dim);
}
.search__input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
  font-size: 15px;
}
.search__input::placeholder {
  color: var(--text-dim);
}
.profile {
  display: flex;
  align-items: center;
  gap: 30px;
  justify-content: center;
  margin-top: 30px;
}
.profile__level {
  width: 176px;
  text-align: right;
  align-self: flex-start;
  margin-top: 8px;
}
.profile__lvl {
  display: block;
  color: var(--green);
  font-size: 13px;
  margin-bottom: 6px;
}
.profile__avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #e5e6e7;
  color: #6b7583;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.profile__info {
  width: 176px;
  align-self: flex-start;
  margin-top: 8px;
}
.profile__name {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}
.profile__program {
  font-size: 13px;
}

.main {
  padding-block: 44px 56px;
}
.page-bottom {
  height: 64px;
}
.error-box {
  padding: 14px 18px;
  border-radius: var(--radius-sm);
  background: rgba(255, 122, 144, 0.12);
  border: 1px solid rgba(255, 122, 144, 0.4);
  margin-bottom: 24px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.eyebrow--green {
  color: var(--green);
}
.eyebrow--purple {
  color: #c9a7ff;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
}
.head__title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  margin-bottom: 8px;
}
.head__sub {
  margin: 0;
  font-size: 15px;
}
.live-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--green);
  animation: pulse 1.8s infinite;
  flex-shrink: 0;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(68, 235, 153, 0.6); }
  70% { box-shadow: 0 0 0 10px rgba(68, 235, 153, 0); }
  100% { box-shadow: 0 0 0 0 rgba(68, 235, 153, 0); }
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 28px;
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

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}
.skeleton {
  height: 300px;
  border-radius: var(--radius);
  background: linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
.empty {
  padding: 32px;
  border-radius: var(--radius);
  border: 1px dashed var(--surface-3);
  text-align: center;
  margin-bottom: 48px;
}
.empty h4 {
  margin-bottom: 6px;
}
.empty p {
  margin: 0;
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.07);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.upcoming__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.upcoming__head h3 {
  font-size: 18px;
}
.list {
  list-style: none;
  margin: 0 0 48px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.row {
  display: grid;
  grid-template-columns: 64px 1fr auto auto;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  border-radius: var(--radius);
  background: var(--surface);
}
.row:hover {
  background: var(--surface-2);
}
.row__time {
  font-size: 16px;
  font-weight: 700;
  color: var(--green);
}
.row__title {
  font-weight: 600;
  margin-bottom: 4px;
}
.row__meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
}
.row__meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.promo {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  padding: 28px 32px;
  border-radius: var(--radius);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 45%),
    linear-gradient(120deg, #7f1fd0, #7a3dd8);
}
.promo__title {
  font-size: 20px;
  margin-bottom: 8px;
}
.promo__text {
  margin: 0;
  max-width: 560px;
  line-height: 1.5;
}

/* Startups band */
.band {
  position: relative;
  background: #161d27;
  border-top: 1px solid #232d3c;
  border-bottom: 1px solid #232d3c;
  margin-top: 24px;
  overflow: hidden;
}
.band::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #7c46d5, #b070ff 40%, transparent 80%);
}
.band::after {
  content: '';
  position: absolute;
  right: -160px;
  top: -160px;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 70, 213, 0.22), transparent 65%);
  pointer-events: none;
}
.band__inner {
  position: relative;
  padding-block: 56px 64px;
}
.band__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 40px;
}
.band__head > div {
  max-width: 640px;
}
.band__head button {
  white-space: nowrap;
}
.band__title {
  font-size: 28px;
  margin-bottom: 10px;
}
.band__text {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
}
.band a {
  color: #c9a7ff;
}
.band .arrow {
  background: rgba(124, 70, 213, 0.2);
  border-radius: 8px;
}
.band .arrow:hover {
  background: rgba(124, 70, 213, 0.35);
}
.arrow {
  border: 0;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
}

.startups {
  margin-bottom: 48px;
}
.startups:last-child {
  margin-bottom: 0;
}
.startups .upcoming__head {
  align-items: flex-start;
  margin-bottom: 20px;
}
.grid--startups {
  margin-bottom: 0;
}
.carousel__nav {
  display: flex;
  align-items: center;
  gap: 8px;
}
.carousel__nav a {
  margin-right: 12px;
}
.carousel {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding: 2px;
  margin: -2px;
}
.carousel::-webkit-scrollbar {
  display: none;
}
.slide {
  flex: 0 0 calc((100% - 48px) / 3);
  scroll-snap-align: start;
}
.my-skills {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
}
.my-skills__label {
  font-size: 13px;
  margin-right: 4px;
}
.tag--mine {
  background: rgba(68, 235, 153, 0.15);
  color: var(--green);
}
.add-skills {
  border: 1px dashed var(--surface-3);
  background: transparent;
  color: var(--text-muted);
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 12px;
  cursor: pointer;
}

@media (max-width: 1100px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .slide {
    flex-basis: calc((100% - 24px) / 2);
  }
}
@media (max-width: 760px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .slide {
    flex-basis: 100%;
  }
  .row {
    grid-template-columns: 56px 1fr;
  }
  .promo,
  .band__head,
  .head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
