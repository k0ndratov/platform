import { Router } from 'express'
import { db, toJson } from '../db.js'
import { userToJson } from '../serializers.js'
import { validateProfileInput } from '../../../shared/rules.js'

export const meRouter = Router()

meRouter.get('/', (req, res) => {
  res.json(userToJson(req.user))
})

// Only the fields present in the body are changed.
function updateProfile(req, res, body) {
  const { errors, value } = validateProfileInput(body)
  if (errors.length) return res.status(400).json({ error: errors[0] })
  if ('skills' in value) db.prepare('UPDATE users SET skills = ? WHERE id = ?').run(toJson(value.skills), req.user.id)
  if ('bio' in value) db.prepare('UPDATE users SET bio = ? WHERE id = ?').run(value.bio, req.user.id)
  res.json(userToJson(db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)))
}

// Update the profile. Body: { bio?: string, skills?: string[] }
meRouter.put('/', (req, res) => updateProfile(req, res, req.body))

// Replace the skills list. Body: { skills: string[] }
meRouter.put('/skills', (req, res) => updateProfile(req, res, { skills: req.body?.skills }))
