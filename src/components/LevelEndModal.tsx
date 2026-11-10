'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { CAREER_LEVELS, getLevelDef, netWorth } from '@/game/levels';
import { Confetti, Stars } from './Animations';
import { OwlAvatar } from './icons/GameIcons';

export function LevelEndModal() {
  const levelOutcome = useGameStore((s) => s.levelOutcome);
  const mode = useGameStore((s) => s.mode);
  const currentLevelId = useGameStore((s) => s.currentLevelId);
  const game = useGameStore((s) => s.game);
  const retryCurrentLevel = useGameStore((s) => s.retryCurrentLevel);
  const startLevel = useGameStore((s) => s.startLevel);
  const setScreen = useGameStore((s) => s.setScreen);

  if (levelOutcome.status === 'playing' || mode === 'sandbox') {
    return null;
  }

  const levelDef = getLevelDef(mode, currentLevelId);
  if (!levelDef) return null;

  const isWin = levelOutcome.status === 'won';
  const isBankruptLoss = levelOutcome.status === 'lost_bankrupt';
  const currentNetWorth = Math.round(netWorth(game));

  const nextCareerLevel =
    mode === 'career'
      ? CAREER_LEVELS.find((l) => l.id === levelDef.id + 1)
      : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]">
        {isWin && <Confetti />}

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="game-card w-full max-w-[420px] p-6 text-center space-y-4"
        >
          {isWin ? (
            <>
              <div className="pt-1">
                <Stars count={levelOutcome.stars} size="lg" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-coop-text">
                {levelDef.name} Complete!
              </h2>
              <div className="bg-coop-bg rounded-2xl p-3.5 border-2 border-[#3B2F2F] grid grid-cols-2 gap-2 text-xs font-bold">
                <div>
                  <div className="text-coop-muted uppercase">Days Used</div>
                  <div className="font-heading text-lg text-coop-text">
                    {Math.max(1, game.day - 1)} / {levelDef.dayLimit}
                  </div>
                </div>
                <div>
                  <div className="text-coop-muted uppercase">Net Worth</div>
                  <div className="font-heading text-lg text-coop-green">
                    {currentNetWorth} coins
                  </div>
                </div>
              </div>

              <div className="bg-coop-blue/25 border-2 border-[#3B2F2F] rounded-2xl p-3.5 text-left flex items-start gap-2.5">
                <OwlAvatar className="w-10 h-10 shrink-0" />
                <div>
                  <div className="text-[11px] font-extrabold uppercase text-coop-text">
                    What You Learned • {levelDef.concept}
                  </div>
                  <p className="text-xs font-bold text-coop-text mt-0.5">
                    {levelDef.learnedText}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {nextCareerLevel && (
                  <button
                    type="button"
                    onClick={() => startLevel('career', nextCareerLevel.id)}
                    className="btn-game-green w-full min-h-[52px] text-lg"
                  >
                    Next Level: {nextCareerLevel.name} →
                  </button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={retryCurrentLevel}
                    className="btn-game-secondary min-h-[46px] text-sm"
                  >
                    Replay
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setScreen(
                        mode === 'challenge' ? 'challenge_select' : 'level_select'
                      )
                    }
                    className="btn-game-secondary min-h-[46px] text-sm"
                  >
                    All Levels
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-heading text-2xl font-bold text-coop-text">
                {isBankruptLoss ? 'Out of Coins' : 'Almost There!'}
              </h2>
              <div className="bg-coop-blue/25 border-2 border-[#3B2F2F] rounded-2xl p-3.5 text-left flex items-start gap-2.5">
                <OwlAvatar className="w-10 h-10 shrink-0" />
                <p className="text-xs font-bold text-coop-text">
                  {isBankruptLoss
                    ? 'Your coins ran below daily feed cost with no eggs or savings left. Keeping a small reserve in your Savings Jar helps cover surprise expenses!'
                    : `You reached Day ${levelDef.dayLimit} while working toward ${levelDef.name}. Selling eggs when prices are high or adding a second hen earlier can help you finish in time!`}
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={retryCurrentLevel}
                  className="btn-game-primary w-full min-h-[52px] text-lg"
                >
                  Try Level Again
                </button>
                <button
                  type="button"
                  onClick={() => setScreen('home')}
                  className="btn-game-secondary w-full min-h-[46px] text-sm"
                >
                  Back to Home Modes
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
