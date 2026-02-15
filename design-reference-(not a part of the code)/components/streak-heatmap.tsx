"use client"

import { useMemo } from "react"
import { Flame, Calendar, TrendingUp, Target } from "lucide-react"

function generateHeatmapData() {
  const days = 91
  const data: { date: string; value: number; day: number }[] = []
  let streak = 0

  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i))
    const dayOfWeek = date.getDay()

    // Simulate realistic habit data — weekdays stronger
    const baseChance = dayOfWeek === 0 || dayOfWeek === 6 ? 0.55 : 0.8
    const streakBonus = Math.min(streak * 0.02, 0.15)
    const completed = Math.random() < (baseChance + streakBonus)

    if (completed) {
      streak++
    } else {
      streak = 0
    }

    data.push({
      date: date.toISOString().split("T")[0],
      value: completed ? Math.min(streak, 4) : 0,
      day: dayOfWeek,
    })
  }
  return data
}

const intensityColors = [
  "bg-secondary",
  "bg-primary/20",
  "bg-primary/40",
  "bg-primary/60",
  "bg-primary/90",
]

export function StreakHeatmap() {
  const data = useMemo(() => generateHeatmapData(), [])

  const weeks: typeof data[] = []
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7))
  }

  const currentStreak = useMemo(() => {
    let s = 0
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].value > 0) s++
      else break
    }
    return s
  }, [data])

  const totalDays = data.filter(d => d.value > 0).length
  const completionRate = Math.round((totalDays / data.length) * 100)

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            Streak Dashboard
          </span>
          <h2 className="mb-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            <span className="text-balance">Visualize your discipline</span>
          </h2>
          <p className="mx-auto max-w-xl text-pretty text-lg text-muted-foreground">
            Every green square is money earned. Every gap is money lost.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {/* Stats header */}
          <div className="grid grid-cols-2 gap-4 border-b border-border p-6 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-muted-foreground">Current Streak</span>
                <span className="font-display text-xl font-bold text-foreground">{currentStreak} days</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-muted-foreground">Total Days</span>
                <span className="font-display text-xl font-bold text-foreground">{totalDays}/91</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-4/10">
                <TrendingUp className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-muted-foreground">Completion</span>
                <span className="font-display text-xl font-bold text-foreground">{completionRate}%</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-muted-foreground">Earnings</span>
                <span className="font-display text-xl font-bold text-primary">+4.2 SOL</span>
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>13 weeks ago</span>
              <span>Today</span>
            </div>

            {/* Day labels + grid */}
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 pr-2 pt-0 text-xs text-muted-foreground">
                <span className="flex h-4 items-center">M</span>
                <span className="flex h-4 items-center">T</span>
                <span className="flex h-4 items-center">W</span>
                <span className="flex h-4 items-center">T</span>
                <span className="flex h-4 items-center">F</span>
                <span className="flex h-4 items-center">S</span>
                <span className="flex h-4 items-center">S</span>
              </div>

              <div className="flex flex-1 gap-1 overflow-x-auto">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((day, di) => (
                      <div
                        key={di}
                        className={`h-4 w-4 rounded-sm ${intensityColors[day.value]} transition-colors hover:ring-1 hover:ring-foreground/20`}
                        title={`${day.date}: ${day.value > 0 ? "Completed" : "Missed"}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              {intensityColors.map((color, i) => (
                <div key={i} className={`h-3 w-3 rounded-sm ${color}`} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
