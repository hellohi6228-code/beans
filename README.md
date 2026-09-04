# Beans

Coffee bean sourcing for iOS and Android. One Expo (SDK 57) codebase, expo-router.

```bash
npx expo start
```

Press `i` / `a` for a simulator, or scan the QR code with Expo Go on your phone.
The camera only works on a real device.

## What it does

- Opens straight into the app. No sign up, no sign out — one account per device.
- Front page: how much coffee, kg or lb, shipping included yes/no plus one US address box.
- "I am also a supplier" turns the account into a farmer, bulk seller, online retail or
  coffee shop, which unlocks listing.
- A listing is 1-3 photos taken or picked on the phone, a title, a price, an amount, and
  whether shipping is included. Every weight and price shows in kg and lb.
- Instagram-style profile: picture, name, bio, grid of posts. Posting asks whether it is
  something you sell or an event you host; if so the photo gets a chat button.
- Ordering opens a chat with the supplier. Payment happens between the two of you.
- Reviews earn badges, collected in the profile.
- Report button on a listing for a price that does not match what was actually charged.

## Layout

```
app/          screens (file-based routes)
src/          store, badges, kg/lb units, theme, components
```

State is stored on the device with AsyncStorage. There is no server, so there are no other
users to browse or buy from yet — that needs a backend.
