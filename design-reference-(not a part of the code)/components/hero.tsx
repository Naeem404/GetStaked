"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

function AnimatedCounter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 2000
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [end])

  return (
    <span className="font-display text-3xl font-bold text-foreground md:text-4xl">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-24">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pt-16 text-center md:pt-24">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-medium text-primary">Live on Solana Devnet</span>
        </div>

        {/* Main heading */}
        <h1 className="mb-6 max-w-4xl font-display text-5xl font-bold leading-[1.1] tracking-tight text-foreground md:text-7xl lg:text-8xl">
          <span className="text-balance">Stake Money.</span>
          <br />
          <span className="text-balance">Build Habits.</span>
          <br />
          <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-balance text-transparent">
            Win Big.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mb-10 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          Put your money where your mouth is. Stake SOL on your habits,
          get AI-verified, and split the losers{"'"} money. Trustless.
          Competitive. Ruthless.
        </p>

        {/* CTAs */}
        <div className="mb-16 flex flex-col items-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="group gap-2 bg-primary px-8 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
          >
            Start Staking
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 border-border bg-secondary px-8 text-lg text-foreground hover:bg-secondary/80"
          >
            View Active Pools
          </Button>
        </div>

        {/* Stats row */}
        <div className="mb-20 grid w-full max-w-3xl grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { value: 2847, suffix: "", label: "Active Stakers", icon: Zap },
            { value: 156, suffix: "", label: "Live Pools", icon: TrendingUp },
            { value: 89, suffix: "K", label: "SOL Staked", prefix: "", icon: Shield },
            { value: 94, suffix: "%", label: "Payout Rate", icon: Shield },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix || ""} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Floating demo cards */}
        <div className="relative mx-auto w-full max-w-5xl">
          <div className="animate-pulse-glow rounded-2xl border border-border bg-card p-1">
            <div className="rounded-xl bg-secondary/50 p-6 md:p-8">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Pool Card Preview 1 */}
                <div className="rounded-xl border border-border bg-card p-5 transition-transform hover:scale-[1.02]">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">ACTIVE</span>
                    <span className="text-xs text-muted-foreground">7 days left</span>
                  </div>
                  <h3 className="mb-1 font-display text-lg font-bold text-foreground">Gym 5x/Week</h3>
                  <p className="mb-4 text-sm text-muted-foreground">Selfie at gym with equipment visible</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary">0.5</span>
                      <span className="ml-1 text-sm text-muted-foreground">SOL</span>
                    </div>
                    <div className="flex -space-x-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-secondary text-xs font-bold text-muted-foreground">
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pool Card Preview 2 */}
                <div className="rounded-xl border border-accent/30 bg-card p-5 transition-transform hover:scale-[1.02]">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">HOT</span>
                    <span className="text-xs text-muted-foreground">14 days left</span>
                  </div>
                  <h3 className="mb-1 font-display text-lg font-bold text-foreground">No Sugar Challenge</h3>
                  <p className="mb-4 text-sm text-muted-foreground">Photo of every meal, no sugar</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-accent">2.0</span>
                      <span className="ml-1 text-sm text-muted-foreground">SOL</span>
                    </div>
                    <div className="flex -space-x-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-secondary text-xs font-bold text-muted-foreground">
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pool Card Preview 3 */}
                <div className="rounded-xl border border-border bg-card p-5 transition-transform hover:scale-[1.02]">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">HIGH STAKES</span>
                    <span className="text-xs text-muted-foreground">3 days left</span>
                  </div>
                  <h3 className="mb-1 font-display text-lg font-bold text-foreground">Morning Run 6AM</h3>
                  <p className="mb-4 text-sm text-muted-foreground">GPS-tagged run screenshot before 6:30</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-destructive">5.0</span>
                      <span className="ml-1 text-sm text-muted-foreground">SOL</span>
                    </div>
                    <div className="flex -space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-secondary text-xs font-bold text-muted-foreground">
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
