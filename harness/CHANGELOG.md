# Changelog

Notable changes to the DXD Design Harness plugin (formerly the TFX Design Harness).
Versioning tracks `.claude-plugin/plugin.json`.

## [0.8.0] — 2026-07-10

Rename pass (plan 001): the standard's identity moves from TFX to DXD (Digital
Products & Excellence Division), which now spans Students, Parents, and Platform
domain leads beyond Teacher & School. "TFX" is retained only where it correctly
names the Teacher & School domain or quotes history.

- Plugin id `tfx` → `dxd`; marketplace name `tfx` → `dxd`. Display name "TFX Design
  Harness" → "DXD Design Harness". Skill invocation prefix changes accordingly:
  `/tfx:start` → `/dxd:start`, etc.
- Waiver syntax: new canonical form is `dxd-waive <ID> reason="<specific reason>"`.
  **Legacy `tfx-waive` markers remain valid and continue to be parsed** — this is a
  compatibility guarantee, not a deprecation.
- Context dir: the generator now writes `.dxd/design.json`. **Readers fall back to
  `.tfx/design.json`** for repos that predate the rename; both paths keep working.
- GitHub repo rename (`tfx-design-standard` → `dxd-design-standard`) is a **flagged
  human step**, not done by this release — see `docs/MIGRATION-DXD.md`.
- Control ids, catalog bodies, and the TFX-DS normative source citation are
  unchanged — TFX-DS remains the real normative source link.

## [0.7.0] — 2026-07-08

Ratchet-and-enforcement pass: the catalog grows from 53 to 57 controls (CMP-4
empty-state clarity, CMP-8 draft safety, CMP-9 cross-user sanitisation, CNT-4 domain
fidelity), the EVD-1 evidence rule lands in `design/verify.md` and
`docs/decisions/TEMPLATE.md`, and the Phase 3 plan gate grows an interview stage. The
same batch also lands `enforced`/`script` catalog schema fields plus
`validate.py --coverage` (plan 067), wires LAY-1/LAY-7 and IDN-2/3/4 into the skills
and evaluator (plan 063), and closes a doc-truth sweep with a `[COUNT-SYNC]` check on
`docs/index.html` (plan 064).

### Added — Phase 3 grill
- **`design/grill.md`** — a `grill-me`-inspired interview brought into the harness. After
  the plan is exposed and before the approval gate, the loop red-teams its own plan across
  portfolio-tuned lenses (intent drift, worst-day teacher, ducked decision, cheaper design,
  control-most-at-risk, waiver honesty), looks up facts from context, and puts every open
  decision to the user **one question at a time with a recommended answer**, in dependency
  order down the design tree. Grilling sharpens only — it never relaxes a control or adds
  scope; a structural answer sends the loop back to Phase 2. It stops at shared
  understanding, honours a clear early approval, and its control-at-risk and waiver lenses
  read `standards/catalog.yaml` and the `standards` skill at grill time rather than carrying
  frozen lists. Follows the canonical `grilling` skill (mattpocock/skills), with the
  harness's guardrails layered on.

### Changed — Phase 3 gate
- The plan gate went from **two turns to three stages**: expose → **grill** → Approve/Adjust.
  The approver now signs off on a grilled, sharpened plan, not a first draft. Unattended runs
  grill themselves into the decision record, mirroring the operator-proxy rule.
- Plan output now **ends with a compact summary table** (one row per plan dimension) the
  grill and approver read first — a summary, never a substitute for the plan.
- Description frontmatter untouched, so routing is unaffected (no full sweep; body-edit
  spot-check applies). Deterministic layer re-run green: `audit-record` OK, `score --self-test`
  17/17.
- This change alters the loop gate sequence — a normative-meaning change per
  `harness/CONTRIBUTING.md` — and must be flagged for design-lead review in the
  PR description when this ships.

### Changed — evals
- The `grep` assertion gains an opt-in `strip_tags: true` field: `score.py` strips HTML
  tags and decodes entities before matching, so copy assertions survive inline markup
  (TYP-5 tabular-figure spans and the like) without per-run regex widening. Still exactly
  four assertion types — this is a field on `grep`, not a fifth type. Self-test grew to 17
  cases; golden task 003's recipient-count advisory was retuned to `strip_tags` + a
  `Send to` anchor that scopes it to the confirm copy.

### Added — catalog (ratchet)
- **CMP-4** — every empty-state view unambiguously signals "no content exists" (distinct
  from loading, error, or permissions failure) through a heading, explanatory subtext, and
  the absence of loading chrome such as skeleton rows or spinners. L1, hybrid check. Fills
  the slot reserved in `catalog.yaml` since 2026-06-16 (Student Notes loop run,
  `docs/decisions/student-notes-empty-state.md`). Design-lead approved 2026-07-08. Catalog
  53 → 54 controls.

### Added — harness rule (not a catalog control)
- **Async-state evidence required.** When CMP-3 is in scope, the verify evidence set must
  capture the loading, success, and error states — not only the initial/empty state — with
  a video walkthrough or a named human attestation as acceptable substitutes for a missing
  frame. Adopted as a harness rule rather than a new `EVD` catalog category (recommended
  option; keeps the catalog about the product surface, not the loop's own evidence
  process): `design/verify.md` and `docs/decisions/TEMPLATE.md`'s evidence ledger now carry
  the requirement. No `EVD` prefix, no schema change, no catalog entry. A deterministic
  `checks/audit-record.py` assertion enforcing this over the real record corpus is a
  planned follow-up, not part of this change — see
  `docs/catalog-changes/evd-1-async-evidence.md`.

### Added — catalog (ratchet)
- **CNT-4** — content that models a real-world artifact (a curriculum, a form, a
  policy document) is faithful to it — correct scope, terminology, and structure — or
  explicitly labelled illustrative/placeholder. L2, judgment check. From GitHub issue
  #27 (a mock P1 report graded Science, which starts at P3 in Singapore, and showed a
  P1 Mathematics learning outcome that read as invented). Design-lead approved
  2026-07-08.
- **CMP-8** — a multi-step or data-entry task offers a non-destructive exit at every
  step, and in-progress work is preserved or explicitly discarded on interruption —
  never silently lost. L1, hybrid check. Closes a gap the harness's own `flow` pass
  advertised (grading "escapability, and draft safety") but its control list never
  covered; carries a deconfliction section against CMP-2, A11Y-11, and SLP-10.
  Design-lead approved 2026-07-08.
- **CMP-9** — content authored by one user and rendered to another is sanitised at
  the render boundary; author-time schema constraints are not sufficient. L1, hybrid
  check. From GitHub issue #26 (teacher-authored rich text rendered to parents via
  `dangerouslySetInnerHTML` with no render-time sanitiser). Filed as an anti-pattern
  (SLP) proposal; committed as a **CMP** control instead — keeps SLP's charter to the
  default-AI-aesthetic and puts this trust-and-safety rule alongside CMP-1/CMP-2.
  Design-lead approved 2026-07-08. Catalog 54 → 57 controls (CNT-4, CMP-8, CMP-9).

## [0.6.0] — 2026-07-04

Skill-stack restructure II: dimension-scoped improvement passes you can fire directly.
Five focused passes let a user (or the agent) improve one dimension of an existing page —
"polish the motion", "tighten the layout" — without running the full loop or a full
critique. A pass is a small loop: it captures, proposes ranked in-dimension fixes, stops
at the plan gate, and verifies. `content` dissolves into `copy`.

### Added
- **Five focused passes** (all model-invoked, so also user-typeable): **`copy`**
  (wording, tone, naming), **`polish`** (spacing, type, colour), **`motion`**
  (transitions, easing, reduced-motion), **`flow`** (the multi-step journey), **`layout`**
  (structure, density, alignment). Each SKILL.md is a thin branch head (≤ 30 lines): a
  dimension trigger with whole-page→`critique` / named-change→`design` NOT-clauses, its
  control-id subset (cited, never restated), reference files, and a pointer to the shared
  procedure (plan 062).
- **`critique/pass.md`** — the one procedure all five passes run: capture, load only the
  dimension's control subset, ranked in-dimension suggestions (anything outside is noted
  and routed), plan gate, implement + verify. L0 is never scoped out of any pass.

### Changed — skill stack
- **`content` → `copy`.** The skill folder was renamed (`git mv`); `copy` keeps the full
  voice/tone/naming/SLP-9 body (its dimension reference) and every content trigger, and
  adds the improve-the-copy pass pointer. The `<!-- tfx-sync:slp9-buzzwords -->` marker
  rode along; `validate.py`'s `[SLP9-SYNC]` consumer path was updated `content` → `copy`
  and stays green. No reinstall — the skills directory is scanned.
- **`design`** description + implement-phase refs retargeted `content` → `copy`;
  **`critique`** copy-only NOT-clause retargeted `content` → `copy`.
- **`start`** route menu: the five passes are live (the "coming in a later release"
  placeholder is gone).

### Changed — routing
- `evals/routing/prompts.yaml` re-baselined: the `content` cases now expect `copy`; per-pass
  positives and boundary guards added (dimension ask → pass; whole-page → `critique`;
  named change → `design`). Header count updated.

### Consumer impact
- **No reinstall needed** for the folder rename — `/plugin marketplace update tfx` then
  `/reload-plugins` picks up the five passes and drops `content`. `copy` keeps every
  `content` trigger, so "rewrite this error message" still routes automatically. See
  `docs/UPDATING.md`.

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
