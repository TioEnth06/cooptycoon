'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TxProof } from '@/chain/adapter';
import {
  DEMO_SEED,
  HEN_PRICE,
  MAX_HENS,
  SEASON_BONUS_MINT,
  STARTER_GRANT,
} from '@/game/constants';
import {
  cleanCoopAction,
  createInitialGameState,
  cureHenAction,
  depositToJar,
  nextDay,
  withdrawFromJar,
} from '@/game/engine';
import { eggPrice, sell } from '@/game/market';
import { GameState } from '@/game/types';

const HEN_NAMES = ['Clover', 'Sunny', 'pip', 'Daisy', 'Nugget'];

type ToastNotice = {
  id: string;
  text: string;
  tone: 'info' | 'success' | 'warning';
};

export interface GameStore {
  // Player session
  loggedIn: boolean;
  nickname: string;
  accountId: string;

  // Game state
  game: GameState;
  mentorMessages: string[];
  proofs: TxProof[];

  // UI transient state
  lastBalanceDelta: number | null;
  lastEggPriceDelta: number | null;
  lastProducedEggs: number;
  flyingCoinsTrigger: number;
  dayTransitionTrigger: number;
  showCelebration: boolean;
  activeSheet: 'savings' | 'class_goal' | null;
  showProofDrawer: boolean;
  toast: ToastNotice | null;

  // Actions
  loginGuest: (nickname: string) => Promise<void>;
  advanceDay: () => void;
  fastForwardDays: (days?: number) => void;
  cleanCoop: () => void;
  cureHen: (henId?: string) => void;
  sellAllEggs: () => void;
  requestBuyHen: () => Promise<void>;
  approveBuyHen: () => Promise<void>;
  cancelBuyHen: () => void;
  depositJar: (amount: number) => void;
  withdrawJar: (amount: number) => void;
  setActiveSheet: (sheet: 'savings' | 'class_goal' | null) => void;
  setShowProofDrawer: (open: boolean) => void;
  dismissCelebration: () => void;
  clearToast: () => void;
  resetDemo: () => void;
}

/**
 * Helper to call `/api/chain/*` without ever blocking gameplay.
 * Adds a pending proof immediately, updates to confirmed when returned,
 * and retries once in the background if the first call fails.
 */
async function callChainNonBlocking(
  endpoint: string,
  payload: Record<string, unknown>,
  pendingLabel: string,
  onProof: (proof: TxProof, extra?: Record<string, unknown>) => void,
  onNotice?: (text: string) => void
) {
  const attempt = async (): Promise<Record<string, unknown> | null> => {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data && data.ok) {
        return data;
      }
      return null;
    } catch {
      return null;
    }
  };

  let result = await attempt();
  if (!result) {
    if (onNotice) {
      onNotice('Syncing receipt in background...');
    }
    // Retry once in background after 1.5s
    await new Promise((r) => setTimeout(r, 1500));
    result = await attempt();
  }

  if (result && result.proof) {
    onProof(result.proof as TxProof, result);
  } else {
    onProof(
      {
        label: `${pendingLabel} (local)`,
        txId: `pending-${Date.now().toString(36)}`,
        status: 'pending',
        timestamp: Date.now(),
      },
      result || undefined
    );
  }
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      loggedIn: false,
      nickname: '',
      accountId: '',
      game: createInitialGameState(DEMO_SEED),
      mentorMessages: [
        'Welcome to Coop Tycoon! You got 100 coins and your first hen Clover (worth 30 coins) for free. Press Next Day twice to gather eggs!',
      ],
      proofs: [],
      lastBalanceDelta: null,
      lastEggPriceDelta: null,
      lastProducedEggs: 0,
      flyingCoinsTrigger: 0,
      dayTransitionTrigger: 0,
      showCelebration: false,
      activeSheet: null,
      showProofDrawer: false,
      toast: null,

      loginGuest: async (rawNickname: string) => {
        const nickname = rawNickname.trim() || 'SunnyFarmer';
        const isDemo =
          process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
        const seed = isDemo
          ? DEMO_SEED
          : Math.floor(Math.random() * 100000) + 1;

        const initialGame = createInitialGameState(seed);
        const cleanNick =
          nickname.toLowerCase().replace(/[^a-z0-9]/g, '') || 'farmer';

        set({
          loggedIn: true,
          nickname,
          accountId: `${cleanNick}.coop-treasury-7158.testnet`,
          game: initialGame,
          mentorMessages: [
            `Welcome, ${nickname}! You received ${STARTER_GRANT} coins and your first hen Clover (worth 30 coins). Press Next Day twice to collect eggs!`,
          ],
          lastBalanceDelta: STARTER_GRANT,
          proofs: [],
        });

        await callChainNonBlocking(
          '/api/chain/grant',
          { nickname, amount: STARTER_GRANT },
          `Starter grant (+${STARTER_GRANT} COOP)`,
          (proof, extra) => {
            set((state) => ({
              accountId:
                typeof extra?.accountId === 'string'
                  ? extra.accountId
                  : state.accountId,
              proofs: [proof, ...state.proofs],
            }));
          },
          (msg) =>
            set({
              toast: { id: String(Date.now()), text: msg, tone: 'info' },
            })
        );
      },

      advanceDay: () => {
        const prev = get().game;
        const prevPrice = eggPrice(prev.marketStock);
        const prevBalance = prev.balance;

        const { state: next, events, mentorMessages } = nextDay(prev);
        const newPrice = eggPrice(next.marketStock);
        const priceDelta = Math.round((newPrice - prevPrice) * 100) / 100;
        const balanceDelta = Math.round((next.balance - prevBalance) * 100) / 100;

        const producedEvent = events.find((e) => e.type === 'eggs_produced');
        const producedCount = Number(producedEvent?.data?.eggs ?? 0);
        const goalReached = events.some((e) => e.type === 'goal_reached');

        // Advance tutorial steps naturally
        let nextTutorialStep = next.tutorialStep;
        if (nextTutorialStep === 1 && next.day >= 2) {
          nextTutorialStep = 2; // press Next Day one more time
        } else if (nextTutorialStep === 2 && next.eggs > 0) {
          nextTutorialStep = 3; // ready to sell eggs
        }

        set({
          game: { ...next, tutorialStep: nextTutorialStep },
          mentorMessages,
          lastBalanceDelta: balanceDelta !== 0 ? balanceDelta : null,
          lastEggPriceDelta: priceDelta !== 0 ? priceDelta : null,
          lastProducedEggs: producedCount,
          dayTransitionTrigger: Date.now(),
          showCelebration: goalReached || get().showCelebration,
        });

        if (goalReached) {
          const accountId = get().accountId || 'farmer.coop.testnet';
          void callChainNonBlocking(
            '/api/chain/mint-bonus',
            { accountIds: [accountId], amount: SEASON_BONUS_MINT },
            `Season bonus mint (+${SEASON_BONUS_MINT} COOP)`,
            (proof) =>
              set((s) => ({
                proofs: [proof, ...s.proofs],
              }))
          );
        }
      },

      fastForwardDays: (days = 3) => {
        let current = get().game;
        const startBalance = current.balance;
        const startPrice = eggPrice(current.marketStock);
        let latestMessages = get().mentorMessages;
        let totalProduced = 0;
        let anyGoalReached = false;

        for (let i = 0; i < days; i++) {
          const res = nextDay(current);
          current = res.state;
          latestMessages = res.mentorMessages;
          const prod = res.events.find((e) => e.type === 'eggs_produced');
          totalProduced += Number(prod?.data?.eggs ?? 0);
          if (res.events.some((e) => e.type === 'goal_reached')) {
            anyGoalReached = true;
          }
        }

        if (current.tutorialStep < 3 && current.eggs > 0) {
          current = { ...current, tutorialStep: 3 };
        }

        const endPrice = eggPrice(current.marketStock);
        set({
          game: current,
          mentorMessages: latestMessages,
          lastBalanceDelta:
            Math.round((current.balance - startBalance) * 100) / 100,
          lastEggPriceDelta: Math.round((endPrice - startPrice) * 100) / 100,
          lastProducedEggs: totalProduced,
          dayTransitionTrigger: Date.now(),
          showCelebration: anyGoalReached || get().showCelebration,
          toast: {
            id: String(Date.now()),
            text: `Fast-forwarded ${days} days!`,
            tone: 'info',
          },
        });

        if (anyGoalReached) {
          const accountId = get().accountId || 'farmer.coop.testnet';
          void callChainNonBlocking(
            '/api/chain/mint-bonus',
            { accountIds: [accountId], amount: SEASON_BONUS_MINT },
            `Season bonus mint (+${SEASON_BONUS_MINT} COOP)`,
            (proof) =>
              set((s) => ({
                proofs: [proof, ...s.proofs],
              }))
          );
        }
      },

      cleanCoop: () => {
        const prev = get().game;
        const { state: next, cleaned } = cleanCoopAction(prev);
        if (!cleaned) return;

        set({
          game: next,
          lastBalanceDelta: -3,
          mentorMessages: [
            'Sparkling clean! Keeping the coop tidy prevents sickness for just 3 coins.',
          ],
        });
      },

      cureHen: (henId?: string) => {
        const prev = get().game;
        const { state: next, curedHenId } = cureHenAction(prev, henId);
        if (!curedHenId) return;

        set({
          game: next,
          lastBalanceDelta: -8,
          mentorMessages: [
            'Medicine worked! Your hen is healthy again and ready to lay eggs tomorrow.',
          ],
        });
      },

      sellAllEggs: () => {
        const prev = get().game;
        const prevPrice = eggPrice(prev.marketStock);
        const res = sell(prev);
        if (res.soldCount <= 0) {
          if (res.mentorNote) {
            set({ mentorMessages: [res.mentorNote] });
          }
          return;
        }

        const afterPrice = eggPrice(res.state.marketStock);
        const priceDelta = Math.round((afterPrice - prevPrice) * 100) / 100;

        let nextTutorialStep = res.state.tutorialStep;
        if (nextTutorialStep <= 3) {
          nextTutorialStep = 4; // prompt buying 2nd hen or saving
        }

        const dailyCosts =
          res.state.hens.length * 2 + res.state.dailyExtraCosts;
        const profit = Math.round((res.revenue - dailyCosts) * 100) / 100;
        const saleMessage = res.mentorNote
          ? res.mentorNote
          : profit >= 0
          ? `Profit today: ${profit} COOP (${res.soldCount} eggs x ${res.unitPrice} minus ${dailyCosts} costs).`
          : `You sold ${res.soldCount} eggs for ${res.revenue} coins at ${res.unitPrice} each!`;

        set({
          game: { ...res.state, tutorialStep: nextTutorialStep },
          lastBalanceDelta: res.revenue,
          lastEggPriceDelta: priceDelta !== 0 ? priceDelta : null,
          flyingCoinsTrigger: Date.now(),
          mentorMessages: [saleMessage],
        });

        const accountId = get().accountId || 'farmer.coop.testnet';
        void callChainNonBlocking(
          '/api/chain/payout',
          { accountId, amount: res.revenue },
          `NPC egg payout (+${res.revenue} COOP)`,
          (proof) =>
            set((s) => ({
              proofs: [proof, ...s.proofs],
            }))
        );
      },

      requestBuyHen: async () => {
        const current = get().game;
        if (current.hens.length >= MAX_HENS) {
          set({
            mentorMessages: [`Your coop is full (${MAX_HENS} hens max)!`],
          });
          return;
        }
        if (current.balance < HEN_PRICE) {
          set({
            mentorMessages: [
              `A new hen costs ${HEN_PRICE} coins. Sell a few more eggs first!`,
            ],
          });
          return;
        }

        // Buying 2nd+ hen costs 30 >= GUARDIAN_THRESHOLD (30), so requires Guardian DAO approval
        const tempProposalId = String(get().proofs.length + 1);
        set({
          game: {
            ...current,
            pendingApproval: { kind: 'buy_hen', proposalId: tempProposalId },
          },
          mentorMessages: [
            `Buying a hen costs ${HEN_PRICE} coins. Because it's a big investment, your Guardian needs to approve it!`,
          ],
        });

        const accountId = get().accountId || 'farmer.coop.testnet';
        await callChainNonBlocking(
          '/api/chain/propose',
          { accountId, amount: HEN_PRICE },
          `DAO Proposal: Buy Hen (${HEN_PRICE} COOP)`,
          (proof, extra) => {
            const realProposalId =
              typeof extra?.proposalId === 'string'
                ? extra.proposalId
                : tempProposalId;
            set((s) => ({
              game: s.game.pendingApproval
                ? {
                    ...s.game,
                    pendingApproval: {
                      kind: 'buy_hen',
                      proposalId: realProposalId,
                    },
                  }
                : s.game,
              proofs: [proof, ...s.proofs],
            }));
          }
        );
      },

      approveBuyHen: async () => {
        const current = get().game;
        if (!current.pendingApproval) return;
        const proposalId = current.pendingApproval.proposalId;

        if (current.balance < HEN_PRICE || current.hens.length >= MAX_HENS) {
          set({
            game: { ...current, pendingApproval: null },
          });
          return;
        }

        const newHenIndex = current.hens.length + 1;
        const newHenName =
          HEN_NAMES[(newHenIndex - 1) % HEN_NAMES.length] ||
          `Hen #${newHenIndex}`;

        const nextTutorialStep =
          current.tutorialStep === 4 ? 5 : current.tutorialStep;

        set({
          game: {
            ...current,
            balance: Math.round((current.balance - HEN_PRICE) * 100) / 100,
            hens: [
              ...current.hens,
              {
                id: `hen-${Date.now()}`,
                name: newHenName,
                sickDays: 0,
                fedToday: true,
              },
            ],
            pendingApproval: null,
            tutorialStep: nextTutorialStep,
          },
          lastBalanceDelta: -HEN_PRICE,
          mentorMessages: [
            `Guardian approved! Welcome ${newHenName} to the coop. More hens mean more eggs—and more mouths to feed!`,
          ],
        });

        await callChainNonBlocking(
          '/api/chain/approve',
          { proposalId },
          `Guardian approved Proposal #${proposalId}`,
          (proof) =>
            set((s) => ({
              proofs: [proof, ...s.proofs],
            }))
        );
      },

      cancelBuyHen: () => {
        set((s) => ({
          game: { ...s.game, pendingApproval: null },
        }));
      },

      depositJar: (amount: number) => {
        const prev = get().game;
        const prevSeason = prev.season;
        const { state: next, deposited } = depositToJar(prev, amount);
        if (deposited <= 0) return;

        const goalJustReached = next.season > prevSeason;
        const delta = Math.round((next.balance - prev.balance) * 100) / 100;

        set({
          game: next,
          lastBalanceDelta: delta,
          showCelebration: goalJustReached || get().showCelebration,
          mentorMessages: goalJustReached
            ? [
                `The whole class reached the savings goal! Everyone gets ${SEASON_BONUS_MINT} COOP.`,
              ]
            : [
                `Saved ${deposited} coins in your jar! It earns 2% interest every day. Keep it in for 3 days to avoid the early penalty.`,
              ],
        });

        if (goalJustReached) {
          const accountId = get().accountId || 'farmer.coop.testnet';
          void callChainNonBlocking(
            '/api/chain/mint-bonus',
            { accountIds: [accountId], amount: SEASON_BONUS_MINT },
            `Season bonus mint (+${SEASON_BONUS_MINT} COOP)`,
            (proof) =>
              set((s) => ({
                proofs: [proof, ...s.proofs],
              }))
          );
        }
      },

      withdrawJar: (amount: number) => {
        const prev = get().game;
        const res = withdrawFromJar(prev, amount);
        if (res.withdrawn <= 0) return;

        set({
          game: res.state,
          lastBalanceDelta: res.received,
          mentorMessages:
            res.mentorMessages.length > 0
              ? res.mentorMessages
              : [
                  `Withdrew ${res.received} coins from your savings jar with zero penalty!`,
                ],
        });

        if (res.isEarly && res.penalty > 0) {
          const accountId = get().accountId || 'farmer.coop.testnet';
          void callChainNonBlocking(
            '/api/chain/status',
            { action: 'burn', accountId, amount: res.penalty },
            `Early withdraw penalty burn (-${res.penalty} COOP)`,
            (proof) =>
              set((s) => ({
                proofs: [proof, ...s.proofs],
              }))
          );
        }
      },

      setActiveSheet: (sheet) => set({ activeSheet: sheet }),
      setShowProofDrawer: (open) => set({ showProofDrawer: open }),
      dismissCelebration: () => set({ showCelebration: false }),
      clearToast: () => set({ toast: null }),

      resetDemo: () => {
        const initial = createInitialGameState(DEMO_SEED);
        set({
          game: initial,
          mentorMessages: [
            'Fresh demo started! You have 100 coins and your first hen Clover.',
          ],
          lastBalanceDelta: null,
          lastEggPriceDelta: null,
          lastProducedEggs: 0,
          showCelebration: false,
          activeSheet: null,
        });
      },
    }),
    {
      name: 'coop-tycoon-storage-v1',
      partialize: (state) => ({
        loggedIn: state.loggedIn,
        nickname: state.nickname,
        accountId: state.accountId,
        game: state.game,
        mentorMessages: state.mentorMessages,
        proofs: state.proofs,
      }),
    }
  )
);
