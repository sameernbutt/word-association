# Deployment Guide — Word Association

This document explains how to deploy the Word Association app (frontend + Supabase backend). It covers local build & test, setting up the Supabase database (migrations & realtime), and deploying the frontend to a static host (Vercel or Netlify).

**Overview**
- Frontend: Vite + React (TypeScript). Build output: `dist` (Vite default).
- Backend / DB: Supabase (Postgres). Use the SQL in `supabase/migrations/*.sql` to create tables & policies.
- Environment variables: Vite expects `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## 1. Prerequisites
- Node.js (16+ recommended) and `npm` (or yarn/pnpm).
- A Supabase account and project.
- A hosting provider for the frontend (Vercel, Netlify, Cloudflare Pages, etc.).
- (Optional) Supabase CLI if you prefer applying migrations from the command-line.

## 2. Quick local sanity checks
Open PowerShell in the project root and run:

```powershell
# install deps
npm install

# run dev server
npm run dev
```

If the dev server starts, open the URL printed by Vite (usually `http://localhost:5173`).

To build for production:

```powershell
npm run build
# preview the static build (optional)
npx serve -s dist -l 5173
```

(You can also use `vite preview` if configured in `package.json`.)

---

## 3. Supabase database setup
You must create the tables, RLS policies, and enable realtime (so clients receive updates). There are two ways to apply the migrations:

### A — Using Supabase Dashboard (recommended if you are not familiar with CLI)
1. Create a new project in Supabase (or use an existing one).
2. Go to the **SQL Editor** in the Supabase dashboard.
3. Open `supabase/migrations/20251125045859_create_word_game_tables.sql` from your repo and paste the SQL into the SQL editor.
4. Run the SQL. Confirm the `games`, `players`, and `submissions` tables and RLS policies exist.
5. In the Supabase dashboard find **Database → Realtime** (or **Database → Replication / Publications**). Ensure your application tables are published for replication / realtime events so the client subscriptions receive insert/update events for those tables.
   - If the dashboard exposes a UI to toggle realtime for tables, enable `games`, `players`, and `submissions`.
   - If not, create a publication via SQL: `CREATE PUBLICATION supabase_realtime FOR TABLE games, players, submissions;` (If you run into permission issues, use the Supabase docs for Realtime/Replication guidance.)
6. Go to **Settings → API** and copy:
   - `URL` (the Supabase project URL)
   - `anon` public key (Client key)

> Note: The project must have Realtime enabled for those tables for `supabase-js` realtime `.channel()` subscriptions to work. If you rely on polling as a fallback, that also works but is less efficient.

### B — Using Supabase CLI (advanced)
If you prefer the command-line and have the Supabase CLI installed, consult the Supabase docs for pushing migrations. Typical workflow:

```powershell
# install supabase cli (if not installed). Follow official docs for platform-specific steps.
# login
supabase login
# link to your project (replace <ref>)
supabase link --project-ref <PROJECT_REF>
# apply SQL migration - check CLI docs for exact commands
# You can paste SQL into the dashboard or use migration commands supported by your CLI version
```

If you're unsure about CLI commands, use the Dashboard SQL editor (Section A) — it's straightforward and safe.

---

## 4. Set environment variables (locally)
Create a `.env.local` (not committed) at project root with the Vite env vars (prefix `VITE_`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your_anon_key...
```

Restart the dev server after adding env vars.

---

## 5. Deploy the frontend
You can deploy to Vercel, Netlify, or similar providers. The key is to provide the same environment variables in the hosting provider UI.

### Vercel
1. Import the repo into Vercel (connect GitHub/GitLab/Bitbucket).
2. Configure project build settings (Vercel usually auto-detects Vite):
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add Environment Variables in Vercel dashboard (Production and Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. Vercel will run the build and publish the site.

### Netlify
1. Create a new site from Git -> Repository.
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Site settings -> Build & deploy -> Environment.
5. Deploy.

### Cloudflare Pages / Other static hosts
Same idea: set `npm run build` and publish `dist`. Add the `VITE_` env vars in the host settings.

---

## 6. Post-deploy checklist
- Ensure the hosted site has the correct `VITE_SUPABASE_*` env vars.
- Test two browser windows (or two devices) joining the same `?game=<gameId>` link and confirm realtime updates (players joining, submissions, and next words are synchronized).
- If realtime events do not arrive:
  - Confirm Supabase Realtime/Publication is enabled for `games`, `players`, `submissions` tables.
  - Check browser console for network errors or incorrect anon key.
  - If using polling fallback in the app, ensure it runs (should still work if Realtime is not enabled).

---

## 7. Useful troubleshooting tips
- Console logs: open browser devtools and look at the debug overlay (this app logs important events to the fixed debug panel).
- Supabase logs: use the Supabase dashboard to inspect recent queries and realtime errors.
- CORS / network errors: make sure the Supabase project URL and anon key are correct and that the client URL is not blocked.

---

## 8. (Optional) Continuous Integration
- For automatic deploys on push, connect your Git repo to Vercel/Netlify; they will handle deploys automatically.
- Put production env vars in the host's environment settings (do not commit `.env` to git).

---

## 9. Security & production considerations
- Do not expose secret service_role keys to the frontend. The frontend should only use the `anon` public key.
- Consider enabling authentication if you want players to have persistent accounts.
- For production realtime, prefer enabling proper publications (via Supabase) instead of long-running polling.
- Review RLS policies closely to avoid accidentally allowing unsafe operations.

---

## 10. Next steps I can help with
- Add a GitHub Actions workflow that runs `npm run build` and deploys to a host.
- Help enable Realtime publications in your Supabase project and verify subscriptions.
- Fix lint errors (unused imports) and run `npm run dev` to reproduce the `Exit Code: 1` problem you saw.

If you want, I can also run `npm run build` locally here and capture any build errors, or generate a small GitHub Actions YAML for automatic deploys — tell me which option you prefer.
