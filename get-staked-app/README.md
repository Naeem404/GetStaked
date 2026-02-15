# Get Staked — Web App

The Next.js web application for Get Staked. Serves as both the **marketing landing page** and the **authenticated web dashboard** with live pool data, leaderboards, and Supabase auth. Also hosts `.well-known` routes for **iOS Universal Links** and **Android App Links** (Phantom wallet deep linking).

> **Back to root:** [../README.md](../README.md)

---

## Quick Start

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000` (Turbopack dev server).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5.7 |
| **Styling** | Tailwind CSS 3 + tailwindcss-animate |
| **UI Components** | shadcn/ui (40+ Radix-based primitives) |
| **Icons** | Lucide React |
| **Charts** | Recharts 2.15 |
| **Auth** | Supabase SSR (`@supabase/ssr`) |
| **Forms** | React Hook Form + Zod validation |
| **Fonts** | Inter (body) + Space Grotesk (display) via `next/font` |
| **Theme** | Dark-only, OLED-friendly (fire/gold accent palette) |

---

## Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Marketing landing — hero, how it works, live pools, leaderboard, voice coach showcase, streak heatmap, features, CTA |
| `/auth` | `app/auth/page.tsx` | Authentication (sign in / sign up) |
| `/dashboard` | `app/dashboard/page.tsx` | Authenticated user dashboard |
| `/pools` | `app/pools/page.tsx` | Browse all pools |
| `/pool/[id]` | `app/pool/[id]/page.tsx` | Individual pool detail (dynamic route) |
| `/leaderboard` | `app/leaderboard/page.tsx` | Global leaderboard |
| `/.well-known/apple-app-site-association` | `app/.well-known/...` | iOS Universal Links for Phantom wallet |
| `/.well-known/assetlinks.json` | `app/.well-known/...` | Android App Links for Phantom wallet |

---

## Components

### App Components

| Component | File | Description |
|-----------|------|-------------|
| **Navbar** | `components/navbar.tsx` | Navigation bar with auth state |
| **Hero** | `components/hero.tsx` | Landing hero section with gradient text + CTA |
| **How It Works** | `components/how-it-works.tsx` | 4-step process cards |
| **Live Pools** | `components/live-pools.tsx` | Live pool cards with real Supabase data |
| **Leaderboard** | `components/leaderboard.tsx` | Global leaderboard component |
| **Voice Coach** | `components/voice-coach.tsx` | AI voice coach showcase section |
| **Streak Heatmap** | `components/streak-heatmap.tsx` | GitHub-style habit grid visualization |
| **Features** | `components/features.tsx` | Feature cards grid |
| **CTA Section** | `components/cta-section.tsx` | Bottom call-to-action |
| **Footer** | `components/footer.tsx` | Site footer |
| **Theme Provider** | `components/theme-provider.tsx` | Dark theme provider via next-themes |

### shadcn/ui Library (`components/ui/`)

Full component library: accordion, alert, avatar, badge, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, and more.

---

## Hooks

| Hook | File | Description |
|------|------|-------------|
| **use-pools** | `hooks/use-pools.ts` | Fetch pools from Supabase |
| **use-leaderboard** | `hooks/use-leaderboard.ts` | Leaderboard data fetching |
| **use-mobile** | `hooks/use-mobile.tsx` | Responsive breakpoint detection |
| **use-toast** | `hooks/use-toast.ts` | Toast notification state |

---

## Lib

| File | Description |
|------|-------------|
| `lib/supabase.ts` | Supabase browser client via `@supabase/ssr` `createBrowserClient` |
| `lib/auth-context.tsx` | `AuthProvider` + `useAuth` for web session management |
| `lib/database.types.ts` | Auto-generated TypeScript types from Supabase schema |
| `lib/utils.ts` | Utility functions (`cn` class merger, etc.) |

---

## Configuration

### Supabase

Update `lib/supabase.ts` with your project credentials:

```typescript
export const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_YOUR_KEY';
```

### Deployment

The app is deployed to **Vercel** with a custom domain:

| Environment | URL |
|-------------|-----|
| Production | [getstaked.ca](https://getstaked.ca) |
| Preview | [get-staked.vercel.app](https://get-staked.vercel.app) |

---

## Scripts

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
```
