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
import {
  BoltIcon,
  CoinIcon,
  OwlAvatar,
  ShieldIcon,
  StarIcon,
  TrophyIcon,
} from '@/components/icons/GameIcons';

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

  // 1. Login Screen (Zero Emoji, Custom Vector Art + Tactile Buttons)
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
      <main className="min-h-screen max-w-[480px] mx-auto flex flex-col justify-center p-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="game-card overflow-hidden"
        >
          {/* Illustrated Barn Roof Banner */}
          <div className="bg-coop-red border-b-2 border-[#3B2F2F] pt-6 pb-5 px-6 text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-coop-card border-2 border-[#3B2F2F] shadow-[0_4px_0_0_#3B2F2F] mx-auto mb-3">
              <svg viewBox="0 0 64 64" className="w-14 h-14" aria-hidden="true">
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
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              Coop Tycoon
            </h1>
            <p className="text-xs font-bold text-white/90 mt-1 max-w-[300px] mx-auto">
              Run a tiny egg business, care for your flock, and practice saving and investing.
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Feature Highlights */}
            <div className="bg-coop-bg rounded-2xl p-3.5 border-2 border-[#3B2F2F] space-y-2 text-xs font-bold text-coop-text">
              <div className="flex items-center gap-2.5">
                <CoinIcon className="w-5 h-5 shrink-0" />
                <span>Start with {STARTER_GRANT} coins and your first healthy hen</span>
              </div>
              <div className="flex items-center gap-2.5">
                <StarIcon className="w-5 h-5 shrink-0" filled />
                <span>5 Career levels, 3 Crisis Challenges, and Sandbox mode</span>
              </div>
              <div className="flex items-center gap-2.5">
                <OwlAvatar className="w-5 h-5 shrink-0" />
                <span>Guided by Professor Hoot and Class Guardian approvals</span>
              </div>
            </div>

            {/* Social & NEAR Login Options */}
            <div className="space-y-2.5">
              <button
                type="button"
                disabled={starting}
                onClick={() => {
                  setModalInput('sunny.testnet');
                  setSocialModal('near');
                }}
                className="w-full min-h-[50px] px-4 rounded-2xl bg-[#3B2F2F] text-white font-heading text-base font-bold border-2 border-[#3B2F2F] shadow-[0_4px_0_0_#1D1616] active:translate-y-[2px] active:shadow-[0_2px_0_0_#1D1616] transition-all flex items-center justify-center gap-2"
              >
                <ShieldIcon className="w-5 h-5" />
                <span>Sign in with NEAR FastAuth</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={starting}
                  onClick={() => {
                    setModalInput('sunny.farmer@gmail.com');
                    setSocialModal('google');
                  }}
                  className="btn-game-secondary min-h-[46px] px-3 text-sm flex items-center justify-center gap-2"
                >
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  disabled={starting}
                  onClick={() => void handlePasskeyLogin()}
                  className="btn-game-secondary min-h-[46px] px-3 text-sm flex items-center justify-center gap-2"
                >
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
                className="btn-game-secondary w-full min-h-[42px] text-xs font-extrabold"
              >
                Continue with Email
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-coop-muted">
              <div className="flex-1 h-0.5 bg-[#3B2F2F]/15" />
              <span>or quick guest play</span>
              <div className="flex-1 h-0.5 bg-[#3B2F2F]/15" />
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
                className="flex-1 min-h-[50px] px-3.5 rounded-2xl bg-coop-bg border-2 border-[#3B2F2F] font-heading text-base font-bold text-coop-text focus:outline-none focus:bg-white"
              />
              <button
                type="submit"
                disabled={starting}
                className="btn-game-primary min-h-[50px] px-5 text-base shrink-0"
              >
                {starting ? '...' : 'Play →'}
              </button>
            </form>

            <p className="text-center text-xs font-bold text-coop-muted">
              Virtual coins for learning. No real money.
            </p>
          </div>
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
                className="game-card w-full max-w-[400px] p-5 space-y-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-coop-blue/30 border-2 border-[#3B2F2F] flex items-center justify-center">
                      <ShieldIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-heading text-lg font-bold text-coop-text">
                        {socialModal === 'near'
                          ? 'NEAR FastAuth (Testnet)'
                          : socialModal === 'google'
                          ? 'Continue with Google'
                          : 'Continue with Email'}
                      </h2>
                      <p className="text-xs font-bold text-coop-muted">
                        Instant account setup • Zero gas prompts
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSocialModal(null)}
                    className="btn-game-secondary min-w-[38px] min-h-[38px]"
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
                    className="w-full min-h-[48px] px-3.5 rounded-2xl bg-coop-bg border-2 border-[#3B2F2F] font-heading text-base font-bold text-coop-text focus:outline-none focus:bg-white"
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
                    className="btn-game-secondary flex-1 min-h-[48px] text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={starting}
                    className="btn-game-green flex-1 min-h-[48px] text-base"
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
    <div className="min-h-screen max-w-[480px] mx-auto flex flex-col justify-between">
      {/* TopBar */}
      <TopBar />

      {/* Sequenced Next Day Animation Overlay */}
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
            className="game-card mx-4 mt-2 px-3.5 py-2 text-xs font-bold text-coop-text text-center"
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
          className={`game-card w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left active:translate-y-[2px] active:shadow-[0_2px_0_0_#3B2F2F] transition-all ${
            goalProgress.percent >= 100 ? 'ring-2 ring-coop-green' : ''
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-coop-yellow/35 border-2 border-[#3B2F2F] flex items-center justify-center shrink-0">
              {mode === 'challenge' ? (
                <BoltIcon className="w-5 h-5" />
              ) : mode === 'career' ? (
                <StarIcon className="w-5 h-5" filled />
              ) : (
                <TrophyIcon className="w-5 h-5" />
              )}
            </div>
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
            <div className="w-full h-3 bg-coop-bg rounded-full overflow-hidden border-2 border-[#3B2F2F]">
              <motion.div
                initial={false}
                animate={{ width: `${goalProgress.percent}%` }}
                transition={{ duration: 0.5, ease: ease.out }}
                className="h-full bg-coop-green"
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
