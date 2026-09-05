# Beans

Coffee bean sourcing for iOS and Android. One Expo (SDK 57) codebase, expo-router,
backed by Supabase.

```bash
npx expo start
```

Press `i` / `a` for a simulator, or scan the QR code with Expo Go on your phone.
The camera only works on a real device or an Expo Go build — a desktop browser
gives a file picker instead.

## Backend setup (one time)

The app is wired to a Supabase project (`src/lib/supabase.ts` has its URL and
publishable key). Two things need doing once, by whoever owns that project:

1. **Run the schema.** Open the SQL Editor in the Supabase dashboard, paste in
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and run it.
   It creates every table, its row-level security policies, the `photos` storage bucket,
   and turns on Realtime for posts/profiles/threads/messages. Safe to re-run.
2. **Turn on anonymous sign-ins.** Authentication → Sign In / Providers → Anonymous.
   There is no sign-up screen — the first launch on a device signs in anonymously and
   everything after that hangs off that identity, the same way the app being tied to a
   phone would. Without this switched on, the app shows a plain message explaining
   exactly this and stops there.

Until both are done, the app boots to that message instead of the sourcing screen.

## What it does

- Opens straight into the app. No sign up, no sign out — one account per device,
  backed by a real anonymous Supabase user.
- Front page: how much coffee, kg or lb, shipping included yes/no plus one US address box.
- "I am also a supplier" turns the account into a farmer, bulk seller, online retail or
  coffee shop, which unlocks listing. Turning it back off switches every listing off too;
  the posts stay, so switching supplying back on leaves them all off until turned on again.
- Everything is a post. A post can also be a listing — price, an amount, and whether
  shipping is included — and gets an icon for it. Every weight and price shows in kg and lb.
- Instagram-style profile: picture, name, bio, grid of posts, all backed by real uploaded
  photos (`photos` storage bucket) rather than local files.
- Messaging a post opens (or reuses) a conversation with its seller and drops the product
  card in once, at the start, never twice. A listing switched off cannot be messaged about.
- A one-question report — "were you asked to pay a different price?" — flags a post; one
  report per buyer per post, enforced by the database.
- A draggable menu button sits above every screen: Find, Post, Listing (suppliers only, a
  table of your items with an on/off switch each), Messages, Profile.
- A demo bar at the top switches between real backend identities on this device, so you can
  check that one account can find and message another's post without a second phone.

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
