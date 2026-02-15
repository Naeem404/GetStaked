"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Flame, Trophy, Zap, TrendingUp, Users, ArrowUpRight, LogOut, Clock, Target, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useUserStats, useHabitGrid } from "@/hooks/use-stats"
import { useMyPools } from "@/hooks/use-pools"

function HabitGridWeb({ days }: { days: { date: Date; count: number; isToday?: boolean }[] }) {
  const weeks: { date: Date; count: number; isToday?: boolean }[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  function getColor(count: number, isToday?: boolean) {
    if (isToday && count === 0) return "bg-primary/20 border border-primary/40"
    if (count === 0) return "bg-secondary"
    if (count === 1) return "bg-primary/40"
    if (count === 2) return "bg-primary/60"
    return "bg-primary"
  }

  return (
    <div className="flex gap-1">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((day, di) => (
            <div
              key={di}
              className={`h-3 w-3 rounded-sm ${getColor(day.count, day.isToday)}`}
              title={`${day.date.toLocaleDateString()}: ${day.count} proofs`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function getPoolTag(pool: any) {
  if (pool.is_hot) return { label: "HOT", color: "bg-accent/10 text-accent" }
  if (pool.stake_amount >= 3) return { label: "HIGH STAKES", color: "bg-destructive/10 text-destructive" }
  if (pool.status === 'waiting') return { label: "WAITING", color: "bg-chart-4/10 text-chart-4" }
  return { label: "ACTIVE", color: "bg-primary/10 text-primary" }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { stats, loading: statsLoading } = useUserStats()
  const { days, loading: gridLoading } = useHabitGrid(91)
  const { pools: myPools, loading: poolsLoading } = useMyPools()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [authLoading, user, router])

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              GET STAKED
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link href="/dashboard" className="text-sm font-medium text-foreground">Dashboard</Link>
            <Link href="/pools" className="text-sm text-muted-foreground hover:text-foreground">Pools</Link>
            <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground">Leaderboard</Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-secondary px-4 py-2 md:flex">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                {(profile?.display_name || user.email)?.[0]?.toUpperCase() || "?"}
              </div>
              <span className="text-sm font-medium text-foreground">{profile?.display_name || user.email?.split("@")[0]}</span>
            </div>
            <button
              onClick={async () => { await signOut(); router.push("/") }}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back, {profile?.display_name || user.email?.split("@")[0]} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">Track your habits, dominate your pools.</p>
        </div>

        {/* Stats grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Current Streak", value: `${stats.currentStreak}d`, icon: Flame, color: "text-accent" },
            { label: "Best Streak", value: `${stats.bestStreak}d`, icon: Award, color: "text-primary" },
            { label: "Pools Active", value: myPools.length.toString(), icon: Users, color: "text-chart-4" },
            { label: "SOL Earned", value: `${stats.totalSolEarned.toFixed(2)}`, icon: TrendingUp, color: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="font-display text-3xl font-bold text-foreground">{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column - Habit Grid + More Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Habit Grid */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-display text-lg font-bold text-foreground">Habit Grid</h2>
              <div className="overflow-x-auto">
                <HabitGridWeb days={days} />
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="h-3 w-3 rounded-sm bg-secondary" />
                  <div className="h-3 w-3 rounded-sm bg-primary/40" />
                  <div className="h-3 w-3 rounded-sm bg-primary/60" />
                  <div className="h-3 w-3 rounded-sm bg-primary" />
                </div>
                <span>More</span>
              </div>
            </div>

            {/* Extended Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <Target className="mx-auto mb-2 h-6 w-6 text-primary" />
                <span className="block font-display text-2xl font-bold text-foreground">{stats.completionRate}%</span>
                <span className="text-sm text-muted-foreground">Completion Rate</span>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <Trophy className="mx-auto mb-2 h-6 w-6 text-accent" />
                <span className="block font-display text-2xl font-bold text-foreground">{stats.winRate}%</span>
                <span className="text-sm text-muted-foreground">Win Rate</span>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <Zap className="mx-auto mb-2 h-6 w-6 text-chart-4" />
                <span className="block font-display text-2xl font-bold text-foreground">{stats.totalProofsSubmitted}</span>
                <span className="text-sm text-muted-foreground">Proofs Submitted</span>
              </div>
            </div>
          </div>

          {/* Right column - My Pools */}
          <div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-foreground">My Pools</h2>
                <Link href="/pools">
                  <Button variant="ghost" size="sm" className="gap-1 text-primary">
                    View All <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              {poolsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : myPools.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                  <p className="mb-3 text-sm text-muted-foreground">No active pools yet</p>
                  <Link href="/pools">
                    <Button size="sm" className="bg-primary text-primary-foreground">
                      Browse Pools
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myPools.slice(0, 5).map((pool) => {
                    const tag = getPoolTag(pool)
                    const memberCount = pool.pool_members?.length || pool.current_players || 0
                    return (
                      <Link key={pool.id} href={`/pool/${pool.id}`}>
                        <div className="rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/60">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{pool.emoji || "🎯"}</span>
                              <span className="font-semibold text-foreground">{pool.name}</span>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tag.color}`}>
                              {tag.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" /> {memberCount}/{pool.max_players}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {pool.duration_days}d
                            </span>
                            <span className="font-semibold text-primary">{pool.stake_amount} SOL</span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
