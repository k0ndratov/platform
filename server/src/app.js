// The Express app without "listen". Used by the local server (index.js) and by Vercel (api/index.js).
import express from 'express'
import cors from 'cors'
import { db } from './db.js'
import { meRouter } from './routes/me.js'
import { meetupsRouter } from './routes/meetups.js'
import { startupsRouter } from './routes/startups.js'

export const app = express()

app.use(cors())
app.use(express.json({ limit: '200kb' }))

// --- "Auth" ---
// There is no login yet. The current user is the first user in the database.
// For testing you can send "X-User-Id: 2" to act as another user.
app.use('/api', (req, res, next) => {
  const id = Number(req.get('x-user-id')) || 1
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
  if (!user) return res.status(401).json({ error: 'Unknown user' })
  req.user = user
  next()
})

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/me', meRouter)
app.use('/api/meetups', meetupsRouter)
app.use('/api/startups', startupsRouter)

// 404 for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

// Error handler: never leak a stack trace to the client
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Server error' })
})
