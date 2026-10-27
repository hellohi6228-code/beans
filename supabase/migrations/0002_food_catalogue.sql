-- Beans: from coffee to a Chinese-US food catalogue.
-- Run once in the Supabase SQL Editor after 0001_init.sql. Safe to re-run.

-- ================================================================ posts --
-- Every listing now has a category, is sold by weight or by the case, says
-- where it ships from, and carries the label facts US buyers check first.

alter table public.posts
  add column if not exists category text,
  add column if not exists sell_by text,
  add column if not exists price_per_case numeric,
  add column if not exists units_per_case integer,
  add column if not exists unit_kg numeric,
  add column if not exists cases_available integer,
  add column if not exists min_order numeric not null default 0,
  add column if not exists ships_from text,
  add column if not exists lead_days integer,
  add column if not exists fda_registered boolean not null default false,
  add column if not exists english_label boolean not null default false,
  add column if not exists allergens text[] not null default '{}';

alter table public.posts drop constraint if exists posts_category_check;
alter table public.posts add constraint posts_category_check
  check (category in ('coffee', 'tea', 'snacks', 'sauces', 'noodles', 'frozen', 'pantry'));

alter table public.posts drop constraint if exists posts_sell_by_check;
alter table public.posts add constraint posts_sell_by_check
  check (sell_by in ('weight', 'case'));

alter table public.posts drop constraint if exists posts_ships_from_check;
alter table public.posts add constraint posts_ships_from_check
  check (ships_from in ('us', 'china'));

alter table public.posts drop constraint if exists posts_allergens_check;
alter table public.posts add constraint posts_allergens_check
  check (allergens <@ array['milk', 'eggs', 'fish', 'shellfish', 'tree_nuts', 'peanuts', 'wheat', 'soy', 'sesame']);

-- A case listing must say what is in the case.
alter table public.posts drop constraint if exists posts_case_complete;
alter table public.posts add constraint posts_case_complete
  check (
    sell_by is distinct from 'case'
    or (price_per_case > 0 and units_per_case > 0 and unit_kg > 0 and cases_available >= 0)
  );

-- Everything listed before this was coffee, sold by weight, from US stock.
update public.posts
  set category = 'coffee', sell_by = 'weight', ships_from = 'us'
  where listing_active is not null and category is null;

-- Turning selling off now keys on listing_active, which every listing has,
-- rather than price_per_kg.
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
      where user_id = new.id and listing_active is not null;
  end if;
  return new;
end;
$$;

-- ============================================================= profiles --
-- Manufacturers and importers are the two supplier types the food side of
-- China-US trade actually runs through.

alter table public.profiles drop constraint if exists profiles_supplier_type_check;
alter table public.profiles add constraint profiles_supplier_type_check
  check (supplier_type in ('farmer', 'manufacturer', 'importer', 'bulk', 'online_retail', 'coffee_shop'));
