import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { start } from '../test-utils/harness.js'

let h, serializers

before(async () => {
  h = await start()
  serializers = await import('../src/serializers.js')
})
after(() => h.close())

const insert = (startsAt, duration) =>
  Number(
    h.db
      .prepare('INSERT INTO meetups (title, topic, description, place, starts_at, duration, capacity, host_id) VALUES (?,?,?,?,?,?,?,?)')
      .run('t', 'Chill', '', 'Lounge', startsAt.toISOString(), duration, 5, 1).lastInsertRowid,
  )
const row = (id) => h.db.prepare('SELECT * FROM meetups WHERE id = ?').get(id)
const minutes = (n) => new Date(Date.now() + n * 60_000)

test('is live between start and end', () => {
  const id = insert(minutes(-10), 30)
  const m = serializers.meetupToJson(row(id), 1)
  assert.equal(m.status, 'live')
  assert.equal(m.minutesAgo, 10)
  assert.equal(m.minutesLeft, 20)
})

test('is upcoming before start', () => {
  const id = insert(minutes(15), 30)
  const m = serializers.meetupToJson(row(id), 1)
  assert.equal(m.status, 'upcoming')
  assert.equal(m.minutesAgo, 0)
})

test('is ended after start + duration', () => {
  const id = insert(minutes(-90), 30)
  const m = serializers.meetupToJson(row(id), 1)
  assert.equal(m.status, 'ended')
  assert.equal(m.minutesLeft, 0)
})

test('joined reflects membership of the given user', () => {
  const id = insert(minutes(-1), 30)
  h.db.prepare('INSERT INTO meetup_members (meetup_id, user_id) VALUES (?,?)').run(id, 4)
  assert.equal(serializers.meetupToJson(row(id), 4).joined, true)
  assert.equal(serializers.meetupToJson(row(id), 2).joined, false)
  assert.equal(serializers.meetupToJson(row(id), 4).members[0].avatar, 'P')
})
