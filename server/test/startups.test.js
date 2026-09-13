import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { start } from '../test-utils/harness.js'
import { MESSAGES } from '../../shared/rules.js'

let h
before(async () => (h = await start()))
after(() => h.close())

const SEEDED = ['peerdesk', 'reviewmate', 'campus-eats', 'deadline-radar', 'tribeboard', 'c-lint']

// ---- read-only ----
test('GET /api/startups lists the seeded startups with match info', async () => {
  const r = await h.request('GET', '/api/startups')
  assert.equal(r.status, 200)
  assert.deepEqual(new Set(r.json.map((s) => s.slug)), new Set(SEEDED))
  const peerdesk = r.json.find((s) => s.slug === 'peerdesk')
  assert.equal(peerdesk.isMember, true)
  assert.deepEqual(peerdesk.founders, ['mageneus', 'zephyrus'])
  assert.equal(peerdesk.team.length, 3)
  assert.equal(typeof peerdesk.match.score, 'number')
  assert.equal(peerdesk.lookingFor.length, 2)
})

test('?stage=Idea filters by stage', async () => {
  const r = await h.request('GET', '/api/startups?stage=Idea')
  assert.deepEqual(new Set(r.json.map((s) => s.slug)), new Set(['reviewmate', 'tribeboard']))
})

test('?q searches name, pitch, stack and role names', async () => {
  const desk = await h.request('GET', '/api/startups?q=desk')
  assert.deepEqual(desk.json.map((s) => s.slug), ['peerdesk'])
  const rad = await h.request('GET', '/api/startups?q=rad')
  assert.ok(rad.json.some((s) => s.slug === 'deadline-radar'))
  const rails = await h.request('GET', '/api/startups?q=rails')
  assert.ok(rails.json.some((s) => s.slug === 'peerdesk'))
})

test('GET /api/startups/recommended excludes member startups and zero matches, sorted by score', async () => {
  const r = await h.request('GET', '/api/startups/recommended')
  assert.equal(r.status, 200)
  const slugs = r.json.map((s) => s.slug)
  assert.equal(slugs.includes('peerdesk'), false)
  assert.ok(r.json.every((s) => s.match.matched.length > 0))
  const scores = r.json.map((s) => s.match.score)
  assert.deepEqual(scores, [...scores].sort((a, b) => b - a))
  assert.deepEqual(new Set(slugs), new Set(['reviewmate', 'deadline-radar', 'tribeboard']))
})

test('GET /api/startups/:slug returns the full shape', async () => {
  const r = await h.request('GET', '/api/startups/peerdesk')
  assert.equal(r.status, 200)
  assert.equal(r.json.name, 'PeerDesk')
  assert.equal(r.json.blog.length, 3)
  assert.equal(typeof r.json.blog[0].likes, 'number')
  assert.equal(r.json.blog[0].liked, false)
  assert.equal(r.json.blog[0].title, 'Why we killed the "reserve a desk" feature') // newest first
  assert.deepEqual(
    r.json.roadmap.map((s) => s.status),
    ['done', 'done', 'in-progress', 'planned', 'planned', 'planned'],
  )
  assert.deepEqual(r.json.appliedRoleIds, [])
  assert.equal(r.json.links.length, 2)
  assert.equal(r.json.updates.length, 3)
})

test('GET /api/startups/:slug -> 404 for unknown slug', async () => {
  const r = await h.request('GET', '/api/startups/nope')
  assert.equal(r.status, 404)
  assert.equal(r.json.error, MESSAGES.startupNotFound)
})

// ---- validation ----
test('POST /api/startups with an empty body lists the validation errors', async () => {
  const r = await h.request('POST', '/api/startups', { body: {} })
  assert.equal(r.status, 400)
  assert.equal(r.json.error, [MESSAGES.startupName, MESSAGES.startupPitch, MESSAGES.startupStage].join('. '))
})

test('POST /api/startups rejects a role without a name', async () => {
  const r = await h.request('POST', '/api/startups', {
    body: { name: 'Ok', pitch: 'Long enough pitch', stage: 'Idea', roles: [{ role: '  ' }] },
  })
  assert.equal(r.status, 400)
  assert.equal(r.json.error, MESSAGES.roleName)
})

// ---- mutations ----
test('POST /api/startups creates a startup with slug, founder, roles and links', async () => {
  const r = await h.request('POST', '/api/startups', {
    body: {
      name: 'Desk Radar',
      pitch: 'See which desks are free.',
      stage: 'MVP',
      color: 'red',
      stack: [' Vue ', 'Vue', ''],
      roles: [{ role: ' Backend dev ', text: 'API', skills: ['Node.js', 'node.js'] }],
      links: [{ label: 'GitLab', url: 'https://gitlab.com' }, { label: '', url: 'x' }],
    },
    userId: 4,
  })
  assert.equal(r.status, 201)
  assert.equal(r.json.slug, 'desk-radar')
  assert.equal(r.json.logo, 'DR')
  assert.equal(r.json.color, '#25c1cb')
  assert.deepEqual(r.json.stack, ['Vue'])
  assert.deepEqual(r.json.founders, ['pixelkat'])
  assert.equal(r.json.isMember, true)
  assert.equal(r.json.lookingFor[0].role, 'Backend dev')
  assert.deepEqual(r.json.lookingFor[0].skills, ['Node.js', 'node.js'])
  assert.equal(r.json.links.length, 1)
})

test('a second startup with the same name gets a -2 slug and keeps a valid color', async () => {
  const r = await h.request('POST', '/api/startups', {
    body: { name: 'Desk Radar', pitch: 'Another one with a pitch.', stage: 'Growth', color: '#25C1CB' },
  })
  assert.equal(r.status, 201)
  assert.equal(r.json.slug, 'desk-radar-2')
  assert.equal(r.json.color, '#25C1CB')
})

test('apply: unknown role -> 400, success, duplicate -> 409, message without role -> 201', async () => {
  const bad = await h.request('POST', '/api/startups/reviewmate/apply', { body: { roleId: 9999 } })
  assert.equal(bad.status, 400)
  assert.equal(bad.json.error, MESSAGES.unknownRole)

  const full = await h.request('GET', '/api/startups/reviewmate')
  const roleId = full.json.lookingFor[0].id
  const ok = await h.request('POST', '/api/startups/reviewmate/apply', { body: { roleId, message: 'Hi' } })
  assert.equal(ok.status, 201)
  assert.deepEqual(ok.json.appliedRoleIds, [roleId])

  const dup = await h.request('POST', '/api/startups/reviewmate/apply', { body: { roleId } })
  assert.equal(dup.status, 409)
  assert.equal(dup.json.error, MESSAGES.alreadyApplied)

  const msg = await h.request('POST', '/api/startups/reviewmate/apply', { body: { message: 'Just a question' } })
  assert.equal(msg.status, 201)
  assert.ok(msg.json.appliedRoleIds.includes(roleId))

  const missing = await h.request('POST', '/api/startups/nope/apply', { body: {} })
  assert.equal(missing.status, 404)
})

test('posts: non-member -> 403, short title -> 400, member -> 201 and newest first', async () => {
  const forbidden = await h.request('POST', '/api/startups/reviewmate/posts', { body: { title: 'Hello', text: 'Some longer text' }, userId: 4 })
  assert.equal(forbidden.status, 403)
  assert.equal(forbidden.json.error, MESSAGES.membersOnly)

  const short = await h.request('POST', '/api/startups/peerdesk/posts', { body: { title: 'Hi', text: 'Some longer text' } })
  assert.equal(short.status, 400)
  assert.equal(short.json.error, MESSAGES.postInvalid)

  const ok = await h.request('POST', '/api/startups/peerdesk/posts', { body: { title: 'Hello', text: 'Some longer text' } })
  assert.equal(ok.status, 201)
  assert.equal(ok.json.blog.length, 4)
  assert.equal(ok.json.blog[0].title, 'Hello')
  assert.equal(ok.json.blog[0].author, 'mageneus')
  assert.equal(ok.json.blog[0].role, 'Founder · Frontend')
  assert.equal(ok.json.blog[0].likes, 0)
})

test('like toggles and counts', async () => {
  const full = await h.request('GET', '/api/startups/peerdesk')
  const post = full.json.blog.find((p) => p.title === 'Hello')
  const on = await h.request('POST', `/api/startups/peerdesk/posts/${post.id}/like`)
  assert.deepEqual(on.json, { postId: post.id, liked: true, likes: 1 })
  const off = await h.request('POST', `/api/startups/peerdesk/posts/${post.id}/like`)
  assert.deepEqual(off.json, { postId: post.id, liked: false, likes: 0 })
  const missing = await h.request('POST', '/api/startups/peerdesk/posts/9999/like')
  assert.equal(missing.status, 404)
  assert.equal(missing.json.error, MESSAGES.postNotFound)
})

test('recommended is empty for a user whose skills match nothing', async () => {
  await h.request('PUT', '/api/me/skills', { body: { skills: ['Cobol'] }, userId: 2 })
  const r = await h.request('GET', '/api/startups/recommended', { userId: 2 })
  assert.deepEqual(r.json, [])
})
