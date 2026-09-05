-- Beans backend schema.
-- Run this once in the Supabase SQL Editor (or `supabase db push` if you use the CLI).
-- Safe to re-run: everything is created with IF NOT EXISTS / OR REPLACE / DROP ... IF EXISTS first.

-- ============================================================== profiles --
-- One row per auth user. Created automatically by a trigger below, so the
-- app never has to "sign up" — the first thing on the device authenticates
-- anonymously and its profile appears here on its own.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'supplier')),
  name text not null default '',
  bio text not null default '',
  supplier_type text check (supplier_type in ('farmer', 'bulk', 'online_retail', 'coffee_shop')),
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable" on public.profiles
  for select using (true);

drop policy if exists "a user can create their own profile" on public.profiles;
create policy "a user can create their own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "a user can update their own profile" on public.profiles;
create policy "a user can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Every new auth user gets a blank profile automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Stopping selling switches every listing off; the posts and their prices
-- stay, so turning supplying back on leaves them all off until switched on
-- one at a time.
create or replace function public.turn_off_listings_on_stop_selling()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role = 'supplier' and new.role = 'customer' then
    update public.posts
      set listing_active = false
      where user_id = new.id and price_per_kg is not null;
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_stop_selling on public.profiles;
create trigger on_profile_stop_selling
  after update of role on public.profiles
  for each row execute function public.turn_off_listings_on_stop_selling();

-- ================================================================== posts --
-- Everything is a post. A post that is selling something carries a price
-- and an amount; price_per_kg is what marks a post as a listing.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  photos text[] not null default '{}',
  caption text not null default '',
  price_per_kg numeric,
  lot_kg numeric,
  entered_unit text check (entered_unit in ('kg', 'lb')),
  shipping_included boolean,
  listing_active boolean,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

drop policy if exists "posts are publicly readable" on public.posts;
create policy "posts are publicly readable" on public.posts
  for select using (true);

drop policy if exists "a user can create their own posts" on public.posts;
create policy "a user can create their own posts" on public.posts
  for insert with check (auth.uid() = user_id);

drop policy if exists "a user can update their own posts" on public.posts;
create policy "a user can update their own posts" on public.posts
  for update using (auth.uid() = user_id);

drop policy if exists "a user can delete their own posts" on public.posts;
create policy "a user can delete their own posts" on public.posts
  for delete using (auth.uid() = user_id);

-- ================================================================ threads --
-- A conversation between exactly two people. `participants` is always the
-- pair sorted (least, greatest) so the same two people always land on the
-- same row, and `post_id` is the product the conversation started from
-- (null for a plain DM opened from a profile).

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  participants uuid[] not null,
  post_id uuid references public.posts (id) on delete set null,
  created_at timestamptz not null default now(),
  last_at timestamptz not null default now()
);

-- One thread per pair for a plain DM, one thread per pair per product.
create unique index if not exists threads_dm_unique
  on public.threads (participants) where post_id is null;
create unique index if not exists threads_post_unique
  on public.threads (participants, post_id) where post_id is not null;

alter table public.threads enable row level security;

drop policy if exists "a participant can read their threads" on public.threads;
create policy "a participant can read their threads" on public.threads
  for select using (auth.uid() = any (participants));

-- ============================================================== messages --

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads (id) on delete cascade,
  sender_id uuid not null references public.profiles (id),
  text text,
  -- The product card, attached once when the conversation begins.
  post_id uuid references public.posts (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "a participant can read messages in their threads" on public.messages;
create policy "a participant can read messages in their threads" on public.messages
  for select using (
    exists (
      select 1 from public.threads t
      where t.id = messages.thread_id and auth.uid() = any (t.participants)
    )
  );

drop policy if exists "a participant can send messages in their threads" on public.messages;
create policy "a participant can send messages in their threads" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.threads t
      where t.id = messages.thread_id and auth.uid() = any (t.participants)
    )
  );

-- Bumps the thread to the top of the inbox whenever a message lands in it.
create or replace function public.bump_thread_last_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.threads set last_at = new.created_at where id = new.thread_id;
  return new;
end;
$$;

drop trigger if exists on_message_bump_thread on public.messages;
create trigger on_message_bump_thread
  after insert on public.messages
  for each row execute function public.bump_thread_last_at();

-- Opens (or reuses) the conversation about a post, or a plain DM when
-- `p_post` is null. The product card is written here, exactly once, so no
-- client code path can send it twice.
create or replace function public.find_or_create_thread(p_other uuid, p_post uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_pair uuid[];
  v_thread_id uuid;
begin
  if v_me is null then
    raise exception 'not authenticated';
  end if;
  if v_me = p_other then
    raise exception 'cannot message yourself';
  end if;

  v_pair := array[least(v_me, p_other), greatest(v_me, p_other)];

  if p_post is null then
    select id into v_thread_id from public.threads
      where participants = v_pair and post_id is null;
  else
    select id into v_thread_id from public.threads
      where participants = v_pair and post_id = p_post;
  end if;

  if v_thread_id is null then
    insert into public.threads (participants, post_id) values (v_pair, p_post)
      returning id into v_thread_id;

    if p_post is not null then
      insert into public.messages (thread_id, sender_id, post_id)
        values (v_thread_id, v_me, p_post);
    end if;
  end if;

  return v_thread_id;
end;
$$;

grant execute on function public.find_or_create_thread(uuid, uuid) to authenticated;

-- =============================================================== reports --
-- Just a flag: this buyer says the price they were asked for did not match
-- the listing. One per buyer per post.

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id),
  seller_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (post_id, reporter_id)
);

alter table public.reports enable row level security;

drop policy if exists "a reporter can read their own reports" on public.reports;
create policy "a reporter can read their own reports" on public.reports
  for select using (auth.uid() = reporter_id);

drop policy if exists "a seller can read reports about them" on public.reports;
create policy "a seller can read reports about them" on public.reports
  for select using (auth.uid() = seller_id);

drop policy if exists "a signed in user can file a report" on public.reports;
create policy "a signed in user can file a report" on public.reports
  for insert with check (auth.uid() = reporter_id);

-- ============================================================== realtime --
-- So an open chat screen sees new messages without a manual refresh, and a
-- toggled listing or edited profile shows up for anyone already browsing.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'posts'
  ) then
    alter publication supabase_realtime add table public.posts;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'threads'
  ) then
    alter publication supabase_realtime add table public.threads;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- =============================================================== storage --
-- One public bucket for every photo the app takes or uploads. Public so a
-- photo URL just works in an <Image>; writes are restricted to a user's own
-- folder (`{user id}/...`).

insert into storage.buckets (id, name, public)
  values ('photos', 'photos', true)
  on conflict (id) do nothing;

drop policy if exists "photos are publicly readable" on storage.objects;
create policy "photos are publicly readable" on storage.objects
  for select using (bucket_id = 'photos');

drop policy if exists "a user can upload into their own folder" on storage.objects;
create policy "a user can upload into their own folder" on storage.objects
  for insert with check (
    bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "a user can replace files in their own folder" on storage.objects;
create policy "a user can replace files in their own folder" on storage.objects
  for update using (
    bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "a user can delete files in their own folder" on storage.objects;
create policy "a user can delete files in their own folder" on storage.objects
  for delete using (
    bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
