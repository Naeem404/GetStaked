"use client"

import { useState } from "react"
import { Flame, Menu, X, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

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
          <a href="#pools" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Pools
          </a>
          <a href="#leaderboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Leaderboard
          </a>
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="outline" className="gap-2 border-border bg-secondary text-foreground hover:bg-secondary/80">
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Launch App
          </Button>
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
            <a href="#pools" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Pools</a>
            <a href="#leaderboard" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Leaderboard</a>
            <a href="#features" className="text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Features</a>
            <Button variant="outline" className="gap-2 border-border bg-secondary text-foreground">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
            <Button className="bg-primary text-primary-foreground">Launch App</Button>
          </div>
        </div>
      )}
    </nav>
  )
}
