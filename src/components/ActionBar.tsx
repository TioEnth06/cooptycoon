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
      className="sticky bottom-0 z-20 bg-coop-card/95 backdrop-blur-md border-t-2 border-amber-200 px-3 pt-2.5 pb-3 shadow-lg rounded-t-3xl space-y-2"
    >
      {/* Curved Coin Arc Animation from Sell Eggs to TopBar Balance */}
      <CoinFly trigger={flyingCoinsTrigger} count={lastSoldCount} />

      {/* Top Row: Secondary Actions (Clean, Medicine, Savings, Class Goal) */}
      <div className="grid grid-cols-4 gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={cleanCoop}
          disabled={!canClean}
          className="min-h-[52px] flex flex-col items-center justify-center px-2 py-1.5 rounded-2xl bg-coop-bg hover:bg-amber-100 disabled:opacity-45 border border-amber-200 transition"
        >
          <span className="text-lg leading-none" role="img" aria-label="Clean">
            🧹
          </span>
          <span className="text-xs font-extrabold text-coop-text mt-0.5">
            Clean
          </span>
          <span className="text-[11px] font-bold text-coop-muted">
            {CLEAN_COST} coins
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => cureHen()}
          disabled={!canCure}
          className={`min-h-[52px] flex flex-col items-center justify-center px-2 py-1.5 rounded-2xl disabled:opacity-45 border transition ${
            sickHensCount > 0
              ? 'bg-coop-red text-white border-coop-red animate-pulse'
              : 'bg-coop-bg text-coop-text border-amber-200'
          }`}
        >
          <span
            className="text-lg leading-none"
            role="img"
            aria-label="Medicine"
          >
            💊
          </span>
          <span className="text-xs font-extrabold mt-0.5">Medicine</span>
          <span
            className={`text-[11px] font-bold ${
              sickHensCount > 0 ? 'text-white/90' : 'text-coop-muted'
            }`}
          >
            {MEDICINE_COST} coins
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setActiveSheet('savings')}
          className="min-h-[52px] flex flex-col items-center justify-center px-2 py-1.5 rounded-2xl bg-coop-bg hover:bg-amber-100 border border-amber-200 transition"
        >
          <span
            className="text-lg leading-none"
            role="img"
            aria-label="Savings Jar"
          >
            🏺
          </span>
          <span className="text-xs font-extrabold text-coop-text mt-0.5">
            Savings
          </span>
          <span className="text-[11px] font-bold text-coop-green">
            {Math.round(game.jar)} coins
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setActiveSheet('class_goal')}
          className="min-h-[52px] flex flex-col items-center justify-center px-2 py-1.5 rounded-2xl bg-coop-bg hover:bg-amber-100 border border-amber-200 transition"
        >
          <span
            className="text-lg leading-none"
            role="img"
            aria-label="Class Goal"
          >
            🏆
          </span>
          <span className="text-xs font-extrabold text-coop-text mt-0.5">
            Class Goal
          </span>
          <span className="text-[11px] font-bold text-coop-muted">
            {classGoalPct}%
          </span>
        </motion.button>
      </div>

      {/* Bottom Row: Primary Egg Sale + Next Day */}
      <div className="grid grid-cols-5 gap-2.5">
        <motion.button
          id="sell-eggs-btn"
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={sellAllEggs}
          disabled={!canSell}
          className={`col-span-2 min-h-[56px] flex flex-col items-center justify-center px-3 py-2 rounded-2xl border-2 font-heading transition disabled:opacity-50 ${
            highlightSell
              ? 'bg-coop-green text-white border-coop-green ring-4 ring-coop-green/30'
              : 'bg-coop-green/90 hover:bg-coop-green text-white border-coop-green'
          }`}
        >
          <div className="flex items-center gap-1 text-sm font-bold">
            <span role="img" aria-label="Sell Eggs">
              🧺
            </span>
            <span>Sell Eggs ({game.eggs})</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-extrabold">
            <span>{currentEggPrice} coins/egg</span>
            {lastEggPriceDelta !== null && lastEggPriceDelta !== 0 && (
              <motion.span
                key={`${game.day}-${currentEggPrice}`}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.35 }}
                className="px-1 rounded bg-white/25 text-[11px]"
              >
                {lastEggPriceDelta > 0 ? '▲' : '▼'}
              </motion.span>
            )}
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={advanceDay}
          className={`col-span-3 min-h-[56px] flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl bg-coop-yellow hover:brightness-105 text-coop-text font-heading text-lg font-bold shadow-md border-2 border-amber-400 transition ${
            highlightNextDay ? 'ring-4 ring-coop-yellow/40' : ''
          }`}
        >
          <motion.span
            animate={
              sunMoonSwap ? { rotate: [0, 180, 360], scale: [1, 1.25, 1] } : {}
            }
            transition={{ duration: 0.45 }}
            className="text-2xl leading-none"
            role="img"
            aria-label="Next Day"
          >
            {sunMoonSwap ? '🌙' : '☀️'}
          </motion.span>
          <div className="text-left leading-tight">
            <div>Next Day</div>
            <div className="text-xs font-body font-extrabold text-coop-text/80">
              Feed hens &amp; collect eggs
            </div>
          </div>
        </motion.button>
      </div>
    </nav>
  );
}
