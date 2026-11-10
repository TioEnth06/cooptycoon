# ANIMATION: juice and game feel (Framer Motion + CSS)

Principles: fast (150-600ms), meaningful (shows cause and effect), calm (cozy, not flashy), accessible (`prefers-reduced-motion`), cheap (no heavy libraries, no Lottie, no video). Define shared timings in `src/animation/tokens.ts`.

## Tokens
```ts
export const dur = { fast: 0.15, base: 0.3, slow: 0.6 };
export const ease = { out: [0.22, 1, 0.36, 1], spring: { type: 'spring', stiffness: 260, damping: 18 } };
```

## Priority
- **P0 (do first, highest impact):** hen idle/sick, egg pop, coin fly to balance, balance count-up with flash, day transition, button press feedback, mentor bubble.
- **P1:** level complete screen, goal bar fill, quest check-off, game over screen, price arrow pulse.
- **P2:** confetti burst, ambient scene (clouds, grass sway), badge unlock, optional SFX.

## Catalog
| Element | Animation | Spec |
|---|---|---|
| Hen idle | slow wobble | rotate +-3deg, 3s loop, randomized delay per hen |
| Hen eating (on Next Day) | peck | translateY 0 -> 4px -> 0, 3 pecks, 600ms |
| Hen sick | shake + tint | x +-3px every 1.2s, grayscale 40% + red outline, sick icon pulse |
| Hen dies | fade and drift | opacity 1 -> 0, y -20px, 600ms, small cloud emoji |
| New hen | drop in | y -40 -> 0, spring, squash scale 1.1 x 0.9 -> 1 |
| Egg produced | pop | scale 0 -> 1.2 -> 1 with spring, y -6px bounce |
| Sell eggs | coin arc | coin emoji flies along curved path from coop to balance, 700ms, staggered 60ms per coin (max 6 coins shown) |
| Balance change | count + flash | number counts 500ms; green text flash on gain, red on loss; small +N/-N floater rises 600ms |
| Price change | arrow pulse | arrow up/down, scale 1 -> 1.3 -> 1 once, color by direction |
| Cleaning | sweep | broom emoji sweeps left to right 500ms; cleanliness bar fills with ease-out |
| Medicine | heal | green plus icon rises, hen tint fades back to normal |
| Next Day | day cycle | sun/moon swap, background tint transitions 600ms, day counter flips |
| Mentor bubble | slide in | y +16 -> 0, opacity 0 -> 1, 300ms; mascot bobs once |
| Savings jar deposit | coin drop | coin falls into jar, jar scale 1.05 bounce, interest sparkle on next day |
| Quest done | check pop | checkmark scale spring, row strike-through fade |
| Goal bar | fill | width animates 500ms ease-out; at 100% glow ring pulses twice |
| Level complete | celebration | stars appear one by one (200ms stagger, spring), confetti emoji burst, mentor line fades in |
| Level failed | gentle | screen dims softly, hen looks down (rotate -8deg), no shake or red flash |
| Badge unlock | toast | slides from top, shine sweep across badge, auto-dismiss 3s |
| Class goal reached | big moment | banner slide + emoji burst + all classmate avatars hop |
| Button press | tactile | whileTap scale 0.95; primary "Next Day" gets subtle idle pulse when nothing else to do |
| Screen transitions | slide/fade | AnimatePresence, 250ms, direction by navigation |
| Ambient (P2) | scene life | clouds drift 60s loop, grass sway 4s, occasional butterfly |

## Implementation notes
- Components: `<Hen/>`, `<EggPop/>`, `<CoinFly/>`, `<CountUp/>`, `<Floater/>`, `<Stars/>`, `<Confetti/>`, `<DayCycle/>`.
- Coin fly: measure `getBoundingClientRect()` of source and balance element, animate with `x`/`y` keyframes via Framer Motion; unmount on complete.
- Confetti: 24 absolutely positioned emoji spans with randomized `x`, `rotate`, `y` keyframes (CSS or Framer), no canvas library.
- Use `transform` and `opacity` only (GPU friendly). Avoid animating layout properties on lists.
- Limit simultaneous animations; queue events from `nextDay` and play in sequence: feed -> eggs -> events -> mentor. Total sequence <= 2.5s with a "skip" tap.
- `useReducedMotion()`: disable loops, parallax, confetti; keep short fades and number changes.
- Optional SFX (P2): tiny sounds for coin, egg pop, level up; muted by default with a visible toggle; no external audio libs.

## Sequencing for Next Day (play in order)
1. Day cycle (sun/moon) 600ms
2. Hens peck (feed cost floater) 500ms
3. Eggs pop 400ms
4. Events (feed spike badge, sick shake) 500ms
5. Mentor bubble 300ms
Skippable by tapping anywhere; state updates immediately, animation is cosmetic.

## Demo video tips
Show 3 signature moments clearly: coin fly on sale, hen sick shake + mentor explanation, level complete with stars and class goal celebration.
