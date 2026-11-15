---
ontology: true
type: task-list
domain: suomi-app
status: active
summary: Tasks in 5 phases with acceptance criteria and done state
tags: [tasks]
related: [plan, SPEC]
---

# Tasks: Finnish study app

Commands used below: `npm test` (Vitest plus the content validator), `npm run build`,
`npm run dev`. Sizes: S = 1 to 2 files, M = 3 to 5 files.

## Phase 1: One playable lesson

### Task 1: Scaffold the project
- [x] Done

**Description:** Create the Vite, React and TypeScript project with Vitest and ESLint,
and a git repository with the PDFs and `node_modules` ignored.

**Acceptance criteria:**
- [x] `npm run dev` shows a placeholder home screen
- [x] `npm test` runs and passes one trivial test
- [ ] `git status` is clean after the first commit

**Verification:** `npm test`, `npm run build`
**Dependencies:** None
**Files:** `package.json`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `.gitignore`
**Size:** M

### Task 2: Content schema and validator
- [x] Done

**Description:** Define the content types and write `scripts/validate-content.mjs` with
the structural checks and the three Voikko rules from SPEC section 3b.

**Acceptance criteria:**
- [x] A fixture with a misspelled Finnish word fails validation and names the exercise id
- [x] A fixture with a declared form that does not match (omenan as `osanto`) gives a warning
- [x] A word in `scripts/allowlist.txt` passes
- [x] An exercise tag missing from `content/rules.json` fails; a rule with fewer than 4 exercises fails
- [x] A `rektio` rule whose example word is not in the required case fails
- [x] `npm test` runs the validator over `content/`

**Verification:** `npm test`
**Dependencies:** Task 1
**Files:** `src/lib/types.ts`, `scripts/validate-content.mjs`, `scripts/allowlist.txt`, `tests/validate.test.ts`
**Size:** M

### Task 3: Unit 1 content
- [x] Done

**Description:** Write unit 1 (Hello): tip, 5 lessons of about 12 exercises, using only
`choice` and `fill` for now. Original sentences only.

**Acceptance criteria:**
- [x] `content/u01.json` passes the validator with no warnings
- [x] Every `fill` answer that teaches a form declares it
- [x] Unit 1's rules are in `content/rules.json` and every grammar exercise is tagged with one

**Verification:** `npm test`
**Dependencies:** Task 2
**Files:** `content/u01.json`, `content/rules.json`
**Size:** S

### Task 4: Lesson engine with `choice` and `fill`
- [x] Done

**Description:** Build answer checking and the lesson queue, plus the Lesson screen
with the two first exercise types, the ä/ö/å buttons and the feedback sheet.

**Acceptance criteria:**
- [x] Finnish answers match only exactly after normalisation; English answers allow one wrong letter
- [x] A wrong answer returns at the end of the queue and the lesson ends only when all are right
- [x] Lesson 1 of unit 1 can be played start to finish in the browser

**Verification:** `npm test` (tests for `check.ts` and the queue), manual play in `npm run dev`
**Dependencies:** Task 3
**Files:** `src/lib/check.ts`, `src/lib/lesson.ts`, `src/screens/Lesson.tsx`, `src/exercises/Choice.tsx`, `src/exercises/Fill.tsx`
**Size:** M

### Task 5: Progress, XP and streak
- [x] Done

**Description:** Build `progress.ts` (versioned storage, XP rules, streak by local
calendar day, lesson unlock order) and the Result screen.

**Acceptance criteria:**
- [x] Finishing a lesson gives 10 XP, or 15 with no mistakes, and survives a reload
- [x] Streak rises once per day, stays on a second lesson the same day, resets after a missed day
- [x] Lesson 2 is locked until lesson 1 is done

**Verification:** `npm test` (streak tests with a fake clock), manual reload check
**Dependencies:** Task 4
**Files:** `src/lib/progress.ts`, `src/screens/Result.tsx`, `tests/progress.test.ts`
**Size:** M

### Checkpoint 1
- [x] All tests pass and the build is clean
- [x] One lesson plays end to end and XP and streak persist
- [ ] Review with the user before continuing

## Phase 2: Delivery risks first

### Task 6: Finnish speech and the `listen` exercise
- [x] Done

**Description:** Add `speech.ts` (find a fi-FI voice, speak a sentence) and the
`listen` exercise. Leave `listen` exercises out of a lesson when no voice exists.

**Acceptance criteria:**
- [x] With a Finnish voice, the sentence is spoken and can be replayed
- [x] Without one, the lesson plays with no `listen` exercises and no error
- [x] Result of the test on the user's Android phone and on this PC is written into SPEC section 5

**Verification:** `npm test` (filter logic), manual test on both devices
**Dependencies:** Task 5
**Files:** `src/lib/speech.ts`, `src/exercises/Listen.tsx`, `src/lib/lesson.ts`
**Size:** S

### Task 7: PWA and first deploy
- [x] Done (https://yuri-pry.github.io/suomi/, deployed by GitHub Actions on every push to master)

**Description:** Add the manifest, icons and service worker with vite-plugin-pwa, and
deploy the build to the static host.

**Acceptance criteria:**
- [x] Chrome on Android offers "Install app" (user confirmed 2026-11-14)
- [ ] A lesson plays with the network off after one online visit
- [x] The deployed URL loads the app

**Verification:** `npm run build`, manual install on the phone
**Dependencies:** Task 5. Needs the user's go-ahead on hosting before deploying
**Files:** `vite.config.ts`, `public/manifest.webmanifest`, `public/icons/*`
**Size:** S

### Task 8: Android APK
- [x] Done

**Description:** Wrap the build with Capacitor and produce a debug APK. Check first
that Java and the Android SDK are installed; installing them needs the user's go-ahead.

**Acceptance criteria:**
- [x] `app-debug.apk` installs on the phone (user confirmed 2026-11-14, voice included)
- [ ] A lesson plays in flight mode
- [x] The build steps are written in `README.md`

**Verification:** manual install and play
**Dependencies:** Task 7
**Files:** `capacitor.config.ts`, `android/` (generated), `README.md`
**Size:** M

### Checkpoint 2
- [ ] App runs in the browser, as an installed PWA and as an APK
- [ ] Speech result recorded
- [ ] Review with the user before continuing

## Phase 3: Full lesson experience

### Task 9: `match` and `order` exercises
- [x] Done (built by a helper agent 2026-11-14; touch behaviour not yet checked by hand)

**Acceptance criteria:**
- [ ] `match` pairs 4 or 5 words; a wrong pair counts as one mistake
- [ ] `order` builds a sentence from tiles and checks the result with `check.ts`
- [ ] Both work by touch with targets of at least 44 px

**Verification:** `npm test`, manual play on the phone
**Dependencies:** Task 4
**Files:** `src/exercises/Match.tsx`, `src/exercises/Order.tsx`, `scripts/validate-content.mjs`
**Size:** M

### Task 10: `translate` and `truefalse` exercises, grammar tip screen
- [ ] Done (both exercise types exist in `src/exercises/`; the tip screen came with the 2026-11-15 redesign; not checked by hand on the phone)

**Acceptance criteria:**
- [ ] `translate` works in both directions with the right leniency per language
- [ ] `truefalse` shows a short text and a statement
- [x] The tip opens before lesson 1 of a unit and can be reopened

**Verification:** `npm test`, manual play
**Dependencies:** Task 4
**Files:** `src/exercises/Translate.tsx`, `src/exercises/TrueFalse.tsx`, `src/screens/Tip.tsx`
**Size:** M

### Task 11: Home path, checkpoints and daily goal
- [ ] Done

**Description:** Build the home screen as a path of lesson nodes by unit, the header
with XP, streak and goal ring, and the unit checkpoint (15 drawn items, pass at 80
percent, unlocks the next unit).

**Acceptance criteria:**
- [ ] Locked, open and done nodes look different without relying on colour alone
- [ ] Passing a checkpoint unlocks the next unit; failing does not
- [ ] The goal ring fills as XP is earned that day

**Verification:** `npm test` (checkpoint draw and unlock), manual check
**Dependencies:** Task 5
**Files:** `src/screens/Home.tsx`, `src/lib/progress.ts`, `src/lib/lesson.ts`, `src/styles.css`
**Size:** M

### Task 12: Mistake review, settings, export and import
- [ ] Done

**Acceptance criteria:**
- [x] Review plays the due items of the spaced-repetition deck (SPEC section 7); an item leaves after the last box
- [ ] Export downloads the progress file; import restores it and rejects a malformed file
- [x] Daily goal can be set to 10, 20 or 30

**Verification:** `npm test`, manual export in the browser and import in the APK
**Dependencies:** Task 11
**Files:** `src/screens/Settings.tsx`, `src/lib/progress.ts`, `tests/progress.test.ts`
**Size:** M

### Task 12a: Rule mastery and level formula
- [ ] Done

**Description:** Build `mastery.ts` with the score update, the mastered test, section
mastery and the level formula from SPEC section 7. Update rule scores after each
answer, seed tested-out units, show the level on the home screen, and extend review to
draw from the weakest rules after the saved mistakes.

**Acceptance criteria:**
- [ ] Ten correct answers give `s` of 0.89; a following mistake gives 0.71
- [ ] Sections 1 and 2 complete with section 3 at 40 percent gives level 2.4
- [ ] Review with no saved mistakes plays exercises from the lowest-scored seen rules

**Verification:** `npm test` (`tests/mastery.test.ts`), manual check of the home screen
**Dependencies:** Task 12
**Files:** `src/lib/mastery.ts`, `src/lib/progress.ts`, `src/lib/lesson.ts`, `src/screens/Home.tsx`, `tests/mastery.test.ts`
**Size:** M

### Task 12b: Rules screen
- [ ] Done

**Acceptance criteria:**
- [ ] Lists the rules of opened units grouped by type, with examples and a mastery bar
- [ ] Search by Finnish word finds a `rektio` rule by its verb
- [ ] Rules of unopened units are not shown

**Verification:** manual check with unit 1 done and unit 2 locked
**Dependencies:** Task 12a
**Files:** `src/screens/Rules.tsx`, `src/screens/Home.tsx`
**Size:** S

### Task 13: English and Finnish interface
- [ ] Done

**Acceptance criteria:**
- [ ] Every visible label comes from `strings.ts`
- [ ] The switch in settings changes all screens and is remembered
- [ ] A test fails if a key lacks an `en` or `fi` entry

**Verification:** `npm test`, manual check of each screen in both languages
**Dependencies:** Task 12
**Files:** `src/lib/strings.ts`, all screens
**Size:** M

### Task 14: Visual polish and accessibility
- [ ] Done

**Acceptance criteria:**
- [ ] Light and dark themes through CSS custom properties
- [ ] Press feedback and the feedback sheet follow SPEC section 9; movement is off under `prefers-reduced-motion`
- [ ] The whole lesson can be played with the keyboard, and inputs do not zoom on mobile

**Verification:** manual check on phone and desktop, in both themes
**Dependencies:** Task 13
**Files:** `src/styles.css`, screens as needed
**Size:** M

### Redesign (2026-11-15)
- [x] Design system rebuilt from the reference screenshots (`DESIGN.md`, version 2)
- [x] Home dashboard, Path tab, grammar tip page, new lesson, result and profile screens
- [ ] Checked on the phone and in the APK
- [ ] Proposals in `tasks/redesign.md` reviewed with the user

### Checkpoint 3
- [ ] Unit 1, extended to use all 7 exercise types, plays through to its checkpoint
- [ ] All tests pass, the PWA and APK are rebuilt
- [ ] Review with the user before continuing

## Phase 4: Placement test

### Task 15: Placement logic and screen
- [x] Done (2026-11-15; searches the units that have a full block in the bank, 6 today. Rule seeding waits for Task 12a)

**Description:** Build `placement.ts` (the block binary search from SPEC section 6)
and the first-launch screen with "start from the beginning" as the other choice.

**Acceptance criteria:**
- [ ] Simulated learners who know units 1 to N are placed at unit N+1, for every N from 0 to 31
- [ ] The test never asks more than 15 items and never repeats a unit
- [ ] The result marks earlier units as tested out

**Verification:** `npm test` (simulation over all 32 cases)
**Dependencies:** Task 11
**Files:** `src/lib/placement.ts`, `src/screens/Placement.tsx`, `tests/placement.test.ts`
**Size:** M

## Phase 5: Content

Each content task has the same criteria: the files pass the validator with no
unexplained warnings, each unit has a tip, 5 lessons and declared forms on grammar
`fill` items, each unit's rules from `tasks/rulebook-map.md` are added to
`content/rules.json` and tagged, 3 placement items per unit are added to `content/placement.json`, and a
person who knows Finnish has read the section.

- [ ] Task 16: Section 1 remaining units (2 to 6)
- [ ] Task 17: Section 2 (units 7 to 12)
- [ ] Task 18: Section 3 (units 13 to 17)
- [ ] Task 19: Section 4 (units 18 to 22)
- [ ] Task 20: Section 5 (units 23 to 31)

Each of these is several sessions of work: one unit per session is a realistic size.
Tasks 17 to 20 do not depend on each other.

### Checkpoint 4 (after task 16)
- [ ] Section 1 is fully playable, placement works across the units that exist
- [ ] New deploy and new APK
- [ ] Review with the user: is the lesson length and difficulty right before writing 25 more units?

### Final checkpoint
- [ ] All success criteria in SPEC section 12 are met
