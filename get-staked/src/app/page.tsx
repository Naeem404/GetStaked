"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Camera, Trophy } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-700 mb-4 gradient-text-fire">
            GET STAKED
          </h1>
          <p className="text-xl text-secondary mb-8">
            Stake SOL on your habits. Win or lose. No excuses.
          </p>
          <p className="text-sm text-muted mb-8">
            Join competitive pools, submit photo proof, and let AI verify. Winners split the pot.
          </p>
          <Button size="lg" className="w-full bg-linear-to-r from-brand-fire to-brand-gold text-lg py-6" asChild>
            <Link href="/dashboard">
              Connect Wallet
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-700 text-center mb-12 text-primary">
            How It Works
          </h2>
          
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-linear-to-br from-brand-fire to-brand-gold rounded-2xl flex items-center justify-center mb-4">
                <ShieldCheck size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-600 text-primary mb-2">STAKE</h3>
              <p className="text-sm text-secondary">
                Join a pool & stake SOL on your habit
              </p>
            </div>

            {/* Connection line */}
            <div className="flex justify-center">
              <div className="w-px h-8 bg-border" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-linear-to-br from-brand-fire to-brand-gold rounded-2xl flex items-center justify-center mb-4">
                <Camera size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-600 text-primary mb-2">PROVE</h3>
              <p className="text-sm text-secondary">
                Submit daily photo proof. AI verifies.
              </p>
            </div>

            {/* Connection line */}
            <div className="flex justify-center">
              <div className="w-px h-8 bg-border" />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-linear-to-br from-brand-fire to-brand-gold rounded-2xl flex items-center justify-center mb-4">
                <Trophy size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-600 text-primary mb-2">WIN</h3>
              <p className="text-sm text-secondary">
                Complete the challenge, win the pot
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 border-t border-white/6">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-700 mb-4 text-primary">
            Ready to put your money where your habits are?
          </h2>
          <Button size="lg" className="w-full bg-linear-to-r from-brand-fire to-brand-gold text-lg py-6" asChild>
            <Link href="/dashboard">
              Connect Wallet
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 text-center">
        <p className="text-xs text-muted">
          Built on Solana • AI-verified • Trustless escrow
        </p>
      </footer>
    </div>
  );
}
