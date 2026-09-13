// Turn database rows into the JSON shape the frontend expects.
import { db, parseJson } from './db.js'
import { matchSkills } from '../../shared/rules.js'

export function userToJson(row) {
  if (!row) return null
  return {
    id: row.id,
    login: row.login,
    program: row.program,
    cohort: row.cohort,
    level: row.level,
    levelProgress: row.level_progress,
    campus: row.campus,
    skills: parseJson(row.skills),
    avatar: row.login[0].toUpperCase(),
  }
}

const membersOfMeetup = db.prepare(
  `SELECT u.id, u.login FROM meetup_members mm JOIN users u ON u.id = mm.user_id WHERE mm.meetup_id = ? ORDER BY u.login`,
)
const hostOf = db.prepare('SELECT id, login FROM users WHERE id = ?')

export function meetupToJson(row, currentUserId) {
  const members = membersOfMeetup.all(row.id)
  const host = hostOf.get(row.host_id)
  const startsAt = new Date(row.starts_at)
  const endsAt = new Date(startsAt.getTime() + row.duration * 60_000)
  const now = new Date()
  let status = 'upcoming'
  if (now >= endsAt) status = 'ended'
  else if (now >= startsAt) status = 'live'

  return {
    id: row.id,
    title: row.title,
    topic: row.topic,
    description: row.description,
    place: row.place,
    startsAt: row.starts_at,
    duration: row.duration,
    capacity: row.capacity,
    host: { id: host.id, login: host.login, avatar: host.login[0].toUpperCase() },
    members: members.map((m) => ({ id: m.id, login: m.login, avatar: m.login[0].toUpperCase() })),
    status,
    minutesAgo: Math.max(0, Math.round((now - startsAt) / 60_000)),
    minutesLeft: Math.max(0, Math.round((endsAt - now) / 60_000)),
    joined: members.some((m) => m.id === currentUserId),
  }
}

const membersOfStartup = db.prepare(
  `SELECT u.id, u.login, sm.role, sm.is_founder FROM startup_members sm JOIN users u ON u.id = sm.user_id
   WHERE sm.startup_id = ? ORDER BY sm.is_founder DESC, u.login`,
)
const rolesOf = db.prepare('SELECT * FROM startup_roles WHERE startup_id = ? ORDER BY id')
const linksOf = db.prepare('SELECT id, label, url FROM startup_links WHERE startup_id = ? ORDER BY id')
const postsOf = db.prepare(
  `SELECT p.*, u.login AS author_login, sm.role AS author_role,
     (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS likes,
     EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) AS liked
   FROM startup_posts p
   JOIN users u ON u.id = p.author_id
   LEFT JOIN startup_members sm ON sm.startup_id = p.startup_id AND sm.user_id = p.author_id
   WHERE p.startup_id = ? ORDER BY p.created_at DESC`,
)
const roadmapOf = db.prepare('SELECT * FROM startup_roadmap WHERE startup_id = ? ORDER BY position, id')
const updatesOf = db.prepare('SELECT id, date, text FROM startup_updates WHERE startup_id = ? ORDER BY id DESC')
const appliedTo = db.prepare('SELECT role_id FROM startup_applications WHERE startup_id = ? AND user_id = ?')

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Short shape for lists and cards. */
export function startupSummary(row, currentUser) {
  const members = membersOfStartup.all(row.id)
  const roles = rolesOf.all(row.id).map((r) => ({ id: r.id, role: r.role, text: r.text, skills: parseJson(r.skills) }))
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    pitch: row.pitch,
    stage: row.stage,
    color: row.color,
    logo: row.logo,
    stack: parseJson(row.stack),
    founders: members.filter((m) => m.is_founder).map((m) => m.login),
    team: members.map((m) => ({ id: m.id, login: m.login, role: m.role, avatar: m.login[0].toUpperCase() })),
    lookingFor: roles,
    match: currentUser ? matchSkills(roles, currentUser.skills) : null,
    isMember: currentUser ? members.some((m) => m.id === currentUser.id) : false,
  }
}

/** Full shape for the startup page. */
export function startupFull(row, currentUser) {
  const base = startupSummary(row, currentUser)
  const applied = currentUser ? appliedTo.all(row.id, currentUser.id).map((a) => a.role_id) : []
  return {
    ...base,
    description: row.description,
    problem: row.problem,
    solution: row.solution,
    started: row.started,
    createdAt: row.created_at,
    links: linksOf.all(row.id),
    blog: postsOf.all(currentUser?.id ?? 0, row.id).map((p) => ({
      id: p.id,
      author: p.author_login,
      avatar: p.author_login[0].toUpperCase(),
      role: p.author_role || 'Team member',
      date: fmtDate(p.created_at),
      title: p.title,
      text: p.text,
      likes: p.likes,
      liked: Boolean(p.liked),
      comments: p.comments,
    })),
    roadmap: roadmapOf.all(row.id).map((s) => ({ id: s.id, title: s.title, date: s.date, status: s.status, text: s.text })),
    updates: updatesOf.all(row.id),
    appliedRoleIds: applied,
  }
}
