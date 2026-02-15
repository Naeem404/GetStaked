# Get Staked — Mobile App

The primary client for Get Staked. A React Native app built with **Expo SDK 54** (New Architecture) and **Expo Router 6** for file-based navigation. Dark-only OLED UI styled with **NativeWind** (Tailwind CSS for React Native).

> **Back to root:** [../README.md](../README.md)

---

## Quick Start

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your device, or press `a` (Android emulator) / `i` (iOS simulator).

For a development build (required for Phantom SDK):

```bash
npx expo run:android
# or
npx expo run:ios
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | React Native 0.81 + Expo SDK 54 (New Architecture) |
| **Router** | Expo Router 6 (file-based, typed routes) |
| **Language** | TypeScript 5.9 |
| **Styling** | NativeWind 4 (Tailwind CSS) |
| **State** | React Context (AuthProvider) + custom hooks |
| **Backend** | Supabase (Auth, PostgreSQL, Storage, Edge Functions) |
| **Wallet** | Phantom React Native SDK 1.0 + @solana/web3.js 1.98 |
| **Camera** | expo-camera 17 + expo-image-picker 17 |
| **Audio** | expo-av 16 (coach TTS playback) |
| **Animations** | react-native-reanimated 4.1 |
| **Haptics** | expo-haptics 15 |

---

## Screens

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/index.tsx` | Splash / auth gate |
| `/auth` | `app/auth.tsx` | Sign in / sign up (email + password) |
| `/(tabs)` | `app/(tabs)/index.tsx` | **Dashboard** — Snap-style streak hero, mini habit grid, active pool cards |
| `/(tabs)/pools` | `app/(tabs)/pools.tsx` | **Browse Pools** — Filterable pool cards, create FAB, friends button |
| `/(tabs)/prove` | `app/(tabs)/prove.tsx` | **Prove** — Camera capture → pool select → AI verification flow |
| `/(tabs)/stats` | `app/(tabs)/stats.tsx` | **Stats** — Full GitHub-style habit grid, leaderboard (global + pool), stat cards |
| `/create-pool` | `app/create-pool.tsx` | Pool creation with friend invites, stake slider, duration/frequency pickers |
| `/pool-detail` | `app/pool-detail.tsx` | Pool pot hero, member leaderboard, join/submit proof actions |
| `/friends` | `app/friends.tsx` | User search (pg_trgm), friend requests, friend list management |
| `/wallet` | `app/wallet.tsx` | Phantom connect/disconnect, SOL balance, transaction history |
| `/settings` | `app/settings.tsx` | Profile editing, display name, username, coach persona, voice toggle |
| `/proof-reviews` | `app/proof-reviews.tsx` | Review uncertain proofs assigned by AI (friend review system) |
| `/congratulations` | `app/congratulations.tsx` | Win celebration with confetti + share |
| `/confirm-email` | `app/confirm-email.tsx` | Email confirmation deep link handler |

---

## Custom Hooks

| Hook | File | Key Exports |
|------|------|-------------|
| **use-pools** | `hooks/use-pools.ts` | `usePools`, `useMyPools`, `usePoolDetail`, `joinPool`, `createPool`, `usePoolInvites`, `acceptPoolInvite`, `declinePoolInvite` |
| **use-proofs** | `hooks/use-proofs.ts` | `usePendingProofs`, `submitProof` (uploads image → calls `verify-proof` Edge Function), `useRecentActivity` |
| **use-stats** | `hooks/use-stats.ts` | `useHabitGrid`, `useUserStats` (streak via RPC persistence, SOL earned from transactions) |
| **use-friends** | `hooks/use-friends.ts` | `useFriends`, `useSearchProfiles`, `sendFriendRequest`, `acceptFriendRequest`, `removeFriend`, `sendPoolInvites`, `useFriendIds` |
| **use-leaderboard** | `hooks/use-leaderboard.ts` | `useGlobalLeaderboard`, `usePoolLeaderboard` (RPC-first with client fallback) |
| **use-coach** | `hooks/use-coach.ts` | `useCoach` (calls `voice-coach` Edge Function, plays audio via expo-av) |
| **use-lifelines** | `hooks/use-lifelines.ts` | Streak save / lifeline mechanics |

---

## Lib

| File | Description |
|------|-------------|
| `lib/supabase.ts` | Supabase client — lazy singleton via Proxy pattern, AsyncStorage for session persistence |
| `lib/auth-context.tsx` | `AuthProvider` + `useAuth` hook — session, profile, `signUp`, `signIn`, `signOut`, `updateProfile`, `linkWallet`, `refreshProfile` |
| `lib/wallet.ts` | Phantom wallet helpers — `saveWalletToProfile`, `removeWalletFromProfile`, `getWalletBalance` (via Edge Function), `recordSolTransaction`, `getTransactionHistory`, `hasStakedForPool`, `getSolanaAddress` |
| `lib/database.types.ts` | Auto-generated TypeScript types from Supabase schema |

---

## Components

| Component | File | Description |
|-----------|------|-------------|
| **Coach Bubble** | `components/coach-bubble.tsx` | Floating AI coach — Gemini text + ElevenLabs audio, three personas, contextual triggers |
| **Habit Grid** | `components/habit-grid.tsx` | GitHub-style contribution heatmap — orange intensity by proof count |
| **Streak Counter** | `components/streak-counter.tsx` | Snap-style fire + number with flame intensity scaling |
| **Icons** | `components/icons.tsx` | Custom SVG icon components for the app |

---

## Edge Functions

Deployed to Supabase (Deno runtime). Source in `supabase/functions/` and `edge-functions/`:

| Function | Endpoint | Description |
|----------|----------|-------------|
| `verify-proof` | `POST /functions/v1/verify-proof` | Image → base64 → Gemini 2.0 Flash vision → confidence-scored verdict (approve / reject / needs_review) |
| `voice-coach` | `POST /functions/v1/voice-coach` | Gemini text gen + ElevenLabs TTS → returns text + audio |
| `wallet-balance` | `POST /functions/v1/wallet-balance` | Solana `getBalance` RPC for a given public key |
| `confirm-email` | `GET /functions/v1/confirm-email` | Email confirmation redirect handler |

---

## Database Setup

Run these SQL files in order in the [Supabase SQL Editor](https://supabase.com/dashboard):

1. **`SETUP-DATABASE.sql`** — Complete schema: tables, columns, RLS policies, RPC functions, triggers, indexes. Safe to run multiple times (idempotent).
2. **`SEED-DEMO-DATA.sql`** *(optional)* — Pre-made pools and test data for demo.

Additional migration files are included for incremental changes applied during development:
- `supabase-migrations.sql` — Storage bucket, RPC functions, missing columns
- `supabase-migration-v11.sql` — Friends, invites, leaderboards, seeded pools, triggers
- `supabase-migration-streak-fix.sql` — Streak calculation fixes
- `supabase-migration-proof-reviews.sql` — Friend review system
- `supabase-migration-demo.sql` — Demo data migration
- `fix-rls-recursion.sql` — RLS policy recursion fixes

---

## Configuration

### Supabase

Update `lib/supabase.ts` with your project URL and publishable key:

```typescript
export const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_YOUR_KEY';
```

### Phantom Wallet

The Phantom Portal App ID is configured in `lib/wallet.ts`:

```typescript
export const PHANTOM_APP_ID = 'your-phantom-app-id';
```

Get one at [phantom.com/portal](https://phantom.com/portal).

### App Scheme

The deep link scheme `getstaked://` is configured in `app.json` and used for Phantom wallet callbacks and universal links.

---

## Required Secrets (Supabase Edge Functions)

| Secret | Required | Description |
|--------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI Studio key — proof verification + coach messages |
| `ELEVENLABS_API_KEY` | Yes | ElevenLabs key — voice coach TTS |
| `SOLANA_RPC_URL` | No | Custom Solana RPC (defaults to mainnet-beta) |

---

## Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Start on Android
npm run ios        # Start on iOS
npm run web        # Start web version
npm run lint       # Run ESLint
```
