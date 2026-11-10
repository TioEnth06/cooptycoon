'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { TopBar } from '@/components/TopBar';
import { Coop } from '@/components/Coop';
import { MentorBubble } from '@/components/MentorBubble';
import { ActionBar } from '@/components/ActionBar';
import { SavingsJar } from '@/components/SavingsJar';
import { ClassGoal } from '@/components/ClassGoal';
import { ApprovalModal } from '@/components/ApprovalModal';
import { ProofDrawer } from '@/components/ProofDrawer';
import { Celebration } from '@/components/Celebration';
import { CLASS_GOAL_TARGET, STARTER_GRANT } from '@/game/constants';
import { getClassSavingsTotal } from '@/game/engine';

export default function HomePage() {
  const loggedIn = useGameStore((s) => s.loggedIn);
  const loginGuest = useGameStore((s) => s.loginGuest);
  const game = useGameStore((s) => s.game);
  const toast = useGameStore((s) => s.toast);
  const clearToast = useGameStore((s) => s.clearToast);
  const setActiveSheet = useGameStore((s) => s.setActiveSheet);

  const [hydrated, setHydrated] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('Sunny');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => clearToast(), 2600);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!hydrated) {
    return (
      <main className="min-h-screen max-w-[480px] mx-auto flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="text-4xl animate-bounce">🐣</div>
          <p className="font-heading text-lg font-bold text-coop-text">
            Warming up the coop...
          </p>
        </div>
      </main>
    );
  }

  // Guest Login Screen (zero wallet friction)
  if (!loggedIn) {
    const handleStart = async (e: React.FormEvent) => {
      e.preventDefault();
      setStarting(true);
      try {
        await loginGuest(nicknameInput);
      } finally {
        setStarting(false);
      }
    };

    return (
      <main className="min-h-screen max-w-[480px] mx-auto flex flex-col justify-center p-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-coop-card rounded-3xl p-6 shadow-md border-4 border-coop-yellow space-y-5 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-coop-yellow/25 border-2 border-coop-yellow text-5xl mx-auto">
            🐔
          </div>

          <div className="space-y-1.5">
            <h1 className="font-heading text-3xl font-bold text-coop-text">
              Coop Tycoon
            </h1>
            <p className="text-base font-bold text-coop-muted">
              Run a tiny egg business, care for your hens, and save together with your class!
            </p>
          </div>

          <div className="bg-coop-bg rounded-2xl p-3.5 border border-amber-200 text-left space-y-1.5 text-sm font-bold text-coop-text">
            <div className="flex items-center gap-2">
              <span>🪙</span>
              <span>Receive {STARTER_GRANT} starter coins</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🐣</span>
              <span>Get your first healthy hen (worth 30 coins) free</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🦉</span>
              <span>Learn saving, investing &amp; risk with Professor Hoot</span>
            </div>
          </div>

          <form onSubmit={handleStart} className="space-y-3 text-left">
            <div>
              <label
                htmlFor="nickname-input"
                className="block text-xs font-extrabold uppercase tracking-wider text-coop-muted mb-1"
              >
                Your Farmer Nickname
              </label>
              <input
                id="nickname-input"
                type="text"
                maxLength={20}
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                placeholder="Type your nickname..."
                className="w-full min-h-[50px] px-4 rounded-2xl bg-coop-bg border-2 border-amber-200 font-heading text-lg font-bold text-coop-text focus:outline-none focus:border-coop-yellow"
              />
            </div>

            <button
              type="submit"
              disabled={starting}
              className="w-full min-h-[56px] rounded-2xl bg-coop-yellow hover:brightness-105 active:scale-95 text-coop-text font-heading text-xl font-bold shadow-md border-2 border-amber-400 transition"
            >
              {starting ? 'Opening Your Coop...' : 'Start Farming! 🌾'}
            </button>
          </form>

          <p className="text-xs font-bold text-coop-muted">
            Virtual coins for learning. No real money.
          </p>
        </motion.div>
      </main>
    );
  }

  const classSavings = getClassSavingsTotal(game);
  const classPct = Math.min(
    100,
    Math.round((classSavings / CLASS_GOAL_TARGET) * 100)
  );

  return (
    <div className="min-h-screen max-w-[480px] mx-auto flex flex-col justify-between bg-coop-bg shadow-sm">
      {/* 1. TopBar */}
      <TopBar />

      {/* Gentle non-blocking toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 mt-2 px-3.5 py-2 rounded-2xl bg-coop-card border border-amber-300 text-xs font-bold text-coop-text shadow-sm text-center"
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-3 space-y-3.5 overflow-y-auto">
        {/* Compact Class Goal Progress Pill */}
        <button
          type="button"
          onClick={() => setActiveSheet('class_goal')}
          className="w-full bg-coop-card rounded-2xl px-3.5 py-2.5 border border-amber-200 shadow-sm flex items-center justify-between gap-3 text-left hover:bg-amber-50/50 transition"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl" role="img" aria-label="Class Goal">
              🏆
            </span>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-coop-text truncate">
                Season {game.season} Class Savings Goal
              </div>
              <div className="text-[11px] font-bold text-coop-muted">
                {Math.round(classSavings)} / {CLASS_GOAL_TARGET} coins saved (+50 bonus)
              </div>
            </div>
          </div>
          <div className="w-24 shrink-0">
            <div className="w-full h-2.5 bg-coop-bg rounded-full overflow-hidden border border-amber-200">
              <div
                style={{ width: `${classPct}%` }}
                className="h-full bg-coop-green rounded-full transition-all duration-300"
              />
            </div>
            <div className="text-[10px] font-extrabold text-right text-coop-green mt-0.5">
              {classPct}%
            </div>
          </div>
        </button>

        {/* 2. Coop Area (Center) */}
        <Coop />

        {/* 3. MentorBubble (Above ActionBar) */}
        <MentorBubble />
      </main>

      {/* 4. ActionBar (Bottom, Sticky) */}
      <ActionBar />

      {/* 5. Bottom Sheets & Modals */}
      <SavingsJar />
      <ClassGoal />
      <ApprovalModal />
      <ProofDrawer />
      <Celebration />
    </div>
  );
}
