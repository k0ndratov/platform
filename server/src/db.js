// SQLite database via Node's built-in module. One file: server/data/school21.db
import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { seed } from './seed.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// On Vercel the file system is read-only except /tmp, so the database lives there.
// It is re-created (and re-seeded) when the function starts cold. Fine for a demo.
const DB_PATH =
  process.env.DB_PATH || (process.env.VERCEL ? '/tmp/school21.db' : path.join(__dirname, '..', 'data', 'school21.db'))

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

export const db = new DatabaseSync(DB_PATH)
db.exec('PRAGMA foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    login TEXT NOT NULL UNIQUE,
    program TEXT,
    cohort TEXT,
    level INTEGER DEFAULT 1,
    level_progress INTEGER DEFAULT 0,
    campus TEXT,
    skills TEXT DEFAULT '[]'          -- JSON array of strings
  );

  CREATE TABLE IF NOT EXISTS meetups (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    description TEXT DEFAULT '',
    place TEXT NOT NULL,
    starts_at TEXT NOT NULL,          -- ISO date string
    duration INTEGER NOT NULL,        -- minutes
    capacity INTEGER NOT NULL,
    host_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS meetup_members (
    meetup_id INTEGER NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    PRIMARY KEY (meetup_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS startups (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    pitch TEXT NOT NULL,
    description TEXT DEFAULT '',
    problem TEXT DEFAULT '',
    solution TEXT DEFAULT '',
    stage TEXT NOT NULL,              -- Idea | MVP | Growth
    started TEXT,
    stack TEXT DEFAULT '[]',          -- JSON array
    color TEXT NOT NULL,
    logo TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS startup_members (
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    role TEXT DEFAULT '',
    is_founder INTEGER DEFAULT 0,
    PRIMARY KEY (startup_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS startup_roles (
    id INTEGER PRIMARY KEY,
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    text TEXT DEFAULT '',
    skills TEXT DEFAULT '[]'          -- JSON array
  );

  CREATE TABLE IF NOT EXISTS startup_links (
    id INTEGER PRIMARY KEY,
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    url TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS startup_posts (
    id INTEGER PRIMARY KEY,
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    comments INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS post_likes (
    post_id INTEGER NOT NULL REFERENCES startup_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    PRIMARY KEY (post_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS startup_roadmap (
    id INTEGER PRIMARY KEY,
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TEXT,
    status TEXT NOT NULL,             -- done | in-progress | planned
    text TEXT DEFAULT '',
    position INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS startup_updates (
    id INTEGER PRIMARY KEY,
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    text TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS startup_applications (
    id INTEGER PRIMARY KEY,
    startup_id INTEGER NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES startup_roles(id) ON DELETE SET NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
`)

// Seed once, when the users table is empty
const count = db.prepare('SELECT COUNT(*) AS n FROM users').get().n
if (count === 0) {
  seed(db)
  console.log('Database seeded with demo data')
}

// Small helpers
export const parseJson = (s, fallback = []) => {
  try {
    return s ? JSON.parse(s) : fallback
  } catch {
    return fallback
  }
}
export const toJson = (v) => JSON.stringify(v ?? [])
