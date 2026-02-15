"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Flame, Trophy, TrendingUp, Crown, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface LeaderEntry {
  user_id: string
  display_name: string | null
  username: string | null
  avatar_url: string | null
  wallet_address: string | null
  current_streak: number
  best_streak: number
  total_pools_joined: number
  total_pools_won: number
  total_sol_earned: number
  total_proofs_submitted: number
  rank: number
}

function getDisplayName(entry: LeaderEntry) {
  if (entry.display_name) return entry.display_name
  if (entry.username) return entry.username
  if (entry.wallet_address) return `${entry.wallet_address.slice(0, 4)}...${entry.wallet_address.slice(-4)}`
  return "Anonymous"
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20">
      <Crown className="h-4 w-4 text-accent" />
    </div>
  )
  if (rank === 2) return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10">
      <span className="font-display text-sm font-bold text-foreground/60">2</span>
    </div>
  )
  if (rank === 3) return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
      <span className="font-display text-sm font-bold text-accent/60">3</span>
    </div>
  )
  return (
    <div className="flex h-8 w-8 items-center justify-center">
      <span className="font-display text-sm text-muted-foreground">{rank}</span>
    </div>
  )
}

export function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        // Try RPC first
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'get_global_leaderboard',
          { p_limit: 8 }
        )

        if (!rpcError && rpcData && rpcData.length > 0) {
          setLeaders(rpcData)
        } else {
          // Fallback: query profiles
          const { data, error } = await supabase
            .from('profiles')
            .select('id, display_name, username, avatar_url, wallet_address, current_streak, best_streak, total_pools_joined, total_pools_won, total_sol_earned, total_proofs_submitted')
            .or('current_streak.gt.0,total_pools_joined.gt.0')
            .order('current_streak', { ascending: false, nullsFirst: false })
            .order('best_streak', { ascending: false, nullsFirst: false })
            .limit(8)

          if (error) throw error

          const ranked: LeaderEntry[] = (data || []).map((p: any, idx: number) => ({
            user_id: p.id,
            display_name: p.display_name,
            username: p.username,
            avatar_url: p.avatar_url,
            wallet_address: p.wallet_address,
            current_streak: p.current_streak ?? 0,
            best_streak: p.best_streak ?? 0,
            total_pools_joined: p.total_pools_joined ?? 0,
            total_pools_won: p.total_pools_won ?? 0,
            total_sol_earned: p.total_sol_earned ?? 0,
            total_proofs_submitted: p.total_proofs_submitted ?? 0,
            rank: idx + 1,
          }))
          setLeaders(ranked)
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  return (
    <section id="leaderboard" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-accent/3 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center md:mb-16">
          <span className="mb-4 inline-block rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            Leaderboard
          </span>
          <h2 className="mb-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            <span className="text-balance">Top Stakers</span>
          </h2>
          <p className="mx-auto max-w-xl text-pretty text-lg text-muted-foreground">
            The most disciplined wallets on Solana. These players don{"'"}t quit.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : leaders.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="mb-4">No stakers yet. Be the first!</p>
            <Link href="/auth"><Button className="bg-primary text-primary-foreground">Get Started</Button></Link>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {leaders.length >= 3 && (
              <div className="mb-12 grid gap-6 md:grid-cols-3">
                {leaders.slice(0, 3).map((leader, i) => {
                  const order = i === 0 ? "md:order-2" : i === 1 ? "md:order-1" : "md:order-3"
                  const height = i === 0 ? "md:pt-0" : "md:pt-8"
                  const borderColor = i === 0 ? "border-accent/40" : i === 1 ? "border-foreground/20" : "border-accent/20"
                  const name = getDisplayName(leader)

                  return (
                    <div key={leader.user_id} className={`${order} ${height}`}>
                      <div className={`relative overflow-hidden rounded-2xl border ${borderColor} bg-card p-6 transition-all hover:scale-[1.02] ${i === 0 ? "shadow-lg shadow-accent/10" : ""}`}>
                        {i === 0 && (
                          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-accent to-accent/50" />
                        )}
                        <div className="mb-4 flex items-center gap-4">
                          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${i === 0 ? "bg-accent/20" : "bg-secondary"}`}>
                            <span className={`font-display text-xl font-bold ${i === 0 ? "text-accent" : "text-foreground"}`}>
                              {name[0]?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-foreground">{name}</span>
                              {i === 0 && <Crown className="h-4 w-4 text-accent" />}
                            </div>
                            <span className="text-sm text-muted-foreground">#{leader.rank} Overall</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Flame className="h-3 w-3 text-accent" /> Streak
                            </div>
                            <span className="font-display text-lg font-bold text-foreground">{leader.current_streak}d</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Trophy className="h-3 w-3 text-primary" /> Pools
                            </div>
                            <span className="font-display text-lg font-bold text-foreground">{leader.total_pools_joined}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <TrendingUp className="h-3 w-3 text-primary" /> Won
                            </div>
                            <span className="font-display text-lg font-bold text-primary">{leader.total_sol_earned.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Rest of leaderboard */}
            {leaders.length > 3 && (
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="hidden grid-cols-12 gap-4 border-b border-border bg-secondary/50 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-4">Player</div>
                  <div className="col-span-2 text-center">Streak</div>
                  <div className="col-span-2 text-center">Pools</div>
                  <div className="col-span-3 text-right">SOL Won</div>
                </div>
                {leaders.slice(3).map((leader) => {
                  const name = getDisplayName(leader)
                  return (
                    <div key={leader.user_id} className="grid grid-cols-12 items-center gap-4 border-b border-border/50 px-6 py-4 transition-colors last:border-0 hover:bg-secondary/30">
                      <div className="col-span-1">
                        <RankBadge rank={leader.rank} />
                      </div>
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-muted-foreground">
                          {name[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="font-medium text-foreground">{name}</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <div className="inline-flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5 text-accent" />
                          <span className="font-display font-bold text-foreground">{leader.current_streak}d</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-center font-display font-bold text-foreground">
                        {leader.total_pools_joined}
                      </div>
                      <div className="col-span-3 text-right">
                        <span className="font-display font-bold text-primary">{leader.total_sol_earned.toFixed(1)}</span>
                        <span className="ml-1 text-sm text-muted-foreground">SOL</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        <div className="mt-12 text-center">
          <Link href="/leaderboard">
            <Button variant="outline" size="lg" className="gap-2 border-border bg-secondary text-foreground hover:bg-secondary/80">
              View Full Leaderboard
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
