<script setup>
import { RouterLink } from 'vue-router'
import Logo21 from './Logo21.vue'
import UiIcon from './UiIcon.vue'
import WaveRibbon from './WaveRibbon.vue'

defineProps({
  variant: { type: String, default: 'dashboard' }, // dashboard | page
})

const nav = [
  { label: 'Dashboard', to: { name: 'dashboard' } },
  { label: 'Meetups', to: { name: 'meetups' }, match: '/meetups' },
  { label: 'Startups', to: { name: 'startups' }, match: '/startups' },
  { label: 'Profile', to: { name: 'profile' }, match: '/profile' },
]
</script>

<template>
  <header :class="['header', `header--${variant}`]">
    <div class="decor" aria-hidden="true">
      <template v-if="variant === 'dashboard'">
        <WaveRibbon
          class="ribbon ribbon--left-a"
          :blocks="[{ x: 60, y: -70, s: 140 }, { x: 210, y: 120, s: 140 }]"
          from="#3f95d2"
          to="#3edcaa"
          :angle="45"
          :width="400"
          :height="300"
        />
        <WaveRibbon
          class="ribbon ribbon--left-b"
          :blocks="[{ x: 250, y: -110, s: 110 }, { x: 362, y: 50, s: 138 }]"
          from="#3f95d2"
          to="#27bdcb"
          :angle="45"
          :width="520"
          :height="300"
        />
        <WaveRibbon
          class="ribbon ribbon--right"
          :blocks="[{ x: 0, y: -70, s: 110 }, { x: 100, y: 50, s: 120 }, { x: 220, y: 180, s: 90 }]"
          from="#3f95d2"
          to="#44eb99"
          :angle="45"
          :width="340"
          :height="300"
        />
      </template>
      <template v-else>
        <WaveRibbon
          class="ribbon ribbon--page"
          :blocks="[{ x: -80, y: -110, s: 140 }, { x: 120, y: 50, s: 140 }]"
          from="#3f95d2"
          to="#2ad6c9"
          :angle="45"
          :width="300"
          :height="240"
        />
      </template>
    </div>

    <RouterLink :to="{ name: 'dashboard' }" :class="['logo', `logo--${variant}`]">
      <Logo21 :size="variant === 'dashboard' ? 138 : 140" />
    </RouterLink>

    <div class="topbar">
      <nav class="nav">
        <RouterLink
          v-for="item in nav"
          :key="item.label"
          :to="item.to"
          class="nav__link"
          :class="{ 'router-link-active': item.match && $route.path.startsWith(item.match) }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="actions">
        <RouterLink :to="{ name: 'profile' }" class="avatar" title="My profile" aria-label="My profile"><UiIcon name="user" :size="26" /></RouterLink>
      </div>
    </div>

    <div class="header__content">
      <slot />
    </div>
  </header>
</template>

<style scoped>
.header {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid #232d3c;
  min-height: 208px;
}
.header--dashboard {
  min-height: var(--header-height);
}
.decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.ribbon {
  position: absolute;
}
.ribbon--left-a,
.ribbon--left-b {
  left: 0;
  top: 0;
}
.ribbon--right {
  right: 150px;
  top: 0;
}
.ribbon--page {
  left: 0;
  top: 0;
}
.logo {
  position: absolute;
  z-index: 2;
}
.logo--dashboard {
  left: 362px;
  top: 50px;
}
.logo--page {
  left: 120px;
  top: 50px;
}

/* Top bar: [space for the logo] [nav, centered] [actions, right]. A grid, so the nav and the
   action buttons can never overlap, whatever the window width. */
.topbar {
  z-index: 2; /* above .header__content, which starts at the top of the header on the dashboard */
  --topbar-left: 280px; /* the page logo ends at 260px */
  position: absolute;
  top: 14px;
  left: 0;
  right: 48px;
  display: grid;
  grid-template-columns: minmax(var(--topbar-left), 1fr) auto minmax(max-content, 1fr);
  align-items: center;
}
.header--dashboard .topbar {
  --topbar-left: 520px; /* the dashboard logo ends at 500px */
}
.nav {
  grid-column: 2;
  display: flex;
  gap: 62px;
  justify-self: center;
}
.nav__link {
  color: var(--text);
  font-size: 15px;
  padding-bottom: 6px;
  border-bottom: 1px solid transparent;
}
.nav__link:hover {
  text-decoration: none;
  color: var(--green);
}
.nav__link.router-link-active {
  color: var(--green);
  border-bottom-color: var(--green);
}

.actions {
  grid-column: 3;
  display: flex;
  align-items: center;
  gap: 16px;
  justify-self: end;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e6e7;
  color: #6b7583;
  display: grid;
  place-items: center;
  transition: background 0.15s;
}
.avatar:hover,
.avatar.router-link-active {
  background: var(--green);
  color: #1d2633;
}

.header__content {
  position: relative;
  z-index: 1;
}
@media (max-width: 1100px) {
  /* Narrow windows: the nav may sit above the logo, so lift the bar a bit and let the left column shrink. */
  .topbar,
  .header--dashboard .topbar {
    --topbar-left: 0px;
    top: 4px;
  }
  .nav {
    gap: 28px;
  }
  .nav__link {
    font-size: 14px;
  }
}
</style>
