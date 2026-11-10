'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { getDailyQuestsForDay } from '@/game/quests';
import { dur, ease } from '@/animation/tokens';
import { CheckBoxIcon, OwlAvatar, StarIcon } from './icons/GameIcons';

const TUTORIAL_HINTS: Record<number, string> = {
  1: 'Step 1 of 4: Press "Next Day" at the bottom to feed Clover and collect your first egg.',
  2: 'Step 2 of 4: Press "Next Day" one more time so you have 2 fresh eggs in your basket.',
  3: 'Step 3 of 4: Press "Sell Eggs" to sell your eggs to the town buyer for coins.',
  4: 'Step 4 of 4: Add a 2nd hen in the barn (with Guardian approval) or deposit coins into your Savings Jar.',
};

export function MentorBubble() {
  const mentorMessages = useGameStore((s) => s.mentorMessages);
  const tutorialStep = useGameStore((s) => s.game.tutorialStep);
  const day = useGameStore((s) => s.game.day);
  const completedQuestsToday = useGameStore((s) => s.completedQuestsToday);
  const askMentorTip = useGameStore((s) => s.askMentorTip);

  const tutorialHint = TUTORIAL_HINTS[tutorialStep];
  const dailyQuests = getDailyQuestsForDay(day, completedQuestsToday);

  return (
    <section aria-label="Farm Mentor and Daily Quests" className="space-y-2.5">
      {/* Mentor Speech Card */}
      <AnimatePresence mode="wait">
        <motion.button
          type="button"
          onClick={askMentorTip}
          key={`${day}-${mentorMessages.join('|')}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: dur.base, ease: ease.out }}
          className="w-full text-left bg-coop-blue/30 border-2 border-[#3B2F2F] shadow-[0_4px_0_0_#3B2F2F] rounded-3xl p-3.5 flex items-start gap-3 hover:bg-coop-blue/40 active:translate-y-[2px] active:shadow-[0_2px_0_0_#3B2F2F] transition-all"
        >
          <OwlAvatar className="w-11 h-11 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-coop-text">
                Professor Hoot • Mentor
              </span>
              <span className="px-2 py-0.5 rounded-md bg-coop-card border border-[#3B2F2F]/40 text-[10px] font-extrabold text-coop-text">
                Ask Tip
              </span>
            </div>
            <div className="space-y-1 text-sm font-bold text-coop-text leading-snug">
              {mentorMessages.map((msg, idx) => (
                <p key={idx}>{msg}</p>
              ))}
            </div>
          </div>
        </motion.button>
      </AnimatePresence>

      {/* First-Session Tutorial Banner */}
      {tutorialHint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-3.5 py-2 rounded-2xl bg-coop-yellow/40 border-2 border-[#3B2F2F] text-xs font-extrabold text-coop-text"
        >
          {tutorialHint}
        </motion.div>
      )}

      {/* Daily Quests Checklist */}
      <div className="game-card px-3.5 py-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-coop-muted">
          <span>Day {day} Goals</span>
          <span className="inline-flex items-center gap-1 text-coop-text">
            <span>+1</span>
            <StarIcon className="w-3.5 h-3.5" filled />
            <span>Reputation each</span>
          </span>
        </div>
        <div className="space-y-1">
          {dailyQuests.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between gap-2 text-xs font-bold"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CheckBoxIcon checked={q.completed} className="w-4 h-4 shrink-0" />
                <span
                  className={`truncate ${
                    q.completed
                      ? 'line-through text-coop-muted'
                      : 'text-coop-text'
                  }`}
                >
                  {q.label}
                </span>
              </div>
              {q.completed && (
                <span className="text-[10px] font-extrabold text-coop-green shrink-0">
                  +1 Rep
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
