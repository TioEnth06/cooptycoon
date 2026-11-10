'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { CAREER_LEVELS, CHALLENGE_SCENARIOS } from '@/game/levels';
import { BADGE_DEFS } from '@/game/quests';

export function ModeSelect() {
  const nickname = useGameStore((s) => s.nickname);
  const authMethod = useGameStore((s) => s.authMethod);
  const levelStars = useGameStore((s) => s.levelStars);
  const unlockedBadges = useGameStore((s) => s.unlockedBadges);
  const selectMode = useGameStore((s) => s.selectMode);
  const setActiveSheet = useGameStore((s) => s.setActiveSheet);
  const setShowProofDrawer = useGameStore((s) => s.setShowProofDrawer);
  const proofsCount = useGameStore((s) => s.proofs.length);

  const totalStarsEarned = Object.values(levelStars).reduce(
    (sum, s) => sum + s,
    0
  );
  const maxCareerStars = CAREER_LEVELS.length * 3;

  return (
    <main className="min-h-screen max-w-[480px] mx-auto flex flex-col justify-between p-5 bg-coop-bg">
      {/* Top Bar Summary */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 bg-coop-card px-3.5 py-2 rounded-2xl border border-amber-200 shadow-sm">
          <span className="text-xl">🧑‍🌾</span>
          <div>
            <div className="text-[11px] font-bold uppercase text-coop-muted leading-none">
              {authMethod === 'near-wallet' ? 'NEAR Account' : 'Farmer'}
            </div>
            <div className="font-heading text-sm font-bold text-coop-text truncate max-w-[140px]">
              {nickname || 'Sunny'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSheet('badges')}
            className="min-h-[44px] px-3 py-1.5 rounded-2xl bg-coop-card hover:bg-amber-50 active:scale-95 border border-amber-200 shadow-sm flex items-center gap-1.5 text-xs font-extrabold text-coop-text transition"
          >
            <span>🏅</span>
            <span>
              {unlockedBadges.length}/{BADGE_DEFS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowProofDrawer(true)}
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl bg-coop-card hover:bg-amber-50 active:scale-95 border border-amber-200 shadow-sm transition"
            aria-label="Open Proof Drawer"
          >
            <span className="text-lg">🧾</span>
            {proofsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-coop-blue text-coop-text text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {proofsCount > 9 ? '9+' : proofsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Hero Logo & Title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="my-4 text-center space-y-2"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-coop-card border-4 border-coop-yellow shadow-md text-5xl">
          🐔
        </div>
        <h1 className="font-heading text-3xl font-bold text-coop-text">
          Coop Tycoon
        </h1>
        <p className="text-sm font-bold text-coop-muted max-w-[320px] mx-auto">
          Choose a mode to practice saving, investing, and managing risk!
        </p>
      </motion.div>

      {/* 3 Big Mode Buttons (Career, Challenge, Sandbox) */}
      <div className="space-y-3">
        {/* 1. Career Mode */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => selectMode('career')}
          className="w-full text-left bg-coop-card hover:bg-amber-50/70 p-4 rounded-3xl border-4 border-coop-yellow shadow-md flex items-center justify-between gap-3 transition"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-coop-yellow/30 flex items-center justify-center text-3xl shrink-0">
              🌟
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xl font-bold text-coop-text">
                  Career Mode
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-coop-yellow text-coop-text text-xs font-extrabold">
                  ⭐ {totalStarsEarned}/{maxCareerStars}
                </span>
              </div>
              <p className="text-xs font-bold text-coop-muted mt-0.5">
                5 levels with goals, stars &amp; step-by-step money lessons
              </p>
            </div>
          </div>
          <span className="font-heading text-xl font-bold text-coop-text">
            →
          </span>
        </motion.button>

        {/* 2. Challenge Mode */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => selectMode('challenge')}
          className="w-full text-left bg-coop-card hover:bg-amber-50/70 p-4 rounded-3xl border-2 border-amber-300 shadow-sm flex items-center justify-between gap-3 transition"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-coop-red/15 flex items-center justify-center text-3xl shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xl font-bold text-coop-text">
                  Challenge Scenarios
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-coop-text text-xs font-extrabold">
                  {CHALLENGE_SCENARIOS.length} Crises
                </span>
              </div>
              <p className="text-xs font-bold text-coop-muted mt-0.5">
                Feed Crisis, Sick Coop &amp; Egg Glut — fast tests of skill!
              </p>
            </div>
          </div>
          <span className="font-heading text-xl font-bold text-coop-text">
            →
          </span>
        </motion.button>

        {/* 3. Sandbox Mode */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => selectMode('sandbox')}
          className="w-full text-left bg-coop-card hover:bg-amber-50/70 p-4 rounded-3xl border-2 border-coop-green shadow-sm flex items-center justify-between gap-3 transition"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-coop-green/20 flex items-center justify-center text-3xl shrink-0">
              🏡
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-coop-text">
                Sandbox Free Play
              </h2>
              <p className="text-xs font-bold text-coop-muted mt-0.5">
                Relaxed practice with no day limit and no game over
              </p>
            </div>
          </div>
          <span className="font-heading text-xl font-bold text-coop-text">
            →
          </span>
        </motion.button>
      </div>

      <footer className="pt-4 text-center text-xs font-bold text-coop-muted">
        Virtual coins for learning. No real money.
      </footer>
    </main>
  );
}
