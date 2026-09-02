# GigConnect KE

A **local classifieds board for gigs & odd-jobs in Kenya** — house help, event services, cleaning, driving, retail, hospitality, security and general labor. Fast, casual and WhatsApp-first. Not a corporate job board: post "need house help for 3 days" or "2 people to decorate a wedding tent Saturday", connect via WhatsApp, done.

Built procedurally against the design guides and spec, with **one file = one commit** and **every milestone verified and tracked** before being marked complete.

**Repository:** `github.com/kevwasonga/gigs` · **Branch:** `main` (29 commits)

---

## Table of Contents

1. [What This App Does](#1-what-this-app-does)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Quick Start (Demo / Local)](#4-quick-start-demo--local)
5. [Pages & Features](#5-pages--features)
6. [Data Model](#6-data-model)
7. [Category Taxonomy](#7-category-taxonomy)
8. [Admin Panel](#8-admin-panel)
9. [Listing Lifecycle & Auto-Expiry](#9-listing-lifecycle--auto-expiry)
10. [Trust & Safety](#10-trust--safety)
11. [Connecting Supabase](#11-connecting-supabase)
12. [Deployment](#12-deployment)
13. [Verification / How It Was Tested](#13-verification--how-it-was-tested)
14. [Development Rules](#14-development-rules)
15. [Supporting Documents](#15-supporting-documents)
16. [Roadmap / Out of Scope for v1](#16-roadmap--out-of-scope-for-v1)

---

## 1. What This App Does

GigConnect KE bridges two gaps:

- **Job seekers** get a fast, low-friction way to find one-off gigs, recurring part-time work, and occasional full-time roles — without CV submissions or account walls.
- **Employers** get trusted, local help quickly — house help, event staff, cleaners, riders, cashiers — with listing management and moderation tools so the board stays fresh and scam-free.

**Design personality:** approachable, fast-moving, credible, optimistic. Mobile-first (the majority of the audience is mobile-only). Emeralds for trust, amber for opportunity.

---

## 2. Tech Stack

| Concern | Choice | Notes |
|---------|--------|-------|
| Frontend | Static HTML / CSS / vanilla JS | No build step, no framework, instant load |
| Backend-as-a-Service | **Supabase** (Postgres + Auth) | Real multi-user persistence when configured |
| Data fallback | **localStorage** (demo mode) | Works with zero config so everything is testable |
| Auth (admin) | Supabase email/password | Single super-admin; demo fallback for local dev |
| Hosting target | Vercel / Netlify (static) | See [Deployment](#12-deployment) |
| Typography | Poppins (headings), Inter (body) | Google Fonts |
| Supabase client | v2 via jsDelivr CDN | Loaded per-page |

**Key design decision:** the app auto-detects whether Supabase is configured. If `js/supabase-config.js` exists with real values, it uses Supabase; otherwise it transparently falls back to localStorage (demo mode). Same UI, same code path — just a different storage backend.

---

## 3. Project Structure

```
gigs/
├── index.html              Home / landing
├── browse.html             Filterable listing page
├── gig.html                Gig detail (+ report form)
├── post.html               Post a Gig (employer form)
├── categories.html         Category landing pages
├── how-it-works.html       Explainer + safety tips
├── about.html              About / trust page
├── testimonials.html       Success stories
├── contact.html            Contact / report + WhatsApp form
├── admin.html              Admin dashboard (protected)
│
├── css/
│   └── styles.css          Core theme (full palette + typography)
│
├── js/
│   ├── supabase-config.example.js  Config template (copy → real file)
│   ├── config.js           Categories, colors, job types, storage mode
│   ├── store.js            Data layer (Supabase OR localStorage) + seed
│   ├── main.js             Shared UI (nav, footer, banner, card renderer)
│   ├── home.js             Home page rendering
│   ├── browse.js           Browse + filtering logic
│   ├── gig.js              Detail rendering, apply + report
│   ├── post.js             Post form validation + submission
│   ├── categories.js       Category index + per-category listing
│   └── admin.js            Auth, dashboard, table, actions, bulk, reports
│
├── supabase.sql            DB schema (gigs, reports) + RLS policies
│
├── README.md               This file
├── SPEC.md                 Consolidated project spec
├── CHECKPOINTS.md          Milestone progress tracker
├── GIT_GUIDE.md            Git/commit conventions
└── .gitignore              Ignores env, build, OS/editor junk
```

---

## 4. Quick Start (Demo / Local)

No build step and no dependencies. Serve the folder statically:

```bash
# from the repo root
python3 -m http.server 8080
# or
npx serve .
```

Then open the UI:

| Page | URL |
|------|-----|
| Home | `http://localhost:8080/index.html` |
| Browse | `http://localhost:8080/browse.html` |
| Post a Gig | `http://localhost:8080/post.html` |
| Admin | `http://localhost:8080/admin.html` |

> Current running instance (if the dev server is up): `http://localhost:8123/index.html`

**Demo mode default:** because `js/supabase-config.js` is not present, the app runs on **localStorage**. Five realistic seed gigs load automatically (house help, event decorators, cashier, deep clean, delivery rider). All pages, posting, admin, and reporting are fully functional against localStorage. Data persists per-browser.

**Demo admin login:** in demo mode, enter **any non-empty email + any non-empty password**. This is a developer convenience only — replace with real Supabase auth for production.

---

## 5. Pages & Features

### Home — `index.html` + `js/home.js`
- Hero with headline + **Post a Gig** (amber) / **Find Work** (secondary) CTAs
- Global search bar: keyword + category dropdown → routes to `browse.html?q=…&cat=…`
- Stats strip: gigs posted, open right now, hiring employers, placements made
- **Featured & urgent** gigs carousel grid (amber-tinted featured cards, `Featured` ribbon)
- Category grid with live open-gig counts
- Latest gigs section

### Browse — `browse.html` + `js/browse.js`
- Reads `?q=` and `?cat=` URL params (from home search) and pre-fills filters
- Filter sidebar: **keyword, category, job type, location**
- Renders active gigs as cards (title, category chip, location, date-needed, posted time, pay, description preview, job-type chip, View button)
- Live result count and empty state

### Gig Detail — `gig.html` + `js/gig.js`
- Renders a single listing from `?id=<id>`
- Status chip (Open / Featured / Expired), full metadata grid (pay, job type, contact, people needed, duration, posted by)
- **Apply on WhatsApp** button (auto-builds a `wa.me` link from the contact number) or **Call** fallback
- **⚑ Report this listing** inline form (reason + details)
- Related gigs in the same category
- Increments the view counter on load

### Post a Gig — `post.html` + `js/post.js`
- Requires: title, category, location, job type, pay, phone/WhatsApp, date needed, poster name, description
- Optional: people needed, duration
- Validation: required fields + phone/WhatsApp format regex
- **Auto-expiry computed on submit**: 7 days for one-off, 30 days for recurring/part/full-time
- On success: shows expiry date and redirects to the new gig's detail page

### Categories — `categories.html` + `js/categories.js`
- Category index grid (with open counts)
- `?cat=<slug>` renders a per-category landing (SEO-friendly, e.g. "House Help & Domestic gigs in Kenya") with matching active gigs

### How It Works — `how-it-works.html`
- Four-step explainer (find/post → connect → agree → stay safe)
- `#safety` anchor: safety tips cards (never pay to apply, meet in public, guard your ID, agree terms in writing)
- Links to report-a-scam

### About — `about.html`
- Mission + trust-building value props
- Stats strip (employers, placements, categories)

### Testimonials — `testimonials.html`
- Success stories with star ratings, author and role/category tags (gig-marketplace appropriate, not placeholder template text)

### Contact — `contact.html`
- WhatsApp (fastest), location, email, support hours
- Message form that opens a pre-filled WhatsApp chat (`wa.me/254105575260`)
- Used for support + reporting

### Admin — `admin.html` + `js/admin.js`
See [Admin Panel](#8-admin-panel) and [Trust & Safety](#10-trust--safety).

### Shared UI — `js/main.js`
- Injects the sticky navbar (emerald, amber active underline), safety banner, and footer into mount points on every page, so navigation stays consistent
- Exposes reusable helpers: `gigCardHTML`, `chipHTML`, `statusBadge`, `timeAgo`, `escapeHtml`, `flash`

---

## 6. Data Model

Each gig listing (`js/store.js` + `supabase.sql` → `public.gigs`):

**Required (poster-entered):**
| Field | Type | Notes |
|-------|------|-------|
| `title` | text | Short, e.g. "Need house help for 3 days" |
| `category` | text | One of the taxonomy slugs (below) |
| `location` | text | Area/town, not full address (safety) |
| `job_type` | text | one-off / part-time / full-time / recurring |
| `pay` | text | Amount or range; allow "negotiable" |
| `contact_method` | text | Phone/WhatsApp |
| `date_needed` | text | e.g. "This Saturday" / "ASAP" |
| `description` | text | 2–4 sentences |
| `poster_name` | text | Person or business |

**Optional:**
| Field | Type | Notes |
|-------|------|-------|
| `people_needed` | int | Number of people |
| `duration` | text | e.g. "3 hours", "2 days", "ongoing" |
| `business_name` | text | Poster's business, if any |

**System-generated (not entered by poster):**
| Field | Type | Notes |
|-------|------|-------|
| `id` | text | Unique (timestamp-based) |
| `date_posted` | bigint | Epoch ms |
| `expiry_date` | bigint | Epoch ms; auto-expiry window |
| `status` | text | active / expired / filled / removed |
| `featured` | bool | Pinned to home + Featured ribbon |
| `view_count` | int | Increments on detail view |

**Reports** (`public.reports`): `id`, `gig_id` (FK → gigs), `reason`, `details`, `resolved` (bool), `created_at`.

---

## 7. Category Taxonomy

Ten categories, each with its own icon and soft-tint chip color (from `color.md`) so listings are scannable:

| Slug | Category | Chip bg / text |
|------|----------|----------------|
| `house-help` | House Help & Domestic | `#E6F5F0` / `#0F7A5E` |
| `events` | Event Services | `#F9EAFB` / `#8A2FA3` |
| `cleaning` | Cleaning & Errands | `#FDEEEA` / `#B5522E` |
| `driving` | Driving & Delivery | `#EAF1FB` / `#2E5FA3` |
| `retail` | Retail & Supermarket | `#E6F5F0` / `#0F7A5E` |
| `hospitality` | Hospitality & Food | `#FFF3DF` / `#B5760B` |
| `skilled-trades` | Skilled Trades | `#F4EFEA` / `#7A5B3F` |
| `security` | Security | `#F1EAFB` / `#6A3FA3` |
| `labor` | General Labor / Casual | `#F4EFEA` / `#7A5B3F` |
| `other` | Other Gigs | `#EEF0F2` / `#4A5568` |

Configured centrally in `js/config.js`. Chip color never carries meaning alone — always paired with a text label (accessibility).

---

## 8. Admin Panel

Protected area for a single non-technical admin to keep the board clean. Access via `admin.html`.

### Authentication
- **Supabase mode:** email/password via Supabase Auth (`signInWithPassword`). Logged-out users see only the login gate; the `guard()` in `js/admin.js` blocks dashboard access. Logout calls `signOut` and revokes the session.
- **Demo mode (no Supabase):** any non-empty email + password, persisted via a localStorage session flag. Developer convenience only.

### Dashboard
- Count cards: **Active listings, Total listings, Expiring in 48h, Open reports**

### Listing table
- Tabs: **Active / All / Expired / Filled / Reports**
- Columns: select, title (links to public gig), category, location, date posted, expiry, status, actions
- Live search across title / contact / category
- Status is **derived**: `filled`/`removed` from the field, else `expired` if past expiry, else `active` — so expired items are handled without losing data

### Per-row actions
| Action | Behavior |
|--------|----------|
| ⭐ Feature / Unfeature | Toggle pinned to home (featured ribbon) |
| Filled | Soft-close: sets status `filled` |
| Extend | Prompts for days and pushes `expiry_date` forward |
| Edit | Prompt-based quick edit of title + pay |
| Delete | Removes permanently (with confirm) |

### Bulk actions
- Select-all checkbox + per-row checkboxes
- **Bulk delete** and **Bulk expire** (with confirmation and count feedback)

### Reports queue
- Separate **Reports** tab, only shows unresolved reports
- Each report: reported gig title, reason, details, timestamp
- Actions: **Mark resolved**, **Remove listing** (links through to the offending gig)

---

## 9. Listing Lifecycle & Auto-Expiry

```
Posted → Active →
    ├── Filled / Closed (admin action → status "filled")
    ├── Expired        (auto: date_posted + N days, status "expired")
    └── Removed        (admin delete, e.g. scam/spam)
```

- **Auto-expiry window:** 7 days for one-off gigs, 30 days for recurring/part/full-time (see `APP.expiryDaysForType`).
- Expiry is computed **at post time** and also derived live when rendering (a past `expiry_date` reads as "expired" even if the stored status hasn't flipped yet).
- **Expired/filled listings are hidden from the public Browse/detail pages but kept in the admin store** — so they're queryable for stats, restoring, or reposting, without cluttering public view.
- The store's public query (`getActiveGigs`) only returns `status === 'active'` **and** unexpired listings.
- **Production auto-flip job:** run the SQL in [Supabase](#11-connecting-supabase) as a scheduled Edge Function / cron to flip `active → expired` daily.

---

## 10. Trust & Safety

Because postings are often informal individuals hiring for house access / event work, trust matters:

- **"Report this listing"** form on every detail page → lands in the admin Reports queue (never public)
- **Site-wide banner:** "⚠️ Never send money to apply — read our safety tips" on every page
- **Safety tips page** (`how-it-works.html#safety`): never pay to apply, meet in public first, guard ID/bank/M-Pesa details, agree terms in writing
- **Moderation guidance (encoded in the post form + spec):** no upfront-payment requests (scam pattern), no discriminatory language, valid phone/WhatsApp contact format
- **WhatsApp-first contact** for all applications and support

---

## 11. Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the config template → real config (the real file is **git-ignored**):
   ```bash
   cp js/supabase-config.example.js js/supabase-config.js
   ```
3. Edit `js/supabase-config.js`:
   ```js
   window.SUPABASE_CONFIG = {
     url: 'https://YOUR-PROJECT.supabase.co',
     anonKey: 'YOUR-ANON-PUBLIC-KEY'
   };
   ```
4. Run `supabase.sql` in the **SQL Editor**. It creates:
   - `public.gigs` — listings table
   - `public.reports` — flagged listings, FK to gigs
   - **Row Level Security policies**: anyone can read gigs / insert gigs / insert reports; only `authenticated` (admin) can update/delete gigs and read/resolve reports
5. Under **Authentication → Providers**, enable **Email**.
6. Create your admin user in **Authentication → Users** (or sign up on `admin.html`).
7. The app **auto-switches** from localStorage to Supabase once config is present — no code changes.

> ⚠️ Never commit `js/supabase-config.js`. Real keys are caught by `.gitignore`.

### Production auto-expiry job
Static frontends can't schedule jobs — deploy a Supabase **Edge Function** or cron that runs daily:

```sql
update public.gigs
set status = 'expired'
where status = 'active'
  and expiry_date < extract(epoch from now()) * 1000;
```

---

## 12. Deployment

Any static host works since there's no build step. All you deploy is the repo contents (plus your `js/supabase-config.js`).

### Vercel / Netlify / Cloudflare Pages
- Push the repo to GitHub and import it; the framework preset is "Static".
- Set `Directory: ./` (repo root) or `/` for the publish directory — no Build command needed.

### GitHub Pages
1. Push the repo.
2. Settings → Pages → Source: `Deploy from a branch`, branch `main`, folder `/`.
3. 📌 **Important for Pages sub-paths:** the site uses relative links (`browse.html`, `css/styles.css`), so it works at `https://<user>.github.io/gigs/` **only if** you deploy to a sub-path. If served at a sub-path, verify navigation links resolve — otherwise keep relative paths (they already are) and it works as-is.

### Post-deploy checklist
- [ ] `js/supabase-config.js` present with real values (git-ignored, add it on the host)
- [ ] `supabase.sql` applied, email auth enabled, admin user created
- [ ] Auto-expiry Edge Function scheduled
- [ ] Database backups configured
- [ ] Uptime monitoring (free tier is fine)

---

## 13. Verification / How It Was Tested

The build was verified before every checkpoint was marked passed (see `CHECKPOINTS.md`). Evidence collected:

- **Static analysis:** all 10 JS files pass `node --check` (no syntax errors).
- **Headless browser (Chromium, no sandbox):**
  - Home rendered hero, search, stats, category grid, and **14 gig-card references / all 5 seed listings** with **no console JS errors**.
  - Browse with `?q=cashier` correctly filtered to the matching listing.
  - Gig detail (`?id=seed-3`) rendered title, `KSh 22,000/month`, **Apply on WhatsApp**, and **Report this listing**.
  - Admin rendered the **login gate when logged out** and the **dashboard + seeded table row when a demo session was set**.
- **Data-layer integration test (Node + shim):**
  - Seed data loads (>5) and model fields match the spec
  - `getActiveGigs` / `getByCategory` query correctly
  - Posting a one-off gig yields the **correct 7-day auto-expiry**
  - An expired listing is **hidden from public but retained in the admin store**
  - Reports are **stored and resolvable**
- **All checkpoints recorded** in `CHECKPOINTS.md` with a `PASSED` verdict.

---

## 14. Development Rules

- **One file = one commit** during scaffolding. For a change spanning several related files, group it in that single atomic commit.
- **Conventional Commits:** `feat(css): …`, `docs: …`, `chore: …`, `refactor: …`, `fix: …`, `test: …` (full rules in `GIT_GUIDE.md`).
- Feature work on a branch (`feat/<slug>`), then **squash-merge** to `main` and delete the branch.
- Verify each change against `CHECKPOINTS.md` before marking it passed.
- **Never commit secrets** or the real `js/supabase-config.js`.

---

## 15. Supporting Documents

| File | Purpose |
|------|---------|
| [`SPEC.md`](SPEC.md) | Consolidated, single source of truth for the build |
| [`CHECKPOINTS.md`](CHECKPOINTS.md) | Milestone progress — all 10 checkpoints tracked & passed |
| [`GIT_GUIDE.md`](GIT_GUIDE.md) | Git/commit conventions |

The original design guides that informed the spec live outside the repo (in the project folder): `color.md` (theme), `blueprint.md` (structure/admin), `playbook.md` (implementation order), and the site-clone guide.

---

## 16. Roadmap / Out of Scope for v1

**Explicitly out of scope for v1** (per `SPEC.md`):
- Payment processing / in-app payments
- In-app messaging (all contact is WhatsApp/phone)
- Applicant accounts / user profiles / CV upload
- Employer phone-OTP verification flow
- Pay ranges as structured numeric salary filtering (pay is free text for now)

**Natural next steps (not built):**
- Public applicant side + application history
- Featured/sponsored listing payments
- Category SEO landing pages with location targeting (e.g. "House Help Jobs in Nairobi")
- `Recently Filled` social-proof section
- Auto-WhatsApp reminder to posters 1 day before expiry ("Still hiring? Extend or close")
- Analytics dashboard for listing views/applications
