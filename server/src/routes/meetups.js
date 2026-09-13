import { Router } from 'express'
import { db } from '../db.js'
import { meetupToJson } from '../serializers.js'

export const meetupsRouter = Router()

const TOPICS = ['Ideas', 'Tech talk', 'Chill', 'Study group']

// GET /api/meetups -> { live: [], upcoming: [], ended: [] }
meetupsRouter.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM meetups ORDER BY starts_at').all()
  const all = rows.map((r) => meetupToJson(r, req.user.id))
  res.json({
    live: all.filter((m) => m.status === 'live'),
    upcoming: all.filter((m) => m.status === 'upcoming'),
    ended: all.filter((m) => m.status === 'ended').reverse(),
  })
})

meetupsRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM meetups WHERE id = ?').get(Number(req.params.id))
  if (!row) return res.status(404).json({ error: 'Meetup not found' })
  res.json(meetupToJson(row, req.user.id))
})

// POST /api/meetups
// Body: { title, topic, description, place, startsAt (ISO) | null = now, duration, capacity }
meetupsRouter.post('/', (req, res) => {
  const b = req.body || {}
  const errors = []
  const title = String(b.title || '').trim()
  if (title.length < 3) errors.push('Title must have at least 3 letters')
  if (!TOPICS.includes(b.topic)) errors.push('Unknown topic')
  const place = String(b.place || '').trim()
  if (!place) errors.push('Place is required')
  const duration = Number(b.duration)
  if (!Number.isInteger(duration) || duration < 5 || duration > 240) errors.push('Duration must be 5..240 minutes')
  const capacity = Number(b.capacity)
  if (!Number.isInteger(capacity) || capacity < 2 || capacity > 100) errors.push('Capacity must be 2..100')
  let startsAt = new Date()
  if (b.startsAt) {
    startsAt = new Date(b.startsAt)
    if (Number.isNaN(startsAt.getTime())) errors.push('startsAt is not a valid date')
  }
  if (errors.length) return res.status(400).json({ error: errors.join('. ') })

  const result = db
    .prepare('INSERT INTO meetups (title, topic, description, place, starts_at, duration, capacity, host_id) VALUES (?,?,?,?,?,?,?,?)')
    .run(title, b.topic, String(b.description || '').trim(), place, startsAt.toISOString(), duration, capacity, req.user.id)
  const id = Number(result.lastInsertRowid)
  // The host is always a member
  db.prepare('INSERT INTO meetup_members (meetup_id, user_id) VALUES (?,?)').run(id, req.user.id)

  res.status(201).json(meetupToJson(db.prepare('SELECT * FROM meetups WHERE id = ?').get(id), req.user.id))
})

// POST /api/meetups/:id/join
meetupsRouter.post('/:id/join', (req, res) => {
  const id = Number(req.params.id)
  const row = db.prepare('SELECT * FROM meetups WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ error: 'Meetup not found' })
  const meetup = meetupToJson(row, req.user.id)
  if (meetup.status === 'ended') return res.status(409).json({ error: 'This meetup has already ended' })
  if (meetup.joined) return res.json(meetup)
  if (meetup.members.length >= meetup.capacity) return res.status(409).json({ error: 'This meetup is full' })
  db.prepare('INSERT INTO meetup_members (meetup_id, user_id) VALUES (?,?)').run(id, req.user.id)
  res.json(meetupToJson(row, req.user.id))
})

// DELETE /api/meetups/:id/join  (leave)
meetupsRouter.delete('/:id/join', (req, res) => {
  const id = Number(req.params.id)
  const row = db.prepare('SELECT * FROM meetups WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ error: 'Meetup not found' })
  if (row.host_id === req.user.id) return res.status(409).json({ error: 'The host cannot leave their own meetup' })
  db.prepare('DELETE FROM meetup_members WHERE meetup_id = ? AND user_id = ?').run(id, req.user.id)
  res.json(meetupToJson(row, req.user.id))
})
