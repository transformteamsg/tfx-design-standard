# Changelog

Notable changes to the TFX Design Harness plugin. Versioning tracks
`.claude-plugin/plugin.json`.

## [0.5.0] — 2026-07-03

Skill-stack restructure I: an intent-shaped stack you can navigate. The domain-named
stack (design/standards/content/onboard/feedback) was hard to route by hand; this pass
adds a user-invoked router, splits evaluate-and-polish out of design, renames onboard to
setup, and thins standards to a rulebook shell.

### Added
- **`start`** — a user-invoked router (`/tfx:start`, `disable-model-invocation: true`):
  orientation, a machine/repo context check (agent-browser + `DESIGN.md`/`.tfx`), and a
  run-shape route menu naming the full stack. It loads no context until invoked and does
  no work itself — it hands off (plan 061).
- **`critique`** — a new model-invoked verb for EVALUATE + POLISH: capture an existing
  page, grade it against the catalog and layout patterns, return scored ranked
  suggestions without changing anything, then on approval hand the accepted list to
  `design` as a specified-change run. `critique.md` + `layout-patterns.md` moved here
  from `design/` as its procedure (plan 061).

### Changed — skill stack
- **`onboard` → `setup`.** The skill folder was renamed (`setup.md` unchanged); its
  description keeps the 055 setup triggers and the onboarding triggers ("onboard me",
  "I'm new to the harness"), points tour-seekers at `/tfx:start`, and its body now also
  offers to seed a product's `DESIGN.md` context layer. No reinstall — the plugin scans
  the skills directory, so a renamed folder is picked up automatically.
- **`design`** keeps its CREATE/modify role. Its description gains a boundary NOT-clause
  routing open "review / improve / polish / I don't like it" asks to `critique`; its
  critique-first path now invokes the `critique` skill and continues on approval.
- **`standards`** thinned to a rulebook shell (104 → ~22 lines): the load-and-filter
  rules stay (the operational core), and the tier/waiver table, `tfx-waive` syntax, and
  authoring rules now point at `standards/README.md` rather than restating them. The
  memory-answer guard on waiver questions is kept — waiver and applicability questions
  are never answered from memory.
- **`content`** is untouched in this release (it becomes `copy` in a later pass).

### Changed — routing
- `evals/routing/prompts.yaml` re-baselined for the restructure (dated note in the file
  header): the onboarding/setup cases move `onboard` → `setup`, "I don't like the empty
  state…" moves `design` → `critique`, and new `critique` positives plus boundary guards
  were added. The full sweep was re-run because three descriptions changed (setup,
  critique, design).

### Consumer impact
- **No reinstall needed** for the folder rename — `/plugin marketplace update tfx` then
  `/reload-plugins` picks up `start`, `setup`, and `critique`. The old `/tfx:onboard`
  command name is gone; use `/tfx:start` to orient or ask `setup` to set up your machine.
  See `docs/UPDATING.md`.

## [0.4.0] — 2026-07-02

Onboarding now sets up the machine, not just the mental model.

### Added
- `onboard` gains a setup branch: new `setup.md` checklist installs and
  verifies the per-user tools (agent-browser CLI + skill, authenticated
  `gh`, Python + PyYAML) behind an ask-first consent gate; unattended runs
  report instead of installing (plan 055).
- The design skill's verify/critique capture steps point at that checklist
  when agent-browser is missing, instead of silently falling through.

### Changed
- `onboard`'s description now also triggers on setup intent ("set up the
  harness", "install the harness dependencies"). Routing sweep re-run —
  see plans/055.

## [0.3.0] — 2026-07-02

Rename pass: shorter, non-repeating names for the plugin and every skill, now that
installation namespaces skills by plugin name.

### Changed — naming
- Plugin renamed `tfx-design-harness` → `tfx` (matches the marketplace name it already
  shipped under: `.claude-plugin/marketplace.json`'s `"name": "tfx"`).
- Skills renamed to their one distinguishing token: `tfx-design-ui` → `design`,
  `tfx-design-standards` → `standards`, `tfx-content-style` → `content`,
  `tfx-design-onboarding` → `onboard`. Installed, these read `tfx:design`,
  `tfx:standards`, `tfx:content`, `tfx:onboard`.
- The evaluator agent renamed `tfx-design-evaluator` → `evaluator` (`tfx:evaluator`
  installed).
- The `tfx-design-review` skill's procedure moved into the `evaluator` agent
  definition and the skill was removed — the harness now ships four skills, not five
  (plan 046).

### Consumer impact
- **Reinstall required.** 0.2.x and 0.3.0 cannot coexist under the old plugin name —
  see `docs/UPDATING.md` for the migration steps. Decision records and other
  historical documents that reference the old skill names by name stay valid as
  history; they are not rewritten.

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
