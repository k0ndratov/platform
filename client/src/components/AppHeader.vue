<script setup>
import { RouterLink } from 'vue-router'
import Logo21 from './Logo21.vue'
import UiIcon from './UiIcon.vue'
import WaveRibbon from './WaveRibbon.vue'

defineProps({
  variant: { type: String, default: 'dashboard' }, // dashboard | page
  notifications: { type: Number, default: 1 },
})

const nav = [
  { label: 'Dashboard', to: { name: 'dashboard' } },
  { label: 'Meetups', to: { name: 'meetups' }, match: '/meetups' },
  { label: 'Startups', to: { name: 'startups' }, match: '/startups' },
  { label: 'Projects', to: '/projects' },
  { label: 'Calendar', to: '/calendar' },
  { label: 'More', to: '/more' },
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
      <button class="icon-btn" title="Hub"><UiIcon name="hub" /></button>
      <button class="icon-btn" title="Notifications">
        <UiIcon name="bell" />
        <span v-if="notifications" class="badge">{{ notifications }}</span>
      </button>
      <button v-if="variant === 'page'" class="round-btn" title="Search"><UiIcon name="search" /></button>
      <button class="round-btn round-btn--menu" title="Menu">
        <UiIcon name="dots" />
        <span v-if="variant === 'page'" class="avatar"><UiIcon name="user" :size="26" /></span>
      </button>
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
  z-index: 1;
}
.logo--dashboard {
  left: 362px;
  top: 50px;
}
.logo--page {
  left: 120px;
  top: 50px;
}

.nav {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 62px;
  z-index: 1;
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
  position: absolute;
  top: 14px;
  right: 48px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 1;
}
.icon-btn,
.round-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  padding: 0;
}
.icon-btn {
  width: 36px;
  height: 36px;
}
.badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--green);
  color: #1d2633;
  font-size: 10px;
  font-weight: 800;
  display: grid;
  place-items: center;
}
.round-btn {
  height: 56px;
  min-width: 56px;
  border-radius: 999px;
  background: #2b3441;
  gap: 10px;
  padding: 0 14px;
}
.round-btn:hover {
  background: #343e4d;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e6e7;
  color: #6b7583;
  display: grid;
  place-items: center;
  margin-right: -6px;
}

.header__content {
  position: relative;
  z-index: 1;
}
</style>
