# Plan 024: Evaluator fix round — the REVISE list from the independent pass on `57b02a4`

Unlike plans 016–023 this was not pre-written: it is the enumerated fix list
from the independent tfx:evaluator's REVISE verdict (2026-07-13), dispatched
verbatim to an Opus executor on branch `advisor/024-evaluator-fixes`
(base `57b02a4`). Recorded here so the ledger's plan numbering stays whole.

## The six fixes (+1 addendum)

1. **A11Y-1 (L0)** — landing "one test" panel attribution was `text-white/80`
   on tw-blue = 3.67:1 → plain `text-white` (4.92:1). `app/page.tsx`.
2. **A11Y-1 (L0)** — Ladder enforced-pill italic answer was
   `text-primary-foreground/85` = 3.97:1 → alpha dropped (4.92:1).
   `components/diagrams/ladder.tsx:46`.
3. **A11Y-4 (L1)** — sub-44px mobile targets fixed via `max-sm:` min-heights:
   MotionScale Play (29→44), Copy page / View as Markdown (34→44), mobile nav
   trigger (28→44), top-bar Domains/For agents (21/42→44/46).
   **Addendum** (executor-caught): the same two top-bar links were 21px on
   desktop, under the 24px desktop floor → `min-h-6 py-0.5` (25px measured).
4. **CNT-3 (L2)** — `content/harness/loop.mdx` sentences 28/27/28/39 words
   split to ≤25; the outer-loop sentence made active voice. content-lint clean.
5. **CNT-3 (L2)** — `/overview` intro tricolon (~32 words, verbless) split to
   22/11/23-word sentences. `app/overview/page.tsx`.
6. **Hydration** — reduced-motion first loads threw React hydration
   mismatches on animated SVGs. Central fix: `useReducedMotionSafe()` in
   `lib/motion.ts` (mount-gated `useReducedMotion`), swapped at every direct
   call site (`landing-motion`, `flow`/useFlowReveal — covering ladder/
   ratchet/journey/tree transitively — `orbit-loop`, `motion-scale`,
   `compare`). Verified both ways: zero hydration warnings with and without
   reduced motion; animations unchanged; reduced renders information-complete.

## Outcome

Branch commits `140d6e4 → 5bd262c`; merged into `advisor/presentation-sprint`
at **`d647355`**. Full gates green (typecheck, lint, 45 tests, 216-page build,
zero `[doc-page]`, guard + validators at 62 controls / 31 docs). A second,
fresh independent evaluator re-measured all six items on `d647355`:
**APPROVE** (4.92:1 on both L0 items; 44/44/44/44/46/44 at 360; 25/25 at 1280;
lint clean; 22/11/23-word sentences; zero hydration warnings, animations
verified live). Regression spot-check on `/` and `/harness/loop`: clean.

## Maintenance notes

- `useReducedMotionSafe` is now the house pattern for anything animated that
  server-renders — direct `useReducedMotion() === true` in components will
  reintroduce the hydration mismatch.
- The evaluator's non-blocking residuals live in `plans/README.md` (sprint
  section) for the design lead: TYP-3 off-scale sizes, illustration-prompt
  slots, SLP-8 narrative-overshoot sanction, MOT-2/3 approval, "Design for
  One Person" re-confirmation.
