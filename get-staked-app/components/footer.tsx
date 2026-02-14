import { Flame } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Flame className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-foreground">GET STAKED</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Stake money on your habits. Win money from quitters. Built on Solana.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Product</h4>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li><a href="#" className="transition-colors hover:text-foreground">Browse Pools</a></li>
              <li><a href="#" className="transition-colors hover:text-foreground">Create Pool</a></li>
              <li><a href="#" className="transition-colors hover:text-foreground">Leaderboard</a></li>
              <li><a href="#" className="transition-colors hover:text-foreground">Analytics</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Resources</h4>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li><a href="#" className="transition-colors hover:text-foreground">Documentation</a></li>
              <li><a href="#" className="transition-colors hover:text-foreground">Smart Contract</a></li>
              <li><a href="#" className="transition-colors hover:text-foreground">API Reference</a></li>
              <li><a href="#" className="transition-colors hover:text-foreground">GitHub</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Community</h4>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li><a href="#" className="transition-colors hover:text-foreground">Discord</a></li>
              <li><a href="#" className="transition-colors hover:text-foreground">Twitter</a></li>
              <li><a href="#" className="transition-colors hover:text-foreground">Blog</a></li>
              <li><a href="#" className="transition-colors hover:text-foreground">Careers</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <span className="text-sm text-muted-foreground">
            Built for the grind. Powered by Solana.
          </span>
          <span className="text-sm text-muted-foreground">
            GET STAKED {new Date().getFullYear()}. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}
