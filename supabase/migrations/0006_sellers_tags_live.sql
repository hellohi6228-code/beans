-- Beans: worldwide sellers, cuisine → ingredient tags on listings, and live video.
-- Run once in the Supabase SQL Editor after 0005. Safe to re-run.

-- ============================================================= profiles --
-- A seller says where their goods ship from instead of giving an address.

alter table public.profiles add column if not exists ships_from text;

alter table public.profiles drop constraint if exists profiles_ships_from_check;
alter table public.profiles add constraint profiles_ships_from_check
  check (ships_from is null or ships_from in (
    'us', 'china', 'taiwan', 'japan', 'korea', 'vietnam', 'thailand', 'philippines',
    'india', 'mexico', 'peru', 'italy', 'greece', 'turkey', 'lebanon',
    'nigeria', 'ghana', 'ethiopia', 'jamaica', 'other'
  ));

alter table public.profiles drop constraint if exists profiles_supplier_type_check;
alter table public.profiles add constraint profiles_supplier_type_check
  check (supplier_type in (
    'farmer', 'manufacturer', 'exporter', 'importer', 'bulk', 'online_retail', 'coffee_shop'
  ));

-- ================================================================ posts --
-- What a listing is: ingredient tags like 'korean.jang.gochujang'.

alter table public.posts add column if not exists ingredients text[] not null default '{}';

alter table public.posts drop constraint if exists posts_ships_from_check;
alter table public.posts add constraint posts_ships_from_check
  check (ships_from in (
    'us', 'china', 'taiwan', 'japan', 'korea', 'vietnam', 'thailand', 'philippines',
    'india', 'mexico', 'peru', 'italy', 'greece', 'turkey', 'lebanon',
    'nigeria', 'ghana', 'ethiopia', 'jamaica', 'other'
  ));

-- ================================================================ lives --
-- One row per broadcast. The video itself goes browser to browser; this row
-- is how buyers find who is live. last_seen is bumped while the seller is on
-- air, so a tab closed mid-stream drops off within a minute.

create table if not exists public.lives (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default '',
  started_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  ended_at timestamptz
);

alter table public.lives enable row level security;

drop policy if exists "lives are publicly readable" on public.lives;
create policy "lives are publicly readable" on public.lives
  for select using (true);

drop policy if exists "a seller can start their own live" on public.lives;
create policy "a seller can start their own live" on public.lives
  for insert with check (
    auth.uid() = seller_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'supplier')
  );

drop policy if exists "a seller can update their own live" on public.lives;
create policy "a seller can update their own live" on public.lives
  for update using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'lives'
  ) then
    alter publication supabase_realtime add table public.lives;
  end if;
end $$;
