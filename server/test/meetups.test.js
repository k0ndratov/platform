import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { start } from '../test-utils/harness.js'
import { MESSAGES } from '../../shared/rules.js'

let h
before(async () => (h = await start()))
after(() => h.close())

const minutes = (n) => new Date(Date.now() + n * 60_000).toISOString()

// ---- read-only ----
test('GET /api/meetups splits the seed into 3 live and 3 upcoming', async () => {
  const r = await h.request('GET', '/api/meetups')
  assert.equal(r.status, 200)
  assert.deepEqual(
    new Set(r.json.live.map((m) => m.title)),
    new Set(['Pet project ideas: what to build next?', 'Rust vs C: memory safety chat', 'Coffee & new faces']),
  )
  assert.equal(r.json.upcoming.length, 3)
  assert.equal(r.json.ended.length, 0)
  const rust = r.json.live.find((m) => m.title.startsWith('Rust'))
  assert.equal(rust.host.login, 'ferrisfan')
  assert.equal(rust.members.length, 3)
  assert.equal(rust.joined, false)
})

test('GET /api/meetups/:id -> 404 for unknown id', async () => {
  const r = await h.request('GET', '/api/meetups/9999')
  assert.equal(r.status, 404)
  assert.equal(r.json.error, MESSAGES.meetupNotFound)
})

// ---- validation ----
test('POST /api/meetups with an empty body lists every validation error', async () => {
  const r = await h.request('POST', '/api/meetups', { body: {} })
  assert.equal(r.status, 400)
  assert.equal(
    r.json.error,
    [
      MESSAGES.meetupTitle,
      MESSAGES.meetupTopic,
      MESSAGES.meetupPlace,
      MESSAGES.meetupDuration,
      MESSAGES.meetupCapacity,
    ].join('. '),
  )
})

test('POST /api/meetups with an unparseable startsAt -> 400', async () => {
  const r = await h.request('POST', '/api/meetups', {
    body: { title: 'Valid', topic: 'Chill', place: 'Lounge', duration: 30, capacity: 4, startsAt: 'not-a-date' },
  })
  assert.equal(r.status, 400)
  assert.equal(r.json.error, MESSAGES.meetupStartsAt)
})

// ---- mutations ----
let createdId
test('POST /api/meetups creates a live meetup with the host as member', async () => {
  const r = await h.request('POST', '/api/meetups', {
    body: { title: 'Test meet', topic: 'Chill', description: ' hi ', place: 'Lounge', duration: 30, capacity: 2 },
  })
  assert.equal(r.status, 201)
  assert.equal(r.json.status, 'live')
  assert.equal(r.json.joined, true)
  assert.equal(r.json.description, 'hi')
  assert.deepEqual(r.json.members.map((m) => m.login), ['mageneus'])
  createdId = r.json.id
})

test('POST /api/meetups with a future startsAt is upcoming', async () => {
  const r = await h.request('POST', '/api/meetups', {
    body: { title: 'Later', topic: 'Ideas', place: 'Cluster 1', duration: 45, capacity: 5, startsAt: minutes(60) },
  })
  assert.equal(r.status, 201)
  assert.equal(r.json.status, 'upcoming')
})

// The next five tests reuse `createdId` from the test above and build on each other in order.
test('user 4 joins the created meetup; a second join is idempotent', async () => {
  const r1 = await h.request('POST', `/api/meetups/${createdId}/join`, { userId: 4 })
  assert.equal(r1.status, 200)
  assert.equal(r1.json.joined, true)
  assert.equal(r1.json.members.length, 2)
  const r2 = await h.request('POST', `/api/meetups/${createdId}/join`, { userId: 4 })
  assert.equal(r2.status, 200)
  assert.equal(r2.json.members.length, 2)
})

test('joining a full meetup -> 409', async () => {
  const r = await h.request('POST', `/api/meetups/${createdId}/join`, { userId: 5 })
  assert.equal(r.status, 409)
  assert.equal(r.json.error, MESSAGES.meetupFull)
})

test('joining an ended meetup -> 409', async () => {
  const created = await h.request('POST', '/api/meetups', {
    body: { title: 'Old one', topic: 'Chill', place: 'Lounge', duration: 30, capacity: 5, startsAt: minutes(-120) },
  })
  assert.equal(created.json.status, 'ended')
  const r = await h.request('POST', `/api/meetups/${created.json.id}/join`, { userId: 4 })
  assert.equal(r.status, 409)
  assert.equal(r.json.error, MESSAGES.meetupEnded)
})

test('the host cannot leave their own meetup', async () => {
  const r = await h.request('DELETE', `/api/meetups/${createdId}/join`)
  assert.equal(r.status, 409)
  assert.equal(r.json.error, MESSAGES.hostCannotLeave)
})

test('a member can leave', async () => {
  const r = await h.request('DELETE', `/api/meetups/${createdId}/join`, { userId: 4 })
  assert.equal(r.status, 200)
  assert.equal(r.json.joined, false)
  assert.equal(r.json.members.length, 1)
})

test('join/leave unknown meetup -> 404', async () => {
  assert.equal((await h.request('POST', '/api/meetups/9999/join')).status, 404)
  assert.equal((await h.request('DELETE', '/api/meetups/9999/join')).status, 404)
})
