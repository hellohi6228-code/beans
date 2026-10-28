-- Beans: from Chinese-US food to every immigrant kitchen in the US.
-- Run once in the Supabase SQL Editor after 0003. Safe to re-run.

-- Fresh food is most of what a restaurant buys, so listings can now be
-- produce, meat, seafood and dairy as well.
alter table public.posts drop constraint if exists posts_category_check;
alter table public.posts add constraint posts_category_check
  check (category in (
    'produce', 'meat', 'seafood', 'dairy', 'noodles', 'sauces',
    'pantry', 'frozen', 'snacks', 'tea', 'coffee'
  ));

-- The kitchens a listing is for. Empty means the seller did not say.
alter table public.posts
  add column if not exists cuisines text[] not null default '{}';

alter table public.posts drop constraint if exists posts_cuisines_check;
alter table public.posts add constraint posts_cuisines_check
  check (cuisines <@ array[
    'chinese', 'japanese', 'korean', 'vietnamese', 'thai', 'filipino',
    'indian', 'mediterranean', 'mexican', 'italian', 'african'
  ]);

-- Overseas stock can come from any of the countries these kitchens import from.
alter table public.posts drop constraint if exists posts_ships_from_check;
alter table public.posts add constraint posts_ships_from_check
  check (ships_from in (
    'us', 'china', 'taiwan', 'japan', 'korea', 'vietnam', 'thailand',
    'philippines', 'india', 'mexico', 'italy', 'other'
  ));
