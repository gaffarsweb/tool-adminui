# tool-adminui

Next.js 14 (App Router) admin panel for the OmniTools platform. Separate origin from the public app.

## Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev           # http://localhost:3100
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server on :3100 |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Next ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Current state (Phase 2)

- `/` redirects to `/login`.
- `/login` renders the Stitch LVL-5 gateway visual as a **placeholder only**. No auth logic yet.
- Phase 4 wires real email + password + TOTP against the backend `/auth` endpoints.
