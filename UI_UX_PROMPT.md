# GET STAKED — UI/UX Design & Implementation Prompt

> **Purpose:** Self-contained prompt for an AI model to implement the complete frontend UI/UX. The goal: a **minimal, visual-first** dark interface. Not data-dense like a trading app — clean and spacious like the best mobile-native experiences. Think Snapchat streaks meets GitHub contribution graphs meets crypto wallet. Every screen should breathe. Let the visuals (streak counters, habit grids, fire animations) do the talking instead of walls of text and stats.

---

## 0. CONTEXT IN 30 SECONDS

Get Staked is a PWA (Android-first) where users stake real SOL (Solana cryptocurrency) on their habits. They join competitive pools, submit photo proof of habit completion, an AI verifies it, and winners split the losers' money. An AI voice coach is woven into the experience as a persistent companion. The UI must be **minimal and visual** — communicate through imagery, color, and motion rather than dense text and stats.

**Tech stack:** Next.js 14 App Router, React 18, TypeScript, TailwindCSS, shadcn/ui, Zustand, Solana wallet-adapter, Lucide icons.

**Target device:** Android phone in Chrome / Phantom dApp browser. Design mobile-first at 390x844 viewport. Desktop is nice-to-have.

---

## 1. DESIGN PHILOSOPHY

### 1.1 Design Mantra: "Show, Don't Tell"

Every piece of information should be **visual first, text second**. If a streak can be shown as a Snapchat-style fire counter, don't write "Current streak: 5 days". If long-term consistency can be shown as a GitHub-style grid of colored squares, don't show a table of dates. The UI should feel like opening Instagram or Snapchat — immediate visual understanding, zero cognitive load.

### 1.2 Emotional Design Pillars

| Pillar | Feel | UI Execution |
|--------|------|--------------|
| **Stakes are real** | Tension, gravity | One bold SOL number per screen, gold glow — not buried in stats |
| **Competition is live** | Rivalry, hunger | Side-by-side streak counters with opponents, not dense leaderboard tables |
| **Winning is euphoric** | Triumph, dopamine | Full-screen confetti + coach voice celebration — take over the whole screen |
| **Failing stings** | Loss aversion | Screen-shake + streak counter resets to zero with extinguish animation |
| **Coach is your companion** | Support, presence | Voice coach is always accessible via floating bubble — not hidden in a menu |

### 1.3 Mood Board References

- **Snapchat** — streak counters (fire emoji + number), daily ritual psychology, minimal chrome, full-screen takeovers
- **GitHub Contribution Graph** — the green squares grid that visualizes long-term consistency at a glance. We use fire-orange squares instead of green.
- **Duolingo** — streak flames, gamification, coach character personality, celebration screens
- **Cash App** — minimal financial UI, one big number per screen, clean dark aesthetic, simple flows
- **BeReal** — daily photo proof mechanic, camera-first UX, time-limited submission window

### 1.4 Core UX Principles

1. **One number per screen** — Each screen has ONE hero visual/number. Dashboard = your streak counter. Pool detail = the pot amount. Stats = the habit grid. Don't compete for attention.
2. **Visual > text** — Streak? Show fire + number (Snap style). History? Show colored grid (GitHub style). Progress? Show filled dots, not "Day 5 of 14" text.
3. **Breathe** — Generous whitespace between sections. 24-32px gaps between content blocks. Let the dark background do the work. Resist filling every pixel.
4. **Coach is ambient** — The AI voice coach lives as a floating bubble on every screen. It speaks contextually without the user navigating to a separate page. Like a helpful ghost that's always there.
5. **2-tap max** — From home, any action (submit proof, join pool, hear coach) is ≤ 2 taps.

---

## 2. VISUAL DESIGN SYSTEM

### 2.1 Color Palette

```
BACKGROUNDS
  --bg-primary:       #06060A     /* True dark, OLED-friendly */
  --bg-surface:       #0E0E18     /* Card/surface */
  --bg-elevated:      #161625     /* Modals, bottom sheets */
  --bg-hover:         #1C1C30     /* Hover states */

BRAND
  --brand-fire:       #FF6B2C     /* Primary CTA, streaks, energy */
  --brand-gold:       #F5B731     /* Money, SOL, rewards */
  --brand-ember:      #FF4500     /* Urgency, approaching deadline */

SEMANTIC
  --success:          #00E878     /* Verified, wins, active streaks */
  --danger:           #FF2D55     /* Failed, lost SOL, broken streaks */
  --warning:          #FFB020     /* At risk, flagged, low time */
  --info:             #5B7FFF     /* Informational, links */

TEXT
  --text-primary:     #F2F2F7     /* Slightly warm white */
  --text-secondary:   #8888A0     /* Labels, metadata */
  --text-muted:       #4A4A60     /* Disabled, placeholder */

GRADIENTS
  --gradient-fire:    linear-gradient(135deg, #FF6B2C 0%, #F5B731 100%)
  --gradient-ember:   linear-gradient(135deg, #FF4500 0%, #FF6B2C 100%)
  --gradient-win:     linear-gradient(135deg, #00E878 0%, #00B4D8 100%)
  --gradient-loss:    linear-gradient(135deg, #FF2D55 0%, #FF6B2C 100%)
  --gradient-gold:    linear-gradient(135deg, #F5B731 0%, #FF9F1C 50%, #F5B731 100%)

GLOWS
  --glow-fire:        0 0 20px rgba(255,107,44,0.3)
  --glow-gold:        0 0 20px rgba(245,183,49,0.3)
  --glow-success:     0 0 20px rgba(0,232,120,0.3)
  --glow-danger:      0 0 15px rgba(255,45,85,0.25)
```

### 2.2 Typography

```
FONTS
  Primary:  "Inter" (variable weight) — body, UI
  Mono:     "JetBrains Mono" — SOL amounts, wallet addresses, countdowns
  Display:  "Inter" weight 800 — hero headlines only

SCALE (mobile)
  --text-xs:   0.6875rem/11px   /* Metadata, timestamps */
  --text-sm:   0.8125rem/13px   /* Secondary labels */
  --text-base: 0.9375rem/15px   /* Body text */
  --text-lg:   1.0625rem/17px   /* Card titles */
  --text-xl:   1.25rem/20px     /* Section headers */
  --text-2xl:  1.5rem/24px      /* Page titles */
  --text-3xl:  2rem/32px        /* Hero numbers */
  --text-4xl:  2.5rem/40px      /* Landing hero */

WEIGHTS: 400 body, 500 labels, 600 card titles/buttons, 700 headers, 800 hero display
```

### 2.3 Spacing & Layout

```
BASE UNIT: 4px
Screen padding: 16px horizontal | Card padding: 16px | Card radius: 16px
Button radius: 12px | Small element radius: 8px
Bottom nav: 64px + safe-area-inset-bottom
Max content width: 480px (centered on larger screens)
```

### 2.4 Elevation

```
Cards use subtle borders (dark theme best practice):
  Level 1 (Card):     bg-surface, border: 1px solid rgba(255,255,255,0.06)
  Level 2 (Elevated): bg-elevated, border: 1px solid rgba(255,255,255,0.08)
  Level 3 (Modal):    bg-elevated, border: 1px solid rgba(255,255,255,0.10),
                      shadow: 0 -4px 32px rgba(0,0,0,0.5)

GLOW (sparingly on interactive elements):
  Active pool: border rgba(255,107,44,0.3) + glow-fire
  Win amount:  text-shadow glow-gold
  Verified:    border rgba(0,232,120,0.3) + glow-success
```

### 2.5 Icons — Lucide React (24px default, 20px compact, 16px inline)

```
Flame=Streaks | Wallet=SOL | Camera=Proof | ShieldCheck=Verified
Trophy=Winner | Users=Participants | Timer=Countdown | TrendingUp=Analytics
Mic=VoiceCoach | Zap=Energy | AlertTriangle=Warning | XCircle=Failed
Plus=CreateFAB | Target=Habits | Crown=#1 | Medal=#2-3
```

---

## 3. COMPONENT SPECIFICATIONS

### 3.1 Bottom Navigation Bar

Fixed bottom, full width, 64px + safe area. `bg-elevated` with `backdrop-blur(20px)`, top border `1px solid rgba(255,255,255,0.06)`. **Only 4 tabs** — the coach is a floating bubble, NOT a tab.

**4 tabs:**
| Tab | Icon | Label |
|-----|------|-------|
| Home | LayoutDashboard | Home |
| Pools | Users | Pools |
| **Prove** | Camera | Prove |
| Stats | BarChart3 | Stats |

**Center "Prove" tab** is special: elevated -12px above bar, 56px circle with `gradient-fire` bg, Camera icon 28px white. Pulsing `glow-fire` animation when user has pending proofs. Active tab: `brand-fire` icon+label + 4px dot below. Inactive: `text-muted`. Keep the nav ultra-clean — icons only, labels appear only on active tab.

### 3.2 Pool Card

`bg-surface`, `rounded-2xl`, Level 1 border. 16px padding.

- **Row 1:** Habit emoji/icon + habit name (`text-lg`, `font-600`). Right: status badge (WAITING=amber, ACTIVE=green, SETTLING=gold, COMPLETED=muted).
- **Row 2:** Three stat columns: `[Stake: 0.5 SOL]` gold mono | `[Players: 4/6]` | `[Duration: 14d]`. Labels `text-xs text-secondary`, values `text-base font-600`.
- **Row 3:** Overlapping player avatar circles (36px, stacked -8px). Green ring=active, red=failed, gray=pending. Overflow: "+3" badge.
- **Row 4 (if ACTIVE):** Progress bar (6px, `rounded-full`, `gradient-fire` fill) + "5 days left" `text-secondary`.

**Interaction:** Whole card tappable. Press: `scale(0.98)` 100ms. Hover: border brightens.

**Variants:**
- Hot/Featured: `gradient-fire` top border 2px + fire glow
- User's pool: left accent bar 3px `brand-fire`
- Completed: opacity 0.6, green COMPLETED badge
- Settling: pulsing gold border

### 3.3 SOL Amount Display

Inline flex: Solana logo (16px) + amount + "SOL". Font: JetBrains Mono `font-700`, color `brand-gold`. Amounts >1 SOL: 2 decimals. <1 SOL: up to 4 decimals.

**Variants:** Standard=gold | Winning=gold+glow+sparkle | Losing=danger+strikethrough | Staked=gold+lock icon | Large hero=`text-3xl gradient-gold` text via `background-clip`.

**Animation:** Value changes tick from old→new over 600ms ease-out. On win: burst of tiny gold particles (CSS, 4-5 dots).

### 3.4 Snap-Style Streak Counter — THE signature visual

Inspired directly by Snapchat streaks. This is the most important visual in the app.

**Structure:** A single bold element — flame emoji/icon + large number, side by side.

```
  🔥 5       (small, inline — in pool cards, leaderboard rows)
  
  🔥
  12        (large, stacked — hero on dashboard, center of screen)
```

**Sizes:**
- **Inline (sm):** 20px flame icon + `text-lg` number, horizontal. Used in lists and cards.
- **Hero (xl):** 64px flame icon + `text-4xl` number (`JetBrains Mono, font-800`), vertically stacked, centered. Used as the dashboard hero element.

**Flame intensity scales with streak length:**
| Days | Flame Color | Animation | Extras |
|------|------------|-----------|--------|
| 0 | Gray, static | None | Dash instead of number |
| 1-3 | `brand-fire` orange | Gentle flicker (opacity 0.85-1.0, 2s) | None |
| 4-7 | Bright orange-gold | Moderate flicker + slight scale pulse | None |
| 8-14 | Gradient orange→gold | Active flicker + ember particles rise from flame (CSS pseudo-elements) | Subtle glow behind number |
| 15+ | Gold core with white-hot center | Dramatic flicker + embers + heat wave rings radiating outward | Number also gets `gradient-gold` treatment |

**Counter animation on increment:** Number flips/rolls upward (old number slides up + fades, new number slides in from below) with a brief flame burst (scale 1→1.3→1, 400ms, ease-bounce). Play a subtle fire "whoosh" sound if audio enabled.

**Counter animation on reset (streak break):** Flame extinguishes — shrinks + rotates(-15deg) + fades to gray smoke puff. Number tumbles to 0. Screen shakes briefly (2px, 200ms). Devastating to watch — that's the point.

### 3.5 GitHub-Style Habit Grid — Long-term visual

Directly inspired by GitHub's contribution graph. Shows habit completion density over weeks/months at a glance.

**Structure:** 7-row (Mon–Sun) × N-column grid of small rounded squares. Each square = one day.

**Square states:**
```
⬛ Empty (no data / future):  bg-hover (#1C1C30), very dim
🟧 Missed day:               transparent with subtle dotted border (danger, 0.3 opacity)
🟨 1 proof verified:         brand-fire at 30% opacity
🟧 2 proofs verified:        brand-fire at 60% opacity  
🟥 3+ proofs verified:       brand-fire at 100% — fully lit
⬜ Today (not yet submitted): White border ring (pulsing if proof is due)
✅ Today (submitted):        brand-fire 100% + white border ring
```

**Layout:**
- Square size: 14px × 14px, 3px gap, 2px border-radius
- Day labels on left: M T W T F S S in `text-xs text-muted`
- Month labels on top: Jan, Feb, etc. in `text-xs text-muted`
- Default view: last 12 weeks (fits nicely on mobile width)
- Scrollable horizontally to see further back
- Tap a square: tooltip shows date + "2 proofs verified" or "Missed"

**Color note:** Use `brand-fire` (orange) instead of GitHub's green. On dark bg this creates a warm, fiery heat-map effect. The denser your consistency, the more "on fire" the grid looks.

**Placement:** Hero element on the Stats screen. Also shown as a compact 4-week mini version on the Dashboard.

### 3.6 Coach Floating Bubble — Integrated AI companion

The voice coach is NOT a separate page. It's a **persistent floating bubble** visible on every screen (except camera/proof flow).

**Bubble appearance:**
- 52px circle, positioned bottom-right, 16px from edge, above the nav bar
- Background: gradient matching selected persona color (ember red / electric gold / soft teal)
- Icon: Mic icon (20px, white) when idle
- Border: 2px solid white at 15% opacity
- Subtle breathing animation: scale 1.0→1.03→1.0, 3s loop (it's "alive")

**States:**

| State | Visual | Behavior |
|-------|--------|----------|
| Idle | Mic icon, breathing animation | Tap → opens coach interaction sheet |
| Has message | Pulsing glow (persona color) + chat dot badge | Coach has something to say (streak at risk, congrats, etc.) |
| Speaking | Animated sound waves emanate from bubble (3 concentric arcs, pulsing outward) | Audio playing, tap to pause |
| Listening | Waveform bars inside bubble (if voice input supported) | Processing user voice |

**On tap — Coach Interaction Sheet (bottom sheet, 60% screen height):**
- Slides up from bottom, rounded-t-3xl
- Top: Persona avatar (48px) + name ("Drill Sergeant") + [Change] link
- Middle: Latest coach message as a chat bubble (bg-elevated, rounded-2xl, `text-base`)
  - Below message: `[▶ Play]` button to hear it spoken, waveform visualization
- Quick actions row:
  - `[Motivate Me]` — random pep talk
  - `[How Am I Doing?]` — streak/pool summary spoken aloud  
  - `[SOS]` — broadcast struggle to pool mates + get encouragement
- Bottom: Small "Settings" link to change persona, toggle voice on/off
- Swipe down or tap outside to dismiss

**Contextual triggers (coach bubble pulses + auto-shows message):**
- Proof submitted → "Day 5! Two people already dropped."
- 6 PM and no proof → "Hey. Proof is due. Don't let 0.5 SOL walk."
- Someone in pool failed → "One down. Pot just got bigger."
- Pool won → Full-screen takeover celebration + coach audio auto-plays
- Pool lost → Coach message: "0.5 SOL gone. 11 days though. Run it back."

**Persona picker (inside coach sheet → Settings):**
Three horizontal cards, swipeable:
- **Drill Sergeant** — ember red accent, military star icon, "No excuses. No mercy."
- **Hype Beast** — electric gold accent, lightning bolt, "LET'S GOOO!"
- **Gentle Guide** — soft teal accent, leaf icon, "Steady progress. You got this."
Each with `[▶ Preview]` audio sample. Selected = gradient border + check.

### 3.7 Countdown Timer

| State | Color | Behavior |
|-------|-------|----------|
| >24h | `text-secondary` | Static "6d 14h remaining" |
| <24h | `warning` | Updates every min "14h 32m left" |
| <6h | `brand-ember`, gentle pulse | "2h 47m left", bg tints red |
| <1h | `danger`, fast pulse | "23:41" MM:SS live ticking |
| Expired | `danger` static | "OVERDUE" badge, red glow |

JetBrains Mono for numbers. Blinking colon on MM:SS (opacity toggle 500ms).

### 3.8 Verification Result Card

Full-screen overlay after AI analyzes proof.

**APPROVED (≥70% confidence):**
- Green-tinted vignette edges
- Animated SVG checkmark (stroke draws in, 800ms)
- "VERIFIED" `text-2xl success font-700`
- Photo with `2px solid success` border
- AI reasoning card with Gemini icon
- Circular confidence indicator (94%)
- CTA: "Nice! Keep Going" `gradient-fire` full-width
- Subtle success haptic vibration

**REJECTED (<40%):**
- Red vignette, animated X mark, "NOT VERIFIED" danger
- Photo with red border + overlay
- Flags as red badges
- CTAs: "Retry" primary + "Dispute" outline

**FLAGGED (40-69%):**
- Amber vignette, warning triangle, "NEEDS REVIEW" warning
- "Pool members will vote" explanation

### 3.9 Buttons

| Variant | Style |
|---------|-------|
| Primary | `gradient-fire`, white text, shadow `rgba(255,107,44,0.3)` |
| Secondary | `bg-elevated`, border, `text-primary` |
| Destructive | flat `danger` bg, white text |
| Outline | transparent, `brand-fire` border + text |
| Ghost | transparent, `text-secondary`, hover `bg-hover` |
| Gold | `gradient-gold`, dark text — "Claim Winnings" |

Height 52px default. Radius 12px. `font-600`. Press: `scale(0.97)`. Disabled: opacity 0.4. Loading: spinner replaces text.

### 3.10 Wallet Connection Button

**Disconnected:** `gradient-fire`, Phantom ghost icon left, "Connect Wallet", shimmer sweep animation (3s loop).
**Connecting:** "Connecting..." + spinner, icon pulses.
**Connected:** Compact header pill — `bg-elevated`, border. Left: generated avatar from wallet. Center: truncated address in mono. Right: SOL balance in gold. Tap: dropdown (full address, explorer link, disconnect).

---

## 4. SCREEN-BY-SCREEN SPECIFICATIONS

### 4.1 Landing Page (Unauthenticated)

Single scroll, no nav bar. Dark bg with subtle radial fire glow at center-bottom. Optional sparse ember particles floating up (CSS-only).

**Hero (viewport height - 20%):**
- "GET STAKED" logotype: Inter 800, `text-4xl`, `gradient-gold` text, uppercase, `letter-spacing: 0.05em`
- Thin flame divider (gradient-fire, 60px wide, 2px tall, centered)
- Tagline: "Discipline Pays. Literally." `text-2xl font-700 text-primary`
- Sub: "Stake real money on your habits. AI verifies you did them. Win the pot." `text-base text-secondary` max-width 300px centered
- CTA: `[Connect Wallet]` xl size, gradient-fire, full-width
- Below: "Powered by Solana" + logo, `text-xs text-muted`

**How It Works (scroll down):**
Three step cards connected by vertical dashed line (32px gap):

1. Target icon in fire circle — "**STAKE** — Join a pool & stake SOL on your habit"
2. Camera icon in gradient circle — "**PROVE** — Submit daily photo proof. AI verifies."
3. Trophy icon in gold circle — "**WIN** — Complete the challenge, win the pot"

Each: `bg-surface rounded-2xl p-6` centered text.

**Bottom CTA repeat:** "Ready to put your money where your habits are?" + Connect Wallet button.

### 4.2 Dashboard (Home) — MINIMAL

The dashboard is **not** a wall of stats. It's three things stacked vertically with generous spacing: your streak, your grid, and your active pools. That's it.

**Sticky top bar (56px):** Left: "GET STAKED" small logotype `text-lg gradient-gold`. Right: Wallet pill (avatar + "2.45 SOL" in gold). Clean, no clutter.

**SECTION 1 — Streak Hero (centered, 40% of viewport)**

The Snap-style streak counter (component 3.4) at **hero (xl) size**, dead center of the screen. This is the first and biggest thing you see.

```
        🔥
        12
   "day streak"
```

- 64px flame icon + `text-4xl` number below it, centered
- Below number: "day streak" in `text-sm text-secondary`
- Below that: a single line — "Best: 21 days" in `text-xs text-muted` (for context)
- If streak is 0: gray flame + "—" + "Start a streak" in `text-sm text-secondary`
- Whole section has generous vertical padding (48px top, 32px bottom)

**SECTION 2 — Mini Habit Grid (compact)**

The GitHub-style habit grid (component 3.5) in **compact 4-week** view. Centered, no labels, just the colored squares. Gives instant visual history without any text. Tap → navigates to full Stats page.

- 7 rows × 4 columns (28 days), centered horizontally
- No day/month labels in this compact version (too small)
- Below grid: "View full history →" link in `text-xs brand-fire`
- 24px gap above and below

**SECTION 3 — Active Pools (simple cards)**

Header: "Active" `text-lg font-600` + pool count as a small `brand-fire` badge. No "View All" link needed since there are usually only 1-3 active pools.

Each active pool as a **slim card** (not the full Pool Card component — slimmer):
- Single row: Habit emoji + name + Snap streak counter (inline sm) on the right
- Below: thin progress dots (not a bar — individual dots, filled/unfilled, like ●●●●○○○ for Day 4 of 7)
- Below dots: "0.5 SOL staked" gold mono, tiny
- If proof needed today: entire card gets a subtle `brand-ember` left border + pulsing dot
- Tap card → Pool Detail

Max 3 cards visible. If more: "+ 2 more pools" link.

**Empty state (no pools):** Centered illustration area + "No active stakes" `text-lg` + "Put your SOL where your mouth is" `text-sm text-secondary` + `[Browse Pools]` button.

**NO activity feed, NO stats row, NO wallet summary card.** Keep it clean. Coach bubble floats in the corner. Bottom nav below. Done.

### 4.3 Browse Pools

Clean list with minimal filtering. Don't over-engineer discovery for an MVP.

**Top:** "Pools" `text-2xl font-700`. Below: single row of filter chips (horizontal scroll): [All] [Fitness] [Health] [Learning] [Other]. Active: `bg-fire` white text. Inactive: `bg-elevated text-secondary`. No search bar (overkill for MVP pool count).

**Pool cards** (component 3.2) in a vertical list, 12px gaps. Keep generous 24px padding on sides.

**FAB:** Bottom-right, 56px, `gradient-fire`, Plus icon, shadow `rgba(255,107,44,0.4)`. Tap → Create Pool sheet.

**Empty state:** "No pools yet. Be the first." + `[Create Pool]` button.

### 4.4 Create Pool (Full Page)

Slides up. Close X top-right. "Create a Stake Pool" `text-2xl font-700`.

**Form (16px gaps):**

1. **Habit Name** — Input + quick-pick chips: [Gym] [Running] [Reading] [Cold Shower] [Eat Healthy] [Code Daily]
2. **Proof Description** — Textarea. Helper: "AI will verify photos match this"
3. **Stake Amount** — Large SOL display (mono, `text-2xl`, gold) + slider 0.1–5.0 SOL + quick picks [0.1] [0.25] [0.5] [1.0] [2.0]. USD conversion below.
4. **Duration** — Segmented: [3d] [7d] [14d] [30d]. Default 7d.
5. **Frequency** — Segmented: [Daily] [5x/week] [3x/week]. Default Daily.
6. **Max Players** — Stepper [-] [4] [+] range 2-10.
7. **Options** — Two toggles: "Escalating Stakes" (doubles each week) + "Private Pool" (invite only).

**Sticky bottom:** Summary card (habit, stake, duration, "Total pot if full: 2.0 SOL" gold). CTA: `[Create Pool & Stake 0.5 SOL]` xl gradient-fire. Note: "You'll deposit 0.5 SOL to escrow" `text-xs text-muted`.

### 4.5 Pool Detail — VISUAL FIRST

Two-section layout: the pot + the people. Not a data dump.

**Top bar:** Back arrow + habit name. No overflow menu (minimal).

**SECTION 1 — The Pot (centered hero)**
- "POOL POT" `text-xs text-secondary` letter-spaced
- "2.00 SOL" `text-3xl mono gradient-gold font-800` with subtle gold glow
- Progress dots below (not a bar): ●●●●●○○○○ (Day 5 of 9) in `brand-fire` filled / `text-muted` unfilled
- Countdown timer component beneath dots
- 40px vertical padding — let this breathe

**SECTION 2 — Players as streak cards (not a leaderboard table)**

Instead of a ranked list, show each player as a **visual card** with their streak front and center:

```
┌──────────────────────────┐
│  [Avatar]  Alice     🔥 5  │
│  ●●●●●○○○○         │
└──────────────────────────┘
```

Each player card:
- Avatar (32px) + display name + Snap streak counter (inline) on the right
- Below: their personal progress dots (filled = verified days)
- If failed: card is dimmed (opacity 0.4), streak shows ❌ 0, progress dots show where they broke
- Current user card: subtle `brand-fire` border glow
- Cards sorted by streak length descending (winner at top naturally)

**SECTION 3 — Your Action**

If proof needed today:
- Full-width `[Submit Proof]` button, `gradient-fire`, xl size
- Below: proof description reminder in `text-xs text-secondary italic`

If proof already submitted: green checkmark + "Verified today" text. No button.

**Bottom (if WAITING, user not member):** Sticky `[Join & Stake 0.5 SOL]` gradient-fire.

**Bottom (if COMPLETED):** Full-screen takeover: confetti + large "YOU WON" or "STREAK BROKEN" + SOL amount + `[Claim]` gold button or `[Find New Pool]`.

### 4.6 Proof Submission Flow

**Screen 1 — Camera:** Full-screen live feed. Top overlay: close X + camera flip. Middle: dashed guide frame (white 20% opacity) + habit/proof requirement text in dark pill. Bottom: 72px capture button (white circle, shrink on press, white flash). Fallback: `<input type="file" accept="image/*" capture="camera">` with "Upload from Gallery" button.

**Screen 2 — Review:** Photo large `rounded-2xl`. "Submit this as proof?" + pool info. `[Submit for Verification]` gradient-fire + `[Retake]` ghost.

**Screen 3 — Verifying:** Photo shrinks to top. Pulsing brain/sparkle icon with orbiting dots. "AI is analyzing your proof..." + shimmer loading bar. 2-5 seconds.

**Screen 4 — Result:** Verification Result Card (see 3.8). Dismissal returns to pool detail with updated streak.

### 4.7 Stats — THE GRID PAGE

This page is visually dominated by the GitHub-style habit grid. It's the "long view" of your consistency. Minimal text.

**SECTION 1 — Full Habit Grid (hero, ~50% of viewport)**

The GitHub-style grid (component 3.5) at full size — 12 weeks, with day labels (M T W T F S S) and month labels. This IS the page. It should feel like looking at your GitHub profile — instant visual read of "how consistent am I?"

- Below grid: legend bar — "Less" [ dim → bright squares ] "More"
- Tap any square for tooltip detail

**SECTION 2 — Three number cards (simple, horizontal row)**

Three small `bg-surface rounded-xl` cards, equal width:
- 🔥 "12" + "current streak" — `brand-fire`
- 🏆 "83%" + "win rate" — `success`
- 💰 "+4.2 SOL" + "total earned" — `brand-gold`

Each: icon top, big number middle, label bottom. `text-2xl` number, `text-xs` label. No charts, no trend arrows, no sparklines. Just the numbers.

**SECTION 3 — Coach Insight (single card)**

One AI insight card (not a list of 4). Show the single most relevant insight:
- `bg-surface rounded-2xl`, `info` left accent bar
- Sparkle icon + insight text: "You're strongest on Tuesdays — 95% success"
- `[▶ Hear More]` button — taps to coach bubble for full spoken analysis
- Rotates/changes daily

That's the entire page. Grid + 3 numbers + 1 insight. Clean.

### 4.8 Voice Coach — NO DEDICATED PAGE

The voice coach does **NOT** have its own page/tab. It lives entirely in the **Coach Floating Bubble** (component 3.6) which is present on every screen. The persona picker and settings are accessed via the coach interaction sheet (bottom sheet on bubble tap). This keeps the coach feeling integrated and ambient rather than a siloed feature you have to navigate to.

See component 3.6 for full interaction spec.

### 4.9 Transaction Confirmation Modal

Bottom sheet over dark overlay (`bg-black/60`).

"Confirm Transaction" `text-xl font-700`. Detail card: Action, Stake Amount (gold mono), USD value, Network ("Solana Devnet" + green dot), Escrow address, Network Fee, Total. Warning: "Funds locked in escrow until pool ends" `text-xs warning`.

`[Confirm & Sign]` gradient-fire xl + `[Cancel]` ghost. Processing: spinner + "Check your Phantom wallet". Success: green checkmark + "View on Solana Explorer →". Auto-dismiss 3s.

---

## 5. ANIMATION & MOTION

### 5.1 Tokens

```css
--duration-fast:    100ms;   /* Press feedback */
--duration-normal:  200ms;   /* Standard transitions */
--duration-smooth:  300ms;   /* Page transitions */
--duration-slow:    500ms;   /* Celebrations */
--duration-dramatic: 800ms;  /* Win/loss reveals */

--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### 5.2 Key Animations

**Page transitions:** Forward=slide in from right 300ms. Back=slide right, previous scales 0.95→1. Sheets=slide up spring + overlay fade.

**Cards:** Tap `scale(0.98)` 100ms → release `scale(1)` 200ms bounce. Appear on scroll: fade + `translateY(20px→0)` 300ms, stagger 50ms.

**Streak counter (Snap-style):** Flame idle: oscillate `translateY ±1px`, opacity 0.85-1.0, 2s. On increment: number rolls upward (old slides up + fades, new slides in from below) + flame burst scale 1→1.3→1 400ms. On streak break: flame shrinks + rotates(-15deg) + gray smoke puff, number tumbles to 0, screen shakes (2px, 200ms).

**Habit grid (GitHub-style):** Squares fade in staggered left-to-right on page load (20ms per column). Today's square pulses gently if proof is pending. On proof verified: today's square fills with a quick color-flood animation (100ms, ease-out).

**Coach bubble:** Breathing: scale 1.0→1.03→1.0, 3s loop. Has-message: glow pulses (persona color, 1.5s loop). Speaking: 3 concentric arcs expand outward from bubble, 800ms loop. Sheet slides up with spring easing.

**SOL changes:** Increase: counting tick-up 600ms + gold glow pulse. Decrease: tick-down + red flash + shake (±2px, 3 cycles, 300ms).

**Verification checkmark:** SVG `stroke-dashoffset` draw-in 800ms. Confetti on pool win: 30-40 colored particles burst from center, gravity fall, fade 2s. Colors: gold, fire, white, green.

**Loading:** Skeleton shimmer sweep 1.5s loop. Spinner: rotating gradient-fire circle 800ms. AI thinking: pulsing brain + 3 orbiting dots.

**Progress dots:** Fill left-to-right with stagger (50ms each) on page load. New dot fills with a brief scale pop (1→1.3→1, 200ms).

**Bottom nav:** Tab switch: icon scale 1→1.15→1 + color 200ms. Center "Prove" button: float `translateY ±2px` 3s loop. Icons-only; label fades in (150ms) only on active tab.

---

## 6. RESPONSIVE & ACCESSIBILITY

**Breakpoints:** 320-480px (primary) | 481-640px (minor tweaks) | 641-1024px (center 480px max) | 1025px+ (narrow centered or phone mockup frame).

**Dark mode ONLY.** No toggle. OLED friendly, crypto aesthetic, fire/gold pops on dark.

**Accessibility minimums:** WCAG AA contrast (4.5:1 text, 3:1 large). Touch targets ≥ 44px. Focus rings on keyboard nav (2px `brand-fire` outline). `aria-label` on icon-only buttons. `role="alert"` on verification results. Reduced-motion: respect `prefers-reduced-motion` — disable particles, simplify transitions to opacity-only.

---

## 7. PWA REQUIREMENTS

- `manifest.json`: name "Get Staked", short_name "GetStaked", icons 192+512, `display: "standalone"`, `theme_color: "#06060A"`, `background_color: "#06060A"`, `start_url: "/"`
- Service worker via `next-pwa` for offline shell + caching
- `beforeinstallprompt` handler → manual "Install App" button in settings
- Splash screen: bg-primary + centered logo + gradient-fire
- Status bar: `<meta name="theme-color" content="#06060A">`

---

## 8. IMPLEMENTATION NOTES

### File Structure
```
src/
  app/
    layout.tsx          — Root layout, fonts, providers, coach bubble
    page.tsx            — Landing page (unauthenticated)
    (app)/
      layout.tsx        — Authenticated layout + bottom nav + coach bubble
      dashboard/        — Streak hero + mini grid + active pools
      pools/            — Browse pools + [id] pool detail
      create-pool/      — Create pool form (full page sheet)
      prove/            — Camera → review → verify flow
      stats/            — Full habit grid + 3 numbers + insight
  components/
    ui/                 — shadcn/ui primitives
    streak-counter.tsx  — Snap-style fire + number (sm/xl sizes)
    habit-grid.tsx      — GitHub-style contribution grid (compact/full)
    coach-bubble.tsx    — Floating bubble + interaction sheet
    pool-card.tsx       — Pool card for browse list
    pool-slim-card.tsx  — Slim card for dashboard active pools
    player-card.tsx     — Player streak card for pool detail
    progress-dots.tsx   — Filled/unfilled dot row (replaces progress bars)
    sol-amount.tsx      — Gold SOL display with variants
    countdown-timer.tsx — Urgency-aware timer
    verification-result.tsx — Full-screen verify overlay
    wallet-button.tsx   — Connect/connected pill
    bottom-nav.tsx      — 4-tab nav with centered Prove button
  lib/
    utils.ts
    constants.ts
  stores/
    wallet-store.ts     — Zustand
    pool-store.ts
    coach-store.ts      — Persona, messages, audio state
  styles/
    globals.css         — CSS variables, custom animations, keyframes
```

### TailwindCSS Config Highlights
Extend theme with all custom colors, fonts, and animation keyframes from this doc. Use `tailwind.config.ts` to define:
- Custom colors matching the palette
- Font families (Inter, JetBrains Mono)
- Custom keyframes: `flicker`, `float`, `shimmer`, `pulse-glow`, `ember-rise`, `confetti-fall`
- Custom animation durations matching tokens

### shadcn/ui Components to Install
`button card dialog input select badge avatar progress tabs toast switch slider separator dropdown-menu sheet popover tooltip`

### Key Third-Party
- `framer-motion` — streak counter roll, confetti, coach sheet, page transitions
- `@solana/wallet-adapter-react-ui` — wallet modal base (restyled to match theme)
- No charting library needed — the habit grid + 3 number cards replace all charts

---

## 9. DEMO-READY STATES

Pre-populate the app with realistic demo data so every screen looks alive:

- **12 weeks of habit grid data** — mix of dense weeks and sparse weeks so the grid looks organic, not uniform
- **3 active pools** with various progress (Day 2, Day 8, Day 14)
- **6-8 players** across pools with varied streaks (some failed, some blazing)
- **Proof history** with AI verification results at different confidence levels
- **3 pre-cached coach audio clips** per persona (save API quota for live demo)
- **1 coach insight** ready to display on stats page

Include a `DEMO_MODE` env flag that loads seeded data from a JSON fixture file, bypassing live APIs.

---

## 10. BUILD ORDER

Build in this exact order to have a demoable app at each step:

1. **Design system** — globals.css with all colors, fonts, keyframes. Tailwind config.
2. **Bottom nav** (4 tabs) + app layout shell
3. **Landing page** — hero + how-it-works + connect wallet
4. **Streak counter component** (Snap-style, sm + xl)
5. **Habit grid component** (GitHub-style, compact + full)
6. **Dashboard** — streak hero + mini grid + slim pool cards
7. **Coach floating bubble** + interaction sheet
8. **Browse pools** + pool card component
9. **Pool detail** — pot hero + player streak cards + submit proof CTA
10. **Proof submission flow** — camera → review → verify → result
11. **Stats page** — full grid + 3 numbers + insight card
12. **Transaction confirmation** modal
13. **Polish** — animations, loading states, empty states

---

*Minimal. Visual. Breathe. Snap streaks for the daily hit. GitHub grid for the long game. Coach bubble always in the corner. Build it clean. Ship fire.*
