"use client"

import { useState } from "react"
import Link from "next/link"
import { Flame, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, profile } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            GET STAKED
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </a>
          <Link href="/pools" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Pools
          </Link>
          <Link href="/leaderboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Leaderboard
          </Link>
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link href="/dashboard">
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 text-[10px] font-bold">
                  {(profile?.display_name || user.email)?.[0]?.toUpperCase() || "?"}
                </div>
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="outline" className="border-border bg-secondary text-foreground hover:bg-secondary/80">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Launch App
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a href="#how-it-works" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>How It Works</a>
            <Link href="/pools" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Pools</Link>
            <Link href="/leaderboard" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Leaderboard</Link>
            <a href="#features" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Features</a>
            {user ? (
              <Link href="/dashboard">
                <Button className="w-full bg-primary text-primary-foreground">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button className="w-full bg-primary text-primary-foreground">Launch App</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
