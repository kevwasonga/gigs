# Checkpoints & Build Progress — GigConnect KE

This document records every checkpoint required by the implementation playbook (`playbook.md`) and whether it has been **passed**. A checkpoint is only marked passed after it is **verified**, not merely attempted.

Status legend:
- `[ ]` Not started
- `[~]` In progress
- `[x]` Passed (verified)

---

## Checkpoint 0 — Setup Complete

- [x] Repo cloned from `github.com/kevwasonga/gigs` and on `main`
- [x] Git identity configured for the repo
- [x] `GIT_GUIDE.md` written and committed (conventions locked)
- [x] `CHECKPOINTS.md` created (this file)
- [x] Tech stack decided: **Static HTML/CSS/JS + Supabase BaaS** (per user decision)
- [x] `.gitignore` created (node_modules, env, build output)
- [x] `SPEC.md` written consolidating the three design guides
- [x] `README.md` written (setup, run, config)

**Verdict: PASSED**

---

## Checkpoint 1 — Plan Approved (Explore & Interview)

- [x] Build order derived from `SPEC.md` and `playbook.md` milestones
- [x] Tech stack ambiguity resolved with the user (Static + Supabase chosen)
- [x] Approach: Supabase-first with a localStorage fallback so the site is demoable before credentials exist
- [x] One-file-one-commit convention enforced via `GIT_GUIDE.md`

**Verdict: PASSED**

---

## Milestone 1 — Foundation & Data Layer

### Checkpoint 2 — Config, theme, and data model in place
- [ ] `supabase-config.example.js` committed with placeholder values (real one is git-ignored)
- [ ] `js/config.js` holds build-time configuration (categories, colors, storage)
- [ ] `js/store.js` provides a storage-agnostic data layer (Supabase client OR localStorage fallback)
- [ ] Listing data model matches `SPEC.md` (title, category, location, job type, pay, contact, dates, status)
- [ ] Category taxonomy implemented with the chip color system from `color.md`
- [ ] Seed data loads into the store and renders
- [ ] `css/styles.css` applies the full palette (Emerald/Amber) and typography (Poppins/Inter)

**Verdict: NOT STARTED**

---

## Milestone 2 — Public Pages (Read-Only)

### Checkpoint 3 — Browse & detail render from data
- [ ] `index.html` Home page with hero search, category grid, stats strip
- [ ] `browse.html` listing page with category/type filters reading from the store
- [ ] `gig.html` detail page renders a single listing
- [ ] `categories.html` per-category landing pages
- [ ] Static pages: `about.html`, `testimonials.html`, `contact.html`, `how-it-works.html`

**Verdict: NOT STARTED**

---

## Milestone 3 — Post a Gig

### Checkpoint 4 — Form writes a real listing
- [ ] `post.html` form matches the required + optional field list in `SPEC.md`
- [ ] Validation enforced (required fields, phone/WhatsApp format)
- [ ] Auto-expiry date computed on create (7 days for one-off, 30 days for recurring/part/full)
- [ ] Submitted listing persists (Supabase when configured, else localStorage) and appears on Browse

**Verdict: NOT STARTED**

---

## Milestone 4 — Admin Authentication

### Checkpoint 5 — Admin access is protected
- [ ] `admin.html` login gate via Supabase Auth (email/password) when configured
- [ ] Demo/dev fallback login for the localStorage mode (documented in README)
- [ ] Logged-out users cannot view admin data (redirect + guard in `js/admin.js`)
- [ ] Logout revokes access

**Verdict: NOT STARTED**

---

## Milestone 5 — Admin Panel Core

### Checkpoint 6 — Admin actions update data
- [ ] `admin.html` dashboard with counts (active / expiring soon / reported)
- [ ] Listing table with search / filter / sort
- [ ] Row actions: edit, delete, mark filled, extend expiry, feature/unfeature
- [ ] Actions mutate the store and are reflected on public pages

**Verdict: NOT STARTED**

---

## Milestone 6 — Auto-Expiry & Cleanup

### Checkpoint 7 — Expired listings hidden from public
- [ ] Expiry logic in `js/store.js` returns only Active/featured listings publicly
- [ ] Expired listings visible in the admin "Expired" view (soft, not deleted)
- [ ] "Closing soon" markers computed from expiry date

**Verdict: NOT STARTED**

---

## Milestone 7 — Reporting & Trust

### Checkpoint 8 — Reports land only in admin queue
- [ ] "Report this listing" link/form on detail page
- [ ] Reports stored via the store and surfaced only in the admin reported-queue
- [ ] Site-wide "Do not send money to apply" safety banner

**Verdict: NOT STARTED**

---

## Milestone 8 — Bulk Actions, Responsiveness, Theme Polish

### Checkpoint 9 — Full theme & responsive audit
- [ ] Admin bulk actions (multi-select delete / expire / fill)
- [ ] Mobile-first responsive layout across public + admin pages
- [ ] Color/typography spot-checked against `color.md` palette table

**Verdict: NOT STARTED**

---

## Milestone 9 — Pre-Launch QA

### Checkpoint 10 — Launch readiness
- [ ] Full flow walkthrough: post a gig → browse → detail → report → admin resolve → expire
- [ ] No console errors on core pages (verified in local server run)
- [ ] Site acceptable on mid-range mobile / slow connection (static assets, minimal dependencies)
- [ ] `README.md` documents setup, config, and admin credentials

**Verdict: NOT STARTED**

---

## Post-Launch Notes (Automation requirements)

- [ ] Supabase scheduled function / edge function to flip Active → Expired daily (config-time task)
- [ ] Database backup routine (config task)
- [ ] Production env vars documented in deployment platform

---

## How to Update This File
Every time a file is committed and its behavior verified, mark the corresponding checkbox `[x]` and commit `CHECKPOINTS.md` as a `docs:` commit. Never mark a box passed without running the verification it describes.
