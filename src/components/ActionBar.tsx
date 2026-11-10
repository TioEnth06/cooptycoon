'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import {
  CLASS_GOAL_TARGET,
  CLEAN_COST,
  MEDICINE_COST,
} from '@/game/constants';
import { getClassSavingsTotal } from '@/game/engine';
import { eggPrice } from '@/game/market';
import { CoinFly } from './Animations';
import {
  BasketIcon,
  BroomIcon,
  JarIcon,
  MedicineIcon,
  MoonIcon,
  SunIcon,
  TrophyIcon,
} from './icons/GameIcons';

export function ActionBar() {
  const game = useGameStore((s) => s.game);
  const lastEggPriceDelta = useGameStore((s) => s.lastEggPriceDelta);
  const flyingCoinsTrigger = useGameStore((s) => s.flyingCoinsTrigger);
  const lastSoldCount = useGameStore((s) => s.lastSoldCount);
  const cleanCoop = useGameStore((s) => s.cleanCoop);
  const cureHen = useGameStore((s) => s.cureHen);
  const sellAllEggs = useGameStore((s) => s.sellAllEggs);
  const advanceDay = useGameStore((s) => s.advanceDay);
  const setActiveSheet = useGameStore((s) => s.setActiveSheet);

  const [sunMoonSwap, setSunMoonSwap] = useState(false);

  const currentEggPrice = eggPrice(game.marketStock);
  const sickHensCount = game.hens.filter((h) => h.sickDays > 0).length;
  const canClean = game.balance >= CLEAN_COST && game.cleanliness < 100;
  const canCure = game.balance >= MEDICINE_COST && sickHensCount > 0;
  const canSell = game.eggs > 0 && game.npcBalance >= currentEggPrice;

  const classSavings = getClassSavingsTotal(game);
  const classGoalPct = Math.min(
    100,
    Math.round((classSavings / CLASS_GOAL_TARGET) * 100)
  );

  const highlightNextDay =
    game.tutorialStep === 1 ||
    game.tutorialStep === 2 ||
    (!canSell && sickHensCount === 0);
  const highlightSell = game.tutorialStep === 3 && game.eggs > 0;

  useEffect(() => {
    if (game.day > 1) {
      setSunMoonSwap(true);
      const t = setTimeout(() => setSunMoonSwap(false), 450);
      return () => clearTimeout(t);
    }
  }, [game.day]);

  return (
    <nav
      aria-label="Game Actions"
      className="sticky bottom-0 z-20 bg-coop-card border-t-2 border-[#3B2F2F] px-3 pt-2.5 pb-3 rounded-t-3xl space-y-2 shadow-[0_-4px_0_0_rgba(59,47,47,0.08)]"
    >
      {/* Curved Coin Arc Animation from Sell Eggs to TopBar Balance */}
      <CoinFly trigger={flyingCoinsTrigger} count={lastSoldCount} />

      {/* Top Row: Secondary Tactile Buttons (Clean, Medicine, Savings, Class Goal) */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={cleanCoop}
          disabled={!canClean}
          className="btn-game-secondary min-h-[54px] flex flex-col items-center justify-center px-1.5 py-1.5"
        >
          <BroomIcon className="w-5 h-5" />
          <span className="text-xs font-extrabold text-coop-text mt-0.5 leading-none">
            Clean
          </span>
          <span className="text-[10px] font-bold text-coop-muted mt-0.5">
            {CLEAN_COST} coins
          </span>
        </button>

        <button
          type="button"
          onClick={() => cureHen()}
          disabled={!canCure}
          className={`min-h-[54px] flex flex-col items-center justify-center px-1.5 py-1.5 ${
            sickHensCount > 0 ? 'btn-game-red animate-pulse' : 'btn-game-secondary'
          }`}
        >
          <MedicineIcon className="w-5 h-5" />
          <span className="text-xs font-extrabold mt-0.5 leading-none">
            Medicine
          </span>
          <span
            className={`text-[10px] font-bold mt-0.5 ${
              sickHensCount > 0 ? 'text-white/90' : 'text-coop-muted'
            }`}
          >
            {MEDICINE_COST} coins
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSheet('savings')}
          className="btn-game-secondary min-h-[54px] flex flex-col items-center justify-center px-1.5 py-1.5"
        >
          <JarIcon className="w-5 h-5" />
          <span className="text-xs font-extrabold text-coop-text mt-0.5 leading-none">
            Savings
          </span>
          <span className="text-[10px] font-extrabold text-coop-green mt-0.5">
            {Math.round(game.jar)} coins
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSheet('class_goal')}
          className="btn-game-secondary min-h-[54px] flex flex-col items-center justify-center px-1.5 py-1.5"
        >
          <TrophyIcon className="w-5 h-5" />
          <span className="text-xs font-extrabold text-coop-text mt-0.5 leading-none">
            Class Goal
          </span>
          <span className="text-[10px] font-bold text-coop-muted mt-0.5">
            {classGoalPct}%
          </span>
        </button>
      </div>

      {/* Bottom Row: Primary Egg Sale + Next Day */}
      <div className="grid grid-cols-5 gap-2.5">
        <button
          id="sell-eggs-btn"
          type="button"
          onClick={sellAllEggs}
          disabled={!canSell}
          className={`btn-game-green col-span-2 min-h-[56px] flex flex-col items-center justify-center px-3 py-2 ${
            highlightSell ? 'ring-4 ring-coop-green/40' : ''
          }`}
        >
          <div className="flex items-center gap-1.5 text-sm font-bold">
            <BasketIcon className="w-5 h-5" />
            <span>Sell ({game.eggs})</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-extrabold">
            <span>{currentEggPrice} coins/egg</span>
            {lastEggPriceDelta !== null && lastEggPriceDelta !== 0 && (
              <motion.span
                key={`${game.day}-${currentEggPrice}`}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.35 }}
                className="px-1 rounded bg-black/20 text-[10px]"
              >
                {lastEggPriceDelta > 0 ? 'UP' : 'DOWN'}
              </motion.span>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={advanceDay}
          className={`btn-game-primary col-span-3 min-h-[56px] flex items-center justify-center gap-2.5 px-4 py-2.5 text-lg ${
            highlightNextDay ? 'ring-4 ring-coop-yellow/45' : ''
          }`}
        >
          <motion.span
            animate={
              sunMoonSwap ? { rotate: [0, 180, 360], scale: [1, 1.2, 1] } : {}
            }
            transition={{ duration: 0.45 }}
            className="shrink-0"
          >
            {sunMoonSwap ? (
              <MoonIcon className="w-7 h-7" />
            ) : (
              <SunIcon className="w-7 h-7" />
            )}
          </motion.span>
          <div className="text-left leading-tight">
            <div>Next Day</div>
            <div className="text-xs font-body font-extrabold text-coop-text/80">
              Feed hens &amp; collect eggs
            </div>
          </div>
        </button>
      </div>
    </nav>
  );
}
