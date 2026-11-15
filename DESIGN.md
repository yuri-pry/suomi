---
ontology: true
type: spec
domain: suomi-app
status: active
summary: Design system for the Suomi app: tokens, type, components, screens, motion
tags: [design, tokens, motion, icons]
related: [SPEC, redesign]
---

# Suomi design system

Version 2 (2026-11-15). Rebuilt from a set of reference screenshots of a modern language
app: warm paper, white cards, big bold type, near-black pill buttons, one accent colour
for progress and highlights, and colourful tiles on the home screen. The structure and
feel come from the references. The colours, names and content are Suomi's own, and there
is still no mascot.

Everything lives in `src/design/`:

| File | What it holds |
| --- | --- |
| `tokens.css` | Custom properties and the bundled Inter font. Light, dark, and a forced-theme hook. |
| `components.css` | Base element styles and every component, as class names. Static look only. |
| `motion.css` | Every transition and animation, and the one reduced-motion block. |
| `Icon.tsx` | `Icon` (31 glyphs), `Avatar` and the `avatars` list. |
| `Ring.tsx` | The progress ring used by the daily goal tile. |
| `gallery.html`, `gallery.tsx` | Review page with a live contrast check. `npm run dev`, then open `/src/design/gallery.html`. Not in `dist`. |

Load order (in `src/main.tsx`): `tokens.css`, `components.css`, `motion.css`.

## Principles

1. **Paper, ink, lake.** Warm off-white page, white cards with hairlines, near-black (ink)
   for the one primary action, and lake blue for everything that shows progress or points
   at the next thing: step dashes, the NEXT pill, the round arrow, Finnish highlighted in
   explanations. Forest, lingonberry and cloudberry are used only for right, wrong and
   "nearly".
2. **Big type does the work.** Headlines are large, bold and tight (Inter, -0.035em).
   Labels above them are small uppercase eyebrows with wide tracking. Body text is quiet
   grey. Hierarchy comes from size and weight, not from boxes.
3. **Finnish is touchable.** A Finnish word in a prompt sits on a beige chip and speaks
   when tapped. Finnish inside an English explanation is a lake-blue highlight.
4. **Colour never speaks alone.** Right and wrong carry an icon and a word, and the option
   itself shows a check or cross. Lesson states differ by corner mark: check, ring, lock.
   The current tab is a dark pill with its label.
5. **One thumb.** Controls are at least 44 px, primary pills are 56 px and sit at the
   bottom. The tab bar floats above the home indicator.
6. **Motion is feedback, not decoration.** Press scale, progress, one rise on the home
   tiles, one pop on the result. Nothing animates on answer selection.

## Tokens

All on `:root` in `tokens.css`. Dark values apply under `prefers-color-scheme: dark`
unless `<html data-theme="light">`, and under `<html data-theme="dark">` whatever the OS
says. The dark block is written twice; the two copies must stay identical.

### Colour

| Token | Light | Use |
| --- | --- | --- |
| `--bg` | `#f8f7f3` | Page. Also in `index.html` theme-color and the PWA manifest. |
| `--surface` | `#ffffff` | Cards, options, inputs, tab bar |
| `--surface-2` | `#f3f1eb` | Sunken: locked lessons, stat strip, option keys, chips |
| `--chip` | `#ece7dc` | Tappable Finnish words, ä/ö/å keys |
| `--line` / `--line-strong` | `#e7e4dc` / `#8b887f` | Hairlines / outlines that must be seen (3:1) |
| `--text` / `--muted` / `--subtle` | `#111318` / `#5d636f` / `#8a909b` | Body / secondary / large-text-only counters |
| `--ink` / `--ink-text` | `#111318` / `#ffffff` | Primary pill, selected option, current tab, open lesson outline |
| `--accent` / `--accent-soft` | `#3b5bdb` / `#e8ecfc` | Progress, NEXT pill, round arrow, highlights, sentence zone |
| `--right`, `--wrong`, `--typo` (+ `-bg`) | forest, lingonberry, cloudberry | Answer feedback only |
| `--tone-night-*` | `#23252d` | Continue tile, continue bar |
| `--tone-lake-*` | `#3b5bdb` | Review tile, stage badge |
| `--tone-sun-*` | `#f2b93b` | Daily goal tile, result mark |
| `--tone-mint-*` | `#cfe9e5` | Grammar tile and tip links |
| `--streak`, `--xp` | `#e3780c`, `#a07800` | Flame and star (icons, large text) |
| `--mastery-0…4` | track to accent | Rule mastery fill (with a printed value) |
| `--tone-1…4-bg/fg` | blue, red, green, yellow tints | Unit number tiles, avatars |

In dark mode ink flips to near-white with dark text, so the primary pill stays the
strongest thing on screen. The gallery checks every text and background pair in use
(4.5:1, or 3:1 for large text) in both themes; all pass.

### Type

Inter, variable, bundled from `@fontsource-variable/inter` (Latin and Latin Extended
only, about 70 kB), so it works offline in the PWA and the APK.

| Token | Size | Use |
| --- | --- | --- |
| `--text-xs` | 12 | Eyebrows (uppercase, `--tracking-eyebrow`), tab labels |
| `--text-sm` | 14 | Captions, counters |
| `--text-md` | 16 | Body, inputs (never smaller in an input) |
| `--text-lg` | 18 | Options, buttons, row and lesson titles |
| `--text-xl` | 22 | Card titles, feedback headline |
| `--text-2xl` | 28 | Prompts, page and tile titles |
| `--text-3xl` | 36 | Screen headlines, greeting |
| `--text-4xl` | 44 | Big numbers, streak count |

### Shape and space

Radii are large: `--radius-sm` 10, `-md` 16 (inputs, tiles), `-lg` 22 (cards, options),
`-xl` 28 px (home tiles, sheets), `-full` for pills. Spacing is a 4 px scale
(`--space-1` to `--space-8`) and pages use `--gutter` (20 px). Shadows are only for
things that float: `--shadow-float` (tab bar, continue bar) and `--shadow-sheet`.

## Components

| Class | What it is |
| --- | --- |
| `.btn` + `.btn-primary` / `-accent` / `-secondary` / `-ghost` / `-danger`, `.btn-block`, `.btn-sm` | 56 px pills. Primary is ink. |
| `.btn-on-tone` | Pill inside a coloured tile, using the tile's colours |
| `.icon-btn` (`.is-plain`) | 46 px white disc with a hairline: close, back, settings |
| `.round-go` | Lake-blue disc with an arrow: the end of a continue card or bar |
| `.eyebrow`, `.display`, `.page-title`, `.section-title`, `.lead`, `.caption`, `.hl` | Type roles |
| `.bento` + `.tile[data-tone=night|lake|sun|mint]`, `.tile-wide`, `.tile-title`, `.tile-sub`, `.tile-count`, `.tile-foot`, `.tile-art` | Home dashboard tiles |
| `.stat-pill` | Streak and XP pills under the greeting |
| `.week` / `.week-dots` | Monday-first streak week: circles with labels, or dots on the goal tile |
| `.steps` > `.step[data-state]` | One dash per exercise. Falls back to `.progress` past 24. |
| `.progress` > `.progress-fill`, `.ring` | Bar and ring |
| `.stage`, `.stage-badge`, `.stat-strip` | Path header: level disc, stage name, three numbers |
| `.chapter`, `.chapter-head`, `.chapter-icon[data-tone]`, `.chapter-lessons` | A unit on the path |
| `.lesson-card[data-state=done|open|locked]`, `.lesson-thumb`, `.state-mark`, `.pill` | A lesson on the path |
| `.tip-link` | Mint row that opens a unit's grammar tip |
| `.continue-bar` | Floating dark bar above the tab bar |
| `.option[aria-checked][data-verdict]`, `.option-key`, `.option-text`, `.option-mark` | Answer card with A/B/C key. Selected is ink; checked shows right and wrong. |
| `.feedback-card[data-verdict]`, `.feedback-title`, `.feedback-text` | Verdict under the exercise |
| `.word` | Tappable Finnish word chip |
| `.play`, `.play-disc` | Row with a black play disc |
| `.fill-input`, `.translate-input`, `.letters` > `.letter` | Typed answers. The blank is an underline in accent. |
| `.tiles(.built)`, `.tile-word`, `.tile-gap` | Sentence building in a dashed accent zone |
| `.tf-text`, `.match` | True/false text card, match columns |
| `.explain-title`, `.explain-body`, `.tag` | Grammar tip page |
| `.result-body`, `.result-mark`, `.summary`, `.summary-line`, `.chips` > `.chip` | Result screen |
| `.level-card` … | Onboarding level choice |
| `.list`, `.row`, `.row-icon`, `.row-text`, `.row-title`, `.row-sub`, `.row-chevron` | Settings and overview rows |
| `.stat-grid` > `.stat-tile` | Profile numbers |
| `.setting`, `.segmented` > `.segment`, `.switch`, `.switch-row` | Settings controls (real radios and checkbox) |
| `.tabbar` > `.tab[aria-current]` | Floating pill tab bar |
| `.screen`, `.screen-body`, `.page`, `.page-head`, `.subhead`, `.lesson-top`, `.lesson-heading`, `.action`, `.action-row` | Layout |

## Screens

- **Home** (tab): date eyebrow and a Finnish greeting by time of day, streak and XP pills,
  then tiles: Continue (night, the next lesson), Review (lake, due count), Daily goal (sun,
  ring and week dots), Your path (stage, next lesson, lesson trail), Grammar (mint, the
  current unit's tip).
- **Path** (tab): stage header and stat strip for the current section, then every unit as
  a chapter with its tip link and lesson cards. Opens scrolled to the current unit. A
  floating continue bar sits above the tab bar.
- **Profile** (tab): avatar, level tag, streak card with the week, overview numbers.
  Settings open from the round button in the header.
- **Lesson**: close, centred title and "n / total", step dashes; instruction, prompt with
  word chips, the exercise, and the feedback card; one ink pill at the bottom.
- **Grammar tip**: shown before the first lesson of a unit until that lesson is done, and
  from the path and the home tile at any time. Finnish words the unit teaches and endings
  written with a hyphen are highlighted and speak when tapped.
- **Result**: star mark, headline, chips for XP, streak and mistakes, the missed answers
  that go to review, then Continue to the next lesson or back home.
- **Welcome**, **Placement**, **Settings** use the same parts.

## Motion

Unchanged rules from version 1, in `motion.css`: transform and opacity only (the ring and
the collapse are the documented exceptions), press scale 0.97 (0.985 on big cards),
`.stagger` rise on the home tiles, a pop on the result mark, and one reduced-motion block
that removes travel and keeps short fades.

## Not done yet

- No illustrations. The references lean on them (lesson thumbnails, a mascot). The lesson
  thumbnails here are numbers; real art would need a source and a licence.
- No "go back" inside a lesson, no reminder-time screen, no flashcard review. See
  `tasks/redesign.md` for these and the other proposals.
- Checked in Chromium at 390 px, light and dark. Not yet on the phone or in the APK.
