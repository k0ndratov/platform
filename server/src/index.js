// Local / Docker entry point: the API plus the built frontend on one port.
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { app } from './app.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000

// Serve the built Vue app (client/dist) and send index.html for SPA routes
const clientDist = process.env.CLIENT_DIST || path.join(__dirname, '..', '..', 'client', 'dist')
app.use(express.static(clientDist))
app.get(/^\/(?!api).*/, (req, res, next) => {
  res.sendFile(path.join(clientDist, 'index.html'), (err) => (err ? next() : null))
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
