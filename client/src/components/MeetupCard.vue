<script setup>
import { computed, ref } from 'vue'
import UiIcon from './UiIcon.vue'
import UiButton from './UiButton.vue'
import ProgressBar from './ProgressBar.vue'
import { api } from '../api'
import { useToast } from '../composables/useToast'
import { useUser } from '../composables/useUser'

const props = defineProps({
  meetup: { type: Object, required: true },
})
const emit = defineEmits(['update'])

const toast = useToast()
const { user } = useUser()
const busy = ref(false)

const colors = { Ideas: 'purple', 'Tech talk': 'cyan', Chill: 'green', 'Study group': 'blue' }
const color = computed(() => colors[props.meetup.topic] || 'green')
const full = computed(() => props.meetup.members.length >= props.meetup.capacity)
const progress = computed(() => Math.min(100, (props.meetup.minutesAgo / props.meetup.duration) * 100))
const isHost = computed(() => user.value && props.meetup.host.id === user.value.id)

const startTime = computed(() =>
  new Date(props.meetup.startsAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
)

async function toggle() {
  busy.value = true
  try {
    const updated = props.meetup.joined ? await api.leaveMeetup(props.meetup.id) : await api.joinMeetup(props.meetup.id)
    emit('update', updated)
    toast.success(updated.joined ? `You joined "${updated.title}"` : `You left "${updated.title}"`)
  } catch (e) {
    toast.error(e.message)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <article :class="['meet', `meet--${color}`]">
    <div class="meet__top">
      <span class="tag">{{ meetup.topic }}</span>
      <span v-if="meetup.status === 'live'" class="meet__live"><span class="live-dot" /> {{ meetup.minutesAgo }} min ago</span>
      <span v-else class="muted meet__when">Starts at {{ startTime }}</span>
    </div>

    <h3 class="meet__title">{{ meetup.title }}</h3>
    <p class="meet__desc">{{ meetup.description || 'No description. Just come.' }}</p>

    <div v-if="meetup.status === 'live'" class="meet__time">
      <ProgressBar :value="progress" :height="4" />
      <span class="muted">{{ meetup.minutesLeft }} min left</span>
    </div>
    <div v-else class="meet__time muted">
      <UiIcon name="clock" :size="14" /> {{ meetup.duration }} min
    </div>

    <ul class="meet__meta">
      <li><UiIcon name="user" :size="16" /> <b>{{ meetup.host.login }}</b></li>
      <li><UiIcon name="pin" :size="16" /> {{ meetup.place }}</li>
    </ul>

    <div class="meet__bottom">
      <div class="members">
        <span v-for="m in meetup.members.slice(0, 4)" :key="m.id" class="members__avatar" :title="m.login">{{ m.avatar }}</span>
        <span class="members__count muted">{{ meetup.members.length }}/{{ meetup.capacity }}</span>
      </div>
      <UiButton v-if="isHost" variant="ghost" disabled><UiIcon name="user" :size="14" /> Your meetup</UiButton>
      <UiButton v-else-if="meetup.joined" variant="ghost" :disabled="busy" @click="toggle">
        <UiIcon name="check" :size="14" /> You're in
      </UiButton>
      <UiButton v-else :variant="full ? 'ghost' : 'primary'" :disabled="busy || full" @click="toggle">
        {{ full ? 'Full' : 'Join' }} <UiIcon v-if="!full" name="chevron-right" :size="14" />
      </UiButton>
    </div>
  </article>
</template>

<style scoped>
.meet {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px 24px 24px;
  border-radius: var(--radius);
  background: var(--surface-2);
  overflow: hidden;
  height: 100%;
}
.meet::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 4px;
  background: var(--gradient-progress);
}
.meet--purple::before {
  background: linear-gradient(90deg, #7c46d5, #b070ff);
}
.meet--cyan::before {
  background: linear-gradient(90deg, #25c1cb, #3f95d2);
}
.meet--green::before {
  background: linear-gradient(90deg, #3dbc83, #44eb99);
}
.meet--blue::before {
  background: linear-gradient(90deg, #3f95d2, #36c5f0);
}
.meet__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
.meet__live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--green);
  font-size: 13px;
}
.meet__when {
  font-size: 13px;
}
.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
}
.meet__title {
  font-size: 18px;
  line-height: 1.3;
}
.meet__desc {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.5;
  flex: 1;
}
.meet__time {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  white-space: nowrap;
}
.meet__meta {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
}
.meet__meta li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
}
.meet__meta b {
  color: var(--text);
  font-weight: 600;
}
.meet__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}
.members {
  display: flex;
  align-items: center;
}
.members__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--surface-2);
  background: var(--surface-3);
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
  display: grid;
  place-items: center;
  margin-left: -8px;
}
.members__avatar:first-child {
  margin-left: 0;
}
.members__count {
  margin-left: 10px;
  font-size: 13px;
}
</style>
