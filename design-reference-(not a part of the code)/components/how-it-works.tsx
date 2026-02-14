"use client"

import { Wallet, Users, Camera, Trophy } from "lucide-react"

const steps = [
  {
    icon: Wallet,
    step: "01",
    title: "Stake SOL",
    description: "Connect your Phantom wallet and deposit SOL into a trustless escrow smart contract. Your money is locked — no backing out.",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
  {
    icon: Users,
    step: "02",
    title: "Join a Pool",
    description: "Find a habit pool that matches your goal. Gym rats, runners, coders — everyone has skin in the game.",
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/20",
  },
  {
    icon: Camera,
    step: "03",
    title: "Submit Proof",
    description: "Snap a photo or video each day. Our Gemini AI verifies your proof is legit — no cheating, no excuses.",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    borderColor: "border-chart-4/20",
  },
  {
    icon: Trophy,
    step: "04",
    title: "Win Money",
    description: "Pool ends, smart contract settles. Winners split the losers' stakes automatically. Discipline pays — literally.",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center md:mb-20">
          <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            How It Works
          </span>
          <h2 className="mb-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            <span className="text-balance">Four steps to financial accountability</span>
          </h2>
          <p className="mx-auto max-w-xl text-pretty text-lg text-muted-foreground">
            No honor system. No manual referees. Just code, AI, and cold hard incentives.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.step}
              className={`group relative rounded-2xl border ${step.borderColor} bg-card p-6 transition-all duration-300 hover:scale-[1.02] hover:border-opacity-50`}
            >
              {/* Step number */}
              <span className="mb-4 block font-display text-5xl font-bold text-secondary/80">
                {step.step}
              </span>

              {/* Icon */}
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${step.bgColor}`}>
                <step.icon className={`h-6 w-6 ${step.color}`} />
              </div>

              {/* Content */}
              <h3 className="mb-2 font-display text-xl font-bold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>

              {/* Connector line (hidden on last) */}
              {step.step !== "04" && (
                <div className="absolute -right-3 top-1/2 hidden h-0.5 w-6 bg-border lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
