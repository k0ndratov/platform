import { describe, it, expect, beforeEach, vi } from 'vitest'
import { localApi } from './api.local.js'
import { MESSAGES } from '../../shared/rules.js'

const KEY = 's21-demo-db-v1'
const minutes = (n) => new Date(Date.now() + n * 60_000).toISOString()

beforeEach(() => {
  localApi.reset()
  localStorage.clear()
})

describe('test mode', () => {
  it('skips the artificial delay under Vitest', async () => {
    const t0 = performance.now()
    await localApi.me()
    expect(performance.now() - t0).toBeLessThan(50)
  })
})

describe('seed and persistence', () => {
  it('seeds user 1 on first use and stores the data', async () => {
    expect(localStorage.getItem(KEY)).toBeNull()
    const me = await localApi.me()
    expect(me.login).toBe('mageneus')
    expect(me.avatar).toBe('M')
    expect(me.skills).toEqual(['Vue', 'JavaScript', 'Rails', 'PostgreSQL', 'Figma'])
    expect(localStorage.getItem(KEY)).not.toBeNull()
  })

  it('splits demo meetups into 3 live and 3 upcoming', async () => {
    const m = await localApi.meetups()
    expect(m.live).toHaveLength(3)
    expect(m.upcoming).toHaveLength(3)
    expect(m.ended).toHaveLength(0)
    expect(new Set(m.live.map((x) => x.host.login))).toEqual(new Set(['zephyrus', 'ferrisfan', 'mageneus']))
  })

  it('re-anchors demo meetups when they have all ended', async () => {
    await localApi.me()
    const json = JSON.parse(localStorage.getItem(KEY))
    localApi.reset()
    json.anchor = Date.now() - 10 * 60 * 60_000
    localStorage.setItem(KEY, JSON.stringify(json))
    const m = await localApi.meetups()
    expect(m.live).toHaveLength(3)
    expect(m.upcoming).toHaveLength(3)
  })

  it('keeps data across a fresh module instance without re-seeding', async () => {
    const created = await localApi.createMeetup({ title: 'Persisted', topic: 'Chill', place: 'Lounge', duration: 30, capacity: 4 })
    expect(JSON.parse(localStorage.getItem(KEY)).meetups.some((m) => m.id === created.id)).toBe(true)
    vi.resetModules()
    const fresh = await import('./api.local.js')
    const m = await fresh.localApi.meetups()
    expect(m.live.map((x) => x.title)).toContain('Persisted')
    expect(m.live).toHaveLength(4)
  })
})

describe('meetups', () => {
  it('validates input with the same messages as the server', async () => {
    await expect(localApi.createMeetup({})).rejects.toThrow(
      [
        MESSAGES.meetupTitle,
        MESSAGES.meetupTopic,
        MESSAGES.meetupPlace,
        MESSAGES.meetupDuration,
        MESSAGES.meetupCapacity,
      ].join('. '),
    )
    await expect(
      localApi.createMeetup({ title: 'Valid', topic: 'Chill', place: 'Lounge', duration: 30, capacity: 4, startsAt: 'not-a-date' }),
    ).rejects.toThrow(MESSAGES.meetupStartsAt)
  })

  it('creates a live meetup with the host as member, or an upcoming one with a future start', async () => {
    const live = await localApi.createMeetup({ title: 'Now', topic: 'Ideas', description: ' hi ', place: 'Cluster 1', duration: 30, capacity: 2 })
    expect(live.status).toBe('live')
    expect(live.joined).toBe(true)
    expect(live.description).toBe('hi')
    expect(live.members.map((m) => m.login)).toEqual(['mageneus'])
    const later = await localApi.createMeetup({ title: 'Later', topic: 'Ideas', place: 'Cluster 1', duration: 30, capacity: 2, startsAt: minutes(60) })
    expect(later.status).toBe('upcoming')
    const all = await localApi.meetups()
    expect(all.live.map((m) => m.title)).toContain('Now')
    expect(all.upcoming.map((m) => m.title)).toContain('Later')
  })

  it('join: idempotent, full -> error, ended -> error, unknown -> error', async () => {
    const all = await localApi.meetups()
    const rust = all.live.find((m) => m.title.startsWith('Rust'))
    expect(rust.joined).toBe(false)
    const joined = await localApi.joinMeetup(rust.id)
    expect(joined.joined).toBe(true)
    expect(joined.members).toHaveLength(rust.members.length + 1)
    const again = await localApi.joinMeetup(rust.id)
    expect(again.members).toHaveLength(rust.members.length + 1)

    // The adapter has a single current user, so other members are written straight into storage.
    const tiny = await localApi.createMeetup({ title: 'Tiny', topic: 'Chill', place: 'Lounge', duration: 30, capacity: 2 })
    const json = JSON.parse(localStorage.getItem(KEY))
    json.meetups.find((m) => m.id === tiny.id).memberIds = [2, 3]
    localApi.reset()
    localStorage.setItem(KEY, JSON.stringify(json))
    await expect(localApi.joinMeetup(tiny.id)).rejects.toThrow(MESSAGES.meetupFull)

    const ended = await localApi.createMeetup({ title: 'Old', topic: 'Chill', place: 'Lounge', duration: 30, capacity: 5, startsAt: minutes(-120) })
    expect(ended.status).toBe('ended')
    const json2 = JSON.parse(localStorage.getItem(KEY))
    json2.meetups.find((m) => m.id === ended.id).memberIds = [2]
    localApi.reset()
    localStorage.setItem(KEY, JSON.stringify(json2))
    await expect(localApi.joinMeetup(ended.id)).rejects.toThrow(MESSAGES.meetupEnded)

    await expect(localApi.joinMeetup(9999)).rejects.toThrow(MESSAGES.meetupNotFound)
  })

  it('leave: host cannot leave, a member can', async () => {
    const mine = await localApi.createMeetup({ title: 'Mine', topic: 'Chill', place: 'Lounge', duration: 30, capacity: 5 })
    await expect(localApi.leaveMeetup(mine.id)).rejects.toThrow(MESSAGES.hostCannotLeave)
    const all = await localApi.meetups()
    const rust = all.live.find((m) => m.title.startsWith('Rust'))
    await localApi.joinMeetup(rust.id)
    const left = await localApi.leaveMeetup(rust.id)
    expect(left.joined).toBe(false)
    expect(left.members).toHaveLength(rust.members.length)
  })
})

describe('skills and recommendations', () => {
  it('updateSkills trims, dedupes, caps at 30 and rejects non-arrays', async () => {
    await expect(localApi.updateSkills('Vue')).rejects.toThrow(MESSAGES.skillsArray)
    const many = Array.from({ length: 40 }, (_, i) => `S${i}`)
    const me = await localApi.updateSkills([' Vue ', 'Vue', '', ...many])
    expect(me.skills[0]).toBe('Vue')
    expect(me.skills).toHaveLength(30)
    expect((await localApi.me()).skills).toHaveLength(30)
  })

  it('recommendedStartups excludes member startups and zero matches, sorted by score', async () => {
    const list = await localApi.recommendedStartups()
    const slugs = list.map((s) => s.slug)
    expect(slugs).not.toContain('peerdesk')
    expect(new Set(slugs)).toEqual(new Set(['reviewmate', 'deadline-radar', 'tribeboard']))
    const scores = list.map((s) => s.match.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
    await localApi.updateSkills(['Cobol'])
    expect(await localApi.recommendedStartups()).toEqual([])
  })

  it('startups list supports stage and q filters', async () => {
    const all = await localApi.startups()
    expect(new Set(all.map((s) => s.slug))).toEqual(new Set(['peerdesk', 'reviewmate', 'campus-eats', 'deadline-radar', 'tribeboard', 'c-lint']))
    expect((await localApi.startups({ stage: 'Idea' })).map((s) => s.slug).sort()).toEqual(['reviewmate', 'tribeboard'])
    expect((await localApi.startups({ q: 'desk' })).map((s) => s.slug)).toEqual(['peerdesk'])
  })
})

describe('startups', () => {
  it('validates input with the same messages as the server', async () => {
    await expect(localApi.createStartup({})).rejects.toThrow(
      [MESSAGES.startupName, MESSAGES.startupPitch, MESSAGES.startupStage].join('. '),
    )
    await expect(localApi.createStartup({ name: 'Ok', pitch: 'Long enough pitch', stage: 'Idea', roles: [{ role: '  ' }] })).rejects.toThrow(
      MESSAGES.roleName,
    )
    await expect(localApi.createStartup({ name: 'Ok', pitch: 'Long enough pitch', stage: 'Idea', roles: [null] })).rejects.toThrow(MESSAGES.roleName)
  })

  it('creates a startup with slug, -2 suffix, founder member and color fallback', async () => {
    const s = await localApi.createStartup({
      name: 'Desk Radar',
      pitch: 'See which desks are free.',
      stage: 'MVP',
      color: 'red',
      stack: [' Vue ', 'Vue'],
      roles: [{ role: ' Backend dev ', text: 'API', skills: ['Node.js'] }],
      links: [{ label: 'GitLab', url: 'https://gitlab.com' }, { label: '', url: 'x' }],
    })
    expect(s.slug).toBe('desk-radar')
    expect(s.logo).toBe('DR')
    expect(s.color).toBe('#25c1cb')
    expect(s.stack).toEqual(['Vue'])
    expect(s.founders).toEqual(['mageneus'])
    expect(s.isMember).toBe(true)
    expect(s.lookingFor[0].role).toBe('Backend dev')
    expect(s.links).toHaveLength(1)
    const s2 = await localApi.createStartup({ name: 'Desk Radar', pitch: 'Another with a pitch.', stage: 'Growth', color: '#25C1CB' })
    expect(s2.slug).toBe('desk-radar-2')
    expect(s2.color).toBe('#25C1CB')
    expect((await localApi.startup('desk-radar')).name).toBe('Desk Radar')
    await expect(localApi.startup('nope')).rejects.toThrow(MESSAGES.startupNotFound)
  })

  it('apply: unknown role, success, duplicate, message without role', async () => {
    await expect(localApi.applyToStartup('reviewmate', { roleId: 9999 })).rejects.toThrow(MESSAGES.unknownRole)
    const full = await localApi.startup('reviewmate')
    const roleId = full.lookingFor[0].id
    const ok = await localApi.applyToStartup('reviewmate', { roleId, message: 'Hi' })
    expect(ok.appliedRoleIds).toEqual([roleId])
    await expect(localApi.applyToStartup('reviewmate', { roleId })).rejects.toThrow(MESSAGES.alreadyApplied)
    const msg = await localApi.applyToStartup('reviewmate', { message: 'Question' })
    expect(msg.appliedRoleIds).toEqual([roleId, null]) // a message without a role is stored with roleId null
  })

  it('posts: forbidden for non-members, validated, newest first; likes toggle', async () => {
    await expect(localApi.createPost('reviewmate', { title: 'Hello', text: 'Some longer text' })).rejects.toThrow(MESSAGES.membersOnly)
    await expect(localApi.createPost('peerdesk', { title: 'Hi', text: 'Some longer text' })).rejects.toThrow(MESSAGES.postInvalid)
    const s = await localApi.createPost('peerdesk', { title: 'Hello', text: 'Some longer text' })
    expect(s.blog).toHaveLength(4)
    expect(s.blog[0].title).toBe('Hello')
    expect(s.blog[0].role).toBe('Founder · Frontend')
    expect(s.blog[0].likes).toBe(0)
    const on = await localApi.likePost('peerdesk', s.blog[0].id)
    expect(on).toEqual({ postId: s.blog[0].id, liked: true, likes: 1 })
    const off = await localApi.likePost('peerdesk', s.blog[0].id)
    expect(off).toEqual({ postId: s.blog[0].id, liked: false, likes: 0 })
    await expect(localApi.likePost('peerdesk', 9999)).rejects.toThrow(MESSAGES.postNotFound)
  })

  it('full startup shape: blog newest first, roadmap ordered, links and updates present', async () => {
    const s = await localApi.startup('peerdesk')
    expect(s.blog[0].title).toBe('Why we killed the "reserve a desk" feature')
    expect(s.roadmap.map((r) => r.status)).toEqual(['done', 'done', 'in-progress', 'planned', 'planned', 'planned'])
    expect(s.roadmap.every((r) => !('position' in r))).toBe(true) // same shape as the server
    expect(s.links).toHaveLength(2)
    expect(s.updates).toHaveLength(3)
    expect(s.appliedRoleIds).toEqual([])
  })
})
