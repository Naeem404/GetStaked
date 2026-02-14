"use client";

import { StreakCounter } from "@/components/streak-counter";
import { HabitGrid } from "@/components/habit-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Zap } from "lucide-react";
import Link from "next/link";

// Mock data for demo
const mockStreak = 12;
const mockBestStreak = 21;

// Generate mock habit grid data (last 4 weeks for compact view)
const generateMockGridData = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 27; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const isToday = i === 0;
    
    // Simulate some missed days and various proof counts
    let count = 0;
    if (!isToday) {
      if (i % 7 === 0) count = 0; // Missed some days
      else if (i % 3 === 0) count = 1;
      else count = Math.floor(Math.random() * 3) + 1;
    }
    
    days.push({
      date,
      count,
      isToday,
    });
  }
  
  return days;
};

// Mock active pools
const mockActivePools = [
  {
    id: "1",
    habit: "🏃 Morning Run",
    emoji: "🏃",
    name: "Morning Run",
    streak: 5,
    totalDays: 7,
    stake: "0.5",
    needsProof: true,
  },
  {
    id: "2", 
    habit: "📚 Read 30 Pages",
    emoji: "📚",
    name: "Read 30 Pages",
    streak: 12,
    totalDays: 14,
    stake: "0.5",
    needsProof: false,
  },
  {
    id: "3",
    habit: "💪 Gym Session",
    emoji: "💪", 
    name: "Gym Session",
    streak: 3,
    totalDays: 7,
    stake: "0.5",
    needsProof: false,
  },
];

export default function Dashboard() {
  const gridData = generateMockGridData();

  // Progress dots component
  const ProgressDots = ({ current, total }: { current: number; total: number }) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              i < current ? "bg-brand-fire" : "bg-muted"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-white/6">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg gradient-text-fire font-700">GET STAKED</h1>
          <div className="flex items-center gap-2 bg-elevated px-3 py-1.5 rounded-full border border-white/6">
            <div className="w-6 h-6 bg-linear-to-br from-brand-fire to-brand-gold rounded-full" />
            <span className="text-sm font-mono text-brand-gold">2.45 SOL</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* SECTION 1: Streak Hero */}
        <div className="flex flex-col items-center justify-center py-12">
          <StreakCounter days={mockStreak} size="xl" />
          <p className="text-sm text-secondary mt-2">day streak</p>
          <p className="text-xs text-muted mt-1">Best: {mockBestStreak} days</p>
        </div>

        {/* SECTION 2: Mini Habit Grid */}
        <div className="flex flex-col items-center gap-4">
          <HabitGrid days={gridData} variant="compact" />
          <Link href="/stats" className="text-xs text-brand-fire hover:underline">
            View full history →
          </Link>
        </div>

        {/* SECTION 3: Active Pools */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-600 text-primary">Active</h2>
            <Badge variant="secondary" className="bg-brand-fire/20 text-brand-fire border-0">
              {mockActivePools.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {mockActivePools.map((pool) => (
              <Link
                key={pool.id}
                href={`/pools/${pool.id}`}
                className={cn(
                  "block bg-surface rounded-2xl p-4 border transition-all duration-200",
                  "hover:bg-elevated hover:scale-[1.02] active:scale-[0.98]",
                  pool.needsProof && "border-l-4 border-l-brand-amber relative"
                )}
              >
                {/* Pulsing dot for pools needing proof */}
                {pool.needsProof && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-brand-amber rounded-full animate-pulse" />
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pool.emoji}</span>
                    <div>
                      <p className="font-medium text-primary">{pool.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted">0.5 SOL staked</span>
                      </div>
                    </div>
                  </div>
                  
                  <StreakCounter days={pool.streak} size="sm" />
                </div>

                <div className="mt-3">
                  <ProgressDots current={pool.streak} total={pool.totalDays} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Empty state (shown when no pools) */}
        {mockActivePools.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-elevated rounded-2xl flex items-center justify-center mb-4">
              <Trophy size={32} className="text-muted" />
            </div>
            <h3 className="text-lg text-primary mb-2">No active stakes</h3>
            <p className="text-sm text-secondary mb-4">Put your SOL where your mouth is</p>
            <Button asChild className="bg-linear-to-r from-brand-fire to-brand-gold">
              <Link href="/pools">Browse Pools</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Bottom padding for nav */}
      <div className="h-20" />
    </div>
  );
}

// Helper function for className
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
