'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { BADGE_DEFS } from '@/game/quests';
import {
  BadgeRibbonIcon,
  BroomIcon,
  EggIcon,
  GrainIcon,
  JarIcon,
  StarIcon,
  TrophyIcon,
} from './icons/GameIcons';

function renderBadgeVector(iconCode: string) {
  switch (iconCode) {
    case 'EGG':
      return <EggIcon className="w-6 h-6" />;
    case 'CLEAN':
      return <BroomIcon className="w-6 h-6" />;
    case 'JAR':
      return <JarIcon className="w-6 h-6" />;
    case 'GRAIN':
      return <GrainIcon className="w-6 h-6" />;
    case 'TROPHY':
      return <TrophyIcon className="w-6 h-6" />;
    case 'STAR':
      return <StarIcon className="w-6 h-6" filled />;
    default:
      return <BadgeRibbonIcon className="w-6 h-6" />;
  }
}

export function BadgesSheet() {
  const activeSheet = useGameStore((s) => s.activeSheet);
  const setActiveSheet = useGameStore((s) => s.setActiveSheet);
  const unlockedBadges = useGameStore((s) => s.unlockedBadges);
  const badgeToast = useGameStore((s) => s.badgeToast);
  const dismissBadgeToast = useGameStore((s) => s.dismissBadgeToast);

  const isOpen = activeSheet === 'badges';

  useEffect(() => {
    if (!badgeToast) return;
    const t = setTimeout(() => dismissBadgeToast(), 3000);
    return () => clearTimeout(t);
  }, [badgeToast, dismissBadgeToast]);

  return (
    <>
      {/* Badge Unlock Toast */}
      <AnimatePresence>
        {badgeToast && (
          <motion.div
            key={badgeToast.id}
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismissBadgeToast}
            className="game-card fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-coop-yellow border-2 border-[#3B2F2F] flex items-center justify-center">
              {renderBadgeVector(badgeToast.icon)}
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-coop-green">
                Badge Unlocked
              </div>
              <div className="font-heading text-sm font-bold text-coop-text">
                {badgeToast.name}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badges Collection Sheet */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-[2px]">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-[480px] bg-coop-card rounded-t-3xl p-5 shadow-xl border-t-4 border-[#3B2F2F] space-y-4 max-h-[82vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-coop-yellow/35 border-2 border-[#3B2F2F] flex items-center justify-center">
                    <BadgeRibbonIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-coop-text">
                      Farm Badges ({unlockedBadges.length}/{BADGE_DEFS.length})
                    </h3>
                    <p className="text-xs font-bold text-coop-muted">
                      Earn badges by practicing smart money and coop habits.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSheet(null)}
                  className="btn-game-secondary min-w-[42px] min-h-[42px]"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {BADGE_DEFS.map((b) => {
                  const unlocked = unlockedBadges.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      className={`p-3 rounded-2xl border-2 border-[#3B2F2F] flex items-center gap-3 ${
                        unlocked
                          ? 'bg-coop-yellow/20 shadow-[0_3px_0_0_#3B2F2F]'
                          : 'bg-coop-bg/60 opacity-55'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl border-2 border-[#3B2F2F] flex items-center justify-center shrink-0 ${
                          unlocked ? 'bg-coop-card' : 'grayscale bg-coop-bg'
                        }`}
                      >
                        {renderBadgeVector(b.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-heading text-base font-bold text-coop-text">
                            {b.name}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-coop-card border border-[#3B2F2F]/30 text-[10px] font-extrabold uppercase text-coop-text">
                            {unlocked ? 'Unlocked' : 'Locked'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-coop-muted">
                          {b.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
