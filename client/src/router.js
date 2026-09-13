import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'dashboard', component: () => import('./pages/DashboardPage.vue') },
  { path: '/meetups', name: 'meetups', component: () => import('./pages/MeetupsPage.vue') },
  { path: '/startups', name: 'startups', component: () => import('./pages/StartupsPage.vue') },
  { path: '/profile', name: 'profile', component: () => import('./pages/ProfilePage.vue') },
  { path: '/pitch', name: 'pitch', component: () => import('./pages/PitchPage.vue') },
  { path: '/meetups/new', name: 'meetup-new', component: () => import('./pages/MeetupNewPage.vue') },
  { path: '/startups/new', name: 'startup-new', component: () => import('./pages/StartupNewPage.vue') },
  { path: '/startups/:slug', name: 'startup', component: () => import('./pages/StartupPage.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
