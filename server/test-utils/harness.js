// Test harness for the Express app.
// Lives outside test/ so `node --test 'test/**/*.test.js'` never runs it as a test.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REAL_DB = path.join(__dirname, '..', 'data', 'school21.db')

function fingerprint() {
  if (!fs.existsSync(REAL_DB)) return 'absent'
  const buf = fs.readFileSync(REAL_DB)
  return `${buf.length}:${crypto.createHash('sha256').update(buf).digest('hex')}`
}

/**
 * Starts the app on a random port with an in-memory database.
 * Returns { request, close, db }.
 */
export async function start() {
  // Preventive guard: the DB module reads DB_PATH at import time, so it must be set before any server module loads.
  assert.equal(process.env.DB_PATH, ':memory:', 'DB_PATH must be ":memory:" for tests (see server/package.json test script)')
  const before = fingerprint()

  const { app } = await import('../src/app.js')
  const { db } = await import('../src/db.js')
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s))
  })
  const base = `http://127.0.0.1:${server.address().port}`

  async function request(method, urlPath, { body, userId } = {}) {
    const headers = {}
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (userId !== undefined) headers['X-User-Id'] = String(userId)
    const res = await fetch(base + urlPath, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
    const text = await res.text()
    let json = null
    try {
      json = text ? JSON.parse(text) : null
    } catch {
      json = text
    }
    return { status: res.status, json }
  }

  async function close() {
    await new Promise((resolve) => server.close(resolve))
    // Detector: the real database file must be exactly as it was (or still absent, e.g. in CI).
    assert.equal(fingerprint(), before, 'tests must not touch server/data/school21.db')
  }

  return { request, close, db, base }
}
