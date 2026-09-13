// Validation rules shared by the Express routes (server/src) and the browser adapter (client/src/api.local.js).
// Keep this file free of Node or browser specific code.

export const TOPICS = ['Ideas', 'Tech talk', 'Chill', 'Study group']
export const STAGES = ['Idea', 'MVP', 'Growth']

// Every user-facing rule message, in one place.
export const MESSAGES = {
  meetupTitle: 'Title must have at least 3 letters',
  meetupTopic: 'Unknown topic',
  meetupPlace: 'Place is required',
  meetupDuration: 'Duration must be 5..240 minutes',
  meetupCapacity: 'Capacity must be 2..100',
  meetupStartsAt: 'startsAt is not a valid date',
  meetupEnded: 'This meetup has already ended',
  meetupFull: 'This meetup is full',
  hostCannotLeave: 'The host cannot leave their own meetup',
  meetupNotFound: 'Meetup not found',
  startupName: 'Name must have at least 2 letters',
  startupPitch: 'Pitch must have at least 10 letters',
  startupStage: 'Unknown stage',
  roleName: 'Every role needs a name',
  unknownRole: 'Unknown role',
  alreadyApplied: 'You already applied for this role',
  membersOnly: 'Only team members can write in the blog',
  postInvalid: 'Title (3+) and text (10+) are required',
  commentInvalid: 'Comment must have at least 2 letters',
  startupNotFound: 'Startup not found',
  postNotFound: 'Post not found',
  skillsArray: 'skills must be an array',
}

/** Trims, drops empty strings, removes duplicates, and caps the length. */
export function cleanList(arr, max = 20) {
  if (!Array.isArray(arr)) return []
  return [...new Set(arr.map((s) => String(s).trim()).filter(Boolean))].slice(0, max)
}

/** Compares user skills with the skills the startup needs. Score is 0..1. */
export function matchSkills(roles, userSkills) {
  const needed = [...new Set(roles.flatMap((r) => r.skills))]
  const lower = new Set(userSkills.map((x) => x.toLowerCase()))
  const matched = needed.filter((x) => lower.has(x.toLowerCase()))
  return { needed, matched, score: needed.length ? matched.length / needed.length : 0 }
}

/**
 * Validates the body of "create meetup".
 * Returns { errors: string[], value } where value holds the normalized fields (startsAt is a Date).
 */
export function validateMeetupInput(body) {
  const b = body || {}
  const errors = []
  const title = String(b.title || '').trim()
  if (title.length < 3) errors.push(MESSAGES.meetupTitle)
  if (!TOPICS.includes(b.topic)) errors.push(MESSAGES.meetupTopic)
  const place = String(b.place || '').trim()
  if (!place) errors.push(MESSAGES.meetupPlace)
  const duration = Number(b.duration)
  if (!Number.isInteger(duration) || duration < 5 || duration > 240) errors.push(MESSAGES.meetupDuration)
  const capacity = Number(b.capacity)
  if (!Number.isInteger(capacity) || capacity < 2 || capacity > 100) errors.push(MESSAGES.meetupCapacity)
  let startsAt = new Date()
  if (b.startsAt) {
    startsAt = new Date(b.startsAt)
    if (Number.isNaN(startsAt.getTime())) errors.push(MESSAGES.meetupStartsAt)
  }
  return {
    errors,
    value: { title, topic: b.topic, description: String(b.description || '').trim(), place, duration, capacity, startsAt },
  }
}

/**
 * Validates the body of "create startup".
 * Returns { errors: string[], value }. Slug generation is NOT done here (it depends on the store).
 */
export function validateStartupInput(body) {
  const b = body || {}
  const errors = []
  const name = String(b.name || '').trim()
  if (name.length < 2) errors.push(MESSAGES.startupName)
  const pitch = String(b.pitch || '').trim()
  if (pitch.length < 10) errors.push(MESSAGES.startupPitch)
  if (!STAGES.includes(b.stage)) errors.push(MESSAGES.startupStage)
  const color = /^#[0-9a-f]{6}$/i.test(b.color || '') ? b.color : '#25c1cb'
  const roles = Array.isArray(b.roles) ? b.roles : []
  if (roles.some((r) => !String(r?.role || '').trim())) errors.push(MESSAGES.roleName)
  const links = Array.isArray(b.links) ? b.links.filter((l) => String(l?.label || '').trim() && String(l?.url || '').trim()) : []
  // Computed here even when the name is invalid, so it must not throw on an empty name.
  const logo = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
  return {
    errors,
    value: {
      name,
      pitch,
      description: String(b.description || '').trim(),
      problem: String(b.problem || '').trim(),
      solution: String(b.solution || '').trim(),
      stage: b.stage,
      color,
      logo,
      stack: cleanList(b.stack),
      roles: roles.map((r) => ({ role: String(r?.role || '').trim(), text: String(r?.text || '').trim(), skills: cleanList(r?.skills) })),
      links: links.map((l) => ({ label: String(l?.label || '').trim(), url: String(l?.url || '').trim() })),
    },
  }
}

/** A blog comment. Any user may write one. Returns { errors, value: { text } }. */
export function validateCommentInput(body) {
  const text = String(body?.text || '').trim().slice(0, 1000)
  return { errors: text.length < 2 ? [MESSAGES.commentInvalid] : [], value: { text } }
}

export const BIO_MAX = 500

/**
 * Validates the body of "update profile". Only the fields present in the body are returned in `value`,
 * so a caller can change the bio without touching the skills and the other way round.
 */
export function validateProfileInput(body) {
  const b = body || {}
  const errors = []
  const value = {}
  if ('skills' in b) {
    if (Array.isArray(b.skills)) value.skills = cleanList(b.skills, 30)
    else errors.push(MESSAGES.skillsArray)
  }
  if ('bio' in b) value.bio = String(b.bio ?? '').trim().slice(0, BIO_MAX)
  return { errors, value }
}
