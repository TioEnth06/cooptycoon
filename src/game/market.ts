import {
  EGG_BASE_PRICE,
  EGG_PRICE_MAX,
  EGG_PRICE_MIN,
  MARKET_TARGET_STOCK,
} from './constants';
import { DayEvent, GameState } from './types';

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Egg price formula (NPC buyer) from docs/GAME_RULES.md:
 * ratio = (MARKET_TARGET_STOCK - marketStock) / MARKET_TARGET_STOCK
 * price = clamp(EGG_BASE_PRICE * (1 + 0.5 * ratio), EGG_PRICE_MIN, EGG_PRICE_MAX)
 */
export function eggPrice(marketStock: number): number {
  const ratio = (MARKET_TARGET_STOCK - marketStock) / MARKET_TARGET_STOCK;
  const rawPrice = EGG_BASE_PRICE * (1 + 0.5 * ratio);
  const clamped = clamp(rawPrice, EGG_PRICE_MIN, EGG_PRICE_MAX);
  return Math.round(clamped * 100) / 100;
}

export type SellResult = {
  state: GameState;
  soldCount: number;
  unitPrice: number;
  revenue: number;
  events: DayEvent[];
  mentorNote?: string;
};

/**
 * Selling N eggs: pay `price * N` (price fixed at start of sale), then `marketStock += N`.
 * NPC buyer has its own wallet and pays from its balance; if its balance is too low,
 * it pays what it can and the mentor explains ("the buyer ran out of coins; try again tomorrow").
 */
export function sell(state: GameState, countToSell?: number): SellResult {
  const requested = countToSell ?? state.eggs;
  const availableEggs = Math.min(state.eggs, Math.max(0, Math.floor(requested)));

  const currentPrice = eggPrice(state.marketStock);
  if (availableEggs <= 0) {
    return {
      state,
      soldCount: 0,
      unitPrice: currentPrice,
      revenue: 0,
      events: [],
    };
  }

  // How many eggs can the NPC buyer afford from its wallet?
  const affordableEggs = Math.floor(state.npcBalance / currentPrice);
  const actualSold = Math.min(availableEggs, affordableEggs);
  const revenue = Math.round(actualSold * currentPrice * 100) / 100;

  const events: DayEvent[] = [];
  let mentorNote: string | undefined;

  if (actualSold < availableEggs) {
    events.push({
      type: 'npc_low_funds',
      data: { requested: availableEggs, sold: actualSold },
    });
    mentorNote =
      'The buyer ran out of coins; try again tomorrow when their budget refreshes!';
  }

  const nextMarketStock = state.marketStock + actualSold;
  const newPriceAfterSale = eggPrice(nextMarketStock);
  if (newPriceAfterSale <= EGG_PRICE_MIN + 0.5) {
    events.push({
      type: 'price_low',
      data: { price: newPriceAfterSale },
    });
  }

  const nextState: GameState = {
    ...state,
    eggs: state.eggs - actualSold,
    balance: Math.round((state.balance + revenue) * 100) / 100,
    marketStock: nextMarketStock,
    npcBalance: Math.max(0, Math.round((state.npcBalance - revenue) * 100) / 100),
    dailyIncome: Math.round((state.dailyIncome + revenue) * 100) / 100,
    totalEggsSold: (state.totalEggsSold ?? 0) + actualSold,
    dailyEggsSold: (state.dailyEggsSold ?? 0) + actualSold,
  };

  return {
    state: nextState,
    soldCount: actualSold,
    unitPrice: currentPrice,
    revenue,
    events,
    mentorNote,
  };
}
