# MOT-2 and MOT-3 proposed: motion tokens and static information parity

**Date:** 2026-07-12 · **Change type:** two new controls via the ratchet, both
`status: proposed` (no tier change to existing controls) · **Requested
approver:** design lead (foundation owner). Pending — the controls carry the
⚑ Proposed badge until the decision.

This record lives outside `docs/decisions/` deliberately: that directory is
audited by `checks/audit-record.py` against the loop-run template, and this
change came from the site's motion-layer build-out, not a loop run.

## Triggering incident

The site's own motion layer drifted with no control to catch it. Before the
2026-07-12 motion foundation work, the standard governed motion with MOT-1
alone (duration bounds, standard easing, placement) while the site hardcoded:

- `components/landing-motion.tsx` — a 600ms reveal with
  `cubicBezier(0.4, 0, 0.2, 1)`, undocumented as an exception to MOT-1's
  300ms interface ceiling.
- `components/diagrams/flow.tsx` — a 240ms reveal with a *different* bezier,
  `cubicBezier(0.22, 1, 0.36, 1)`, plus a 70ms stagger.

Two surfaces, two easings, three durations — none declared anywhere. With
several animated diagrams about to land, every new surface would deepen the
drift. Per the ratchet rule, defects no control covers become control
proposals.

## The proposal

- **MOT-2 (L2, deterministic, `enforced: manual`)** — motion values come from
  the declared motion token set; durations and easings are never hardcoded in
  component code. The token set now exists: `--motion-fast/base/slow/story`
  and `--ease-out/--ease-in-out` in `app/globals.css`, mirrored for
  motion/react by `lib/motion.ts` (kept in sync by `lib/motion.test.ts`).
  No enforcement script yet — verification is a manual grep per the control's
  `verify` line.
- **MOT-3 (L2, judgment, detail: `controls/mot-3.md`)** — motion may emphasise
  meaning but never carry it alone; an animated surface communicates the same
  information with animations off.

## Boundary notes

- **MOT-1 / MOT-2:** MOT-1 bounds where motion may run and how long; MOT-2
  bounds where the values come from. A 250ms animation on a task flow passes
  MOT-1 and still fails MOT-2 if the 250ms is a literal in component code.
- **A11Y-5 / MOT-3:** A11Y-5 demands a reduced-motion variant exists; MOT-3
  demands that variant lose no information.
- **MOT-1 / MOT-3:** MOT-1 bounds duration and placement; MOT-3 bounds meaning.

## Tier rationale

Both **L2 / rationale waiver**. MOT-2 is a discipline over sources of values,
not a user-facing floor; a rationale waiver covers legitimate one-offs (e.g. a
third-party component exposing no easing hook). MOT-3 is judgment — blocking on
it would litigate every decorative fade; the evaluator question ("read the
surface with animations off: is anything missing, not just still?") is
calibrated in `controls/mot-3.md`.

## Verification

- `python3 checks/validate.py` — schema, catalog ↔ detail consistency,
  COUNT-SYNC (68 → 70 prose counts updated where the validator pointed).
- Site `pnpm build` — the prebuild gate (`scripts/check-standards.mjs`) and MDX
  parse pass.
- `pnpm test` — `lib/motion.test.ts` holds the CSS ↔ TS token mirror in sync.
