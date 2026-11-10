'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { getGoalProgress, getLevelDef } from '@/game/levels';

export function LevelIntroModal() {
  const showLevelIntro = useGameStore((s) => s.showLevelIntro);
  const dismissLevelIntro = useGameStore((s) => s.dismissLevelIntro);
  const mode = useGameStore((s) => s.mode);
  const currentLevelId = useGameStore((s) => s.currentLevelId);
  const game = useGameStore((s) => s.game);

  const levelDef = getLevelDef(mode, currentLevelId);
  if (!levelDef) return null;

  const progress = getGoalProgress(game, levelDef);

  return (
    <AnimatePresence>
      {showLevelIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-[420px] bg-coop-card rounded-3xl p-6 shadow-2xl border-4 border-coop-yellow space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-coop-yellow/35 text-coop-text text-xs font-extrabold uppercase">
                {levelDef.isChallenge
                  ? '⚡ Challenge Scenario'
                  : `🌟 Career Level ${levelDef.id}`}
              </span>
              <span className="text-xs font-extrabold text-coop-muted">
                🗓️ {levelDef.dayLimit} Days Max
              </span>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-coop-text">
                {levelDef.name}
              </h2>
              <p className="text-xs font-extrabold text-coop-blue mt-0.5">
                Lesson Concept: {levelDef.concept}
              </p>
            </div>

            <div className="bg-coop-bg rounded-2xl p-3.5 border border-amber-200 space-y-2">
              <div className="text-xs font-extrabold uppercase text-coop-muted">
                🎯 Level Goal
              </div>
              <div className="font-heading text-base font-bold text-coop-text">
                {progress.label}
              </div>
              <div className="text-xs font-bold text-coop-muted">
                ⭐ 1 Star: Finish within {levelDef.dayLimit} days
                <br />
                ⭐⭐ 2 Stars: Finish within {levelDef.parDays} days
                <br />
                ⭐⭐⭐ 3 Stars: Also zero sick-hen days!
              </div>
            </div>

            <div className="bg-coop-blue/20 border border-coop-blue rounded-2xl p-3 flex items-start gap-2.5 text-xs font-bold text-coop-text">
              <span className="text-xl">🦉</span>
              <p>{levelDef.introText}</p>
            </div>

            <button
              type="button"
              onClick={dismissLevelIntro}
              className="w-full min-h-[52px] rounded-2xl bg-coop-yellow hover:brightness-105 active:scale-95 text-coop-text font-heading text-lg font-bold shadow-md border-2 border-amber-400 transition"
            >
              Let&apos;s Go! 🌾
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
