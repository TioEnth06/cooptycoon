'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

const TUTORIAL_HINTS: Record<number, string> = {
  1: 'Step 1 of 4: Tap "Next Day" at the bottom to feed Clover and collect your first egg!',
  2: 'Step 2 of 4: Great! Tap "Next Day" one more time so you have 2 fresh eggs to sell.',
  3: 'Step 3 of 4: Now tap "Sell Eggs" to sell your eggs to the town buyer for coins!',
  4: 'Step 4 of 4: Try buying a 2nd hen in the coop (needs Guardian approval) or put coins in your Savings Jar!',
};

export function MentorBubble() {
  const mentorMessages = useGameStore((s) => s.mentorMessages);
  const tutorialStep = useGameStore((s) => s.game.tutorialStep);
  const day = useGameStore((s) => s.game.day);

  const tutorialHint = TUTORIAL_HINTS[tutorialStep];

  return (
    <section aria-label="AI Farm Mentor" className="space-y-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${day}-${mentorMessages.join('|')}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          className="relative bg-coop-blue/25 border-2 border-coop-blue rounded-3xl p-3.5 shadow-sm flex items-start gap-3"
        >
          <div className="w-11 h-11 rounded-2xl bg-coop-blue flex items-center justify-center text-2xl shrink-0 shadow-sm">
            <span role="img" aria-label="Barn Owl Mentor">
              🦉
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-coop-text">
                Professor Hoot • Farm Mentor
              </span>
            </div>
            <div className="space-y-1 text-sm font-bold text-coop-text leading-snug">
              {mentorMessages.map((msg, idx) => (
                <p key={idx}>{msg}</p>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Friendly First-Session Tutorial Banner */}
      {tutorialHint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-3.5 py-2 rounded-2xl bg-coop-yellow/35 border border-coop-yellow text-xs font-extrabold text-coop-text flex items-center gap-2"
        >
          <span role="img" aria-label="Sparkles">
            ✨
          </span>
          <span>{tutorialHint}</span>
        </motion.div>
      )}
    </section>
  );
}
