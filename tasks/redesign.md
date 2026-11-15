---
ontology: true
type: plan
domain: suomi-app
status: proposal
summary: What changed in the 2026-11-15 redesign, and proposals to restructure the app and the lessons
tags: [design, lessons, proposal]
related: [DESIGN, SPEC, todo]
---

# Redesign: what changed and what to restructure next

Source: 20 reference screenshots of a modern language-learning app (path sheet, lessons,
explanation pages, result, profile, home tiles, onboarding). DESIGN.md describes the new
design system itself. This file covers the structure of the app and the lessons.

## Done in this change

1. **Three tabs: Home, Path, Profile.** Settings moved behind a round button on Profile.
   The lesson list left Home and became its own tab.
2. **Home is a dashboard,** not a list: Continue, Review, Daily goal, Your path, Grammar.
   The one thing to do next is the biggest thing on screen.
3. **Path:** stage header (section and CEFR level), stat strip, chapters with lesson
   cards and a NEXT marker, and a floating continue bar.
4. **The grammar tip is a page,** not a fold-out. It opens before a unit's first lesson
   until that lesson is done, and from the path and home at any time. Finnish in it is
   highlighted and speaks when tapped. This covers the "tip opens before lesson 1"
   criterion of Task 10.
5. **Lessons:** title and "n / total" in the header, one dash per exercise, A/B/C option
   cards, and the checked answer shows on the options themselves (right in green, your
   wrong pick in red) with a feedback card under the exercise instead of a coloured
   footer.
6. **Result:** chips for XP, streak and mistakes, the missed answers that are going to
   review, and Continue straight into the next lesson.
7. **Profile:** streak card with the Monday-to-Sunday week, overview numbers.

## Proposals for the lessons

In order of what I think helps learning most per hour of work.

### 1. A "why" line in the feedback card (S, high value)

The references explain every answer ("The word *olet* needs the past participle in
-nut"). Today a wrong answer only shows the right one. Two steps:

- Now, no content changes: when an exercise has `tags`, show the rule title from
  `content/rules.json` under the answer ("Verb type 1: drop the vowel, add the ending").
- Later: an optional `why` field per exercise for the items where the rule title is not
  enough. The validator can require it for grammar `fill` items.

### 2. Lesson arc: explain, recognise, recall (M)

Each lesson becomes three short phases, like the references' "Recognize / Recall" bar:

1. **Explain**: one to three cards. Title, two to four sentences with the forms
   highlighted, and two or three example lines with a play button. This splits the long
   unit tip into pieces that sit right before the exercises that use them.
2. **Recognise**: `choice`, `listen`, `match`, `truefalse`.
3. **Recall**: `fill`, `order`, `translate`.

The phase order can be applied by exercise type, so existing content works unchanged.
Explain cards need a new optional `intro` on a lesson:
`{ title, text, examples: [{ fi, en }] }[]`. The header shows the phase under the dashes.

### 3. Shorter lessons (content, S per unit)

Lessons have 14 or 15 items. The references run 5 to 12 "stops". With explain cards in
front, 10 to 12 items keeps a lesson around five minutes. Worth deciding at Checkpoint 4,
before writing 25 more units.

### 4. A `sort` exercise (M)

Two buckets, tap a word, tap a bucket ("Now or then?": puhun / puhuin). Very good for
vowel harmony (-ko / -kö), verb types, and case endings, which `choice` tests one word
at a time. New type in `types.ts`, the validator, and one component.

### 5. Flashcards in review (M)

Vocabulary items in the review deck would play as a card: Finnish word, tap to turn,
meaning and an example sentence, then "Again soon" or "Got it". Grammar items stay as
exercises. Self-grading is faster and the references use it for exactly this.

### 6. Words you met (S to M)

Collect the Finnish words of each lesson (the code to do it exists: `unitVocabulary` in
`src/lib/course.ts`). Show them as chips on the result screen and as a word list on
Profile, with the review box each one is in.

### 7. Conversation lessons (L)

Turn each unit's "Mix" lesson into a scene: a character's line as word chips with a play
button, and the learner picks or builds the reply. It reuses `choice` and `order` with a
`speaker` name on the exercise. This is the references' speaking practice without needing
speech recognition.

## Proposals for the app

### 8. Onboarding in three steps (M)

1. "Minä olen ___": the learner types their name into their first Finnish sentence and
   hears it. Store the name; Home greets with it ("Hyvää iltaa, Yuri").
2. The level choice that exists now.
3. A short plan screen: daily goal, review, grammar tips.

### 9. A daily reminder (M, APK first)

Pick an hour after the first lesson. Needs the Capacitor Local Notifications plugin and
the Android permission prompt. In the PWA it is unreliable, so offer it in the APK only.

### 10. One stage at a time on the path (S)

With 31 units the path gets long. Show only the current section, with a
"Switch stage" control for the others.

### 11. Checkpoints as the last card of a chapter (fits Task 11)

The unit checkpoint (15 items, pass at 80 percent) belongs at the end of each chapter on
the path, with a trophy mark, and it is what unlocks the next unit.

### 12. Illustrations (needs a decision)

The references lean on illustrations: lesson thumbnails, a scene behind conversations,
a mascot. The lesson thumbnails here are numbers. Real art needs a source and a licence,
and DESIGN.md says "no mascot". Your call whether that changes.

## Suggested order

1 (why line, now) → 2 and 3 together (lesson arc and length, before more content) →
Task 11 checkpoints with 11 → 5 → 4 → 6 → 8 → 10 → 9 → 7.
