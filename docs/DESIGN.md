# DESIGN

## Style
Cozy flat illustration, rounded shapes, friendly. Use emoji and inline SVG only (no image assets). Mobile-first (max width 480px centered on desktop).

## Palette
| Role | Hex |
|---|---|
| Background | #FFF6E5 |
| Surface/card | #FFFFFF |
| Egg yellow (primary) | #FFC83D |
| Grass green (success) | #6BBF59 |
| Barn red (danger/sick) | #E5604D |
| Sky blue (info/mentor) | #7CC4F0 |
| Text | #3B2F2F |
| Muted text | #8A7A70 |

Use at most these colors. Red only for danger.

## Typography
Headings: Fredoka (Google Fonts). Body: Nunito. Minimum body size 16px. Big tap targets (min 48px).

## Layout (single screen)
1. TopBar: coin balance (left), Day counter (right), small "Proof" icon.
2. Coop area (center): hens in a grid, cleanliness meter under the coop, feed spike badge if active.
3. MentorBubble: sits above the action bar, sky blue, with a small mascot emoji.
4. ActionBar (bottom, sticky): Clean, Medicine, Sell Eggs, Savings, **Next Day** (largest, primary).
5. Savings and Class goal are cards opened from the action bar (bottom sheet).

## Animations (Framer Motion, keep each under 600ms)
| Element | Animation |
|---|---|
| Hen idle | slow rotate wobble +-3deg loop (3s) |
| Hen sick | horizontal shake + desaturate, red tint |
| Egg produced | scale 0 -> 1.2 -> 1 pop with small bounce |
| Sell eggs | coin emoji flies from coop to balance, balance counts up |
| Balance change | count-up/down over 500ms; green flash on gain, red on loss |
| Mentor bubble | slide up + fade in; typewriter optional |
| Price change | arrow up/down + color pulse once |
| Goal reached | confetti-like emoji burst (CSS) + banner |
| Next Day | brief sun/moon swap, background tint shift |

Respect `prefers-reduced-motion`: disable loops, keep fades only.

## Copy tone
Short, warm, cause-and-effect. Never shame. Max 2 sentences per mentor message. Use "coins" not "tokens" in game UI.

## Hidden chain
Main UI never says wallet, gas, blockchain, NEAR. The Proof drawer (small icon) shows: "Powered by NEAR testnet", list of proofs with links. Footer: "Virtual coins for learning. No real money."

## Accessibility
Color is never the only signal (sick hens also show an icon). Labels on all buttons. Sufficient contrast. SFX off by default.
