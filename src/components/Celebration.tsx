'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { SEASON_BONUS_MINT } from '@/game/constants';
import { Confetti } from './Animations';
import { TrophyIcon } from './icons/GameIcons';

export function Celebration() {
  const showCelebration = useGameStore((s) => s.showCelebration);
  const dismissCelebration = useGameStore((s) => s.dismissCelebration);

  return (
    <AnimatePresence>
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]">
          <Confetti />

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="game-card w-full max-w-[400px] p-6 text-center space-y-4"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-coop-yellow border-2 border-[#3B2F2F] mx-auto">
              <TrophyIcon className="w-10 h-10" />
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
              className="btn-game-primary w-full min-h-[52px] text-lg"
            >
              Claim +{SEASON_BONUS_MINT} Coins
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
