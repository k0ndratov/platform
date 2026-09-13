// Pure rules shared by the server and the browser adapter. No database, no HTTP.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { MESSAGES, TOPICS, STAGES, cleanList, matchSkills, validateMeetupInput, validateStartupInput } from '../../shared/rules.js'

describe('constants', () => {
  test('topics and stages', () => {
    assert.deepEqual(TOPICS, ['Ideas', 'Tech talk', 'Chill', 'Study group'])
    assert.deepEqual(STAGES, ['Idea', 'MVP', 'Growth'])
  })
  test('MESSAGES is a flat object of 21 unique strings', () => {
    const values = Object.values(MESSAGES)
    assert.equal(values.length, 21)
    assert.ok(values.every((v) => typeof v === 'string' && v.length > 0))
    assert.equal(new Set(values).size, values.length)
  })
})

describe('cleanList', () => {
  test('trims, drops empties, dedupes exactly, caps', () => {
    assert.deepEqual(cleanList([' a ', 'a', '', 'b', 'B']), ['a', 'b', 'B'])
    assert.deepEqual(cleanList(['1', '2', '3'], 2), ['1', '2'])
    assert.deepEqual(cleanList('not an array'), [])
    assert.deepEqual(cleanList([1, 2]), ['1', '2'])
  })
})

describe('matchSkills', () => {
  test('no roles -> zero score', () => {
    assert.deepEqual(matchSkills([], ['Vue']), { needed: [], matched: [], score: 0 })
  })
  test('case-insensitive, deduped across roles', () => {
    const m = matchSkills([{ skills: ['Vue', 'Figma'] }, { skills: ['vue', 'Go'] }], ['VUE'])
    assert.deepEqual(m.needed, ['Vue', 'Figma', 'vue', 'Go'])
    assert.deepEqual(m.matched, ['Vue', 'vue'])
    assert.equal(m.score, 0.5)
  })
})

describe('validateMeetupInput', () => {
  test('empty body -> the five empty-body messages in order', () => {
    const { errors } = validateMeetupInput({})
    assert.deepEqual(errors, [MESSAGES.meetupTitle, MESSAGES.meetupTopic, MESSAGES.meetupPlace, MESSAGES.meetupDuration, MESSAGES.meetupCapacity])
    assert.deepEqual(validateMeetupInput(undefined).errors, errors)
  })
  test('each rule fires on its own bad value', () => {
    const ok = { title: 'Valid', topic: 'Chill', place: 'Lounge', duration: 30, capacity: 4 }
    assert.deepEqual(validateMeetupInput({ ...ok, title: 'ab' }).errors, [MESSAGES.meetupTitle])
    assert.deepEqual(validateMeetupInput({ ...ok, topic: 'Party' }).errors, [MESSAGES.meetupTopic])
    assert.deepEqual(validateMeetupInput({ ...ok, place: '  ' }).errors, [MESSAGES.meetupPlace])
    assert.deepEqual(validateMeetupInput({ ...ok, duration: 4 }).errors, [MESSAGES.meetupDuration])
    assert.deepEqual(validateMeetupInput({ ...ok, duration: 241 }).errors, [MESSAGES.meetupDuration])
    assert.deepEqual(validateMeetupInput({ ...ok, duration: 30.5 }).errors, [MESSAGES.meetupDuration])
    assert.deepEqual(validateMeetupInput({ ...ok, capacity: 1 }).errors, [MESSAGES.meetupCapacity])
    assert.deepEqual(validateMeetupInput({ ...ok, capacity: 101 }).errors, [MESSAGES.meetupCapacity])
    assert.deepEqual(validateMeetupInput({ ...ok, startsAt: 'not-a-date' }).errors, [MESSAGES.meetupStartsAt])
  })
  test('valid input -> no errors and a normalized value', () => {
    const before = Date.now()
    const { errors, value } = validateMeetupInput({ title: ' Valid ', topic: 'Chill', description: ' hi ', place: ' Lounge ', duration: '30', capacity: '4' })
    assert.deepEqual(errors, [])
    assert.equal(value.title, 'Valid')
    assert.equal(value.description, 'hi')
    assert.equal(value.place, 'Lounge')
    assert.equal(value.duration, 30)
    assert.equal(value.capacity, 4)
    assert.ok(value.startsAt instanceof Date)
    assert.ok(value.startsAt.getTime() >= before)
    const later = validateMeetupInput({ title: 'Valid', topic: 'Chill', place: 'Lounge', duration: 30, capacity: 4, startsAt: '2030-01-01T10:00:00.000Z' })
    assert.equal(later.value.startsAt.toISOString(), '2030-01-01T10:00:00.000Z')
  })
})

describe('validateStartupInput', () => {
  test('empty body -> the three empty-body messages in order', () => {
    assert.deepEqual(validateStartupInput({}).errors, [MESSAGES.startupName, MESSAGES.startupPitch, MESSAGES.startupStage])
    assert.equal(validateStartupInput({}).value.logo, '') // must not throw on an empty name
  })
  test('role without a name', () => {
    const { errors } = validateStartupInput({ name: 'Ok', pitch: 'Long enough pitch', stage: 'Idea', roles: [{ role: '  ' }] })
    assert.deepEqual(errors, [MESSAGES.roleName])
  })
  test('normalizes value: color kept when valid, fallback otherwise; logo; lists', () => {
    const base = { name: ' Desk Radar ', pitch: 'See which desks are free.', stage: 'MVP' }
    const kept = validateStartupInput({ ...base, color: '#25C1CB' }).value
    assert.equal(kept.color, '#25C1CB')
    const v = validateStartupInput({
      ...base,
      color: 'red',
      description: ' d ',
      stack: [' Vue ', 'Vue', ''],
      roles: [{ role: ' Backend dev ', text: ' API ', skills: ['Node.js', 'Node.js'] }],
      links: [{ label: ' GitLab ', url: ' https://gitlab.com ' }, { label: '', url: 'x' }, { label: 'x', url: ' ' }],
    }).value
    assert.equal(v.name, 'Desk Radar')
    assert.equal(v.logo, 'DR')
    assert.equal(v.color, '#25c1cb')
    assert.equal(v.description, 'd')
    assert.deepEqual(v.stack, ['Vue'])
    assert.deepEqual(v.roles, [{ role: 'Backend dev', text: 'API', skills: ['Node.js'] }])
    assert.deepEqual(v.links, [{ label: 'GitLab', url: 'https://gitlab.com' }])
    assert.equal('slug' in v, false)
  })
})
