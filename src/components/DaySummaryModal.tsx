'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export function DaySummaryModal() {
  const daySummary = useGameStore((s) => s.daySummary);
  const dismissDaySummary = useGameStore((s) => s.dismissDaySummary);
  const daySequenceStep = useGameStore((s) => s.daySequenceStep);

  // Wait until the brief Next Day sequence finishes (or is skipped)
  const visible = Boolean(daySummary) && daySequenceStep === 0;

  return (
    <AnimatePresence>
      {visible && daySummary && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/35 backdrop-blur-[1px]">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-[480px] bg-coop-card rounded-t-3xl p-5 shadow-2xl border-t-4 border-coop-yellow space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="font-heading text-lg font-bold text-coop-text">
                    Day {daySummary.day} Summary
                  </h3>
                  <p className="text-xs font-bold text-coop-muted">
                    {daySummary.eggsProduced} fresh{' '}
                    {daySummary.eggsProduced === 1 ? 'egg' : 'eggs'} collected
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={dismissDaySummary}
                className="min-w-[40px] min-h-[40px] rounded-2xl bg-coop-bg font-bold text-coop-text"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-coop-bg p-2.5 rounded-2xl border border-amber-200">
                <div className="text-[11px] font-bold uppercase text-coop-muted">
                  Egg Value
                </div>
                <div className="font-heading text-base font-bold text-coop-green">
                  +{daySummary.income}
                </div>
              </div>
              <div className="bg-coop-bg p-2.5 rounded-2xl border border-amber-200">
                <div className="text-[11px] font-bold uppercase text-coop-muted">
                  Costs
                </div>
                <div className="font-heading text-base font-bold text-coop-red">
                  -{daySummary.costs}
                </div>
              </div>
              <div className="bg-coop-bg p-2.5 rounded-2xl border border-amber-200">
                <div className="text-[11px] font-bold uppercase text-coop-muted">
                  Net Result
                </div>
                <div
                  className={`font-heading text-base font-bold ${
                    daySummary.profit >= 0 ? 'text-coop-green' : 'text-coop-red'
                  }`}
                >
                  {daySummary.profit >= 0
                    ? `+${daySummary.profit}`
                    : daySummary.profit}{' '}
                  coins
                </div>
              </div>
            </div>

            <div className="bg-coop-blue/20 border border-coop-blue rounded-2xl p-3 flex items-start gap-2.5 text-xs font-bold text-coop-text">
              <span className="text-xl">🦉</span>
              <p>{daySummary.mentorLine}</p>
            </div>

            <button
              type="button"
              onClick={dismissDaySummary}
              className="w-full min-h-[48px] rounded-2xl bg-coop-yellow text-coop-text font-heading text-base font-bold shadow-sm hover:brightness-105 active:scale-95 transition"
            >
              Continue Day {daySummary.day + 1} →
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
