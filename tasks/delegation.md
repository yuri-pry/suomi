---
ontology: true
type: pattern
domain: suomi-app
status: active
summary: How the manager session hands self-contained tasks to helper agents, with brief templates and results
tags: [delegation, agents]
related: [AUTHORING, todo]
---

# Delegation: how work is handed to helper agents

The main session acts as manager. It hands self-contained tasks to helper agents that
start with no knowledge of this project, so each brief must stand on its own.

## What is delegated

| Work | Delegated | Model |
|---|---|---|
| Writing one content unit | yes, one agent per unit | Sonnet |
| A new exercise type or screen with a clear spec in `todo.md` | yes, one at a time | Sonnet |
| Mechanical edits across many files | yes | Haiku |
| Architecture, spec changes, anything touching `progress.ts` storage format | no | |
| Reviewing a helper's Finnish | no, the manager and then the user | |
| Edits of a few lines | no, cheaper to do directly | |

Two helpers never write the same file at the same time. Content units can run in
parallel only if each appends to `rules.json` after the others finish, so in practice
they run one after another, or in separate git worktrees.

## Manager's steps per task

1. Write the brief from the template below. Paste in the facts the helper needs
   instead of pointing at long documents.
2. Start the helper.
3. When it reports, run `npm test` and read the diff. A helper's report is a claim,
   not proof.
4. For content: read every Finnish sentence once, fix or send back.
5. Commit, tick the task in `todo.md`.

## Brief template: content unit

```
You are writing one unit of content for a Finnish study app.

Project folder: C:\Yuri\Claude\suomi-app
First read content/AUTHORING.md completely. It defines the format, the rules for
the Finnish, how to check your work and what to report. Then look at content/u01.json
and content/rules.json as the working example.

Your unit: uNN "<title>", section <n>.
Theme and vocabulary: <from SPEC section 4>
Grammar to teach: <from SPEC section 4>
Rules to add (use exactly these ids): <rows from tasks/rulebook-map.md, with type>
Lesson plan:
  1 Words: <vocabulary areas>
  2 Grammar A: <structure>
  3 Grammar B: <structure>
  4 Situation: <setting>
  5 Mix: this unit plus <named items from earlier units>

What the learner already knows from earlier units: <short list of words and grammar>
Exercise types available: <list>

Write content/uNN.json and add the rules to content/rules.json. Touch nothing else
except scripts/allowlist.txt for names. Do not commit. Finish only when
`node scripts/validate-content.mjs` reports 0 errors. Report as AUTHORING.md says.
```

## Brief template: code task

```
You are implementing one task in a small React + TypeScript app.

Project folder: C:\Yuri\Claude\suomi-app
Task: <copy the task block from tasks/todo.md, with its acceptance criteria>
Files to read first: <3 to 6 paths>
Files you may change: <paths>. Change nothing else.
Conventions: logic in src/lib as pure functions with a Vitest test; every visible
string through src/lib/strings.ts in English and Finnish; plain CSS in
src/styles.css using the existing custom properties; no new dependencies.

Done when `npm test`, `npm run lint` and `npm run build` all pass.
Do not commit. Report in under 150 words: what you changed per file, the last lines
of the three commands, and anything you could not do.
```

## Results so far

| Date | Task | Model | Helper tokens | Outcome |
|---|---|---|---|---|
| 2026-11-13 | Unit 2 content (69 exercises, 3 rules) | Sonnet | 93,000 | Passed the validator first time, 101 seconds. Manager read all 69 items: no wrong Finnish found, nothing sent back. One sentence repeated between lessons 2 and 5. |
