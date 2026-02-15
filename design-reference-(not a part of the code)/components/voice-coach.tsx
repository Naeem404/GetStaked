"use client"

import { useState, useEffect, useCallback } from "react"
import { Volume2, Play, Pause } from "lucide-react"

const personas = [
  {
    id: "drill",
    name: "Drill Sergeant",
    tagline: "No excuses. No mercy.",
    description: "Aggressive, commanding, competitive. This coach treats your habits like boot camp.",
    messages: [
      "It's 6 PM and I haven't seen your proof yet. You've got 6 hours. Don't let 0.5 SOL walk away.",
      "One down. Their stake just got added to the pot. You're closer to payday.",
      "Day 3 in the bag! 2 people already dropped out — their money is looking real good right now.",
    ],
    color: "border-destructive/40 bg-destructive/5",
    activeColor: "border-destructive bg-destructive/10",
    textColor: "text-destructive",
    dotColor: "bg-destructive",
  },
  {
    id: "hype",
    name: "Hype Beast",
    tagline: "LET'S GOOO!",
    description: "Excited, celebratory, high energy. Every small win deserves a parade.",
    messages: [
      "YOU DID IT! 14 days straight. That discipline just earned you 0.8 SOL. WINNERS GET PAID!",
      "Bro you're ON FIRE! 🔥 Streak is at 12 and climbing. Nobody can touch you right now!",
      "Another day, another W. The pot is getting THICK. Keep this energy going!",
    ],
    color: "border-accent/40 bg-accent/5",
    activeColor: "border-accent bg-accent/10",
    textColor: "text-accent",
    dotColor: "bg-accent",
  },
  {
    id: "gentle",
    name: "Gentle Guide",
    tagline: "You've got this.",
    description: "Calm, supportive, encouraging. Progress over perfection.",
    messages: [
      "Hey — I noticed you haven't submitted today. That's okay. Take a breath. You've made it 11 days. Let's keep going.",
      "You showed up again today. That consistency is building something real. I'm proud of you.",
      "The streak broke, but you still showed up more than most. Join another pool when you're ready.",
    ],
    color: "border-primary/40 bg-primary/5",
    activeColor: "border-primary bg-primary/10",
    textColor: "text-primary",
    dotColor: "bg-primary",
  },
]

export function VoiceCoach() {
  const [activePersona, setActivePersona] = useState("drill")
  const [activeMessage, setActiveMessage] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(40).fill(4))

  const generateWave = useCallback(() => {
    setWaveHeights(Array(40).fill(0).map(() => Math.random() * 24 + 4))
  }, [])

  useEffect(() => {
    if (!isPlaying) {
      setWaveHeights(Array(40).fill(4))
      return
    }
    const interval = setInterval(generateWave, 150)
    return () => clearInterval(interval)
  }, [isPlaying, generateWave])

  const persona = personas.find(p => p.id === activePersona)!

  return (
    <section className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/3 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Info */}
          <div>
            <span className="mb-4 inline-block rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
              AI Voice Coach
            </span>
            <h2 className="mb-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              <span className="text-balance">Your personal accountability partner</span>
            </h2>
            <p className="mb-8 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              Powered by ElevenLabs, your voice coach reacts to your streaks, failures, and milestones in real-time.
              Pick a persona that matches your energy.
            </p>

            {/* Persona selector */}
            <div className="flex flex-col gap-3">
              {personas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setActivePersona(p.id); setActiveMessage(0); setIsPlaying(false); }}
                  className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                    activePersona === p.id ? p.activeColor : p.color + " hover:bg-secondary/50"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${activePersona === p.id ? p.dotColor : "bg-secondary"}`}>
                    <Volume2 className={`h-5 w-5 ${activePersona === p.id ? "text-background" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <span className={`font-display font-bold ${activePersona === p.id ? p.textColor : "text-foreground"}`}>
                      {p.name}
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground">— {p.tagline}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Message preview */}
          <div className="flex items-center">
            <div className="w-full overflow-hidden rounded-2xl border border-border bg-card">
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-border bg-secondary/30 px-6 py-4">
                <div className={`h-3 w-3 animate-pulse rounded-full ${persona.dotColor}`} />
                <span className="font-display font-bold text-foreground">{persona.name}</span>
                <span className="text-xs text-muted-foreground">{persona.description}</span>
              </div>

              {/* Messages */}
              <div className="flex flex-col gap-4 p-6">
                {persona.messages.map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveMessage(i); setIsPlaying(!isPlaying || activeMessage !== i); }}
                    className={`group flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                      activeMessage === i
                        ? `${persona.activeColor} shadow-md`
                        : "border-border bg-secondary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                      activeMessage === i ? persona.dotColor : "bg-secondary"
                    }`}>
                      {activeMessage === i && isPlaying ? (
                        <Pause className={`h-4 w-4 ${activeMessage === i ? "text-background" : "text-muted-foreground"}`} />
                      ) : (
                        <Play className={`h-4 w-4 ${activeMessage === i ? "text-background" : "text-muted-foreground"}`} />
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${activeMessage === i ? "text-foreground" : "text-muted-foreground"}`}>
                      {msg}
                    </p>
                  </button>
                ))}
              </div>

              {/* Waveform bar */}
              <div className="flex items-center gap-1 border-t border-border px-6 py-4">
                {waveHeights.map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full ${isPlaying ? persona.dotColor : "bg-secondary"}`}
                    style={{
                      height: `${h}px`,
                      transition: "height 0.15s ease",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
