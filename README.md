<p align="center">
  <img src="get-staked-mobile/assets/images/icon.png" alt="Get Staked Logo" width="120" />
</p>

<h1 align="center">Get Staked — Accountability Meets Crypto</h1>

<p align="center">
  <strong>Stake real SOL on your habits. AI verifies your proof. Winners split the pot.</strong>
</p>

<p align="center">
  <a href="https://getstaked.ca">Website</a> &bull;
  <a href="#features">Features</a> &bull;
  <a href="#tech-stack">Tech Stack</a> &bull;
  <a href="#project-structure">Project Structure</a> &bull;
  <a href="#setup--installation">Setup</a> &bull;
  <a href="#architecture">Architecture</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Solana-Powered-9945FF?style=flat&logo=solana&logoColor=white" alt="Solana" />
  <img src="https://img.shields.io/badge/Expo-SDK_54-000020?style=flat&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Gemini_AI-Vision-4285F4?style=flat&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/License-CC0_1.0-lightgrey?style=flat" alt="License" />
</p>

---

Get Staked is a mobile-first accountability app where users **stake real Solana (SOL)** on their daily habits, join competitive pools with friends, submit photo proof verified by **Google Gemini AI**, and earn rewards for staying consistent. An **AI voice coach** powered by ElevenLabs keeps you motivated. Break your streak and lose your stake — complete it and split the losers' money.

Think **Snapchat streaks** meets **GitHub contribution graphs** meets **crypto wallet**.

---

## Features

- **SOL Staking** — Connect your Phantom wallet and stake real SOL in habit pools. Money on the line makes habits stick.
- **AI Proof Verification** — Submit daily photo proofs analyzed by Google Gemini 2.0 Flash vision. The AI determines if you actually did the work with confidence scoring and auto-approve/reject/review thresholds.
- **Accountability Pools** — Join public pools or create private ones with friends. Each pool has a habit, stake amount, duration, and max players. Complete your streak to earn your share of the pot.
- **Snap-Style Streak Tracking** — Visual fire-based streak counter inspired by Snapchat. Flame intensity scales with streak length (flicker, embers, heat waves). Streak breaks trigger extinguish animations.
- **GitHub-Style Habit Grid** — Contribution heatmap showing habit completion density over weeks. Orange intensity scales with daily proof count — the more consistent you are, the more "on fire" the grid looks.
- **AI Voice Coach** — Persistent floating bubble on every screen. Three personas (Drill Sergeant, Hype Beast, Gentle Guide) powered by Gemini text generation + ElevenLabs text-to-speech.
- **Friend Review System** — When AI confidence is uncertain (30–70%), proofs are routed to a pool member or friend for human review instead of auto-deciding.
- **Social & Friends** — Search users by username, send/accept friend requests, invite friends to private pools, and compete on global + pool leaderboards.
- **Global & Pool Leaderboards** — Ranked by streak length, verified proofs, and pools completed. Podium-style top 3 with full ranked list below.
- **Solana Transactions** — On-chain SOL deposits recorded to Supabase with transaction signatures. Full transaction history per user.
- **Pre-Seeded Pools** — 12 ready-made pools across fitness, health, education, wellness, productivity, and creative categories for immediate engagement.
- **Dark-Only OLED UI** — Minimal, visual-first dark interface. Fire/gold accent palette. Glassmorphism cards. Designed mobile-first at 390×844.

---

## Tech Stack

### Mobile App (`get-staked-mobile/`)

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native 0.81 via Expo SDK 54 (New Architecture) |
| **Router** | Expo Router 6 (file-based routing) |
| **Language** | TypeScript 5.9 |
| **Styling** | NativeWind 4 (Tailwind CSS for React Native) |
| **Auth** | Supabase Auth (email/password) |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **Wallet** | Phantom React Native SDK 1.0 + @solana/web3.js |
| **Camera** | expo-camera + expo-image-picker |
| **Audio** | expo-av (voice coach TTS playback) |
| **Animations** | react-native-reanimated 4 |
| **Storage** | Supabase Storage (proof images) |
| **Haptics** | expo-haptics |

### Web App (`get-staked-app/`)

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5.7 |
| **Styling** | Tailwind CSS 3 + tailwindcss-animate |
| **UI Components** | shadcn/ui (Radix primitives) |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Auth** | Supabase SSR |
| **Forms** | React Hook Form + Zod validation |

### Landing Page (`get-staked-site/`)

| Layer | Technology |
|-------|-----------|
| **Generator** | Eleventy (11ty) |
| **Hosting** | Netlify |
| **Style** | Vanilla CSS (custom dark theme, glassmorphism) |

### Backend & Infrastructure

| Layer | Technology |
|-------|-----------|
| **Database** | Supabase PostgreSQL with RLS on all tables |
| **Edge Functions** | Supabase Edge Functions (Deno runtime) |
| **AI Vision** | Google Gemini 2.0 Flash (proof image analysis) |
| **AI Text** | Google Gemini (coach message generation) |
| **Voice TTS** | ElevenLabs API (coach audio) |
| **Blockchain** | Solana (SOL staking, Phantom wallet) |
| **Domain** | getstaked.ca (Vercel + GoDaddy DNS) |
| **Web Hosting** | Vercel (web app) + Netlify (landing page) |

---

## Project Structure

```
GetStaked/
├── get-staked-mobile/              # React Native / Expo mobile app (primary)
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx         # Bottom tab navigator (Home, Pools, Prove, Stats)
│   │   │   ├── index.tsx           # Dashboard — streak hero + habit grid + active pools
│   │   │   ├── pools.tsx           # Browse pools — filterable pool cards + create FAB
│   │   │   ├── prove.tsx           # Camera proof submission → AI verification flow
│   │   │   └── stats.tsx           # Full habit grid + leaderboard + stats cards
│   │   ├── _layout.tsx             # Root stack navigator with AuthProvider
│   │   ├── auth.tsx                # Sign in / sign up screen
│   │   ├── create-pool.tsx         # Pool creation form with friend invites
│   │   ├── pool-detail.tsx         # Pool detail — pot, members, leaderboard, join/prove
│   │   ├── friends.tsx             # Search users, send/accept requests, manage friends
│   │   ├── wallet.tsx              # Phantom wallet connect, SOL balance, transactions
│   │   ├── settings.tsx            # Profile editing, coach persona, voice toggle
│   │   ├── proof-reviews.tsx       # Review uncertain proofs from friends
│   │   ├── congratulations.tsx     # Win celebration screen with share
│   │   └── confirm-email.tsx       # Email confirmation handler
│   ├── components/
│   │   ├── coach-bubble.tsx        # Floating AI coach — Gemini text + ElevenLabs audio
│   │   ├── habit-grid.tsx          # GitHub-style contribution heatmap
│   │   ├── streak-counter.tsx      # Snap-style fire streak display
│   │   └── icons.tsx               # Custom SVG icon components
│   ├── hooks/
│   │   ├── use-pools.ts            # Pool CRUD, join, invites, capacity checks
│   │   ├── use-proofs.ts           # Proof submission → verify-proof Edge Function
│   │   ├── use-stats.ts            # Habit grid data, streak calc, user stats
│   │   ├── use-friends.ts          # Friend requests, search, pool invites
│   │   ├── use-leaderboard.ts      # Global + pool leaderboard RPCs
│   │   ├── use-coach.ts            # Voice coach — Gemini + ElevenLabs + expo-av
│   │   └── use-lifelines.ts        # Streak save / lifeline mechanics
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client (lazy singleton with Proxy)
│   │   ├── auth-context.tsx        # AuthProvider — session, profile, wallet linking
│   │   ├── wallet.ts               # Phantom helpers — save/remove wallet, SOL balance, tx recording
│   │   └── database.types.ts       # Auto-generated TypeScript types from Supabase
│   ├── edge-functions/
│   │   └── verify-proof/index.ts   # Gemini vision — image → base64 → AI analysis → RPC
│   ├── supabase/functions/
│   │   ├── verify-proof/index.ts   # Deployed: AI proof verification
│   │   ├── voice-coach/index.ts    # Deployed: Gemini text + ElevenLabs TTS
│   │   ├── wallet-balance/index.ts # Deployed: Solana RPC balance fetch
│   │   └── confirm-email/index.ts  # Deployed: Email confirmation handler
│   ├── SETUP-DATABASE.sql          # Complete database setup (run once)
│   ├── SEED-DEMO-DATA.sql          # Demo data for testing
│   └── package.json
├── get-staked-app/                 # Next.js web application
│   ├── app/
│   │   ├── page.tsx                # Marketing landing (hero, pools, leaderboard, features)
│   │   ├── auth/page.tsx           # Web authentication
│   │   ├── dashboard/page.tsx      # User dashboard
│   │   ├── pools/page.tsx          # Pool browser
│   │   ├── pool/[id]/page.tsx      # Pool detail (dynamic route)
│   │   ├── leaderboard/page.tsx    # Global leaderboard
│   │   └── .well-known/            # iOS/Android universal links for Phantom
│   ├── components/
│   │   ├── hero.tsx                # Landing hero section
│   │   ├── live-pools.tsx          # Live pool cards with Supabase data
│   │   ├── leaderboard.tsx         # Global leaderboard component
│   │   ├── voice-coach.tsx         # Voice coach showcase section
│   │   ├── streak-heatmap.tsx      # Habit grid visualization
│   │   ├── features.tsx            # Feature cards grid
│   │   └── ui/                     # shadcn/ui component library (40+ components)
│   ├── hooks/
│   │   ├── use-pools.ts            # Pool data fetching
│   │   └── use-leaderboard.ts      # Leaderboard data
│   ├── lib/
│   │   ├── supabase.ts             # Supabase browser + server clients
│   │   └── auth-context.tsx        # Web auth context
│   └── package.json
├── get-staked-site/                # Static landing page
│   ├── src/index.html              # Single-page marketing site
│   ├── .eleventy.js                # 11ty config
│   ├── netlify.toml                # Netlify deploy config
│   └── package.json
├── design-reference/               # UI/UX design reference (not part of runtime code)
├── UI_UX_PROMPT.md                 # Comprehensive UI/UX design system documentation
├── LICENSE                         # CC0 1.0 Universal
└── README.md
```

---

## Prerequisites

- **Node.js 18+** (tested with 22.x)
- **npm** or **pnpm**
- **Expo CLI** — `npx expo` (included with Expo SDK 54)
- **Expo Go** or a development build on physical device / emulator
- **Supabase account** — [supabase.com](https://supabase.com) (free tier works)
- **Phantom wallet** — [phantom.app](https://phantom.app) (mobile app for wallet connection)

### API Keys

| Key | Source | Used For |
|-----|--------|----------|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) | Proof image verification + coach text generation |
| `ELEVENLABS_API_KEY` | [ElevenLabs](https://elevenlabs.io) | Voice coach text-to-speech audio |
| `SOLANA_RPC_URL` *(optional)* | [Helius](https://helius.dev) / [QuickNode](https://quicknode.com) | Custom Solana RPC endpoint (defaults to mainnet-beta) |

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/Naeem404/GetStaked.git
cd GetStaked
```

### 2. Supabase database setup

1. Create a Supabase project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Open the SQL Editor and run `get-staked-mobile/SETUP-DATABASE.sql` — this creates all tables, columns, RLS policies, RPC functions, triggers, and indexes in one idempotent script
3. *(Optional)* Run `get-staked-mobile/SEED-DEMO-DATA.sql` to populate demo pools and test data

### 3. Set Supabase secrets

In your Supabase dashboard → Project Settings → Edge Functions → Secrets:

```
GEMINI_API_KEY=your-gemini-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com   # optional
```

### 4. Mobile app setup

```bash
cd get-staked-mobile
npm install
```

The Supabase URL and publishable key are already configured in `lib/supabase.ts`. If using your own Supabase project, update these values.

### 5. Start the mobile app

```bash
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `a` for Android emulator / `i` for iOS simulator.

### 6. Web app setup *(optional)*

```bash
cd get-staked-app
npm install
npm run dev
```

The web app will be available at `http://localhost:3000`.

### 7. Landing page setup *(optional)*

```bash
cd get-staked-site
npm install
npx @11ty/eleventy --serve
```

---

## Database Schema

All tables have **Row Level Security (RLS)** enabled.

| Table | Description |
|-------|------------|
| `profiles` | User profiles — display name, username, avatar, wallet address, streak, SOL earned |
| `pools` | Habit pools — name, emoji, category, stake amount, duration, frequency, max/current players, status |
| `pool_members` | Pool membership — user, pool, status (active/failed/completed), current streak, join date |
| `proofs` | Proof submissions — user, pool, image URL, status (pending/approved/rejected/needs_review), AI confidence + reasoning |
| `proof_reviews` | Friend reviews for uncertain proofs — reviewer assignment, verdict, AI context |
| `daily_habits` | Daily habit tracking — user, date, proof count (powers the habit grid) |
| `activity_log` | Activity feed — user actions with metadata |
| `transactions` | SOL transactions — type (deposit/refund/claim/penalty), amount, tx signature, status |
| `coach_messages` | AI coach messages — persona, trigger context, message text, audio flag |
| `friendships` | Friend relationships — requester, addressee, status (pending/accepted) |
| `pool_invites` | Pool invitations — pool, inviter, invitee, status |

### Key RPC Functions

| Function | Description |
|----------|------------|
| `process_proof_verification` | Processes AI verdict — updates proof, increments streak, logs activity |
| `calculate_global_streak` | Calculates and persists user's global streak to profiles |
| `get_global_leaderboard` | Returns ranked users by streak, proofs, and pools |
| `get_pool_leaderboard` | Returns ranked members within a specific pool |
| `record_sol_transaction` | Records SOL transaction + updates pool member and profile balances |
| `accept_pool_invite` | Accepts invite and auto-joins user to pool |
| `update_pool_streak_leader` | Trigger — tracks streak leader per pool |

### Key Triggers

| Trigger | Description |
|---------|------------|
| `handle_pool_member_join` | Auto-increments `current_players` / `pot_size`, activates pool at 2+ players |
| `handle_pool_member_leave` | Decrements counts on fail/withdraw |

---

## Supabase Edge Functions

Four serverless functions deployed on Deno runtime:

### `verify-proof`
Receives a proof submission → fetches the image → converts to base64 → sends to **Gemini 2.0 Flash** with a strict verification prompt → parses confidence score → routes to one of three outcomes:
- **Auto-approve** (confidence >= 70%) — calls `process_proof_verification` RPC
- **Auto-reject** (confidence <= 30%) — calls RPC with rejected status
- **Needs review** (30–70%) — creates a `proof_reviews` record and assigns a pool member or friend

### `voice-coach`
Generates contextual motivational messages using **Gemini** based on the user's stats, active persona, and trigger context. Converts the text to speech via **ElevenLabs** TTS API. Returns both text and audio.

### `wallet-balance`
Fetches the SOL balance for a given public key using the **Solana JSON-RPC** (`getBalance`). Uses custom RPC URL if configured, otherwise defaults to mainnet-beta.

### `confirm-email`
Handles email confirmation deep links from Supabase Auth.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Mobile App (Expo)                   │
│         React Native + Expo Router + NativeWind       │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌────────┐ │
│  │Dashboard │  │  Pools   │  │ Prove  │  │ Stats  │ │
│  │  Home    │  │ Browse   │  │ Camera │  │ Grid   │ │
│  └────┬─────┘  └────┬─────┘  └───┬────┘  └───┬────┘ │
│       │              │            │            │      │
│  ┌────┴──────────────┴────────────┴────────────┴────┐ │
│  │              Custom React Hooks                   │ │
│  │  use-pools · use-proofs · use-stats · use-coach  │ │
│  │  use-friends · use-leaderboard · use-lifelines   │ │
│  └──────────────────┬───────────────────────────────┘ │
│                     │                                  │
│  ┌──────────────────┴───────────────────────────────┐ │
│  │     Supabase Client + Auth Context + Wallet      │ │
│  └──────────────────┬───────────────────────────────┘ │
└─────────────────────┼────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────┐
│                  Supabase Cloud                      │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │            PostgreSQL Database                │   │
│  │  profiles · pools · pool_members · proofs    │   │
│  │  transactions · friendships · pool_invites   │   │
│  │  daily_habits · activity_log · coach_messages│   │
│  │  ─────────────────────────────────────────── │   │
│  │  RPC Functions · Triggers · RLS Policies     │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │          Edge Functions (Deno)                │   │
│  │  verify-proof ──→ Google Gemini 2.0 Flash    │   │
│  │  voice-coach  ──→ Gemini + ElevenLabs TTS    │   │
│  │  wallet-balance ──→ Solana JSON-RPC          │   │
│  │  confirm-email                               │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │           Supabase Storage                    │   │
│  │           proof-images bucket                 │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │  Gemini  │ │ElevenLabs│ │  Solana  │
   │  AI API  │ │  TTS API │ │Blockchain│
   └──────────┘ └──────────┘ └──────────┘
```

---

## How It Works

1. **Connect Wallet** — Sign in with email, then connect your Phantom wallet to enable SOL staking
2. **Join a Pool** — Browse habit pools (fitness, reading, coding, etc.) or create your own. Stake SOL to commit.
3. **Submit Proof** — Take a daily photo. The AI (Gemini 2.0 Flash) analyzes the image against the pool's habit description and returns a confidence-scored verdict.
4. **Earn Rewards** — Complete your streak and split the pot. Users who break their streak lose their stake to the winners.

---

## Environment Variables

### Mobile App (`get-staked-mobile/lib/supabase.ts`)

The Supabase URL and publishable key are configured directly in the source file. To use your own project:

```typescript
export const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_YOUR_KEY';
```

### Web App (`get-staked-app/.env.production`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Edge Function Secrets

Set these in Supabase Dashboard → Project Settings → Edge Functions:

```
GEMINI_API_KEY=your-google-ai-studio-key
ELEVENLABS_API_KEY=your-elevenlabs-key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com  # optional
```

---

## Deployment

| Component | Platform | URL |
|-----------|----------|-----|
| Mobile App | Expo / EAS Build | `com.getstaked.app` |
| Web App | Vercel | [getstaked.ca](https://getstaked.ca) |
| Landing Page | Netlify | [getstaked-app.netlify.app](https://getstaked-app.netlify.app) |
| Database | Supabase | Managed PostgreSQL |
| Edge Functions | Supabase | Deno runtime |

---

## Resilience

- **AI unavailable** — If Gemini API key is missing or API errors, proofs are auto-approved with a fallback message
- **Wallet not connected** — All non-staking features work without a wallet. Users can browse pools, view leaderboards, and track streaks
- **Edge Function errors** — RPC calls have direct-insert fallbacks. The wallet-balance function falls back to mainnet if custom RPC fails
- **Streak calculation** — Both RPC-based persistence and client-side calculation with `.maybeSingle()` for first-day edge cases

---

## License

This project is licensed under **CC0 1.0 Universal** — see the [LICENSE](LICENSE) file for details.
