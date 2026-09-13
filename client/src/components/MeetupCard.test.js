import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MeetupCard from './MeetupCard.vue'
import { api } from '../api'
import { useToast } from '../composables/useToast'
import { useUser } from '../composables/useUser'

vi.mock('../api', () => ({
  api: { joinMeetup: vi.fn(), leaveMeetup: vi.fn() },
}))

vi.mock('../composables/useToast', () => {
  const t = { success: vi.fn(), error: vi.fn() }
  return { useToast: () => t }
})

function makeMeetup(overrides = {}) {
  return {
    id: 5,
    title: 'Rust chat',
    topic: 'Tech talk',
    description: 'd',
    place: 'Cluster 3',
    startsAt: new Date().toISOString(),
    duration: 60,
    capacity: 3,
    host: { id: 3, login: 'ferrisfan', avatar: 'F' },
    members: [{ id: 3, login: 'ferrisfan', avatar: 'F' }],
    status: 'live',
    minutesAgo: 10,
    minutesLeft: 50,
    joined: false,
    ...overrides,
  }
}

const toast = useToast()

beforeEach(() => {
  useUser().set({ id: 1, login: 'mageneus' })
  api.joinMeetup.mockResolvedValue(makeMeetup({ joined: true }))
  api.leaveMeetup.mockResolvedValue(makeMeetup({ joined: false }))
})

describe('MeetupCard', () => {
  it('shows Join when not joined and not full', () => {
    const wrapper = mount(MeetupCard, { props: { meetup: makeMeetup() } })
    expect(wrapper.text()).toContain('Join')
    expect(wrapper.text()).not.toContain('Full')
  })

  it('shows Full disabled when members.length >= capacity', () => {
    const meetup = makeMeetup({
      capacity: 3,
      members: [
        { id: 3, login: 'ferrisfan', avatar: 'F' },
        { id: 4, login: 'a', avatar: 'A' },
        { id: 5, login: 'b', avatar: 'B' },
      ],
    })
    const wrapper = mount(MeetupCard, { props: { meetup } })
    const btn = wrapper.findAll('button').find((b) => b.text().includes('Full'))
    expect(btn).toBeTruthy()
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('shows "You\'re in" when joined', () => {
    const wrapper = mount(MeetupCard, { props: { meetup: makeMeetup({ joined: true }) } })
    expect(wrapper.text()).toContain("You're in")
  })

  it('shows "Your meetup" when the current user is the host', () => {
    useUser().set({ id: 3, login: 'ferrisfan' })
    const wrapper = mount(MeetupCard, { props: { meetup: makeMeetup() } })
    expect(wrapper.text()).toContain('Your meetup')
  })

  it('clicking Join calls api.joinMeetup, emits update, and shows a success toast', async () => {
    const meetup = makeMeetup()
    const joined = makeMeetup({ joined: true })
    api.joinMeetup.mockResolvedValue(joined)
    const wrapper = mount(MeetupCard, { props: { meetup } })
    const btn = wrapper.findAll('button').find((b) => b.text().includes('Join'))
    await btn.trigger('click')
    await flushPromises()

    expect(api.joinMeetup).toHaveBeenCalledWith(5)
    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('update')[0][0]).toEqual(joined)
    expect(toast.success).toHaveBeenCalled()
  })

  it('clicking "You\'re in" calls api.leaveMeetup', async () => {
    const meetup = makeMeetup({ joined: true })
    const wrapper = mount(MeetupCard, { props: { meetup } })
    const btn = wrapper.findAll('button').find((b) => b.text().includes("You're in"))
    await btn.trigger('click')
    await flushPromises()

    expect(api.leaveMeetup).toHaveBeenCalledWith(5)
  })

  it('shows an error toast and does not emit update when joinMeetup rejects', async () => {
    api.joinMeetup.mockRejectedValue(new Error('Network down'))
    const meetup = makeMeetup()
    const wrapper = mount(MeetupCard, { props: { meetup } })
    const btn = wrapper.findAll('button').find((b) => b.text().includes('Join'))
    await btn.trigger('click')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith('Network down')
    expect(wrapper.emitted('update')).toBeFalsy()
  })

  it('shows "Starts at" instead of "min ago" for an upcoming meetup', () => {
    const meetup = makeMeetup({ status: 'upcoming' })
    const wrapper = mount(MeetupCard, { props: { meetup } })
    expect(wrapper.text()).toContain('Starts at')
    expect(wrapper.text()).not.toContain('min ago')
  })
})
