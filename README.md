# Get Staked  Hackathon MVP Overview

## 1. Project Snapshot
Get Staked lets people stake real SOL/USDC on their habits, submit photo/video proof, and win the pot if they stay consistent. AI validates proofs, a Solana escrow contract holds funds, and an ElevenLabs coach keeps users motivated.

### Core Loop (30 sec)
1. Join or create a stake pool (e.g. Gym 5x/week, 0.5 SOL).
2. Deposit into Solana escrow.
3. Submit daily proof  Gemini verifies.
4. Winners auto-paid from escrow; losers fund the pot.
5. Voice coach + analytics nudge users before they fail.

### Why It Hits
- Win real money (not just penalties).
- Trustless payouts (Solana escrow, 0% platform fee).
- AI verification + AI voice coach (Gemini + ElevenLabs).
- Multiplayer accountability + predictive insights.
- Android-first PWA  no app store friction.

## 2. Tech Stack (TL;DR)
| Layer | Choice |
| --- | --- |
| Frontend | Next.js 14 (App Router) + React 18 + TypeScript |
| Styling | TailwindCSS + shadcn/ui |
| State | Zustand |
| Blockchain | Solana Web3.js + Anchor program on Devnet |
| AI | Google Gemini (verification), ElevenLabs (voice), Snowflake (analytics) |
| Backend | Next.js API Routes + MongoDB Atlas |
| Auth | Phantom wallet connect (+ optional NextAuth email) |
| Hosting | DigitalOcean App Platform (Vercel fallback) |
| PWA | next-pwa + service worker |

## 3. Architecture (high level)
`
Android Chrome PWA (dashboard, pools, camera, coach)
         Zustand + Phantom wallet adapter
         HTTPS
Next.js server (DigitalOcean)
   /api/pools, /api/proofs, /api/verify, /api/voice, /api/analytics, /api/solana
   MongoDB Atlas stores users/pools/proofs/voice logs
   Snowflake REST for insights
        
Solana Devnet (Anchor escrow program)
   create_pool, join_pool, record_verification, settle_pool, cancel_pool
`

## 4. Feature Tiers
- **Tier 1 (Hours 08)**: wallet connect, pool CRUD, camera proof upload, Gemini verification, Solana escrow join/settle, dashboard.
- **Tier 2 (Hours 812)**: ElevenLabs coach + personas, live leaderboard, heatmap dashboard, escalating stakes UI, Snowflake insights, polished Solana UX.
- **Tier 3 (Hours 1216)**: SOS lifeline, streak insurance, NFT trophies, push notifications, polish + demo prep.

## 5. Key Specs (bite-sized)
- **Wallet Auth**: Phantom connect  publicKey stored in Zustand + Mongo upsert.
- **Pools**: Habit name, proof description, stake, duration, frequency, visibility, escalating toggle; states = Waiting  Active  Settling  Completed/Cancelled.
- **Proofs**: Capture via camera/file input, compress to <500KB, send to /api/verify  Gemini JSON (verified, confidence, reasoning, flags). 70 auto-pass, 4069 manual review, <40 reject.
- **Voice Coach**: Events (join, proof verified, risk alert, pool won/lost). Personas = Drill Sergeant, Hype Beast, Gentle Guide. Cache common clips.
- **Smart Contract**: StakePool + PlayerEntry PDAs, escrow vault PDA. Instructions: create_pool, join_pool, record_verification (oracle), settle_pool, cancel_pool.
- **Analytics**: Log proofs to Snowflake; surface best day/hour, risk score, pool insights.

## 6. Known Gotchas
1. Phantom mobile  use wallet adapter & Phantom in-app browser as fallback.
2. Camera access requires HTTPS + manifest permissions; provide <input capture> fallback.
3. Anchor dev time  use hybrid approach: real escrow on-chain, streak logic off-chain if rushed.
4. Gemini JSON parsing  strip code fences, enforce esponse_mime_type.
5. ElevenLabs quota  pre-generate clips, keep live text short.
6. Snowflake setup  start early; fallback to Mongo aggregations if blocked.
7. Record backup demo video + seed data + devnet SOL before judging.

## 7. Deployment Cheatsheet
1. Configure MongoDB Atlas, Gemini, ElevenLabs, Snowflake, Solana RPC, authority key.
2. 
pm run build && npm run start locally to verify.
3. Connect repo to DigitalOcean App Platform (or Vercel) and set env vars:
`
MONGODB_URI=
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
SNOWFLAKE_ACCOUNT=
SNOWFLAKE_PRIVATE_KEY=
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_AUTHORITY_PRIVATE_KEY=
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_APP_URL=https://...
`
4. Open deployed URL inside Phantom browser, test full loop end-to-end.

## 8. Demo Script (compressed)
1. Connect wallet  show pools  join Gym pool (0.5 SOL).
2. Show Solana explorer escrow tx.
3. Submit gym proof  Gemini verifies live.
4. Leaderboard + coach audio (Day 3 done! ...).
5. Analytics insight (Strongest on Tuesdays).
6. Pool settles  winners paid from escrow.
7. Shout-out sponsors: Solana, Google Gemini, ElevenLabs, Snowflake, DigitalOcean, MongoDB.

## 9. Quick Start
`ash
npx create-next-app@latest get-staked --typescript --tailwind --app --src-dir
cd get-staked
npm install @solana/web3.js @solana/wallet-adapter-react ... next-pwa zustand mongoose @google/generative-ai
npx shadcn@latest init && npx shadcn@latest add button card dialog input select badge avatar progress tabs toast
cp .env.example .env.local  # fill keys
npm run dev
`

Need the full 13-section deep dive? See the previous README commit (d3ceaa1).