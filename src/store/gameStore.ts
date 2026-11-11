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
  getFeedPricePerHen,
  nextDay,
  withdrawFromJar,
} from '@/game/engine';
import {
  CAREER_LEVELS,
  CHALLENGE_SCENARIOS,
  evaluateLevelOutcome,
  getLevelDef,
  LevelOutcome,
} from '@/game/levels';
import { eggPrice, sell } from '@/game/market';
import {
  BadgeDef,
  BadgeId,
  checkNewlyUnlockedBadges,
  QuestId,
} from '@/game/quests';
import { GameMode, GameState } from '@/game/types';
import { AuthMethod } from '@/lib/nearAuth';
import { playSfx } from '@/animation/sfx';

const HEN_NAMES = ['Clover', 'Sunny', 'Pip', 'Daisy', 'Nugget'];

export type ScreenView = 'home' | 'level_select' | 'challenge_select' | 'game';

export type DaySummaryData = {
  day: number;
  income: number;
  costs: number;
  profit: number;
  eggsProduced: number;
  mentorLine: string;
};

type ToastNotice = {
  id: string;
  text: string;
  tone: 'info' | 'success' | 'warning';
};

export interface GameStore {
  // Player session & auth
  loggedIn: boolean;
  authMethod: AuthMethod;
  nickname: string;
  accountId: string;

  // Navigation & Mode State (G1-G5)
  screen: ScreenView;
  mode: GameMode;
  currentLevelId: number;
  showLevelIntro: boolean;
  levelOutcome: LevelOutcome;
  levelStars: Record<number, number>; // levelId -> 1..3 stars
  levelRewardClaimed: Record<number, boolean>; // levelId -> true if 10 COOP payout claimed
  hadBankruptRetry: boolean;

  // Quests & Badges (G4)
  completedQuestsToday: QuestId[];
  unlockedBadges: BadgeId[];
  badgeToast: BadgeDef | null;

  // Game state
  game: GameState;
  mentorMessages: string[];
  proofs: TxProof[];

  // UI & Animation transient state (A1-A3)
  sfxEnabled: boolean;
  daySequenceStep: number; // 0 = idle, 1 = sun/moon, 2 = peck, 3 = eggs, 4 = events
  lastFeedCostPaid: number;
  lastBalanceDelta: number | null;
  lastEggPriceDelta: number | null;
  lastProducedEggs: number;
  lastSoldCount: number;
  flyingCoinsTrigger: number;
  cleanSweepTrigger: number;
  healedHenId: string | null;
  dayTransitionTrigger: number;
  daySummary: DaySummaryData | null;
  showCelebration: boolean;
  activeSheet: 'savings' | 'class_goal' | 'badges' | null;
  showProofDrawer: boolean;
  toast: ToastNotice | null;

  // Auth Actions
  loginGuest: (nickname: string) => Promise<void>;
  loginWithSocial: (params: {
    method: AuthMethod;
    identifier: string;
    accountId?: string;
  }) => Promise<void>;
  logout: () => void;

  // Navigation & Mode Actions
  setScreen: (screen: ScreenView) => void;
  selectMode: (mode: GameMode) => void;
  startLevel: (mode: GameMode, levelId: number) => void;
  dismissLevelIntro: () => void;
  retryCurrentLevel: () => void;
  dismissDaySummary: () => void;

  // Gameplay Actions
  advanceDay: () => void;
  skipDaySequence: () => void;
  fastForwardDays: (days?: number) => void;
  cleanCoop: () => void;
  cureHen: (henId?: string) => void;
  sellAllEggs: () => void;
  requestBuyHen: () => Promise<void>;
  approveBuyHen: () => Promise<void>;
  cancelBuyHen: () => void;
  depositJar: (amount: number) => void;
  withdrawJar: (amount: number) => void;
  completeDailyQuest: (questId: QuestId) => void;
  askMentorTip: () => void;
  toggleSfx: () => void;
  setActiveSheet: (sheet: 'savings' | 'class_goal' | 'badges' | null) => void;
  setShowProofDrawer: (open: boolean) => void;
  dismissCelebration: () => void;
  dismissBadgeToast: () => void;
  clearToast: () => void;
  resetDemo: () => void;
}

export async function callChainNonBlocking(
  endpoint: string,
  payload: Record<string, unknown>,
  pendingLabel: string,
  onProof: (proof: TxProof, extra?: Record<string, unknown>) => void,
  onNotice?: (text: string) => void,
  retryDelayMs = 1500
) {
  // Emit a 'pending' proof immediately so the Proof Drawer shows pending state while RPC is in-flight
  const tempTxId = `pending-${Date.now().toString(36)}`;
  onProof({
    label: pendingLabel,
    txId: tempTxId,
    status: 'pending',
    timestamp: Date.now(),
  });

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
    await new Promise((r) => setTimeout(r, retryDelayMs));
    result = await attempt();
  }

  if (result && result.proof) {
    onProof(
      { ...(result.proof as TxProof), replacedPendingId: tempTxId } as TxProof,
      result
    );
  }
}

let sequenceTimers: ReturnType<typeof setTimeout>[] = [];
function clearSequenceTimers() {
  for (const t of sequenceTimers) clearTimeout(t);
  sequenceTimers = [];
}

export function mergeProofList(prev: TxProof[], incoming: TxProof): TxProof[] {
  if (incoming.replacedPendingId) {
    const filtered = prev.filter((p) => p.txId !== incoming.replacedPendingId);
    return [incoming, ...filtered];
  }
  return [incoming, ...prev];
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      const awardQuestIfNotDone = (questId: QuestId) => {
        const done = get().completedQuestsToday;
        if (done.includes(questId)) return;
        playSfx('quest', get().sfxEnabled);
        set((s) => ({
          completedQuestsToday: [...s.completedQuestsToday, questId],
          game: {
            ...s.game,
            reputation: s.game.reputation + 1,
          },
        }));
      };

      const checkAndToastBadges = (
        state: GameState,
        context?: {
          levelWonId?: number;
          hadBankruptRetry?: boolean;
          goalReached?: boolean;
        }
      ) => {
        const currentUnlocked = get().unlockedBadges;
        const newly = checkNewlyUnlockedBadges(state, currentUnlocked, context);
        if (newly.length > 0) {
          set({
            unlockedBadges: [
              ...currentUnlocked,
              ...newly.map((b) => b.id),
            ],
            badgeToast: newly[0],
          });
        }
      };

      return {
        loggedIn: false,
        authMethod: 'guest',
        nickname: '',
        accountId: '',

        screen: 'home',
        mode: 'career',
        currentLevelId: 1,
        showLevelIntro: false,
        levelOutcome: { status: 'playing' },
        levelStars: {},
        levelRewardClaimed: {},
        hadBankruptRetry: false,

        completedQuestsToday: [],
        unlockedBadges: [],
        badgeToast: null,

        game: createInitialGameState(DEMO_SEED),
        mentorMessages: [
          'Welcome to Coop Tycoon! You got 100 coins and your first hen Clover (worth 30 coins) for free.',
        ],
        proofs: [],

        sfxEnabled: false,
        daySequenceStep: 0,
        lastFeedCostPaid: 0,
        lastBalanceDelta: null,
        lastEggPriceDelta: null,
        lastProducedEggs: 0,
        lastSoldCount: 1,
        flyingCoinsTrigger: 0,
        cleanSweepTrigger: 0,
        healedHenId: null,
        dayTransitionTrigger: 0,
        daySummary: null,
        showCelebration: false,
        activeSheet: null,
        showProofDrawer: false,
        toast: null,

        loginGuest: async (rawNickname: string) => {
          const nickname = rawNickname.trim() || 'SunnyFarmer';
          await get().loginWithSocial({
            method: 'guest',
            identifier: nickname,
          });
        },

        loginWithSocial: async ({ method, identifier, accountId: explicitAccountId }) => {
          const nickname =
            identifier.replace(/@.*$/, '').trim() || 'SunnyFarmer';
          const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
          const seed = isDemo
            ? DEMO_SEED
            : Math.floor(Math.random() * 100000) + 1;

          const initialGame = createInitialGameState(seed);
          const cleanNick =
            nickname.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'farmer';
          const defaultAccount =
            explicitAccountId || `${cleanNick}.coop-treasury-7158.testnet`;

          set({
            loggedIn: true,
            authMethod: method,
            nickname,
            accountId: defaultAccount,
            screen: 'home',
            game: initialGame,
            mentorMessages: [
              `Welcome, ${nickname}! Choose Career, Challenge, or Sandbox to start running your egg business.`,
            ],
            lastBalanceDelta: STARTER_GRANT,
          });

          await callChainNonBlocking(
            '/api/chain/grant',
            {
              nickname,
              accountId: explicitAccountId,
              amount: STARTER_GRANT,
            },
            `Starter grant (+${STARTER_GRANT} COOP)`,
            (proof, extra) => {
              set((state) => ({
                accountId:
                  typeof extra?.accountId === 'string'
                    ? extra.accountId
                    : state.accountId,
                proofs: mergeProofList(state.proofs, proof),
              }));
            }
          );
        },

        logout: () => {
          clearSequenceTimers();
          set({
            loggedIn: false,
            nickname: '',
            accountId: '',
            screen: 'home',
            daySequenceStep: 0,
            showProofDrawer: false,
            activeSheet: null,
          });
        },

        setScreen: (screen) => set({ screen }),

        selectMode: (mode: GameMode) => {
          playSfx('click', get().sfxEnabled);
          if (mode === 'career') {
            set({ mode: 'career', screen: 'level_select' });
          } else if (mode === 'challenge') {
            set({ mode: 'challenge', screen: 'challenge_select' });
          } else {
            get().startLevel('sandbox', 0);
          }
        },

        startLevel: (mode: GameMode, levelId: number) => {
          clearSequenceTimers();
          playSfx('click', get().sfxEnabled);
          const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
          const seed = isDemo
            ? DEMO_SEED
            : Math.floor(Math.random() * 100000) + 1;

          const base = createInitialGameState(seed);
          const levelDef = getLevelDef(mode, levelId);

          const configuredGame: GameState = levelDef
            ? {
                ...base,
                ...levelDef.setup,
                hens: levelDef.setup.hens
                  ? levelDef.setup.hens.map((h) => ({ ...h }))
                  : base.hens,
                classmates: levelDef.setup.classmates
                  ? levelDef.setup.classmates.map((c) => ({ ...c }))
                  : base.classmates,
                tutorialStep: mode === 'career' && levelId === 1 ? 1 : 99,
              }
            : {
                ...base,
                tutorialStep: 1,
              };

          set({
            mode,
            currentLevelId: levelId,
            screen: 'game',
            showLevelIntro: Boolean(levelDef),
            levelOutcome: { status: 'playing' },
            completedQuestsToday: [],
            daySummary: null,
            daySequenceStep: 0,
            game: configuredGame,
            mentorMessages: [
              levelDef
                ? levelDef.introText
                : 'Sandbox Free Play! Experiment with hens, market prices, and your Savings Jar at your own pace.',
            ],
          });
        },

        dismissLevelIntro: () => set({ showLevelIntro: false }),

        retryCurrentLevel: () => {
          const { mode, currentLevelId, levelOutcome } = get();
          const wasBankrupt = levelOutcome.status === 'lost_bankrupt';
          set({ hadBankruptRetry: wasBankrupt });
          get().startLevel(mode, currentLevelId);
        },

        dismissDaySummary: () => set({ daySummary: null }),

        skipDaySequence: () => {
          clearSequenceTimers();
          set({ daySequenceStep: 0 });
        },

        advanceDay: () => {
          clearSequenceTimers();
          const { game: prev, mode, currentLevelId, sfxEnabled } = get();
          const levelDef = getLevelDef(mode, currentLevelId);
          const prevPrice = eggPrice(prev.marketStock);
          const prevBalance = prev.balance;
          const prevIncome = prev.dailyIncome;
          const prevExtraCosts = prev.dailyExtraCosts;

          const { state: next, events, mentorMessages } = nextDay(prev, {
            forcedEvents: levelDef?.forcedEvents,
            isSandbox: mode === 'sandbox',
          });

          const newPrice = eggPrice(next.marketStock);
          const priceDelta = Math.round((newPrice - prevPrice) * 100) / 100;
          const balanceDelta =
            Math.round((next.balance - prevBalance) * 100) / 100;

          const feedPaidEvent = events.find((e) => e.type === 'feed_paid');
          const feedPaid = Number(feedPaidEvent?.data?.cost ?? 0);
          const producedEvent = events.find((e) => e.type === 'eggs_produced');
          const producedCount = Number(producedEvent?.data?.eggs ?? 0);
          const goalReached = events.some((e) => e.type === 'goal_reached');

          // Evaluate daily quest: all_fed_healthy
          let nextState = next;
          const allFedHealthy =
            next.hens.length > 0 &&
            next.hens.every((h) => h.fedToday && h.sickDays === 0);
          const completedBefore = get().completedQuestsToday;
          if (allFedHealthy && !completedBefore.includes('all_fed_healthy')) {
            nextState = { ...nextState, reputation: nextState.reputation + 1 };
          }

          // Advance tutorial steps naturally
          let nextTutorialStep = nextState.tutorialStep;
          if (nextTutorialStep === 1 && nextState.day >= 2) {
            nextTutorialStep = 2;
          } else if (nextTutorialStep === 2 && nextState.eggs > 0) {
            nextTutorialStep = 3;
          }
          nextState = { ...nextState, tutorialStep: nextTutorialStep };

          // Evaluate level outcome (win / lose / bankrupt)
          const outcome = evaluateLevelOutcome(nextState, mode, levelDef);
          const totalCosts = Math.round((feedPaid + prevExtraCosts) * 100) / 100;
          const estimatedIncome =
            prevIncome > 0
              ? prevIncome
              : Math.round(producedCount * newPrice * 100) / 100;
          const profit = Math.round((estimatedIncome - totalCosts) * 100) / 100;

          // Update stars & chain payout if level won
          const nextStars = { ...get().levelStars };
          const nextClaimed = { ...get().levelRewardClaimed };
          let FirstTimeLevelBonus = false;

          if (outcome.status === 'won' && levelDef) {
            const prevBest = nextStars[levelDef.id] ?? 0;
            if (outcome.stars > prevBest) {
              nextStars[levelDef.id] = outcome.stars;
            }
            if (!nextClaimed[levelDef.id]) {
              nextClaimed[levelDef.id] = true;
              FirstTimeLevelBonus = true;
              nextState = {
                ...nextState,
                balance: Math.round((nextState.balance + 10) * 100) / 100,
              };
            }
            playSfx('levelUp', sfxEnabled);
          } else if (producedCount > 0) {
            playSfx('eggPop', sfxEnabled);
          }

          // Play sequenced Next Day animation steps (skippable on tap)
          set({
            game: nextState,
            mentorMessages,
            levelOutcome: outcome,
            levelStars: nextStars,
            levelRewardClaimed: nextClaimed,
            completedQuestsToday: [],
            lastFeedCostPaid: feedPaid,
            lastBalanceDelta: balanceDelta !== 0 ? balanceDelta : null,
            lastEggPriceDelta: priceDelta !== 0 ? priceDelta : null,
            lastProducedEggs: producedCount,
            dayTransitionTrigger: Date.now(),
            daySequenceStep: 1,
            daySummary:
              outcome.status === 'playing'
                ? {
                    day: prev.day,
                    income: estimatedIncome,
                    costs: totalCosts,
                    profit,
                    eggsProduced: producedCount,
                    mentorLine: mentorMessages[0] || 'Steady day on the farm.',
                  }
                : null,
            showCelebration: goalReached || get().showCelebration,
          });

          sequenceTimers.push(
            setTimeout(() => set({ daySequenceStep: 2 }), 420),
            setTimeout(() => set({ daySequenceStep: 3 }), 850),
            setTimeout(() => set({ daySequenceStep: 4 }), 1250),
            setTimeout(() => set({ daySequenceStep: 0 }), 1650)
          );

          checkAndToastBadges(nextState, {
            levelWonId:
              outcome.status === 'won' && levelDef ? levelDef.id : undefined,
            hadBankruptRetry: get().hadBankruptRetry,
            goalReached,
          });

          if (FirstTimeLevelBonus && levelDef) {
            const accountId = get().accountId || 'farmer.coop.testnet';
            void callChainNonBlocking(
              '/api/chain/payout',
              { accountId, amount: 10 },
              `Level ${levelDef.id} Complete Bonus (+10 COOP)`,
              (proof) =>
                set((s) => ({
                  proofs: mergeProofList(s.proofs, proof),
                }))
            );
          }

          if (goalReached) {
            const accountId = get().accountId || 'farmer.coop.testnet';
            void callChainNonBlocking(
              '/api/chain/mint-bonus',
              { accountIds: [accountId], amount: SEASON_BONUS_MINT },
              `Season bonus payout (+${SEASON_BONUS_MINT} COOP)`,
              (proof) =>
                set((s) => ({
                  proofs: mergeProofList(s.proofs, proof),
                }))
            );
          }
        },

        fastForwardDays: (days = 3) => {
          clearSequenceTimers();
          let current = get().game;
          const { mode, currentLevelId } = get();
          const levelDef = getLevelDef(mode, currentLevelId);
          const startBalance = current.balance;
          const startPrice = eggPrice(current.marketStock);
          let latestMessages = get().mentorMessages;
          let totalProduced = 0;
          let anyGoalReached = false;

          for (let i = 0; i < days; i++) {
            const res = nextDay(current, {
              forcedEvents: levelDef?.forcedEvents,
              isSandbox: mode === 'sandbox',
            });
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

          const outcome = evaluateLevelOutcome(current, mode, levelDef);
          const nextStars = { ...get().levelStars };
          if (outcome.status === 'won' && levelDef) {
            const prevBest = nextStars[levelDef.id] ?? 0;
            if (outcome.stars > prevBest) nextStars[levelDef.id] = outcome.stars;
          }

          const endPrice = eggPrice(current.marketStock);
          set({
            game: current,
            mentorMessages: latestMessages,
            levelOutcome: outcome,
            levelStars: nextStars,
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

          checkAndToastBadges(current, {
            levelWonId:
              outcome.status === 'won' && levelDef ? levelDef.id : undefined,
            hadBankruptRetry: get().hadBankruptRetry,
            goalReached: anyGoalReached,
          });

          if (anyGoalReached) {
            const accountId = get().accountId || 'farmer.coop.testnet';
            void callChainNonBlocking(
              '/api/chain/mint-bonus',
              { accountIds: [accountId], amount: SEASON_BONUS_MINT },
              `Season bonus payout (+${SEASON_BONUS_MINT} COOP)`,
              (proof) =>
                set((s) => ({
                  proofs: mergeProofList(s.proofs, proof),
                }))
            );
          }
        },

        cleanCoop: () => {
          const prev = get().game;
          const { state: next, cleaned } = cleanCoopAction(prev);
          if (!cleaned) return;

          playSfx('click', get().sfxEnabled);
          set({
            game: next,
            cleanSweepTrigger: Date.now(),
            lastBalanceDelta: -3,
            mentorMessages: [
              'Sparkling clean! Keeping the coop tidy prevents sickness for just 3 coins.',
            ],
          });
          awardQuestIfNotDone('clean_coop');
        },

        cureHen: (henId?: string) => {
          const prev = get().game;
          const { state: next, curedHenId } = cureHenAction(prev, henId);
          if (!curedHenId) return;

          playSfx('quest', get().sfxEnabled);
          const { mode, currentLevelId } = get();
          const levelDef = getLevelDef(mode, currentLevelId);
          const outcome = evaluateLevelOutcome(next, mode, levelDef);

          set({
            game: next,
            levelOutcome: outcome,
            healedHenId: curedHenId,
            lastBalanceDelta: -8,
            mentorMessages: [
              'Medicine worked! Your hen is healthy again and ready to lay eggs tomorrow.',
            ],
          });
          setTimeout(() => set({ healedHenId: null }), 700);
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

          playSfx('coin', get().sfxEnabled);
          const afterPrice = eggPrice(res.state.marketStock);
          const priceDelta = Math.round((afterPrice - prevPrice) * 100) / 100;

          let nextTutorialStep = res.state.tutorialStep;
          if (nextTutorialStep <= 3) {
            nextTutorialStep = 4;
          }

          const updatedGame: GameState = {
            ...res.state,
            tutorialStep: nextTutorialStep,
          };

          const { mode, currentLevelId } = get();
          const levelDef = getLevelDef(mode, currentLevelId);
          const outcome = evaluateLevelOutcome(updatedGame, mode, levelDef);
          const nextStars = { ...get().levelStars };
          const nextClaimed = { ...get().levelRewardClaimed };
          let firstTimeBonus = false;

          if (outcome.status === 'won' && levelDef) {
            const prevBest = nextStars[levelDef.id] ?? 0;
            if (outcome.stars > prevBest) nextStars[levelDef.id] = outcome.stars;
            if (!nextClaimed[levelDef.id]) {
              nextClaimed[levelDef.id] = true;
              firstTimeBonus = true;
              updatedGame.balance =
                Math.round((updatedGame.balance + 10) * 100) / 100;
            }
            playSfx('levelUp', get().sfxEnabled);
          }

          const dailyCosts =
            updatedGame.hens.length * getFeedPricePerHen(updatedGame) +
            updatedGame.dailyExtraCosts;
          const profit = Math.round((res.revenue - dailyCosts) * 100) / 100;
          const saleMessage = res.mentorNote
            ? res.mentorNote
            : profit >= 0
            ? `Profit today: ${profit} COOP (${res.soldCount} eggs x ${res.unitPrice} minus ${dailyCosts} costs).`
            : `You sold ${res.soldCount} eggs for ${res.revenue} coins at ${res.unitPrice} each!`;

          set({
            game: updatedGame,
            levelOutcome: outcome,
            levelStars: nextStars,
            levelRewardClaimed: nextClaimed,
            lastSoldCount: res.soldCount,
            lastBalanceDelta: res.revenue,
            lastEggPriceDelta: priceDelta !== 0 ? priceDelta : null,
            flyingCoinsTrigger: Date.now(),
            mentorMessages: [saleMessage],
          });

          if (updatedGame.dailyEggsSold >= 2) {
            awardQuestIfNotDone('sell_3_eggs');
          }

          checkAndToastBadges(updatedGame, {
            levelWonId:
              outcome.status === 'won' && levelDef ? levelDef.id : undefined,
            hadBankruptRetry: get().hadBankruptRetry,
          });

          const accountId = get().accountId || 'farmer.coop.testnet';
          void callChainNonBlocking(
            '/api/chain/payout',
            { accountId, amount: res.revenue },
            `NPC egg payout (+${res.revenue} COOP)`,
            (proof) =>
              set((s) => ({
                proofs: mergeProofList(s.proofs, proof),
              }))
          );

          if (firstTimeBonus && levelDef) {
            void callChainNonBlocking(
              '/api/chain/payout',
              { accountId, amount: 10 },
              `Level ${levelDef.id} Complete Bonus (+10 COOP)`,
              (proof) =>
                set((s) => ({
                  proofs: mergeProofList(s.proofs, proof),
                }))
            );
          }
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
                proofs: mergeProofList(s.proofs, proof),
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

          playSfx('levelUp', get().sfxEnabled);
          const newHenIndex = current.hens.length + 1;
          const newHenName =
            HEN_NAMES[(newHenIndex - 1) % HEN_NAMES.length] ||
            `Hen #${newHenIndex}`;

          const nextTutorialStep =
            current.tutorialStep === 4 ? 5 : current.tutorialStep;

          const updatedGame: GameState = {
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
          };

          const { mode, currentLevelId } = get();
          const levelDef = getLevelDef(mode, currentLevelId);
          const outcome = evaluateLevelOutcome(updatedGame, mode, levelDef);

          set({
            game: updatedGame,
            levelOutcome: outcome,
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
                proofs: mergeProofList(s.proofs, proof),
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

          playSfx('coin', get().sfxEnabled);
          const goalJustReached = next.season > prevSeason;
          const delta = Math.round((next.balance - prev.balance) * 100) / 100;

          const { mode, currentLevelId } = get();
          const levelDef = getLevelDef(mode, currentLevelId);
          const outcome = evaluateLevelOutcome(next, mode, levelDef);
          const nextStars = { ...get().levelStars };
          if (outcome.status === 'won' && levelDef) {
            const prevBest = nextStars[levelDef.id] ?? 0;
            if (outcome.stars > prevBest) nextStars[levelDef.id] = outcome.stars;
          }

          set({
            game: next,
            levelOutcome: outcome,
            levelStars: nextStars,
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

          awardQuestIfNotDone('deposit_jar');
          checkAndToastBadges(next, {
            levelWonId:
              outcome.status === 'won' && levelDef ? levelDef.id : undefined,
            hadBankruptRetry: get().hadBankruptRetry,
            goalReached: goalJustReached,
          });

          if (goalJustReached) {
            const accountId = get().accountId || 'farmer.coop.testnet';
            void callChainNonBlocking(
              '/api/chain/mint-bonus',
              { accountIds: [accountId], amount: SEASON_BONUS_MINT },
              `Season bonus payout (+${SEASON_BONUS_MINT} COOP)`,
              (proof) =>
                set((s) => ({
                  proofs: mergeProofList(s.proofs, proof),
                }))
            );
          }
        },

        withdrawJar: (amount: number) => {
          const prev = get().game;
          const res = withdrawFromJar(prev, amount);
          if (res.withdrawn <= 0) return;

          playSfx('click', get().sfxEnabled);
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
              `Early-withdrawal penalty (-${res.penalty} COOP)`,
              (proof) =>
                set((s) => ({
                  proofs: mergeProofList(s.proofs, proof),
                }))
            );
          }
        },

        completeDailyQuest: (questId: QuestId) => {
          awardQuestIfNotDone(questId);
        },

        askMentorTip: () => {
          const tips = [
            'Tip: When Market Stock is low, the town buyer pays up to 8 coins per egg!',
            'Tip: Keeping cleanliness above 40% protects your hens from getting sick.',
            'Tip: Reputation 5 unlocks the Gold Feed Bag (-10% feed cost every day)!',
            'Tip: Saving coins in your jar earns 2% daily compound interest.',
          ];
          const day = get().game.day;
          const picked = tips[day % tips.length];
          set({ mentorMessages: [picked] });
          awardQuestIfNotDone('ask_mentor');
        },

        toggleSfx: () => {
          const next = !get().sfxEnabled;
          set({ sfxEnabled: next });
          if (next) playSfx('click', true);
        },

        setActiveSheet: (sheet) => {
          if (sheet === 'class_goal') {
            awardQuestIfNotDone('check_market');
          }
          set({ activeSheet: sheet });
        },

        setShowProofDrawer: (open) => set({ showProofDrawer: open }),
        dismissCelebration: () => set({ showCelebration: false }),
        dismissBadgeToast: () => set({ badgeToast: null }),
        clearToast: () => set({ toast: null }),

        resetDemo: () => {
          clearSequenceTimers();
          const initial = createInitialGameState(DEMO_SEED);
          set({
            game: initial,
            levelOutcome: { status: 'playing' },
            daySequenceStep: 0,
            daySummary: null,
            mentorMessages: [
              'Fresh coop started! You have 100 coins and your first hen Clover.',
            ],
            lastBalanceDelta: null,
            lastEggPriceDelta: null,
            lastProducedEggs: 0,
            showCelebration: false,
            activeSheet: null,
          });
        },
      };
    },
    {
      name: 'coop-tycoon-storage-v2',
      partialize: (state) => ({
        loggedIn: state.loggedIn,
        authMethod: state.authMethod,
        nickname: state.nickname,
        accountId: state.accountId,
        mode: state.mode,
        currentLevelId: state.currentLevelId,
        levelStars: state.levelStars,
        levelRewardClaimed: state.levelRewardClaimed,
        unlockedBadges: state.unlockedBadges,
        sfxEnabled: state.sfxEnabled,
        game: state.game,
        mentorMessages: state.mentorMessages,
        proofs: state.proofs,
      }),
    }
  )
);
