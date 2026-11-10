'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import {
  SAVINGS_EARLY_PENALTY,
  SAVINGS_INTEREST_PER_DAY,
  SAVINGS_MIN_LOCK_DAYS,
} from '@/game/constants';

export function SavingsJar() {
  const activeSheet = useGameStore((s) => s.activeSheet);
  const setActiveSheet = useGameStore((s) => s.setActiveSheet);
  const game = useGameStore((s) => s.game);
  const depositJar = useGameStore((s) => s.depositJar);
  const withdrawJar = useGameStore((s) => s.withdrawJar);

  const [amountInput, setAmountInput] = useState('20');

  const isOpen = activeSheet === 'savings';
  const daysElapsed =
    game.jarDepositDay !== null
      ? game.day - game.jarDepositDay
      : SAVINGS_MIN_LOCK_DAYS;
  const daysRemainingLock = Math.max(0, SAVINGS_MIN_LOCK_DAYS - daysElapsed);
  const isEarlyWithdraw = game.jar > 0 && daysRemainingLock > 0;

  const numericAmount = Math.max(0, Math.floor(Number(amountInput) || 0));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-[2px]">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-[480px] bg-coop-card rounded-t-3xl p-5 shadow-xl border-t-4 border-coop-yellow space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl" role="img" aria-label="Savings Jar">
                  🏺
                </span>
                <div>
                  <h3 className="font-heading text-xl font-bold text-coop-text">
                    Savings Jar
                  </h3>
                  <p className="text-xs font-bold text-coop-muted">
                    Earns +{SAVINGS_INTEREST_PER_DAY * 100}% interest every day!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSheet(null)}
                aria-label="Close Savings Jar"
                className="min-w-[44px] min-h-[44px] rounded-2xl bg-coop-bg font-bold text-coop-text"
              >
                ✕
              </button>
            </div>

            {/* Current Jar Balance & Lock Status */}
            <div className="bg-coop-bg rounded-2xl p-3.5 border border-amber-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-coop-muted">
                  Saved in Jar
                </div>
                <div className="font-heading text-2xl font-bold text-coop-green">
                  {game.jar.toFixed(1).replace(/\.0$/, '')} coins
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-coop-muted">
                  Lock Status ({SAVINGS_MIN_LOCK_DAYS} days)
                </div>
                {game.jar <= 0 ? (
                  <span className="text-xs font-extrabold text-coop-muted">
                    No deposit yet
                  </span>
                ) : isEarlyWithdraw ? (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-coop-red/15 text-coop-red text-xs font-extrabold">
                    🔒 {daysRemainingLock}d left (10% early fee)
                  </span>
                ) : (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-coop-green/20 text-coop-text text-xs font-extrabold">
                    ✅ Unlocked (No fee!)
                  </span>
                )}
              </div>
            </div>

            {/* Amount Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase text-coop-muted">
                Amount of Coins
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="flex-1 min-h-[48px] px-3.5 rounded-2xl bg-coop-bg border-2 border-amber-200 font-heading text-lg font-bold text-coop-text"
                />
                {[10, 25, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmountInput(String(preset))}
                    className="min-h-[48px] px-3 rounded-2xl bg-coop-bg hover:bg-amber-100 border border-amber-200 text-xs font-extrabold text-coop-text"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Early Withdraw Warning */}
            {isEarlyWithdraw && (
              <div className="p-3 rounded-2xl bg-coop-red/10 border border-coop-red text-xs font-bold text-coop-red">
                ⚠️ Withdrawing before {SAVINGS_MIN_LOCK_DAYS} days loses{' '}
                {SAVINGS_EARLY_PENALTY * 100}% of the withdrawn coins. Waiting{' '}
                {daysRemainingLock} more day(s) makes withdrawal free!
              </div>
            )}

            {/* Deposit / Withdraw Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                disabled={numericAmount <= 0 || game.balance < 1}
                onClick={() =>
                  depositJar(Math.min(numericAmount, Math.floor(game.balance)))
                }
                className="min-h-[52px] rounded-2xl bg-coop-green text-white font-heading text-base font-bold shadow-sm hover:opacity-95 active:scale-95 disabled:opacity-45 transition"
              >
                ➕ Deposit Coins
              </button>
              <button
                type="button"
                disabled={numericAmount <= 0 || game.jar <= 0}
                onClick={() => withdrawJar(Math.min(numericAmount, game.jar))}
                className="min-h-[52px] rounded-2xl bg-coop-yellow text-coop-text font-heading text-base font-bold shadow-sm hover:opacity-95 active:scale-95 disabled:opacity-45 transition"
              >
                ➖ Withdraw
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
