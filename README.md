# Beans

Coffee bean sourcing for iOS and Android. One Expo (React Native) codebase.

Suppliers list what they have, at the price they will actually charge. Buyers say how much
coffee they need, browse what matches, and open a chat to arrange the order. Beans never
touches the money.

## Running it

```bash
npm install
npx expo start
```

Then press `i` for the iOS simulator, `a` for Android, or scan the QR code with Expo Go.
`npx expo start --web` runs the same app in a browser, which is handy for a quick look.

Native builds:

```bash
npx expo run:ios
npx expo run:android
```

Sample accounts are on the welcome screen — five suppliers (two farms, a bulk importer, an
online roaster, a coffee shop) and two buyers. Everything is stored on the device with
AsyncStorage, so the app works with no backend and no network.

## How it is put together

```
app/                     screens (expo-router, file-based)
  index.tsx              signed in? -> /home, else -> /welcome
  welcome.tsx            pick or create an account
  signup.tsx             account setup, incl. supplier type
  (tabs)/
    home.tsx             buyer: the sourcing box | supplier: listings dashboard
    messages.tsx         conversations
    collection.tsx       badges + order history (buyers only)
    profile.tsx          your own profile
  results.tsx            listings that match the request
  listing/[id].tsx       listing detail + order + report
  business/[id].tsx      any profile, Instagram-style
  post/[id].tsx          a single post
  chat/[id].tsx          conversation, with the order card pinned in it
  new-listing.tsx        create a listing (1-3 photos)
  new-post.tsx           post to your profile
  edit-profile.tsx       name, handle, bio, picture, supplier type
  review/[orderId].tsx   write a review, unlock badges
  report/[listingId].tsx price discrepancy report
  reports.tsx            reports filed against your listings
src/
  store.tsx              app state + AsyncStorage persistence
  seed.ts                sample suppliers, listings, posts, orders, reviews
  badges.ts              the badge catalogue and how each one is earned
  units.ts               kg/lb conversion and the dual-unit formatters
  theme.ts               colours, spacing, the background gradient
  components/            Photo, PhotoPicker, ListingCard, Header, ui kit
  data/photos.ts         offline placeholder images for the sample content
```

### Buyer front page

The first screen is deliberately one question: how much coffee, in kg or lb, and is shipping
included. Tick shipping and a single address box appears (US addresses). That is the whole
form — results come next.

### kg and lb, everywhere

Weights and prices are stored in kilograms and shown in both units, always, on every screen:
`$21.75/kg · $9.87/lb`, `Lot 60 kg / 132.28 lb`. Suppliers type their numbers in whichever
unit they use; `src/units.ts` converts once and both figures are displayed from then on.

### Supplier types

Farmer, bulk seller, online retail, and coffee shop. The type shows on the business profile
and next to every listing.

### Profiles

Suppliers and buyers get the same Instagram-shaped profile: picture, name, handle, location,
a free-form bio, and a grid of posts tagged as an update, merchandise, or an event. Supplier
profiles add a Listings tab and a Reviews tab.

### Orders

Ordering does not check out. It pins an order card — quantity in both units, locked price,
shipping status, total — into a chat with the supplier, and the two of you settle payment
however you like.

### Badges

Fourteen badges across four groups: volume of orders, reviews written, kinds of supplier
bought from, and origins collected. Locked badges show their progress bar, so the next one is
always visible. `src/badges.ts` holds the catalogue; each badge computes its own progress from
the buyer's orders and reviews.

### Price discrepancy reports

A listing price is the whole price a buyer pays on Beans — processing, banking and tax
included. Shipping is included only when the listing says so, and the supplier sets that
themselves. If a supplier asks for a different number once the chat is open, the buyer files a
report from the listing or the order card: listed total, what they were actually asked for,
the difference, a reason and optional screenshots. Tolerance is zero — any difference at all
is reportable. Suppliers read the reports against them under Profile → Price reports.

What a supplier charges on their own website or in their own shop is their own business; this
rule applies inside the app.
