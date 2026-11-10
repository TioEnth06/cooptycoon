import {
  CLEAN_COST,
  MEDICINE_COST,
  SEASON_BONUS_MINT,
} from './constants';
import { DayEvent } from './types';

function formatNum(val: number | string | undefined): string {
  if (val === undefined) return '0';
  if (typeof val === 'string') return val;
  return Number.isInteger(val) ? String(val) : val.toFixed(1).replace(/\.0$/, '');
}

/**
 * Mentor message triggers from docs/GAME_RULES.md:
 * Rule-based; first match wins, max 2 messages per day.
 *
 * Order in table:
 * 1. Feed spike started
 * 2. Hen got sick (dirty coop)
 * 3. Hen got sick (unfed)
 * 4. Hen died
 * 5. Profit day
 * 6. Loss day
 * 7. Price low
 * 8. Savings interest
 * 9. Early withdraw
 * 10. Goal reached
 * 11. Idle (none above)
 */
export function generateMentorMessages(events: DayEvent[]): string[] {
  const messages: string[] = [];

  const pushUnique = (msg: string) => {
    if (!messages.includes(msg) && messages.length < 2) {
      messages.push(msg);
    }
  };

  // 1. Feed spike started
  const feedSpike = events.find((e) => e.type === 'feed_spike_started');
  if (feedSpike) {
    const days = formatNum(feedSpike.data?.days);
    const price = formatNum(feedSpike.data?.price);
    pushUnique(
      `Feed got more expensive for ${days} days. Your cost per hen is now ${price}. Selling more eggs or keeping a reserve helps.`
    );
  }

  // 2. Hen got sick (dirty coop)
  const sickDirty = events.find((e) => e.type === 'hen_sick_dirty');
  if (sickDirty) {
    const cleanliness = formatNum(sickDirty.data?.cleanliness);
    pushUnique(
      `Your coop was only ${cleanliness}% clean, so a hen got sick. Cleaning costs ${CLEAN_COST}; medicine costs ${MEDICINE_COST}. Prevention is cheaper.`
    );
  }

  // 3. Hen got sick (unfed)
  const sickUnfed = events.find((e) => e.type === 'hen_sick_unfed');
  if (sickUnfed) {
    const feedCost = formatNum(sickUnfed.data?.feedCost);
    pushUnique(
      `A hen went hungry and got sick. Skipping feed saved ${feedCost} but may cost ${MEDICINE_COST} in medicine.`
    );
  }

  // 4. Hen died
  const henDied = events.find((e) => e.type === 'hen_died');
  if (henDied) {
    pushUnique(
      `A sick hen was not treated in time. That is a real risk of any investment: waiting can cost more than acting.`
    );
  }

  // 5. Profit day
  const profitDay = events.find((e) => e.type === 'profit_day');
  if (profitDay) {
    const profit = formatNum(profitDay.data?.profit);
    const eggs = formatNum(profitDay.data?.eggs);
    const price = formatNum(profitDay.data?.price);
    const costs = formatNum(profitDay.data?.costs);
    pushUnique(
      `Profit today: ${profit} COOP (${eggs} eggs x ${price} minus ${costs} costs).`
    );
  }

  // 6. Loss day
  const lossDay = events.find((e) => e.type === 'loss_day');
  if (lossDay) {
    const loss = formatNum(lossDay.data?.loss);
    const costs = formatNum(lossDay.data?.costs);
    const income = formatNum(lossDay.data?.income);
    pushUnique(
      `Loss today: ${loss} COOP because costs (${costs}) were higher than egg income (${income}).`
    );
  }

  // 7. Price low
  const priceLow = events.find((e) => e.type === 'price_low');
  if (priceLow) {
    const price = formatNum(priceLow.data?.price);
    pushUnique(
      `Egg price is low (${price}) because many eggs were sold recently. Waiting a day can help.`
    );
  }

  // 8. Savings interest
  const savingsInterest = events.find((e) => e.type === 'savings_interest');
  if (savingsInterest) {
    const interest = formatNum(savingsInterest.data?.interest);
    pushUnique(
      `Your savings jar earned ${interest} COOP. Small steady gains add up.`
    );
  }

  // 9. Early withdraw
  const earlyWithdraw = events.find((e) => e.type === 'early_withdraw');
  if (earlyWithdraw) {
    const penalty = formatNum(earlyWithdraw.data?.penalty);
    pushUnique(`You withdrew early and ${penalty} COOP was lost. Patience pays.`);
  }

  // 10. Goal reached
  const goalReached = events.find((e) => e.type === 'goal_reached');
  if (goalReached) {
    pushUnique(
      `The whole class reached the savings goal! Everyone gets ${SEASON_BONUS_MINT} COOP.`
    );
  }

  // 11. Idle (none above)
  if (messages.length === 0) {
    messages.push('Steady day. Check feed, coop, and your savings.');
  }

  return messages.slice(0, 2);
}
