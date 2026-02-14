"use client";

import { useState } from "react";
import { Mic, MessageCircle, Settings, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Persona = "drill-sergeant" | "hype-beast" | "gentle-guide";

interface PersonaConfig {
  id: Persona;
  name: string;
  color: string;
  gradient: string;
  icon: string;
  description: string;
}

const personas: PersonaConfig[] = [
  {
    id: "drill-sergeant",
    name: "Drill Sergeant",
    color: "text-red-400",
    gradient: "from-red-500 to-orange-500",
    icon: "⭐",
    description: "No excuses. No mercy.",
  },
  {
    id: "hype-beast",
    name: "Hype Beast",
    color: "text-yellow-400",
    gradient: "from-yellow-500 to-orange-500",
    icon: "⚡",
    description: "LET'S GOOO!",
  },
  {
    id: "gentle-guide",
    name: "Gentle Guide",
    color: "text-teal-400",
    gradient: "from-teal-500 to-cyan-500",
    icon: "🌿",
    description: "Steady progress. You got this.",
  },
];

export function CoachBubble() {
  const [persona, setPersona] = useState<Persona>("drill-sergeant");
  const [hasMessage, setHasMessage] = useState(true); // Simulate having a message
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentPersona = personas.find(p => p.id === persona)!;

  const messages = {
    "drill-sergeant": [
      "Day 5! Two people already dropped.",
      "Hey. Proof is due. Don't let 0.5 SOL walk.",
      "One down. Pot just got bigger.",
    ],
    "hype-beast": [
      "FIRE STREAK! Keep it going! 🔥",
      "LET'S GOOO! Submit that proof!",
      "Someone just failed! MORE PRIZE POOL!",
    ],
    "gentle-guide": [
      "You're doing great. Day 5 completed.",
      "Gentle reminder: proof is due today.",
      "One participant has stepped back. Your consistency matters.",
    ],
  };

  const currentMessage = messages[persona][0]; // Get first message for demo

  return (
    <>
      {/* Floating Bubble */}
      <div className="fixed bottom-20 right-4 z-40">
        <div
          className={cn(
            "relative w-12 h-12 rounded-full flex items-center justify-center",
            "bg-linear-to-br",
            currentPersona.gradient,
            "border-2 border-white/20",
            "animate-bubble-breathe",
            "cursor-pointer transition-all duration-200 hover:scale-110"
          )}
          onClick={() => setHasMessage(false)}
        >
          {/* Sound waves when speaking */}
          {isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping" />
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" style={{ animationDelay: "0.2s" }} />
              <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" style={{ animationDelay: "0.4s" }} />
            </>
          )}

          {/* Pulsing glow when has message */}
          {hasMessage && (
            <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
          )}

          {/* Message indicator dot */}
          {hasMessage && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-background" />
          )}

          <Mic size={20} className="text-white" />
        </div>
      </div>

      {/* Interaction Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <div className="fixed bottom-20 right-4 w-12 h-12 z-30" />
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl bg-surface border-t border-white/6">
          <div className="h-full flex flex-col">
            {/* Header */}
            <SheetHeader className="text-left pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
                    "bg-linear-to-br",
                    currentPersona.gradient
                  )}>
                    {currentPersona.icon}
                  </div>
                  <div>
                    <SheetTitle className="text-lg text-primary">{currentPersona.name}</SheetTitle>
                    <Button variant="ghost" size="sm" className="text-xs text-muted p-0 h-auto">
                      Change
                    </Button>
                  </div>
                </div>
              </div>
            </SheetHeader>

            {/* Message */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-elevated rounded-2xl p-4">
                <p className="text-primary text-base">{currentMessage}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" variant="ghost" className="text-muted p-2 h-auto">
                    <Play size={16} />
                  </Button>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-1 bg-muted rounded-full"
                        style={{ 
                          height: `${Math.random() * 20 + 10}px`,
                          opacity: isSpeaking ? 1 : 0.3
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2 bg-elevated border-white/6">
                  <MessageCircle size={16} />
                  Motivate Me
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 bg-elevated border-white/6">
                  <MessageCircle size={16} />
                  How Am I Doing?
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 bg-elevated border-white/6 text-danger">
                  <MessageCircle size={16} />
                  SOS - Need Help
                </Button>
              </div>

              {/* Settings */}
              <div className="mt-auto pt-4 border-t border-white/6">
                <Button variant="ghost" size="sm" className="text-muted gap-2 p-0 h-auto">
                  <Settings size={16} />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Persona Picker (simplified for demo) */}
      <style jsx>{`
        @keyframes bubble-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .animate-bubble-breathe {
          animation: bubble-breathe 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
