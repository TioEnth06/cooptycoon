'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { BADGE_DEFS } from '@/game/quests';

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
      {/* Badge Unlock Toast (slides from top, auto-dismiss 3s) */}
      <AnimatePresence>
        {badgeToast && (
          <motion.div
            key={badgeToast.id}
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismissBadgeToast}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-coop-card border-2 border-coop-yellow px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 cursor-pointer"
          >
            <span className="text-2xl">{badgeToast.icon}</span>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-coop-green">
                🏅 Badge Unlocked!
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
              className="w-full max-w-[480px] bg-coop-card rounded-t-3xl p-5 shadow-xl border-t-4 border-coop-yellow space-y-4 max-h-[82vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">🏅</span>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-coop-text">
                      Farm Badges ({unlockedBadges.length}/{BADGE_DEFS.length})
                    </h3>
                    <p className="text-xs font-bold text-coop-muted">
                      Earn badges by practicing smart money &amp; coop habits!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSheet(null)}
                  className="min-w-[44px] min-h-[44px] rounded-2xl bg-coop-bg font-bold text-coop-text"
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
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 ${
                        unlocked
                          ? 'bg-coop-yellow/20 border-coop-yellow'
                          : 'bg-coop-bg/60 border-amber-200/60 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                          unlocked ? 'bg-coop-card shadow-sm' : 'grayscale bg-coop-bg'
                        }`}
                      >
                        {b.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-heading text-base font-bold text-coop-text">
                            {b.name}
                          </span>
                          <span className="text-[11px] font-extrabold uppercase text-coop-muted">
                            {unlocked ? '✅ Unlocked' : '🔒 Locked'}
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
