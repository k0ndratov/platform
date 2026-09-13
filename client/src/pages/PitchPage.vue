<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Logo21 from '../components/Logo21.vue'
import UiIcon from '../components/UiIcon.vue'
import { slides } from '../data/pitch'

const router = useRouter()

// ---- Slides ----
const index = ref(0)
const slide = computed(() => slides[index.value])
const isFirst = computed(() => index.value === 0)
const isLast = computed(() => index.value === slides.length - 1)
// The "open in app" link opens the real page in a new tab, so the pitch stays where it is.
const linkHref = computed(() => {
  const link = slide.value.link
  if (!link) return ''
  return link.href || router.resolve(link.to).href
})

function next() {
  if (!isLast.value) index.value++
}
function prev() {
  if (!isFirst.value) index.value--
}
function go(i) {
  index.value = i
}

// ---- Keyboard ----
function onKey(e) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  switch (e.key) {
    case 'ArrowRight':
    case ' ':
    case 'PageDown':
      e.preventDefault()
      next()
      break
    case 'ArrowLeft':
    case 'PageUp':
      e.preventDefault()
      prev()
      break
    case 'Home':
      go(0)
      break
    case 'End':
      go(slides.length - 1)
      break
    case 'Escape':
      router.push({ name: 'dashboard' })
      break
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="pitch">
    <div class="progress" :style="{ width: `${((index + 1) / slides.length) * 100}%` }" />

    <header class="top">
      <button class="brand" title="На главную (Esc)" @click="router.push({ name: 'dashboard' })">
        <Logo21 :size="44" />
        <span>Школа 21 · питч</span>
      </button>
      <span class="counter">{{ index + 1 }} / {{ slides.length }}</span>
    </header>

    <main class="stage">
      <Transition name="slide" mode="out-in">
        <section :key="index" :class="['slide', { 'slide--with-image': slide.image || slide.qr }]">
          <div class="slide__text">
            <p class="kicker">{{ slide.kicker }}</p>
            <h1 class="title">{{ slide.title }}</h1>
            <p v-if="slide.subtitle" class="subtitle">{{ slide.subtitle }}</p>
            <div v-if="slide.stats" class="stats">
              <div v-for="s in slide.stats" :key="s.label" class="stat">
                <div class="stat__value">{{ s.value }}</div>
                <div class="stat__label">{{ s.label }}</div>
              </div>
            </div>
            <ul v-if="slide.points" class="points">
              <li v-for="p in slide.points" :key="p"><UiIcon name="check" :size="18" /> <span>{{ p }}</span></li>
            </ul>
            <a v-if="slide.link" :href="linkHref" target="_blank" rel="noopener" class="open-link">
              {{ slide.link.label }} <UiIcon name="chevrons" :size="14" />
            </a>
          </div>

          <a v-if="slide.image" :href="linkHref" target="_blank" rel="noopener" class="shot" :title="slide.link?.label">
            <span class="shot__bar"><i /><i /><i /></span>
            <img :src="slide.image" :alt="slide.imageAlt" />
          </a>

          <a v-if="slide.qr" :href="slide.qr.url" target="_blank" rel="noopener" class="qr">
            <img :src="slide.qr.src" alt="QR-код со ссылкой на демо" />
            <span class="qr__url">{{ slide.qr.url.replace(/^https?:\/\//, '') }}</span>
          </a>
        </section>
      </Transition>
    </main>

    <footer class="bottom">
      <button class="nav-btn" :disabled="isFirst" aria-label="Назад" @click="prev"><UiIcon name="arrow-left" :size="22" /></button>
      <div class="dots">
        <button v-for="(s, i) in slides" :key="s.title" :class="['dot', { 'dot--on': i === index }]" :aria-label="`Слайд ${i + 1}`" @click="go(i)" />
      </div>
      <button class="nav-btn" :disabled="isLast" aria-label="Дальше" @click="next"><UiIcon name="arrow-left" :size="22" class="flip" /></button>
      <div class="hint">
        <span>← → листать</span>
        <span>Esc — выход</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.pitch {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--text);
  position: relative;
}
.progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--gradient-progress);
  transition: width 0.3s;
}

/* Top bar */
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 32px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 0;
  background: transparent;
  color: var(--text-muted);
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}
.counter {
  color: var(--text-muted);
  font-size: 14px;
}

/* Stage */
.stage {
  flex: 1;
  display: grid;
  place-items: center;
  padding: 16px 48px;
}
.slide {
  width: min(880px, 100%);
}
.slide--with-image {
  width: 100%;
  max-width: 1360px;
  display: grid;
  grid-template-columns: minmax(320px, 5fr) 7fr;
  gap: 48px;
  align-items: center;
}
.kicker {
  margin: 0 0 14px;
  color: var(--green);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.title {
  font-size: clamp(32px, 5vw, 56px);
  line-height: 1.1;
  margin: 0 0 18px;
}
.slide--with-image .title {
  font-size: clamp(28px, 3.2vw, 40px);
}
.subtitle {
  margin: 0 0 24px;
  font-size: clamp(18px, 2.2vw, 24px);
  color: var(--text-muted);
}
.points {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: clamp(18px, 2.2vw, 24px);
  line-height: 1.4;
}
.slide--with-image .points {
  font-size: clamp(16px, 1.5vw, 19px);
  gap: 12px;
}
.points li {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.points svg {
  color: var(--green);
  flex-shrink: 0;
  margin-top: 0.35em;
}
.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin: 8px 0 28px;
}
.stat {
  padding: 16px 22px;
  border-radius: var(--radius);
  background: var(--surface);
  min-width: 140px;
}
.stat__value {
  font-size: 28px;
  font-weight: 800;
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.stat__label {
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 2px;
}
.open-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 26px;
  padding: 10px 18px;
  border-radius: 999px;
  background: var(--green);
  color: #1d2633;
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
}
.open-link:hover {
  background: var(--green-dark);
  text-decoration: none;
}

/* Screenshot in a small "browser window" */
.shot {
  display: block;
  border-radius: 14px;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--surface-3);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
  transition: transform 0.2s, border-color 0.2s;
}
.shot:hover {
  transform: translateY(-3px);
  border-color: var(--green);
}
.shot__bar {
  display: flex;
  gap: 6px;
  padding: 10px 12px;
  background: var(--surface-2);
}
.shot__bar i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--surface-3);
}
.shot img {
  display: block;
  width: 100%;
  height: auto;
}

/* QR code to the live demo */
.qr {
  justify-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-decoration: none;
}
.qr img {
  width: min(340px, 60vw);
  padding: 18px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
}
.qr__url {
  color: var(--text-muted);
  font-size: 17px;
}
.qr:hover .qr__url {
  color: var(--green);
}

/* Bottom */
.bottom {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 32px 24px;
}
.nav-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--surface-3);
  background: var(--surface);
  color: var(--text);
  display: grid;
  place-items: center;
  cursor: pointer;
}
.nav-btn:hover:not(:disabled) {
  border-color: var(--green);
}
.nav-btn:disabled {
  opacity: 0.35;
  cursor: default;
}
.flip {
  transform: scaleX(-1);
}
.dots {
  display: flex;
  gap: 8px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 0;
  background: var(--surface-3);
  cursor: pointer;
  padding: 0;
}
.dot--on {
  background: var(--green);
}
.hint {
  margin-left: auto;
  display: flex;
  gap: 18px;
  font-size: 13px;
  color: var(--text-dim);
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

@media (max-width: 900px) {
  .slide--with-image {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .hint {
    display: none;
  }
  .top,
  .stage,
  .bottom {
    padding-inline: 16px;
  }
}
</style>
