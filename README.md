# GigConnect KE

A local classifieds board for gigs & odd-jobs in Kenya — house help, event services, cleaning, driving, retail, hospitality, and general labor. Fast, casual, WhatsApp-first. Built as a static site with a Supabase backend (and a localStorage fallback for demos).

Built procedurally against the specification in [`SPEC.md`](SPEC.md), with progress tracked in [`CHECKPOINTS.md`](CHECKPOINTS.md) and conventions in [`GIT_GUIDE.md`](GIT_GUIDE.md).

---

## Tech Stack

- **Frontend:** Static HTML / CSS / vanilla JS
- **Backend-as-a-Service:** Supabase (Postgres + Auth)
- **Fallback:** localStorage (demo mode — works with zero configuration)
- **Hosting:** Vercel or Netlify (static output)

---

## Quick Start (Demo / Local)

No build step, no dependencies — open the files directly or serve the folder:

```bash
# 1. From the repo root, serve statically (Python or Node)
python3 -m http.server 8080

# or
npx serve .
```

Then open:
- Home: `http://localhost:8080/index.html`
- Admin: `http://localhost:8080/admin.html`

### Demo mode
Without a configured Supabase project the app runs on **localStorage** so all pages are testable immediately. Data persists per-browser.

### Demo admin (localStorage fallback)
- Login with **any non-empty email + password** when the Supabase config is absent. (This is a developer convenience only — replace with real Supabase auth for production.)

---

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `js/supabase-config.example.js` → `js/supabase-config.js` and fill in:
   ```js
   window.SUPABASE_CONFIG = {
     url: 'https://YOUR-PROJECT.supabase.co',
     anonKey: 'YOUR-ANON-KEY',
   };
   ```
   > `js/supabase-config.js` is git-ignored — never commit real keys.
3. Create tables via the Supabase SQL editor (see `supabase.sql` if present), e.g.:
   - `gigs` (matches the listing data model in `SPEC.md`)
   - `reports`
4. Enable **Email** auth provider under Auth → Providers.
5. The app auto-switches from localStorage to Supabase once config is present.

### Auto-expiry job (production)
Because static frontends can't run scheduled jobs, deploy a Supabase **Edge Function** (or cron) that flips `active → expired` daily:

```sql
update gigs set status = 'expired'
where status = 'active' and expiry_date < now();
```

---

## Pages

| Page | Path |
|------|------|
| Home | `index.html` |
| Browse | `browse.html` |
| Gig Detail | `gig.html?id=<id>` |
| Post a Gig | `post.html` |
| Categories | `categories.html?cat=<slug>` |
| How It Works | `how-it-works.html` |
| About | `about.html` |
| Testimonials | `testimonials.html` |
| Contact | `contact.html` |
| Admin | `admin.html` |

---

## Development Rules

- One file / one commit (see `GIT_GUIDE.md`).
- Conventional Commits, squash-merge feature branches to `main`.
- Verify each change against `CHECKPOINTS.md` before marking it passed.
- Never commit secrets or the real `supabase-config.js`.

---

## Project Files

```
css/styles.css          Theme (Emerald/Amber palette, Poppins/Inter)
js/config.js            Categories, colors, storage mode
js/store.js             Data layer (Supabase OR localStorage)
js/main.js              Shared UI (nav, banner, rendering helpers)
js/admin.js             Admin dashboard logic
js/supabase-config.example.js   Placeholder config (copy → real file)
SPEC.md                 Consolidated spec
CHECKPOINTS.md          Milestone progress
GIT_GUIDE.md            Git/commit conventions
```
