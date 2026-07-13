# Plan 017: Draw the loop as a loop — interactive OrbitLoop diagram, loop page rewritten around it

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If any
> STOP condition occurs, stop and report — do not improvise. Do NOT update
> `plans/README.md` — your reviewer maintains the index.
>
> **Drift check (run first)**: this plan assumes plan 016's motion layer is in
> your tree. Verify: `grep -c "motion-story" app/globals.css` → ≥1 AND
> `test -f lib/motion.ts && echo ok` → ok. If either fails, STOP.
> Then `git diff --stat 7fbc703..HEAD -- components/diagrams/loop.tsx content/harness/loop.mdx content/harness/get-started.mdx components/mdx.tsx` —
> expected drift: `components/mdx.tsx` gained a MotionScale entry from plan 016;
> anything else changed → compare against the excerpts below, mismatch = STOP.

## Status

- **Priority**: P1 (the presentation's centrepiece visual)
- **Effort**: L
- **Risk**: MED (new interactive SVG component; a11y semantics must be right)
- **Depends on**: plans/016-motion-foundation.md (DONE required)
- **Category**: direction (communication design)
- **Planned at**: commit `7fbc703` + plan 016's branch, 2026-07-12

## Why this matters

The design loop is the harness's central concept — a *cycle* with two human
gates — yet the site draws it as a straight vertical stack of cards, then
immediately restates all six phases as a numbered list below (the site owner's
exact critique: repetitive information, and a filled-blue "Plan" step that looks
clickable but isn't). This plan replaces that with a circular, subtly animated,
genuinely interactive diagram: the loop drawn as a loop, phases you can select
to read, gates that visibly pause the motion — the form finally encoding the
concept. The duplicated list disappears because the diagram absorbs it.

## Current state

- `components/diagrams/loop.tsx` — 21 lines; wraps the shared `Flow` stepper:
  ```tsx
  export function DesignLoop() {
    return (
      <Flow
        steps={[
          { label: "Intent", note: "write what you mean as a contract" },
          { label: "Diverge", note: "2–3 options, you pick a direction" },
          { label: "Plan", note: "nothing is built until you approve", gate: true },
          { label: "Implement", note: "build exactly the approved plan" },
          { label: "Verify", note: "checks, then a separate evaluator" },
          { label: "Ratchet", note: "capture what we learn" },
        ]}
        caption="You approve the plan before anything is built. ..."
      />
    );
  }
  ```
- `content/harness/loop.mdx` — frontmatter `title: The loop`,
  `description: Six phases, two human gates. Intent without loss.`,
  `status: proposed`. Body: one intro paragraph ("…Its central promise:
  **intent without loss.** What you mean is written as a contract in phase 1;
  every later phase is graded against it; drift is a defect."), then
  `<DesignLoop />`, then a numbered list (lines 11–16) restating all six phases
  with the detail (contract/manifest/gate specifics/360-768-1280
  screenshots/ratchet records), then `## The outer loop` (line 18+, about
  feedback/telemetry evidence records and open pattern questions — OPQ-1).
- `content/harness/get-started.mdx` — line 52 embeds `<DesignLoop />` inside the
  "How the loop works" section; the surrounding prose ("the agent writes down
  what it intends to build, and nothing gets built until you approve it… a
  separate agent checks the result") is complementary, not duplicative.
- `components/mdx.tsx` — registry (after plan 016 it also has MotionScale last):
  ```tsx
  export const mdxComponents = {
    h2: heading("h2"),
    h3: heading("h3"),
    FoundationProfile,
    DesignLoop,
    AdoptionJourney,
    Ladder,
    Ratchet,
    MotionScale,
  };
  ```
- `lib/motion.ts` (from plan 016) — exports `DUR = {fast:0.12, base:0.2, slow:0.3, story:0.6}`,
  `STAGGER = 0.06`, `EASE_OUT`, `EASE_IN_OUT` (motion/react `cubicBezier` values).
- Motion CSS tokens (016): `--motion-fast|base|slow|story`, `--ease-out`, `--ease-in-out`.
- Repo conventions that bind this plan:
  - Reduced motion: `const reduced = useReducedMotion() === true;` (hydration
    null must not skip animation) — the exact pattern in
    `components/landing-motion.tsx` and `components/diagrams/flow.tsx`.
  - Focus style: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)`.
  - TOK-1: colours only via tokens (`var(--tw-blue)`, `var(--border)`,
    `var(--foreground)`, `var(--muted-foreground)`, `var(--surface)`,
    `var(--warning…)` etc.); token-audit.py runs in prebuild over app/components/lib.
  - Fonts: headings `font-display` (Plus Jakarta Sans), body Inter (TYP-1).
  - SLP-8: no bounce/overshoot easing. MOT-3 (proposed, in your tree): the
    diagram must communicate everything statically; motion only emphasises.
  - A11Y-2 keyboard reach + visible focus; A11Y-4 targets ≥24px; A11Y-5 reduced
    motion. Copy: second person, sentence case, Singapore English.
  - Catalog controls this diagram must itself pass — treat as your acceptance
    spec: MOT-1, MOT-2 (tokens only), MOT-3, SLP-8, TOK-1, A11Y-2/4/5.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck | `pnpm typecheck` | exit 0 |
| Lint | `pnpm lint` | exit 0 |
| Tests | `pnpm test` | all pass |
| Full build | `pnpm build` | exit 0, no `[doc-page]` warnings |
| Dev server | `pnpm dev --port 4017` | serves http://localhost:4017 |

## Suggested executor toolkit

- Read `/Users/jeongwondo/.claude/skills/web-animation-design/SKILL.md`
  (easing/duration discipline, reduced-motion rules) and
  `/Users/jeongwondo/.claude/skills/make-interfaces-feel-better/SKILL.md`
  (micro-interaction craft) before Step 2.
- `agent-browser` CLI is installed — read `~/.claude/skills/agent-browser/SKILL.md`
  and use it against your dev server for screenshot evidence (Step 6).
- W3C APG Tabs pattern is the interaction spec for phase selection (roving
  tabindex, arrow keys, automatic activation).

## Scope

**In scope** (only these):
- `components/diagrams/loop-data.ts` (create)
- `components/diagrams/orbit-loop.tsx` (create)
- `components/diagrams/loop.tsx` (delete)
- `components/mdx.tsx` (replace DesignLoop registration with OrbitLoop)
- `content/harness/loop.mdx` (rewrite body per Step 4)
- `content/harness/get-started.mdx` (embed swap only — Step 5)

**Out of scope** (do NOT touch):
- `components/diagrams/flow.tsx`, `ratchet.tsx`, `ladder.tsx`,
  `adoption-journey.tsx`, `foundation-profile.tsx`, `motion-scale.tsx` — other
  plans own them (flow.tsx keeps its other consumers; removing loop.tsx must not
  break it).
- `app/page.tsx` / landing (a later stitch plan embeds the hero variant).
- `app/globals.css`, `lib/motion.ts` (consume, never edit).
- The `## The outer loop` section's meaning in loop.mdx — you may lightly copyedit,
  never delete or restructure it.

## Git workflow

- Worktree branch `advisor/017-orbit-loop`; commit there; do not push.
- Conventional commits, e.g. `feat(site): orbit loop diagram — the loop drawn as a loop`.

## Steps

### Step 1: Single-source phase data — `components/diagrams/loop-data.ts`

Create a typed module holding the six phases so the diagram and any future
consumer never fork:

```ts
export type LoopPhase = {
  id: string;          // "intent" | "diverge" | ...
  n: 1 | 2 | 3 | 4 | 5 | 6;
  label: string;       // "Intent"
  note: string;        // ring one-liner, ≤6 words
  gate?: "plan" | "waivers";  // Plan = full human gate; Verify = gate on waivers
  gateLabel?: string;  // "human gate" | "gate on waivers"
  detail: string;      // 2–3 sentences for the panel
  you: string;         // one line: what you do in this phase
};
export const LOOP_PHASES: LoopPhase[] = [ ... ];
```

Write the six `detail`/`you` entries by merging the current diagram notes with
the numbered list in `content/harness/loop.mdx:11-16` — that list is the source
of truth; keep its facts exactly (contract graded by the evaluator; 2–3
structurally different options from the product's manifest, no pixel code;
plan approved before any code, waivers proposed there; manifest components +
semantic tokens only, drift is a defect; deterministic checks first, L0 blocks,
L1 loops back, screenshots at 360/768/1280, separate evaluator, generator never
grades its own work; decision records, defects become proposed controls).
House voice: second person, sentence case, no AI-tells (SLP-9).

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: `components/diagrams/orbit-loop.tsx` — the diagram

`"use client"`. Props: `{ variant?: "full" | "inline" }` (default `full`).

**Geometry.** One SVG (`viewBox="0 0 480 480"`), ring `r=170` centred at
(240,240). Six phase nodes at 60° intervals, phase 1 (Intent) at 12 o'clock,
clockwise order. Node = circle `r=17` with the phase number; label + note
outside the ring near each node (SVG `<text>`, anchored per quadrant so nothing
collides at 360px wide; labels 13px weight 500, notes 11.5px muted). Centre:
"the loop" (font-display, 600, 20px) over "intent without loss" (12.5px,
muted-foreground). Gates (Plan, Verify): a second concentric ring stroke around
the node + a small pill chip beside the label — Plan: solid `var(--tw-blue)`
chip, white text, "human gate"; Verify: outlined tw-blue chip, "gate on
waivers". Nothing else on the page uses a filled-primary treatment unless it is
interactive — here the gate chips annotate genuinely interactive nodes, which
resolves the old false-affordance complaint.

**Interaction (APG Tabs, automatic activation).** The six nodes are `<button>`
elements in a `role="tablist"` (`aria-label="Design loop phases"`); each button
`role="tab"`, `aria-selected`, `id`, roving `tabindex`. ArrowRight/ArrowDown →
next phase (wrapping), ArrowLeft/ArrowUp → previous, Home/End → first/last;
focus moves selection (automatic activation). Click selects. Selected node:
fill `var(--tw-blue)`, white numeral, label turns `var(--foreground)` 600.
Hit target: wrap each node in a transparent SVG circle `r=24` inside the button
(≥44px effective, A11Y-4). Focus ring: since these are SVG-embedded buttons,
draw an explicit focus ring (`:focus-visible` → outer circle stroke
`var(--tw-blue)` 2px, offset 3px) — must be visible (A11Y-2).

**Detail panel.** `role="tabpanel"` + `aria-labelledby` = active tab id. Shows:
`0n` numeral + label + gate chip (if any), the `detail` sentences, and a "You:"
line from `you`. Layout: `variant="full"` → CSS grid, ring left (max-width
480px) and panel right at `lg:`, panel below otherwise; `variant="inline"` →
ring max-width 320px, panel always below. Panel content swap animates
opacity/4px-lift with `DUR.base`/`EASE_OUT`; under reduced motion it swaps
instantly.

**Ambient motion (the subtle part).** A dot (`r=4`, fill `var(--tw-blue)`)
travels the ring clockwise on a loop, pausing at the two gates — the motion
itself says "the loop stops for humans":
- Implement with motion/react: animate the dot along the circle by rotating a
  group around the centre (`rotate: [0, …, 360]` with a `times` array), or
  animating `offsetDistance` along a circular path — your choice, but it must
  be transform-based (GPU) and loop seamlessly.
- Full revolution ≈ 36s; ease into each gate stop (`EASE_IN_OUT`), dwell ~1.6s
  at Plan and ~1.2s at Verify, ease out. Constant gentle speed elsewhere
  (near-linear between stops).
- The dot is `aria-hidden`. Under `useReducedMotion() === true` the dot is not
  rendered at all, and the diagram must read complete without it (numbered
  phases carry the order — MOT-3 pass).
- Pause the revolution while the user's pointer is down on a node or focus is
  inside the tablist (avoid competing motion during reading); resume after.
  Use spring-free tweens only (SLP-8).

Everything colours/typography via tokens; zero raw hex (token-audit gate).
Export `OrbitLoop`.

**Verify**: `pnpm typecheck && pnpm lint` → exit 0.

### Step 3: Registry swap

- Delete `components/diagrams/loop.tsx`.
- `components/mdx.tsx`: remove the `DesignLoop` import/entry; add
  `import { OrbitLoop } from "@/components/diagrams/orbit-loop";` and register
  `OrbitLoop,` where DesignLoop was.

**Verify**: `grep -rn "DesignLoop" app components content lib` → **only**
matches left are in `content/harness/*.mdx` (fixed next step), then after
Step 4/5: no matches at all.

### Step 4: Rewrite `content/harness/loop.mdx`

Keep frontmatter exactly (title/description/status). New body:

1. The intro paragraph — keep its promise ("intent without loss", contract in
   phase 1, drift is a defect), tightened to ≤3 sentences.
2. `<OrbitLoop />`
3. `## The two gates` — 4–6 sentences of NEW content (not phase restatement):
   why the gates exist — the plan gate means nothing is built unseen; the
   verify gate means waivers are a human decision; between the gates the agent
   moves fast because the contract already binds it. Second person.
4. `## The outer loop` — keep the existing section (light copyedit allowed;
   meaning, OPQ example, and "never enforces a guess" stay).

The six-phase numbered list is **deleted** — its facts now live in
`loop-data.ts` and render inside the diagram panel. No information may be lost
in the move (diff your loop-data details against the old list before deleting).

**Verify**: `pnpm build` → exit 0; `/harness/loop` renders; no `[doc-page]`
fallback warning for harness/loop.

### Step 5: get-started embed swap

In `content/harness/get-started.mdx` line 52: `<DesignLoop />` →
`<OrbitLoop variant="inline" />`. Do not change the surrounding prose (it
complements the diagram). Nothing else in this file.

**Verify**: `grep -rn "DesignLoop" content components app lib` → no matches.

### Step 6: Full gate + evidence

`pnpm typecheck && pnpm lint && pnpm test && pnpm build` → all exit 0.
Then `pnpm dev --port 4017` and capture with agent-browser:
- `/harness/loop` at 360, 768, 1280 (default motion)
- `/harness/loop` at 1280 with reduced motion emulated (agent-browser can set
  `prefers-reduced-motion`; if it can't, note it and describe the code path)
- `/harness/get-started` at 768
Check in the 360 capture: no label collides with the ring or clips the
viewport. List capture paths in NOTES. If the dev server or agent-browser
fails twice, note it and continue.

## Test plan

- Keep `loop-data.ts` pure data so it is testable without a DOM. Existing tests
  live in `lib/` (`lib/catalog.test.ts`, `lib/markdown-twin.test.ts`) — follow
  that convention: create `lib/loop.test.ts` importing `LOOP_PHASES` from
  `@/components/diagrams/loop-data` and assert: exactly 6 phases; `n` values
  1–6 unique and ordered; exactly two gates (`plan` at n=3, `waivers` at n=5);
  every phase has non-empty `label/note/detail/you`; every `note` ≤ 6 words.
  Model file style on `lib/catalog.test.ts`.
- `pnpm test` → all pass including the new file.

## Done criteria

- [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all exit 0
- [ ] `grep -rn "DesignLoop" app components content lib` → no matches
- [ ] `components/diagrams/loop.tsx` no longer exists
- [ ] `content/harness/loop.mdx` contains `<OrbitLoop />` and NO numbered
      six-phase list (`grep -c "^1\. \*\*Intent" content/harness/loop.mdx` → 0)
- [ ] OrbitLoop: 6 tab buttons, 2 gate chips, roving tabindex, visible focus
      ring, panel wired via aria-labelledby (verify in the built HTML or dev DOM)
- [ ] Reduced motion: no travelling dot rendered; selection still works
- [ ] No raw colour values in new files (`grep -En "#[0-9a-fA-F]{3,8}\b" components/diagrams/orbit-loop.tsx components/diagrams/loop-data.ts` → no matches)
- [ ] Screenshots captured (or documented why not)
- [ ] No files outside scope modified (`git status`)

## STOP conditions

- Plan 016's tokens/lib are absent from your tree (drift check).
- The excerpts in "Current state" don't match the live files.
- The SVG text labels cannot be made collision-free at 360px after two layout
  attempts — report with a screenshot instead of shrinking text below 11px.
- Implementing the gate-pause choreography requires a spring/overshoot easing
  (SLP-8 conflict) — report; do not ship a bounce.
- You need to edit any out-of-scope file to make the build pass.

## Maintenance notes

- `loop-data.ts` is now the single source for phase copy — future loop-phase
  changes edit it once; loop.mdx's "two gates" prose is the only other place
  gates are described.
- A later stitch plan embeds `<OrbitLoop />` on the landing hero — keep the
  component self-contained (no page-level assumptions).
- The evaluator will grade this page against MOT-1/2/3, SLP-8, TOK-1,
  A11Y-2/4/5 — the reviewer re-runs that as acceptance.
