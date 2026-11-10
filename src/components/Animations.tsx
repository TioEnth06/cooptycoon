'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { dur, ease } from '@/animation/tokens';
import {
  CoinIcon,
  EggIcon,
  GrainIcon,
  OwlAvatar,
  StarIcon,
  SunIcon,
} from './icons/GameIcons';

/**
 * <CoinFly />: Measures getBoundingClientRect() of `#sell-eggs-btn` (or `#coop-card`)
 * and `#coin-balance-box`, then animates up to 6 staggered vector coins along a curved path.
 */
export function CoinFly({
  trigger,
  count = 4,
}: {
  trigger: number;
  count?: number;
}) {
  const reducedMotion = useReducedMotion();
  const [flight, setFlight] = useState<{
    key: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    coins: number;
  } | null>(null);

  useEffect(() => {
    if (!trigger || reducedMotion) return;
    const sourceEl =
      document.getElementById('sell-eggs-btn') ||
      document.getElementById('coop-card');
    const targetEl = document.getElementById('coin-balance-box');

    const startRect = sourceEl?.getBoundingClientRect();
    const endRect = targetEl?.getBoundingClientRect();

    const startX = startRect
      ? startRect.left + startRect.width / 2
      : window.innerWidth / 2 - 60;
    const startY = startRect
      ? startRect.top + startRect.height / 2
      : window.innerHeight - 90;

    const endX = endRect ? endRect.left + endRect.width / 2 : 70;
    const endY = endRect ? endRect.top + endRect.height / 2 : 36;

    const coins = Math.min(6, Math.max(2, count));
    setFlight({ key: trigger, startX, startY, endX, endY, coins });

    const timer = setTimeout(() => setFlight(null), 950);
    return () => clearTimeout(timer);
  }, [trigger, count, reducedMotion]);

  if (!flight || reducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: flight.coins }).map((_, idx) => {
        const midX =
          (flight.startX + flight.endX) / 2 + (idx % 2 === 0 ? -42 : 42);
        const midY = Math.min(flight.startY, flight.endY) - 45;
        return (
          <motion.div
            key={`${flight.key}-${idx}`}
            initial={{
              x: flight.startX,
              y: flight.startY,
              scale: 0.7,
              opacity: 1,
            }}
            animate={{
              x: [flight.startX, midX, flight.endX],
              y: [flight.startY, midY, flight.endY],
              scale: [0.8, 1.25, 0.75],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 0.7,
              delay: idx * 0.06,
              ease: ease.out,
            }}
            className="fixed top-0 left-0 -ml-3.5 -mt-3.5 select-none"
          >
            <CoinIcon className="w-7 h-7" />
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * <Confetti />: 24 vector confetti shapes & stars with randomized x, rotate, y keyframes.
 */
const CONFETTI_COLORS = ['#FFC83D', '#6BBF59', '#E5604D', '#7CC4F0'];

export function Confetti() {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 24 }).map((_, idx) => {
        const color = CONFETTI_COLORS[idx % CONFETTI_COLORS.length];
        const startX = (idx / 24) * 92 + 4;
        const driftX = (idx % 2 === 0 ? 1 : -1) * (10 + (idx % 5) * 6);
        const peakY = 8 + (idx % 4) * 10;
        const rot = (idx % 2 === 0 ? 1 : -1) * (90 + idx * 12);

        return (
          <motion.div
            key={idx}
            initial={{
              opacity: 1,
              x: `${startX}vw`,
              y: '55vh',
              scale: 0.4,
              rotate: 0,
            }}
            animate={{
              opacity: [1, 1, 0],
              x: [`${startX}vw`, `${startX + driftX * 0.4}vw`],
              y: ['55vh', `${peakY}vh`, '88vh'],
              scale: [0.5, 1.2, 0.85],
              rotate: [0, rot],
            }}
            transition={{
              duration: 1.35,
              delay: (idx % 6) * 0.04,
              ease: ease.out,
            }}
            className="fixed top-0 left-0 select-none"
          >
            {idx % 3 === 0 ? (
              <StarIcon className="w-6 h-6" filled />
            ) : (
              <span
                style={{ backgroundColor: color }}
                className="block w-3.5 h-3.5 rounded-sm border-2 border-[#3B2F2F]"
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * <Stars />: Level-complete vector stars appear one by one (200ms stagger, spring).
 */
export function Stars({
  count,
  size = 'lg',
}: {
  count: number;
  size?: 'sm' | 'lg';
}) {
  const iconSize = size === 'lg' ? 'w-10 h-10' : 'w-5 h-5';
  return (
    <div
      className="inline-flex items-center gap-2"
      aria-label={`${count} of 3 stars`}
    >
      {[1, 2, 3].map((starIdx) => {
        const earned = starIdx <= count;
        return (
          <motion.span
            key={starIdx}
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{
              ...ease.spring,
              delay: (starIdx - 1) * 0.2,
            }}
            className="select-none"
          >
            <StarIcon className={iconSize} filled={earned} />
          </motion.span>
        );
      })}
    </div>
  );
}

/**
 * <AmbientScene />: Subtle vector clouds & grass tuft above the barn roof.
 */
export function AmbientScene() {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative w-full h-6 overflow-hidden select-none"
    >
      <motion.svg
        viewBox="0 0 48 20"
        animate={{ x: [-20, 360, -20] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0.5 left-2 w-10 h-4 opacity-70"
      >
        <path
          d="M8 16H38C41.3 16 44 13.5 44 10.5C44 7.8 41.8 5.6 39 5.2C37.5 2.2 34.2 0.5 30.5 0.5C25.8 0.5 21.8 3.6 20.6 7.8C19.5 7.3 18.2 7 16.8 7C12 7 8 10.8 8 16Z"
          fill="#FFFFFF"
          stroke="#3B2F2F"
          strokeWidth="2"
        />
      </motion.svg>

      <motion.svg
        viewBox="0 0 48 20"
        animate={{ x: [310, -20, 310] }}
        transition={{ duration: 75, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1 left-8 w-8 h-3.5 opacity-55"
      >
        <path
          d="M8 16H38C41.3 16 44 13.5 44 10.5C44 7.8 41.8 5.6 39 5.2C37.5 2.2 34.2 0.5 30.5 0.5C25.8 0.5 21.8 3.6 20.6 7.8C19.5 7.3 18.2 7 16.8 7C12 7 8 10.8 8 16Z"
          fill="#FFFFFF"
          stroke="#3B2F2F"
          strokeWidth="2"
        />
      </motion.svg>
    </div>
  );
}

/**
 * <DayCycleOverlay />: Sequenced Next Day playback banner (skippable by tapping anywhere).
 */
export function DayCycleOverlay({
  step,
  dayNumber,
  feedCost,
  eggsProduced,
  onSkip,
}: {
  step: number;
  dayNumber: number;
  feedCost: number;
  eggsProduced: number;
  onSkip: () => void;
}) {
  return (
    <AnimatePresence>
      {step > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: dur.fast }}
          onClick={onSkip}
          title="Tap anywhere to skip animation"
          className="fixed inset-0 z-30 bg-amber-950/15 backdrop-blur-[1px] flex flex-col items-center justify-start pt-20 cursor-pointer select-none"
        >
          <motion.div
            key={step}
            initial={{ y: -12, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: dur.base, ease: ease.out }}
            className="game-card px-4 py-2.5 flex items-center gap-2.5 text-sm font-heading font-bold text-coop-text"
          >
            {step === 1 && (
              <>
                <SunIcon className="w-6 h-6" />
                <span>Dawn of Day {dayNumber}</span>
              </>
            )}
            {step === 2 && (
              <>
                <GrainIcon className="w-5 h-5" />
                <span>
                  Feeding flock (
                  {feedCost > 0 ? `-${feedCost} coins` : 'Hungry'})
                </span>
              </>
            )}
            {step === 3 && (
              <>
                <EggIcon className="w-5 h-5" />
                <span>
                  {eggsProduced > 0
                    ? `+${eggsProduced} fresh ${
                        eggsProduced === 1 ? 'egg' : 'eggs'
                      } laid`
                    : 'No new eggs today'}
                </span>
              </>
            )}
            {step === 4 && (
              <>
                <OwlAvatar className="w-6 h-6" />
                <span>Professor Hoot is reviewing your coop...</span>
              </>
            )}
            <span className="ml-2 text-[10px] font-body font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-coop-bg border border-[#3B2F2F]/30 text-coop-muted">
              Skip
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
