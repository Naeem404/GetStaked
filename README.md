# GET STAKED — Master Build Prompt & System Architecture
## Hackathon MVP — 1 Day Build — Android-First (PWA)

---

## TABLE OF CONTENTS
1. [Project Overview & Philosophy](#1-project-overview)
2. [Tech Stack Decision](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Feature Tiers & Build Schedule](#4-feature-tiers)
5. [Detailed Feature Specs](#5-feature-specs)
6. [Database Schema](#6-database-schema)
7. [API Routes](#7-api-routes)
8. [Solana Smart Contract Architecture](#8-solana-contract)
9. [AI Integration Specs](#9-ai-integration)
10. [UI/UX Design System](#10-ui-ux)
11. [Known Issues & Solutions](#11-known-issues)
12. [Deployment Plan](#12-deployment)
13. [Demo Script](#13-demo-script)

---

## 1. PROJECT OVERVIEW

**Get Staked** is a social accountability app where users stake real money (SOL/USDC on Solana) on their habits. Users join competitive "Stake Pools" with others committing to the same habit. AI verifies proof of completion. Winners split the losers' money via trustless smart contracts. An AI voice coach keeps you motivated.

### Core Loop (30-second explanation)
1. User creates or joins a **Stake Pool** (e.g., "Gym 5x/week for 2 weeks, $20 stake")
2. Everyone deposits SOL into a **Solana escrow smart contract**
3. Each day, users submit **photo/video proof** of habit completion
4. **Gemini AI** verifies the proof is legitimate
5. At pool end, the **smart contract automatically pays winners** from the losers' stakes
6. An **ElevenLabs AI voice coach** motivates you throughout

### What Makes This Different From Everything Else
- **You can WIN money** (not just lose it) — StickK/Beeminder/Forfeit only take your money
- **Trustless blockchain escrow** — no middleman, 0% platform cut on payouts
- **AI multimodal verification** — not honor system, not manual referees
- **Voice AI coach** with personality — not just text notifications
- **Group competition** — not solo accountability
- **Predictive analytics** — warns you before you fail

### Target Platform
- **Progressive Web App (PWA)** — works on Android Chrome as an installable app
- NO native iOS/Android builds (avoids App Store complexity in hackathon)
- Camera, GPS, and notification access via Web APIs (fully supported on Android Chrome)
- Phantom wallet connects via mobile browser (Android supported)

---

## 2. TECH STACK

```
FRONTEND:          Next.js 14 (App Router) + React 18 + TypeScript
STYLING:           TailwindCSS + shadcn/ui components
STATE:             Zustand (lightweight, no boilerplate)
BLOCKCHAIN:        Solana Web3.js + @solana/wallet-adapter-react (Phantom wallet)
                   Smart contract: Anchor framework (Rust) deployed to Devnet
AI - VERIFICATION: Google Gemini API (gemini-2.0-flash) — image analysis
AI - VOICE:        ElevenLabs API — text-to-speech voice coach
AI - ANALYTICS:    Snowflake REST API — habit analytics & predictions
DATABASE:          MongoDB Atlas (free tier) via Mongoose ODM
BACKEND:           Next.js API Routes (serverless functions)
HOSTING:           DigitalOcean App Platform (or Vercel as fallback)
AUTH:              Wallet-based auth (connect Phantom = logged in) + optional email via NextAuth
PWA:               next-pwa package for installability + service worker
```

### Why This Stack
- **Next.js** = frontend + backend in one, fastest to ship
- **PWA** = installable on Android without Play Store, camera/GPS access works
- **Solana Devnet** = free test SOL, instant transactions, no real money needed for demo
- **MongoDB Atlas free tier** = 512MB, zero config, perfect for hackathon
- **Gemini Flash** = fastest multimodal model, free tier generous (15 RPM, 1M tokens/day)
- **ElevenLabs free tier** = 10,000 characters/month, enough for demo

---

## 3. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    ANDROID DEVICE (Chrome PWA)           │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐│
│  │ Dashboard │ │ Pool View│ │ Camera   │ │ Voice Coach││
│  │  (React)  │ │ (React)  │ │ Capture  │ │ (11Labs)   ││
│  └─────┬─────┘ └─────┬────┘ └────┬─────┘ └─────┬──────┘│
│        │              │           │              │       │
│  ┌─────┴──────────────┴───────────┴──────────────┴─────┐│
│  │            Zustand State Management                  ││
│  └─────────────────────┬────────────────────────────────┘│
│                        │                                 │
│  ┌─────────────────────┴────────────────────────────────┐│
│  │        Phantom Wallet Adapter (Solana)                ││
│  └──────────────────────────────────────────────────────┘│
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
                         ▼
┌────────────────────────────────────────────────────────┐
│              NEXT.JS SERVER (DigitalOcean)              │
│                                                        │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ /api/pools   │  │ /api/verify  │  │ /api/voice    │ │
│  │ CRUD pools   │  │ Gemini AI    │  │ ElevenLabs    │ │
│  │ Join/leave   │  │ proof check  │  │ TTS coach     │ │
│  └──────┬──────┘  └──────┬───────┘  └──────┬────────┘ │
│         │                │                  │          │
│  ┌──────┴────────────────┴──────────────────┴────────┐ │
│  │              MongoDB Atlas (Mongoose)              │ │
│  │  Users | Pools | Proofs | Streaks | VoiceLogs     │ │
│  └───────────────────────────────────────────────────┘ │
│                                                        │
│  ┌────────────────┐         ┌──────────────────────┐   │
│  │ /api/analytics │         │ /api/solana           │   │
│  │ Snowflake API  │         │ Contract interactions │   │
│  │ Predictions    │         │ Pool state reads      │   │
│  └────────────────┘         └──────────────────────┘   │
└────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│              SOLANA DEVNET BLOCKCHAIN                   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │         GET STAKED ESCROW PROGRAM (Anchor/Rust)   │  │
│  │                                                    │  │
│  │  Instructions:                                     │  │
│  │    • create_pool(habit, stake_amount, duration)    │  │
│  │    • join_pool(pool_id) + transfer SOL to escrow  │  │
│  │    • submit_proof(pool_id, verified: bool)        │  │
│  │    • settle_pool(pool_id) — pays winners          │  │
│  │    • emergency_withdraw(pool_id) — admin only     │  │
│  │                                                    │  │
│  │  Accounts:                                         │  │
│  │    • Pool PDA (stores pool state)                  │  │
│  │    • Escrow vault PDA (holds SOL)                  │  │
│  │    • Player entries (streak data per user)         │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 4. FEATURE TIERS & BUILD SCHEDULE

### TOTAL TIME BUDGET: ~16 hours of coding

### TIER 1 — MUST HAVE (Core Loop) — Hours 0-8

These features ARE the product. Without any one of them, the demo fails.

| # | Feature | Time | Owner |
|---|---------|------|-------|
| 1.1 | **Project scaffolding** — Next.js + Tailwind + shadcn/ui + PWA manifest | 0.5h | Dev 1 |
| 1.2 | **Phantom wallet connect** — Login via Solana wallet, store publicKey | 1h | Dev 1 |
| 1.3 | **MongoDB setup** — Atlas cluster + Mongoose schemas + connection | 0.5h | Dev 2 |
| 1.4 | **Pool CRUD API** — Create pool, list pools, join pool, get pool details | 1.5h | Dev 2 |
| 1.5 | **Pool UI** — Browse pools, create pool form, pool detail page with members | 2h | Dev 1 |
| 1.6 | **Camera proof submission** — Open camera, capture photo, upload to API | 1h | Dev 1 |
| 1.7 | **Gemini AI verification** — Send photo to Gemini, get pass/fail + confidence | 1.5h | Dev 2 |
| 1.8 | **Solana escrow contract** — Anchor program: create_pool, join, settle | 3h | Dev 3 |
| 1.9 | **Connect contract to frontend** — Deposit SOL on join, payout on settle | 2h | Dev 3 |
| 1.10 | **Dashboard** — User's active pools, streak status, basic stats | 1.5h | Dev 1 |

**Checkpoint at Hour 8: Full core loop works end-to-end. User can connect wallet → create/join pool → stake SOL → submit photo proof → AI verifies → pool settles → winner gets paid.**

### TIER 2 — SHOULD HAVE (Wow Factor) — Hours 8-12

These make judges go "wow" and hit sponsor tracks.

| # | Feature | Time | Owner |
|---|---------|------|-------|
| 2.1 | **ElevenLabs voice coach** — AI generates motivational audio on streak events | 1.5h | Dev 2 |
| 2.2 | **Voice persona selector** — Pick: Drill Sergeant / Hype Beast / Gentle Guide | 0.5h | Dev 2 |
| 2.3 | **Live pool leaderboard** — Real-time standings with streak flames animation | 1.5h | Dev 1 |
| 2.4 | **Streak heat map dashboard** — Gorgeous visual of habit completion over time | 1h | Dev 1 |
| 2.5 | **Escalating stakes display** — Show how stakes change over time in pool | 0.5h | Dev 1 |
| 2.6 | **Snowflake analytics** — Basic habit insights: best day, risk prediction | 1.5h | Dev 2 |
| 2.7 | **Polish Solana integration** — Transaction confirmations, balance display | 1h | Dev 3 |

**Checkpoint at Hour 12: Voice coach works, dashboard is beautiful, analytics show insights.**

### TIER 3 — NICE TO HAVE (Extra Credit) — Hours 12-16

| # | Feature | Time | Owner |
|---|---------|------|-------|
| 3.1 | **SOS Lifeline button** — Broadcast to pool, friends can encourage | 1h | Dev 2 |
| 3.2 | **Streak Insurance mechanic** — Pay extra upfront for 1 skip day | 1h | Dev 3 |
| 3.3 | **Soul-bound NFT trophies** — Mint completion NFT on pool win | 1.5h | Dev 3 |
| 3.4 | **Push notifications** — PWA web push for reminders | 1h | Dev 2 |
| 3.5 | **Polish & bug fixes** — Final pass on UX, animations, edge cases | 1.5h | All |
| 3.6 | **Demo prep** — Script rehearsal, backup demo recording | 1h | All |

---

## 5. DETAILED FEATURE SPECS

### 5.1 Wallet Authentication

```
Flow:
1. User opens PWA → sees landing page with "Connect Wallet" button
2. Clicks button → Phantom mobile browser extension popup
3. User approves connection → app receives publicKey
4. publicKey is stored in Zustand + sent to backend
5. Backend upserts user in MongoDB by wallet address
6. User is now "logged in" — their wallet IS their identity

Fallback:
- If user doesn't have Phantom, show "Install Phantom" link
- For demo: pre-fund 3-4 Phantom wallets with Devnet SOL
```

### 5.2 Stake Pools

```
Pool Creation Form:
- Habit name (text input): e.g., "Go to the gym"
- Proof description (text input): e.g., "Selfie at the gym with equipment visible"
- Stake amount (SOL input): e.g., 0.5 SOL
- Duration (select): 3 days / 7 days / 14 days / 30 days
- Required frequency (select): Daily / 5x per week / 3x per week
- Max participants (number): 2-10
- Escalating stakes toggle (on/off): if on, stake doubles each week
- Pool visibility: Public (anyone can join) / Private (invite link)

Pool States:
- WAITING — created, waiting for min 2 players
- ACTIVE — enough players joined, challenge has started
- SETTLING — challenge ended, computing winners
- COMPLETED — payouts distributed
- CANCELLED — not enough players joined before deadline
```

### 5.3 Proof Submission & AI Verification

```
Submission Flow:
1. User opens active pool → taps "Submit Proof" button
2. Camera opens (via navigator.mediaDevices.getUserMedia)
3. User captures photo (front or rear camera)
4. Photo is uploaded as base64 to /api/verify
5. Backend sends to Gemini API with this prompt:

---BEGIN GEMINI PROMPT---
You are a strict but fair habit verification AI for the app "Get Staked."

The user claims to have completed this habit: "{habit_name}"
Their proof description requirement is: "{proof_description}"

Analyze this photo and determine:
1. Does this photo show evidence of the claimed habit being completed?
2. Is this a real, freshly taken photo (not a screenshot of an old photo, not a stock image)?
3. Confidence score from 0-100

Respond in JSON format ONLY:
{
  "verified": true/false,
  "confidence": 0-100,
  "reasoning": "brief explanation",
  "flags": ["list of any suspicious elements"]
}

Be strict but reasonable. If the photo shows the person at a gym with equipment visible,
that counts for a gym habit. Don't require perfection, but do require clear evidence.
---END GEMINI PROMPT---

6. If confidence >= 70: auto-approve
7. If confidence 40-69: flag for pool member review (majority vote)
8. If confidence < 40: reject

Response shown to user:
- Green checkmark + AI reasoning if approved
- Yellow warning + option to resubmit if flagged
- Red X + reasoning if rejected
```

### 5.4 Voice Coach (ElevenLabs)

```
Trigger Events → Voice Response:
- Pool joined: "Alright, you just staked 0.5 SOL on gym time. 4 others are in the pool. Let's see who blinks first."
- Proof submitted & verified: "Day 3 in the bag! You're on fire. 2 people already dropped out — their money is looking real good right now."
- Streak at risk (no proof by 6 PM): "Hey. It's 6 PM and I haven't seen your proof yet. You've got 6 hours. Don't let 0.5 SOL walk away."
- Someone in pool failed: "One down. Their stake just got added to the pot. You're closer to payday."
- Pool won: "YOU DID IT! 14 days straight. That discipline just earned you 0.8 SOL. Winners get paid."
- Pool lost: "Streak broken. 0.5 SOL gone. But you made it 11 days. Join another pool and finish what you started."

Voice Personas:
1. "Drill Sergeant" — voice_id: use ElevenLabs preset "Josh" or similar deep male voice
   Style: aggressive, commanding, competitive
2. "Hype Beast" — voice_id: use ElevenLabs preset "Adam" or energetic voice
   Style: excited, celebratory, high energy
3. "Gentle Guide" — voice_id: use ElevenLabs preset "Rachel" or warm female voice
   Style: calm, supportive, encouraging

Implementation:
- Backend generates text via template + dynamic data
- Sends to ElevenLabs TTS API → receives audio buffer
- Returns audio URL to frontend → auto-plays via HTML5 Audio
- Cache common phrases to save API quota
```

### 5.5 Solana Escrow Smart Contract

```
Program: get_staked (Anchor framework)

Accounts:
- StakePool (PDA seeded by pool_id):
    authority: Pubkey (pool creator)
    habit_name: String
    stake_amount: u64 (lamports)
    duration_days: u8
    max_players: u8
    current_players: u8
    state: PoolState enum (Waiting/Active/Settling/Completed/Cancelled)
    start_time: i64
    end_time: i64
    escrow_vault: Pubkey

- PlayerEntry (PDA seeded by pool_id + player_pubkey):
    player: Pubkey
    pool: Pubkey
    current_streak: u16
    total_verified: u16
    total_required: u16
    has_failed: bool
    joined_at: i64

- Escrow Vault (PDA, token account holding SOL):
    Holds all staked SOL until settlement

Instructions:
1. create_pool(habit_name, stake_amount, duration, max_players, frequency)
   - Creates StakePool PDA
   - Creates Escrow Vault PDA
   - Creator auto-joins and transfers stake_amount to vault

2. join_pool()
   - Checks pool state == Waiting, current_players < max_players
   - Creates PlayerEntry PDA
   - Transfers stake_amount from player to vault
   - If current_players == max_players → state = Active, set start/end time

3. record_verification(player, verified: bool)
   - Only callable by program authority (our backend, acting as oracle)
   - Updates player's streak and verification count
   - If verified == false and streak breaks → has_failed = true

4. settle_pool()
   - Callable by anyone after end_time has passed
   - Counts winners (has_failed == false)
   - Calculates each winner's share: total_vault / num_winners
   - Transfers SOL from vault to each winner
   - If no winners: refund everyone
   - state = Completed

5. cancel_pool()
   - Callable by authority if pool never reached max_players
   - Refunds all deposits
   - state = Cancelled

IMPORTANT FOR HACKATHON:
- Deploy to Solana DEVNET only
- Use devnet SOL (free via faucet)
- Pre-airdrop devnet SOL to demo wallets
- Program authority = our backend's keypair (acts as trusted oracle for verification results)
```

### 5.6 Snowflake Analytics

```
Data Pipeline:
- On each proof submission, log to Snowflake via REST API:
  {user_id, pool_id, habit_type, timestamp, day_of_week, hour, verified, confidence_score}

Queries for Dashboard:
1. "Best day of the week" — GROUP BY day_of_week ORDER BY success_rate DESC
2. "Peak performance hour" — GROUP BY hour ORDER BY success_rate DESC
3. "Streak risk prediction" — Based on historical patterns, flag if current behavior deviates
4. "Pool success rates" — Which pool sizes/stake amounts have highest completion rates
5. "Habit correlations" — Users doing X habit also tend to succeed at Y habit

Display:
- Simple insight cards on the dashboard: "You're strongest on Tuesdays" / "Your risk of breaking your streak tomorrow is 35%"
```

---

## 6. DATABASE SCHEMA (MongoDB)

```javascript
// User
{
  _id: ObjectId,
  walletAddress: String,        // Solana public key (unique index)
  displayName: String,          // optional, defaults to truncated wallet
  voicePersona: String,         // "drill_sergeant" | "hype_beast" | "gentle_guide"
  totalWinnings: Number,        // lifetime SOL won
  totalLosses: Number,          // lifetime SOL lost
  poolsCompleted: Number,
  poolsFailed: Number,
  longestStreak: Number,
  createdAt: Date,
  updatedAt: Date
}

// Pool
{
  _id: ObjectId,
  poolId: String,               // unique slug for Solana PDA seed
  creator: String,              // wallet address
  habitName: String,
  proofDescription: String,
  stakeAmount: Number,          // in SOL
  durationDays: Number,
  frequency: String,            // "daily" | "5x_week" | "3x_week"
  maxPlayers: Number,
  currentPlayers: Number,
  state: String,                // "waiting" | "active" | "settling" | "completed" | "cancelled"
  escalatingStakes: Boolean,
  isPublic: Boolean,
  inviteCode: String,           // for private pools
  players: [{
    walletAddress: String,
    displayName: String,
    currentStreak: Number,
    totalVerified: Number,
    hasFailed: Boolean,
    joinedAt: Date
  }],
  escrowAddress: String,        // Solana escrow vault address
  startDate: Date,
  endDate: Date,
  createdAt: Date,
  updatedAt: Date
}

// Proof
{
  _id: ObjectId,
  poolId: String,
  walletAddress: String,
  imageUrl: String,             // base64 or cloud storage URL
  geminiResponse: {
    verified: Boolean,
    confidence: Number,
    reasoning: String,
    flags: [String]
  },
  status: String,               // "approved" | "rejected" | "flagged" | "pending"
  submittedAt: Date,
  verifiedAt: Date
}

// VoiceLog (for analytics)
{
  _id: ObjectId,
  walletAddress: String,
  event: String,                // "proof_submitted" | "streak_risk" | "pool_won" etc.
  persona: String,
  text: String,
  audioUrl: String,
  playedAt: Date
}
```

---

## 7. API ROUTES

```
AUTH:
  POST   /api/auth/connect          — Register/login via wallet signature

POOLS:
  GET    /api/pools                  — List all public pools (with filters)
  POST   /api/pools                  — Create a new pool
  GET    /api/pools/[id]             — Get pool details + members + standings
  POST   /api/pools/[id]/join        — Join a pool
  POST   /api/pools/[id]/settle      — Trigger settlement (after end date)

PROOFS:
  POST   /api/proofs                 — Submit proof (photo + pool_id)
  GET    /api/proofs/[poolId]/[wallet] — Get proof history for user in pool

VERIFICATION:
  POST   /api/verify                 — Send image to Gemini, return verification result

VOICE:
  POST   /api/voice/generate         — Generate voice message (event + context → ElevenLabs)
  GET    /api/voice/history           — Get past voice messages for user

ANALYTICS:
  GET    /api/analytics/user/[wallet] — Get user insights from Snowflake
  GET    /api/analytics/pool/[id]     — Get pool analytics

SOLANA:
  GET    /api/solana/pool-state/[id]  — Read on-chain pool state
  POST   /api/solana/record-verification — Backend records verification on-chain (oracle)
```

---

## 8. SOLANA SMART CONTRACT (Anchor/Rust)

```rust
// Simplified pseudocode — full Anchor implementation needed

use anchor_lang::prelude::*;

declare_id!("YOUR_PROGRAM_ID_HERE");

#[program]
pub mod get_staked {
    use super::*;

    pub fn create_pool(
        ctx: Context<CreatePool>,
        pool_id: String,
        habit_name: String,
        stake_amount: u64,
        duration_days: u8,
        max_players: u8,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.creator.key();
        pool.pool_id = pool_id;
        pool.habit_name = habit_name;
        pool.stake_amount = stake_amount;
        pool.duration_days = duration_days;
        pool.max_players = max_players;
        pool.current_players = 1;
        pool.state = PoolState::Waiting;

        // Transfer SOL from creator to escrow vault
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.creator.key(),
            &ctx.accounts.escrow_vault.key(),
            stake_amount,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.creator.to_account_info(),
                ctx.accounts.escrow_vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        Ok(())
    }

    pub fn join_pool(ctx: Context<JoinPool>) -> Result<()> {
        // Verify pool is in Waiting state
        // Transfer stake_amount from player to escrow
        // Create PlayerEntry
        // If pool full → start pool
        Ok(())
    }

    pub fn record_verification(
        ctx: Context<RecordVerification>,
        verified: bool,
    ) -> Result<()> {
        // Only callable by authority (our backend oracle)
        // Update player streak
        // If !verified → mark has_failed based on frequency rules
        Ok(())
    }

    pub fn settle_pool(ctx: Context<SettlePool>) -> Result<()> {
        // Check end_time has passed
        // Count winners (players where has_failed == false)
        // Calculate share = total_vault / num_winners
        // Transfer share to each winner
        // Set state = Completed
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PoolState {
    Waiting,
    Active,
    Settling,
    Completed,
    Cancelled,
}

#[account]
pub struct StakePool {
    pub authority: Pubkey,
    pub pool_id: String,
    pub habit_name: String,
    pub stake_amount: u64,
    pub duration_days: u8,
    pub max_players: u8,
    pub current_players: u8,
    pub state: PoolState,
    pub start_time: i64,
    pub end_time: i64,
    pub escrow_vault: Pubkey,
    pub bump: u8,
}

#[account]
pub struct PlayerEntry {
    pub player: Pubkey,
    pub pool: Pubkey,
    pub current_streak: u16,
    pub total_verified: u16,
    pub total_required: u16,
    pub has_failed: bool,
    pub joined_at: i64,
}
```

---

## 9. AI INTEGRATION SPECS

### 9.1 Gemini API — Proof Verification

```javascript
// /api/verify route handler
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  const { imageBase64, habitName, proofDescription } = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are a strict but fair habit verification AI for "Get Staked."
The user claims to have completed: "${habitName}"
Required proof: "${proofDescription}"

Analyze this photo. Respond in JSON ONLY:
{
  "verified": true/false,
  "confidence": 0-100,
  "reasoning": "brief explanation",
  "flags": ["any suspicious elements"]
}`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    },
  ]);

  const text = result.response.text();
  const verification = JSON.parse(text.replace(/```json\n?|\n?```/g, ""));

  return Response.json(verification);
}
```

**Rate Limits (Free Tier):**
- Gemini 2.0 Flash: 15 requests/minute, 1,500 requests/day
- For hackathon demo: MORE than enough
- Mitigation if hit: queue requests, show "verifying..." spinner

### 9.2 ElevenLabs API — Voice Coach

```javascript
// /api/voice/generate route handler
export async function POST(req) {
  const { text, voicePersona } = await req.json();

  const voiceIds = {
    drill_sergeant: "TxGEqnHWrfWFTfGW9XjX",  // "Josh"
    hype_beast: "pNInz6obpgDQGcFmaJgB",        // "Adam"
    gentle_guide: "21m00Tcm4TlvDq8ikWAM",      // "Rachel"
  };

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceIds[voicePersona]}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  const audioBuffer = await response.arrayBuffer();
  // Return as audio/mpeg or save to storage and return URL
  return new Response(audioBuffer, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
```

**Rate Limits (Free Tier):**
- 10,000 characters/month
- Mitigation: Pre-generate common phrases, cache audio files in MongoDB as base64
- For demo: prepare 10-15 key voice lines ahead of time

### 9.3 Snowflake REST API — Analytics

```javascript
// /api/analytics route handler
// Use Snowflake SQL REST API via fetch

const SNOWFLAKE_ACCOUNT = process.env.SNOWFLAKE_ACCOUNT;
const SNOWFLAKE_TOKEN = process.env.SNOWFLAKE_JWT_TOKEN;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");

  const response = await fetch(
    `https://${SNOWFLAKE_ACCOUNT}.snowflakecomputing.com/api/v2/statements`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SNOWFLAKE_TOKEN}`,
        "X-Snowflake-Authorization-Token-Type": "KEYPAIR_JWT",
      },
      body: JSON.stringify({
        statement: `
          SELECT
            DAYNAME(submitted_at) as day,
            COUNT(*) as total,
            SUM(CASE WHEN verified THEN 1 ELSE 0 END) as successes,
            ROUND(successes/total * 100, 1) as success_rate
          FROM proof_submissions
          WHERE wallet_address = '${wallet}'
          GROUP BY day
          ORDER BY success_rate DESC
        `,
        timeout: 60,
        database: "GET_STAKED",
        schema: "PUBLIC",
        warehouse: "COMPUTE_WH",
      }),
    }
  );

  const data = await response.json();
  return Response.json(data);
}
```

---

## 10. UI/UX DESIGN SYSTEM

### Color Palette (Dark theme — "fire & stakes" vibe)
```
Background:      #0A0A0F (near-black)
Surface:         #1A1A2E (dark navy)
Card:            #16213E (deep blue)
Primary:         #FF6B35 (fire orange)
Secondary:       #F7C948 (gold/money)
Success:         #00E676 (neon green)
Danger:          #FF1744 (hot red)
Text Primary:    #FFFFFF
Text Secondary:  #A0A0B0
Accent Gradient: linear-gradient(135deg, #FF6B35, #F7C948) — "flame gradient"
```

### Key Screens

```
1. LANDING PAGE
   - Hero: "Discipline Pays. Literally." with flame animation
   - "Connect Wallet" button (large, centered, glowing)
   - Quick explainer: 3 steps with icons (Stake → Prove → Win)

2. DASHBOARD (home after login)
   - Top: SOL balance + total winnings badge
   - Active Pools section: cards showing each pool with streak fire icon
   - Quick Stats: current streaks, win rate, next deadline countdown
   - Voice Coach toggle (floating button, bottom-right)

3. BROWSE POOLS
   - Filter by: habit type, stake amount, duration
   - Pool cards showing: habit name, stake, players (X/max), time remaining
   - "Create Pool" FAB button

4. POOL DETAIL
   - Pool info header: habit, stake, duration, rules
   - LEADERBOARD: ranked by streak length, with flame levels
     🔥 = 1-3 days, 🔥🔥 = 4-7 days, 🔥🔥🔥 = 8-14 days, 🔥🔥🔥🔥 = 15+
   - "Submit Proof" button (big, prominent)
   - Pool pot total displayed prominently
   - Each player: avatar, streak count, last verified time, status (active/failed)

5. PROOF SUBMISSION
   - Full-screen camera view
   - Overlay showing: habit name + proof requirement
   - Capture button → loading spinner "AI Verifying..." → result overlay
   - Result: green ✓ with reasoning OR red ✗ with explanation + retry button

6. ANALYTICS DASHBOARD
   - Heat map: 7-column grid (days of week) showing completion density
   - Insight cards: "Your best day is Tuesday" / "Risk level: Low"
   - Winnings chart: line graph of SOL earned over time

7. VOICE SETTINGS
   - Pick persona (3 cards with audio preview)
   - Toggle: voice on/off
   - Volume slider
```

### Component Library (shadcn/ui)
```
- Button (primary, secondary, destructive, outline, ghost)
- Card (pool cards, stat cards, insight cards)
- Dialog (create pool modal, proof result modal)
- Input, Select, Switch, Slider
- Avatar (player avatars in leaderboard)
- Badge (streak badges, status badges)
- Progress (streak progress bar)
- Toast (notifications)
- Tabs (dashboard sections)
```

---

## 11. KNOWN ISSUES & SOLUTIONS

### ISSUE 1: Phantom Wallet on Android Mobile Browser
**Problem:** Phantom wallet on mobile doesn't inject into Chrome like on desktop. It uses deep links and its own in-app browser.
**Solution:**
- Use `@solana/wallet-adapter-react` which handles this automatically
- Phantom's mobile SDK supports "Universal Links" — when user clicks "Connect", it opens Phantom app, user approves, redirects back to PWA
- FALLBACK: For demo, open the PWA *inside* Phantom's built-in dApp browser (Phantom → Browse → enter your URL). This guarantees wallet injection works.
- TEST THIS FIRST — have Phantom installed on demo Android devices before presenting.

### ISSUE 2: Camera Access in PWA on Android
**Problem:** Camera might not work if PWA isn't served over HTTPS, or if permissions aren't prompted correctly.
**Solution:**
- DigitalOcean App Platform provides HTTPS by default — CRITICAL
- Use `navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })` for rear camera
- Add camera permission to PWA manifest
- FALLBACK: If camera API fails, allow file upload from gallery (`<input type="file" accept="image/*" capture="camera">`) — this ALWAYS works on Android as it opens the native camera/gallery picker
- Use the `<input>` approach as PRIMARY and `getUserMedia` as enhancement

### ISSUE 3: Solana Program Deployment Time
**Problem:** Writing, testing, and deploying an Anchor program takes time. Bugs in Rust are slow to fix.
**Solution:**
- **OPTION A (Recommended for hackathon):** Use a SIMULATED escrow — backend holds a "virtual SOL balance" in MongoDB, mimics escrow behavior, and at demo time show ONE real Solana transaction as proof of concept. Display the Devnet explorer link.
- **OPTION B (If you have a Solana-experienced dev):** Pre-write the Anchor program using the escrow template at github.com/ironaddicteddog/anchor-escrow, modify for pool logic.
- **OPTION C (Hybrid):** Deploy a minimal contract that only does deposit + withdraw. Handle pool logic (streaks, winners, payouts) off-chain in the backend, but use the on-chain escrow for actual fund holding.
- **RECOMMENDATION: Go with Option C.** Real SOL on Devnet held in a real escrow (impressive for judges), but complex game logic runs off-chain (fast to build).

### ISSUE 4: Gemini API Response Parsing
**Problem:** Gemini sometimes returns markdown-wrapped JSON or adds extra text outside the JSON block.
**Solution:**
- Strip markdown code fences: `text.replace(/```json\n?|\n?```/g, "")` 
- Use `JSON.parse()` in a try-catch; if it fails, extract JSON with regex: `/\{[\s\S]*\}/` 
- Set system instruction: "You must respond with raw JSON only, no markdown, no explanation"
- Add `response_mime_type: "application/json"` in the generation config (Gemini supports this)

### ISSUE 5: ElevenLabs Free Tier Character Limit (10,000 chars/month)
**Problem:** 10k characters is roughly 20-30 voice messages. Could run out during development + demo.
**Solution:**
- Pre-generate ALL demo voice lines during development, save as .mp3 files in /public/audio/
- At demo time, serve cached audio — no live API calls needed
- For the LIVE demo of "real-time generation," have 2-3 fresh prompts reserved specifically for the presentation
- Keep generated texts SHORT (under 150 chars each)
- Sign up for ElevenLabs with multiple team members' emails if needed (each gets 10k)

### ISSUE 6: Snowflake Setup Complexity
**Problem:** Snowflake requires account setup, warehouse config, JWT auth — complex for a hackathon.
**Solution:**
- Sign up for the free 120-day student trial (from MLH sponsor link)
- Use Snowflake's REST API with key-pair authentication
- Pre-create the database, table, and warehouse BEFORE the hackathon starts
- FALLBACK: If Snowflake proves too complex, use MongoDB aggregation pipelines for analytics instead. You lose the sponsor track but save 2+ hours. Judges can't tell the difference in the demo.
- RECOMMENDATION: Have ONE team member set up Snowflake in parallel while others build. If it's not ready by hour 10, cut it and use MongoDB.

### ISSUE 7: CORS Issues with API Calls
**Problem:** Cross-origin requests to Gemini, ElevenLabs, Snowflake from the browser will be blocked.
**Solution:**
- ALL external API calls go through YOUR Next.js API routes (server-side). Never call Gemini/ElevenLabs/Snowflake directly from the frontend.
- Frontend calls /api/verify → your server calls Gemini → returns result to frontend
- This also protects API keys (never exposed to client)

### ISSUE 8: Image Upload Size
**Problem:** Phone camera photos can be 5-10MB. Base64 encoding makes them 33% larger. Sending huge payloads to Gemini is slow.
**Solution:**
- Compress images client-side before upload using canvas:
  ```javascript
  const canvas = document.createElement('canvas');
  canvas.width = 800; // resize to max 800px wide
  // ... draw image, export as JPEG quality 0.7
  canvas.toDataURL('image/jpeg', 0.7);
  ```
- Target: under 500KB per image after compression
- Gemini Flash handles up to 20MB inline, so even without compression it works — but speed matters for demo

### ISSUE 9: Time Zone Handling for Deadlines
**Problem:** Pool deadlines and "daily" check-ins need consistent time handling across devices.
**Solution:**
- Store ALL times as UTC in MongoDB and Solana
- Display in user's local timezone on frontend using `Intl.DateTimeFormat` 
- "Daily" = midnight to midnight in the user's timezone
- For hackathon: assume all users are in the same timezone (you're at the event together)

### ISSUE 10: Demo Day — What If Something Breaks?
**Problem:** Live demos fail. Wallet won't connect, API is down, etc.
**Solution:**
- Record a BACKUP DEMO VIDEO the night before submission
- Pre-populate MongoDB with realistic demo data (pools, proofs, streaks)
- Have a "demo mode" flag that uses pre-loaded data if APIs fail
- Pre-fund Phantom wallets with Devnet SOL (run `solana airdrop 2 <address> --url devnet`)
- Test the FULL flow 3 times before presenting
- Have the demo script memorized (see Section 13)

### ISSUE 11: PWA Install Prompt on Android
**Problem:** Chrome on Android shows "Add to Home Screen" banner automatically but timing is unpredictable.
**Solution:**
- Implement the `beforeinstallprompt` event handler to control when to show the prompt
- Add a manual "Install App" button in the UI that triggers the saved prompt event
- Ensure manifest.json has all required fields: name, short_name, icons (192x192 + 512x512), start_url, display: "standalone", theme_color, background_color
- For demo: pre-install the PWA on demo devices

### ISSUE 12: Wallet Disconnection / Session Persistence
**Problem:** If user refreshes PWA or phone sleeps, wallet disconnects.
**Solution:**
- Store walletAddress in localStorage after initial connection
- On app load, check localStorage → if address exists, auto-reconnect via wallet adapter's `autoConnect` feature
- Show re-connect prompt if auto-connect fails

---

## 12. DEPLOYMENT PLAN

### Pre-Hackathon Checklist (Do BEFORE event starts)
- [ ] Create MongoDB Atlas account + free cluster + get connection string
- [ ] Get Gemini API key from ai.google.dev
- [ ] Get ElevenLabs API key + test voice generation
- [ ] Sign up for Snowflake student trial (120-day free)
- [ ] Install Phantom wallet on all demo Android devices
- [ ] Set up Solana CLI + generate keypair for program authority
- [ ] Airdrop Devnet SOL to authority wallet + demo wallets
- [ ] Create DigitalOcean account + claim $200 free credit (MLH link)
- [ ] Set up GitHub repo with branch protection
- [ ] Install Node.js 18+, Rust + Anchor CLI on dev machines

### Deployment Steps
1. Push code to GitHub main branch
2. Connect GitHub repo to DigitalOcean App Platform
3. Set environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   GEMINI_API_KEY=...
   ELEVENLABS_API_KEY=...
   SNOWFLAKE_ACCOUNT=...
   SNOWFLAKE_PRIVATE_KEY=...
   SOLANA_RPC_URL=https://api.devnet.solana.com
   SOLANA_AUTHORITY_PRIVATE_KEY=...  (base58 encoded)
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   ```
4. Deploy → get HTTPS URL (e.g., https://get-staked-xxxxx.ondigitalocean.app)
5. Open URL in Phantom browser on Android → test full flow
6. If DigitalOcean fails: deploy to Vercel as fallback (instant, zero config)

---

## 13. DEMO SCRIPT (3 minutes)

### Opening (30 seconds)
"Meet Get Staked — the social accountability app where your discipline literally pays. You stake real money on your habits, AI verifies you actually did them, and if you win, you take home the losers' cash. No middleman. No honor system. Just blockchain-verified accountability."

### Demo Flow (2 minutes)

**[Show phone screen]**

1. "I open the app and connect my Solana wallet." → Connect Phantom (5 sec)

2. "I see pools I can join. Here's one: 'Gym 5x/week, 0.5 SOL stake, 4 players.' I tap Join and stake my SOL." → Show transaction confirmation (10 sec)

3. "The escrow smart contract now holds everyone's money. No one can touch it until the challenge ends." → Show Devnet explorer link with escrowed SOL (5 sec)

4. "Time to prove I went to the gym. I open the camera, take a photo..." → Snap gym photo (10 sec)

5. "Gemini AI analyzes my proof in real-time..." → Show verification: ✅ Verified, 94% confidence, 'Gym equipment and indoor fitness environment detected.' (10 sec)

6. "My streak updates on the leaderboard. I'm in 1st place. And listen to my AI coach..." → Play ElevenLabs voice: "Day 3 done! Two players already dropped. Their SOL is looking real nice in that pot." (15 sec)

7. "My analytics show I'm strongest on Tuesdays and my streak risk is low." → Flash analytics dashboard (5 sec)

8. "At the end of the challenge, the smart contract automatically pays the winners. I won 1.2 SOL from a 0.5 SOL stake — a 140% return on discipline." → Show payout (10 sec)

### Closing (30 seconds)
"Get Staked turns habit-building into a competitive sport with real stakes. Built with Solana smart contracts for trustless escrow, Gemini AI for proof verification, ElevenLabs for voice coaching, Snowflake for predictive analytics, MongoDB Atlas for data, and deployed on DigitalOcean. No other app lets you WIN money by being disciplined. That's Get Staked."

### Sponsor Track Callouts
Ensure you mention EACH sponsor by name during the demo. Judges listen for this.

---

## ENV VARIABLES TEMPLATE

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/getstaked

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Snowflake
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USER=your_user
SNOWFLAKE_PRIVATE_KEY=your_private_key_base64
SNOWFLAKE_DATABASE=GET_STAKED
SNOWFLAKE_SCHEMA=PUBLIC
SNOWFLAKE_WAREHOUSE=COMPUTE_WH

# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_AUTHORITY_PRIVATE_KEY=your_base58_private_key

# App
NEXT_PUBLIC_APP_URL=https://your-app-url.ondigitalocean.app
```

---

## TEAM TASK ASSIGNMENT TEMPLATE

```
DEV 1 (Frontend Lead):
  Hour 0-1:   Scaffold Next.js + Tailwind + shadcn/ui + PWA
  Hour 1-3:   Wallet connect + landing page + dashboard layout
  Hour 3-5:   Pool browsing UI + create pool form
  Hour 5-7:   Camera proof submission UI + verification result display
  Hour 7-8:   Pool detail page + leaderboard
  Hour 8-10:  Streak animations + heat map dashboard
  Hour 10-12: Polish, responsive design, loading states
  Hour 12-16: Bug fixes, demo prep, animations

DEV 2 (Backend Lead):
  Hour 0-1:   MongoDB Atlas setup + Mongoose schemas
  Hour 1-3:   Pool CRUD API routes
  Hour 3-5:   Gemini verification API route + prompt engineering
  Hour 5-7:   Proof submission pipeline (upload → verify → store)
  Hour 7-8:   User stats aggregation
  Hour 8-10:  ElevenLabs voice coach integration
  Hour 10-12: Snowflake analytics (or MongoDB aggregation fallback)
  Hour 12-16: SOS Lifeline, push notifications, bug fixes

DEV 3 (Blockchain Lead):
  Hour 0-3:   Solana Anchor escrow program (create_pool, join, settle)
  Hour 3-5:   Deploy to Devnet + test with CLI
  Hour 5-8:   Frontend wallet adapter + transaction signing
  Hour 8-10:  Connect escrow to pool join/settle flows
  Hour 10-12: Transaction confirmation UI + explorer links
  Hour 12-14: Soul-bound NFT trophies (if time)
  Hour 14-16: Polish, pre-fund demo wallets, test full flow
```

---

## QUICK START COMMANDS

```bash
# Create project
npx create-next-app@latest get-staked --typescript --tailwind --app --src-dir
cd get-staked

# Install core dependencies
npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-phantom @solana/wallet-adapter-base
npm install mongoose @google/generative-ai
npm install zustand
npm install next-pwa

# Install shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card dialog input select badge avatar progress tabs toast

# Install dev tools
npm install -D @types/node

# Environment setup
cp .env.example .env.local
# Fill in all API keys

# Run dev server
npm run dev
```
