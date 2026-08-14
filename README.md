# Daily Discipline 📔

Your paper diary, digitized — daily habit checklist (✓/✗), tasks, Regret / Achievement / Take of the Day, plus streaks, heatmap and analytics.

Built with **React + Vite + Tailwind + Three.js + Recharts + Supabase**.

---

## 1. Run locally (no setup needed)

```bash
cd daily-discipline
npm install
npm run dev
```

Open http://localhost:5173. In **local mode** everything is saved in your browser's localStorage — no login, no database. Start journaling immediately.

## 2. Connect Supabase (cloud sync + login)

1. Create a free project at https://supabase.com
2. In the dashboard, open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it once.
3. Go to **Project Settings → API** and copy the *Project URL* and *anon public key*.
4. Copy `.env.example` to `.env` and fill in:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Restart `npm run dev`. The app now shows an email sign-in screen and stores everything in Supabase (protected per-user by Row Level Security).

> Tip: in Supabase **Authentication → Providers → Email**, you can turn off "Confirm email" to skip the confirmation step since it's a personal app.

## 3. Deploy (Vercel or Netlify)

Push the folder to a GitHub repo, then:

**Vercel:** Import the repo → Framework: Vite → add the two `VITE_...` environment variables → Deploy.

**Netlify:** New site from Git → Build command `npm run build`, publish directory `dist` → add the two `VITE_...` environment variables → Deploy.

For client-side routing add a redirect:
- Netlify: create `public/_redirects` containing `/* /index.html 200`
- Vercel: create `vercel.json` containing `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`

(Both files are already included in this project.)

## Features

- **Today** — diary-style page: challenge day (e.g. 17/30), habits & tasks with ( ✓ ) / ( ✗ ) toggles (tap to cycle blank → ✓ → ✗), mood, photo attachments, Regret / Achievement / Take of the Day. Auto-saves.
- **History** — 28-day color strip + date picker; open and edit any past day, plus an "on this day" lookback at past years.
- **Analytics** — perfect-day streaks, ~4-month consistency heatmap, year-in-pixels mood grid, 30-day completion trend, per-habit success rates and streak table, and mood-vs-habit correlations.
- **Settings** — add/remove/reorder habits & tasks, challenge name/length/start date, reminder time, and data export/restore (JSON backup, CSV for spreadsheets). Comes pre-filled with your current 10 items.
- **Extras** — dark mode, mobile bottom nav, installable PWA manifest, Three.js particle background.

## Project structure

```
src/
  lib/config.js      ← Supabase keys read from env (empty = local mode)
  lib/storage.js     ← storage adapter: localStorage ⇄ Supabase
  lib/defaults.js    ← your default habits & challenge
  lib/stats.js       ← streaks / rates / heatmap math
  components/        ← EntryEditor (diary page), Layout, Auth, 3D background
  pages/             ← Today, History, Analytics, Settings
supabase/schema.sql  ← run once in Supabase SQL Editor
```
