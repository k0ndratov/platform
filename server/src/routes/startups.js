import { Router } from 'express'
import { db, toJson } from '../db.js'
import { userToJson, startupSummary, startupFull } from '../serializers.js'

export const startupsRouter = Router()

const STAGES = ['Idea', 'MVP', 'Growth']

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'startup'
}

function uniqueSlug(base) {
  let slug = base
  let n = 2
  while (db.prepare('SELECT 1 FROM startups WHERE slug = ?').get(slug)) slug = `${base}-${n++}`
  return slug
}

function cleanList(arr, max = 20) {
  if (!Array.isArray(arr)) return []
  return [...new Set(arr.map((s) => String(s).trim()).filter(Boolean))].slice(0, max)
}

function findBySlug(slug) {
  return db.prepare('SELECT * FROM startups WHERE slug = ?').get(slug)
}

// GET /api/startups?stage=MVP&q=desk
// Returns summaries with the skill match for the current user.
startupsRouter.get('/', (req, res) => {
  const user = userToJson(req.user)
  let rows = db.prepare('SELECT * FROM startups ORDER BY created_at DESC').all()
  if (req.query.stage && STAGES.includes(req.query.stage)) rows = rows.filter((r) => r.stage === req.query.stage)
  let list = rows.map((r) => startupSummary(r, user))
  const q = String(req.query.q || '').trim().toLowerCase()
  if (q) {
    list = list.filter((s) =>
      [s.name, s.pitch, ...s.stack, ...s.lookingFor.map((r) => r.role)].some((x) => x.toLowerCase().includes(q)),
    )
  }
  res.json(list)
})

// GET /api/startups/recommended  -> startups sorted by skill match
startupsRouter.get('/recommended', (req, res) => {
  const user = userToJson(req.user)
  const rows = db.prepare('SELECT * FROM startups').all()
  const list = rows
    .map((r) => startupSummary(r, user))
    .filter((s) => s.match.matched.length > 0 && !s.isMember)
    .sort((a, b) => b.match.score - a.match.score)
  res.json(list)
})

startupsRouter.get('/:slug', (req, res) => {
  const row = findBySlug(req.params.slug)
  if (!row) return res.status(404).json({ error: 'Startup not found' })
  res.json(startupFull(row, userToJson(req.user)))
})

// POST /api/startups
// Body: { name, pitch, description, problem, solution, stage, color, stack[], roles[{role,text,skills[]}], links[{label,url}] }
startupsRouter.post('/', (req, res) => {
  const b = req.body || {}
  const errors = []
  const name = String(b.name || '').trim()
  if (name.length < 2) errors.push('Name must have at least 2 letters')
  const pitch = String(b.pitch || '').trim()
  if (pitch.length < 10) errors.push('Pitch must have at least 10 letters')
  if (!STAGES.includes(b.stage)) errors.push('Unknown stage')
  const color = /^#[0-9a-f]{6}$/i.test(b.color || '') ? b.color : '#25c1cb'
  const roles = Array.isArray(b.roles) ? b.roles : []
  if (roles.some((r) => !String(r?.role || '').trim())) errors.push('Every role needs a name')
  const links = Array.isArray(b.links) ? b.links.filter((l) => String(l?.label || '').trim() && String(l?.url || '').trim()) : []
  if (errors.length) return res.status(400).json({ error: errors.join('. ') })

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
  const slug = uniqueSlug(slugify(name))
  const started = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  // A transaction: either everything is saved, or nothing
  db.exec('BEGIN')
  try {
    const sid = Number(
      db
        .prepare('INSERT INTO startups (slug, name, pitch, description, problem, solution, stage, started, stack, color, logo, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
        .run(slug, name, pitch, String(b.description || '').trim(), String(b.problem || '').trim(), String(b.solution || '').trim(), b.stage, started, toJson(cleanList(b.stack)), color, initials, req.user.id).lastInsertRowid,
    )
    db.prepare('INSERT INTO startup_members (startup_id, user_id, role, is_founder) VALUES (?,?,?,1)').run(sid, req.user.id, 'Founder')
    const insertRole = db.prepare('INSERT INTO startup_roles (startup_id, role, text, skills) VALUES (?,?,?,?)')
    for (const r of roles) insertRole.run(sid, String(r.role).trim(), String(r.text || '').trim(), toJson(cleanList(r.skills)))
    const insertLink = db.prepare('INSERT INTO startup_links (startup_id, label, url) VALUES (?,?,?)')
    for (const l of links) insertLink.run(sid, String(l.label).trim(), String(l.url).trim())
    db.exec('COMMIT')
    res.status(201).json(startupFull(findBySlug(slug), userToJson(req.user)))
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
})

// POST /api/startups/:slug/apply   Body: { roleId?: number, message?: string }
startupsRouter.post('/:slug/apply', (req, res) => {
  const row = findBySlug(req.params.slug)
  if (!row) return res.status(404).json({ error: 'Startup not found' })
  const roleId = req.body?.roleId ? Number(req.body.roleId) : null
  if (roleId) {
    const role = db.prepare('SELECT 1 FROM startup_roles WHERE id = ? AND startup_id = ?').get(roleId, row.id)
    if (!role) return res.status(400).json({ error: 'Unknown role' })
    const dup = db.prepare('SELECT 1 FROM startup_applications WHERE startup_id = ? AND role_id = ? AND user_id = ?').get(row.id, roleId, req.user.id)
    if (dup) return res.status(409).json({ error: 'You already applied for this role' })
  }
  db.prepare('INSERT INTO startup_applications (startup_id, role_id, user_id, message) VALUES (?,?,?,?)').run(
    row.id, roleId, req.user.id, String(req.body?.message || '').trim().slice(0, 1000),
  )
  res.status(201).json(startupFull(row, userToJson(req.user)))
})

// POST /api/startups/:slug/posts   Body: { title, text }  (team members only)
startupsRouter.post('/:slug/posts', (req, res) => {
  const row = findBySlug(req.params.slug)
  if (!row) return res.status(404).json({ error: 'Startup not found' })
  const member = db.prepare('SELECT 1 FROM startup_members WHERE startup_id = ? AND user_id = ?').get(row.id, req.user.id)
  if (!member) return res.status(403).json({ error: 'Only team members can write in the blog' })
  const title = String(req.body?.title || '').trim()
  const text = String(req.body?.text || '').trim()
  if (title.length < 3 || text.length < 10) return res.status(400).json({ error: 'Title (3+) and text (10+) are required' })
  db.prepare('INSERT INTO startup_posts (startup_id, author_id, title, text) VALUES (?,?,?,?)').run(row.id, req.user.id, title, text)
  res.status(201).json(startupFull(row, userToJson(req.user)))
})

// POST /api/startups/:slug/posts/:postId/like  (toggle)
startupsRouter.post('/:slug/posts/:postId/like', (req, res) => {
  const row = findBySlug(req.params.slug)
  if (!row) return res.status(404).json({ error: 'Startup not found' })
  const postId = Number(req.params.postId)
  const post = db.prepare('SELECT 1 FROM startup_posts WHERE id = ? AND startup_id = ?').get(postId, row.id)
  if (!post) return res.status(404).json({ error: 'Post not found' })
  const liked = db.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?').get(postId, req.user.id)
  if (liked) db.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?').run(postId, req.user.id)
  else db.prepare('INSERT INTO post_likes (post_id, user_id) VALUES (?,?)').run(postId, req.user.id)
  const likes = db.prepare('SELECT COUNT(*) AS n FROM post_likes WHERE post_id = ?').get(postId).n
  res.json({ postId, liked: !liked, likes })
})
