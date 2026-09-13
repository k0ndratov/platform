import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import ProfilePage from './ProfilePage.vue'
import { api } from '../api'
import { useToast } from '../composables/useToast'
import { useUser } from '../composables/useUser'

vi.mock('../api', () => ({
  api: { me: vi.fn(), updateProfile: vi.fn(), recommendedStartups: vi.fn() },
}))

vi.mock('../composables/useToast', () => {
  const t = { success: vi.fn(), error: vi.fn() }
  return { useToast: () => t }
})

const me = () => ({
  id: 1,
  login: 'mageneus',
  avatar: 'M',
  program: 'Core program',
  cohort: '26_04_TAS',
  level: 7,
  levelProgress: 78,
  campus: '21 Tashkent',
  skills: ['Vue', 'Rails'],
  bio: 'Hello there',
})

function mountPage() {
  return mount(ProfilePage, {
    global: { stubs: { RouterLink: RouterLinkStub, AppHeader: { template: '<div><slot /></div>' } } },
  })
}
const chip = (w, name) => w.findAll('button.chip').find((b) => b.text().trim() === name)
const button = (w, label) => w.findAll('button').find((b) => b.text().trim() === label)

beforeEach(() => {
  useUser().set(me())
  api.me.mockResolvedValue(me())
  api.recommendedStartups.mockResolvedValue([
    { id: 2, slug: 'reviewmate', name: 'ReviewMate', color: '#7c46d5', logo: 'RM', match: { needed: ['Vue', 'Figma'], matched: ['Vue'], score: 1 } },
  ])
  api.updateProfile.mockImplementation(async (body) => ({ ...me(), ...body }))
})

describe('ProfilePage', () => {
  it('shows the user, the bio, the level and the matching startups', async () => {
    const w = mountPage()
    await flushPromises()
    expect(w.text()).toContain('mageneus')
    expect(w.text()).toContain('Level 7')
    expect(w.find('textarea').element.value).toBe('Hello there')
    expect(w.text()).toContain('ReviewMate')
    expect(w.text()).toContain('1 of 2 skills match')
  })

  it('chips reflect the saved skills, toggle, and save sends the new list', async () => {
    const w = mountPage()
    await flushPromises()
    expect(chip(w, 'Vue').classes()).toContain('chip--on')
    expect(chip(w, 'Go').classes()).not.toContain('chip--on')
    expect(button(w, 'Save skills').attributes('disabled')).toBeDefined()

    await chip(w, 'Go').trigger('click')
    await chip(w, 'Vue').trigger('click')
    expect(button(w, 'Save skills').attributes('disabled')).toBeUndefined()

    await button(w, 'Save skills').trigger('click')
    await flushPromises()
    expect(api.updateProfile).toHaveBeenCalledWith({ skills: ['Rails', 'Go'] })
    expect(useUser().user.value.skills).toEqual(['Rails', 'Go'])
    expect(useToast().success).toHaveBeenCalledWith('Skills saved')
    expect(api.recommendedStartups).toHaveBeenCalledTimes(2) // reloaded after saving
    expect(button(w, 'Save skills').attributes('disabled')).toBeDefined()
  })

  it('reset restores the saved skills', async () => {
    const w = mountPage()
    await flushPromises()
    await chip(w, 'Go').trigger('click')
    expect(chip(w, 'Go').classes()).toContain('chip--on')
    await button(w, 'Reset').trigger('click')
    expect(chip(w, 'Go').classes()).not.toContain('chip--on')
    expect(api.updateProfile).not.toHaveBeenCalled()
  })

  it('bio save is disabled until the text changes, then sends the trimmed text', async () => {
    const w = mountPage()
    await flushPromises()
    expect(button(w, 'Save bio').attributes('disabled')).toBeDefined()
    await w.find('textarea').setValue('  New bio  ')
    expect(button(w, 'Save bio').attributes('disabled')).toBeUndefined()
    await button(w, 'Save bio').trigger('click')
    await flushPromises()
    expect(api.updateProfile).toHaveBeenCalledWith({ bio: 'New bio' })
    expect(useUser().user.value.bio).toBe('New bio')
    expect(useToast().success).toHaveBeenCalledWith('Bio saved')
  })

  it('shows an API error as a toast and keeps the draft', async () => {
    api.updateProfile.mockRejectedValue(new Error('Server is down'))
    const w = mountPage()
    await flushPromises()
    await chip(w, 'Go').trigger('click')
    await button(w, 'Save skills').trigger('click')
    await flushPromises()
    expect(useToast().error).toHaveBeenCalledWith('Server is down')
    expect(chip(w, 'Go').classes()).toContain('chip--on')
  })
})
