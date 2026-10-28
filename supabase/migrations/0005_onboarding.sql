-- Beans: everyone onboards with a shipping address, and every listing ships free.
-- Run once in the Supabase SQL Editor after 0004. Safe to re-run.

-- ============================================================ addresses --
-- Profiles are readable by everyone, so the address lives in its own table
-- that only its owner can read or change.

create table if not exists public.addresses (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  address text not null check (length(btrim(address)) > 0),
  updated_at timestamptz not null default now()
);

alter table public.addresses enable row level security;

drop policy if exists "a user can read their own address" on public.addresses;
create policy "a user can read their own address" on public.addresses
  for select using (auth.uid() = user_id);

drop policy if exists "a user can add their own address" on public.addresses;
create policy "a user can add their own address" on public.addresses
  for insert with check (auth.uid() = user_id);

drop policy if exists "a user can change their own address" on public.addresses;
create policy "a user can change their own address" on public.addresses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ================================================================ posts --
-- The listed price always includes shipping. A listing that said otherwise
-- is switched off, and can't be switched back on until it does.

alter table public.posts alter column shipping_included set default true;

update public.posts
  set listing_active = false
  where listing_active = true and shipping_included is not true;

alter table public.posts drop constraint if exists posts_shipping_included_check;
alter table public.posts add constraint posts_shipping_included_check
  check (listing_active is not true or shipping_included is true);
