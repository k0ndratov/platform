import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import StartupCard from './StartupCard.vue'

function makeStartup(overrides = {}) {
  return {
    id: 1,
    slug: 'peerdesk',
    name: 'PeerDesk',
    pitch: 'Find a free desk.',
    stage: 'MVP',
    color: '#25c1cb',
    logo: 'PD',
    stack: ['Vue', 'Rails'],
    founders: ['mageneus'],
    team: [{ id: 1, login: 'mageneus', role: 'Founder', avatar: 'M' }],
    lookingFor: [{ id: 10, role: 'Backend dev', text: 't', skills: ['Rails', 'Node.js'] }],
    match: { needed: ['Rails', 'Node.js'], matched: ['Rails'], score: 0.5 },
    isMember: false,
    ...overrides,
  }
}

function mountCard(props) {
  return mount(StartupCard, {
    props,
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('StartupCard', () => {
  it('renders name, pitch and stage', () => {
    const wrapper = mountCard({ startup: makeStartup() })
    expect(wrapper.text()).toContain('PeerDesk')
    expect(wrapper.text()).toContain('Find a free desk.')
    const stage = wrapper.find('.stage')
    expect(stage.text()).toBe('MVP')
    expect(stage.classes()).toContain('stage--mvp')
  })

  it('without showMatch, shows the stack and no match badge', () => {
    const wrapper = mountCard({ startup: makeStartup() })
    const tags = wrapper.findAll('.tag').map((t) => t.text())
    expect(tags).toContain('Vue')
    expect(tags).toContain('Rails')
    expect(wrapper.find('.match').exists()).toBe(false)
  })

  it('with showMatch, shows the match percentage and highlights matched skills', () => {
    const wrapper = mountCard({ startup: makeStartup(), showMatch: true })
    expect(wrapper.find('.match').text()).toContain('50% match')

    const tags = wrapper.findAll('.tag')
    const railsTag = tags.find((t) => t.text().includes('Rails'))
    const nodeTag = tags.find((t) => t.text().includes('Node.js'))
    expect(railsTag.classes()).toContain('tag--match')
    expect(nodeTag.classes()).not.toContain('tag--match')
  })

  it('shows "Join team" when there are open roles and not a member', () => {
    const wrapper = mountCard({ startup: makeStartup() })
    expect(wrapper.text()).toContain('Join team')
  })

  it('shows "View" when there are no open roles', () => {
    const wrapper = mountCard({ startup: makeStartup({ lookingFor: [] }) })
    expect(wrapper.text()).toContain('View')
  })

  it('shows "Your team" when the user is a member', () => {
    const wrapper = mountCard({ startup: makeStartup({ isMember: true }) })
    expect(wrapper.text()).toContain('Your team')
  })
})
