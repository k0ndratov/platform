<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import UiButton from '../components/UiButton.vue'

const route = useRoute()
const title = computed(() => {
  const s = String(route.params.section || '')
  return s.charAt(0).toUpperCase() + s.slice(1)
})
</script>

<template>
  <div>
    <AppHeader variant="page">
      <div class="title-row"><h1 class="title">{{ title }}</h1></div>
    </AppHeader>
    <main class="container main">
      <div class="box">
        <h3>This section is not built yet</h3>
        <p class="muted">Meetups and startups are the focus of this project. Other sections of the platform will come later.</p>
        <RouterLink :to="{ name: 'dashboard' }"><UiButton variant="ghost">Back to dashboard</UiButton></RouterLink>
      </div>
    </main>
  </div>
</template>

<style scoped>
.title-row {
  display: flex;
  justify-content: center;
  margin-top: 86px;
  padding-bottom: 40px;
}
.title {
  font-size: 24px;
}
.main {
  padding-block: 40px 80px;
}
.box {
  max-width: 560px;
  margin: 0 auto;
  padding: 40px;
  border-radius: var(--radius);
  background: var(--surface);
  text-align: center;
}
.box h3 {
  margin-bottom: 8px;
}
.box p {
  margin: 0 0 20px;
}
</style>
