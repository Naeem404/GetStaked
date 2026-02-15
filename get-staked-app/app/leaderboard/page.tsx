"use client"

import Link from "next/link"
import { Flame, Trophy, TrendingUp, Crown, LogOut, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useGlobalLeaderboard } from "@/hooks/use-leaderboard"

export default function LeaderboardPage() {
  const { user, profile, signOut } = useAuth()
  const { entries, myRank, loading } = useGlobalLeaderboard(50)

  function truncateAddress(addr: string | null) {
    if (!addr) return null
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  function getDisplayName(entry: any) {
    return entry.display_name || entry.username || truncateAddress(entry.wallet_address) || "Anonymous"
  }

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
            <Link href="/pools" className="text-sm text-muted-foreground hover:text-foreground">Pools</Link>
            <Link href="/leaderboard" className="text-sm font-medium text-foreground">Leaderboard</Link>
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
              <Link href="/auth"><Button className="bg-primary text-primary-foreground">Sign In</Button></Link>
            )}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            Leaderboard
          </span>
          <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Top Stakers
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            The most disciplined wallets on Solana. These players don&apos;t quit.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : entries.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-display text-xl font-bold text-foreground">No stakers yet</h3>
            <p className="mb-6 text-muted-foreground">Be the first to start a streak!</p>
            <Link href="/pools"><Button className="bg-primary text-primary-foreground">Browse Pools</Button></Link>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {entries.length >= 3 && (
              <div className="mb-12 grid gap-6 md:grid-cols-3">
                {entries.slice(0, 3).map((entry, i) => {
                  const order = i === 0 ? "md:order-2" : i === 1 ? "md:order-1" : "md:order-3"
                  const height = i === 0 ? "md:pt-0" : "md:pt-8"
                  const borderColor = i === 0 ? "border-accent/40" : i === 1 ? "border-foreground/20" : "border-accent/20"

                  return (
                    <div key={entry.user_id} className={`${order} ${height}`}>
                      <div className={`relative overflow-hidden rounded-2xl border ${borderColor} bg-card p-6 transition-all hover:scale-[1.02] ${i === 0 ? "shadow-lg shadow-accent/10" : ""}`}>
                        {i === 0 && (
                          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-accent to-accent/50" />
                        )}
                        <div className="mb-4 flex items-center gap-4">
                          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${i === 0 ? "bg-accent/20" : "bg-secondary"}`}>
                            <span className={`font-display text-xl font-bold ${i === 0 ? "text-accent" : "text-foreground"}`}>
                              {getDisplayName(entry)[0]?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-foreground">{getDisplayName(entry)}</span>
                              {i === 0 && <Crown className="h-4 w-4 text-accent" />}
                            </div>
                            <span className="text-sm text-muted-foreground">#{entry.rank} Overall</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Flame className="h-3 w-3 text-accent" /> Streak
                            </div>
                            <span className="font-display text-lg font-bold text-foreground">{entry.current_streak}d</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Trophy className="h-3 w-3 text-primary" /> Pools
                            </div>
                            <span className="font-display text-lg font-bold text-foreground">{entry.total_pools_joined}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <TrendingUp className="h-3 w-3 text-primary" /> Won
                            </div>
                            <span className="font-display text-lg font-bold text-primary">{entry.total_sol_earned.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* My rank card */}
            {myRank && (
              <div className="mb-8 rounded-2xl border border-primary/30 bg-primary/5 p-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Your Rank</h3>
                <div className="flex items-center gap-4">
                  <span className="font-display text-3xl font-bold text-primary">#{myRank.rank}</span>
                  <div className="flex-1">
                    <span className="font-bold text-foreground">{getDisplayName(myRank)}</span>
                    <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-accent" /> {myRank.current_streak}d streak</span>
                      <span>{myRank.total_pools_joined} pools</span>
                      <span className="text-primary">{myRank.total_sol_earned.toFixed(1)} SOL won</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rest of leaderboard */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="hidden grid-cols-12 gap-4 border-b border-border bg-secondary/50 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Player</div>
                <div className="col-span-2 text-center">Streak</div>
                <div className="col-span-2 text-center">Pools</div>
                <div className="col-span-3 text-right">SOL Won</div>
              </div>
              {entries.slice(entries.length >= 3 ? 3 : 0).map((entry) => {
                const isMe = entry.user_id === user?.id
                return (
                  <div
                    key={entry.user_id}
                    className={`grid grid-cols-12 items-center gap-4 border-b border-border/50 px-6 py-4 transition-colors last:border-0 hover:bg-secondary/30 ${isMe ? "bg-primary/5" : ""}`}
                  >
                    <div className="col-span-1">
                      <span className="font-display text-sm font-bold text-muted-foreground">#{entry.rank}</span>
                    </div>
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-muted-foreground">
                        {getDisplayName(entry)[0]?.toUpperCase() || "?"}
                      </div>
                      <span className="font-medium text-foreground">
                        {getDisplayName(entry)}
                        {isMe && <span className="ml-2 text-xs text-primary">(You)</span>}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="inline-flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-accent" />
                        <span className="font-display font-bold text-foreground">{entry.current_streak}d</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-center font-display font-bold text-foreground">
                      {entry.total_pools_joined}
                    </div>
                    <div className="col-span-3 text-right">
                      <span className="font-display font-bold text-primary">{entry.total_sol_earned.toFixed(1)}</span>
                      <span className="ml-1 text-sm text-muted-foreground">SOL</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
