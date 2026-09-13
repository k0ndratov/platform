# School 21 platform: meetups & startups

Vue 3 (Vite) frontend + Express backend + SQLite (Node's built-in `node:sqlite`).

**Live demo:** https://platform-nine-roan-19.vercel.app
(static build, data is stored in your browser and is not shared between visitors)

## Run in development

```bash
npm install
npm run dev
```

- Client: http://localhost:5173 (proxies `/api` to the server)
- API: http://localhost:3000

The database file is `server/data/school21.db`. It is created and seeded with demo data on the first start.
Delete the file to reset the data.

## Run with Docker

```bash
docker compose up --build
```

Open http://localhost:3000. The Express server serves the built frontend and the API from one port.
The database is kept in the `db-data` volume.

## Tests

```bash
npm test                # server + client
npm test -w server      # node:test, in-memory SQLite (DB_PATH=:memory:)
npm test -w client      # Vitest + jsdom + @vue/test-utils
```

- `server/test/` – HTTP tests through the real Express app on a random port, one process per file with a fresh
  in-memory database. `server/test-utils/harness.js` starts the app and checks that `server/data/school21.db`
  is never touched.
- `client/src/**/*.test.js` – the browser adapter (`api.local.js`), the API mode switch, and the components.
- `shared/rules.js` – validation messages and rules used by both the server and the browser adapter, so tests
  import the messages instead of retyping them.
- CI: `.github/workflows/test.yml` runs `npm ci`, `npm test`, and `npm run build` on every push.

## Structure

- `client/` – Vue app
  - `src/pages` – Dashboard, Meetups, MeetupNew, Startups, Startup, StartupNew, Project, Placeholder
  - `src/components` – shared UI (cards, header, modal, toast, tag input)
  - `src/composables` – `useUser` (current user), `useToast`
  - `src/api.js` – fetch wrapper for the API
  - `src/styles/tokens.css` – design tokens (colors, fonts, radii)
- `server/` – Express API
  - `src/db.js` – opens SQLite, creates tables, seeds once
  - `src/seed.js` – demo data
  - `src/routes/` – `me`, `meetups`, `startups`
  - `src/serializers.js` – turns rows into JSON for the client

## API

There is no login yet. The current user is user #1. Send `X-User-Id: <id>` to act as another user.

| Method | Path | What it does |
|---|---|---|
| GET | `/api/me` | current user |
| PUT | `/api/me/skills` | replace skills `{ skills: [] }` |
| GET | `/api/meetups` | `{ live, upcoming, ended }` |
| POST | `/api/meetups` | create meetup |
| POST / DELETE | `/api/meetups/:id/join` | join / leave |
| GET | `/api/startups?stage=&q=` | list with skill match |
| GET | `/api/startups/recommended` | sorted by skill match |
| GET | `/api/startups/:slug` | full startup |
| POST | `/api/startups` | create startup |
| POST | `/api/startups/:slug/apply` | apply to a role or message the founder |
| POST | `/api/startups/:slug/posts` | blog post (team members only) |
| POST | `/api/startups/:slug/posts/:id/like` | toggle like |

## Deploy to Vercel (free static demo)

The Vercel build sets `VITE_API_MODE=local`. In this mode there is no server at all:
the app runs the same rules in the browser and keeps the data in `localStorage`.
Every visitor has their own copy of the data. It survives reloads, but it is not shared between people.

```bash
npm i -g vercel
vercel login
vercel --prod
```

To try this mode locally: `VITE_API_MODE=local npm run dev -w client`.

## Shared demo data

`shared/demo-data.js` holds the demo users, meetups, and startups. The server seeds SQLite from it,
and the browser mode seeds `localStorage` from it, so both modes show the same content.
