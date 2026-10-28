# Beans

Wholesale food sourcing for immigrant-run restaurants in the US — Chinese, Japanese,
Korean, Vietnamese, Thai, Filipino, Indian, Mediterranean, Mexican and Latin, Italian,
African and Caribbean kitchens. iOS, Android and web from one Expo (SDK 57) codebase,
expo-router, backed by Supabase.

```bash
npx expo start
```

Press `i` / `a` for a simulator, or scan the QR code with Expo Go on your phone.
The camera only works on a real device or an Expo Go build — a desktop browser
gives a file picker instead.

## Backend setup (one time)

The app is wired to a Supabase project (`src/lib/supabase.ts` has its URL and
publishable key). Two things need doing once, by whoever owns that project:

1. **Run the schema.** Open the SQL Editor in the Supabase dashboard and run each file
   in [`supabase/migrations/`](supabase/migrations/) in order:
   `0001_init.sql` creates every table, its row-level security policies, the `photos`
   storage bucket, and turns on Realtime; `0002_food_catalogue.sql` adds categories,
   case packs, minimum orders, ships-from and label facts to listings;
   `0003_case_check_nulls.sql` makes the database refuse a case listing with missing
   case details; `0004_global_kitchens.sql` adds fresh-food categories, the kitchens a
   listing is for, and more countries to ship from; `0005_onboarding.sql` adds the
   owner-only `addresses` table and makes every listing include shipping;
   `0006_sellers_tags_live.sql` adds where a seller ships from, ingredient tags on
   listings, and the `lives` table. All are safe to re-run. If the `photos` bucket
   doesn't appear under Storage afterwards, create it by hand: New bucket → `photos`
   → Public.
2. **Turn on anonymous sign-ins.** Authentication → Sign In / Providers → Anonymous.
   There is no sign-up screen — the first launch on a device signs in anonymously and
   everything after that hangs off that identity, the same way the app being tied to a
   phone would. Without this switched on, the app shows a plain message explaining
   exactly this and stops there.

Until both are done, the app boots to that message instead of the sourcing screen.

## What it does

- No password — one account per device, backed by a real anonymous Supabase user.
  The first launch onboards it once, and buyer or seller is set there for good. A
  buyer gives a shipping address that can't be left empty, kept in its own table only
  its owner can read. A seller — usually a producer or exporter abroad — says what
  kind of business it is and where its goods ship from, and gives no address.
- Buyers' front page: tick cuisines, ingredients or exact items in a folding tree
  (several at once), optionally an amount in kg, lb or boxes, and the matching
  listings show straight underneath. Search works in any of eight languages.
- Sellers' front page is Live: their camera goes straight to any buyer who opens the
  stream (WebRTC, browser to browser, with Supabase Realtime carrying the handshake).
  Buyers see who's live at the top of their front page and can message the seller and
  browse their listings from the stream. It runs in the browser; the phone apps need
  a native WebRTC build before they can stream. With no relay server, a buyer on a
  network that blocks direct connections won't get video, and each viewer is a
  separate upload from the seller, so it suits a handful of buyers at a time.
- Every listing line shows in English and the reader's own language (中文, 한국어,
  日本語, Tiếng Việt, ไทย, Español, Italiano), picked once per device.
- Everything is a post. A seller's post can also be a listing — tagged with exactly
  what it is from the same tree buyers search, priced in US dollars by weight or by the
  box — and gets an icon for it. Every listed price includes shipping, duties, fees and tax, and
  every weight and price shows in kg and lb.
- Instagram-style profile: picture, name, bio, grid of posts, all backed by real uploaded
  photos (`photos` storage bucket) rather than local files.
- Messaging a post opens (or reuses) a conversation with its seller and drops the product
  card in once, at the start, never twice. A listing switched off cannot be messaged about.
- A one-question report — "were you asked to pay a different price?" — flags a post; one
  report per buyer per post, enforced by the database.
- A draggable menu button sits above every screen: buyers get Find, Post, Messages,
  Profile; sellers get Live, Post, Listing (a table of their items with an on/off
  switch each), Messages, Profile.
- A demo bar at the top switches between real backend identities on this device, so you can
  check that one account can find and message another's post without a second phone.

## Ingredient tags

[`src/tags.ts`](src/tags.ts) holds 11 cuisines → 77 ingredient groups → 398 items.
Each cuisine was built backwards from what its US restaurants sell most (the dishes
are listed in the file), down to what those dishes need, and leads with what has to
come from home — Pixian doubanjiang, gochugaru, katsuobushi, mắm ruốc, makrut leaves,
guajillo, Parmigiano Reggiano DOP, egusi — before what's easier to find. Every item
has its English and Chinese name, the cuisine's own language where the app has it,
and the spellings and brands people type (Maseca, Caputo, Red Boat). Sources include
Grubhub's and Chinese Menu Online's order data, Tasting Table's list of the most
popular dishes at US Indian restaurants, QSR and Restaurant Business on Korean menus,
GlobalData and JETRO on Japanese, Datassential on pozole, FSR on why Italian kitchens
import, and the pantry guides cited in the file's history. Have a cook from each
cuisine check its list.

## Layout

```
app/                      screens (file-based routes)
src/
  lib/supabase.ts         Supabase client, anonymous sign-in, photo upload
  store.tsx               the one hook every screen reads/writes through
  units.ts, theme.ts       kg/lb helpers, the Zara-ish look
  components/             Header, PhotoPicker, PostTile, DemoBar, FloatingNav, ui kit
supabase/migrations/       the SQL schema — run once, see above
```

## How the store talks to the backend

`useStore()` is the same hook every screen already used; it now keeps a local cache of
profiles, posts, threads (the ones you're in), and messages, fetched once per signed-in
identity and kept live with Supabase Realtime — postgres row-level security applies to
realtime the same as a normal query, so a broad subscription with no filter only ever
delivers rows that identity is allowed to see. Mutations (`addPost`, `sendMessage`,
`toggleListing`, …) write straight to the database and update the cache from the response.

Opening a conversation, whether from a profile or from a product, is one Postgres function
(`find_or_create_thread`) — it reuses an existing thread for that pair (and that product) or
creates one, and writes the product card exactly once, so no client code path can send it
twice.
