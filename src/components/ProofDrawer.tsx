'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

type ChainStatusInfo = {
  mode: string;
  network: string;
  tokenContract: string;
  daoContract: string;
  explorerUrl: string;
};

export function ProofDrawer() {
  const showProofDrawer = useGameStore((s) => s.showProofDrawer);
  const setShowProofDrawer = useGameStore((s) => s.setShowProofDrawer);
  const proofs = useGameStore((s) => s.proofs);
  const accountId = useGameStore((s) => s.accountId);
  const authMethod = useGameStore((s) => s.authMethod);
  const resetDemo = useGameStore((s) => s.resetDemo);
  const logout = useGameStore((s) => s.logout);

  const [statusInfo, setStatusInfo] = useState<ChainStatusInfo | null>(null);

  useEffect(() => {
    if (!showProofDrawer) return;
    fetch(`/api/chain/status?accountId=${encodeURIComponent(accountId || '')}`)
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          setStatusInfo({
            mode: d.mode || 'mock',
            network: d.network || 'testnet',
            tokenContract: d.tokenContract || 'coop-coin-7158.testnet',
            daoContract: d.daoContract || 'coop-class-7158.sputnikv2.testnet',
            explorerUrl: d.explorerUrl || 'https://testnet.nearblocks.io',
          });
        }
      })
      .catch(() => {});
  }, [showProofDrawer, accountId]);

  return (
    <AnimatePresence>
      {showProofDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px]">
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-[420px] h-full bg-coop-card p-5 shadow-2xl flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <div>
                  <h3 className="font-heading text-xl font-bold text-coop-text">
                    Powered by NEAR testnet
                  </h3>
                  <p className="text-xs font-bold text-coop-muted">
                    Mode:{' '}
                    <span className="uppercase font-extrabold text-coop-text">
                      {statusInfo?.mode || 'mock'}
                    </span>{' '}
                    • Login: <span className="uppercase">{authMethod}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProofDrawer(false)}
                  aria-label="Close Proof Drawer"
                  className="min-w-[44px] min-h-[44px] rounded-2xl bg-coop-bg font-bold text-coop-text"
                >
                  ✕
                </button>
              </div>

              {/* Deployed Testnet Contracts Info */}
              <div className="bg-coop-bg rounded-2xl p-3 border border-amber-200 text-xs space-y-1.5">
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-coop-muted">Player ID:</span>
                  <span className="font-mono font-bold text-coop-text truncate">
                    {accountId || 'guest.coop.testnet'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-coop-muted">$COOP NEP-141:</span>
                  <a
                    href="https://testnet.nearblocks.io/address/coop-coin-7158.testnet"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono font-bold text-coop-text underline"
                  >
                    coop-coin-7158.testnet
                  </a>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-coop-muted">Sputnik DAO:</span>
                  <a
                    href="https://testnet.nearblocks.io/address/coop-class-7158.sputnikv2.testnet"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono font-bold text-coop-text underline truncate"
                  >
                    coop-class-7158.sputnikv2.testnet
                  </a>
                </div>
              </div>

              {/* Proofs List */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold uppercase text-coop-muted">
                  Session Transaction Proofs ({proofs.length})
                </div>

                {proofs.length === 0 ? (
                  <p className="text-xs font-semibold text-coop-muted bg-coop-bg p-3 rounded-2xl">
                    Play a day, sell eggs, or request a hen purchase to see transaction proofs here.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {proofs.map((p, idx) => (
                      <div
                        key={`${p.txId}-${idx}`}
                        className="p-3 rounded-2xl bg-coop-bg border border-amber-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-coop-text">
                            {p.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              p.status === 'confirmed'
                                ? 'bg-coop-green/25 text-coop-text'
                                : p.status === 'pending'
                                ? 'bg-coop-yellow/40 text-coop-text'
                                : 'bg-coop-blue/30 text-coop-text'
                            }`}
                          >
                            {p.status || 'mock'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-coop-muted">
                          <span className="font-mono truncate max-w-[200px]">
                            tx: {p.txId}
                          </span>
                          {p.url && (
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-extrabold text-coop-text underline"
                            >
                              Explorer ↗
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-amber-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetDemo();
                    setShowProofDrawer(false);
                  }}
                  className="min-h-[42px] rounded-2xl bg-coop-bg hover:bg-amber-100 border border-amber-300 text-xs font-extrabold text-coop-text"
                >
                  🔄 Reset Game
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="min-h-[42px] rounded-2xl bg-coop-red/10 hover:bg-coop-red/20 border border-coop-red/40 text-xs font-extrabold text-coop-red"
                >
                  🚪 Switch Account
                </button>
              </div>
              <p className="text-center text-xs font-bold text-coop-muted">
                Virtual coins for learning. No real money.
              </p>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
