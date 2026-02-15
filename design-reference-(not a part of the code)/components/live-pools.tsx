"use client"

import { useState } from "react"
import { Flame, Clock, Users, ArrowUpRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

type Pool = {
  id: string
  name: string
  description: string
  stake: number
  players: number
  maxPlayers: number
  daysLeft: number
  frequency: string
  tag: "active" | "hot" | "high-stakes" | "new"
  streakLeader: number
  totalPot: number
}

const pools: Pool[] = [
  {
    id: "1",
    name: "Gym 5x/Week",
    description: "Selfie at gym with equipment visible",
    stake: 0.5,
    players: 6,
    maxPlayers: 8,
    daysLeft: 7,
    frequency: "5x/week",
    tag: "active",
    streakLeader: 12,
    totalPot: 3.0,
  },
  {
    id: "2",
    name: "No Sugar Challenge",
    description: "Photo of every meal — zero added sugar",
    stake: 2.0,
    players: 8,
    maxPlayers: 10,
    daysLeft: 14,
    frequency: "Daily",
    tag: "hot",
    streakLeader: 9,
    totalPot: 16.0,
  },
  {
    id: "3",
    name: "Morning Run 6AM",
    description: "GPS-tagged run screenshot before 6:30 AM",
    stake: 5.0,
    players: 4,
    maxPlayers: 5,
    daysLeft: 3,
    frequency: "Daily",
    tag: "high-stakes",
    streakLeader: 18,
    totalPot: 20.0,
  },
  {
    id: "4",
    name: "Read 30min/Day",
    description: "Photo of book with timestamp",
    stake: 0.2,
    players: 10,
    maxPlayers: 10,
    daysLeft: 21,
    frequency: "Daily",
    tag: "active",
    streakLeader: 6,
    totalPot: 2.0,
  },
  {
    id: "5",
    name: "Ship Code Daily",
    description: "Screenshot of GitHub commit graph",
    stake: 1.0,
    players: 3,
    maxPlayers: 6,
    daysLeft: 10,
    frequency: "Daily",
    tag: "new",
    streakLeader: 4,
    totalPot: 3.0,
  },
  {
    id: "6",
    name: "Cold Plunge",
    description: "Video proof of 2-min cold exposure",
    stake: 3.0,
    players: 5,
    maxPlayers: 5,
    daysLeft: 5,
    frequency: "Daily",
    tag: "hot",
    streakLeader: 15,
    totalPot: 15.0,
  },
]

const tagStyles: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-primary/10", text: "text-primary", label: "ACTIVE" },
  hot: { bg: "bg-accent/10", text: "text-accent", label: "HOT" },
  "high-stakes": { bg: "bg-destructive/10", text: "text-destructive", label: "HIGH STAKES" },
  new: { bg: "bg-chart-4/10", text: "text-chart-4", label: "NEW" },
}

function PoolCard({ pool }: { pool: Pool }) {
  const tag = tagStyles[pool.tag]
  const fillPercent = (pool.players / pool.maxPlayers) * 100

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tag.bg} ${tag.text}`}>
            {tag.label}
          </span>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">{pool.daysLeft}d left</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-1 font-display text-xl font-bold text-foreground">{pool.name}</h3>
        <p className="mb-5 text-sm text-muted-foreground">{pool.description}</p>

        {/* Stake & pot */}
        <div className="mb-5 flex items-end justify-between">
          <div>
            <span className="block text-xs uppercase tracking-wider text-muted-foreground">Stake</span>
            <span className="font-display text-2xl font-bold text-foreground">{pool.stake}</span>
            <span className="ml-1 text-sm text-muted-foreground">SOL</span>
          </div>
          <div className="text-right">
            <span className="block text-xs uppercase tracking-wider text-muted-foreground">Total Pot</span>
            <span className="font-display text-2xl font-bold text-primary">{pool.totalPot}</span>
            <span className="ml-1 text-sm text-muted-foreground">SOL</span>
          </div>
        </div>

        {/* Players bar */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{pool.players}/{pool.maxPlayers} players</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-accent" />
              <span>{pool.streakLeader}d best streak</span>
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>

        {/* Frequency tag */}
        <div className="mb-5 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-accent" />
          <span className="text-xs font-medium text-muted-foreground">{pool.frequency}</span>
        </div>

        {/* CTA */}
        <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          Join Pool
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function LivePools() {
  const [filter, setFilter] = useState<string>("all")

  const filtered = filter === "all" ? pools : pools.filter(p => p.tag === filter)

  return (
    <section id="pools" className="relative py-24 md:py-32">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-primary/3 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="mb-4 inline-block rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
              Live Pools
            </span>
            <h2 className="mb-2 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              <span className="text-balance">Active Stake Pools</span>
            </h2>
            <p className="max-w-lg text-pretty text-muted-foreground">
              Real money. Real competition. Pick your challenge and put your SOL on the line.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "hot", label: "Hot" },
              { key: "high-stakes", label: "High Stakes" },
              { key: "new", label: "New" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  filter === f.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pools grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pool) => (
            <PoolCard key={pool.id} pool={pool} />
          ))}
        </div>

        {/* See all */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" className="gap-2 border-border bg-secondary text-foreground hover:bg-secondary/80">
            Browse All Pools
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
