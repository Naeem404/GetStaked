import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { LivePools } from "@/components/live-pools"
import { Leaderboard } from "@/components/leaderboard"
import { Features } from "@/components/features"
import { VoiceCoach } from "@/components/voice-coach"
import { StreakHeatmap } from "@/components/streak-heatmap"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <HowItWorks />
      <LivePools />
      <Leaderboard />
      <VoiceCoach />
      <StreakHeatmap />
      <Features />
      <CtaSection />
      <Footer />
    </main>
  )
}
