<script setup>
import { computed } from 'vue'
import UiIcon from './UiIcon.vue'
import UiButton from './UiButton.vue'

const props = defineProps({
  startup: { type: Object, required: true },
  showMatch: { type: Boolean, default: false }, // show the skill match that the API computed
})

const match = computed(() => (props.showMatch && props.startup.match ? props.startup.match : null))
const matchedSet = computed(() => new Set((match.value?.matched ?? []).map((x) => x.toLowerCase())))
const open = computed(() => props.startup.lookingFor.length > 0)
</script>

<template>
  <RouterLink :to="{ name: 'startup', params: { slug: startup.slug } }" class="startup">
    <div class="startup__top">
      <span class="startup__logo" :style="{ background: startup.color }">{{ startup.logo }}</span>
      <div class="startup__head">
        <h4 class="startup__name">{{ startup.name }}</h4>
        <span :class="['stage', `stage--${startup.stage.toLowerCase()}`]">{{ startup.stage }}</span>
      </div>
      <span v-if="match && match.matched.length" class="match">
        <UiIcon name="check" :size="14" /> {{ Math.round(match.score * 100) }}% match
      </span>
    </div>

    <p class="startup__pitch">{{ startup.pitch }}</p>

    <!-- With user skills: show the skills the startup needs, matched ones are green -->
    <div v-if="match" class="skills">
      <span
        v-for="sk in match.needed"
        :key="sk"
        :class="['tag', { 'tag--match': matchedSet.has(sk.toLowerCase()) }]"
      >
        <UiIcon v-if="matchedSet.has(sk.toLowerCase())" name="check" :size="12" /> {{ sk }}
      </span>
    </div>
    <!-- Without user skills: show the stack -->
    <div v-else class="skills">
      <span v-for="t in startup.stack" :key="t" class="tag">{{ t }}</span>
    </div>

    <ul class="meta">
      <li><UiIcon name="user" :size="16" /> <b>{{ startup.founders.join(', ') }}</b></li>
      <li><UiIcon name="users" :size="16" /> Team of {{ startup.team.length }}</li>
    </ul>

    <div class="startup__bottom">
      <div class="looking">
        <template v-if="open">
          <span class="looking__label">Looking for</span>
          <span class="looking__roles">{{ startup.lookingFor.map((r) => r.role).join(' · ') }}</span>
        </template>
        <span v-else class="muted">Team is full</span>
      </div>
      <UiButton v-if="startup.isMember" variant="ghost">Your team <UiIcon name="chevron-right" :size="14" /></UiButton>
      <UiButton v-else :variant="open ? 'primary' : 'ghost'">
        {{ open ? 'Join team' : 'View' }} <UiIcon name="chevron-right" :size="14" />
      </UiButton>
    </div>
  </RouterLink>
</template>

<style scoped>
.startup {
  color: var(--text);
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px 24px 24px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid transparent;
  transition: border-color 0.15s, background 0.15s;
  height: 100%;
}
.startup:hover {
  text-decoration: none;
  background: var(--surface-2);
  border-color: var(--surface-3);
}
.startup__top {
  display: flex;
  align-items: center;
  gap: 14px;
}
.startup__logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  color: #1d2633;
  font-weight: 800;
  font-size: 15px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.startup__head {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
}
.startup__name {
  font-size: 17px;
}
.stage {
  align-self: flex-start;
  padding: 2px 8px;
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
.match {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(68, 235, 153, 0.15);
  color: var(--green);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.startup__pitch {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.5;
  flex: 1;
}
.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.07);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.tag--match {
  background: rgba(68, 235, 153, 0.15);
  color: var(--green);
}
.meta {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
}
.meta li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
}
.meta b {
  color: var(--text);
  font-weight: 600;
}
.startup__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  padding-top: 16px;
  border-top: 1px solid var(--surface-3);
}
.startup__bottom button {
  white-space: nowrap;
  flex-shrink: 0;
}
.looking {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  min-width: 0;
}
.looking__label {
  color: var(--text-dim);
  font-size: 12px;
}
.looking__roles {
  color: var(--text);
  font-weight: 600;
}
</style>
