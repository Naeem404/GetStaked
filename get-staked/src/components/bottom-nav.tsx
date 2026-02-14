"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Camera, 
  BarChart3 
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/pools", icon: Users, label: "Pools" },
  { href: "/prove", icon: Camera, label: "Prove", isSpecial: true },
  { href: "/stats", icon: BarChart3, label: "Stats" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-elevated backdrop-blur-xl border-t border-white/6 z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.isSpecial) {
            // Center "Prove" button - elevated and special
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative -mt-6 flex flex-col items-center justify-center",
                  "w-14 h-14 rounded-full bg-linear-to-br from-brand-fire to-brand-gold shadow-lg shadow-brand-fire/30 transition-all duration-200 hover:scale-105 active:scale-95"
                )}
              >
                <item.icon 
                  size={28} 
                  className="text-white" 
                />
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-brand-fire rounded-full" />
                )}
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1",
                "px-3 py-2 rounded-lg transition-all duration-200",
                isActive
                  ? "text-brand-fire"
                  : "text-muted hover:text-secondary"
              )}
            >
              <item.icon 
                size={20} 
                className={cn(
                  "transition-transform duration-200",
                  isActive && "scale-115"
                )}
              />
              {isActive && (
                <span className="text-xs font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Safe area padding for iPhone */}
      <div className="h-[env(safe-area-inset-bottom)] bg-elevated" />
    </div>
  );
}
