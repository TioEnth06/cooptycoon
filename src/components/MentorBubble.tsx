'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { getDailyQuestsForDay } from '@/game/quests';
import { dur, ease } from '@/animation/tokens';

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
  const completedQuestsToday = useGameStore((s) => s.completedQuestsToday);
  const askMentorTip = useGameStore((s) => s.askMentorTip);

  const tutorialHint = TUTORIAL_HINTS[tutorialStep];
  const dailyQuests = getDailyQuestsForDay(day, completedQuestsToday);

  return (
    <section aria-label="AI Farm Mentor & Daily Quests" className="space-y-2.5">
      {/* Mentor Bubble (Tappable to ask Professor Hoot a tip & complete daily quest) */}
      <AnimatePresence mode="wait">
        <motion.button
          type="button"
          onClick={askMentorTip}
          whileTap={{ scale: 0.98 }}
          key={`${day}-${mentorMessages.join('|')}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: dur.base, ease: ease.out }}
          className="w-full text-left relative bg-coop-blue/25 border-2 border-coop-blue rounded-3xl p-3.5 shadow-sm flex items-start gap-3 hover:bg-coop-blue/30 transition"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.45 }}
            className="w-11 h-11 rounded-2xl bg-coop-blue flex items-center justify-center text-2xl shrink-0 shadow-sm"
          >
            <span role="img" aria-label="Barn Owl Mentor">
              🦉
            </span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-coop-text">
                Professor Hoot • Farm Mentor
              </span>
              <span className="text-[10px] font-extrabold text-coop-muted">
                Tap for tip 💬
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

      {/* Daily Quests Card (3 per day, deterministic, rewards +1 Reputation each) */}
      <div className="bg-coop-card rounded-2xl px-3.5 py-2.5 border border-amber-200 shadow-sm space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-coop-muted">
          <span>📋 Day {day} Quests</span>
          <span className="text-coop-text">+1 ⭐ Reputation each</span>
        </div>
        <div className="space-y-1">
          {dailyQuests.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between gap-2 text-xs font-bold"
            >
              <div className="flex items-center gap-2 min-w-0">
                <motion.span
                  key={`${q.id}-${q.completed}`}
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  transition={ease.spring}
                  className="text-sm"
                >
                  {q.completed ? '✅' : '⬜'}
                </motion.span>
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
                  +1 ⭐
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
