// Shared animation timings and easing from docs/ANIMATION.md

export const dur = {
  fast: 0.15,
  base: 0.3,
  slow: 0.6,
} as const;

export const ease = {
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  spring: {
    type: 'spring' as const,
    stiffness: 260,
    damping: 18,
  },
};
