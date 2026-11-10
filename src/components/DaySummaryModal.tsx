'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { OwlAvatar, SunIcon } from './icons/GameIcons';

export function DaySummaryModal() {
  const daySummary = useGameStore((s) => s.daySummary);
  const dismissDaySummary = useGameStore((s) => s.dismissDaySummary);
  const daySequenceStep = useGameStore((s) => s.daySequenceStep);

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
            className="w-full max-w-[480px] bg-coop-card rounded-t-3xl p-5 shadow-2xl border-t-4 border-[#3B2F2F] space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-coop-yellow/35 border-2 border-[#3B2F2F] flex items-center justify-center">
                  <SunIcon className="w-6 h-6" />
                </div>
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
                className="btn-game-secondary min-w-[40px] min-h-[40px]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-coop-bg p-2.5 rounded-2xl border-2 border-[#3B2F2F]">
                <div className="text-[10px] font-extrabold uppercase text-coop-muted">
                  Egg Value
                </div>
                <div className="font-heading text-base font-bold text-coop-green">
                  +{daySummary.income}
                </div>
              </div>
              <div className="bg-coop-bg p-2.5 rounded-2xl border-2 border-[#3B2F2F]">
                <div className="text-[10px] font-extrabold uppercase text-coop-muted">
                  Costs
                </div>
                <div className="font-heading text-base font-bold text-coop-red">
                  -{daySummary.costs}
                </div>
              </div>
              <div className="bg-coop-bg p-2.5 rounded-2xl border-2 border-[#3B2F2F]">
                <div className="text-[10px] font-extrabold uppercase text-coop-muted">
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

            <div className="bg-coop-blue/25 border-2 border-[#3B2F2F] rounded-2xl p-3 flex items-start gap-2.5 text-xs font-bold text-coop-text">
              <OwlAvatar className="w-9 h-9 shrink-0" />
              <p>{daySummary.mentorLine}</p>
            </div>

            <button
              type="button"
              onClick={dismissDaySummary}
              className="btn-game-primary w-full min-h-[48px] text-base"
            >
              Continue Day {daySummary.day + 1} →
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
