# Plan 020: Diagram language v2 — a ratchet that ratchets, a journey that travels, honest gate treatment

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If any
> STOP condition occurs, stop and report — do not improvise. Do NOT update
> `plans/README.md` — your reviewer maintains the index.
>
> **Drift check (run first)**: plan 016's motion layer must be present:
> `test -f lib/motion.ts && grep -c "motion-story" app/globals.css` → file
> exists and count ≥1, else STOP. Then
> `git diff --stat 7fbc703..HEAD -- components/diagrams/ratchet.tsx components/diagrams/adoption-journey.tsx components/diagrams/foundation-profile.tsx components/diagrams/flow.tsx`
> — expected drift: `flow.tsx` easing/duration now come from `@/lib/motion`
> (plan 016). Other changes: compare to excerpts; mismatch = STOP.

## Status

- **Priority**: P2 (high visibility, but the loop and compare demos lead)
- **Effort**: M–L
- **Risk**: MED (three visual rebuilds; must not regress the pages that embed them)
- **Depends on**: plans/016-motion-foundation.md (DONE required)
- **Category**: direction (communication design)
- **Planned at**: commit `7fbc703` + plan 016's branch, 2026-07-12

## Why this matters

Three different concepts — an irreversible ratchet, a one-time adoption
journey, and an inheritance tree — currently render as the *same* vertical
card stack (the shared `Flow` stepper), each with a filled-primary step that
looks like a button and isn't. The site's owner called these "interface-alike
graphics… not intentional". A standard whose pitch is "form should serve
meaning" cannot illustrate irreversibility, linear travel, and branching with
one identical stack. This plan gives each concept its own honest form, with
subtle token-driven motion that *is* the meaning (the ratchet's pawl blocks the
back-slide; the journey advances one way; the tree draws its inheritance).

## Current state (verbatim excerpts)

- `components/diagrams/flow.tsx` — shared primitive. Gate rows (lines 74–78):
  ```tsx
  s.gate
    ? "flex items-center gap-3 rounded-lg bg-primary px-3 py-2.5 text-primary-foreground"
    : "flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"
  ```
  and the pill (lines 104–108): `…rounded-full border border-primary-foreground/40 px-2 py-0.5 text-[11px] font-semibold">human gate`.
  Also exports `useFlowReveal`, `FlowRow`, `Rise` (in-view stagger reveal,
  reduced-motion safe) — these utilities stay.
- `components/diagrams/ratchet.tsx` — `Flow` with five steps:
  "A defect escapes to a shipped surface (observed, not speculated)" → "It
  becomes a control proposal (with evidence attached)" → "A design lead
  approves it (or rejects it, in writing)" `gate: true` → "The control enters
  the catalog (one verifiable statement)" → "Every future run checks it (the
  same defect can't escape twice)". Caption: "The catalog only tightens. A
  control is never weakened or removed by a domain; recurring waivers mean fix
  the standard or fix the system."
  Embedded ONLY at `content/governance/governance.mdx:16` under the heading
  `## The ratchet, step by step`.
- `components/diagrams/adoption-journey.tsx` — `Flow` with five steps (Read
  this page / Decide your brand basics / Install the plugin / Run the wizard
  [detail: three question-group lines + "skip any non-essential question…"] /
  Design your first screen) + caption about the wizard writing DESIGN.md.
  Embedded ONLY at `content/harness/get-started.mdx:69`.
- `components/diagrams/foundation-profile.tsx` — already the best diagram: a
  1→4→1 tree (foundation box → four domain Links → "your product"). Its
  terminal node (lines 58–68) is a filled-primary non-interactive block:
  `…rounded-md bg-primary px-3.5 py-2 text-[12px] font-semibold text-primary-foreground">your product`.
  Embedded at `content/sections/domains.mdx:13` and
  `content/harness/get-started.mdx:22`.
- `lib/motion.ts` (plan 016): `DUR {fast .12, base .2, slow .3, story .6}`,
  `STAGGER`, `EASE_OUT`, `EASE_IN_OUT`. CSS tokens `--motion-*`, `--ease-*`.
- Conventions binding this plan: tokens only (TOK-1; token-audit in prebuild);
  no bounce/overshoot (SLP-8); interface motion ≤300ms, narrative diagram
  motion may use `--motion-story` (MOT-1/MOT-2 ⚑); reduced-motion pattern
  `useReducedMotion() === true` everywhere, and the static state must carry
  ALL information (MOT-3 ⚑); filled-primary treatment is reserved for real
  interactive elements sitewide; focus-visible pattern
  `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)`;
  Singapore English.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck / Lint / Tests | `pnpm typecheck && pnpm lint && pnpm test` | exit 0 |
| Full build | `pnpm build` | exit 0, no `[doc-page]` warnings |
| Dev server | `pnpm dev --port 4020` | serves |

## Suggested executor toolkit

- `/Users/jeongwondo/.claude/skills/web-animation-design/SKILL.md` and
  `/Users/jeongwondo/.claude/skills/make-interfaces-feel-better/SKILL.md`.
- `agent-browser` (`~/.claude/skills/agent-browser/SKILL.md`) for captures.

## Scope

**In scope** (only these):
- `components/diagrams/ratchet.tsx` (rebuild)
- `components/diagrams/adoption-journey.tsx` (rebuild)
- `components/diagrams/foundation-profile.tsx` (refine)
- `components/diagrams/flow.tsx` (gate treatment only — Step 1)

**Out of scope** (do NOT touch):
- `components/diagrams/orbit-loop.tsx`, `loop-data.ts`, `loop.tsx`,
  `ladder.tsx`, `motion-scale.tsx` — sibling plans own them.
- Every `.mdx` file. Component APIs must stay drop-in compatible
  (`<Ratchet />`, `<AdoptionJourney />`, `<FoundationProfile />` with no
  props) so no content file changes.
- `components/mdx.tsx` (exports unchanged), `lib/motion.ts`, `app/globals.css`.

## Git workflow

- Worktree branch `advisor/020-diagram-language`; one commit per component;
  style `feat(site): …`; do not push.

## Steps

### Step 1: Honest gate treatment in `flow.tsx`

The filled-primary gate card is a false affordance (looks like a button).
Replace the gate branch classes: gate rows render like normal rows but with a
2px `var(--tw-blue)` left-accent-free treatment — specifically: `border
border-(--tw-blue)` (full border, not a side stripe — SLP-3 forbids side-tab
borders), numeral chip stays dark, and the pill becomes an OUTLINED chip:
`rounded-full border border-(--tw-blue) px-2 py-0.5 text-[11px] font-semibold
text-tw-blue` with unchanged text. Remove the `bg-primary` branch entirely.
`Flow` remains used by any consumer until the sibling rebuilds land — after
Steps 2–3 its only remaining consumer may be zero; KEEP the file regardless
(its reveal utilities are shared).

**Verify**: `grep -n "bg-primary" components/diagrams/flow.tsx` → no matches;
`pnpm typecheck` → exit 0.

### Step 2: `ratchet.tsx` — a ratchet that visibly cannot go back

Rebuild as a self-contained `"use client"` SVG figure (keep export name
`Ratchet`, no props):

**Form.** A horizontal ratchet rack: a baseline with 5 upright teeth
(asymmetric right-triangle teeth — vertical leading edge, sloped trailing
edge: the shape that physically permits one direction), and a pawl (a small
lever from above) resting against the last tooth. Under the rack, the five
stages sit as compact labelled stations aligned to the teeth (12.5px label +
11.5px muted note, from the current step data — keep the exact wording):
defect observed → proposal + evidence → design lead approves (this station
gets the outlined "human gate" chip from Step 1's language) → enters the
catalog → checked on every future run. Keep the existing caption verbatim
below as `<figcaption>`.

**Motion (in-view, once; tokens only).** The sequence that IS the concept:
1. The rack and four teeth render; the fifth tooth slides in from the right
   (`x` transform, `DUR.story`, `EASE_OUT`) and passes under the pawl — pawl
   rotates up ~14° (transform-origin at its pivot, `DUR.base`,
   `EASE_IN_OUT`) and drops behind it.
2. The new tooth then attempts to slide BACK ~10px (`DUR.base`,
   `EASE_IN_OUT`) and stops dead against the pawl's vertical edge (no
   overshoot, no shake — one clean blocked move; SLP-8).
3. Rest. Total ≤ 2.5s, runs once per page view (`useInView` once, like
   `useFlowReveal`).
Reduced motion: render the final state (five teeth, pawl seated) immediately —
every label and the caption carry the full meaning (MOT-3).

All geometry via tokens: teeth `var(--foreground)` at low opacity or
`var(--border-strong)`, active tooth + pawl accents `var(--tw-blue)`, station
text as elsewhere. Nothing interactive → nothing may look clickable (no fills
that read as buttons).

**Verify**: `pnpm typecheck && pnpm lint` → exit 0; dev-server check on
`/governance` (embed unchanged) — figure renders, animation runs once.

### Step 3: `adoption-journey.tsx` — a path you travel once

Rebuild (keep export name and prop-less API):

**Form.** At `sm:` and up — a horizontal milestone path: a single baseline
with 5 numbered milestone dots (≥24px), labels above/below alternating is NOT
allowed (harder to scan) — labels below each dot, notes under labels, and the
wizard's three question-lines as an indented sub-list under milestone 4 (keep
the exact existing strings, including "skip any non-essential question for the
default"). An arrowhead at the path's end (it goes somewhere: your first
screen through the loop). Below `sm:` — fall back to a compact vertical list
(you may reuse `FlowRow`/`useFlowReveal`), same content.

**Motion.** In-view once: the baseline draws left→right (scaleX or SVG
pathLength, `DUR.story`, `EASE_OUT`), milestones pop in sequence (opacity +
2px lift, `DUR.base`, stagger `STAGGER`) as the line reaches them. Reduced
motion: everything static, complete.

Keep the existing caption (wizard writes DESIGN.md for you; answer only what
you know) as figcaption. No filled-primary anywhere; milestone 4's wizard
sub-list stays plain text.

**Verify**: `pnpm typecheck && pnpm lint` → exit 0; `/harness/get-started`
renders the new journey at 1280 and the vertical variant at 360 (dev check).

### Step 4: `foundation-profile.tsx` — keep the tree, fix the terminal, draw the inheritance

Three surgical changes only:
1. Terminal node: `bg-primary …` → outlined emphasis:
   `rounded-md border-2 border-(--tw-blue) bg-surface px-3.5 py-2 text-[12px] font-semibold text-tw-blue`
   (same size/position; the arrow above it stays, recolour its
   `var(--primary)` references to `var(--tw-blue)` for consistency).
2. Connector draw-in: the vertical/horizontal hairline rails animate scaleY/
   scaleX 0→1 in inheritance order (foundation stem → rail → domain stems →
   product stem), `DUR.base` each, `STAGGER` between, `EASE_OUT`, in-view
   once — reuse the existing `Rise`/`useFlowReveal` mechanics where possible.
   Reduced motion: rails static (as today).
3. Everything else (domain Links, copy, caption) byte-identical.

**Verify**: `pnpm typecheck && pnpm lint` → exit 0; `/domains` +
`/harness/get-started` render correctly (dev check).

### Step 5: Full gate + evidence

`pnpm typecheck && pnpm lint && pnpm test && pnpm build` → all exit 0.
agent-browser captures (`pnpm dev --port 4020`): `/governance` at 768+1280,
`/harness/get-started` at 360+1280, `/domains` at 768. One capture of
`/governance` with reduced motion emulated if the tool supports it. Paths in
NOTES.

## Test plan

No unit tests required (presentation components; no extractable pure logic).
Machine gates: builds green; `grep -rn "bg-primary" components/diagrams/` → no
matches (the false-affordance treatment is gone from all diagrams);
`grep -En "#[0-9a-fA-F]{3,8}\b" components/diagrams/ratchet.tsx components/diagrams/adoption-journey.tsx components/diagrams/foundation-profile.tsx`
→ no matches (tokens only).

## Done criteria

- [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all exit 0
- [ ] `grep -rn "bg-primary" components/diagrams/` → no matches
- [ ] `<Ratchet />`, `<AdoptionJourney />`, `<FoundationProfile />` APIs
      unchanged; zero `.mdx` files modified (`git status`)
- [ ] Ratchet: teeth + pawl form; blocked back-slide beat present; reduced
      motion = complete static final state
- [ ] Journey: horizontal at `sm:`+, vertical below; wizard sub-list intact
- [ ] Tree: terminal node outlined (not filled); rails draw in order
- [ ] No raw colour values in the three rebuilt files
- [ ] Screenshots captured (or documented why not)

## STOP conditions

- Plan 016's motion layer is absent (drift check).
- The excerpts above don't match the live files.
- The ratchet's blocked-return beat cannot be made readable without overshoot/
  bounce after two attempts — ship the draw-in only, note it, and report.
- Any change would require touching an `.mdx` file or `mdx.tsx` — the APIs are
  the contract; report instead.

## Maintenance notes

- The three diagrams now share only the reveal utilities, not their form —
  future diagrams should follow this rule: pick the geometry that encodes the
  concept (cycle/rack/path/tree), never default to a stack.
- The evaluator grades these against MOT-1/2/3, SLP-3/8, TOK-1 — the ratchet's
  full border (not a side stripe) is deliberate: SLP-3 bans side-tab accents.
- If `Flow` ends up with zero consumers after this program, removing it is a
  separate cleanup — do not remove it here (its utilities are imported).
