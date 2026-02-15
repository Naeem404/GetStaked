"use client"

import { useState } from "react"
import Link from "next/link"
import { Flame, Clock, Users, ArrowUpRight, Zap, Search, Plus, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { usePools } from "@/hooks/use-pools"
import { Tables } from "@/lib/database.types"

type Pool = Tables<'pools'>

const categories = [
  { key: "all", label: "All" },
  { key: "fitness", label: "Fitness" },
  { key: "health", label: "Health" },
  { key: "education", label: "Education" },
  { key: "wellness", label: "Wellness" },
  { key: "productivity", label: "Productivity" },
  { key: "creative", label: "Creative" },
]

function getPoolTag(pool: Pool) {
  if (pool.is_hot) return { label: "HOT", bg: "bg-accent/10", text: "text-accent" }
  if ((pool.stake_amount ?? 0) >= 3) return { label: "HIGH STAKES", bg: "bg-destructive/10", text: "text-destructive" }
  if (pool.status === "waiting") return { label: "NEW", bg: "bg-chart-4/10", text: "text-chart-4" }
  return { label: "ACTIVE", bg: "bg-primary/10", text: "text-primary" }
}

function PoolCard({ pool }: { pool: Pool }) {
  const tag = getPoolTag(pool)
  const fillPercent = ((pool.current_players ?? 0) / pool.max_players) * 100
  const daysLeft = pool.ends_at
    ? Math.max(0, Math.ceil((new Date(pool.ends_at).getTime() - Date.now()) / 86400000))
    : pool.duration_days

  return (
    <Link href={`/pool/${pool.id}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{pool.emoji || "🎯"}</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tag.bg} ${tag.text}`}>
                {tag.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">{daysLeft}d left</span>
            </div>
          </div>

          <h3 className="mb-1 font-display text-xl font-bold text-foreground">{pool.name}</h3>
          <p className="mb-5 line-clamp-2 text-sm text-muted-foreground">{pool.description || pool.proof_description}</p>

          <div className="mb-5 flex items-end justify-between">
            <div>
              <span className="block text-xs uppercase tracking-wider text-muted-foreground">Stake</span>
              <span className="font-display text-2xl font-bold text-foreground">{pool.stake_amount}</span>
              <span className="ml-1 text-sm text-muted-foreground">SOL</span>
            </div>
            <div className="text-right">
              <span className="block text-xs uppercase tracking-wider text-muted-foreground">Total Pot</span>
              <span className="font-display text-2xl font-bold text-primary">{(pool.pot_size ?? 0).toFixed(1)}</span>
              <span className="ml-1 text-sm text-muted-foreground">SOL</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{pool.current_players ?? 0}/{pool.max_players} players</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-accent" />
                <span>{pool.frequency || "daily"}</span>
              </div>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-secondary px-2 py-0.5 capitalize">{pool.category || "other"}</span>
            <span>•</span>
            <span>{pool.duration_days} days</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function PoolsPage() {
  const { user, profile, signOut } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [search, setSearch] = useState("")
  const { pools, loading } = usePools(selectedCategory)

  const filteredPools = search
    ? pools.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : pools

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">GET STAKED</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {user && <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>}
            <Link href="/pools" className="text-sm font-medium text-foreground">Pools</Link>
            <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground">Leaderboard</Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="hidden items-center gap-2 rounded-full bg-secondary px-4 py-2 md:flex">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {(profile?.display_name || user.email)?.[0]?.toUpperCase() || "?"}
                  </div>
                  <span className="text-sm font-medium text-foreground">{profile?.display_name || user.email?.split("@")[0]}</span>
                </Link>
                <button onClick={async () => { await signOut() }} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link href="/auth">
                <Button className="bg-primary text-primary-foreground">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground">Stake Pools</h1>
          <p className="mt-2 text-muted-foreground">Real money. Real competition. Pick your challenge.</p>
        </div>

        {/* Search + Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search pools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary px-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === cat.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pools grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filteredPools.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-display text-xl font-bold text-foreground">No pools found</h3>
            <p className="text-muted-foreground">Try a different category or check back later.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
