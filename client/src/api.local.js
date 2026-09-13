// Browser-only "backend". Same methods as api.js, but the data lives in localStorage.
// Used for static demo deployments (Vercel). Mirrors the rules of the Express routes.
import { demoUsers, demoMeetups, demoStartups } from '../../shared/demo-data.js'

const KEY = 's21-demo-db-v1'
const CURRENT_USER_ID = 1
const TOPICS = ['Ideas', 'Tech talk', 'Chill', 'Study group']
const STAGES = ['Idea', 'MVP', 'Growth']
const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms))

// ---------- storage ----------
let db = null

function load() {
  if (db) return db
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) db = JSON.parse(raw)
  } catch {
    db = null
  }
  if (!db) db = seed()
  reanchorDemoMeetups()
  return db
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch (e) {
    console.warn('Could not save demo data', e)
  }
}

function seed() {
  const d = { nextId: 1, users: [], meetups: [], startups: [], applications: [], anchor: Date.now() }
  const id = () => d.nextId++
  const byLogin = {}
  for (const [login, program, cohort, level, levelProgress, campus, skills] of demoUsers) {
    const u = { id: id(), login, program, cohort, level, levelProgress, campus, skills: [...skills] }
    d.users.push(u)
    byLogin[login] = u.id
  }
  for (const [title, topic, description, place, offset, duration, capacity, host, members] of demoMeetups) {
    d.meetups.push({
      id: id(), title, topic, description, place, duration, capacity,
      hostId: byLogin[host],
      memberIds: [byLogin[host], ...members.map((m) => byLogin[m])],
      demoOffset: offset, // minutes relative to the anchor; user-created meetups use startsAt instead
      startsAt: null,
      createdAt: new Date().toISOString(),
    })
  }
  const allIds = d.users.map((u) => u.id)
  for (const s of demoStartups) {
    d.startups.push({
      id: id(),
      slug: s.slug, name: s.name, pitch: s.pitch, description: s.description, problem: s.problem, solution: s.solution,
      stage: s.stage, started: s.started, stack: [...s.stack], color: s.color, logo: s.logo,
      createdBy: byLogin[s.members[0][0]],
      createdAt: new Date().toISOString(),
      members: s.members.map(([login, role, isFounder]) => ({ userId: byLogin[login], role, isFounder: Boolean(isFounder) })),
      roles: s.roles.map(([role, text, skills]) => ({ id: id(), role, text, skills: [...skills] })),
      links: s.links.map(([label, url]) => ({ id: id(), label, url })),
      posts: s.posts.map(([author, title, text, comments, createdAt, likes]) => ({
        id: id(), authorId: byLogin[author], title, text, comments, createdAt,
        likedBy: allIds.filter((u) => u !== byLogin[author]).slice(0, likes),
      })),
      roadmap: s.roadmap.map(([title, date, status, text], i) => ({ id: id(), title, date, status, text, position: i })),
      updates: s.updates.map(([date, text]) => ({ id: id(), date, text })),
    })
  }
  db = d
  save()
  return d
}

// Demo meetups are relative to an "anchor" time. When they have all ended, move the anchor to now
// so the demo always shows something live.
function reanchorDemoMeetups() {
  const demo = db.meetups.filter((m) => m.demoOffset !== undefined)
  if (!demo.length) return
  const latestEnd = Math.max(...demo.map((m) => db.anchor + (m.demoOffset + m.duration) * 60_000))
  const liveNow = demo.some((m) => {
    const start = db.anchor + m.demoOffset * 60_000
    return Date.now() >= start && Date.now() < start + m.duration * 60_000
  })
  if (!liveNow || Date.now() > latestEnd) {
    db.anchor = Date.now()
    save()
  }
}

const startsAtOf = (m) => (m.demoOffset !== undefined ? new Date(db.anchor + m.demoOffset * 60_000) : new Date(m.startsAt))
const nextId = () => db.nextId++
const userById = (id) => db.users.find((u) => u.id === id)
const currentUser = () => userById(CURRENT_USER_ID)
const avatar = (login) => login[0].toUpperCase()
const fail = (message, status = 400) => {
  const e = new Error(message)
  e.status = status
  throw e
}

// ---------- serializers (same shapes as server/src/serializers.js) ----------
function userToJson(u) {
  return { ...u, skills: [...u.skills], avatar: avatar(u.login) }
}

function meetupToJson(m) {
  const startsAt = startsAtOf(m)
  const endsAt = new Date(startsAt.getTime() + m.duration * 60_000)
  const now = new Date()
  let status = 'upcoming'
  if (now >= endsAt) status = 'ended'
  else if (now >= startsAt) status = 'live'
  const host = userById(m.hostId)
  return {
    id: m.id, title: m.title, topic: m.topic, description: m.description, place: m.place,
    startsAt: startsAt.toISOString(), duration: m.duration, capacity: m.capacity,
    host: { id: host.id, login: host.login, avatar: avatar(host.login) },
    members: m.memberIds.map(userById).map((u) => ({ id: u.id, login: u.login, avatar: avatar(u.login) })),
    status,
    minutesAgo: Math.max(0, Math.round((now - startsAt) / 60_000)),
    minutesLeft: Math.max(0, Math.round((endsAt - now) / 60_000)),
    joined: m.memberIds.includes(CURRENT_USER_ID),
  }
}

function matchSkills(roles, userSkills) {
  const needed = [...new Set(roles.flatMap((r) => r.skills))]
  const lower = new Set(userSkills.map((x) => x.toLowerCase()))
  const matched = needed.filter((x) => lower.has(x.toLowerCase()))
  return { needed, matched, score: needed.length ? matched.length / needed.length : 0 }
}

function startupSummary(s) {
  const me = currentUser()
  const members = [...s.members].sort((a, b) => Number(b.isFounder) - Number(a.isFounder))
  return {
    id: s.id, slug: s.slug, name: s.name, pitch: s.pitch, stage: s.stage, color: s.color, logo: s.logo,
    stack: [...s.stack],
    founders: members.filter((m) => m.isFounder).map((m) => userById(m.userId).login),
    team: members.map((m) => ({ id: m.userId, login: userById(m.userId).login, role: m.role, avatar: avatar(userById(m.userId).login) })),
    lookingFor: s.roles.map((r) => ({ ...r, skills: [...r.skills] })),
    match: matchSkills(s.roles, me.skills),
    isMember: s.members.some((m) => m.userId === CURRENT_USER_ID),
  }
}

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function startupFull(s) {
  return {
    ...startupSummary(s),
    description: s.description, problem: s.problem, solution: s.solution, started: s.started, createdAt: s.createdAt,
    links: s.links.map((l) => ({ ...l })),
    blog: [...s.posts]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((p) => {
        const author = userById(p.authorId)
        const member = s.members.find((m) => m.userId === p.authorId)
        return {
          id: p.id, author: author.login, avatar: avatar(author.login), role: member?.role || 'Team member',
          date: fmtDate(p.createdAt), title: p.title, text: p.text,
          likes: p.likedBy.length, liked: p.likedBy.includes(CURRENT_USER_ID), comments: p.comments,
        }
      }),
    roadmap: [...s.roadmap].sort((a, b) => a.position - b.position).map((r) => ({ ...r })),
    updates: [...s.updates].reverse(),
    appliedRoleIds: db.applications.filter((a) => a.startupId === s.id && a.userId === CURRENT_USER_ID).map((a) => a.roleId),
  }
}

const findStartup = (slug) => db.startups.find((s) => s.slug === slug) || fail('Startup not found', 404)
const findMeetup = (id) => db.meetups.find((m) => m.id === Number(id)) || fail('Meetup not found', 404)
const cleanList = (arr, max = 20) =>
  Array.isArray(arr) ? [...new Set(arr.map((s) => String(s).trim()).filter(Boolean))].slice(0, max) : []

function slugify(name) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'startup'
  let slug = base
  let n = 2
  while (db.startups.some((s) => s.slug === slug)) slug = `${base}-${n++}`
  return slug
}

// ---------- the API ----------
export const localApi = {
  async me() {
    load()
    await delay()
    return userToJson(currentUser())
  },

  async updateSkills(skills) {
    load()
    await delay()
    if (!Array.isArray(skills)) fail('skills must be an array')
    currentUser().skills = cleanList(skills, 30)
    save()
    return userToJson(currentUser())
  },

  async meetups() {
    load()
    await delay()
    const all = [...db.meetups].sort((a, b) => startsAtOf(a) - startsAtOf(b)).map(meetupToJson)
    return {
      live: all.filter((m) => m.status === 'live'),
      upcoming: all.filter((m) => m.status === 'upcoming'),
      ended: all.filter((m) => m.status === 'ended').reverse(),
    }
  },

  async meetup(id) {
    load()
    await delay()
    return meetupToJson(findMeetup(id))
  },

  async createMeetup(b) {
    load()
    await delay()
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
    if (errors.length) fail(errors.join('. '))
    const m = {
      id: nextId(), title, topic: b.topic, description: String(b.description || '').trim(), place,
      startsAt: startsAt.toISOString(), duration, capacity, hostId: CURRENT_USER_ID, memberIds: [CURRENT_USER_ID],
      createdAt: new Date().toISOString(),
    }
    db.meetups.push(m)
    save()
    return meetupToJson(m)
  },

  async joinMeetup(id) {
    load()
    await delay()
    const m = findMeetup(id)
    const json = meetupToJson(m)
    if (json.status === 'ended') fail('This meetup has already ended', 409)
    if (json.joined) return json
    if (m.memberIds.length >= m.capacity) fail('This meetup is full', 409)
    m.memberIds.push(CURRENT_USER_ID)
    save()
    return meetupToJson(m)
  },

  async leaveMeetup(id) {
    load()
    await delay()
    const m = findMeetup(id)
    if (m.hostId === CURRENT_USER_ID) fail('The host cannot leave their own meetup', 409)
    m.memberIds = m.memberIds.filter((u) => u !== CURRENT_USER_ID)
    save()
    return meetupToJson(m)
  },

  async startups(params = {}) {
    load()
    await delay()
    let rows = [...db.startups].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id)
    if (params.stage && STAGES.includes(params.stage)) rows = rows.filter((r) => r.stage === params.stage)
    let list = rows.map(startupSummary)
    const q = String(params.q || '').trim().toLowerCase()
    if (q) {
      list = list.filter((s) =>
        [s.name, s.pitch, ...s.stack, ...s.lookingFor.map((r) => r.role)].some((x) => x.toLowerCase().includes(q)),
      )
    }
    return list
  },

  async recommendedStartups() {
    load()
    await delay()
    return db.startups
      .map(startupSummary)
      .filter((s) => s.match.matched.length > 0 && !s.isMember)
      .sort((a, b) => b.match.score - a.match.score)
  },

  async startup(slug) {
    load()
    await delay()
    return startupFull(findStartup(slug))
  },

  async createStartup(b) {
    load()
    await delay()
    const errors = []
    const name = String(b.name || '').trim()
    if (name.length < 2) errors.push('Name must have at least 2 letters')
    const pitch = String(b.pitch || '').trim()
    if (pitch.length < 10) errors.push('Pitch must have at least 10 letters')
    if (!STAGES.includes(b.stage)) errors.push('Unknown stage')
    const roles = Array.isArray(b.roles) ? b.roles : []
    if (roles.some((r) => !String(r?.role || '').trim())) errors.push('Every role needs a name')
    if (errors.length) fail(errors.join('. '))
    const links = Array.isArray(b.links) ? b.links.filter((l) => String(l?.label || '').trim() && String(l?.url || '').trim()) : []
    const s = {
      id: nextId(), slug: slugify(name), name, pitch,
      description: String(b.description || '').trim(), problem: String(b.problem || '').trim(), solution: String(b.solution || '').trim(),
      stage: b.stage, started: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      stack: cleanList(b.stack), color: /^#[0-9a-f]{6}$/i.test(b.color || '') ? b.color : '#25c1cb',
      logo: name.split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join(''),
      createdBy: CURRENT_USER_ID, createdAt: new Date().toISOString(),
      members: [{ userId: CURRENT_USER_ID, role: 'Founder', isFounder: true }],
      roles: roles.map((r) => ({ id: nextId(), role: String(r.role).trim(), text: String(r.text || '').trim(), skills: cleanList(r.skills) })),
      links: links.map((l) => ({ id: nextId(), label: String(l.label).trim(), url: String(l.url).trim() })),
      posts: [], roadmap: [], updates: [],
    }
    db.startups.push(s)
    save()
    return startupFull(s)
  },

  async applyToStartup(slug, { roleId, message } = {}) {
    load()
    await delay()
    const s = findStartup(slug)
    const rid = roleId ? Number(roleId) : null
    if (rid) {
      if (!s.roles.some((r) => r.id === rid)) fail('Unknown role')
      if (db.applications.some((a) => a.startupId === s.id && a.roleId === rid && a.userId === CURRENT_USER_ID)) fail('You already applied for this role', 409)
    }
    db.applications.push({ id: nextId(), startupId: s.id, roleId: rid, userId: CURRENT_USER_ID, message: String(message || '').trim().slice(0, 1000), createdAt: new Date().toISOString() })
    save()
    return startupFull(s)
  },

  async createPost(slug, { title, text } = {}) {
    load()
    await delay()
    const s = findStartup(slug)
    if (!s.members.some((m) => m.userId === CURRENT_USER_ID)) fail('Only team members can write in the blog', 403)
    const t = String(title || '').trim()
    const body = String(text || '').trim()
    if (t.length < 3 || body.length < 10) fail('Title (3+) and text (10+) are required')
    s.posts.push({ id: nextId(), authorId: CURRENT_USER_ID, title: t, text: body, comments: 0, likedBy: [], createdAt: new Date().toISOString() })
    save()
    return startupFull(s)
  },

  async likePost(slug, postId) {
    load()
    await delay()
    const s = findStartup(slug)
    const p = s.posts.find((x) => x.id === Number(postId)) || fail('Post not found', 404)
    const liked = p.likedBy.includes(CURRENT_USER_ID)
    p.likedBy = liked ? p.likedBy.filter((u) => u !== CURRENT_USER_ID) : [...p.likedBy, CURRENT_USER_ID]
    save()
    return { postId: p.id, liked: !liked, likes: p.likedBy.length }
  },

  /** Removes all demo data from this browser. */
  reset() {
    localStorage.removeItem(KEY)
    db = null
  },
}
