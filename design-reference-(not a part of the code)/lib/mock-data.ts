// ============================================================
// GET STAKED — Mock Data Layer
// ============================================================

export interface User {
  id: string
  username: string
  avatar: string
  walletAddress: string
  streak: number
  longestStreak: number
  totalEarned: number
  totalStaked: number
  winRate: number
  poolsCompleted: number
  poolsActive: number
  joinedAt: string
}

export interface Pool {
  id: string
  name: string
  description: string
  category: "fitness" | "coding" | "reading" | "health" | "finance" | "custom"
  stakeAmount: number
  currentPlayers: number
  maxPlayers: number
  totalPot: number
  status: "filling" | "active" | "completed" | "settling"
  startDate: string
  endDate: string
  durationDays: number
  frequency: "daily" | "weekly" | "3x-week"
  verificationMethod: string
  aiPrompt: string
  createdBy: string
  players: PoolPlayer[]
  tags: string[]
  escalating: boolean
  completionRate: number
}

export interface PoolPlayer {
  userId: string
  username: string
  avatar: string
  streak: number
  lastProofAt: string | null
  status: "active" | "eliminated" | "completed"
  earnings: number
  rank: number
}

export interface Proof {
  id: string
  poolId: string
  userId: string
  username: string
  avatar: string
  timestamp: string
  imageUrl: string
  aiVerdict: "approved" | "rejected" | "pending"
  aiConfidence: number
  aiReason: string
  streakAfter: number
}

export interface Activity {
  id: string
  type: "proof_submitted" | "pool_joined" | "pool_created" | "earnings_received" | "streak_milestone"
  message: string
  timestamp: string
  poolName?: string
  amount?: number
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatar: string
  walletAddress: string
  totalEarned: number
  winRate: number
  streak: number
  poolsWon: number
}

export interface CoachMessage {
  id: string
  persona: "drill" | "hype" | "gentle"
  message: string
  timestamp: string
  type: "motivation" | "reminder" | "roast" | "celebration"
}

export interface AnalyticsData {
  dailyCompletion: { date: string; rate: number; target: number }[]
  earningsOverTime: { month: string; earned: number; staked: number }[]
  dayPerformance: { day: string; completions: number }[]
  poolPerformance: { pool: string; rate: number; earnings: number }[]
}

// ============================================================
// Utility generators
// ============================================================

const AVATARS = [
  "https://api.dicebear.com/9.x/glass/svg?seed=Felix",
  "https://api.dicebear.com/9.x/glass/svg?seed=Luna",
  "https://api.dicebear.com/9.x/glass/svg?seed=Max",
  "https://api.dicebear.com/9.x/glass/svg?seed=Zoe",
  "https://api.dicebear.com/9.x/glass/svg?seed=Kai",
  "https://api.dicebear.com/9.x/glass/svg?seed=Nova",
  "https://api.dicebear.com/9.x/glass/svg?seed=Axel",
  "https://api.dicebear.com/9.x/glass/svg?seed=Mira",
  "https://api.dicebear.com/9.x/glass/svg?seed=Jett",
  "https://api.dicebear.com/9.x/glass/svg?seed=Sage",
  "https://api.dicebear.com/9.x/glass/svg?seed=Blaze",
  "https://api.dicebear.com/9.x/glass/svg?seed=Echo",
  "https://api.dicebear.com/9.x/glass/svg?seed=Drift",
  "https://api.dicebear.com/9.x/glass/svg?seed=Pix",
  "https://api.dicebear.com/9.x/glass/svg?seed=Storm",
  "https://api.dicebear.com/9.x/glass/svg?seed=Vex",
  "https://api.dicebear.com/9.x/glass/svg?seed=Rune",
  "https://api.dicebear.com/9.x/glass/svg?seed=Flux",
  "https://api.dicebear.com/9.x/glass/svg?seed=Wren",
  "https://api.dicebear.com/9.x/glass/svg?seed=Onyx",
]

const WALLET_ADDRS = [
  "7xKp8R...3mNv", "4bNz2T...9qWx", "9hFm5L...7jRd", "3wQx7K...2pBc",
  "6tYn4M...8sGf", "2rLw9J...5vHn", "8kPz3V...1aDm", "5gXc6Q...4eKt",
  "1mBn8W...6hSj", "7dFx2R...3kLp", "4jHm5T...9nVw", "9sPy7K...2bGc",
  "3vLz4M...8dQf", "6nWx9J...5aBn", "2tKm3V...1gHd", "8hPc6Q...4jSt",
  "5bXn8W...6kLj", "1dFm2R...3pVw", "7gHz5T...9sGc", "4kLy7K...2vBf",
]

const USERNAMES = [
  "sol_grinder", "stake_wolf", "habit_hawk", "crypto_monk",
  "grind_master", "zen_coder", "iron_will", "chain_runner",
  "deep_focus", "pixel_ninja", "code_forge", "dawn_patrol",
  "proof_king", "streak_lord", "pump_daddy", "no_excuses",
  "reps_only", "build_daily", "stack_sats", "lock_in",
]

// ============================================================
// Mock Users
// ============================================================

export const MOCK_USERS: User[] = USERNAMES.map((username, i) => ({
  id: `user_${i}`,
  username,
  avatar: AVATARS[i],
  walletAddress: WALLET_ADDRS[i],
  streak: Math.floor(Math.random() * 45) + 1,
  longestStreak: Math.floor(Math.random() * 90) + 10,
  totalEarned: parseFloat((Math.random() * 50 + 2).toFixed(2)),
  totalStaked: parseFloat((Math.random() * 30 + 5).toFixed(2)),
  winRate: Math.floor(Math.random() * 40) + 60,
  poolsCompleted: Math.floor(Math.random() * 15) + 1,
  poolsActive: Math.floor(Math.random() * 3) + 1,
  joinedAt: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
}))

// The "current user" is index 0
export const CURRENT_USER: User = {
  ...MOCK_USERS[0],
  id: "current_user",
  username: "sol_grinder",
  walletAddress: "7xKp8R...3mNv",
  streak: 23,
  longestStreak: 41,
  totalEarned: 34.7,
  totalStaked: 18.2,
  winRate: 78,
  poolsCompleted: 9,
  poolsActive: 3,
}

// ============================================================
// Mock Pools
// ============================================================

function makePlayers(count: number, poolId: string): PoolPlayer[] {
  return MOCK_USERS.slice(1, count + 1).map((u, i) => ({
    userId: u.id,
    username: u.username,
    avatar: u.avatar,
    streak: Math.floor(Math.random() * 20) + 1,
    lastProofAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    status: Math.random() > 0.15 ? "active" as const : "eliminated" as const,
    earnings: parseFloat((Math.random() * 5).toFixed(2)),
    rank: i + 2,
  }))
}

export const MOCK_POOLS: Pool[] = [
  {
    id: "pool_1",
    name: "6AM Cold Plunge Club",
    description: "Prove you took a cold plunge before 6:30 AM every day. No excuses. AI verifies you're actually in cold water.",
    category: "health",
    stakeAmount: 2.5,
    currentPlayers: 8,
    maxPlayers: 10,
    totalPot: 20,
    status: "active",
    startDate: new Date(Date.now() - 14 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 16 * 86400000).toISOString(),
    durationDays: 30,
    frequency: "daily",
    verificationMethod: "Photo of you in cold water with timestamp visible",
    aiPrompt: "Verify the person is submerged in water that appears cold (outdoor, ice bath, cold plunge tub). Must show person's face or body partially submerged.",
    createdBy: "user_3",
    players: makePlayers(7, "pool_1"),
    tags: ["Health", "Hardcore", "Morning"],
    escalating: true,
    completionRate: 72,
  },
  {
    id: "pool_2",
    name: "Ship Code Daily",
    description: "Push at least one meaningful commit to a public repo every day. Screenshot your GitHub contribution graph as proof.",
    category: "coding",
    stakeAmount: 1.0,
    currentPlayers: 15,
    maxPlayers: 20,
    totalPot: 15,
    status: "active",
    startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 23 * 86400000).toISOString(),
    durationDays: 30,
    frequency: "daily",
    verificationMethod: "Screenshot of GitHub contributions showing today's commit",
    aiPrompt: "Verify the screenshot shows a GitHub contribution graph with a green square for today's date.",
    createdBy: "user_1",
    players: makePlayers(14, "pool_2"),
    tags: ["Coding", "Builders", "Daily"],
    escalating: false,
    completionRate: 85,
  },
  {
    id: "pool_3",
    name: "Read 30 Pages",
    description: "Read at least 30 pages of a non-fiction book every day. Photo of your book with page number visible.",
    category: "reading",
    stakeAmount: 0.5,
    currentPlayers: 12,
    maxPlayers: 15,
    totalPot: 6,
    status: "active",
    startDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 9 * 86400000).toISOString(),
    durationDays: 14,
    frequency: "daily",
    verificationMethod: "Photo of book opened to current page with page number visible",
    aiPrompt: "Verify the image shows an open book with readable page numbers. The page number should be higher than previous submissions.",
    createdBy: "user_5",
    players: makePlayers(11, "pool_3"),
    tags: ["Reading", "Beginner", "2 Weeks"],
    escalating: false,
    completionRate: 91,
  },
  {
    id: "pool_4",
    name: "100 Push-Ups or Pay",
    description: "Complete 100 push-ups every day. Record a video or photo showing your push-up form. No half-reps.",
    category: "fitness",
    stakeAmount: 5.0,
    currentPlayers: 5,
    maxPlayers: 8,
    totalPot: 25,
    status: "active",
    startDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 20 * 86400000).toISOString(),
    durationDays: 30,
    frequency: "daily",
    verificationMethod: "Video or photo of push-ups in progress",
    aiPrompt: "Verify the image/video shows a person performing push-ups with proper form.",
    createdBy: "user_2",
    players: makePlayers(4, "pool_4"),
    tags: ["Fitness", "Hardcore", "High Stakes"],
    escalating: true,
    completionRate: 64,
  },
  {
    id: "pool_5",
    name: "Meditation Marathon",
    description: "10 minutes of meditation every morning. Screenshot your meditation app timer showing today's session.",
    category: "health",
    stakeAmount: 0.25,
    currentPlayers: 18,
    maxPlayers: 25,
    totalPot: 4.5,
    status: "active",
    startDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 11 * 86400000).toISOString(),
    durationDays: 14,
    frequency: "daily",
    verificationMethod: "Screenshot of meditation app showing completed session",
    aiPrompt: "Verify screenshot shows a meditation app with a completed session of at least 10 minutes for today's date.",
    createdBy: "user_7",
    players: makePlayers(17, "pool_5"),
    tags: ["Health", "Beginner", "Low Stakes"],
    escalating: false,
    completionRate: 94,
  },
  {
    id: "pool_6",
    name: "No Sugar November",
    description: "Zero added sugar for the entire month. Photo of every meal you eat as proof. AI checks for obvious sugar.",
    category: "health",
    stakeAmount: 3.0,
    currentPlayers: 6,
    maxPlayers: 10,
    totalPot: 18,
    status: "filling",
    startDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 35 * 86400000).toISOString(),
    durationDays: 30,
    frequency: "daily",
    verificationMethod: "Photo of each meal consumed",
    aiPrompt: "Verify the meal shown does not contain obvious sugary items (candy, cake, soda, etc).",
    createdBy: "user_4",
    players: makePlayers(5, "pool_6"),
    tags: ["Health", "Diet", "Filling"],
    escalating: false,
    completionRate: 0,
  },
  {
    id: "pool_7",
    name: "5K Every Day",
    description: "Run at least 5 kilometers every single day. Screenshot your running app showing distance and date.",
    category: "fitness",
    stakeAmount: 4.0,
    currentPlayers: 3,
    maxPlayers: 8,
    totalPot: 12,
    status: "filling",
    startDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 33 * 86400000).toISOString(),
    durationDays: 30,
    frequency: "daily",
    verificationMethod: "Screenshot of running app with 5K+ distance",
    aiPrompt: "Verify the screenshot shows a running/fitness app with a distance of 5km or more for today's date.",
    createdBy: "user_6",
    players: makePlayers(2, "pool_7"),
    tags: ["Fitness", "Running", "High Stakes"],
    escalating: true,
    completionRate: 0,
  },
  {
    id: "pool_8",
    name: "Ship a Side Project",
    description: "Build and ship a side project in 2 weeks. Daily progress screenshots required. Must be deployed at the end.",
    category: "coding",
    stakeAmount: 2.0,
    currentPlayers: 10,
    maxPlayers: 10,
    totalPot: 20,
    status: "completed",
    startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    endDate: new Date(Date.now() - 16 * 86400000).toISOString(),
    durationDays: 14,
    frequency: "daily",
    verificationMethod: "Screenshot of code editor or deployed app",
    aiPrompt: "Verify the screenshot shows meaningful code changes or a deployed web application.",
    createdBy: "user_1",
    players: makePlayers(9, "pool_8"),
    tags: ["Coding", "Builders", "Completed"],
    escalating: false,
    completionRate: 70,
  },
  {
    id: "pool_9",
    name: "Wake Up at 5AM",
    description: "Prove you're awake at 5AM every day. Selfie with a clock or phone timestamp visible. No alarms, no snooze.",
    category: "health",
    stakeAmount: 1.5,
    currentPlayers: 7,
    maxPlayers: 12,
    totalPot: 10.5,
    status: "active",
    startDate: new Date(Date.now() - 8 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 22 * 86400000).toISOString(),
    durationDays: 30,
    frequency: "daily",
    verificationMethod: "Selfie showing 5AM timestamp",
    aiPrompt: "Verify the selfie shows a clock/phone displaying a time between 4:45 AM and 5:15 AM.",
    createdBy: "user_8",
    players: makePlayers(6, "pool_9"),
    tags: ["Health", "Morning", "Discipline"],
    escalating: false,
    completionRate: 68,
  },
  {
    id: "pool_10",
    name: "Zero Screen Sundays",
    description: "No screens (phone, laptop, TV) on Sundays. Prove it with outdoor/activity photos throughout the day.",
    category: "health",
    stakeAmount: 1.0,
    currentPlayers: 14,
    maxPlayers: 20,
    totalPot: 14,
    status: "active",
    startDate: new Date(Date.now() - 12 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 18 * 86400000).toISOString(),
    durationDays: 30,
    frequency: "weekly",
    verificationMethod: "Multiple photos of outdoor activities on Sunday",
    aiPrompt: "Verify outdoor activity photos taken on a Sunday. Should show the person engaged in non-screen activities.",
    createdBy: "user_9",
    players: makePlayers(13, "pool_10"),
    tags: ["Health", "Digital Detox", "Weekly"],
    escalating: false,
    completionRate: 82,
  },
  {
    id: "pool_11",
    name: "Learn Solana Dev",
    description: "Complete one Solana development tutorial or build one feature per day for your dApp. Share your code.",
    category: "coding",
    stakeAmount: 3.0,
    currentPlayers: 4,
    maxPlayers: 8,
    totalPot: 12,
    status: "filling",
    startDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 37 * 86400000).toISOString(),
    durationDays: 30,
    frequency: "daily",
    verificationMethod: "Screenshot of completed tutorial or code changes",
    aiPrompt: "Verify the screenshot shows Solana-related code, tutorial completion, or development progress.",
    createdBy: "user_10",
    players: makePlayers(3, "pool_11"),
    tags: ["Coding", "Solana", "Filling"],
    escalating: false,
    completionRate: 0,
  },
  {
    id: "pool_12",
    name: "Budget Lockdown",
    description: "Track every penny you spend. Screenshot your expense tracker with today's entries. Stay under $30/day.",
    category: "finance",
    stakeAmount: 2.0,
    currentPlayers: 9,
    maxPlayers: 15,
    totalPot: 18,
    status: "active",
    startDate: new Date(Date.now() - 6 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 24 * 86400000).toISOString(),
    durationDays: 30,
    frequency: "daily",
    verificationMethod: "Screenshot of expense tracker with daily total under $30",
    aiPrompt: "Verify the screenshot shows an expense tracking app with itemized expenses and a daily total under $30.",
    createdBy: "user_11",
    players: makePlayers(8, "pool_12"),
    tags: ["Finance", "Discipline", "Tracking"],
    escalating: false,
    completionRate: 76,
  },
]

// ============================================================
// Mock Proofs
// ============================================================

export const MOCK_PROOFS: Proof[] = [
  { id: "proof_1", poolId: "pool_1", userId: "user_1", username: "stake_wolf", avatar: AVATARS[1], timestamp: new Date(Date.now() - 3600000).toISOString(), imageUrl: "/proof-placeholder.jpg", aiVerdict: "approved", aiConfidence: 94, aiReason: "Subject visible in cold water with ice visible. Timestamp matches submission window.", streakAfter: 14 },
  { id: "proof_2", poolId: "pool_2", userId: "user_2", username: "habit_hawk", avatar: AVATARS[2], timestamp: new Date(Date.now() - 7200000).toISOString(), imageUrl: "/proof-placeholder.jpg", aiVerdict: "approved", aiConfidence: 98, aiReason: "GitHub contribution graph shows green square for today's date.", streakAfter: 7 },
  { id: "proof_3", poolId: "pool_4", userId: "user_3", username: "crypto_monk", avatar: AVATARS[3], timestamp: new Date(Date.now() - 10800000).toISOString(), imageUrl: "/proof-placeholder.jpg", aiVerdict: "rejected", aiConfidence: 67, aiReason: "Unable to verify push-up form. Image is too blurry and angle doesn't show full body position.", streakAfter: 0 },
  { id: "proof_4", poolId: "pool_1", userId: "current_user", username: "sol_grinder", avatar: AVATARS[0], timestamp: new Date(Date.now() - 14400000).toISOString(), imageUrl: "/proof-placeholder.jpg", aiVerdict: "approved", aiConfidence: 91, aiReason: "Cold plunge verified. Water temperature appears cold based on visible condensation.", streakAfter: 23 },
  { id: "proof_5", poolId: "pool_5", userId: "user_7", username: "code_forge", avatar: AVATARS[7], timestamp: new Date(Date.now() - 18000000).toISOString(), imageUrl: "/proof-placeholder.jpg", aiVerdict: "approved", aiConfidence: 96, aiReason: "Meditation app shows 12-minute session completed today.", streakAfter: 3 },
  { id: "proof_6", poolId: "pool_3", userId: "user_5", username: "zen_coder", avatar: AVATARS[5], timestamp: new Date(Date.now() - 21600000).toISOString(), imageUrl: "/proof-placeholder.jpg", aiVerdict: "approved", aiConfidence: 89, aiReason: "Open book visible with page number 142. Previous submission showed page 108.", streakAfter: 5 },
]

// ============================================================
// Mock Activity Feed
// ============================================================

export const MOCK_ACTIVITIES: Activity[] = [
  { id: "act_1", type: "proof_submitted", message: "Proof approved for 6AM Cold Plunge Club", timestamp: new Date(Date.now() - 3600000).toISOString(), poolName: "6AM Cold Plunge Club" },
  { id: "act_2", type: "earnings_received", message: "Earned 0.8 SOL from eliminated player", timestamp: new Date(Date.now() - 7200000).toISOString(), poolName: "Ship Code Daily", amount: 0.8 },
  { id: "act_3", type: "streak_milestone", message: "20-day streak in 100 Push-Ups or Pay!", timestamp: new Date(Date.now() - 14400000).toISOString(), poolName: "100 Push-Ups or Pay" },
  { id: "act_4", type: "pool_joined", message: "Joined Budget Lockdown pool", timestamp: new Date(Date.now() - 28800000).toISOString(), poolName: "Budget Lockdown", amount: 2.0 },
  { id: "act_5", type: "proof_submitted", message: "Proof approved for Ship Code Daily", timestamp: new Date(Date.now() - 43200000).toISOString(), poolName: "Ship Code Daily" },
  { id: "act_6", type: "earnings_received", message: "Earned 1.2 SOL settlement from Ship a Side Project", timestamp: new Date(Date.now() - 86400000).toISOString(), poolName: "Ship a Side Project", amount: 1.2 },
  { id: "act_7", type: "pool_created", message: "Created new pool: Zero Screen Sundays", timestamp: new Date(Date.now() - 172800000).toISOString(), poolName: "Zero Screen Sundays" },
  { id: "act_8", type: "streak_milestone", message: "10-day streak in Read 30 Pages!", timestamp: new Date(Date.now() - 259200000).toISOString(), poolName: "Read 30 Pages" },
]

// ============================================================
// Mock Leaderboard
// ============================================================

export const MOCK_LEADERBOARD: LeaderboardEntry[] = MOCK_USERS.map((u, i) => ({
  rank: i + 1,
  userId: u.id,
  username: u.username,
  avatar: u.avatar,
  walletAddress: u.walletAddress,
  totalEarned: parseFloat((Math.random() * 80 + 5).toFixed(2)),
  winRate: Math.floor(Math.random() * 30) + 70,
  streak: Math.floor(Math.random() * 50) + 5,
  poolsWon: Math.floor(Math.random() * 20) + 1,
})).sort((a, b) => b.totalEarned - a.totalEarned).map((entry, i) => ({ ...entry, rank: i + 1 }))

// ============================================================
// Mock Coach Messages
// ============================================================

export const MOCK_COACH_MESSAGES: CoachMessage[] = [
  { id: "cm_1", persona: "drill", message: "YOUR ALARM WENT OFF 3 MINUTES AGO. ARE YOU STILL IN BED?! GET UP NOW, SOLDIER!", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "roast" },
  { id: "cm_2", persona: "hype", message: "YOOOO 23-day streak?! You're literally UNSTOPPABLE right now. The pool is SHAKING!", timestamp: new Date(Date.now() - 7200000).toISOString(), type: "celebration" },
  { id: "cm_3", persona: "gentle", message: "Good morning. Remember, showing up is the hardest part, and you've already done that 23 times. I believe in you.", timestamp: new Date(Date.now() - 14400000).toISOString(), type: "motivation" },
  { id: "cm_4", persona: "drill", message: "3 people dropped out of your pool yesterday. THEIR MONEY IS NOW ON THE TABLE. DO NOT QUIT.", timestamp: new Date(Date.now() - 28800000).toISOString(), type: "motivation" },
  { id: "cm_5", persona: "hype", message: "Bro you just hit TOP 5 on the leaderboard!! Let's keep this energy ALL WEEK!", timestamp: new Date(Date.now() - 43200000).toISOString(), type: "celebration" },
  { id: "cm_6", persona: "gentle", message: "Your proof deadline is in 2 hours. No rush -- just a gentle reminder so you can plan your day.", timestamp: new Date(Date.now() - 86400000).toISOString(), type: "reminder" },
]

// ============================================================
// Mock Analytics
// ============================================================

export const MOCK_ANALYTICS: AnalyticsData = {
  dailyCompletion: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    rate: Math.min(100, Math.floor(Math.random() * 30 + 70)),
    target: 80,
  })),
  earningsOverTime: [
    { month: "Sep", earned: 3.2, staked: 5.0 },
    { month: "Oct", earned: 7.8, staked: 8.0 },
    { month: "Nov", earned: 12.1, staked: 10.0 },
    { month: "Dec", earned: 8.4, staked: 12.0 },
    { month: "Jan", earned: 15.6, staked: 14.0 },
    { month: "Feb", earned: 18.2, staked: 15.0 },
  ],
  dayPerformance: [
    { day: "Mon", completions: 92 },
    { day: "Tue", completions: 88 },
    { day: "Wed", completions: 95 },
    { day: "Thu", completions: 82 },
    { day: "Fri", completions: 78 },
    { day: "Sat", completions: 70 },
    { day: "Sun", completions: 65 },
  ],
  poolPerformance: [
    { pool: "Cold Plunge", rate: 72, earnings: 4.2 },
    { pool: "Ship Code", rate: 85, earnings: 7.8 },
    { pool: "Read 30 Pages", rate: 91, earnings: 2.1 },
    { pool: "100 Push-Ups", rate: 64, earnings: 8.5 },
    { pool: "Meditation", rate: 94, earnings: 1.2 },
    { pool: "Budget Lockdown", rate: 76, earnings: 3.4 },
  ],
}

// ============================================================
// Current user's joined pools (subset of MOCK_POOLS)
// ============================================================

export const USER_POOL_IDS = ["pool_1", "pool_2", "pool_4", "pool_9", "pool_12"]

// Deadlines for the dashboard
export const UPCOMING_DEADLINES = [
  { poolName: "6AM Cold Plunge Club", poolId: "pool_1", deadline: new Date(Date.now() + 2 * 3600000).toISOString(), type: "proof" as const },
  { poolName: "Ship Code Daily", poolId: "pool_2", deadline: new Date(Date.now() + 5 * 3600000).toISOString(), type: "proof" as const },
  { poolName: "100 Push-Ups or Pay", poolId: "pool_4", deadline: new Date(Date.now() + 8 * 3600000).toISOString(), type: "proof" as const },
  { poolName: "Budget Lockdown", poolId: "pool_12", deadline: new Date(Date.now() + 14 * 3600000).toISOString(), type: "proof" as const },
]
