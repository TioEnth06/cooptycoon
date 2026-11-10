'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GUARDIAN_THRESHOLD, HEN_PRICE } from '@/game/constants';

export function ApprovalModal() {
  const pendingApproval = useGameStore((s) => s.game.pendingApproval);
  const approveBuyHen = useGameStore((s) => s.approveBuyHen);
  const cancelBuyHen = useGameStore((s) => s.cancelBuyHen);

  const [approving, setApproving] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveBuyHen();
    } finally {
      setApproving(false);
    }
  };

  return (
    <AnimatePresence>
      {pendingApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-[420px] bg-coop-card rounded-3xl p-5 shadow-xl border-4 border-coop-blue space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-coop-blue/30 flex items-center justify-center text-2xl">
                <span role="img" aria-label="Guardian Shield">
                  🛡️
                </span>
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-coop-text">
                  Guardian Approval Needed
                </h3>
                <p className="text-xs font-bold text-coop-muted">
                  Request #{pendingApproval.proposalId} • Big Purchase (&ge; {GUARDIAN_THRESHOLD} coins)
                </p>
              </div>
            </div>

            <div className="bg-coop-bg rounded-2xl p-3.5 border border-amber-200 space-y-1.5 text-sm font-semibold text-coop-text">
              <div className="flex items-center justify-between">
                <span>Item requested:</span>
                <span className="font-extrabold">🐔 1 Healthy Hen</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cost:</span>
                <span className="font-extrabold">{HEN_PRICE} coins</span>
              </div>
              <p className="text-xs text-coop-muted pt-1">
                In Coop Tycoon, purchases of {GUARDIAN_THRESHOLD} coins or more require a parent or teacher guardian to approve the request.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={approving}
                onClick={handleApprove}
                className="w-full min-h-[52px] rounded-2xl bg-coop-green text-white font-heading text-base font-bold shadow-md hover:opacity-95 active:scale-95 disabled:opacity-50 transition"
              >
                {approving
                  ? 'Approving...'
                  : '✅ Approve as Guardian (Demo)'}
              </button>
              <button
                type="button"
                disabled={approving}
                onClick={cancelBuyHen}
                className="w-full min-h-[46px] rounded-2xl bg-coop-bg text-coop-muted font-heading text-sm font-bold hover:bg-amber-100 transition"
              >
                Cancel Request
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
