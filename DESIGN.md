---
ontology: true
type: spec
domain: suomi-app
status: active
summary: Design system for the Suomi app: tokens, colour blocks, icons, motion, components, screens, haptics
tags: [design, tokens, motion, icons]
related: [SPEC]
---

# Suomi design system

| File | What it holds |
| --- | --- |
| `src/design/tokens.css` | Custom properties: colour, seven block tones, type, spacing, radii, elevation, layers, sizes, motion. Light, dark (system) and dark (forced). |
| `src/design/components.css` | Shared components as class names: shell, tab bar, buttons, chips, cards, colour blocks, units, rows, switch, segmented control, avatar picker, sheet, celebration. |
| `src/design/motion.css` | Every transition and animation, and the one reduced-motion block. |
| `src/styles.css` | Base element rules, then each screen: Home, Welcome, Placement, Lesson and exercises, Result, Profile, Settings. |
| `src/design/Icon.tsx` | `Icon` (29 glyphs), `Avatar` and the `avatars` list. |
| `src/design/gallery.html`, `gallery.tsx` | Review page for the components. `npm run dev`, then open `/src/design/gallery.html`. Not in `dist`. |

`src/main.tsx` imports `tokens.css`, `components.css`, `motion.css`, then `styles.css` last, so a screen rule
beats a component rule of the same specificity.

## Direction

1. **Paper, ink and one lake blue.** A warm off-white page (`#f4f2ec`), near-black ink for text and for
   "chosen", and one deep blue (`--accent`) for what moves you forward: the primary button, the current
   tab, the current step.
2. **Colour blocks carry the structure.** Units, the review card, the result numbers and the profile hero
   sit on soft tinted blocks named after Finnish things: lake, cloudberry, spruce, lingonberry, aurora,
   heather, birch. Units cycle through the seven tones in course order.
3. **Big, heavy titles.** Screen titles are 36 px at weight 800 with tight tracking; exercise prompts are
   30 px. Small uppercase eyebrows label sections. Body text stays at the system size.
4. **Round and pill-shaped.** Cards use 24–32 px radii, buttons are full pills, icon buttons are round
   and outlined. The tab bar floats as a glass pill above the home indicator.
5. **Colour never speaks alone.** Right and wrong carry an icon and a sentence; the chosen answer gets an
   ink outline and a filled disc; the current step is larger and hollow; a chosen level card shows a tick.
6. **One thumb.** Every control is at least 44 px. The primary action sits at the bottom of the screen.
7. **Motion is feedback.** Constant actions do not move. The celebration is spent once, on the result.
8. **Plain CSS.** Tokens and class names, no UI library, no dependency added.

## Tokens

### Colour

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--bg` | `#f4f2ec` | `#0f1114` | Page. Also `theme-color` and the manifest colours |
| `--surface`, `--surface-2` | `#fff`, `#ebe8e0` | `#1a1d22`, `#262a31` | Cards and rows; tracks, key discs, icon tiles |
| `--line`, `--line-strong` | `#e2ded4`, `#8a867c` | darker equivalents | Hairlines; control borders (3:1 or better) |
| `--text`, `--muted` | `#15171c`, `#5b606a` | light equivalents | Text; secondary text |
| `--accent`, `--accent-text`, `--accent-soft` | `#2148b8`, `#fff`, `#e3e9fb` | `#8eaeff`, `#0b1330`, deep blue | Primary action, current tab and step; next lesson row |
| `--ink`, `--ink-text` | `#15171c`, `#fff` | `#f1f2f4`, dark | "Chosen": answer outline and key, level tick, avatar ring |
| `--right`, `--right-bg`, `--right-text` | `#17713a`, `#e0f2e5`, `#fff` | `#6fd08c`, deep green, `#062010` | Right answer, done |
| `--wrong`, `--wrong-bg`, `--wrong-text` | `#b0213f`, `#fbe4e8`, `#fff` | `#ff8fa3`, deep red, dark | Wrong answer |
| `--typo`, `--typo-bg`, `--typo-text` | `#8a5200`, `#fbeed3`, `#fff` | amber equivalents | Accepted with a typo |
| `--block-N-bg`, `-fg`, `-fill` (N = 1…7) | soft tints | deep tints | Colour blocks; `-fill` for bars and burst dots |

Apply a block with `class="block" data-tone="N"`: it sets `--block-bg`, `--block-fg` and `--block-fill`
on the element. The dark values are written twice in `tokens.css`, once for the system setting and once
for `html[data-theme='dark']`; keep the two identical.

### Type, space, shape

- Sizes `--text-xs` … `--text-3xl` (30 px), `--text-display` (36 px). Weights up to `--weight-heavy`
  (800). `--tracking-display` −0.03em for titles, `--tracking-eyebrow` 0.1em for uppercase labels.
- Spacing `--space-1` … `--space-8` on a 4 px base.
- Radii `--radius-sm` 12 px, `-md` 18 px, `-lg` 24 px, `-xl` 32 px, `-full`.
- `--shadow-float` for the tab bar, `--shadow-3` for the feedback sheet.
- `--tabbar-height` 68 px, `--tabbar-gap` 12 px; `.page` and `.has-tabbar` pad for both plus the safe area.

## Contrast

Measured from the token values (WCAG ratio):

| Pair | Light | Dark |
| --- | --- | --- |
| text on bg | 16.0 | 16.9 |
| muted on bg / on surface | 5.6 / 6.3 | 8.1 / 7.2 |
| accent on bg | 7.0 | 8.7 |
| accent-text on accent | 7.8 | 8.4 |
| right / wrong / typo on their bg | 5.2 / 5.5 / 5.6 | 7.3 / 7.3 / 8.1 |
| right-text / wrong-text / typo-text on the solid colour | 6.1 / 6.7 / 6.4 | 9.1 / 8.4 / 9.7 |
| block fg on block bg (all seven) | 8.4–10.0 | 11.0–11.6 |
| line-strong on surface (control borders) | 3.6 | 3.9 |

## Screens

### Tab bar

A floating glass pill (`.tabbar`), inset from the edges and lifted above the home indicator. The current
tab (`aria-current="page"`) becomes an accent pill holding its icon and label side by side and takes more
width; the others show icon over label. Under `prefers-reduced-transparency` the glass is solid.

### Home

- Header: the app name as a big title, with streak and XP chips (numbers, with screen-reader labels).
- Two cards side by side: today's goal as a ring with "15 / 20 XP", and the review deck on a heather block
  with the due count and an inverted "Review now" pill (or a quiet line when nothing is due).
- "Your path": each unit is a native `<details class="unit block">` in its tone, with an eyebrow
  ("Unit 3"), a heavy title, "x / y lessons" and a round chevron. Only the unit being worked on starts open.
- Inside, a surface panel holds the grammar tip (its own `<details>`) and the lesson path: state badges on
  a thread (green after done steps). The next lesson is a raised accent-soft row with a "Start" pill.

### Welcome and placement

- Welcome: eyebrow, display title, four level cards. Each card is a radio with a tick mark on the left,
  three rising bars for the level, the Finnish line in heavy type and its gloss, and a round outlined
  speaker button. The chosen card gets an ink outline, an accent-soft fill and a filled tick.
- Placement: the lesson frame (close, centred title, step dots), "I do not know" as a ghost button above
  Next. The result shows a spruce disc, "Your starting point" and the start unit on its own colour block.

### Lesson

- Top: round outlined close button, the lesson title centred, "n / total" on the right.
- Progress: one dot per exercise (`.steps`, up to 20; a bar beyond). Done dots are filled, the current one
  is bigger and hollow, the rest are outlined. It is a `role="progressbar"` with the done count.
- Choice and listen: lettered answer rows (A, B, C in displayed order). Chosen: ink outline and a filled
  ink key. After Check: the right row turns green with a check, a wrong pick turns red with a cross, the
  rest fade.
- Listen: a wide pill with a round accent play disc.
- True or false: the text in a card, the statement as the prompt, two tall tiles with a check and a cross.
- Fill: the gap is an inline field on the sentence line, tinted with the verdict after Check.
- Translate: one large field. Order: two ruled lines to build on and a pool of word tiles; used tiles leave
  a grey gap. Match: two columns; the picked tile has an ink outline, matched pairs turn dashed green with
  a check. ä ö å are key caps with a raised bottom edge.
- Bottom: a sticky footer with the primary pill. After Check it becomes a sheet with a 32 px top radius,
  tinted by the verdict, with an icon disc, the verdict word, the correct answer when wrong, and the
  Continue pill in the verdict colour.

### Result

A tinted disc with a star and a one-time burst, the headline in display type, then the numbers on colour
blocks: XP earned across the full width, mistakes and streak below.

### Profile and settings

- Profile: the chosen avatar on a block in its tone with a surface ring, the streak in big numerals and the
  best streak. Then "Overview" as a list with icon tiles (XP, today, lessons done, right first time), then
  the avatar picker in a card; the chosen avatar has an ink ring with a gap.
- Settings: uppercase legends over pill-track segmented controls (the chosen segment is lifted), a
  vibration switch row and a placement row, each with an icon tile.

## Components (components.css)

| Class | Notes |
| --- | --- |
| `.btn` + `-primary`, `-secondary`, `-ghost`, `-danger`, `-block`, `-small` | Pills. One line by default; `.btn-block` wraps and is 56 px tall |
| `.icon-btn`, `.icon-btn-outline` | 44 px round; the outline variant has a surface and a hairline, for top bars |
| `.chip` | Small pill for counts in headers |
| `.card`, `.block[data-tone]` | Surface card; tinted block |
| `.eyebrow`, `.page-title`, `.section-title`, `.caption` | Text styles |
| `.unit`, `.unit-head`, `.unit-chevron`, `.unit-panel` | The unit as native `<details>` |
| `.state-badge[data-state]` | Done (check), open (number), locked (lock) |
| `.ring`, `.progress`, `.progress-fill` | Goal ring; bar with inline `scaleX` |
| `.list`, `.row`, `.row-action`, `.row-tile`, `.row-label`, `.row-value` | Lists and rows |
| `.switch`, `.setting`, `.switch-row`, `.segmented`, `.segment` | Settings controls, all native inputs |
| `.avatar-grid`, `.avatar-option` | Avatar picker |
| `.stat-grid`, `.stat-tile` | Number tiles; add `.block` for a tone |
| `.word`, `.word-chip`, `.input`, `.sheet`, `.scrim`, `.celebrate` | Tap-to-hear words, inputs, sheet, result disc |

## Icons

```tsx
import { Icon, Avatar, avatars } from './design/Icon';

<Icon name="flame" />                         // decorative: aria-hidden
<Icon name="close" size={20} title="Close" /> // stands alone: role="img" with a title
<Avatar id="kuusi" size={64} />
```

24 px grid, 2 px round stroke, `currentColor`, drawn for this app. Names: `home path book profile settings
menu close back chevron-down chevron-right check cross lock play speaker volume vibrate flame star target
trophy heart refresh sun moon globe download upload info`. Avatars: `kuusi aalto marja tunturi lumi lehti
kala sieni`. Avatar ids are stored in progress: add new ones at the end, never rename.

## Motion

All of it is in `motion.css`; `components.css` and `styles.css` have none.

| What | Properties | Timing | Why |
| --- | --- | --- | --- |
| Press on `.btn`, `.icon-btn`, `.word-chip`, `.avatar-option`, `.pressable` | `scale(0.97)` | 150 ms ease-out | The control heard the finger |
| Unit chevron, native unit height | `rotate`; `block-size` where `interpolate-size` exists | 240 ms | State; Safari opens at once |
| Sheet and scrim | `translateY`, `opacity` | 200 ms | Spatial |
| Tab change / screen push | `opacity` / plus 8 px rise | 120 / 240 ms | Softens the swap |
| Home path stagger | `opacity`, 8 px rise | 40 ms apart, capped at 8 | First impression |
| Progress bar, goal ring, switch thumb | `scaleX`, `stroke-dashoffset`, `background-position` | 150–300 ms | State |
| Answer rows, step dots | `border-color`, `background-color` | 120 ms | A change of mind never flickers |
| Feedback text after Check | `opacity`, 8 px rise | 240 ms | The footer itself stays put, so Continue never slides under the thumb |
| Celebration | `transform`, `opacity` | 400 ms pop, 600 ms burst | Result screen only |

Never animated: tab pill, segmented choice, letter and tile taps, anything from the keyboard. Hover is
colour only and only under `(hover: hover) and (pointer: fine)`. Entrances are from-only keyframes with
a `backwards` fill, so switching animation off never leaves anything hidden.

Reduced motion (one block at the end of `motion.css`): presses, chevrons, switch, progress and the unit
height change at once; the sheet cross-fades; screen push, stagger, feedback text and the celebration pop
become a 120 ms fade; the burst is not shown.

## Haptics

`src/lib/haptics.ts` holds the patterns and calls `navigator.vibrate` through `haptic(name)`: `right`
(also for a typo), `wrong`, `done` when a lesson ends, `tap` for a tappable word and the avatar picker. Nothing else vibrates. One setting, "Vibration". Safari on iPhone has no Vibration API.

## Mobile details

Tap highlight off, `overscroll-behavior: none`, `100dvh`, `viewport-fit=cover`, 16 px or larger inputs,
per-scheme `theme-color`, safe-area padding on the tab bar, top bars, footers and sheet, no text selection
or callout on controls, hover only for a fine pointer.

## Not verified

- Nothing was tested on a phone. Screens were checked as headless Chrome screenshots at 390 × 844 in both
  themes, which shows layout and colour but not touch, safe areas, keyboard overlap or how motion feels.
- The reduced-motion and reduced-transparency paths were read from code, not run.
- In Finnish only Home, Profile and Settings were screenshotted (light). "Automaattinen" just fits its
  segment at 390 px; a narrower phone may clip it.
