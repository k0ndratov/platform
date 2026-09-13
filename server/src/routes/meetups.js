import { Router } from 'express'
import { db } from '../db.js'
import { meetupToJson } from '../serializers.js'
import { MESSAGES, validateMeetupInput } from '../../../shared/rules.js'

export const meetupsRouter = Router()

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
  if (!row) return res.status(404).json({ error: MESSAGES.meetupNotFound })
  res.json(meetupToJson(row, req.user.id))
})

// POST /api/meetups
// Body: { title, topic, description, place, startsAt (ISO) | null = now, duration, capacity }
meetupsRouter.post('/', (req, res) => {
  const { errors, value: v } = validateMeetupInput(req.body)
  if (errors.length) return res.status(400).json({ error: errors.join('. ') })

  const result = db
    .prepare('INSERT INTO meetups (title, topic, description, place, starts_at, duration, capacity, host_id) VALUES (?,?,?,?,?,?,?,?)')
    .run(v.title, v.topic, v.description, v.place, v.startsAt.toISOString(), v.duration, v.capacity, req.user.id)
  const id = Number(result.lastInsertRowid)
  // The host is always a member
  db.prepare('INSERT INTO meetup_members (meetup_id, user_id) VALUES (?,?)').run(id, req.user.id)

  res.status(201).json(meetupToJson(db.prepare('SELECT * FROM meetups WHERE id = ?').get(id), req.user.id))
})

// POST /api/meetups/:id/join
meetupsRouter.post('/:id/join', (req, res) => {
  const id = Number(req.params.id)
  const row = db.prepare('SELECT * FROM meetups WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ error: MESSAGES.meetupNotFound })
  const meetup = meetupToJson(row, req.user.id)
  if (meetup.status === 'ended') return res.status(409).json({ error: MESSAGES.meetupEnded })
  if (meetup.joined) return res.json(meetup)
  if (meetup.members.length >= meetup.capacity) return res.status(409).json({ error: MESSAGES.meetupFull })
  db.prepare('INSERT INTO meetup_members (meetup_id, user_id) VALUES (?,?)').run(id, req.user.id)
  res.json(meetupToJson(row, req.user.id))
})

// DELETE /api/meetups/:id/join  (leave)
meetupsRouter.delete('/:id/join', (req, res) => {
  const id = Number(req.params.id)
  const row = db.prepare('SELECT * FROM meetups WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ error: MESSAGES.meetupNotFound })
  if (row.host_id === req.user.id) return res.status(409).json({ error: MESSAGES.hostCannotLeave })
  db.prepare('DELETE FROM meetup_members WHERE meetup_id = ? AND user_id = ?').run(id, req.user.id)
  res.json(meetupToJson(row, req.user.id))
})
