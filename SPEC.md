# SPEC — GigConnect KE

**Consolidated project specification** for the gigs & odd-jobs platform. This file is the single source of truth for the build. It consolidates the design decisions from the companion guides:

- `color.md` — theme & color palette (visual source of truth)
- `blueprint.md` — structure, data model, admin system
- `playbook.md` — implementation order & checkpoints (tracked in `CHECKPOINTS.md`)

---

## 1. Purpose

A **local classifieds board for work** in Kenya's gig economy — house help, event decoration, part-time shifts, cleaning, catering, driving, retail, general labor. Casual, fast, low-friction — **not** a corporate job board. WhatsApp-first contact. The brand is **GigConnect KE**.

---

## 2. Tech Stack (locked)

| Concern | Choice |
|---------|--------|
| Frontend | Static HTML / CSS / JS |
| Backend-as-a-Service | **Supabase** (Postgres + Auth) |
| Data fallback | localStorage (demo mode when Supabase isn't configured) |
| Auth | Supabase email/password (admin); demo fallback documented in README |
| Hosting target | Vercel / Netlify (static) |
| Styling | Hand-written CSS, CSS variables |

**Out of scope for v1:** payment processing, in-app messaging, applicant accounts/ CV upload, employer verification OTP flow.

---

## 3. Brand & Design

### Palette (from `color.md`)

| Role | Hex |
|------|-----|
| Primary (Emerald) | `#0F7A5E` |
| Primary Dark (Forest) | `#0A5A45` |
| Primary Light (Mint) | `#E6F5F0` |
| Secondary (Amber) | `#F5A623` |
| Amber Dark | `#C97F0B` |
| Amber Tint | `#FFF3DF` |
| Slate (text) | `#1C2B2A` |
| Slate Muted | `#5B6B69` |
| Border | `#DCE7E3` |
| Surface | `#FFFFFF` |
| Off-White | `#F7FAF9` |

### Semantic
- Success `#1E8A5E`, Warning `#E0A32D`, Error `#D64545`, Info `#2E7DD1`

### Category chips (soft-tint bg / text)
| Category | Bg | Text |
|---|---|---|
| Retail & Supermarket | `#E6F5F0` | `#0F7A5E` |
| Driving & Delivery | `#EAF1FB` | `#2E5FA3` |
| Cleaning & Domestic | `#FDEEEA` | `#B5522E` |
| Hospitality & Food | `#FFF3DF` | `#B5760B` |
| Security | `#F1EAFB` | `#6A3FA3` |
| Freelance/Remote Gigs | `#EAFBF4` | `#1E8A5E` |
| Construction & Labor | `#F4EFEA` | `#7A5B3F` |
| Office & Admin | `#EAF6FB` | `#2E7DA3` |
| Event Services | `#F9EAFB` | `#8A2FA3` |
| General Labor / Other | `#EEF0F2` | `#4A5568` |

### Typography
- Headings: **Poppins** (SemiBold/Bold)
- Body: **Inter** (Regular/Medium)
- Sizes: H1 32–40px, H2 24–28px, H3 20px, body 16px, captions 13–14px; line-height ≥1.5

---

## 4. Categories (taxonomy)

1. House Help & Domestic
2. Event Services
3. Cleaning & Errands
4. Driving & Delivery
5. Retail & Supermarket
6. Hospitality & Food
7. Skilled Trades
8. Security
9. General Labor / Casual
10. Other Gigs

---

## 5. Listing Data Model

**Required:**
- `title`
- `category`
- `location` (area/town)
- `job_type` (one-off / part-time / full-time / recurring)
- `pay`
- `contact_method` (phone/WhatsApp)
- `date_needed`
- `description`
- `poster_name`

**Optional:**
- `people_needed`
- `duration`
- `photos`
- `business_name`

**System-generated:**
- `date_posted`
- `expiry_date` (7 days one-off, 30 days recurring/part/full)
- `status` (active / expired / filled / removed)
- `featured` (boolean)
- `view_count`

---

## 6. Pages

1. **Home** (`index.html`) — hero + search, Post a Gig / Find Work CTAs, featured carousel, category grid, stats strip
2. **Browse** (`browse.html`) — filterable listing grid
3. **Gig Detail** (`gig.html`) — full listing + report link + related
4. **Post a Gig** (`post.html`) — employer form
5. **Categories** (`categories.html`) — per-category landing
6. **How It Works** (`how-it-works.html`) — trust explainer
7. **About** (`about.html`)
8. **Testimonials** (`testimonials.html`)
9. **Contact / Report** (`contact.html`)
10. **Admin** (`admin.html`) — protected dashboard

Shared: `css/styles.css`, `js/config.js`, `js/store.js`, `js/main.js`.

---

## 7. Listing Lifecycle

```
Posted → Active → Filled/Closed | Expired (auto) | Removed
```
Expired/Filled stay queryable in admin, hidden from public Browse.

---

## 8. Admin Features

- Dashboard counts: active / expiring soon / reported
- Listing table: search, filter, sort
- Row actions: edit, delete, mark filled, extend expiry, feature/unfeature
- Bulk actions: multi-select delete/expire/fill
- Reported-queue (separate tab)
- Roles-ready structure (super admin now)

---

## 9. Trust & Safety

- "Report this listing" on every post
- Site-wide "Do not send money to apply" banner
- Auto-reject guidance: no upfront-payment requests, no discriminatory language, valid contact format
