---
ontology: true
type: plan
domain: suomi-app
status: active
summary: Implementation plan, dependency graph and risks for the Finnish study app
tags: [plan]
related: [SPEC, todo]
---

# Implementation Plan: Finnish study app

Status: approved. Source of truth for what is built: `../SPEC.md`.
Task details and checkboxes: `todo.md`.

## Overview

A static React app that plays lessons from JSON content files, stores progress on the
device, and is delivered as a PWA and a sideloaded Android APK. A Node script checks
all content, including the Finnish words, before anything ships.

## Architecture decisions

- Logic lives in plain TypeScript modules under `src/lib/` with no React imports, so
  it can be unit tested without a browser. Screens only call these modules.
- One progress object in `localStorage`, read and written through `progress.ts` only.
- Content is data, not code. One JSON file per unit, fetched when the unit is opened.
- The validator is built before any content is written, so no unchecked Finnish ever
  enters the repository.
- No router, state or UI library. Five screens switched by one state value.

## Dependency graph

```
content schema + validator (Voikko)
    └── unit 1 content
            └── lesson engine (queue, check.ts)
                    ├── exercise components (7 types)
                    ├── progress.ts (XP, streak, unlock)
                    │       ├── home path screen
                    │       ├── mistake review
                    │       └── export / import
                    └── placement.ts ── placement screen
strings.ts (EN/FI) ── every screen
build ── PWA ── deploy
      └── Capacitor ── APK
```

## Order and reasons

1. Phase 1 proves the whole loop on one unit: validated content, a playable lesson,
   saved XP and streak.
2. Phase 2 goes straight to the risky delivery parts (Finnish speech voice, PWA, APK)
   while the app is still small. If the APK or the voice fails, it is cheap to change
   course here.
3. Phase 3 adds the remaining exercise types and screens.
4. Phase 4 is the placement test, which needs the content shape to be stable.
5. Phase 5 is content, one section at a time, each ending with a human read-through.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Wrong Finnish taught as correct | High | Voikko check on every word, declared-form check on `fill` answers, human read-through per section |
| No Finnish voice on the phone | Medium | Task 6 tests on the real device early. `listen` exercises are left out when no voice is found |
| APK build needs the Android SDK and Java, not yet checked on this machine | Medium | Task 8 is early. The PWA is the fallback |
| Content volume (about 1,900 exercises) | High | Content is written section by section. The app is usable after section 1 |
| Progress lost when browser data is cleared | Medium | Export and import in task 12 |
| Voikko rejects valid names and loanwords | Low | Allow list file |

## Parallel work

Phase 5 content sections do not depend on each other and can be written in separate
sessions once phase 3 is done. Everything before that is sequential.

## Open questions

- Hosting: GitHub Pages is assumed for the browser version. It makes the app public
  to anyone with the link. Say so if another host or local-only use is preferred.
- Who reads each section's Finnish before it is marked done?
