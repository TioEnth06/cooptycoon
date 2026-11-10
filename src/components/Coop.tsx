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
import {
  BarnIcon,
  BasketIcon,
  BroomIcon,
  GrainIcon,
} from './icons/GameIcons';

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
        className="game-card relative overflow-hidden"
      >
        {/* Barn Roof Top Banner */}
        <div className="bg-coop-red border-b-2 border-[#3B2F2F] px-4 py-2.5 flex items-center justify-between gap-2 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-coop-card border-2 border-[#3B2F2F] flex items-center justify-center shrink-0">
              <BarnIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold leading-tight">
                Cozy Barn ({game.hens.length}/{MAX_HENS} Hens)
              </h2>
              <p className="text-[11px] font-bold text-white/90">
                Daily feed: {feedPrice} coins per hen
              </p>
            </div>
          </div>

          {/* Egg Basket Inventory Pill */}
          <motion.div
            key={`eggs-${game.eggs}-${dayTransitionTrigger}`}
            initial={{ scale: 0.9 }}
            animate={{ scale: [1, 1.15, 1], y: [0, -4, 0] }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 bg-coop-card text-coop-text border-2 border-[#3B2F2F] shadow-[0_2px_0_0_#3B2F2F] px-3 py-1 rounded-2xl"
          >
            <BasketIcon className="w-6 h-6 shrink-0" />
            <div>
              <div className="text-[9px] font-extrabold uppercase text-coop-muted leading-none">
                Basket
              </div>
              <div className="font-heading text-sm font-bold text-coop-text leading-tight">
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
                  className="ml-0.5 text-[11px] font-extrabold bg-coop-green text-white px-1.5 py-0.5 rounded-md border border-[#3B2F2F]"
                >
                  +{lastProducedEggs}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Coop Interior Body */}
        <div className="p-4 space-y-3.5">
          {/* Cleaning Broom Sweep Animation */}
          <AnimatePresence>
            {cleanSweepTrigger > 0 && (
              <motion.div
                key={cleanSweepTrigger}
                initial={{ x: -40, opacity: 1 }}
                animate={{ x: 380, opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: ease.out }}
                className="pointer-events-none absolute bottom-6 left-0 z-20"
              >
                <BroomIcon className="w-9 h-9" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feed Spike Alert Badge */}
          <AnimatePresence>
            {game.feedSpikeDaysLeft > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-coop-yellow/35 border-2 border-[#3B2F2F] text-coop-text text-xs font-extrabold"
              >
                <div className="flex items-center gap-1.5">
                  <GrainIcon className="w-5 h-5" />
                  <span>Feed Price Spike ({feedPrice} coins/hen)</span>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-coop-card border border-[#3B2F2F] text-coop-text font-extrabold">
                  {game.feedSpikeDaysLeft}d left
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hens Nest Grid (Max 5) */}
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
              <button
                type="button"
                onClick={() => void requestBuyHen()}
                className={`min-h-[132px] flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed border-[#3B2F2F]/60 hover:border-[#3B2F2F] active:translate-y-[2px] transition ${
                  highlightBuyHen
                    ? 'bg-coop-green/15 ring-2 ring-coop-green'
                    : 'bg-[#FFF6E5]/60 hover:bg-[#FFF6E5]'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-coop-yellow border-2 border-[#3B2F2F] flex items-center justify-center font-heading text-xl font-bold text-coop-text mb-1">
                  +
                </div>
                <span className="font-heading text-sm font-bold text-coop-text">
                  Add Hen
                </span>
                <span className="text-xs font-extrabold text-coop-muted">
                  {HEN_PRICE} coins
                </span>
                <span className="mt-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-coop-blue/35 border border-[#3B2F2F]/40 text-coop-text">
                  Guardian Approval
                </span>
              </button>
            )}
          </div>

          {/* Cleanliness Floor Meter */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-xs font-extrabold mb-1.5">
              <span className="flex items-center gap-1.5 text-coop-text">
                <BroomIcon className="w-4 h-4" />
                <span>Coop Cleanliness</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-md border border-[#3B2F2F]/30 text-[11px] ${
                  isDirty
                    ? 'bg-coop-red text-white'
                    : 'bg-coop-green/20 text-coop-text'
                }`}
              >
                {game.cleanliness}% {isDirty ? 'Dirty — Sickness Risk' : 'Clean'}
              </span>
            </div>
            <div className="w-full h-3.5 bg-coop-bg rounded-full overflow-hidden border-2 border-[#3B2F2F]">
              <motion.div
                initial={false}
                animate={{ width: `${game.cleanliness}%` }}
                transition={{ duration: 0.5, ease: ease.out }}
                className={`h-full ${
                  isDirty ? 'bg-coop-red' : 'bg-coop-green'
                }`}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
