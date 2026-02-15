"use client"

import { Brain, Mic, Shield, BarChart3, Smartphone, Zap } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI Proof Verification",
    description: "Gemini AI analyzes your photo submissions in real-time. No honor system — the algorithm decides if you did the work.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Mic,
    title: "Voice AI Coach",
    description: "ElevenLabs-powered voice coach with 3 personas: Drill Sergeant, Hype Beast, or Gentle Guide. It knows your streak and it will call you out.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Shield,
    title: "Trustless Escrow",
    description: "Anchor smart contracts on Solana hold all stakes. No middleman, no platform cut. Code is law — winners get paid automatically.",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description: "Snowflake-powered insights tell you your best days, risk of failure, and optimal habits. Data-driven discipline.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Smartphone,
    title: "PWA Native Feel",
    description: "Install directly to your Android home screen. Camera access, push notifications, GPS tagging — it feels native because it basically is.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Zap,
    title: "Escalating Stakes",
    description: "Toggle escalating mode and your stake doubles each week. The pressure builds. The pot grows. Only the committed survive.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-1/2 h-[500px] w-[500px] rounded-full bg-primary/3 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 text-center md:mb-20">
          <span className="mb-4 inline-block rounded-full border border-chart-4/20 bg-chart-4/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-chart-4">
            Features
          </span>
          <h2 className="mb-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            <span className="text-balance">Built different</span>
          </h2>
          <p className="mx-auto max-w-xl text-pretty text-lg text-muted-foreground">
            Not another todo app. This is financial warfare against your worst habits.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 ${
                i === 0 ? "lg:col-span-2 lg:row-span-1" : ""
              } ${i === 5 ? "lg:col-span-2" : ""}`}
            >
              {/* Subtle gradient overlay on hover */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative">
                <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bgColor}`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>

                <h3 className="mb-3 font-display text-2xl font-bold text-foreground">{feature.title}</h3>
                <p className="text-pretty leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
