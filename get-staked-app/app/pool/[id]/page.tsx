"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Flame, Clock, Users, ArrowLeft, Zap, Trophy, TrendingUp, Crown, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { usePoolDetail, joinPool } from "@/hooks/use-pools"

function getStatusColor(status: string | null) {
  switch (status) {
    case "active": return "bg-primary/10 text-primary"
    case "waiting": return "bg-chart-4/10 text-chart-4"
    case "settling": return "bg-accent/10 text-accent"
    case "completed": return "bg-muted text-muted-foreground"
    default: return "bg-secondary text-muted-foreground"
  }
}

export default function PoolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const poolId = params.id as string
  const { user, profile } = useAuth()
  const { pool, loading, error, refetch } = usePoolDetail(poolId)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [joinSuccess, setJoinSuccess] = useState(false)

  async function handleJoin() {
    if (!user) {
      router.push("/auth")
      return
    }
    if (!pool) return

    setJoining(true)
    setJoinError(null)

    const { error } = await joinPool(pool.id, user.id)
    if (error) {
      setJoinError(error.message || "Failed to join pool")
    } else {
      setJoinSuccess(true)
      refetch()
    }
    setJoining(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !pool) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="mb-2 font-display text-xl font-bold text-foreground">Pool not found</h2>
        <p className="mb-6 text-muted-foreground">{error || "This pool doesn't exist."}</p>
        <Link href="/pools"><Button>Browse Pools</Button></Link>
      </div>
    )
  }

  const isMember = !!pool.my_membership
  const isFull = (pool.current_players ?? 0) >= pool.max_players
  const canJoin = !isMember && !isFull && (pool.status === "waiting" || pool.status === "active")
  const fillPercent = ((pool.current_players ?? 0) / pool.max_players) * 100
  const daysLeft = pool.ends_at
    ? Math.max(0, Math.ceil((new Date(pool.ends_at).getTime() - Date.now()) / 86400000))
    : pool.duration_days

  const members = pool.pool_members || []
  const sortedMembers = [...members].sort((a, b) => (b.current_streak ?? 0) - (a.current_streak ?? 0))

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
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button variant="outline" className="border-border bg-secondary text-foreground">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button className="bg-primary text-primary-foreground">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Back */}
        <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Pools
        </button>

        {/* Pool Header */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="text-3xl">{pool.emoji || "🎯"}</span>
            <h1 className="font-display text-3xl font-bold text-foreground">{pool.name}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${getStatusColor(pool.status)}`}>
              {pool.status}
            </span>
          </div>

          <p className="mb-6 text-muted-foreground">{pool.description || pool.proof_description}</p>

          {/* Pool stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-xl bg-secondary/50 p-4 text-center">
              <span className="block text-xs uppercase tracking-wider text-muted-foreground">Stake</span>
              <span className="font-display text-2xl font-bold text-foreground">{pool.stake_amount}</span>
              <span className="ml-1 text-sm text-muted-foreground">SOL</span>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4 text-center">
              <span className="block text-xs uppercase tracking-wider text-muted-foreground">Total Pot</span>
              <span className="font-display text-2xl font-bold text-primary">{(pool.pot_size ?? 0).toFixed(1)}</span>
              <span className="ml-1 text-sm text-muted-foreground">SOL</span>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4 text-center">
              <span className="block text-xs uppercase tracking-wider text-muted-foreground">Duration</span>
              <span className="font-display text-2xl font-bold text-foreground">{pool.duration_days}</span>
              <span className="ml-1 text-sm text-muted-foreground">days</span>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4 text-center">
              <span className="block text-xs uppercase tracking-wider text-muted-foreground">Time Left</span>
              <span className="font-display text-2xl font-bold text-accent">{daysLeft}</span>
              <span className="ml-1 text-sm text-muted-foreground">days</span>
            </div>
          </div>

          {/* Players bar */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{pool.current_players ?? 0}/{pool.max_players} players</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-accent" />
                <span className="capitalize">{pool.frequency || "daily"}</span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          {/* Proof requirement */}
          <div className="mb-6 rounded-lg border border-border bg-secondary/30 p-4">
            <h3 className="mb-1 text-sm font-semibold text-foreground">Proof Required</h3>
            <p className="text-sm text-muted-foreground">{pool.proof_description}</p>
          </div>

          {/* Join / Status */}
          {joinError && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {joinError}
            </div>
          )}
          {joinSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
              <CheckCircle className="h-4 w-4" /> Successfully joined the pool!
            </div>
          )}

          {isMember ? (
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="font-medium text-primary">You&apos;re a member of this pool</span>
            </div>
          ) : canJoin ? (
            <Button
              onClick={handleJoin}
              disabled={joining}
              className="w-full gap-2 bg-primary py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {joining ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>Join Pool — Stake {pool.stake_amount} SOL</>
              )}
            </Button>
          ) : isFull ? (
            <div className="rounded-lg border border-border bg-secondary/50 px-4 py-3 text-center text-sm text-muted-foreground">
              This pool is full
            </div>
          ) : null}
        </div>

        {/* Member Leaderboard */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-6 flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <Trophy className="h-5 w-5 text-accent" /> Member Leaderboard
          </h2>

          {sortedMembers.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No members yet. Be the first to join!</p>
          ) : (
            <div className="space-y-2">
              {sortedMembers.map((member: any, idx: number) => {
                const isMe = member.user_id === user?.id
                return (
                  <div
                    key={member.id}
                    className={`flex items-center gap-4 rounded-lg px-4 py-3 ${isMe ? "border border-primary/30 bg-primary/5" : "bg-secondary/30"}`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center">
                      {idx === 0 ? (
                        <Crown className="h-5 w-5 text-accent" />
                      ) : (
                        <span className="font-display text-sm font-bold text-muted-foreground">#{idx + 1}</span>
                      )}
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-muted-foreground">
                      {(member.profiles?.display_name || "?")?.[0]?.toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <span className="font-medium text-foreground">
                        {member.profiles?.display_name || "Anonymous"}
                        {isMe && <span className="ml-2 text-xs text-primary">(You)</span>}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-accent">
                        <Flame className="h-3.5 w-3.5" />
                        <span className="font-bold">{member.current_streak ?? 0}d</span>
                      </div>
                      <div className="text-muted-foreground">
                        {member.days_completed ?? 0} days
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
