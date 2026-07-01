# Changelog

Notable changes to the TFX Design Harness plugin. Versioning tracks
`.claude-plugin/plugin.json`.

## [0.2.0] — 2026-07-01

Consolidation pass: stop the built-checks list from drifting by single-sourcing it,
disclose Phase-4 detail behind a pointer, and align shared phrasing across the design,
review, and evaluator prompts.

### Changed — single source of truth
- Built-checks are single-sourced to `checks/README.md`. The skills, the evaluator,
  and `CLAUDE.md` now point to it instead of each re-listing which scripts exist (that
  list had drifted); added the missing `component-manifest` section to
  `checks/README.md`.

### Changed — loop and evaluator
- Phase-4 "Interface craft" detail moved out of `tfx-design-ui/SKILL.md` into a
  disclosed `implement-craft.md` reached by a pointer, keeping the loop scannable.
- "Preserved is not waived" is now a shared leading phrase across the design, review,
  and evaluator prompts.
- Trimmed the `tfx-design-evaluator` agent prompt so it no longer restates rules that
  live in its preloaded `tfx-design-review` skill.

### Changed — standards and checks
- Removed a stale TYP-4 reference (the "uppercase labels TYP-4 allows" clause); TYP-4
  now forbids all-caps entirely.
- Fixed `checks/type-scan.py`: TYP-2's body line-height band no longer
  false-positives on headings (self-test 27→34 cases).

## [0.1.1] — 2026-06-16

Harness build-out from the cross-session feedback log (plans 010–023). Each change
was executed in an isolated git worktree, reviewed against its plan's done-criteria,
and checked against the eval suite (validate.py, audit-record, golden tasks,
evaluator-recall). The catalog grows from 32 to 40 controls.

### Added — deterministic checks
- `checks/a11y-static.py` — static subset of A11Y-2/3/8: focus-visible removal,
  click handlers on non-focusable elements, icon-only controls without a name (010).
- `checks/component-manifest.py` — validates `.tfx/component-manifest.json` against
  the spec; the import-diff runs only when `coverage: "complete"` (019 Stage B).

### Added — standards (catalog → 40 controls)
- **LAY (Layout) category** with **LAY-2** (single-column reflow at 320 CSS px —
  WCAG 2.2 SC 1.4.10, L1) and **LAY-4** (reading measure ≤ 80ch — WCAG 1.4.8, L2);
  detail files `lay-2.md`, `lay-4.md` (023).
- Detail files `col-1.md` (012) and `tok-3.md` (016).

### Changed — standards
- **COL-1** is now each product's own primary brand colour (TW #0064FF, Glow orange,
  CaseSync indigo), not Teacher & School Blue portfolio-wide (012).
- **TOK-3** gains a peer-radius-consistency clause anchored to the product Card
  radius (016).
- **CMP-1** gains a fixed verdict vocabulary (`verified against … manifest` /
  `asserted, no manifest` / `waived`); `audit-record.py` enforces exactly one form
  on any record claiming CMP-1 (019 Stage A).

### Changed — token-audit
- `token-audit.py` is now project-token-aware (reads `@theme` `--color-*` names and
  an `--allow` list) and scans raw colour inside `[...]` arbitrary values (011).

### Changed — loop and evaluator
- Critique an existing page (screenshot + design critique) before proposing polish;
  capture via Claude-in-Chrome or the user's browser agent, ask the user if capture
  keeps failing (013).
- Phase 1 produces a component inventory; verify checks each interactive control;
  the evaluator independently enumerates the surface's controls (014).
- Conservative, reversible defaults in autonomous runs — do not restyle established
  iconography, radius, layout, or copy without flagging; emit a reviewable diff
  summary; deliberate semantic colour-coding is not slop; structured gate questions
  (015).
- Establish whether the product supports dark mode before grading it; mark
  dark-mode checks N/A when it does not (018).
- Onboarding lists every harness skill with a one-line explanation and asks which
  to run first (022).

### Changed — tooling and process
- `audit-record.py` gains `--repo-root` so it can audit a consumer repo's records;
  the loop ships `TEMPLATE.md` into the consumer repo on first run (017).
- CONTRIBUTING + evals: a new corpus-scanning assertion must be run over the real
  corpus, not only the synthetic self-test (021).

### Notes
- Deferred (recorded in the plans/spike): LAY-1/3/5/6 and LAY-7 (need a declared
  product grid/template and the SGDS-vs-Tailwind decision); the LAY-4
  `checks/layout-scan`; 019 Stage B's import-diff stays gated on per-product
  manifest adoption; golden task 003 (needs a full loop run); the routing spot-check.
- Plans and rationale: `harness/plans/010`–`023` and `harness/plans/README.md`.

## [0.1.0] — 2026-06-15

- Initial installable Claude Code plugin: the `tfx-design-ui` loop, the control
  catalog, voice & tone (`tfx-content-style`), the standards skill, the onboarding
  tour, and the `tfx-design-evaluator` agent.
