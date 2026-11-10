'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { CAREER_LEVELS, CHALLENGE_SCENARIOS } from '@/game/levels';
import { BADGE_DEFS } from '@/game/quests';
import {
  BadgeRibbonIcon,
  BarnIcon,
  BoltIcon,
  ReceiptIcon,
  StarIcon,
} from './icons/GameIcons';

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
    <main className="min-h-screen max-w-[480px] mx-auto flex flex-col justify-between p-5">
      {/* Top Bar Summary */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 bg-coop-card px-3.5 py-2 rounded-2xl border-2 border-[#3B2F2F] shadow-[0_3px_0_0_#3B2F2F]">
          <div className="w-8 h-8 rounded-xl bg-coop-yellow/35 border-2 border-[#3B2F2F] flex items-center justify-center">
            <BarnIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-coop-muted leading-none">
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
            className="btn-game-secondary min-h-[44px] px-3 py-1.5 flex items-center gap-1.5 text-xs"
          >
            <BadgeRibbonIcon className="w-5 h-5" />
            <span>
              {unlockedBadges.length}/{BADGE_DEFS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowProofDrawer(true)}
            className="btn-game-secondary relative min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Open Proof Drawer"
          >
            <ReceiptIcon className="w-5 h-5" />
            {proofsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-coop-blue text-coop-text text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#3B2F2F]">
                {proofsCount > 9 ? '9+' : proofsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Hero Barn & Hen Emblem */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="my-5 text-center space-y-2"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-coop-card border-2 border-[#3B2F2F] shadow-[0_5px_0_0_#3B2F2F] mx-auto">
          <svg viewBox="0 0 64 64" className="w-16 h-16" aria-hidden="true">
            <ellipse cx="32" cy="52" rx="22" ry="6" fill="#E6C27A" />
            <path
              d="M18 38 C18 24, 46 24, 46 38 C46 48, 38 52, 32 52 C24 52, 18 48, 18 38 Z"
              fill="#FFFFFF"
              stroke="#3B2F2F"
              strokeWidth="2.8"
            />
            <path
              d="M27 24 C27 19, 31 19, 32 23 C33 18, 38 19, 37 24"
              fill="#E5604D"
              stroke="#3B2F2F"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M25 36 C21 39, 23 45, 29 44"
              fill="none"
              stroke="#3B2F2F"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <circle cx="38" cy="33" r="2.4" fill="#3B2F2F" />
            <polygon
              points="45,33 52,36 45,39"
              fill="#FFC83D"
              stroke="#3B2F2F"
              strokeWidth="2"
            />
          </svg>
        </div>
        <h1 className="font-heading text-3xl font-bold text-coop-text tracking-tight">
          Coop Tycoon
        </h1>
        <p className="text-sm font-bold text-coop-muted max-w-[320px] mx-auto">
          Select a game mode to practice saving, investing, and managing risk.
        </p>
      </motion.div>

      {/* 3 Tactile Mode Cards */}
      <div className="space-y-3.5">
        {/* 1. Career Mode */}
        <button
          type="button"
          onClick={() => selectMode('career')}
          className="game-card w-full text-left p-4 hover:bg-amber-50/60 active:translate-y-[2px] active:shadow-[0_2px_0_0_#3B2F2F] flex items-center justify-between gap-3 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-coop-yellow border-2 border-[#3B2F2F] flex items-center justify-center shrink-0">
              <StarIcon className="w-8 h-8" filled />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xl font-bold text-coop-text">
                  Career Mode
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-coop-yellow/35 border border-[#3B2F2F] text-coop-text text-xs font-extrabold">
                  <StarIcon className="w-3.5 h-3.5" filled />
                  <span>
                    {totalStarsEarned}/{maxCareerStars}
                  </span>
                </span>
              </div>
              <p className="text-xs font-bold text-coop-muted mt-0.5">
                5 levels with goals, star ratings, and step-by-step lessons
              </p>
            </div>
          </div>
          <span className="w-8 h-8 rounded-xl bg-coop-bg border-2 border-[#3B2F2F] flex items-center justify-center font-heading text-sm font-bold">
            →
          </span>
        </button>

        {/* 2. Challenge Mode */}
        <button
          type="button"
          onClick={() => selectMode('challenge')}
          className="game-card w-full text-left p-4 hover:bg-amber-50/60 active:translate-y-[2px] active:shadow-[0_2px_0_0_#3B2F2F] flex items-center justify-between gap-3 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-coop-red/20 border-2 border-[#3B2F2F] flex items-center justify-center shrink-0">
              <BoltIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-xl font-bold text-coop-text">
                  Challenge Scenarios
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-coop-red/15 border border-[#3B2F2F] text-coop-text text-xs font-extrabold">
                  {CHALLENGE_SCENARIOS.length} Crises
                </span>
              </div>
              <p className="text-xs font-bold text-coop-muted mt-0.5">
                Feed Crisis, Sick Coop, and Egg Glut scenarios
              </p>
            </div>
          </div>
          <span className="w-8 h-8 rounded-xl bg-coop-bg border-2 border-[#3B2F2F] flex items-center justify-center font-heading text-sm font-bold">
            →
          </span>
        </button>

        {/* 3. Sandbox Mode */}
        <button
          type="button"
          onClick={() => selectMode('sandbox')}
          className="game-card w-full text-left p-4 hover:bg-amber-50/60 active:translate-y-[2px] active:shadow-[0_2px_0_0_#3B2F2F] flex items-center justify-between gap-3 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-coop-green/25 border-2 border-[#3B2F2F] flex items-center justify-center shrink-0">
              <BarnIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-coop-text">
                Sandbox Free Play
              </h2>
              <p className="text-xs font-bold text-coop-muted mt-0.5">
                Open-ended practice with no day limit and no game over
              </p>
            </div>
          </div>
          <span className="w-8 h-8 rounded-xl bg-coop-bg border-2 border-[#3B2F2F] flex items-center justify-center font-heading text-sm font-bold">
            →
          </span>
        </button>
      </div>

      <footer className="pt-4 text-center text-xs font-bold text-coop-muted">
        Virtual coins for learning. No real money.
      </footer>
    </main>
  );
}
