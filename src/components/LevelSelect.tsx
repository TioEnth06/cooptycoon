'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { CAREER_LEVELS, CHALLENGE_SCENARIOS } from '@/game/levels';
import { BoltIcon, StarIcon } from './icons/GameIcons';

export function LevelSelect() {
  const screen = useGameStore((s) => s.screen);
  const levelStars = useGameStore((s) => s.levelStars);
  const setScreen = useGameStore((s) => s.setScreen);
  const startLevel = useGameStore((s) => s.startLevel);

  const isChallengeView = screen === 'challenge_select';
  const items = isChallengeView ? CHALLENGE_SCENARIOS : CAREER_LEVELS;
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

  return (
    <main className="min-h-screen max-w-[480px] mx-auto flex flex-col justify-between p-5">
      <div className="space-y-4">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setScreen('home')}
            className="btn-game-secondary min-h-[42px] px-3.5 py-1.5 text-sm"
          >
            ← Modes
          </button>
          <div className="flex items-center gap-2">
            {isChallengeView ? (
              <BoltIcon className="w-6 h-6" />
            ) : (
              <StarIcon className="w-6 h-6" filled />
            )}
            <h1 className="font-heading text-2xl font-bold text-coop-text">
              {isChallengeView ? 'Challenge Crises' : 'Career Levels'}
            </h1>
          </div>
          <div className="w-16" />
        </div>

        <p className="text-xs font-bold text-coop-muted text-center">
          {isChallengeView
            ? 'Jump straight into a farm crisis and test your money decisions.'
            : 'Complete each level with at least 1 star to unlock the next lesson.'}
        </p>

        {/* Levels / Challenges List */}
        <div className="space-y-3.5">
          {items.map((lvl, index) => {
            const stars = levelStars[lvl.id] ?? 0;
            const prevLevelId = index > 0 ? items[index - 1].id : null;
            const prevStars = prevLevelId ? levelStars[prevLevelId] ?? 0 : 1;
            const unlocked =
              isChallengeView || index === 0 || prevStars >= 1 || isDemoMode;

            return (
              <motion.div
                key={lvl.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className={`game-card p-4 transition ${
                  unlocked ? '' : 'opacity-60 bg-coop-bg'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-coop-yellow border border-[#3B2F2F] text-coop-text text-[11px] font-extrabold uppercase">
                        {isChallengeView ? 'Scenario' : `Level ${lvl.id}`}
                      </span>
                      <span className="text-[11px] font-extrabold text-coop-text bg-coop-blue/35 border border-[#3B2F2F]/40 px-2 py-0.5 rounded-lg">
                        {lvl.concept}
                      </span>
                    </div>

                    <h2 className="font-heading text-lg font-bold text-coop-text pt-0.5">
                      {lvl.name}
                    </h2>
                    <p className="text-xs font-bold text-coop-muted leading-snug">
                      {lvl.introText}
                    </p>
                    <div className="pt-1.5 flex items-center gap-3 text-[11px] font-extrabold text-coop-text">
                      <span className="px-2 py-0.5 rounded bg-coop-bg border border-[#3B2F2F]/20">
                        Limit: {lvl.dayLimit}d
                      </span>
                      <span className="px-2 py-0.5 rounded bg-coop-bg border border-[#3B2F2F]/20">
                        2-Star Par: {lvl.parDays}d
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between shrink-0 gap-3">
                    {/* Vector Stars Display */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((sIdx) => (
                        <StarIcon
                          key={sIdx}
                          className="w-5 h-5"
                          filled={sIdx <= stars}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={!unlocked}
                      onClick={() =>
                        startLevel(
                          isChallengeView ? 'challenge' : 'career',
                          lvl.id
                        )
                      }
                      className="btn-game-primary min-h-[42px] px-4 py-1.5 text-sm"
                    >
                      {unlocked ? 'Play →' : 'Locked'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <footer className="pt-4 text-center text-xs font-bold text-coop-muted">
        Earn 3 stars by finishing within Par days with zero sick-hen days.
      </footer>
    </main>
  );
}
