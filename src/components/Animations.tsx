'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { dur, ease } from '@/animation/tokens';

/**
 * <CoinFly />: Measures getBoundingClientRect() of `#sell-eggs-btn` (or `#coop-card`)
 * and `#coin-balance-box`, then animates up to 6 staggered coins along a curved path.
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
            className="fixed top-0 left-0 -ml-3 -mt-3 text-2xl select-none"
          >
            🪙
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * <Confetti />: 24 absolutely positioned emoji spans with randomized x, rotate, y keyframes.
 * No canvas library, pure transform & opacity, disabled when prefers-reduced-motion.
 */
const CONFETTI_POOL = ['🎉', '🪙', '🐔', '🥚', '🌟', '🏆', '✨', '🎊'];

export function Confetti() {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 24 }).map((_, idx) => {
        const emoji = CONFETTI_POOL[idx % CONFETTI_POOL.length];
        const startX = (idx / 24) * 92 + 4;
        const driftX = (idx % 2 === 0 ? 1 : -1) * (10 + (idx % 5) * 6);
        const peakY = 8 + (idx % 4) * 10;
        const rot = (idx % 2 === 0 ? 1 : -1) * (90 + idx * 12);

        return (
          <motion.span
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
              scale: [0.5, 1.25, 0.85],
              rotate: [0, rot],
            }}
            transition={{
              duration: 1.35,
              delay: (idx % 6) * 0.04,
              ease: ease.out,
            }}
            className="fixed top-0 left-0 text-2xl select-none"
          >
            {emoji}
          </motion.span>
        );
      })}
    </div>
  );
}

/**
 * <Stars />: Level-complete stars appear one by one (200ms stagger, spring).
 */
export function Stars({ count, size = 'lg' }: { count: number; size?: 'sm' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'text-4xl' : 'text-base';
  return (
    <div className="inline-flex items-center gap-1.5" aria-label={`${count} of 3 stars`}>
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
            className={`${sizeClass} select-none ${
              earned ? ' opacity-100' : 'grayscale opacity-30'
            }`}
          >
            ⭐
          </motion.span>
        );
      })}
    </div>
  );
}

/**
 * <AmbientScene /> (P2): Drifting clouds (60s loop), swaying grass, and occasional butterfly.
 * Respects prefers-reduced-motion.
 */
export function AmbientScene() {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative w-full h-7 overflow-hidden select-none -mb-2"
    >
      <motion.span
        animate={{ x: [-20, 380, -20] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 left-2 text-lg opacity-60"
      >
        ☁️
      </motion.span>
      <motion.span
        animate={{ x: [320, -30, 320] }}
        transition={{ duration: 75, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1 left-8 text-sm opacity-50"
      >
        ☁️
      </motion.span>
      <motion.span
        animate={{ x: [40, 260, 40], y: [2, -3, 2] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1 left-12 text-xs opacity-75"
      >
        🦋
      </motion.span>
      <motion.span
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 right-4 text-xs opacity-70"
      >
        🌱🌾
      </motion.span>
    </div>
  );
}

/**
 * <DayCycleOverlay />: Sequenced Next Day playback banner (skippable by tapping anywhere).
 * Plays: 1. Day cycle (sun/moon) -> 2. Hens peck -> 3. Eggs pop -> 4. Events -> 5. Mentor
 */
export function DayCycleOverlay({
  step,
  dayNumber,
  feedCost,
  eggsProduced,
  onSkip,
}: {
  step: number; // 0 = inactive, 1 = sun/moon, 2 = peck, 3 = eggs, 4 = events
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
            className="bg-coop-card border-2 border-coop-yellow px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2.5 text-sm font-heading font-bold text-coop-text"
          >
            {step === 1 && (
              <>
                <span className="text-xl">🌅</span>
                <span>Dawn of Day {dayNumber}...</span>
              </>
            )}
            {step === 2 && (
              <>
                <span className="text-xl">🌾🐔</span>
                <span>
                  Feeding flock ({feedCost > 0 ? `-${feedCost} coins` : 'Hungry!'})
                </span>
              </>
            )}
            {step === 3 && (
              <>
                <span className="text-xl">🥚✨</span>
                <span>
                  {eggsProduced > 0
                    ? `+${eggsProduced} fresh ${eggsProduced === 1 ? 'egg' : 'eggs'} laid!`
                    : 'No new eggs today'}
                </span>
              </>
            )}
            {step === 4 && (
              <>
                <span className="text-xl">🦉</span>
                <span>Professor Hoot is checking your coop...</span>
              </>
            )}
            <span className="ml-2 text-[10px] font-body font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-coop-bg text-coop-muted">
              Tap to skip
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
