# PostgreSQL Setup – Full Scratch Guide

This guide walks you through setting up PostgreSQL for the Ticketing Tool from scratch, then connecting the app so all data is saved to the database.

---

## What You’ll Have When Done

- A **PostgreSQL database** named `ticketing_tool` with all tables and seed data.
- A **Node.js API server** that reads/writes this database.
- The **React frontend** talking to the API so every change (tickets, users, etc.) is stored in PostgreSQL.

---

## Step 1: Install PostgreSQL on Your Machine

### Windows

1. Download the installer from: https://www.postgresql.org/download/windows/
2. Run the installer. Remember the **password** you set for the `postgres` user.
3. Keep default port **5432** unless you need another.
4. Optionally install **pgAdmin** (GUI) from the same installer.
5. Ensure PostgreSQL is running (Services → “postgresql-x64-*” or from Start menu).

### macOS (Homebrew)

```bash
brew install postgresql@16
brew services start postgresql@16
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## Step 2: Create the Database and (Optional) User

Open a terminal or **psql** (or pgAdmin Query Tool).

**Option A – Use default `postgres` user**

```bash
# Connect as postgres (Windows: use "psql -U postgres" from PostgreSQL menu or add bin to PATH)
psql -U postgres
```

In the `psql` prompt:

```sql
CREATE DATABASE ticketing_tool;
\q
```

**Option B – Create a dedicated user and database**

```bash
psql -U postgres
```

```sql
CREATE USER ticketing_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE ticketing_tool OWNER ticketing_user;
\q
```

Use `ticketing_user` / `your_secure_password` in the API server config instead of `postgres`.

---

## Step 3: Run the Schema (Create All Tables)

From the **project root** (where `package.json` and `database/` live):

**Windows (PowerShell):**

```powershell
cd "c:\Users\jagan.subudhi\OneDrive - Indira IVF\Desktop\Ticketing-Tool-PSG"
$env:PGPASSWORD = "postgres"   # or your postgres password
psql -U postgres -d ticketing_tool -f database/schema.sql
```

**If you created a user (Option B):**

```powershell
$env:PGPASSWORD = "your_secure_password"
psql -U ticketing_user -d ticketing_tool -h localhost -f database/schema.sql
```

**macOS/Linux:**

```bash
cd /path/to/Ticketing-Tool-PSG
PGPASSWORD=postgres psql -U postgres -d ticketing_tool -f database/schema.sql
```

You should see `CREATE TABLE` messages. Tables created: `departments`, `applications`, `users`, `issue_master`, `issue_assignees`, `sla_master`, `workflow_rules`, `patients`, `tickets`, `ticket_comments`, `ticket_attachments`.

---

## Step 4: Load Seed Data (Optional but Recommended)

Seed data adds sample users, applications, issues, SLA rules, etc., so you can log in and use the app immediately.

**Windows (PowerShell):**

```powershell
psql -U postgres -d ticketing_tool -f database/seed.sql
```

**macOS/Linux:**

```bash
PGPASSWORD=postgres psql -U postgres -d ticketing_tool -f database/seed.sql
```

After this you can log in with e.g. **alice@helix.com** / **password123**.

---

## Step 5: Configure and Start the API Server

1. Go to the `server` folder and install dependencies:

   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file in `server/` (copy from `.env.example`):

   **Windows (PowerShell) – create `server\.env`:**

   ```env
   PG_HOST=localhost
   PG_PORT=5432
   PG_DATABASE=ticketing_tool
   PG_USER=postgres
   PG_PASSWORD=postgres
   PORT=4000
   ```

   If you created a user in Step 2, set `PG_USER=ticketing_user` and `PG_PASSWORD=your_secure_password`.

   **Or use a single URL:**

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ticketing_tool
   PORT=4000
   ```

3. Start the API:

   ```bash
   npm start
   ```

   You should see: `Ticketing API running at http://localhost:4000`.

4. Quick check: open http://localhost:4000/api/health in a browser. You should get something like `{"ok":true,"database":"connected"}`.

---

## Step 6: Connect the Frontend to the API

1. In the **project root** (not inside `server`), open or create **`.env.local`**.

2. Add the API base URL (so the app uses PostgreSQL instead of only localStorage):

   ```env
   VITE_API_URL=http://localhost:4000
   GEMINI_API_KEY=your_gemini_key_if_you_use_ai
   ```

3. Start the frontend:

   ```bash
   cd "c:\Users\jagan.subudhi\OneDrive - Indira IVF\Desktop\Ticketing-Tool-PSG"
   npm run dev
   ```

4. Open http://localhost:3000 (or the URL Vite prints). Log in with **alice@helix.com** / **password123**. Create a ticket, add a comment, add a user in Admin – all of that will be stored in PostgreSQL.

---

## Step 7: Run Both Together (Daily Use)

You need **two terminals**:

**Terminal 1 – API (PostgreSQL):**

```bash
cd server
npm start
```

**Terminal 2 – Frontend:**

```bash
cd "c:\Users\jagan.subudhi\OneDrive - Indira IVF\Desktop\Ticketing-Tool-PSG"
npm run dev
```

Then use the app at http://localhost:3000. All changes go to PostgreSQL.

---

## Summary Checklist

| Step | Action |
|------|--------|
| 1 | Install PostgreSQL; note user and password |
| 2 | Create database: `CREATE DATABASE ticketing_tool;` (and optional user) |
| 3 | Run `database/schema.sql` with `psql -U postgres -d ticketing_tool -f database/schema.sql` |
| 4 | Run `database/seed.sql` for sample data |
| 5 | In `server/`: add `server/.env` (DB connection + PORT=4000), `npm install`, `npm start` |
| 6 | In project root: add `VITE_API_URL=http://localhost:4000` to `.env.local`, then `npm run dev` |
| 7 | Use two terminals: one for API, one for frontend |

---

## Troubleshooting

- **“password authentication failed”**  
  Check `PG_USER` and `PG_PASSWORD` in `server/.env`. On Windows, if you didn’t set a postgres password, try leaving `PG_PASSWORD` empty or the one you set during install.

- **“database ticketing_tool does not exist”**  
  Run Step 2 again and create the database, then rerun schema (Step 3).

- **“relation does not exist”**  
  Run `database/schema.sql` again against `ticketing_tool`.

- **Frontend still uses only localStorage**  
  Ensure `.env.local` in the **project root** contains `VITE_API_URL=http://localhost:4000` and that you restarted `npm run dev` after adding it.

- **CORS or connection refused**  
  Start the API first (`cd server && npm start`), then the frontend. Use the same host/port in `VITE_API_URL` as where the API runs (e.g. `http://localhost:4000`).

---

## Switching Back to Local-Only (No Database)

To use the app without PostgreSQL again:

1. Remove or comment out `VITE_API_URL` in `.env.local` (or delete the line).
2. Restart the frontend (`npm run dev`). The app will use in-memory state and localStorage again.
