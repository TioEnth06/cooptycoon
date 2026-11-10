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
import { ModeSelect } from '@/components/ModeSelect';
import { LevelSelect } from '@/components/LevelSelect';
import { LevelIntroModal } from '@/components/LevelIntroModal';
import { DaySummaryModal } from '@/components/DaySummaryModal';
import { LevelEndModal } from '@/components/LevelEndModal';
import { BadgesSheet } from '@/components/BadgesSheet';
import { DayCycleOverlay } from '@/components/Animations';
import { STARTER_GRANT } from '@/game/constants';
import { getGoalProgress, getLevelDef } from '@/game/levels';
import {
  consumeNearWalletCallback,
  createPasskeyCredential,
  normalizeNearAccountId,
} from '@/lib/nearAuth';
import { ease } from '@/animation/tokens';

export default function HomePage() {
  const loggedIn = useGameStore((s) => s.loggedIn);
  const screen = useGameStore((s) => s.screen);
  const mode = useGameStore((s) => s.mode);
  const currentLevelId = useGameStore((s) => s.currentLevelId);
  const loginGuest = useGameStore((s) => s.loginGuest);
  const loginWithSocial = useGameStore((s) => s.loginWithSocial);
  const game = useGameStore((s) => s.game);
  const toast = useGameStore((s) => s.toast);
  const clearToast = useGameStore((s) => s.clearToast);
  const setActiveSheet = useGameStore((s) => s.setActiveSheet);
  const daySequenceStep = useGameStore((s) => s.daySequenceStep);
  const lastFeedCostPaid = useGameStore((s) => s.lastFeedCostPaid);
  const lastProducedEggs = useGameStore((s) => s.lastProducedEggs);
  const skipDaySequence = useGameStore((s) => s.skipDaySequence);

  const [nicknameInput, setNicknameInput] = useState('Sunny');
  const [socialModal, setSocialModal] = useState<
    'near' | 'google' | 'email' | null
  >(null);
  const [modalInput, setModalInput] = useState('');
  const [starting, setStarting] = useState(false);

  // Detect optional URL callback (?account_id=...)
  useEffect(() => {
    const cb = consumeNearWalletCallback();
    if (cb) {
      void loginWithSocial({
        method: 'near-wallet',
        identifier: cb.nickname,
        accountId: cb.accountId,
      });
    }
  }, [loginWithSocial]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => clearToast(), 2600);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  // 1. Login Screen (In-App NEAR FastAuth / Social Login + Guest Fallback)
  if (!loggedIn) {
    const handleGuestStart = async (e: React.FormEvent) => {
      e.preventDefault();
      setStarting(true);
      try {
        await loginGuest(nicknameInput);
      } finally {
        setStarting(false);
      }
    };

    const handlePasskeyLogin = async () => {
      setStarting(true);
      try {
        const id = await createPasskeyCredential(nicknameInput || 'Sunny');
        await loginWithSocial({ method: 'passkey', identifier: id });
      } finally {
        setStarting(false);
      }
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setStarting(true);
      try {
        if (socialModal === 'near') {
          const { accountId, nickname } = normalizeNearAccountId(
            modalInput || nicknameInput || 'sunny.testnet'
          );
          await loginWithSocial({
            method: 'near-wallet',
            identifier: nickname,
            accountId,
          });
        } else if (socialModal === 'google') {
          const emailOrName = modalInput.trim() || 'sunny@gmail.com';
          const user = emailOrName.split('@')[0] || 'Sunny';
          await loginWithSocial({
            method: 'google',
            identifier: user,
          });
        } else if (socialModal === 'email') {
          const emailOrName = modalInput.trim() || 'student@school.edu';
          const user = emailOrName.split('@')[0] || 'Sunny';
          await loginWithSocial({
            method: 'email',
            identifier: user,
          });
        }
        setSocialModal(null);
      } finally {
        setStarting(false);
      }
    };

    return (
      <main className="min-h-screen max-w-[480px] mx-auto flex flex-col justify-center p-5 bg-coop-bg">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-coop-card rounded-3xl p-6 shadow-md border-4 border-coop-yellow space-y-4 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-coop-yellow/25 border-2 border-coop-yellow text-5xl mx-auto">
            🐔
          </div>

          <div className="space-y-1">
            <h1 className="font-heading text-3xl font-bold text-coop-text">
              Coop Tycoon
            </h1>
            <p className="text-sm font-bold text-coop-muted">
              Run a cozy egg business, care for your hens, and learn saving &amp; investing!
            </p>
          </div>

          <div className="bg-coop-bg rounded-2xl p-3 border border-amber-200 text-left space-y-1 text-xs font-bold text-coop-text">
            <div className="flex items-center gap-2">
              <span>🪙</span>
              <span>Receive {STARTER_GRANT} starter coins + 1 free hen</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🌟</span>
              <span>Career (5 levels), 3 Crisis Challenges &amp; Sandbox</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🦉</span>
              <span>Guided by Professor Hoot &amp; a Class Guardian</span>
            </div>
          </div>

          {/* Primary In-App NEAR & Social Login Options (Zero external broken redirects) */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              disabled={starting}
              onClick={() => {
                setModalInput('sunny.testnet');
                setSocialModal('near');
              }}
              className="w-full min-h-[50px] px-4 rounded-2xl bg-coop-text text-white font-heading text-base font-bold shadow-sm hover:opacity-95 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <span>🔑</span>
              <span>Sign in with NEAR FastAuth</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={starting}
                onClick={() => {
                  setModalInput('sunny.farmer@gmail.com');
                  setSocialModal('google');
                }}
                className="min-h-[48px] px-3 rounded-2xl bg-coop-bg hover:bg-amber-100 active:scale-95 border-2 border-amber-200 font-heading text-sm font-bold text-coop-text flex items-center justify-center gap-1.5 transition"
              >
                <span>🌐</span>
                <span>Google</span>
              </button>
              <button
                type="button"
                disabled={starting}
                onClick={() => void handlePasskeyLogin()}
                className="min-h-[48px] px-3 rounded-2xl bg-coop-bg hover:bg-amber-100 active:scale-95 border-2 border-amber-200 font-heading text-sm font-bold text-coop-text flex items-center justify-center gap-1.5 transition"
              >
                <span>🔐</span>
                <span>Passkey</span>
              </button>
            </div>

            <button
              type="button"
              disabled={starting}
              onClick={() => {
                setModalInput('sunny@school.edu');
                setSocialModal('email');
              }}
              className="w-full min-h-[42px] rounded-2xl bg-coop-bg/70 hover:bg-amber-100/70 border border-amber-200 text-xs font-extrabold text-coop-text transition"
            >
              ✉️ Continue with Email
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase text-coop-muted">
            <div className="flex-1 h-px bg-amber-200" />
            <span>or quick guest play</span>
            <div className="flex-1 h-px bg-amber-200" />
          </div>

          {/* Guest Login Fallback */}
          <form onSubmit={handleGuestStart} className="flex items-center gap-2">
            <input
              id="nickname-input"
              type="text"
              maxLength={20}
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Your nickname..."
              aria-label="Farmer Nickname"
              className="flex-1 min-h-[50px] px-3.5 rounded-2xl bg-coop-bg border-2 border-amber-200 font-heading text-base font-bold text-coop-text focus:outline-none focus:border-coop-yellow"
            />
            <button
              type="submit"
              disabled={starting}
              className="min-h-[50px] px-5 rounded-2xl bg-coop-yellow hover:brightness-105 active:scale-95 text-coop-text font-heading text-base font-bold shadow-sm border-2 border-amber-400 transition shrink-0"
            >
              {starting ? '...' : 'Play! 🌾'}
            </button>
          </form>

          <p className="text-xs font-bold text-coop-muted">
            Virtual coins for learning. No real money.
          </p>
        </motion.div>

        {/* In-App NEAR FastAuth / Google / Email Modal */}
        <AnimatePresence>
          {socialModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]">
              <motion.form
                onSubmit={handleModalSubmit}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-[400px] bg-coop-card rounded-3xl p-5 shadow-2xl border-4 border-coop-yellow space-y-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {socialModal === 'near'
                        ? '🔑'
                        : socialModal === 'google'
                        ? '🌐'
                        : '✉️'}
                    </span>
                    <div>
                      <h2 className="font-heading text-lg font-bold text-coop-text">
                        {socialModal === 'near'
                          ? 'NEAR FastAuth (Testnet)'
                          : socialModal === 'google'
                          ? 'Continue with Google'
                          : 'Continue with Email'}
                      </h2>
                      <p className="text-xs font-bold text-coop-muted">
                        Instant account setup • Zero gas or wallet popup
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSocialModal(null)}
                    className="min-w-[38px] min-h-[38px] rounded-xl bg-coop-bg font-bold text-coop-text"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-coop-muted mb-1">
                    {socialModal === 'near'
                      ? 'NEAR Testnet Account ID or Handle'
                      : 'Email Address'}
                  </label>
                  <input
                    type={socialModal === 'near' ? 'text' : 'email'}
                    required
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    placeholder={
                      socialModal === 'near'
                        ? 'e.g. sunny.testnet'
                        : 'you@example.com'
                    }
                    className="w-full min-h-[48px] px-3.5 rounded-2xl bg-coop-bg border-2 border-amber-200 font-heading text-base font-bold text-coop-text focus:outline-none focus:border-coop-yellow"
                  />
                  <p className="text-[11px] font-bold text-coop-muted mt-1.5">
                    {socialModal === 'near'
                      ? 'Automatically registers NEP-145 storage on coop-coin-7158.testnet and grants 100 COOP.'
                      : 'Derives a dedicated NEAR Testnet custodial account and grants 100 starter coins.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSocialModal(null)}
                    className="flex-1 min-h-[48px] rounded-2xl bg-coop-bg font-heading text-sm font-bold text-coop-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={starting}
                    className="flex-1 min-h-[48px] rounded-2xl bg-coop-green text-white font-heading text-base font-bold shadow-md hover:opacity-95 active:scale-95 transition"
                  >
                    {starting ? 'Connecting...' : 'Continue →'}
                  </button>
                </div>
              </motion.form>
            </div>
          )}
        </AnimatePresence>
      </main>
    );
  }

  // 2. Home / Mode Select Screen
  if (screen === 'home') {
    return (
      <>
        <ModeSelect />
        <BadgesSheet />
        <ProofDrawer />
      </>
    );
  }

  // 3. Level / Challenge Select Screen
  if (screen === 'level_select' || screen === 'challenge_select') {
    return (
      <>
        <LevelSelect />
        <BadgesSheet />
        <ProofDrawer />
      </>
    );
  }

  // 4. Main Gameplay Screen
  const levelDef = getLevelDef(mode, currentLevelId);
  const goalProgress = getGoalProgress(game, levelDef);

  return (
    <div className="min-h-screen max-w-[480px] mx-auto flex flex-col justify-between bg-coop-bg shadow-sm">
      {/* TopBar */}
      <TopBar />

      {/* Sequenced Next Day Animation Overlay (Tap anywhere to skip) */}
      <DayCycleOverlay
        step={daySequenceStep}
        dayNumber={game.day}
        feedCost={lastFeedCostPaid}
        eggsProduced={lastProducedEggs}
        onSkip={skipDaySequence}
      />

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
      <main className="flex-1 px-4 py-2.5 space-y-3 overflow-y-auto">
        {/* HUD Level Goal Progress Bar */}
        <button
          type="button"
          onClick={() => setActiveSheet('class_goal')}
          className={`w-full bg-coop-card rounded-2xl px-3.5 py-2.5 border-2 shadow-sm flex items-center justify-between gap-3 text-left transition ${
            goalProgress.percent >= 100
              ? 'border-coop-green ring-2 ring-coop-green/40'
              : 'border-amber-200 hover:bg-amber-50/50'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl" role="img" aria-label="Goal Target">
              {mode === 'challenge' ? '⚡' : mode === 'career' ? '🎯' : '🏆'}
            </span>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-coop-text truncate">
                {levelDef
                  ? `${levelDef.name} • ${levelDef.concept}`
                  : `Sandbox • Season ${game.season} Class Goal`}
              </div>
              <div className="text-[11px] font-bold text-coop-muted truncate">
                {goalProgress.label}
              </div>
            </div>
          </div>
          <div className="w-24 shrink-0">
            <div className="w-full h-2.5 bg-coop-bg rounded-full overflow-hidden border border-amber-200">
              <motion.div
                initial={false}
                animate={{ width: `${goalProgress.percent}%` }}
                transition={{ duration: 0.5, ease: ease.out }}
                className="h-full bg-coop-green rounded-full"
              />
            </div>
            <div className="text-[10px] font-extrabold text-right text-coop-green mt-0.5">
              {goalProgress.percent}%
            </div>
          </div>
        </button>

        {/* Coop Area (Center) */}
        <Coop />

        {/* MentorBubble + Daily Quests */}
        <MentorBubble />
      </main>

      {/* ActionBar (Bottom, Sticky) */}
      <ActionBar />

      {/* Bottom Sheets & Modals */}
      <SavingsJar />
      <ClassGoal />
      <BadgesSheet />
      <ApprovalModal />
      <ProofDrawer />
      <Celebration />
      <LevelIntroModal />
      <DaySummaryModal />
      <LevelEndModal />
    </div>
  );
}
