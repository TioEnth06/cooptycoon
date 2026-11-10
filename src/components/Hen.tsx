'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Hen as HenType } from '@/game/types';
import { MEDICINE_COST, SICK_DEATH_DAYS } from '@/game/constants';

interface HenProps {
  hen: HenType;
  index: number;
  canAffordMedicine: boolean;
  onCure: (henId: string) => void;
}

export function Hen({ hen, index, canAffordMedicine, onCure }: HenProps) {
  const isSick = hen.sickDays > 0;
  const daysLeftBeforeDeath = Math.max(1, SICK_DEATH_DAYS - hen.sickDays);

  return (
    <motion.div
      layout
      initial={{ scale: 0.85, opacity: 0 }}
      animate={
        isSick
          ? {
              scale: 1,
              opacity: 1,
              x: [0, -4, 4, -3, 3, 0],
            }
          : {
              scale: 1,
              opacity: 1,
              rotate: [-3, 3, -3],
            }
      }
      transition={
        isSick
          ? { duration: 0.45 }
          : {
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.3,
              },
              scale: { duration: 0.25 },
            }
      }
      className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border-2 transition ${
        isSick
          ? 'bg-coop-red/10 border-coop-red shadow-sm'
          : 'bg-coop-bg/70 border-amber-200/80'
      }`}
    >
      {/* Status Badge (Top Right) */}
      <div className="w-full flex items-center justify-between text-xs font-bold mb-1">
        <span className="text-coop-muted truncate">
          {hen.name || `Hen #${index + 1}`}
        </span>
        {isSick ? (
          <span
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-coop-red text-white text-[11px] font-extrabold"
            title={`Sick! Treat within ${daysLeftBeforeDeath} day(s)`}
          >
            <span role="img" aria-label="Sick icon">
              🌡️
            </span>
            <span>Sick</span>
          </span>
        ) : !hen.fedToday ? (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-200 text-coop-text text-[11px] font-bold">
            Hungry
          </span>
        ) : (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-coop-green/20 text-coop-text text-[11px] font-bold">
            Happy
          </span>
        )}
      </div>

      {/* Cozy Hen Illustration (Inline SVG + Emoji) */}
      <div
        className={`my-1 select-none relative flex items-center justify-center w-14 h-14 rounded-full ${
          isSick ? 'grayscale-[40%] bg-coop-red/15' : 'bg-coop-yellow/25'
        }`}
      >
        <svg
          viewBox="0 0 64 64"
          className="w-12 h-12"
          aria-label={isSick ? 'Sick hen' : 'Healthy hen'}
        >
          {/* Nest straw */}
          <ellipse cx="32" cy="52" rx="22" ry="6" fill="#E6C27A" />
          {/* Body */}
          <path
            d="M18 38 C18 24, 46 24, 46 38 C46 48, 38 52, 32 52 C24 52, 18 48, 18 38 Z"
            fill={isSick ? '#F2D0C9' : '#FFFFFF'}
            stroke="#3B2F2F"
            strokeWidth="2.5"
          />
          {/* Comb */}
          <path
            d="M27 24 C27 19, 31 19, 32 23 C33 18, 38 19, 37 24"
            fill="#E5604D"
            stroke="#3B2F2F"
            strokeWidth="2"
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
            <circle cx="38" cy="33" r="2.3" fill="#3B2F2F" />
          )}
          {/* Beak */}
          <polygon
            points="45,33 52,36 45,39"
            fill="#FFC83D"
            stroke="#3B2F2F"
            strokeWidth="1.8"
          />
        </svg>
      </div>

      {/* Bottom Action or Egg Info */}
      {isSick ? (
        <button
          type="button"
          onClick={() => onCure(hen.id)}
          disabled={!canAffordMedicine}
          className="mt-1 w-full min-h-[38px] px-2 py-1 rounded-xl bg-coop-red text-white text-xs font-extrabold shadow-sm hover:opacity-95 active:scale-95 disabled:opacity-50 transition"
        >
          💊 Cure ({MEDICINE_COST})
        </button>
      ) : (
        <div className="mt-1 text-[12px] font-bold text-coop-muted flex items-center gap-1">
          <span role="img" aria-label="Egg">
            🥚
          </span>
          <span>1 egg / day</span>
        </div>
      )}
    </motion.div>
  );
}
