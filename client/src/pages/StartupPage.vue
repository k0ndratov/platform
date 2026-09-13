<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import UiCard from '../components/UiCard.vue'
import UiButton from '../components/UiButton.vue'
import UiIcon from '../components/UiIcon.vue'
import UiModal from '../components/UiModal.vue'
import { api } from '../api'
import { useToast } from '../composables/useToast'
import { useUser } from '../composables/useUser'

const route = useRoute()
const toast = useToast()
const { user, load: loadUser } = useUser()

const startup = ref(null)
const loading = ref(true)
const notFound = ref(false)

async function load() {
  loading.value = true
  notFound.value = false
  try {
    ;[startup.value] = await Promise.all([api.startup(route.params.slug), loadUser()])
  } catch (e) {
    notFound.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(() => route.params.slug, load)

const isMember = computed(() => Boolean(startup.value?.isMember))
const founderLogin = computed(() => startup.value?.founders[0] ?? '')

// ---- Apply / message modal ----
const apply = reactive({ open: false, role: null, message: '', busy: false })
function openApply(role = null) {
  apply.role = role
  apply.message = ''
  apply.open = true
}
function hasApplied(role) {
  return startup.value?.appliedRoleIds.includes(role.id)
}
async function sendApply() {
  apply.busy = true
  try {
    startup.value = await api.applyToStartup(startup.value.slug, { roleId: apply.role?.id, message: apply.message })
    toast.success(apply.role ? `You applied for "${apply.role.role}"` : `Message sent to ${founderLogin.value}`)
    apply.open = false
  } catch (e) {
    toast.error(e.message)
  } finally {
    apply.busy = false
  }
}

// ---- Blog ----
async function toggleLike(post) {
  try {
    const r = await api.likePost(startup.value.slug, post.id)
    post.liked = r.liked
    post.likes = r.likes
  } catch (e) {
    toast.error(e.message)
  }
}
const newPost = reactive({ open: false, title: '', text: '', busy: false })
async function publishPost() {
  newPost.busy = true
  try {
    startup.value = await api.createPost(startup.value.slug, { title: newPost.title.trim(), text: newPost.text.trim() })
    toast.success('Post published')
    newPost.open = false
    newPost.title = ''
    newPost.text = ''
  } catch (e) {
    toast.error(e.message)
  } finally {
    newPost.busy = false
  }
}

function scrollToRoles() {
  document.getElementById('open-roles')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div>
    <AppHeader variant="page">
      <div class="title-row">
        <RouterLink :to="{ name: 'dashboard' }" class="back" aria-label="Back"><UiIcon name="arrow-left" :size="26" /></RouterLink>
        <template v-if="startup">
          <span class="logo" :style="{ background: startup.color }">{{ startup.logo }}</span>
          <h1 class="title">{{ startup.name }}</h1>
          <span :class="['stage', `stage--${startup.stage.toLowerCase()}`]">{{ startup.stage }}</span>
        </template>
        <h1 v-else class="title">{{ loading ? 'Loading…' : 'Startup not found' }}</h1>
      </div>
      <p v-if="startup" class="pitch muted">{{ startup.pitch }}</p>
    </AppHeader>

    <main v-if="startup" class="container main">
      <div class="layout">
        <!-- Main column -->
        <div class="col">
          <UiCard>
            <h3 class="section-title">About</h3>
            <p v-if="startup.description" class="text">{{ startup.description }}</p>
            <p v-else class="text muted">No description yet.</p>

            <div v-if="startup.problem || startup.solution" class="two">
              <UiCard v-if="startup.problem" inner>
                <h4>Problem</h4>
                <p class="text">{{ startup.problem }}</p>
              </UiCard>
              <UiCard v-if="startup.solution" inner>
                <h4>Solution</h4>
                <p class="text">{{ startup.solution }}</p>
              </UiCard>
            </div>
          </UiCard>

          <UiCard>
            <h3 class="section-title">Team <span class="muted count">{{ startup.team.length }}</span></h3>
            <ul class="team">
              <li v-for="m in startup.team" :key="m.login" class="member">
                <span class="member__avatar">{{ m.avatar }}</span>
                <div>
                  <div class="member__name">{{ m.login }}</div>
                  <div class="member__role muted">{{ m.role }}</div>
                </div>
              </li>
            </ul>
          </UiCard>

          <UiCard v-if="startup.lookingFor.length" id="open-roles">
            <h3 class="section-title">Open roles <span class="muted count">{{ startup.lookingFor.length }}</span></h3>
            <ul class="roles">
              <li v-for="r in startup.lookingFor" :key="r.id" class="role">
                <div class="role__body">
                  <div class="role__name">{{ r.role }}</div>
                  <div class="role__text muted">{{ r.text }}</div>
                  <div v-if="r.skills.length" class="role__skills">
                    <span
                      v-for="sk in r.skills"
                      :key="sk"
                      :class="['tag', { 'tag--match': user && user.skills.some((x) => x.toLowerCase() === sk.toLowerCase()) }]"
                    >
                      {{ sk }}
                    </span>
                  </div>
                </div>
                <UiButton v-if="isMember" variant="ghost" disabled>Your team</UiButton>
                <UiButton v-else-if="hasApplied(r)" variant="ghost" disabled><UiIcon name="check" :size="14" /> Applied</UiButton>
                <UiButton v-else @click="openApply(r)">Apply</UiButton>
              </li>
            </ul>
          </UiCard>

          <UiCard>
            <h3 class="section-title">Roadmap</h3>
            <ol v-if="startup.roadmap.length" class="roadmap">
              <li v-for="(step, i) in startup.roadmap" :key="i" :class="['step', `step--${step.status}`]">
                <span class="step__marker">
                  <UiIcon v-if="step.status === 'done'" name="check" :size="22" />
                  <UiIcon v-else name="circle" :size="22" />
                </span>
                <div class="step__body">
                  <div class="step__head">
                    <span class="step__title">{{ step.title }}</span>
                    <span class="step__date muted">{{ step.date }}</span>
                  </div>
                  <div class="step__text muted">{{ step.text }}</div>
                  <span v-if="step.status === 'in-progress'" class="step__badge">In progress</span>
                </div>
              </li>
            </ol>
            <p v-else class="muted text">The team has not published a roadmap yet.</p>
          </UiCard>

          <UiCard>
            <div class="section-row">
              <h3 class="section-title">Blog <span class="muted count">{{ startup.blog.length }}</span></h3>
              <UiButton v-if="isMember" variant="ghost" @click="newPost.open = true"><UiIcon name="plus" :size="14" /> Write a post</UiButton>
              <span v-else class="muted small">Posts from the team</span>
            </div>
            <div v-if="startup.blog.length" class="posts">
              <article v-for="post in startup.blog" :key="post.id" class="post">
                <header class="post__head">
                  <span class="member__avatar">{{ post.avatar }}</span>
                  <div>
                    <div class="member__name">{{ post.author }}</div>
                    <div class="member__role muted">{{ post.role }} · {{ post.date }}</div>
                  </div>
                </header>
                <h4 class="post__title">{{ post.title }}</h4>
                <p class="text post__text">{{ post.text }}</p>
                <footer class="post__foot">
                  <button :class="['post__action', { 'post__action--on': post.liked }]" @click="toggleLike(post)">
                    <UiIcon name="heart" :size="16" /> {{ post.likes }}
                  </button>
                  <span class="post__action post__action--static"><UiIcon name="comment" :size="16" /> {{ post.comments }}</span>
                </footer>
              </article>
            </div>
            <p v-else class="muted text">
              No posts yet.
              <template v-if="isMember">Write the first one about your progress.</template>
              <template v-else>Team members can write about their progress here.</template>
            </p>
          </UiCard>

          <UiCard>
            <h3 class="section-title">Updates</h3>
            <ol v-if="startup.updates.length" class="updates">
              <li v-for="(u, i) in startup.updates" :key="i" class="update">
                <span class="update__date">{{ u.date }}</span>
                <span class="update__text">{{ u.text }}</span>
              </li>
            </ol>
            <p v-else class="muted text">No updates yet.</p>
          </UiCard>
        </div>

        <!-- Aside -->
        <aside class="col">
          <UiCard v-if="isMember">
            <h3 class="aside-title">Your team</h3>
            <p class="text muted small">You are a member of this startup. Write posts in the blog to share your progress.</p>
            <div class="actions">
              <UiButton variant="outline" @click="newPost.open = true"><UiIcon name="plus" :size="14" /> Write a post</UiButton>
            </div>
          </UiCard>
          <UiCard v-else>
            <h3 class="aside-title">{{ startup.lookingFor.length ? 'Join the team' : 'Get in touch' }}</h3>
            <p class="text muted small">
              {{
                startup.lookingFor.length
                  ? 'The team is looking for new people. Pick a role or just write to the founder.'
                  : 'The team is full right now, but you can still write to the founder.'
              }}
            </p>
            <div class="actions">
              <UiButton v-if="startup.lookingFor.length" @click="scrollToRoles">Join team <UiIcon name="chevron-right" :size="14" /></UiButton>
              <UiButton variant="outline" @click="openApply(null)">Message founder</UiButton>
            </div>
          </UiCard>

          <UiCard>
            <dl class="facts">
              <div><dt><UiIcon name="flag" /> Stage</dt><dd>{{ startup.stage }}</dd></div>
              <div><dt><UiIcon name="clock" /> Started</dt><dd>{{ startup.started }}</dd></div>
              <div><dt><UiIcon name="users" /> Team</dt><dd>{{ startup.team.length }} people</dd></div>
              <div><dt><UiIcon name="user" /> Founders</dt><dd>{{ startup.founders.join(', ') }}</dd></div>
            </dl>

            <template v-if="startup.stack.length">
              <hr class="divider" />
              <h4 class="aside-sub">Stack</h4>
              <div class="stack">
                <span v-for="t in startup.stack" :key="t" class="tag">{{ t }}</span>
              </div>
            </template>

            <template v-if="startup.links.length">
              <hr class="divider" />
              <h4 class="aside-sub">Links</h4>
              <ul class="links">
                <li v-for="l in startup.links" :key="l.label">
                  <a :href="l.url" target="_blank" rel="noopener">{{ l.label }} <UiIcon name="arrow-right" :size="14" /></a>
                </li>
              </ul>
            </template>
          </UiCard>
        </aside>
      </div>
    </main>

    <main v-else-if="notFound" class="container main">
      <p class="muted">We could not find this startup. <RouterLink :to="{ name: 'dashboard' }">Back to main page</RouterLink></p>
    </main>

    <!-- Apply / message modal -->
    <UiModal v-if="apply.open" :title="apply.role ? `Apply for ${apply.role.role}` : `Message ${founderLogin}`" @close="apply.open = false">
      <p class="muted small modal-hint">
        <template v-if="apply.role">Tell the team why you are a good fit. Your profile skills are sent with the application.</template>
        <template v-else>Ask a question or say how you can help.</template>
      </p>
      <textarea v-model="apply.message" class="input input--area" rows="4" maxlength="1000" placeholder="A few words about you…" />
      <template #footer>
        <UiButton :disabled="apply.busy" @click="sendApply">{{ apply.role ? 'Send application' : 'Send message' }}</UiButton>
        <UiButton variant="ghost" @click="apply.open = false">Cancel</UiButton>
      </template>
    </UiModal>

    <!-- New post modal -->
    <UiModal v-if="newPost.open" title="New blog post" @close="newPost.open = false">
      <div class="form">
        <input v-model="newPost.title" class="input" type="text" maxlength="120" placeholder="Title" />
        <textarea v-model="newPost.text" class="input input--area" rows="6" maxlength="3000" placeholder="What happened? What did you learn?" />
      </div>
      <template #footer>
        <UiButton :disabled="newPost.busy || newPost.title.trim().length < 3 || newPost.text.trim().length < 10" @click="publishPost">Publish</UiButton>
        <UiButton variant="ghost" @click="newPost.open = false">Cancel</UiButton>
      </template>
    </UiModal>
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
.logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  color: #1d2633;
  font-weight: 800;
  font-size: 14px;
  display: grid;
  place-items: center;
}
.title {
  font-size: 24px;
}
.stage {
  padding: 3px 10px;
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
.pitch {
  text-align: center;
  max-width: 640px;
  margin: 14px auto 40px;
  font-size: 15px;
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
  margin-bottom: 18px;
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
.two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 20px;
}
.two h4 {
  font-size: 14px;
  margin-bottom: 10px;
}

.team {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}
.member {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}
.member__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--surface-3);
  display: grid;
  place-items: center;
  font-weight: 700;
  flex-shrink: 0;
}
.member__name {
  font-weight: 600;
}
.member__role {
  font-size: 13px;
}

.roles {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.role {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}
.role__name {
  font-weight: 600;
  margin-bottom: 4px;
}
.role__body {
  min-width: 0;
}
.role__text {
  font-size: 13px;
}
.role__skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.tag--match {
  background: rgba(68, 235, 153, 0.15);
  color: var(--green);
}
.role > button {
  flex-shrink: 0;
}

.updates {
  list-style: none;
  margin: 0;
  padding: 0;
}
.update {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 0 0 18px 20px;
}
.update::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
}
.update:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 18px;
  bottom: 0;
  border-left: 2px dotted var(--surface-3);
}
.update__date {
  width: 56px;
  flex-shrink: 0;
  color: var(--text-muted);
  font-size: 13px;
}
.update__text {
  line-height: 1.45;
}

.section-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

/* Roadmap */
.roadmap {
  list-style: none;
  margin: 0;
  padding: 0;
}
.step {
  position: relative;
  display: flex;
  gap: 12px;
  padding-bottom: 20px;
}
.step:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 26px;
  bottom: 0;
  border-left: 2px dotted var(--surface-3);
}
.step__marker {
  flex-shrink: 0;
  color: var(--text-dim);
  display: flex;
}
.step--done .step__marker {
  color: var(--green-dark);
}
.step--in-progress .step__marker {
  color: var(--sky);
}
.step__body {
  flex: 1;
  min-width: 0;
}
.step__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}
.step__title {
  font-weight: 700;
  color: var(--text-muted);
}
.step--done .step__title,
.step--in-progress .step__title {
  color: var(--text);
}
.step__date {
  font-size: 13px;
  white-space: nowrap;
}
.step__text {
  font-size: 13px;
  line-height: 1.45;
}
.step__badge {
  display: inline-block;
  margin-top: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(54, 197, 240, 0.18);
  color: #8fd0ff;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Blog */
.posts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.post {
  padding: 18px 20px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}
.post__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.post__title {
  font-size: 16px;
  margin-bottom: 8px;
}
.post__text {
  color: var(--text-muted);
}
.post__foot {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 14px;
}
.post__action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  font-size: 13px;
}
.post__action:hover {
  color: var(--green);
}
.post__action--on {
  color: #ff7a90;
}
.post__action--on:hover {
  color: #ff7a90;
}
.post__action--static {
  cursor: default;
}
.post__action--static:hover {
  color: var(--text-muted);
}

.modal-hint {
  margin: 0 0 12px;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
.post__more {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.aside-title {
  font-size: 17px;
  margin-bottom: 10px;
}
.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
}
.facts {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 22px;
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
.divider {
  border: 0;
  border-top: 1px solid var(--surface-3);
  margin: 22px 0;
}
.aside-sub {
  font-size: 14px;
  margin-bottom: 12px;
}
.stack {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.07);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
}
.links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.links a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 1000px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .two {
    grid-template-columns: 1fr;
  }
}
</style>
