---
ontology: true
type: spec
domain: suomi-app
status: active
summary: Design system for the Suomi app: tokens, icons, motion, components, haptics
tags: [design, tokens, motion, icons]
related: [SPEC]
---

# Suomi design system

Everything lives in `src/design/`:

| File | What it holds |
| --- | --- |
| `tokens.css` | Custom properties: colour, type, spacing, radii, elevation, layers, sizes, motion. Light, dark, and a forced-theme hook. |
| `Icon.tsx` | `Icon` (29 glyphs), `Avatar` and the `avatars` list (8 glyphs). |
| `motion.css` | Every transition and animation, and the one reduced-motion block. |
| `components.css` | Static look of the components, as class names. |
| `gallery.html`, `gallery.tsx` | Review page. `npm run dev`, then open `/src/design/gallery.html`. Not a build entry, so it is not in `dist`. |

Nothing in the app imports these files yet. See [Wiring in](#wiring-in).

## Principles

1. **Lake and birch.** Warm paper background, one deep lake blue for everything that can be
   acted on, and three berry-and-forest colours that are used only for meaning: forest green
   for right, lingonberry for wrong, cloudberry for "nearly". No mascot, no green brand, no
   candy gradients.
2. **Colour never speaks alone.** Right and wrong carry an icon and a word. Locked, open and
   done differ by icon. The current tab has a pill, a switch moves its thumb, a selected
   segment has an outline.
3. **One thumb.** Controls are at least 44 px. The primary action is at the bottom. The tab
   bar and sheets pad themselves away from the home indicator.
4. **Motion is feedback, not decoration.** If the learner does it constantly, it does not
   animate. Delight is spent once, on the result screen.
5. **Plain CSS, small surface.** Tokens and class names. No UI library, no runtime theme code
   beyond one attribute on `<html>`.

## Tokens

All on `:root` in `src/design/tokens.css`. Dark values apply under
`@media (prefers-color-scheme: dark)` unless `<html data-theme="light">` is set, and under
`<html data-theme="dark">` whatever the OS says. The dark values are written twice (the two
blocks must stay identical).

### Colour

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--bg` | `#f7f6f2` | `#14161a` | Page, app bar, tab bar |
| `--surface` | `#ffffff` | `#1e2127` | Cards, rows, sheets, inputs |
| `--surface-2` | `#eeece5` | `#272b33` | Sunken: tracks, pressed rows, locked badge |
| `--line` | `#d9d7cf` | `#353a44` | Decorative dividers and card hairlines |
| `--line-strong` | `#85837b` | `#727987` | Outlines that must be seen: input, switch (3:1) |
| `--scrim` | `rgb(20 22 26 / 0.45)` | `rgb(0 0 0 / 0.6)` | Behind a sheet |
| `--text` | `#1b1d22` | `#eef0f3` | Body text |
| `--muted` | `#5a606b` | `#a3a9b4` | Secondary text, idle icons |
| `--accent` | `#1b4f9c` | `#8fb5ff` | Brand: primary button, links, current tab, progress |
| `--accent-strong` | `#143c78` | `#b4cdff` | Pressed and hovered primary |
| `--accent-soft` | `#e2ebf8` | `#1c2b47` | Tinted background: pressed word, current tab pill |
| `--accent-text` | `#ffffff` | `#0c1020` | Text on `--accent` |
| `--right` / `--right-bg` | `#17713a` / `#dff3e4` | `#6fd08c` / `#173524` | Correct answer |
| `--wrong` / `--wrong-bg` | `#a81e3a` / `#fbe3e7` | `#ff8fa0` / `#3d1a22` | Wrong answer |
| `--typo` / `--typo-bg` | `#8a5200` / `#fbeed3` | `#f2bd5c` / `#3a2c10` | Accepted with a typo |
| `--danger` | = `--wrong` | = `--wrong` | Destructive button (reset progress) |
| `--danger-strong` | `#86172d` | `#ffb3bf` | Pressed danger |
| `--danger-text` | `#ffffff` | `#2a0a12` | Text on `--danger` |
| `--locked-fg` / `--locked-bg` | = `--muted` / `--surface-2` | same | Locked lesson or unit |
| `--open-fg` / `--open-bg` | = `--accent-text` / `--accent` | same | Open lesson or unit |
| `--done-fg` / `--done-bg` | = `--right` / `--right-bg` | same | Finished lesson or unit |
| `--streak` | `#b4500a` | `#ff9d4d` | Flame |
| `--xp` | `#7d6200` | `#f0c94a` | Star |
| `--goal` | = `--accent` | = `--accent` | Daily goal ring |
| `--mastery-0` … `--mastery-4` | `#d9d7cf` `#b5c8e6` `#7c9fd6` `#4273bd` `#1b4f9c` | `#353a44` `#2f4675` `#4168ad` `#6590dc` `#8fb5ff` | Rule mastery fill, unseen to mastered |
| `--tone-1…4-bg` / `-fg` | blue, lingonberry, forest, cloudberry tints | dark tints | Avatar discs |

Mastery level from the two numbers in SPEC section 7: 0 when `n = 0`, 1 when `s < 0.4`,
2 when `s < 0.6`, 3 when `s < 0.8`, 4 when mastered (`s >= 0.8` and `n >= 8`). The fill
length shows `s`; always print the percentage or "mastered" next to it, because the two
palest steps are below 3:1 against the track.

### Type

System font (`--font-sans`). It already carries optical sizing and renders ä and ö well.

| Token | Size | Use |
| --- | --- | --- |
| `--text-xs` | 12 px | Tab labels (with `--tracking-wide`) |
| `--text-sm` | 14 px | Captions, row hints |
| `--text-md` | 16 px | Body, inputs. Never smaller in an input. |
| `--text-lg` | 17 px | Buttons, answer options, module titles |
| `--text-xl` | 20 px | Section titles |
| `--text-2xl` | 24 px | Prompts, stat values (with `--tracking-tight`) |
| `--text-3xl` | 32 px | Result headline (with `--tracking-tight`, `--leading-tight`) |

Leading: `--leading-tight` 1.15, `--leading-snug` 1.3, `--leading-normal` 1.5.
Weights: `--weight-regular` 400, `--weight-medium` 600, `--weight-bold` 700.

### Spacing, radii, elevation, layers, sizes

| Group | Tokens |
| --- | --- |
| Spacing (4 px base) | `--space-1` 4, `-2` 8, `-3` 12, `-4` 16, `-5` 24, `-6` 32, `-7` 48, `-8` 64 px |
| Radii | `--radius-sm` 8, `--radius-md` 12, `--radius-lg` 20 px, `--radius-full` |
| Elevation | `--shadow-1` hairline lift, `--shadow-2` raised card, `--shadow-3` bottom sheet |
| Layers | `--z-sticky` 10, `--z-tabbar` 20, `--z-scrim` 30, `--z-sheet` 40, `--z-toast` 50 |
| Sizes | `--tap-min` 44 px, `--tabbar-height` 56 px, `--appbar-height` 52 px, `--content-max` 34rem |

### Motion tokens

| Token | Value | Use |
| --- | --- | --- |
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entering, leaving, press |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Something that moves across the screen (reserved, unused so far) |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Bottom sheet |
| `--dur-fast` | 120 ms | Tab change, reduced-motion fades |
| `--dur-press` | 150 ms | Press scale, switch thumb |
| `--dur-sheet` | 200 ms | Sheet, scrim, screen push |
| `--dur-collapse` | 240 ms | Module open and close |
| `--dur-progress` | 250 ms | Progress bar |
| `--dur-enter` | 300 ms | List rise, ring fill |
| `--dur-celebrate` | 600 ms | Result burst |
| `--stagger-step` | 40 ms | Delay between list items |

### Renames and changed values

No existing custom property was renamed. All twelve names in `src/styles.css` are kept.
Five values changed for the new palette:

| Token | Was (light / dark) | Now (light / dark) |
| --- | --- | --- |
| `--muted` | `#5d6470` / `#a3a9b4` | `#5a606b` / unchanged |
| `--accent` | `#1d4ed8` / `#7aa2ff` | `#1b4f9c` / `#8fb5ff` |
| `--wrong` | `#b42318` / `#ff8f85` | `#a81e3a` / `#ff8fa0` |
| `--wrong-bg` | `#fde4e1` / `#3b1c19` | `#fbe3e7` / `#3d1a22` |

`--bg` is unchanged on purpose: `index.html` (`theme-color`) and the PWA manifest in
`vite.config.ts` hardcode it.

## Contrast

WCAG 2 ratios, computed from the values in `tokens.css`. Text needs 4.5, large text and
control outlines need 3.

| Foreground | Background | Light | Dark | Needs |
| --- | --- | --- | --- | --- |
| `--text` | `--bg` | 15.59 | 15.86 | 4.5 |
| `--text` | `--surface` | 16.86 | 14.13 | 4.5 |
| `--text` | `--surface-2` | 14.26 | 12.43 | 4.5 |
| `--muted` | `--bg` | 5.85 | 7.67 | 4.5 |
| `--muted` | `--surface` | 6.32 | 6.83 | 4.5 |
| `--muted` | `--surface-2` | 5.35 | 6.01 | 4.5 |
| `--accent` | `--bg` | 7.34 | 8.82 | 4.5 |
| `--accent` | `--surface` | 7.94 | 7.85 | 4.5 |
| `--accent` | `--accent-soft` | 6.61 | 6.88 | 4.5 |
| `--accent-text` | `--accent` | 7.94 | 9.20 | 4.5 |
| `--accent-text` | `--accent-strong` | 10.78 | 11.81 | 4.5 |
| `--right` | `--right-bg` | 5.23 | 7.05 | 4.5 |
| `--right` | `--surface` | 6.07 | 8.51 | 4.5 |
| `--right` | `--bg` | 5.61 | 9.55 | 4.5 |
| `--text` | `--right-bg` | 14.52 | 11.71 | 4.5 |
| `--muted` | `--right-bg` | 5.44 | 5.66 | 4.5 |
| `--wrong` | `--wrong-bg` | 5.92 | 7.08 | 4.5 |
| `--wrong` | `--surface` | 7.21 | 7.44 | 4.5 |
| `--wrong` | `--bg` | 6.67 | 8.36 | 4.5 |
| `--text` | `--wrong-bg` | 13.85 | 13.43 | 4.5 |
| `--muted` | `--wrong-bg` | 5.19 | 6.49 | 4.5 |
| `--typo` | `--typo-bg` | 5.56 | 7.89 | 4.5 |
| `--typo` | `--surface` | 6.39 | 9.38 | 4.5 |
| `--typo` | `--bg` | 5.91 | 10.53 | 4.5 |
| `--text` | `--typo-bg` | 14.67 | 11.88 | 4.5 |
| `--muted` | `--typo-bg` | 5.50 | 5.75 | 4.5 |
| `--danger-text` | `--danger` | 7.21 | 8.42 | 4.5 |
| `--danger-text` | `--danger-strong` | 9.66 | 10.82 | 4.5 |
| `--streak` | `--bg` | 4.75 | 8.78 | 4.5 |
| `--streak` | `--surface` | 5.13 | 7.82 | 4.5 |
| `--xp` | `--bg` | 5.37 | 11.35 | 4.5 |
| `--xp` | `--surface` | 5.80 | 10.11 | 4.5 |
| `--tone-1-fg` | `--tone-1-bg` | 6.35 | 6.88 | 3 |
| `--tone-2-fg` | `--tone-2-bg` | 5.80 | 7.08 | 3 |
| `--tone-3-fg` | `--tone-3-bg` | 5.09 | 7.05 | 3 |
| `--tone-4-fg` | `--tone-4-bg` | 5.41 | 7.89 | 3 |
| `--line-strong` | `--bg` | 3.51 | 4.14 | 3 |
| `--line-strong` | `--surface` | 3.80 | 3.69 | 3 |
| `--accent` | `--surface-2` | 6.72 | 6.91 | 3 |
| `--mastery-3` | `--surface-2` | 4.02 | 4.44 | 3 |

Not covered: disabled buttons (`--muted` on `--line`, exempt under WCAG) and
`--mastery-0` to `--mastery-2`, which are fills that always sit next to a number.

## Icons

```tsx
import { Icon, Avatar, avatars } from './design/Icon';

<Icon name="flame" />                       // decorative: aria-hidden
<Icon name="close" size={20} title="Close" /> // stands alone: role="img" with a title
<Avatar id="kuusi" size={64} />
```

24 px grid, 2 px round stroke, 3 px clear margin, `currentColor`. Each glyph is one path
string in `Icon.tsx`, drawn for this app. `iconNames` lists them for tooling.

| Name | Use |
| --- | --- |
| `home`, `book`, `profile`, `settings` | Tab bar: Home, Rules, Profile, Settings |
| `path` | Lessons, an open unit |
| `menu`, `close`, `back`, `chevron-down`, `chevron-right` | Navigation |
| `check`, `cross` | Right and wrong, done |
| `lock` | Locked lesson or unit |
| `play`, `speaker`, `volume` | Play audio; tap-to-hear; sound setting |
| `vibrate` | Haptics setting |
| `flame`, `star`, `target`, `trophy`, `heart` | Streak, XP, daily goal, level, favourite |
| `refresh` | Practice mistakes |
| `sun`, `moon` | Theme |
| `globe` | Interface language |
| `download`, `upload` | Export and import progress |
| `info` | About, hints |

`cross` is the answer mark and is drawn slightly smaller than `close`, to match `check`.

Avatars (`avatars`, each `{ id, label, tone, d }`): `kuusi` spruce, `aalto` wave, `marja`
berries, `tunturi` fell, `lumi` snowflake, `lehti` leaf, `kala` fish, `sieni` mushroom.
Store the `id` in progress. Ids are stable: add new avatars at the end, never rename.

## Motion

All of it is in `src/design/motion.css`. `components.css` has no transitions.

### What animates

| What | Class | Properties | Duration, easing | Why |
| --- | --- | --- | --- | --- |
| Press | `.btn`, `.icon-btn`, `.word-chip`, `.avatar-option`, any `.pressable` | `transform: scale(0.97)` | 150 ms `--ease-out` | Feedback: the control heard the finger |
| Module header press | `.module-head` | `scale(0.99)` plus a tint | 150 ms `--ease-out` | Same, but 0.97 on a full-width row shifts its text |
| Collapsible | `.collapse[data-open]` | `grid-template-rows`, `opacity` | 240 ms `--ease-out` | Shows where the lessons came from and keeps the list below from jumping |
| Chevron | `.module-chevron` | `transform: rotate` | 240 ms `--ease-out` | State |
| Bottom sheet | `.sheet[data-open]`, `.scrim[data-open]` | `transform: translateY(100%)`, `opacity` | 200 ms `--ease-drawer` | Spatial: comes from the bottom, leaves to the bottom |
| Tab change | `.screen-enter` | `opacity` | 120 ms `ease` | Softens the swap. No movement: tabs are tapped often |
| Screen push | `.screen-push` | `opacity`, `translateY(8px)` | 200 ms `--ease-out` | Entering a lesson or the result is rarer |
| Home path | `.stagger > *` | `opacity`, `translateY(8px)` | 300 ms `--ease-out`, 40 ms apart, capped at 8 steps | First impression of the path |
| Progress bar | `.progress-fill` | `transform: scaleX` | 250 ms `--ease-out` | State |
| Goal ring | `.ring-value` | `stroke-dashoffset` | 300 ms `--ease-out` | State |
| Switch | `.switch::before` | `transform: translateX` | 150 ms `--ease-out` | State |
| Celebration | `.celebrate-mark`, `.celebrate-burst > i` | `transform`, `opacity` | 400 ms pop, 600 ms burst, `--ease-out` | Delight, result screen only |

### What never animates

- **Answer selection**: `.option`, `.tile`, `.letter`, match pairs. It happens every few
  seconds. The border changes at once. These classes are deliberately not in the press list.
- **Segmented control**: no sliding thumb. The selected segment changes at once.
- **Tappable word in running text** (`.word`): colour only. Sound is the feedback.
- **Tab bar icons**: the pill appears at once.
- **Anything started from the keyboard.**
- **Hover**: colour only, and only under `@media (hover: hover) and (pointer: fine)`.

### Rules

- `transform` and `opacity` only. Two exceptions, both small and rare: the collapsible
  (below) and the ring's `stroke-dashoffset`, which repaints one 64 px SVG when XP changes.
- Toggles (collapsible, sheet, switch, progress) are transitions, so a second tap reverses
  from where the motion is instead of restarting.
- One-shot entrances are from-only keyframes with a `backwards` fill and names prefixed
  `ds-`. The resting style is always the visible one, so switching the animation off can
  never leave an element invisible.
- Nothing starts at `scale(0)`. Nothing uses `ease-in`. Nothing in the interface runs
  longer than 300 ms; only the celebration does.
- Play `.stagger` once per app start, not every time Home comes back from a lesson. Add the
  class on the first render only.

### The collapsible: why grid rows

The unit section opens by changing `grid-template-rows` from `0fr` to `1fr` on `.collapse`.
The alternative was a native `<details>` with `interpolate-size` and `::details-content`.

- The grid version animates in every current engine. The app runs as a PWA in Safari as
  well as in the Android WebView; `interpolate-size` is Chromium-only, so on an iPhone the
  native version would snap.
- The fallback is built in: an engine that cannot interpolate grid rows shows the end state
  at once. No feature query is needed.
- No layout thrash: the browser interpolates the track size itself. Nothing reads
  `scrollHeight`, nothing writes a pixel height, and React does not re-render per frame.
- It is still a layout animation: the units below move on every frame. Nothing composite-only
  can do that, and the skills accept height here. It runs for 240 ms on a short list.
- Cost: the open state is ours to keep (`aria-expanded` on the button, `data-open` on the
  panel), and closed content is taken out of the tab order and the accessibility tree with
  `visibility: hidden` after the close has finished.

Structure, three levels (padding goes on the third, or it leaks height when closed):

```html
<div class="collapse" id="u02-lessons" data-open="true">
  <div class="collapse-inner">
    <div class="module-body">…</div>
  </div>
</div>
```

### Reduced motion

One block at the end of `motion.css`. Movement is removed, short fades stay:

| Normal | Under `prefers-reduced-motion: reduce` |
| --- | --- |
| Press scale | None. Pressed colour still shows; a bare `.pressable` dims to 0.7 |
| Collapsible, chevron, switch, progress bar, ring | Change at once |
| Sheet slide | 120 ms cross-fade in place |
| Screen push, list stagger, celebration pop | 120 ms fade, no delay |
| Celebration burst | Not shown |

## Components

Class names from `src/design/components.css`. All tappable classes set
`touch-action: manipulation`, `user-select: none`, no tap highlight and a 3 px
`:focus-visible` outline. Pressed states are `:active`; disabled is the `disabled` attribute.

### App shell

```html
<div class="app">
  <header class="appbar">…</header>
  <main class="screen has-tabbar">…</main>
  <nav class="tabbar">…</nav>
</div>
```

`.app` is the centred 34rem column at `100dvh`. `.screen` pads the sides and respects the
left and right safe areas. `.has-tabbar` leaves room for the tab bar and the home indicator.
Text helpers: `.section-title`, `.display`, `.caption`, `.tint-streak`, `.tint-xp`, `.tint-goal`.

### Bottom tab bar

```tsx
<nav className="tabbar" aria-label="Main">
  <button type="button" className="tab" aria-current="page">
    <span className="tab-icon"><Icon name="home" /></span>
    Home
  </button>
  <button type="button" className="tab">
    <span className="tab-icon"><Icon name="book" /></span>
    Rules
  </button>
  …Profile (profile), Settings (settings)
</nav>
```

Fixed, 56 px plus `env(safe-area-inset-bottom)`. Current tab: `aria-current="page"`.

### Top app bar

```tsx
<header className="appbar">
  <button type="button" className="icon-btn" aria-label="Back"><Icon name="back" /></button>
  <h1 className="appbar-title">Rules</h1>
  <span className="appbar-stat tint-streak"><Icon name="flame" size={20} /> 7</span>
</header>
```

Sticky, pads itself below the notch.

### Buttons

```html
<button type="button" class="btn btn-primary btn-block">Check</button>
<button type="button" class="btn btn-secondary">Practice mistakes</button>
<button type="button" class="btn btn-ghost">Skip</button>
<button type="button" class="btn btn-danger">Reset progress</button>
<button type="button" class="icon-btn" aria-label="Close">…</button>
```

48 px tall. Pressed: darker fill plus the 0.97 scale. Disabled: grey fill, muted text.
`.btn-block` is full width. `.icon-btn` is a 44 px round ghost button.

### Card

```html
<div class="card">…</div>
<div class="card card-raised">…</div>
```

### Collapsible module (unit section)

```tsx
<section className="module" data-state="open">
  <h2 className="module-heading">
    <button type="button" className="module-head" aria-expanded={open} aria-controls="u02-lessons" onClick={toggle}>
      <span className="state-badge" data-state="open"><Icon name="path" size={20} /></span>
      <span className="module-title">
        2. Minä ja sinä
        <span className="module-meta">1 of 4 lessons</span>
      </span>
      <Icon name="chevron-down" className="module-chevron" />
    </button>
  </h2>
  <div className="collapse" id="u02-lessons" data-open={open}>
    <div className="collapse-inner">
      <div className="module-body">…lessons…</div>
    </div>
  </div>
</section>
```

`data-state` on `.module` and on `.state-badge`: `locked`, `open` (default) or `done`.
A locked module has a disabled header and no chevron.

### Stat tile

```tsx
<div className="stat-grid">
  <div className="stat-tile">
    <span className="stat-tile-value"><Icon name="flame" className="tint-streak" /> 7</span>
    <span className="stat-tile-label">Day streak</span>
  </div>
</div>
```

### Progress ring

```tsx
<div className="ring" style={{ '--ring-size': '4rem' }}>
  <svg viewBox="0 0 36 36" aria-hidden="true">
    <circle className="ring-track" cx="18" cy="18" r="15" pathLength="100" />
    <circle className="ring-value" cx="18" cy="18" r="15" pathLength="100" strokeDashoffset={100 - percent} />
  </svg>
  <span className="ring-label">12/20</span>
</div>
```

`data-done="true"` on `.ring` turns the arc green; put a `check` icon in the label then.
Clamp `percent` to 0–100.

### Progress and mastery bar

```tsx
<div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={60}>
  <div className="progress-fill" style={{ transform: 'scaleX(0.6)' }} />
</div>
<div className="progress progress-thin">
  <div className="progress-fill" data-level="3" style={{ transform: 'scaleX(0.7)' }} />
</div>
```

`data-level` 0–4 picks the mastery colour.

### List row

```tsx
<ul className="list">
  <li className="row">
    <Icon name="volume" className="row-icon" />
    <span className="row-label">Sound<span className="row-hint">Speak Finnish words aloud</span></span>
    <button type="button" role="switch" className="switch" aria-checked={on} aria-label="Sound" />
  </li>
  <li>
    <button type="button" className="row row-action">
      <span className="row-label">Language</span>
      <span className="row-value">English</span>
    </button>
  </li>
</ul>
```

A row that is itself tappable adds `.row-action`.

### Switch

```html
<button type="button" role="switch" class="switch" aria-checked="true" aria-label="Sound"></button>
```

52 × 32 px drawn, 60 × 52 px touch target through `::after`.

### Segmented control

```tsx
<div className="segmented" role="radiogroup" aria-label="Daily goal">
  <button type="button" role="radio" aria-checked={goal === 10}>10 XP</button>
  <button type="button" role="radio" aria-checked={goal === 20}>20 XP</button>
  <button type="button" role="radio" aria-checked={goal === 30}>30 XP</button>
</div>
```

### Avatar

```tsx
<Avatar id={progress.avatar} size={64} className="avatar" />

<div className="avatar-grid" role="radiogroup" aria-label="Avatar">
  {avatars.map((a) => (
    <button key={a.id} type="button" role="radio" className="avatar-option" aria-checked={a.id === current} aria-label={a.label}>
      <Avatar id={a.id} size={52} className="avatar" />
    </button>
  ))}
</div>
```

### Tappable word

```tsx
<p lang="fi">
  <button type="button" className="word" onClick={() => speaker.speak('kahvista')}>kahvista</button>
</p>
<button type="button" className="word-chip" lang="fi"><Icon name="speaker" size={18} /> kahvi</button>
```

`.word` sits in running text. The affordance is a dotted blue underline; pressed, the word
turns blue on a blue tint. Its box is one line tall, so `::after` extends the touch target
to 44 px. `.word-chip` stands alone and has a speaker icon. Both accept
`aria-pressed="true"` to hold the pressed look while the word is being spoken.

### Input

```html
<input class="input" type="search" placeholder="Search rules" enterkeyhint="search" />
```

16 px text, 48 px tall.

### Bottom sheet

```tsx
<div className="scrim" data-open={open} onClick={close} />
<div className="sheet" role="dialog" aria-modal="true" aria-labelledby="goal-title" data-open={open}>
  <h2 className="sheet-title" id="goal-title">Daily goal</h2>
  …
</div>
```

Keep both mounted and flip `data-open`, so the sheet can slide out as well as in. Focus
handling and Escape are the caller's job.

### Celebration (result screen only)

```tsx
<div className="celebrate">
  <span className="celebrate-burst" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></span>
  <Icon name="star" size={72} className="celebrate-mark" />
</div>
```

## Haptics

The app calls `navigator.vibrate(pattern)`. Haptics are kept for the few moments that have
an outcome. Used on every tap, they stop meaning anything.

| Moment | Pattern (ms) | Note |
| --- | --- | --- |
| Check: answer right | `12` | One light tick, with the green sheet |
| Check: accepted with a typo | `12` | Same as right; the text explains the typo |
| Check: answer wrong | `[30, 60, 30]` | Two firmer pulses. The only "error" pattern in the app |
| Lesson finished (result screen appears) | `[15, 50, 15, 50, 40]` | Starts with the celebration. Covers goal reached and streak extended too: one pattern, not three in a row |
| Switch toggled | `10` | Confirms the flip |
| Everything else | none | Button press, tab change, answer selection, tile and letter taps, word tap (sound is the feedback), collapsible, sheet, typing, scrolling |

Rules:

- Fire in the same handler that changes the screen, so the pulse and the picture land together.
- One setting, "Vibration" (`vibrate` icon). Do not tie it to `prefers-reduced-motion`.
- Guard with `'vibrate' in navigator`. Safari on iPhone has no Vibration API, so the PWA
  there is silent; that is acceptable.
- Pulses under 10 ms are not felt on many phones, so nothing here is shorter.
- To check on a device: the Android WebView may need the `VIBRATE` permission in
  `AndroidManifest.xml` before `navigator.vibrate` does anything. Not verified.

## Mobile-native details

Already in `src/styles.css` and kept: tap highlight off, `overscroll-behavior: none` on
`html`, `100dvh`, `viewport-fit=cover`, 16 px inputs, per-scheme `theme-color`.
Added by the components: safe-area padding on the tab bar, app bar, screen and sheet;
`overscroll-behavior: contain` on the sheet; no text selection or long-press callout on
controls; hover only for a fine pointer.

## Wiring in

1. `src/main.tsx`: import in this order.

   ```ts
   import './design/tokens.css';
   import './styles.css';
   import './design/motion.css';
   import './design/components.css';
   ```

2. `src/styles.css`: delete the custom properties in `:root` (lines 2–13) and the whole
   dark block (lines 19–33). Keep `font-family`, `color` and `background` on `:root`. If the
   old block stays, its light values override the new ones, because it loads later with the
   same specificity.
3. Theme setting: `document.documentElement.dataset.theme = 'dark'` or `'light'`; delete
   the attribute for "follow the system". When a theme is forced, also set the two
   `<meta name="theme-color">` tags to that theme's `--bg` so the status bar matches.
4. Replace emoji with icons: 🔥 `flame`, ★ `star`, ✓ `check`, ✕ `close` (quit) or `cross`
   (wrong answer), 🔒 `lock`, 🔊 `speaker`.
5. Class mapping. Old classes keep working; move screen by screen.

| Existing | New | Note |
| --- | --- | --- |
| `.primary` | `.btn .btn-primary .btn-block` | |
| `.play` | `.btn .btn-secondary .btn-block` | With `<Icon name="speaker" />` |
| `.quit` | `.icon-btn` | With `<Icon name="close" />` |
| `.bar`, `.bar-fill` | `.progress`, `.progress-fill` | Same inline `scaleX` |
| `.stats`, `.brand`, `.stat` | `.appbar`, `.appbar-title`, `.appbar-stat` | |
| `.unit-title` + `.lessons` | `.module` + `.collapse` | `details.tip` can stay inside `.module-body` |
| `.lesson-node` | `.row .row-action .pressable` inside `.list` | |
| `.node-number` | `.state-badge[data-state]` | |
| `.node-title`, `.node-state` | `.row-label`, `.row-value` | |
| `.tip`, `.tf-text` | `.card` | |
| `.translate-input` | `.input` | `.fill-input` stays: it is inline in a sentence |
| `.result-mark` | `.celebrate` + `.celebrate-mark` | |
| `.result-stats` | `.stat-grid` + `.stat-tile`, with `.stagger` | |
| `.home` | `.screen .has-tabbar` | |
| `.action`, `.feedback`, `.is-right`, `.is-wrong` | unchanged | An `.is-typo` variant can now use `--typo` and `--typo-bg` |
| `.option`, `.tile`, `.letter`, `.match` | unchanged | No press animation, on purpose |

6. The feedback footer keeps its current motion (the text rises 200 ms inside a footer that
   stays put). Sliding the whole footer would move the Continue button under the thumb.
   `.sheet` is for menus such as the goal or avatar picker.
7. After wiring, the `rise` and `pop` keyframes in `styles.css` can be replaced by
   `ds-rise` and `ds-pop`; until then both sets coexist.

## Not verified

- Nothing was tested on a phone. The gallery was checked in a desktop browser at 375 px
  wide in both themes, which shows layout and colour but not tap delay, safe areas, sticky
  hover or how the motion feels under a finger.
- Motion timing was read from code and still screenshots, not watched frame by frame.
