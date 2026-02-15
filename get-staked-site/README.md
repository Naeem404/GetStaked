# Get Staked — Landing Page

A lightweight static landing page for Get Staked, built with **Eleventy (11ty)** and deployed on **Netlify**. Single-page marketing site with a dark, OLED-friendly design using the fire/gold accent palette.

> **Back to root:** [../README.md](../README.md)

---

## Quick Start

```bash
npm install
npx @11ty/eleventy --serve
```

The site will be available at `http://localhost:8080`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Generator** | Eleventy (11ty) |
| **Hosting** | Netlify |
| **Style** | Vanilla CSS (custom properties, no framework) |
| **Fonts** | Inter (Google Fonts) |
| **Design** | Dark-only, OLED-friendly, glassmorphism cards |

---

## Structure

```
get-staked-site/
├── src/
│   └── index.html         # Complete single-page site (HTML + embedded CSS)
├── .eleventy.js            # 11ty configuration (src → _site)
├── netlify.toml            # Netlify deploy settings
├── package.json            # Dependencies (@11ty/eleventy)
└── package-lock.json
```

---

## Sections

The landing page includes the following sections in `src/index.html`:

1. **Navigation** — Logo + feature/how-it-works anchor links
2. **Hero** — "Put Your Money Where Your Habits Are" headline with gradient text, Solana badge, CTA buttons
3. **Features Grid** — 6 feature cards: SOL Staking, AI Proof Verification, Accountability Pools, Streak Tracking, AI Voice Coach, Social & Friends
4. **How It Works** — 4-step flow: Connect Wallet → Join Pool → Submit Proof → Earn Rewards
5. **Footer** — Copyright + Solana attribution

---

## Design

- **Background** — `#06060A` (true dark, OLED-friendly) with animated radial gradient glow
- **Surface** — `#0E0E18` cards with `rgba(255,255,255,0.06)` borders
- **Accent** — Fire orange (`#FF6B2C`) to gold (`#F5B731`) gradient for CTAs and highlights
- **Typography** — Inter 400–900 weights
- **Animations** — CSS-only: background drift, gradient text shimmer, card hover lift
- **Responsive** — Mobile-first, single-column below 640px, nav links hidden on mobile

---

## Deployment

Deployed automatically via Netlify on push to main branch.

| Setting | Value |
|---------|-------|
| **Build command** | `npx @11ty/eleventy` |
| **Publish directory** | `_site` |
| **URL** | [getstaked-app.netlify.app](https://getstaked-app.netlify.app) |

The `netlify.toml` file contains the deploy configuration.

---

## Scripts

```bash
npx @11ty/eleventy --serve    # Dev server with hot reload
npx @11ty/eleventy            # Build to _site/
```
