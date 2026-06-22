# Evaluator-recall results

One entry per run, newest first. Scoring rules live in `expected-findings.yaml`.

## Run 6 — 2026-06-22 (Batch 4 self-run)

- **Trigger:** harness self-run after Batch 4 landed (plans 033–042) + PR #21 controls.
  Skill bodies changed (035 markers, 037 source-of-truth note, 039 ledger) but no
  `description:` — recall re-run as the dogfood quality check.
- **Evaluator:** real `tfx-design-evaluator` agent, design-review rubric. Same dispatch as
  prior runs (blind copy with PLANT stripped, code-only, all 6 controls in scope, standards
  path passed).
- **Verdict returned:** `VERDICT: fail`, 6 blocking findings.

| Plant | Control | Caught? | As |
|---|---|---|---|
| 1 | CNT-1 (raw "Error 500") | yes | blocking |
| 2 | A11Y-3 (placeholder-only label) | yes | blocking (L0) |
| 3 | CMP-2 (one-click delete-all) | yes | blocking (L0) |
| 4 | A11Y-11 (role=alert + focus() double-announce) | yes | blocking |
| 5 | CNT-2 ("SyncFlow" portmanteau) | yes | blocking |
| 6 | TYP-2 (12px body copy) | yes | blocking |

- **Recall: 6/6** (target ≥5) — pass. **Precision: 0 invented blocking findings**
  (target 0) — pass; the two UNCOVERED items (no compose field; stub button) were correctly
  flagged for human review, not as blocking.
- **L1 placement: stable and correct** — TYP-2 and CNT-2 both BLOCKING (the run-2/4 drift
  did not recur; the run-5 mechanical rule is holding).
- **Drift conclusion unchanged:** recall/precision still 6/6 · 0 across all six runs; keep
  watching L1 severity placement, not recall.

## Runs 2–5 — 2026-06-11 (post-consolidation calibration loop)

Triggered by the design-review edits in the catalog-consolidation propagation
(SLP citation rule in Originality), then iterated: each run's finding produced a
design-review fix, verified by the next run. Same dispatch as run 1 (blind copy,
code-only, 6 controls in scope).

| Run | Recall | Invented blockers | Finding |
|---|---|---|---|
| 2 | 6/6 | 0 | TYP-2 caught but misfiled under UNCOVERED ("script not run"); CNT-2 hedged to advisory ("promote if no waiver exists" — none existed). New SLP-citation rule in Originality visibly worked. |
| 3 | 6/6 | 0 | After the findings-sort rule (tier + waiver status decide the section): TYP-2 correctly BLOCKING; CNT-2 still advisory ("peripheral toolbar action") with "control judgment is fail" — severity still re-litigated by feel. |
| 4 | 6/6 | 0 | L1 placement unstable across same-model runs: TYP-2 demoted back to advisory, CNT-2 in JUDGMENT NOTES only (neither findings section). The instability itself was the finding. |
| 5 | 6/6 | 0 | After the MECHANICAL RULE block in the output format (no severity discretion within a tier; a fail absent from both findings sections is a verdict defect): all six plants BLOCKING, sorting correct and decisive. **Pass.** |

- **Drift conclusion:** recall and precision never moved (6/6, 0 across all
  five runs) — what drifts is *severity placement of L1 findings*, and prose
  rules in the grading section do not pin it. Only a mechanical rule at the
  output format itself did. Watch future runs for L1 placement, not just
  recall.
- **Skill changes verified by this loop:** code-visible deterministic
  violations are findings (not just screenshot-visible); findings sort by
  tier + waiver status; UNCOVERED restricted to genuinely uncovered defects;
  stale "no checks built" line corrected.

## Run 1 — 2026-06-11

- **Evaluator:** `design-evaluator` subagent (opus), design-review rubric
- **Dispatch:** blind copy with PLANT comments stripped (`grep -v "PLANT"`),
  code-only review, all 6 controls named in scope, standards path passed.
  (This run discovered the stripping step — the fixture's original `how_to_run`
  dispatched the marked page, which would leak ground truth; amended same day.)
- **Verdict returned:** `VERDICT: fail` with 6 blocking findings.

| Plant | Control | Caught? | As |
|---|---|---|---|
| 1 | CNT-1 (raw "Error 500") | yes | blocking |
| 2 | A11Y-3 (unlabelled search input) | yes | blocking (L0) |
| 3 | CMP-2 (one-click delete-all, no confirm/undo) | yes | blocking (L0) |
| 4 | A11Y-11 (role="alert" + focus() double announce) | yes | blocking |
| 5 | CNT-2 ("SyncFlow" portmanteau) | yes | blocking |
| 6 | TYP-2 (12px body copy) | yes | blocking |

- **Recall: 6/6** (target ≥ 5) — pass.
- **Precision: 0 invented blocking findings** (target 0) — pass. All 6 blocking
  findings map one-to-one to plants. Advisories raised (static error banner has
  no retry affordance; inline font-size styling) are reasonable close calls and
  do not count against precision per the scoring rules.
- **Notes:** the evaluator's UNCOVERED section flagged that "Save note" persists
  nothing and has no compose field — true of the fixture (it is a minimal planted
  page, not a real feature) and correctly identified as outside the six controls.
  It also correctly hedged everything visual (contrast, rendered sizes) as
  unverifiable in a code-only review. Calibration looks honest, not lenient.
