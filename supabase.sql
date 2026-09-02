-- =========================================================================
-- GigConnect KE — Supabase schema
-- Run this in the Supabase SQL editor to create the tables the app expects.
-- (Only needed if you enable Supabase mode; the app works in localStorage
--  demo mode without this.)
-- =========================================================================

-- Listings
create table if not exists public.gigs (
  id            text primary key,
  title         text not null,
  category      text not null,
  location      text not null,
  job_type      text not null,
  pay           text not null,
  contact_method text not null,
  date_needed   text,
  description   text,
  poster_name   text,
  business_name text,
  people_needed int,
  duration      text,
  featured      boolean default false,
  date_posted   bigint default 0,
  expiry_date   bigint default 0,
  status        text default 'active',  -- active | expired | filled | removed
  view_count    int default 0
);

-- Reports (flagged listings)
create table if not exists public.reports (
  id         text primary key,
  gig_id     text references public.gigs (id) on delete cascade,
  reason     text,
  details    text,
  resolved   boolean default false,
  created_at bigint default 0
);

-- Row-level security: public can read active gigs and insert gigs/reports;
-- only the admin (authenticated) can update/delete everything.
alter table public.gigs enable row level security;
alter table public.reports enable row level security;

-- Anyone can read gigs
create policy "public read gigs" on public.gigs
  for select using (true);

-- Anyone can post a gig
create policy "public insert gigs" on public.gigs
  for insert with check (true);

-- Only authenticated admin can update/delete gigs
create policy "auth update gigs" on public.gigs
  for update using (auth.role() = 'authenticated');
create policy "auth delete gigs" on public.gigs
  for delete using (auth.role() = 'authenticated');

-- Reports: anyone can insert, only admin reads/resolves
create policy "public insert reports" on public.reports
  for insert with check (true);
create policy "auth read reports" on public.reports
  for select using (auth.role() = 'authenticated');
create policy "auth update reports" on public.reports
  for update using (auth.role() = 'authenticated');

-- Auto-expiry (run as a scheduled job / cron or Edge Function daily):
--   update public.gigs set status = 'expired'
--   where status = 'active' and expiry_date < extract(epoch from now()) * 1000;
