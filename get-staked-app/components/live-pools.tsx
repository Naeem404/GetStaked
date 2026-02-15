"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Flame, Clock, Users, ArrowUpRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Tables } from "@/lib/database.types"

type Pool = Tables<'pools'>

function getPoolTag(pool: Pool) {
  if (pool.is_hot) return { bg: "bg-accent/10", text: "text-accent", label: "HOT" }
  if ((pool.stake_amount ?? 0) >= 3) return { bg: "bg-destructive/10", text: "text-destructive", label: "HIGH STAKES" }
  if (pool.status === "waiting") return { bg: "bg-chart-4/10", text: "text-chart-4", label: "NEW" }
  return { bg: "bg-primary/10", text: "text-primary", label: "ACTIVE" }
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
                <span className="capitalize">{pool.frequency || "daily"}</span>
              </div>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            View Pool
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  )
}

export function LivePools() {
  const [filter, setFilter] = useState<string>("all")
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPools() {
      try {
        const { data, error } = await supabase
          .from('pools')
          .select('*')
          .in('status', ['waiting', 'active'])
          .order('is_hot', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(6)

        if (error) throw error
        setPools(data || [])
      } catch (err) {
        console.error('Error fetching pools:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPools()
  }, [])

  const getTagKey = (pool: Pool) => {
    if (pool.is_hot) return "hot"
    if ((pool.stake_amount ?? 0) >= 3) return "high-stakes"
    if (pool.status === "waiting") return "new"
    return "active"
  }

  const filtered = filter === "all" ? pools : pools.filter(p => getTagKey(p) === filter)

  return (
    <section id="pools" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-primary/3 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
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

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">No pools found in this category.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/pools">
            <Button variant="outline" size="lg" className="gap-2 border-border bg-secondary text-foreground hover:bg-secondary/80">
              Browse All Pools
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
