/**
 * Seeded mulberry32 PRNG that returns a deterministic float in [0, 1)
 * and the updated internal 32-bit state so it can be persisted in GameState.
 */
export function nextRandom(state: number): { value: number; nextState: number } {
  const nextState = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(nextState ^ (nextState >>> 15), 1 | nextState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, nextState };
}

export function createSeededRng(initialSeed: number) {
  let currentState = initialSeed | 0;
  return {
    next(): number {
      const res = nextRandom(currentState);
      currentState = res.nextState;
      return res.value;
    },
    getState(): number {
      return currentState;
    },
  };
}
