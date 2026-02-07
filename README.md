<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This repo is organized as a **monorepo** with:

- **`/frontend`** – React + Vite + TypeScript UI (Indira IT Help Desk)
- **`/backend`** – Node.js + Express API + PostgreSQL

View your app in AI Studio: https://ai.studio/apps/drive/12Pd5Jmuh4ADCavoS0ORzVM0wYQ2_qOWf

## Project structure

```
Ticketing-Tool-PSG/
├── frontend/          # UI: React, Vite, components, services
│   ├── components/
│   ├── services/
│   ├── index.html
│   ├── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/           # API: Express, routes, DB
│   ├── database/     # schema.sql, seed.sql, migrations
│   ├── index.js
│   ├── db.js
│   └── package.json
├── docs/
└── package.json      # Root scripts (install:all, dev:frontend, dev:backend)
```

## Run locally

**Prerequisites:** Node.js (v18+ recommended)

### 1. Install dependencies

From the **project root**:

```bash
npm run install:all
```

Or manually:

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Frontend only (mock data / localStorage)

1. **Optional – Gemini API key** (for AI triage/suggestions):  
   In `frontend/` create `.env` or `.env.local` (see `frontend/.env.example`):

   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

2. Start the frontend:

   ```bash
   npm run dev:frontend
   ```
   Or: `cd frontend && npm run dev`

   App runs at **http://localhost:3000**.

### 3. Frontend + Backend (PostgreSQL)

1. Set up PostgreSQL and create the database (see **[docs/POSTGRES_SETUP.md](docs/POSTGRES_SETUP.md)**).
2. Run schema and seed from **project root**:
   ```bash
   psql -U postgres -d ticketing_tool -f backend/database/schema.sql
   psql -U postgres -d ticketing_tool -f backend/database/seed.sql
   ```
3. In **`backend/`**: copy `.env.example` to `.env`, set your DB connection and `PORT=4000`, then:
   ```bash
   npm run dev:backend
   ```
   Or: `cd backend && npm start`
4. In **`frontend/`**: create `.env` or `.env.local` with:
   ```env
   VITE_API_URL=http://localhost:4000
   GEMINI_API_KEY=your_key_if_you_want_ai
   ```
5. Start the frontend:
   ```bash
   npm run dev:frontend
   ```

The app will use the API and PostgreSQL.

### Login (mock users)

When using the backend seed data, use (password for all: `password123`):

| Role      | Email              | Password    |
|-----------|--------------------|-------------|
| Admin     | alice@helix.com    | password123 |
| Requester | charlie@helix.com  | password123 |
| Assignee  | bob@helix.com      | password123 |

Mock user list is also in `frontend/services/mockData.ts`.

### Commands summary

| Command | Description |
|--------|-------------|
| `npm run install:all` | Install root + frontend + backend deps |
| `npm run dev:frontend` | Start Vite dev server (frontend) |
| `npm run dev:backend` | Start Express API (backend) |
| `npm run build:frontend` | Build frontend for production |
| `npm run start:frontend` | Serve frontend build (preview) |
| `npm run start:backend` | Start backend API |

From inside `frontend/`: `npm run dev`, `npm run build`, `npm run preview`.  
From inside `backend/`: `npm start`.

### Troubleshooting

- **EPERM / permission errors:** The project is under OneDrive; sync can lock files during `npm install`. Try pausing OneDrive sync or copying the project to a local folder (e.g. `C:\dev\Ticketing-Tool-PSG`).
- **Port 3000 in use:** Change `server.port` in `frontend/vite.config.ts` or use another port.
- **Backend not connecting:** Ensure `backend/.env` has correct `PG_*` or `DATABASE_URL` and that PostgreSQL is running.

### Optional: Remove old layout after verifying new structure

If you previously had frontend files in the project root and the API in `server/`, you can remove them after confirming that `frontend/` and `backend/` work:

- Remove root-level: `App.tsx`, `index.tsx`, `index.html`, `index.css`, `vite.config.ts`, `tsconfig.json`, `types.ts`, `metadata.json`, `components/`, `services/` (only if they duplicate `frontend/`).
- Remove the `server/` folder (after copying `server/.env` to `backend/.env` if you use PostgreSQL).
- Remove root `package.json` and `package-lock.json` only if you no longer need the root scripts; otherwise keep the root `package.json` that has `install:all`, `dev:frontend`, `dev:backend`.
