# Plan 016: Motion foundation — tokens, shared primitives, MOT-2/MOT-3 (proposed), and a Motion foundations page

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Do NOT update `plans/README.md` — your reviewer
> maintains the index.
>
> **Drift check (run first)**: `git diff --stat 7fbc703..HEAD -- app/globals.css components/landing-motion.tsx components/diagrams/flow.tsx harness/standards/catalog.yaml content/map.json components/sidebar.tsx components/mdx.tsx`
> Expect no output (no drift). If any in-scope file changed since `7fbc703`,
> compare the "Current state" excerpts below against the live code; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1 (three sibling plans build on these tokens)
- **Effort**: M
- **Risk**: MED (catalog edit gated by two validators; motion migration touches the landing)
- **Depends on**: none
- **Category**: direction (standards growth + design infrastructure)
- **Planned at**: commit `7fbc703`, 2026-07-12

## Why this matters

The standard governs motion with a single control (MOT-1) and no foundations
page, while the site itself hardcodes durations and easings ad hoc (600ms here,
240ms there, two different beziers). The division presentation is tomorrow;
the site is about to gain several animated diagrams, and without a declared
motion token set every one of them would deepen the inconsistency the standard
exists to prevent. This plan creates the motion layer: CSS tokens + a TS mirror
the diagrams consume, two proposed catalog controls that make the token
discipline checkable, and a Foundations page that documents it — so the site
dogfoods a motion standard instead of merely animating more.

## Current state

- `app/globals.css` — all design tokens live in `:root` (lines 9–90). There are
  **no** motion tokens anywhere (`grep -n "motion-\|--ease" app/globals.css` → no
  hits). The only motion-adjacent global is:
  ```css
  /* globals.css:162-164 */
  @media (prefers-reduced-motion: no-preference) {
    html { scroll-behavior: smooth; }
  }
  ```
- `components/landing-motion.tsx` — landing-only `Reveal` (600ms, `cubicBezier(0.4, 0, 0.2, 1)`)
  and `Parallax`. Header comment (lines 13–16): "Standard easing, no bounce
  (SLP-8); decorative motion stays off doc pages (MOT-1 — the landing page is
  the one marketing surface)." Line 18: `const EASE = cubicBezier(0.4, 0, 0.2, 1);`
- `components/diagrams/flow.tsx` — shared diagram reveal. Line 12:
  `export const FLOW_EASE = cubicBezier(0.22, 1, 0.36, 1);` Lines 34–37: duration
  0.24, stagger `(index * 70) / 1000`. Both files use the repo-wide
  reduced-motion pattern: `const reduced = useReducedMotion() === true;` with the
  comment "hydration null must not skip the animation" — **keep this exact
  pattern everywhere**.
- `harness/standards/catalog.yaml` — 60 controls; the only motion control:
  ```yaml
  - id: MOT-1
    source: TFX-DS
    title: Interface motion is 100-300ms with standard easing; no decorative motion on critical paths
    tier: L2
    check: deterministic
    ...
    fails_when:
      - animations over 300ms on task flows
      - transition-all
  ```
  Line 1 header comment still reads `# TFX Design Standard — control catalog…`
  (a known rename residual you will fix). New-control precedent — CNT-5 shows the
  exact shape of a proposed control (`status: proposed` after `tier`,
  `source: TFX-DS`, a `# comment block` above describing the proposal date,
  boundary with neighbouring controls, and "Pending design-lead approval").
- `harness/standards/schema.json` — required fields:
  `[id, source, title, tier, check, phase, applies_to, verify, waiver]`;
  `tier_waiver: {L0: none, L1: documented, L2: rationale}`; `status: ["proposed"]`;
  judgment/hybrid checks **require** a `detail` file; `MOT` prefix already in
  `id_prefixes` and `meta.categories`.
- `harness/checks/validate.py` — carries a `[COUNT-SYNC]` assertion: any prose in
  harness docs saying "N controls" errors when N ≠ catalog count. Adding two
  controls (60 → 62) **will** surface COUNT-SYNC errors that you must fix by
  updating the stated numbers wherever the validator points.
- `content/map.json` — `"foundations": { "slugs": ["colour", "typography", "spacing-radius", "iconography"] }`.
  The build guard `scripts/check-standards.mjs` fails if a content MDX exists
  without registration, or a registered doc has no sidebar entry — so the new
  page needs all three: file + map.json slug + sidebar entry.
- `components/sidebar.tsx` — Foundations group items (lines 80–86) list the four
  existing foundation pages.
- `components/mdx.tsx` — MDX component registry; diagrams are registered here
  (lines 26–34: `FoundationProfile, DesignLoop, AdoptionJourney, Ladder, Ratchet`).
- Foundation page frontmatter pattern (`content/foundations/typography.mdx`):
  ```yaml
  ---
  title: Typography
  description: "Type sets the hierarchy a tired teacher scans first: ..."
  status: settled
  ---
  ```
  `status: proposed` renders a "⚑ Proposed — react, don't obey" badge automatically.
- Repo conventions that bind this plan: tokens only, no raw hex in components —
  `harness/checks/token-audit.py app components lib` runs in prebuild and fails
  raw values outside the `globals.css` token block (TOK-1). Singapore English in
  prose (organise, colour, centre). Second person, active voice, sentence case.
  No bounce/elastic easing (SLP-8). `motion` package imports come from
  `"motion/react"` (never `framer-motion`).

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck | `pnpm typecheck` | exit 0 |
| Lint | `pnpm lint` | exit 0 |
| Unit tests | `pnpm test` | all pass (2 existing test files + your new one) |
| Standards guard | `node scripts/check-standards.mjs` | `OK: 62 controls valid, 31 docs registered, present, and in nav` |
| Harness validator | `python3 harness/checks/validate.py` | `OK…` line, exit 0, **no COUNT-SYNC errors** |
| Validator self-test | `python3 harness/checks/validate.py --self-test` | OK |
| Full build | `pnpm build` | exit 0, ~211 pages, no `[doc-page]` warnings |

A fresh worktree has no `node_modules` — run `pnpm install` first.

## Suggested executor toolkit

- Read `/Users/jeongwondo/.claude/skills/web-animation-design/SKILL.md` before
  writing the foundations page — it is the duration/easing source this plan's
  token values come from (Emil Kowalski's course distillation).
- Reference (research already done, cite-free): Material 3 duration tokens run
  50–1000ms in 50ms steps with `standard = cubic-bezier(0.2, 0, 0, 1)`; IBM
  Carbon uses fast-01 70ms → slow-02 700ms with productive/expressive split.
  Our scale below is deliberately smaller: four steps, two easings.

## Scope

**In scope** (the only files you may modify/create):
- `app/globals.css` (add motion token block)
- `lib/motion.ts` (create), `lib/motion.test.ts` (create)
- `components/landing-motion.tsx`, `components/diagrams/flow.tsx` (migrate to tokens)
- `harness/standards/catalog.yaml` (MOT-2, MOT-3, header comment line 1)
- `harness/standards/controls/mot-3.md` (create)
- `harness/docs/catalog-changes/mot-2-mot-3-motion-tokens.md` (create)
- Any file `validate.py` names in a `[COUNT-SYNC]` error (count strings only)
- `content/governance/changes.mdx` (changelog entries — Step 4b)
- `content/foundations/motion.mdx` (create)
- `components/diagrams/motion-scale.tsx` (create), `components/mdx.tsx` (register)
- `content/map.json`, `components/sidebar.tsx` (one entry each)
- `lib/catalog.test.ts` — **Step 4c only**: the proposed-set pin (count 3 → 5;
  expected ID array gains MOT-2, MOT-3 in catalog file order). Nothing else in
  the file.
- `components/catalog-browser.tsx` — **only if** the "N of 60" result count is a
  hardcoded literal; make it derive from the loaded controls' length. If it is
  already derived, do not touch the file.

**Out of scope** (do NOT touch):
- Every other control in `catalog.yaml` — you add two entries and edit the line-1
  comment; nothing else in the file changes.
- `harness/checks/*.py` logic (you are not writing an enforcement script; MOT-2
  ships `enforced: manual`).
- `components/diagrams/loop.tsx`, `ratchet.tsx`, `ladder.tsx`,
  `adoption-journey.tsx`, `foundation-profile.tsx` — sibling plans own them.
- `app/page.tsx` and all content outside `content/foundations/motion.mdx`.
- `harness/plans/**`, `harness/docs/decisions/**` (history; never rename).

## Git workflow

- You are already in a dedicated worktree on branch `advisor/016-motion-foundation`. Commit there; do not push.
- Commit style (match `git log`): `feat(site): …`, `docs(standards): …` — e.g.
  `feat(site): motion token set + lib mirror`, `docs(standards): propose MOT-2/MOT-3 via ratchet`.

## Steps

### Step 1: Motion tokens in globals.css

In `app/globals.css`, inside `:root` after the `--radius: 0.5rem;` line, add:

```css
  /* ── Motion — the only durations and easings site code may use (MOT-2, proposed).
     Duration follows the size of the change; easing follows its direction
     (enter/exit → out, on-screen movement → in-out, hover tint → plain ease).
     Interface motion stays ≤300ms (MOT-1); --motion-story is for narrative
     surfaces only — explanatory diagrams and the landing reveal — never task UI.
     A11Y-5: every consumer provides a reduced-motion variant. ── */
  --motion-fast: 120ms;
  --motion-base: 200ms;
  --motion-slow: 300ms;
  --motion-story: 600ms;
  --ease-out: cubic-bezier(0.215, 0.61, 0.355, 1);
  --ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);
```

**Verify**: `grep -c "motion-fast\|motion-base\|motion-slow\|motion-story" app/globals.css` → `4` (one each). `pnpm build` still passes later; for now `node scripts/check-standards.mjs` → OK (unchanged count).

### Step 2: lib/motion.ts — the TS mirror

Create `lib/motion.ts`:

```ts
import { cubicBezier } from "motion/react";

/* Mirror of the motion tokens in app/globals.css — motion/react needs numbers,
   CSS needs custom properties; lib/motion.test.ts keeps the two in sync.
   Change values there and here together, never one side alone (MOT-2). */
export const DUR = { fast: 0.12, base: 0.2, slow: 0.3, story: 0.6 } as const;
export const STAGGER = 0.06;
export const EASE_OUT = cubicBezier(0.215, 0.61, 0.355, 1);
export const EASE_IN_OUT = cubicBezier(0.645, 0.045, 0.355, 1);
/* Bezier control points, exported for the sync test. */
export const EASE_OUT_POINTS = [0.215, 0.61, 0.355, 1] as const;
export const EASE_IN_OUT_POINTS = [0.645, 0.045, 0.355, 1] as const;
```

Create `lib/motion.test.ts` (model the header style on `lib/catalog.test.ts`):
read `app/globals.css` with `fs`, regex out each `--motion-*` ms value and both
`--ease-*` bezier tuples, and assert they equal `DUR` (×1000) and
`*_POINTS`. Four duration assertions + two bezier assertions minimum.

**Verify**: `pnpm test` → all pass, including the new file. `pnpm typecheck` → exit 0.

### Step 3: Migrate the two existing motion call sites

- `components/landing-motion.tsx`: replace the local `EASE` with
  `import { DUR, EASE_OUT } from "@/lib/motion"`; `Reveal`'s transition becomes
  `{ duration: DUR.story, ease: EASE_OUT, delay: delay / 1000 }`. Update the
  header comment: the 600ms reveal is now the token `--motion-story`, i.e. the
  documented narrative tier rather than an undocumented exception. Keep the
  `reduced` logic byte-for-byte.
- `components/diagrams/flow.tsx`: replace `FLOW_EASE` with `EASE_OUT` from
  `@/lib/motion` (keep exporting `FLOW_EASE = EASE_OUT` so any importer still
  compiles), duration `0.24` → `DUR.base`, stagger `(index * 70) / 1000` →
  `index * STAGGER`.

**Verify**: `grep -rn "cubicBezier(" components/ app/ | grep -v node_modules` →
only `lib/motion.ts` defines beziers (no other literals). `pnpm typecheck && pnpm lint` → exit 0.

### Step 4: MOT-2 and MOT-3 in the catalog (proposed, via ratchet)

In `harness/standards/catalog.yaml`:

1. Line 1: change the header comment `# TFX Design Standard — control catalog…`
   to `# DXD Design Standard — control catalog (single source of truth)`.
   Touch nothing else in the header block.
2. After the full `MOT-1` entry (it ends with its `refs:` line) and before the
   `- id: IDN-1` entry, insert — comment blocks included:

```yaml
  # MOT-2: ratchet PROPOSAL 2026-07-12 — motion tokens, from the site's own
  # motion-layer build-out (landing reveal, diagram animations). Boundary with
  # MOT-1: MOT-1 bounds where motion may run and how long; MOT-2 bounds where
  # the values come from. Pending design-lead approval.
  - id: MOT-2
    source: TFX-DS
    title: Motion values come from the declared motion token set — durations and easings are never hardcoded in component code
    tier: L2
    status: proposed
    check: deterministic
    phase: [implement, verify]
    applies_to: [component, page]
    verify: "Grep transition/animation values in component code: every duration and easing resolves to a motion token (--motion-*/--ease-* or their declared code mirror); no raw ms or cubic-bezier literals outside the token definitions"
    waiver: rationale
    fails_when:
      - a raw duration (350ms, 0.4s) or cubic-bezier literal in component code where the token set exists
      - a surface that animates but declares no motion token set
      - the narrative tier (--motion-story) used on interface or task UI
    enforced: manual
    refs: [https://github.com/transformteamsg/tfx-design-standard]

  # MOT-3: ratchet PROPOSAL 2026-07-12 — static information parity, written for
  # the animated-diagram build-out. Boundary: A11Y-5 demands a reduced-motion
  # variant exists; MOT-3 demands that variant lose no information. MOT-1
  # bounds duration and placement; MOT-3 bounds meaning. Pending design-lead
  # approval.
  - id: MOT-3
    source: TFX-DS
    title: Motion may emphasise meaning but never carry it alone — an animated surface communicates the same information with animations off
    tier: L2
    status: proposed
    check: judgment
    phase: [plan, implement, verify]
    applies_to: [page, component]
    verify: "With prefers-reduced-motion set, every diagram and animated surface still communicates its full meaning: states, order, gates, and relationships remain legible statically"
    waiver: rationale
    fails_when:
      - a diagram whose meaning (order, causality, state) exists only in the animation
      - a reduced-motion variant that drops information instead of motion
      - motion that implies a state change that is not happening
    detail: controls/mot-3.md
    refs: [https://github.com/transformteamsg/tfx-design-standard]
```

3. Create `harness/standards/controls/mot-3.md`. First read
   `harness/standards/controls/lay-7.md` and `harness/standards/controls/slp-9.md`
   and match their structure exactly (heading, statement, pass/fail guidance,
   examples). Content: what "information parity" means, three concrete pass
   examples (loop diagram whose phases/gates are all legible as static SVG; a
   reveal that only fades; hover states) and three fails (an order shown only by
   a travelling dot with unnumbered phases; progress conveyed only by animation;
   reduced-motion hiding a diagram wholesale), and the evaluator question to ask
   ("read the surface with animations off: is anything missing, not just still?").
4. Create `harness/docs/catalog-changes/mot-2-mot-3-motion-tokens.md`. Model on
   `harness/docs/catalog-changes/slp-9-ai-writing-tells.md` (read it first):
   evidence (the site's own hardcoded 600ms/240ms/two-bezier drift), the
   proposal, boundary notes as in the YAML comments, requested approver: design
   lead (foundation owner).

**Verify**: `python3 harness/checks/validate.py --self-test && python3 harness/checks/validate.py`
→ if COUNT-SYNC errors appear, update exactly the count strings it names
(60 → 62) and re-run until `OK` with exit 0. Then `node scripts/check-standards.mjs`
→ `OK: 62 controls valid…`.

### Step 4c: Update the proposed-set pin in lib/catalog.test.ts

`lib/catalog.test.ts` deliberately pins the proposed-control set ("status:
proposed survives projection for exactly the three stamped proposals", lines
131–141): `expect(yaml.match(/status: proposed/g)?.length).toBe(3)` and
`expect(proposedIds).toEqual(["CNT-5", "CNT-6", "CNT-7"])`. Adding MOT-2/MOT-3
extends the stamped set, so update the pin to the new truth — count `3` → `5`,
and the expected array gains `"MOT-2", "MOT-3"` in the order the projection
actually yields (catalog file order puts CNT before MOT; confirm against the
failing test output rather than assuming). Keep the exact-pin style — it is a
deliberate ratchet that catches accidental proposals; do not weaken it to
`arrayContaining`/`toBeGreaterThanOrEqual`. Update the test's descriptive
string ("three" → "five") so it stays truthful. No other edits in this file.

**Verify**: `pnpm test` → all pass, including the updated pin.

### Step 4b: Changelog truth in content/governance/changes.mdx

`content/governance/changes.mdx` currently records "Catalog 53 → 57 controls."
as its newest total, and its 2026-07-10 entry says control ids/bodies are
"unchanged" — but the catalog holds 60 controls (57 → 60 was never recorded)
and this plan takes it to 62. Read the file's existing entry format first,
then add ONE new entry at the top, dated 2026-07-12, that: (a) notes the
2026-06/07 ratchet rounds took the catalog 57 → 60 (closing the unrecorded
gap), and (b) records MOT-2 and MOT-3 as ⚑ proposed additions, 60 → 62, with a
link to `/standards/catalog`. Match the file's existing entry voice and length.

**Verify**: `grep -n "62" content/governance/changes.mdx` → your new entry;
`grep -rn "53 → 57" content/governance/changes.mdx` → still present (history is
never rewritten).

### Step 5: The Motion foundations page + MotionScale specimen

1. Create `components/diagrams/motion-scale.tsx` (`"use client"`): a compact
   specimen showing the four durations side by side. Four rows, one per token
   (`fast 120ms`, `base 200ms`, `slow 300ms`, `story 600ms`): each row = token
   name + value + a track with a small square knob. One "Play" button
   (`<button>`, visible label, the repo's focus-visible pattern:
   `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)`)
   replays all four knobs sliding their tracks simultaneously with `EASE_OUT`
   and their own duration — the eye sees the scale, not four numbers. Reduced
   motion (`useReducedMotion() === true`): knobs render at the track end,
   button hidden, values still fully legible (MOT-3 pass). Tokens only; sizes
   ≥24px hit target on the button (A11Y-4). Import `DUR`, `EASE_OUT` from
   `@/lib/motion`.
2. Register it in `components/mdx.tsx`: add
   `import { MotionScale } from "@/components/diagrams/motion-scale";` **as the
   last diagram import** and `MotionScale,` as the **last** entry of
   `mdxComponents` (sibling plans insert entries above — placement avoids
   merge collisions).
3. Create `content/foundations/motion.mdx` with frontmatter
   `title: Motion`, a one-line description in the house voice (e.g. "Motion is
   feedback, not decoration: four durations, two easings, and one rule — nothing
   moves that doesn't mean something."), `status: proposed`. Body sections:
   - **The scale** — table: token · value · use (fast → hover/press feedback;
     base → reveals, toggles, small movement; slow → large surfaces; story →
     narrative diagrams and the landing reveal only, never task UI). Then
     `<MotionScale />`.
   - **Easing** — table: `--ease-out` enters/exits (start fast, settle);
     `--ease-in-out` on-screen movement; plain `ease` for hover tint changes.
     One line: no bounce or overshoot, ever (SLP-8).
   - **When not to animate** — frequency principle (something used 100+ times a
     day gets no animation), keyboard navigation is always instant, paired
     elements share one duration and easing.
   - **Reduced motion** — the repo pattern (`useReducedMotion() === true` /
     `motion-reduce:` utilities), and information parity: turning motion off
     may remove emphasis, never meaning (MOT-3).
   - **The controls** — MOT-1 (settled), MOT-2 ⚑, MOT-3 ⚑, each one line with a
     link to `/standards/catalog/<id>`. British/Singapore spelling throughout.
4. Register the page: `content/map.json` foundations slugs → append `"motion"`;
   `components/sidebar.tsx` Foundations items → append
   `{ href: "/foundations/motion", title: "Motion" }` as the **last** item of
   that group (do not reorder others — a sibling plan reorders nav).

**Verify**: `node scripts/check-standards.mjs` → `OK: 62 controls valid, 31 docs registered…`.
`pnpm build` → exit 0, includes `/foundations/motion`, no `[doc-page]` warnings.

### Step 6: Full gate + evidence

Run all: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.
Optional screenshot evidence: `pnpm dev --port 4016` then use the `agent-browser`
CLI (read `~/.claude/skills/agent-browser/SKILL.md` for usage) to capture
`/foundations/motion` at 360/768/1280; list file paths in NOTES. If
agent-browser fails, say so and continue — the reviewer captures instead.

## Test plan

- `lib/motion.test.ts` as specified in Step 2 (≥6 assertions, CSS↔TS sync).
- Negative check: temporarily set `DUR.base` to 0.21 → `pnpm test` fails → revert.
  (Do this to prove the test bites; note it in NOTES.)

## Done criteria

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` all exit 0
- [ ] `node scripts/check-standards.mjs` → `OK: 62 controls valid, 31 docs registered, present, and in nav`
- [ ] `python3 harness/checks/validate.py` → OK, zero COUNT-SYNC errors
- [ ] `grep -rn "cubicBezier(" app components | grep -v lib/motion` → no matches (worktree paths)
- [ ] `/foundations/motion` renders with the ⚑ Proposed badge and MotionScale
- [ ] catalog.yaml line 1 says `# DXD Design Standard — control catalog (single source of truth)`
- [ ] No files outside the in-scope list modified (`git status`)

## STOP conditions

- The drift check shows changes in in-scope files, or any "Current state" excerpt doesn't match the live code.
- `validate.py` fails for any reason other than a COUNT-SYNC count string you can update, twice in a row.
- Registering the new page makes `check-standards.mjs` demand changes beyond the two one-line registrations.
- You find an existing `--motion-*` or `--ease-*` token already defined (another plan landed first — coordinate via reviewer).

## Maintenance notes

- Sibling plans 017/018/020 consume `lib/motion.ts` and the CSS tokens; changing
  token names after they land means touching all consumers — names are the API.
- MOT-2 ships `enforced: manual`; a future checks script (grep-based) is the
  natural follow-up and must NOT be claimed as existing anywhere.
- The design lead (foundation owner) must approve or reject MOT-2/MOT-3; they
  stay ⚑ proposed until then. Do not mark them settled.
