'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import {
  DIRTY_THRESHOLD,
  HEN_PRICE,
  MAX_HENS,
  MEDICINE_COST,
} from '@/game/constants';
import { getFeedPricePerHen } from '@/game/engine';
import { ease } from '@/animation/tokens';
import { Hen } from './Hen';
import { AmbientScene } from './Animations';

export function Coop() {
  const game = useGameStore((s) => s.game);
  const lastProducedEggs = useGameStore((s) => s.lastProducedEggs);
  const dayTransitionTrigger = useGameStore((s) => s.dayTransitionTrigger);
  const daySequenceStep = useGameStore((s) => s.daySequenceStep);
  const cleanSweepTrigger = useGameStore((s) => s.cleanSweepTrigger);
  const healedHenId = useGameStore((s) => s.healedHenId);
  const cureHen = useGameStore((s) => s.cureHen);
  const requestBuyHen = useGameStore((s) => s.requestBuyHen);

  const feedPrice = getFeedPricePerHen(game);
  const isDirty = game.cleanliness < DIRTY_THRESHOLD;
  const canBuyMoreHens = game.hens.length < MAX_HENS;
  const highlightBuyHen = game.tutorialStep === 4 && game.hens.length === 1;
  const isPecking = daySequenceStep === 2;

  return (
    <div className="space-y-1">
      <AmbientScene />

      <section
        id="coop-card"
        aria-label="Chicken Coop"
        className="relative bg-coop-card rounded-3xl p-4 shadow-sm border-2 border-amber-200/80 space-y-3.5 overflow-hidden"
      >
        {/* Cleaning Broom Sweep Animation */}
        <AnimatePresence>
          {cleanSweepTrigger > 0 && (
            <motion.div
              key={cleanSweepTrigger}
              initial={{ x: -40, opacity: 1 }}
              animate={{ x: 380, opacity: [1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: ease.out }}
              className="pointer-events-none absolute bottom-6 left-0 z-20 text-3xl"
            >
              🧹✨
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coop Header & Egg Basket */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="Coop">
              🏡
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold text-coop-text leading-tight">
                Your Cozy Coop ({game.hens.length}/{MAX_HENS} Hens)
              </h2>
              <p className="text-xs font-semibold text-coop-muted">
                Daily feed: {feedPrice} coins / hen
              </p>
            </div>
          </div>

          {/* Egg Basket Inventory Pill with Egg Pop Animation */}
          <motion.div
            key={`eggs-${game.eggs}-${dayTransitionTrigger}`}
            initial={{ scale: 0.9 }}
            animate={{ scale: [1, 1.2, 1], y: [0, -6, 0] }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-1.5 bg-coop-yellow/25 border-2 border-coop-yellow px-3 py-1.5 rounded-2xl"
          >
            <span className="text-xl" role="img" aria-label="Eggs in basket">
              🥚
            </span>
            <div>
              <div className="text-[11px] font-bold uppercase text-coop-muted leading-none">
                Basket
              </div>
              <div className="font-heading text-base font-bold text-coop-text leading-tight">
                {game.eggs} {game.eggs === 1 ? 'Egg' : 'Eggs'}
              </div>
            </div>

            <AnimatePresence>
              {lastProducedEggs > 0 && (
                <motion.span
                  key={`pop-${dayTransitionTrigger}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={ease.spring}
                  className="ml-1 text-xs font-extrabold bg-coop-green text-white px-1.5 py-0.5 rounded-full"
                >
                  +{lastProducedEggs}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Feed Spike Alert Badge */}
        <AnimatePresence>
          {game.feedSpikeDaysLeft > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-coop-yellow/30 border border-coop-yellow text-coop-text text-xs font-bold"
            >
              <div className="flex items-center gap-1.5">
                <span role="img" aria-label="Grain spike">
                  🌾
                </span>
                <span>Feed Price Spike! ({feedPrice} coins/hen)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-coop-card text-coop-text font-extrabold">
                {game.feedSpikeDaysLeft}d left
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hens Grid (Max 5) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <AnimatePresence>
            {game.hens.map((hen, idx) => (
              <Hen
                key={hen.id}
                hen={hen}
                index={idx}
                canAffordMedicine={game.balance >= MEDICINE_COST}
                isPecking={isPecking}
                isHealed={healedHenId === hen.id}
                onCure={cureHen}
              />
            ))}
          </AnimatePresence>

          {/* Buy Hen Slot */}
          {canBuyMoreHens && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => void requestBuyHen()}
              className={`min-h-[120px] flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed transition ${
                highlightBuyHen
                  ? 'border-coop-green bg-coop-green/15 ring-2 ring-coop-green/40'
                  : 'border-amber-300 hover:border-coop-yellow bg-coop-bg/40 hover:bg-coop-bg'
              }`}
            >
              <span className="text-2xl mb-1" role="img" aria-label="Add Hen">
                ➕🐔
              </span>
              <span className="font-heading text-sm font-bold text-coop-text">
                Buy Hen
              </span>
              <span className="text-xs font-bold text-coop-muted">
                {HEN_PRICE} coins
              </span>
              <span className="mt-1 text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-coop-blue/30 text-coop-text">
                Guardian Approval
              </span>
            </motion.button>
          )}
        </div>

        {/* Cleanliness Meter under the coop */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="flex items-center gap-1 text-coop-text">
              <span role="img" aria-label="Broom">
                🧹
              </span>
              <span>Coop Cleanliness</span>
            </span>
            <span
              className={`font-extrabold ${
                isDirty ? 'text-coop-red' : 'text-coop-text'
              }`}
            >
              {game.cleanliness}%{' '}
              {isDirty ? '⚠️ Dirty (High Sickness Risk!)' : '✨ Clean'}
            </span>
          </div>
          <div className="w-full h-3 bg-coop-bg rounded-full overflow-hidden border border-amber-200">
            <motion.div
              initial={false}
              animate={{ width: `${game.cleanliness}%` }}
              transition={{ duration: 0.5, ease: ease.out }}
              className={`h-full rounded-full ${
                isDirty ? 'bg-coop-red' : 'bg-coop-green'
              }`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
