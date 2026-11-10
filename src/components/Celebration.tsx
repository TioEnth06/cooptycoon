'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { SEASON_BONUS_MINT } from '@/game/constants';

const CONFETTI_EMOJIS = ['🎉', '🪙', '🐔', '🥚', '🌟', '🏆', '✨', '🎊'];

export function Celebration() {
  const showCelebration = useGameStore((s) => s.showCelebration);
  const dismissCelebration = useGameStore((s) => s.dismissCelebration);

  return (
    <AnimatePresence>
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]">
          {/* Emoji Confetti Burst */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            {CONFETTI_EMOJIS.map((emoji, idx) => (
              <motion.span
                key={idx}
                initial={{
                  opacity: 1,
                  y: '50vh',
                  x: `${15 + idx * 10}vw`,
                  scale: 0.5,
                }}
                animate={{
                  opacity: [1, 1, 0],
                  y: ['50vh', `${10 + (idx % 3) * 12}vh`],
                  scale: [0.6, 1.3, 1],
                  rotate: [0, idx % 2 === 0 ? 45 : -45],
                }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="absolute text-3xl"
              >
                {emoji}
              </motion.span>
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[400px] bg-coop-card rounded-3xl p-6 text-center shadow-2xl border-4 border-coop-yellow space-y-4"
          >
            <div className="text-5xl" role="img" aria-label="Celebration">
              🏆🎉
            </div>
            <h3 className="font-heading text-2xl font-bold text-coop-text">
              Class Savings Goal Reached!
            </h3>
            <p className="text-sm font-bold text-coop-text">
              The whole class saved 500 coins together! Everyone receives a{' '}
              <span className="text-coop-green font-extrabold">
                +{SEASON_BONUS_MINT} coin
              </span>{' '}
              Season Bonus!
            </p>
            <button
              type="button"
              onClick={dismissCelebration}
              className="w-full min-h-[52px] rounded-2xl bg-coop-yellow text-coop-text font-heading text-lg font-bold shadow-md hover:brightness-105 active:scale-95 transition"
            >
              Awesome! (+{SEASON_BONUS_MINT} Coins)
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
