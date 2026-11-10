'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Hen as HenType } from '@/game/types';
import { MEDICINE_COST, SICK_DEATH_DAYS } from '@/game/constants';
import { ease } from '@/animation/tokens';
import { EggIcon, MedicineIcon } from './icons/GameIcons';

interface HenProps {
  hen: HenType;
  index: number;
  canAffordMedicine: boolean;
  isPecking: boolean;
  isHealed: boolean;
  onCure: (henId: string) => void;
}

export function Hen({
  hen,
  index,
  canAffordMedicine,
  isPecking,
  isHealed,
  onCure,
}: HenProps) {
  const reducedMotion = useReducedMotion();
  const isSick = hen.sickDays > 0;
  const daysLeftBeforeDeath = Math.max(1, SICK_DEATH_DAYS - hen.sickDays);

  return (
    <motion.div
      initial={{ y: -24, opacity: 0, scaleX: 1.05, scaleY: 0.95 }}
      animate={
        reducedMotion
          ? { y: 0, opacity: 1, scaleX: 1, scaleY: 1 }
          : isPecking
          ? {
              y: [0, 5, 0, 5, 0, 4, 0],
              opacity: 1,
              scaleX: 1,
              scaleY: 1,
            }
          : isSick
          ? {
              y: 0,
              opacity: 1,
              x: [0, -3, 3, -3, 3, 0],
              scaleX: 1,
              scaleY: 1,
            }
          : {
              y: 0,
              opacity: 1,
              rotate: [-2.5, 2.5, -2.5],
              scaleX: 1,
              scaleY: 1,
            }
      }
      exit={{ opacity: 0, y: -20 }}
      transition={
        isPecking
          ? { duration: 0.55 }
          : isSick
          ? {
              x: { duration: 0.45, repeat: Infinity, repeatDelay: 1.2 },
              default: ease.spring,
            }
          : {
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.35,
              },
              default: ease.spring,
            }
      }
      className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border-2 border-[#3B2F2F] shadow-[0_3px_0_0_#3B2F2F] transition ${
        isSick ? 'bg-coop-red/10' : 'bg-[#FFF6E5]'
      }`}
    >
      {/* Medicine Heal Floater */}
      <AnimatePresence>
        {isHealed && (
          <motion.span
            initial={{ opacity: 1, y: 4, scale: 0.8 }}
            animate={{ opacity: 0, y: -22, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="pointer-events-none absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded bg-coop-green text-white text-[10px] font-extrabold border border-[#3B2F2F]"
          >
            +CURED
          </motion.span>
        )}
      </AnimatePresence>

      {/* Nest Box Top Header */}
      <div className="w-full flex items-center justify-between text-xs font-bold mb-1">
        <span className="font-heading text-sm text-coop-text truncate">
          {hen.name || `Hen #${index + 1}`}
        </span>
        {isSick ? (
          <motion.span
            animate={reducedMotion ? {} : { scale: [1, 1.08, 1] }}
            transition={{ duration: 1.1, repeat: Infinity }}
            className="inline-flex items-center px-2 py-0.5 rounded-md bg-coop-red text-white text-[10px] font-extrabold uppercase border border-[#3B2F2F]"
            title={`Sick! Treat within ${daysLeftBeforeDeath} day(s)`}
          >
            Sick
          </motion.span>
        ) : !hen.fedToday ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-coop-yellow text-coop-text text-[10px] font-extrabold uppercase border border-[#3B2F2F]">
            Hungry
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-coop-green text-white text-[10px] font-extrabold uppercase border border-[#3B2F2F]">
            Healthy
          </span>
        )}
      </div>

      {/* Cozy Hen Nest Box Illustration */}
      <div
        className={`my-1 select-none relative flex items-center justify-center w-16 h-16 rounded-2xl border-2 border-[#3B2F2F]/25 ${
          isSick ? 'grayscale-[35%] bg-coop-red/15' : 'bg-coop-card'
        }`}
      >
        <svg
          viewBox="0 0 64 64"
          className="w-14 h-14"
          aria-label={isSick ? 'Sick hen' : 'Healthy hen'}
        >
          {/* Woven straw nest */}
          <ellipse
            cx="32"
            cy="52"
            rx="23"
            ry="6.5"
            fill="#E6A948"
            stroke="#3B2F2F"
            strokeWidth="2.2"
          />
          {/* Hen body */}
          <path
            d="M18 38 C18 24, 46 24, 46 38 C46 48, 38 52, 32 52 C24 52, 18 48, 18 38 Z"
            fill={isSick ? '#F2D0C9' : '#FFFFFF'}
            stroke="#3B2F2F"
            strokeWidth="2.6"
          />
          {/* Comb */}
          <path
            d="M27 24 C27 19, 31 19, 32 23 C33 18, 38 19, 37 24"
            fill="#E5604D"
            stroke="#3B2F2F"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Wing */}
          <path
            d="M25 36 C21 39, 23 45, 29 44"
            fill="none"
            stroke="#3B2F2F"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Eye */}
          {isSick ? (
            <path
              d="M36 31 L40 35 M40 31 L36 35"
              stroke="#E5604D"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ) : (
            <circle cx="38" cy="33" r="2.4" fill="#3B2F2F" />
          )}
          {/* Beak */}
          <polygon
            points="45,33 52,36 45,39"
            fill="#FFC83D"
            stroke="#3B2F2F"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Bottom Action or Egg Rate */}
      {isSick ? (
        <button
          type="button"
          onClick={() => onCure(hen.id)}
          disabled={!canAffordMedicine}
          className="btn-game-red mt-1 w-full min-h-[36px] px-2 py-1 text-xs flex items-center justify-center gap-1"
        >
          <MedicineIcon className="w-4 h-4" />
          <span>Cure ({MEDICINE_COST})</span>
        </button>
      ) : (
        <div className="mt-1 text-[11px] font-extrabold text-coop-text flex items-center gap-1 bg-coop-card px-2.5 py-0.5 rounded-lg border border-[#3B2F2F]/20">
          <EggIcon className="w-3.5 h-3.5" />
          <span>1 egg / day</span>
        </div>
      )}
    </motion.div>
  );
}
