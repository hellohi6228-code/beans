-- Fix 0002's case-listing check. Run once in the Supabase SQL Editor. Safe to re-run.
--
-- A CHECK only rejects a row when its condition is false; null passes. 0002
-- compared nullable columns directly (price_per_case > 0), so a case listing
-- with those columns missing evaluated to null and was let through. Treat a
-- missing value as failing instead.

alter table public.posts drop constraint if exists posts_case_complete;
alter table public.posts add constraint posts_case_complete
  check (
    sell_by is distinct from 'case'
    or (
      coalesce(price_per_case, 0) > 0
      and coalesce(units_per_case, 0) > 0
      and coalesce(unit_kg, 0) > 0
      and coalesce(cases_available, -1) >= 0
    )
  );
