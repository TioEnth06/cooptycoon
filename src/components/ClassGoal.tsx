'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { CLASS_GOAL_TARGET, SEASON_BONUS_MINT } from '@/game/constants';
import { getClassSavingsTotal } from '@/game/engine';
import { TrophyIcon } from './icons/GameIcons';

export function ClassGoal() {
  const activeSheet = useGameStore((s) => s.activeSheet);
  const setActiveSheet = useGameStore((s) => s.setActiveSheet);
  const game = useGameStore((s) => s.game);
  const nickname = useGameStore((s) => s.nickname);
  const depositJar = useGameStore((s) => s.depositJar);

  const isOpen = activeSheet === 'class_goal';
  const classSavings = getClassSavingsTotal(game);
  const pct = Math.min(100, Math.round((classSavings / CLASS_GOAL_TARGET) * 100));
  const remaining = Math.max(0, Math.ceil(CLASS_GOAL_TARGET - classSavings));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-[2px]">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-[480px] bg-coop-card rounded-t-3xl p-5 shadow-xl border-t-4 border-[#3B2F2F] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-coop-yellow/35 border-2 border-[#3B2F2F] flex items-center justify-center">
                  <TrophyIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-coop-text">
                    Season {game.season} Class Savings Goal
                  </h3>
                  <p className="text-xs font-bold text-coop-muted">
                    When the class saves {CLASS_GOAL_TARGET} coins together, everyone gets +{SEASON_BONUS_MINT} bonus coins.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSheet(null)}
                aria-label="Close Class Goal"
                className="btn-game-secondary min-w-[42px] min-h-[42px]"
              >
                ✕
              </button>
            </div>

            {/* Progress Bar */}
            <div className="bg-coop-bg p-3.5 rounded-2xl border-2 border-[#3B2F2F] space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span>Total Class Savings</span>
                <span className="text-coop-green text-sm">
                  {Math.round(classSavings)} / {CLASS_GOAL_TARGET} coins ({pct}%)
                </span>
              </div>
              <div className="w-full h-4 bg-white rounded-full overflow-hidden border-2 border-[#3B2F2F]">
                <motion.div
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.45 }}
                  className="h-full bg-coop-green"
                />
              </div>
              <p className="text-xs font-bold text-coop-muted">
                {remaining > 0
                  ? `${remaining} more coins in Savings Jars to unlock the +${SEASON_BONUS_MINT} coin Season Bonus.`
                  : 'Goal reached this season! Every member received +50 coins.'}
              </p>
            </div>

            {/* Classmates List */}
            <div className="space-y-2">
              <div className="text-xs font-extrabold uppercase text-coop-muted">
                Classmates&apos; Savings Jars
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-2xl bg-coop-yellow/30 border-2 border-[#3B2F2F] flex items-center justify-between">
                  <span className="text-xs font-extrabold text-coop-text truncate">
                    {nickname || 'You'} (You)
                  </span>
                  <span className="text-xs font-extrabold text-coop-text">
                    {Math.round(game.jar)} coins
                  </span>
                </div>

                {game.classmates.map((mate) => (
                  <div
                    key={mate.name}
                    className="p-2.5 rounded-2xl bg-coop-bg border-2 border-[#3B2F2F]/30 flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-coop-text">
                      {mate.name}
                    </span>
                    <span className="text-xs font-extrabold text-coop-green">
                      {Math.round(mate.jar)} coins
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {remaining > 0 && game.balance >= 10 && (
              <button
                type="button"
                onClick={() =>
                  depositJar(
                    Math.min(Math.floor(game.balance), Math.max(25, remaining))
                  )
                }
                className="btn-game-green w-full min-h-[50px] text-base"
              >
                Save Coins to Help Reach the Goal
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
