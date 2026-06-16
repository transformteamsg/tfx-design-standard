# Plan 023: LAY ratchet — commit LAY-2 (reflow, WCAG-anchored) and LAY-4 (reading measure) to the catalog

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a8ca4fa..HEAD -- harness/standards/catalog.yaml harness/.claude/skills/tfx-design-ui/SKILL.md harness/.claude/skills/tfx-design-review/SKILL.md`.
> If `meta.categories` or the skills' layout prose changed since this plan was
> written, compare against the "Current state" excerpts; on a mismatch, STOP.
> `python3 checks/validate.py` must pass before AND after. Paths are relative to
> the harness root.

## Status

- **Priority**: P2 (approved by the harness lead 2026-06-16, standards-grounded)
- **Effort**: S–M
- **Risk**: LOW (additive catalog category + two controls + two detail files +
  light skill prose; the validator gates catalog↔detail consistency). This is the
  **first normative change that commits LAY controls** — review the catalog diff.
- **Depends on**: plan 020 (the LAY spike — DONE; its SPEC has the full proposals)
- **Category**: docs (normative standard)
- **Planned at**: commit `a8ca4fa`, 2026-06-15

## Why this matters

The 020 spike proposed six `LAY-*` controls. The harness lead approved committing
**only the two with the strongest external anchors now** — LAY-2 (reflow) and
LAY-4 (reading measure) — and **deferring LAY-1/3/5/6** because they depend on a
declared product grid / template system that does not exist yet (and the
SGDS-vs-Tailwind grid question is unresolved). LAY-7 (peer radius) stays in TOK-3
for now. This plan adds the `LAY` category and those two controls to the catalog —
real, checkable layout standards grounded in WCAG, instead of "layout is judgment."

## Current state

- `standards/catalog.yaml:16-25` — `meta.categories` lists A11Y/TOK/TYP/COL/CMP/
  CNT/MOT/IDN/SLP. **No `LAY`.**
- `docs/spikes/layout-category/SPEC.md` — the spike; read its **LAY-2** and
  **LAY-4** entries for the proposed schema and the overlap/deconfliction notes.
  Apply the two amendments below to those proposals.
- `standards/README.md` — the control schema `validate.py` enforces.
- `standards/controls/a11y-8.md` (and `cmp-2.md`) — detail-file exemplars. **Frontmatter
  convention: a detail file repeats the catalog fields `id, source, title, tier,
  check, phase, applies_to, verify, waiver, refs` verbatim and does NOT include
  `fails_when`** (see `a11y-8.md` lines 1-13). `validate.py` enforces the match.
- The skills do **not** currently carry a "layout is HIG+judgment" line (the 020
  spike only *proposed* that wording; it did not edit the skills). So step 3 ADDS a
  brief layout note, it does not replace one.

## Standards anchors (from the 2026-06-16 review — bake these in)

- **LAY-2 → WCAG 2.2 SC 1.4.10 Reflow (Level AA):** content reflows to a single
  column with no 2-D scroll at **320 CSS px** (= 1280 @ 400% zoom). The harness's
  360/768/1280 captures don't verify the 320 target, so LAY-2 asserts reflow **at
  320** explicitly. Enforcing a WCAG AA criterion justifies **tier L1**.
- **LAY-4 → WCAG SC 1.4.8 (≤80 CPL)** + Baymard (66 ideal, 50–75 range). Ceiling is
  **80ch** (not the spike's ~90ch); target ~66ch.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Validator | `python3 checks/validate.py` | `OK: …` (before AND after) |
| Frontmatter parse | `python3 -c "import yaml; yaml.safe_load(open('standards/controls/lay-2.md').read().split('---')[1]); yaml.safe_load(open('standards/controls/lay-4.md').read().split('---')[1])"` | exit 0 |
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` |
| Controls present | `grep -c "id: LAY-" standards/catalog.yaml` | 2 |

## Scope

**In scope** (the only files you modify/create):
- `standards/catalog.yaml` — add `LAY: Layout` to `meta.categories`; add LAY-2 and
  LAY-4 entries in a new "Layout" section.
- `standards/controls/lay-2.md`, `standards/controls/lay-4.md` (create).
- `.claude/skills/tfx-design-ui/SKILL.md` and `.claude/skills/tfx-design-review/SKILL.md`
  — add a brief note that LAY-2/LAY-4 now exist (layout has partial control
  coverage; the rest stays HIG + judgment).

**Out of scope** (do NOT touch):
- LAY-1/3/5/6 — deferred (do NOT add them to the catalog).
- LAY-7 / radius — stays in TOK-3 (plan 016); do not migrate.
- Building `checks/layout-scan` — LAY-4's deterministic check is a **deferred
  follow-up**; mark it "planned" in lay-4.md (verify manually until built), exactly
  as other deterministic-but-unbuilt controls are handled. Do not write the script.

## Git workflow

- Branch: per the reviewer's single-branch instruction. Conventional commits
  (`feat(catalog): add LAY category — LAY-2 reflow, LAY-4 reading measure`).
  Do NOT push.

## Steps

### Step 1: Add the LAY category and the two controls to the catalog

In `standards/catalog.yaml`: add `LAY: Layout` to `meta.categories` (after `SLP`).
Add a `# ── Layout (LAY) ──` section with two entries:

- **LAY-2** — `tier: L1`, `check: judgment`, `phase: [verify]`, `applies_to: [page]`,
  `source: TFX-DS`. `title:` "Layout reflows to a single column with no loss at 320
  CSS px (WCAG 2.2 SC 1.4.10); reading order and controls hold at 360/768/1280".
  `verify:` "Evaluator confirms single-column reflow with no two-dimensional
  scrolling at 320 CSS px (= 1280 at 400% zoom) and a usable reading order at each
  captured width". `waiver: documented`. `fails_when:` ["content or controls become
  unreachable or ambiguous at 320 px reflow", "reading order reverses or a primary
  action disappears at the narrowest width"]. `detail: controls/lay-2.md`.
  `refs: [https://www.w3.org/WAI/WCAG21/Understanding/reflow.html]`.
- **LAY-4** — `tier: L2`, `check: deterministic`, `phase: [implement, verify]`,
  `applies_to: [page, component]`, `source: TFX-DS`. `title:` "Body-text columns cap
  at a comfortable measure — target ~66ch, never above 80ch (WCAG 1.4.8); full-bleed
  running text is a finding". `verify:` "Prose/body containers carry a max-width and
  the measure is <= 80ch (target ~66ch); checks/layout-scan (planned)".
  `waiver: rationale`. `fails_when:` ["body-text column has no max-width and spans
  the full viewport at 1280", "measure exceeds 80ch"]. `detail: controls/lay-4.md`.
  `refs: [https://www.w3.org/TR/WCAG21/#visual-presentation]`.

**Verify**: `grep -c "id: LAY-" standards/catalog.yaml` → 2; `python3 checks/validate.py`
→ OK (it now requires both detail files — created next).

### Step 2: Create the two detail files

Match the `a11y-8.md` frontmatter convention (repeat catalog fields verbatim,
**omit `fails_when`**). Body sections:

- **lay-2.md** — Requirement: single-column reflow at 320 CSS px, no 2-D scroll
  (cite WCAG 2.2 SC 1.4.10; note the 320 = 1280@400% equivalence and the
  data-table/map exemption); reading order and primary actions hold at 360/768/1280.
  Rationale: low-vision users zoom to 400%; 360 captures don't prove the 320 target.
  How to verify: evaluator resizes/zooms to the 320 equivalent and walks the three
  widths (a reflow scan is future work). Evaluator guidance: flag horizontal scroll
  or lost controls at 320; do-not-flag content that legitimately needs 2-D layout
  (tables, maps, diagrams) per the WCAG exemption.
- **lay-4.md** — Requirement: prose/body containers carry a max-width; measure
  ≤ 80ch (WCAG SC 1.4.8), target ~66ch (Baymard 50–75 range). Rationale: long
  measures fatigue readers; measure is a *layout* property, complementary to TYP.
  How to verify: deterministic half — `checks/layout-scan` (**planned — verify
  manually until built**; flag `max-width` over 80ch and prose containers with no
  max-width); judgment half — evaluator confirms running text isn't full-bleed.
  Evaluator guidance: flag full-viewport body text at 1280 and measures > 80ch;
  do-not-flag short labels, captions, data cells, or deliberately wide non-text
  layout. Note the product anchor `app/globals.css` `.prose { max-width: 70ch }`.

**Verify**: the frontmatter-parse command → exit 0; `python3 checks/validate.py` → OK.

### Step 3: Tell the skills LAY-2/LAY-4 now exist

- `.claude/skills/tfx-design-ui/SKILL.md` — in the diverge/plan layout discussion (or
  near the Judgment-lens note), add one line: layout now has two checkable controls
  (LAY-2 reflow at 320 px, LAY-4 measure ≤ 80ch); the rest of layout (grid, IA
  templates, density, alignment) remains HIG + judgment until more LAY controls land.
- `.claude/skills/tfx-design-review/SKILL.md` — add LAY-2 and LAY-4 to the layout
  grading guidance with the same one-line framing.

**Verify**: `grep -c "LAY-2\|LAY-4" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1;
`grep -c "LAY-2\|LAY-4" .claude/skills/tfx-design-review/SKILL.md` → ≥ 1.

## Test plan

No code/tests. Gates: `validate.py` pass (before and after), frontmatter parse,
plugin validation, the grep checks, and a read-through confirming lay-2.md/lay-4.md
follow the `a11y-8.md` structure and the WCAG anchors are cited correctly.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "id: LAY-" standards/catalog.yaml` → 2; `LAY: Layout` in `meta.categories`
- [ ] `standards/controls/lay-2.md` and `lay-4.md` exist; frontmatter parses and matches the catalog entries
- [ ] `python3 checks/validate.py` → OK; `claude plugin validate .` passes
- [ ] Both skills reference LAY-2/LAY-4
- [ ] LAY-1/3/5/6 and LAY-7 are NOT added to the catalog (`grep -c "id: LAY-" standards/catalog.yaml` is exactly 2)
- [ ] Only in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- `validate.py` rejects either detail file's frontmatter for a reason not fixable by
  matching the catalog entry (e.g. it expects/forbids a field) — report the output.
- `meta.categories` differs from the "Current state" excerpt (drift).
- You are tempted to add LAY-1/3/5/6 or build the LAY-4 check — both are out of
  scope; STOP and note them as the next steps.

## Maintenance notes

- LAY-1 (grid), LAY-3 (templates), LAY-5 (density), LAY-6 (alignment) remain
  `[proposed]` in `docs/spikes/layout-category/SPEC.md`; they need a declared product
  grid/template system and the **SGDS (12-col Bootstrap) vs Tailwind/shadcn** grid
  decision before they can be committed.
- LAY-4's deterministic check (`checks/layout-scan`) is the next check to build —
  a static `max-width > 80ch` / missing-measure scan, modelled on `token-audit.py`
  / `a11y-static.py` (a partial static subset, honest about what it can't see).
- Reviewer should confirm the website still renders the catalog (it reads
  `catalog.yaml` raw — the new LAY entries appear verbatim on the site).
