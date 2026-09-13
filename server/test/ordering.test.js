// The one exact-order assertion: newest startup first, ties broken by id. Own file = pristine seeded database.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { start } from '../test-utils/harness.js'

let h
before(async () => (h = await start()))
after(() => h.close())

test('GET /api/startups lists the seeded startups newest first (c-lint first)', async () => {
  const r = await h.request('GET', '/api/startups')
  assert.deepEqual(
    r.json.map((s) => s.slug),
    ['c-lint', 'tribeboard', 'deadline-radar', 'campus-eats', 'reviewmate', 'peerdesk'],
  )
})

test('a newly created startup comes first', async () => {
  await h.request('POST', '/api/startups', { body: { name: 'Newest', pitch: 'A brand new startup.', stage: 'Idea' } })
  const r = await h.request('GET', '/api/startups')
  assert.equal(r.json[0].slug, 'newest')
})
