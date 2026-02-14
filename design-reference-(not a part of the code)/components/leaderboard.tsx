"use client"

import { Flame, Trophy, TrendingUp, Crown } from "lucide-react"

const leaders = [
  { rank: 1, name: "0xDrk...7f2a", streak: 47, pools: 12, winnings: 24.5, avatar: "D" },
  { rank: 2, name: "phantom...9e1b", streak: 42, pools: 9, winnings: 18.3, avatar: "P" },
  { rank: 3, name: "sol_beast...3c4d", streak: 38, pools: 15, winnings: 15.7, avatar: "S" },
  { rank: 4, name: "habit_ape...6a8f", streak: 35, pools: 7, winnings: 12.1, avatar: "H" },
  { rank: 5, name: "staker42...b2e0", streak: 31, pools: 11, winnings: 10.8, avatar: "T" },
  { rank: 6, name: "grind_fm...4d7c", streak: 28, pools: 6, winnings: 9.4, avatar: "G" },
  { rank: 7, name: "iron_will...1f3e", streak: 25, pools: 8, winnings: 8.2, avatar: "I" },
  { rank: 8, name: "no_quit...5a9b", streak: 22, pools: 5, winnings: 6.7, avatar: "N" },
]

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
  return (
    <section id="leaderboard" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-accent/3 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
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

        {/* Top 3 podium */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {leaders.slice(0, 3).map((leader, i) => {
            const order = i === 0 ? "md:order-2" : i === 1 ? "md:order-1" : "md:order-3"
            const height = i === 0 ? "md:pt-0" : "md:pt-8"
            const borderColor = i === 0 ? "border-accent/40" : i === 1 ? "border-foreground/20" : "border-accent/20"
            const glowColor = i === 0 ? "shadow-accent/10" : ""

            return (
              <div key={leader.rank} className={`${order} ${height}`}>
                <div className={`relative overflow-hidden rounded-2xl border ${borderColor} bg-card p-6 transition-all hover:scale-[1.02] ${glowColor} ${i === 0 ? "shadow-lg" : ""}`}>
                  {i === 0 && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-accent to-accent/50" />
                  )}

                  <div className="mb-4 flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full ${i === 0 ? "bg-accent/20" : "bg-secondary"}`}>
                      <span className={`font-display text-xl font-bold ${i === 0 ? "text-accent" : "text-foreground"}`}>
                        {leader.avatar}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-foreground">{leader.name}</span>
                        {i === 0 && <Crown className="h-4 w-4 text-accent" />}
                      </div>
                      <span className="text-sm text-muted-foreground">#{leader.rank} Overall</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Flame className="h-3 w-3 text-accent" />
                        Streak
                      </div>
                      <span className="font-display text-lg font-bold text-foreground">{leader.streak}d</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Trophy className="h-3 w-3 text-primary" />
                        Pools
                      </div>
                      <span className="font-display text-lg font-bold text-foreground">{leader.pools}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        Won
                      </div>
                      <span className="font-display text-lg font-bold text-primary">{leader.winnings}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Rest of leaderboard */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-12 gap-4 border-b border-border bg-secondary/50 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Wallet</div>
            <div className="col-span-2 text-center">Streak</div>
            <div className="col-span-2 text-center">Pools Won</div>
            <div className="col-span-3 text-right">Total Winnings</div>
          </div>
          {leaders.slice(3).map((leader) => (
            <div key={leader.rank} className="grid grid-cols-12 items-center gap-4 border-b border-border/50 px-6 py-4 transition-colors last:border-0 hover:bg-secondary/30">
              <div className="col-span-1">
                <RankBadge rank={leader.rank} />
              </div>
              <div className="col-span-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-muted-foreground">
                  {leader.avatar}
                </div>
                <span className="font-medium text-foreground">{leader.name}</span>
              </div>
              <div className="col-span-2 text-center">
                <div className="inline-flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-accent" />
                  <span className="font-display font-bold text-foreground">{leader.streak}d</span>
                </div>
              </div>
              <div className="col-span-2 text-center font-display font-bold text-foreground">
                {leader.pools}
              </div>
              <div className="col-span-3 text-right">
                <span className="font-display font-bold text-primary">{leader.winnings}</span>
                <span className="ml-1 text-sm text-muted-foreground">SOL</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
