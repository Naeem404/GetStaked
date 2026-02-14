"use client";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

interface HabitDay {
  date: Date;
  count: number; // 0 = missed, 1+ = proofs verified
  isToday?: boolean;
}

interface HabitGridProps {
  days: HabitDay[];
  variant?: "compact" | "full";
  className?: string;
}

export function HabitGrid({ days, variant = "compact", className }: HabitGridProps) {
  const [hoveredDay, setHoveredDay] = useState<HabitDay | null>(null);

  // Get color based on proof count
  const getDayColor = (day: HabitDay) => {
    if (day.isToday && day.count === 0) {
      return "bg-transparent border-2 border-white animate-pulse";
    }
    if (day.count === 0) {
      return "bg-transparent border border-dashed border-danger/30";
    }
    if (day.count === 1) {
      return "bg-brand-fire/30";
    }
    if (day.count === 2) {
      return "bg-brand-fire/60";
    }
    return "bg-brand-fire"; // 3+ proofs
  };

  // Format date for tooltip
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined
    });
  };

  // Get day label for tooltip
  const getDayLabel = (day: HabitDay) => {
    if (day.isToday && day.count === 0) {
      return "Today - Proof pending";
    }
    if (day.count === 0) {
      return `${formatDate(day.date)} - Missed`;
    }
    return `${formatDate(day.date)} - ${day.count} proof${day.count > 1 ? 's' : ''} verified`;
  };

  // Group days by week
  const weeks: HabitDay[][] = [];
  let currentWeek: HabitDay[] = [];
  
  days.forEach((day, index) => {
    const dayOfWeek = day.date.getDay();
    const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0, Sunday = 6
    
    if (index === 0) {
      // Fill empty days at start of first week
      for (let i = 0; i < adjustedDayOfWeek; i++) {
        currentWeek.push({
          date: new Date(day.date.getTime() - (adjustedDayOfWeek - i) * 24 * 60 * 60 * 1000),
          count: -1, // Empty day
        });
      }
    }
    
    currentWeek.push(day);
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  // Add remaining days in last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({
        date: new Date(currentWeek[currentWeek.length - 1].date.getTime() + 24 * 60 * 60 * 1000),
        count: -1, // Empty day
      });
    }
    weeks.push(currentWeek);
  }

  const squareSize = variant === "compact" ? 14 : 16;
  const gap = variant === "compact" ? 3 : 4;

  if (variant === "compact") {
    // Compact version - no labels, just the grid
    return (
      <div className={cn("flex justify-center", className)}>
        <div className="grid grid-rows-7 gap-[3px]" style={{ gridTemplateColumns: `repeat(${weeks.length}, ${squareSize}px)` }}>
          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              const key = `${weekIndex}-${dayIndex}`;
              const isEmpty = day.count === -1;
              
              return (
                <TooltipProvider key={key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "rounded-sm transition-all duration-200",
                          squareSize === 14 ? "w-[14px] h-[14px]" : "w-4 h-4",
                          isEmpty ? "bg-hover" : getDayColor(day),
                          !isEmpty && "hover:scale-110 cursor-pointer"
                        )}
                        onMouseEnter={() => !isEmpty && setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                      />
                    </TooltipTrigger>
                    {!isEmpty && (
                      <TooltipContent side="top" className="text-xs">
                        {getDayLabel(day)}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Full version with day and month labels
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const monthLabels = Array.from(new Set(
    weeks.map(week => week[0].date.toLocaleDateString("en-US", { month: "short" }))
  ));

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Month labels */}
      <div className="flex gap-4" style={{ paddingLeft: "24px" }}>
        {monthLabels.map((month, index) => (
          <div
            key={month}
            className="text-xs text-muted w-16 text-center"
            style={{ marginLeft: index === 0 ? "0" : "8px" }}
          >
            {month}
          </div>
        ))}
      </div>

      {/* Grid with day labels */}
      <div className="flex gap-2">
        {/* Day labels */}
        <div className="flex flex-col gap-[4px]">
          {dayLabels.map((day) => (
            <div key={day} className="text-xs text-muted w-6 text-right">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-rows-7 gap-[4px]" style={{ gridTemplateColumns: `repeat(${weeks.length}, ${squareSize}px)` }}>
          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              const key = `${weekIndex}-${dayIndex}`;
              const isEmpty = day.count === -1;
              
              return (
                <TooltipProvider key={key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "rounded-sm transition-all duration-200",
                          "w-4 h-4",
                          isEmpty ? "bg-hover" : getDayColor(day),
                          !isEmpty && "hover:scale-110 cursor-pointer"
                        )}
                        style={{
                          animation: !isEmpty && day.isToday && day.count === 0 ? "pulse 2s infinite" : undefined,
                        }}
                        onMouseEnter={() => !isEmpty && setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                      />
                    </TooltipTrigger>
                    {!isEmpty && (
                      <TooltipContent side="top" className="text-xs">
                        {getDayLabel(day)}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-hover rounded-sm border border-dashed border-danger/30" />
          <div className="w-3 h-3 bg-brand-fire/30 rounded-sm" />
          <div className="w-3 h-3 bg-brand-fire/60 rounded-sm" />
          <div className="w-3 h-3 bg-brand-fire rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
