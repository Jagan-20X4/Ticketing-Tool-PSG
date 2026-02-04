<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/12Pd5Jmuh4ADCavoS0ORzVM0wYQ2_qOWf

## Run Locally

**Prerequisites:** Node.js (v18+ recommended)

### Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set the Gemini API key** (optional for AI features like chat triage)
   - Open `.env.local` in the project root.
   - Replace `PLACEHOLDER_API_KEY` with your [Gemini API key](https://ai.google.dev/):
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
   - If you leave the placeholder, the app still runs; AI triage/suggestions will fail gracefully.

3. **Start the dev server**
   ```bash
   npm run dev
   ```
   - App runs at **http://localhost:3000** (or the port shown in the terminal).

### Login (mock users)

Use any of these from `services/mockData.ts` (password for all: `password123`):

| Role      | Email                     | Password    |
|-----------|---------------------------|-------------|
| Admin     | alice@helix.com           | password123 |
| Requester | charlie@helix.com        | password123 |
| Assignee  | bob@helix.com            | password123 |

### Using PostgreSQL (save data to a database)

To store all data (tickets, users, etc.) in a **PostgreSQL** database instead of localStorage:

1. Install PostgreSQL and create a database (see **[docs/POSTGRES_SETUP.md](docs/POSTGRES_SETUP.md)** for full steps).
2. Run the schema and seed: `psql -U postgres -d ticketing_tool -f database/schema.sql` then `database/seed.sql`.
3. In the `server/` folder: add a `.env` with your DB connection, run `npm install`, then `npm start`.
4. In the project root `.env.local`, add: **`VITE_API_URL=http://localhost:4000`**.
5. Run the frontend with `npm run dev`. The app will use the API and PostgreSQL.

See **[docs/POSTGRES_SETUP.md](docs/POSTGRES_SETUP.md)** for the complete scratch process (install Postgres, create DB, schema, seed, connect app).

### Other commands

- **Build for production:** `npm run build`
- **Preview production build:** `npm run preview`

### Troubleshooting

- **EPERM / permission errors:** The project is under OneDrive; sync can lock files during `npm install`. Try:
  - Pausing OneDrive sync, or
  - Copying the project to a local folder (e.g. `C:\dev\Ticketing-Tool-PSG`) and running there.
- **Port 3000 in use:** Change `server.port` in `vite.config.ts` or set `PORT=3001 npm run dev` (if your shell supports it).
