'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { getGoalProgress, getLevelDef } from '@/game/levels';
import { OwlAvatar, StarIcon } from './icons/GameIcons';

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
            className="game-card w-full max-w-[420px] p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-lg bg-coop-yellow border-2 border-[#3B2F2F] text-coop-text text-xs font-extrabold uppercase">
                {levelDef.isChallenge
                  ? 'Challenge Scenario'
                  : `Career Level ${levelDef.id}`}
              </span>
              <span className="text-xs font-extrabold text-coop-muted">
                {levelDef.dayLimit} Days Max
              </span>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-coop-text">
                {levelDef.name}
              </h2>
              <p className="text-xs font-extrabold text-coop-text bg-coop-blue/35 inline-block px-2 py-0.5 rounded border border-[#3B2F2F]/30 mt-1">
                Lesson Concept: {levelDef.concept}
              </p>
            </div>

            <div className="bg-coop-bg rounded-2xl p-3.5 border-2 border-[#3B2F2F] space-y-2">
              <div className="text-xs font-extrabold uppercase text-coop-muted">
                Level Goal
              </div>
              <div className="font-heading text-base font-bold text-coop-text">
                {progress.label}
              </div>
              <div className="space-y-1 pt-1 text-xs font-bold text-coop-muted">
                <div className="flex items-center gap-1.5">
                  <StarIcon className="w-4 h-4" filled />
                  <span>1 Star: Finish within {levelDef.dayLimit} days</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <StarIcon className="w-4 h-4" filled />
                  <span>2 Stars: Finish within {levelDef.parDays} days</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <StarIcon className="w-4 h-4" filled />
                  <span>3 Stars: Also zero sick-hen days</span>
                </div>
              </div>
            </div>

            <div className="bg-coop-blue/25 border-2 border-[#3B2F2F] rounded-2xl p-3 flex items-start gap-2.5 text-xs font-bold text-coop-text">
              <OwlAvatar className="w-9 h-9 shrink-0" />
              <p>{levelDef.introText}</p>
            </div>

            <button
              type="button"
              onClick={dismissLevelIntro}
              className="btn-game-primary w-full min-h-[52px] text-lg"
            >
              Start Level →
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
