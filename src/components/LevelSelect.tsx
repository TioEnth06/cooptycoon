'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { CAREER_LEVELS, CHALLENGE_SCENARIOS } from '@/game/levels';

export function LevelSelect() {
  const screen = useGameStore((s) => s.screen);
  const levelStars = useGameStore((s) => s.levelStars);
  const setScreen = useGameStore((s) => s.setScreen);
  const startLevel = useGameStore((s) => s.startLevel);

  const isChallengeView = screen === 'challenge_select';
  const items = isChallengeView ? CHALLENGE_SCENARIOS : CAREER_LEVELS;
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

  return (
    <main className="min-h-screen max-w-[480px] mx-auto flex flex-col justify-between p-5 bg-coop-bg">
      <div className="space-y-4">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setScreen('home')}
            className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-coop-card border border-amber-200 font-heading text-sm font-bold text-coop-text active:scale-95 transition"
          >
            ← Modes
          </button>
          <h1 className="font-heading text-2xl font-bold text-coop-text">
            {isChallengeView ? '⚡ Challenge Crises' : '🌟 Career Levels'}
          </h1>
          <div className="w-16" />
        </div>

        <p className="text-xs font-bold text-coop-muted text-center">
          {isChallengeView
            ? 'Jump straight into a farm crisis and test your money decisions!'
            : 'Complete each level with at least 1 star to unlock the next lesson.'}
        </p>

        {/* Levels / Challenges List */}
        <div className="space-y-3">
          {items.map((lvl, index) => {
            const stars = levelStars[lvl.id] ?? 0;
            // Level N+1 unlocks when Level N has >= 1 star (or in Demo mode all levels can be previewed)
            const prevLevelId = index > 0 ? items[index - 1].id : null;
            const prevStars = prevLevelId ? levelStars[prevLevelId] ?? 0 : 1;
            const unlocked = isChallengeView || index === 0 || prevStars >= 1 || isDemoMode;

            return (
              <motion.div
                key={lvl.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className={`p-4 rounded-3xl border-2 shadow-sm transition ${
                  unlocked
                    ? 'bg-coop-card border-amber-200'
                    : 'bg-coop-bg/60 border-amber-200/50 opacity-65'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-coop-yellow/35 text-coop-text text-xs font-extrabold">
                        {isChallengeView ? 'Crisis' : `Level ${lvl.id}`}
                      </span>
                      <span className="text-xs font-extrabold text-coop-blue bg-coop-blue/20 px-2 py-0.5 rounded-full">
                        {lvl.concept}
                      </span>
                    </div>

                    <h2 className="font-heading text-lg font-bold text-coop-text">
                      {lvl.name}
                    </h2>
                    <p className="text-xs font-bold text-coop-muted">
                      {lvl.introText}
                    </p>
                    <div className="pt-1 flex items-center gap-3 text-[11px] font-extrabold text-coop-text">
                      <span>🗓️ Limit: {lvl.dayLimit} days</span>
                      <span>⚡ 2★ Par: {lvl.parDays} days</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between shrink-0 gap-2">
                    {/* Stars Display */}
                    <div className="flex items-center gap-0.5 text-base">
                      {[1, 2, 3].map((sIdx) => (
                        <span
                          key={sIdx}
                          className={
                            sIdx <= stars ? 'opacity-100' : 'grayscale opacity-30'
                          }
                        >
                          ⭐
                        </span>
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
                      className="min-h-[44px] px-4 py-2 rounded-2xl bg-coop-yellow hover:brightness-105 active:scale-95 disabled:opacity-40 font-heading text-sm font-bold text-coop-text shadow-sm border border-amber-400 transition"
                    >
                      {unlocked ? 'Play →' : '🔒 Locked'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <footer className="pt-4 text-center text-xs font-bold text-coop-muted">
        Earn 3 stars by finishing within Par days with zero sick-hen days!
      </footer>
    </main>
  );
}
