"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface StreakCounterProps {
  days: number;
  size?: "sm" | "xl";
  className?: string;
}

export function StreakCounter({ days, size = "sm", className }: StreakCounterProps) {
  const [displayDays, setDisplayDays] = useState(days);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (days !== displayDays) {
      setIsAnimating(true);
      
      // Start the roll animation
      const timer = setTimeout(() => {
        setDisplayDays(days);
        setIsAnimating(false);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [days, displayDays]);

  const getFlameColor = () => {
    if (days === 0) return "text-muted";
    if (days <= 3) return "text-brand-fire";
    if (days <= 7) return "text-brand-fire";
    if (days <= 14) return "text-brand-fire";
    return "text-brand-fire";
  };

  const getFlameAnimation = () => {
    if (days === 0) return "";
    if (days <= 3) return "animate-flicker";
    if (days <= 7) return "animate-flicker";
    if (days <= 14) return "animate-flicker";
    return "animate-flicker";
  };

  const getNumberClass = () => {
    if (size === "xl") {
      return "text-4xl font-800 font-mono";
    }
    return "text-lg font-600 font-mono";
  };

  const getFlameSize = () => {
    if (size === "xl") {
      return 64;
    }
    return 20;
  };

  if (size === "xl") {
    // Hero size - stacked vertically
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        <div className="relative">
          <Flame 
            size={getFlameSize()}
            className={cn(
              getFlameColor(),
              getFlameAnimation(),
              "transition-all duration-500"
            )}
            style={{
              filter: days >= 8 ? "drop-shadow(0 0 10px rgba(255,107,44,0.5))" : undefined,
            }}
          />
          {/* Ember particles for long streaks */}
          {days >= 8 && (
            <>
              <div className="absolute top-0 left-0 w-1 h-1 bg-brand-fire rounded-full animate-ember-rise" />
              <div className="absolute top-2 left-2 w-1 h-1 bg-brand-gold rounded-full animate-ember-rise" style={{ animationDelay: "0.3s" }} />
              <div className="absolute top-1 left-4 w-1 h-1 bg-brand-fire rounded-full animate-ember-rise" style={{ animationDelay: "0.6s" }} />
            </>
          )}
        </div>
        
        <div className="relative">
          <div className={cn(
            getNumberClass(),
            "text-primary transition-all duration-500",
            days >= 15 && "gradient-text-gold"
          )}>
            {displayDays === 0 ? "—" : displayDays}
          </div>
          
          {/* Number roll animation */}
          {isAnimating && (
            <div className={cn(
              getNumberClass(),
              "absolute top-0 left-0 text-primary opacity-0 animate-number-roll-up"
            )}>
              {displayDays === 0 ? "—" : displayDays - 1}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Inline size - horizontal
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Flame 
        size={getFlameSize()}
        className={cn(
          getFlameColor(),
          getFlameAnimation(),
          "transition-all duration-500"
        )}
      />
      <span className={cn(
        getNumberClass(),
        "text-primary transition-all duration-500"
      )}>
        {displayDays === 0 ? "—" : displayDays}
      </span>
    </div>
  );
}
