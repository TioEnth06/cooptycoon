'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { REPUTATION_PERK_THRESHOLD } from '@/game/constants';

export function TopBar() {
  const balance = useGameStore((s) => s.game.balance);
  const day = useGameStore((s) => s.game.day);
  const reputation = useGameStore((s) => s.game.reputation);
  const lastBalanceDelta = useGameStore((s) => s.lastBalanceDelta);
  const proofsCount = useGameStore((s) => s.proofs.length);
  const setShowProofDrawer = useGameStore((s) => s.setShowProofDrawer);
  const fastForwardDays = useGameStore((s) => s.fastForwardDays);

  const [displayBalance, setDisplayBalance] = useState(balance);
  const [flashTone, setFlashTone] = useState<'gain' | 'loss' | null>(null);

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
  const hasGoldFeedBag = reputation >= REPUTATION_PERK_THRESHOLD;

  useEffect(() => {
    if (balance === displayBalance) return;
    const diff = balance - displayBalance;
    setFlashTone(diff > 0 ? 'gain' : 'loss');

    const steps = 12;
    const stepTime = 400 / steps;
    let currentStep = 0;
    const startVal = displayBalance;

    const timer = setInterval(() => {
      currentStep += 1;
      if (currentStep >= steps) {
        setDisplayBalance(balance);
        clearInterval(timer);
      } else {
        const nextVal =
          Math.round((startVal + (diff * currentStep) / steps) * 10) / 10;
        setDisplayBalance(nextVal);
      }
    }, stepTime);

    const flashTimer = setTimeout(() => setFlashTone(null), 550);
    return () => {
      clearInterval(timer);
      clearTimeout(flashTimer);
    };
  }, [balance]);

  return (
    <header className="sticky top-0 z-20 bg-coop-bg/95 backdrop-blur-sm pt-3 pb-2 px-4 border-b border-amber-200/70">
      <div className="flex items-center justify-between gap-2">
        {/* Coin Balance (Left) */}
        <motion.div
          animate={
            flashTone === 'gain'
              ? { scale: [1, 1.08, 1], backgroundColor: ['#FFFFFF', '#E2F7DC', '#FFFFFF'] }
              : flashTone === 'loss'
              ? { scale: [1, 0.96, 1], backgroundColor: ['#FFFFFF', '#FDE4E1', '#FFFFFF'] }
              : {}
          }
          transition={{ duration: 0.45 }}
          className="relative flex items-center gap-2 bg-coop-card px-3.5 py-2 rounded-2xl shadow-sm border-2 border-coop-yellow"
        >
          <span className="text-2xl leading-none" role="img" aria-label="Coins">
            🪙
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-coop-muted leading-none">
              Coins
            </div>
            <div className="font-heading text-xl font-bold text-coop-text leading-tight">
              {Number.isInteger(displayBalance)
                ? displayBalance
                : displayBalance.toFixed(1)}
            </div>
          </div>

          <AnimatePresence>
            {lastBalanceDelta !== null && lastBalanceDelta !== 0 && flashTone && (
              <motion.span
                key={`${day}-${balance}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: -12 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className={`absolute -top-2 right-1 text-xs font-extrabold px-1.5 py-0.5 rounded-full shadow-sm ${
                  lastBalanceDelta > 0
                    ? 'bg-coop-green text-white'
                    : 'bg-coop-red text-white'
                }`}
              >
                {lastBalanceDelta > 0 ? `+${lastBalanceDelta}` : lastBalanceDelta}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Center Badges: Reputation / Demo Fast-Forward */}
        <div className="flex items-center gap-1.5">
          <div
            title={
              hasGoldFeedBag
                ? 'Gold Feed Bag unlocked: Feed costs 10% less!'
                : `Reputation ${reputation}/5 — care for hens & save coins to unlock Gold Feed Bag (-10% feed cost)`
            }
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
              hasGoldFeedBag
                ? 'bg-coop-yellow/30 border-coop-yellow text-coop-text'
                : 'bg-coop-card border-amber-200 text-coop-muted'
            }`}
          >
            <span role="img" aria-label="Star">
              {hasGoldFeedBag ? '🌟' : '⭐'}
            </span>
            <span>{reputation}</span>
            {hasGoldFeedBag && (
              <span className="hidden sm:inline text-[11px] font-extrabold text-amber-900">
                -10% Feed
              </span>
            )}
          </div>

          {isDemoMode && (
            <button
              type="button"
              onClick={() => fastForwardDays(3)}
              title="Demo Mode: Fast-forward 3 days"
              className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 active:scale-95 text-coop-text text-xs font-extrabold border border-amber-300 transition"
            >
              ⏩ +3d
            </button>
          )}
        </div>

        {/* Day Counter & Small Proof Icon (Right) */}
        <div className="flex items-center gap-2">
          <div className="bg-coop-card px-3.5 py-2 rounded-2xl shadow-sm border border-amber-200 text-right">
            <div className="text-xs font-bold uppercase tracking-wider text-coop-muted leading-none">
              Day
            </div>
            <div className="font-heading text-xl font-bold text-coop-text leading-tight">
              {day}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowProofDrawer(true)}
            aria-label="Open Proof Drawer"
            title="Verified receipts & proofs"
            className="relative min-w-[48px] min-h-[48px] flex items-center justify-center rounded-2xl bg-coop-card hover:bg-amber-50 active:scale-95 border border-amber-200 shadow-sm transition"
          >
            <span className="text-xl" role="img" aria-label="Receipt">
              🧾
            </span>
            {proofsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-coop-blue text-coop-text text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border border-white">
                {proofsCount > 9 ? '9+' : proofsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
