import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { start } from '../test-utils/harness.js'
import { MESSAGES } from '../../shared/rules.js'

let h
before(async () => (h = await start()))
after(() => h.close())

// read-only first
test('GET /api/health', async () => {
  const r = await h.request('GET', '/api/health')
  assert.equal(r.status, 200)
  assert.deepEqual(r.json, { ok: true })
})

test('GET /api/me returns the seeded user 1', async () => {
  const r = await h.request('GET', '/api/me')
  assert.equal(r.status, 200)
  assert.equal(r.json.login, 'mageneus')
  assert.equal(r.json.avatar, 'M')
  assert.deepEqual(r.json.skills, ['Vue', 'JavaScript', 'Rails', 'PostgreSQL', 'Figma'])
  assert.equal('password' in r.json, false)
})

test('X-User-Id selects another user', async () => {
  const r = await h.request('GET', '/api/me', { userId: 4 })
  assert.equal(r.json.login, 'pixelkat')
})

test('unknown user -> 401', async () => {
  const r = await h.request('GET', '/api/me', { userId: 999 })
  assert.equal(r.status, 401)
  assert.equal(r.json.error, 'Unknown user')
})

test('unknown API route -> 404 JSON', async () => {
  const r = await h.request('GET', '/api/nothing')
  assert.equal(r.status, 404)
  assert.deepEqual(r.json, { error: 'Not found' })
})

// mutations last
test('PUT /api/me/skills rejects a non-array', async () => {
  const r = await h.request('PUT', '/api/me/skills', { body: { skills: 'Vue' } })
  assert.equal(r.status, 400)
  assert.equal(r.json.error, MESSAGES.skillsArray)
})

test('PUT /api/me/skills trims, dedupes and caps at 30', async () => {
  const many = Array.from({ length: 40 }, (_, i) => `Skill${i}`)
  const r = await h.request('PUT', '/api/me/skills', { body: { skills: [' Vue ', 'vue', 'Vue', '', 'Go', ...many] } })
  assert.equal(r.status, 200)
  assert.equal(r.json.skills[0], 'Vue')
  assert.equal(r.json.skills[1], 'vue') // dedupe is exact after trim, case kept
  assert.equal(r.json.skills.includes(''), false)
  assert.equal(r.json.skills.length, 30)
  const again = await h.request('GET', '/api/me')
  assert.equal(again.json.skills.length, 30)
})
