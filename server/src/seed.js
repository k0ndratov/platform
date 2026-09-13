// Seeds the SQLite database with the demo data from shared/demo-data.js. Runs once when the database is empty.
import { demoUsers, demoMeetups, demoStartups, hoursAfter } from '../../shared/demo-data.js'

const minutes = (n) => new Date(Date.now() + n * 60_000).toISOString()

export function seed(db) {
  const insertUser = db.prepare(
    'INSERT INTO users (login, program, cohort, level, level_progress, campus, skills, bio) VALUES (?,?,?,?,?,?,?,?)',
  )
  const id = {}
  for (const [login, program, cohort, level, levelProgress, campus, skills, bio = ''] of demoUsers) {
    id[login] = Number(insertUser.run(login, program, cohort, level, levelProgress, campus, JSON.stringify(skills), bio).lastInsertRowid)
  }

  // ---- Meetups ----
  const insertMeetup = db.prepare(
    'INSERT INTO meetups (title, topic, description, place, starts_at, duration, capacity, host_id) VALUES (?,?,?,?,?,?,?,?)',
  )
  const addMember = db.prepare('INSERT OR IGNORE INTO meetup_members (meetup_id, user_id) VALUES (?,?)')
  for (const [title, topic, desc, place, offset, dur, cap, host, members] of demoMeetups) {
    const mid = Number(insertMeetup.run(title, topic, desc, place, minutes(offset), dur, cap, id[host]).lastInsertRowid)
    addMember.run(mid, id[host])
    for (const m of members) addMember.run(mid, id[m])
  }

  // ---- Startups ----
  const insertStartup = db.prepare(
    'INSERT INTO startups (slug, name, pitch, description, problem, solution, stage, started, stack, color, logo, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
  )
  const insertMember = db.prepare('INSERT INTO startup_members (startup_id, user_id, role, is_founder) VALUES (?,?,?,?)')
  const insertRole = db.prepare('INSERT INTO startup_roles (startup_id, role, text, skills) VALUES (?,?,?,?)')
  const insertLink = db.prepare('INSERT INTO startup_links (startup_id, label, url) VALUES (?,?,?)')
  const insertPost = db.prepare('INSERT INTO startup_posts (startup_id, author_id, title, text, created_at) VALUES (?,?,?,?,?)')
  const insertComment = db.prepare('INSERT INTO post_comments (post_id, author_id, text, created_at) VALUES (?,?,?,?)')
  const insertLike = db.prepare('INSERT OR IGNORE INTO post_likes (post_id, user_id) VALUES (?,?)')
  const insertStep = db.prepare('INSERT INTO startup_roadmap (startup_id, title, date, status, text, position) VALUES (?,?,?,?,?,?)')
  const insertUpdate = db.prepare('INSERT INTO startup_updates (startup_id, date, text) VALUES (?,?,?)')

  const allUserIds = Object.values(id)
  for (const s of demoStartups) {
    const founder = s.members[0][0]
    const sid = Number(
      insertStartup.run(s.slug, s.name, s.pitch, s.description, s.problem, s.solution, s.stage, s.started, JSON.stringify(s.stack), s.color, s.logo, id[founder]).lastInsertRowid,
    )
    for (const [login, role, isFounder] of s.members) insertMember.run(sid, id[login], role, isFounder)
    for (const [role, text, skills] of s.roles) insertRole.run(sid, role, text, JSON.stringify(skills))
    for (const [label, url] of s.links) insertLink.run(sid, label, url)
    for (const [author, title, text, comments, createdAt, likes] of s.posts) {
      const pid = Number(insertPost.run(sid, id[author], title, text, createdAt).lastInsertRowid)
      // fake likes: first N users, skipping the author
      allUserIds.filter((u) => u !== id[author]).slice(0, likes).forEach((u) => insertLike.run(pid, u))
      // if we do not have enough users, likes will be smaller. Fine for a demo.
      for (const [login, body, hours] of comments) insertComment.run(pid, id[login], body, hoursAfter(createdAt, hours))
    }
    s.roadmap.forEach(([title, date, status, text], i) => insertStep.run(sid, title, date, status, text, i))
    for (const [date, text] of s.updates) insertUpdate.run(sid, date, text)
  }
}
