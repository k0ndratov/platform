import { Router } from 'express'
import { db, toJson } from '../db.js'
import { userToJson } from '../serializers.js'
import { MESSAGES, cleanList } from '../../../shared/rules.js'

export const meRouter = Router()

meRouter.get('/', (req, res) => {
  res.json(userToJson(req.user))
})

// Replace the skills list. Body: { skills: string[] }
meRouter.put('/skills', (req, res) => {
  const skills = Array.isArray(req.body?.skills) ? req.body.skills : null
  if (!skills) return res.status(400).json({ error: MESSAGES.skillsArray })
  const clean = cleanList(skills, 30)
  db.prepare('UPDATE users SET skills = ? WHERE id = ?').run(toJson(clean), req.user.id)
  req.user.skills = toJson(clean)
  res.json(userToJson(db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)))
})
