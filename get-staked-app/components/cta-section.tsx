"use client"

import Link from "next/link"
import { ArrowRight, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card">
          {/* Background effects */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[100px]" />
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
                backgroundSize: '32px 32px'
              }}
            />
          </div>

          <div className="relative flex flex-col items-center px-8 py-16 text-center md:px-16 md:py-24">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Flame className="h-8 w-8 text-primary" />
            </div>

            <h2 className="mb-4 max-w-2xl font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              <span className="text-balance">Ready to put your money where your mouth is?</span>
            </h2>

            <p className="mb-10 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Join thousands of stakers who are building real habits with real consequences.
              Your excuses cost money now.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="group gap-2 bg-primary px-8 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                >
                  Create Account & Start
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">
                Free to join. You only pay your stake.
              </span>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Solana Devnet
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Open Source
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Audited Contracts
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                0% Platform Fee
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
