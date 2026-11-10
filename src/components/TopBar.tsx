'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { REPUTATION_PERK_THRESHOLD } from '@/game/constants';
import { getLevelDef } from '@/game/levels';

export function TopBar() {
  const balance = useGameStore((s) => s.game.balance);
  const day = useGameStore((s) => s.game.day);
  const reputation = useGameStore((s) => s.game.reputation);
  const mode = useGameStore((s) => s.mode);
  const currentLevelId = useGameStore((s) => s.currentLevelId);
  const lastBalanceDelta = useGameStore((s) => s.lastBalanceDelta);
  const proofsCount = useGameStore((s) => s.proofs.length);
  const sfxEnabled = useGameStore((s) => s.sfxEnabled);
  const toggleSfx = useGameStore((s) => s.toggleSfx);
  const setScreen = useGameStore((s) => s.setScreen);
  const setActiveSheet = useGameStore((s) => s.setActiveSheet);
  const setShowProofDrawer = useGameStore((s) => s.setShowProofDrawer);
  const fastForwardDays = useGameStore((s) => s.fastForwardDays);

  const [displayBalance, setDisplayBalance] = useState(balance);
  const [flashTone, setFlashTone] = useState<'gain' | 'loss' | null>(null);

  const levelDef = getLevelDef(mode, currentLevelId);
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
  const hasGoldFeedBag = reputation >= REPUTATION_PERK_THRESHOLD;

  useEffect(() => {
    if (balance === displayBalance) return;
    const diff = balance - displayBalance;
    setFlashTone(diff > 0 ? 'gain' : 'loss');

    const steps = 12;
    const stepTime = 420 / steps;
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
    <header className="sticky top-0 z-20 bg-coop-bg/95 backdrop-blur-sm pt-2.5 pb-2 px-3.5 border-b border-amber-200/70">
      <div className="flex items-center justify-between gap-1.5">
        {/* Back to Modes + Coin Balance (Left) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setScreen('home')}
            title="Back to Modes"
            className="min-w-[40px] min-h-[44px] px-2 rounded-2xl bg-coop-card hover:bg-amber-50 active:scale-95 border border-amber-200 text-xs font-extrabold text-coop-text shadow-sm transition"
          >
            🏠
          </button>

          <motion.div
            id="coin-balance-box"
            animate={
              flashTone === 'gain'
                ? { scale: [1, 1.08, 1] }
                : flashTone === 'loss'
                ? { scale: [1, 0.96, 1] }
                : {}
            }
            transition={{ duration: 0.45 }}
            className={`relative flex items-center gap-1.5 bg-coop-card px-3 py-1.5 rounded-2xl shadow-sm border-2 transition-colors ${
              flashTone === 'gain'
                ? 'border-coop-green bg-coop-green/15'
                : flashTone === 'loss'
                ? 'border-coop-red bg-coop-red/10'
                : 'border-coop-yellow'
            }`}
          >
            <span className="text-xl leading-none" role="img" aria-label="Coins">
              🪙
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-coop-muted leading-none">
                Coins
              </div>
              <div className="font-heading text-lg font-bold text-coop-text leading-tight">
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
                  animate={{ opacity: 1, y: -14 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`absolute -top-2 right-1 text-[11px] font-extrabold px-1.5 py-0.5 rounded-full shadow-sm ${
                    lastBalanceDelta > 0
                      ? 'bg-coop-green text-white'
                      : 'bg-coop-red text-white'
                  }`}
                >
                  {lastBalanceDelta > 0
                    ? `+${lastBalanceDelta}`
                    : lastBalanceDelta}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Center Badges: Reputation, Badges, SFX & Demo Fast-Forward */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveSheet('badges')}
            title={
              hasGoldFeedBag
                ? 'Gold Feed Bag unlocked: Feed costs 10% less! Tap for Badges.'
                : `Reputation ${reputation}/5 — Tap to view Badges`
            }
            className={`min-h-[40px] flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold border active:scale-95 transition ${
              hasGoldFeedBag
                ? 'bg-coop-yellow/35 border-coop-yellow text-coop-text'
                : 'bg-coop-card border-amber-200 text-coop-text'
            }`}
          >
            <span>{hasGoldFeedBag ? '🌟' : '⭐'}</span>
            <span>{reputation}</span>
          </button>

          <button
            type="button"
            onClick={toggleSfx}
            aria-label={sfxEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            title={sfxEnabled ? 'SFX On (Tap to mute)' : 'SFX Muted (Tap to enable)'}
            className="min-w-[38px] min-h-[40px] flex items-center justify-center rounded-xl bg-coop-card hover:bg-amber-50 active:scale-95 border border-amber-200 text-xs transition"
          >
            {sfxEnabled ? '🔊' : '🔇'}
          </button>

          {isDemoMode && (
            <button
              type="button"
              onClick={() => fastForwardDays(3)}
              title="Demo Mode: Fast-forward 3 days"
              className="min-h-[40px] px-2 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 active:scale-95 text-coop-text text-[11px] font-extrabold border border-amber-300 transition"
            >
              ⏩+3d
            </button>
          )}
        </div>

        {/* Day Counter ("Day 4/12") & Small Proof Icon (Right) */}
        <div className="flex items-center gap-1.5">
          <div className="bg-coop-card px-2.5 py-1.5 rounded-2xl shadow-sm border border-amber-200 text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-coop-muted leading-none">
              Day
            </div>
            <div className="font-heading text-base font-bold text-coop-text leading-tight">
              {levelDef ? `${day}/${levelDef.dayLimit}` : day}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowProofDrawer(true)}
            aria-label="Open Proof Drawer"
            title="Verified receipts & proofs"
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl bg-coop-card hover:bg-amber-50 active:scale-95 border border-amber-200 shadow-sm transition"
          >
            <span className="text-lg" role="img" aria-label="Receipt">
              🧾
            </span>
            {proofsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-coop-blue text-coop-text text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {proofsCount > 9 ? '9+' : proofsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
