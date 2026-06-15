# Spike: LAYOUT (`LAY-*`) catalog category

**Status:** `[proposed — pending design-lead approval]`

**Planned at:** commit `a8ca4fa`, 2026-06-15

---

## Problem

Typography is well covered (TYP-1..4: typefaces, weights, sizes, all-caps; SLP-6:
type-scale contrast). **Layout has no dedicated category.** It is covered only
obliquely by:

- TOK-2 / TOK-3 — spacing and radius scales, per-element
- SLP-4 / SLP-5 / SLP-7 / SLP-10 — nesting cards, identical-card grids, spacing
  rhythm, multi-section task in a modal
- A11Y-7 / A11Y-10 — semantic structure, bypass blocks / landmarks
- Skill prose (harness screenshots at 360 / 768 / 1280)

There is no checkable standard for **grid systems**, **responsive breakpoints**,
**information-architecture templates**, **reading measure / max-width**, **content
density**, or **alignment and optical consistency**.

The honest current position: **layout is HIG + judgment, not a checkable standard**,
until a `LAY-*` category is approved and added to the catalog. The skills should say
so where they discuss layout.

This spike designs the `LAY-*` category and proposes it for design-lead approval. It
deliberately does **not** commit any controls to `standards/catalog.yaml` — that
requires an approved ratchet PR.

---

## Proposed candidate controls

Each entry below is marked `[proposed — pending design-lead approval]` and carries
the full schema required by `standards/README.md`. None are committed to the catalog
here.

---

### LAY-1 — Grid / columns and gutters

`[proposed — pending design-lead approval]`

| Field | Value |
|---|---|
| `id` | LAY-1 |
| `title` | Layout uses the product's column grid and gutter scale; ad-hoc column counts and gutters are findings |
| `tier` | L2 (proposed) |
| `check` | hybrid (proposed) |
| `phase` | [implement, verify] |
| `applies_to` | [page, component] |
| `verify` | "Grid scan detects column count and gutter values; evaluator judges hierarchy-driven exceptions" |
| `fails_when` | - ad-hoc column counts not drawn from the product's declared grid - gutters that don't match the spacing scale (TOK-2) with no deliberate reason |

**Overlap and deconfliction:**
- **vs. TOK-2** (spacing scale): TOK-2 checks per-element spacing values; LAY-1
  checks whether the resulting layout grid is coherent. A page where every gap is
  on-scale but the column structure is inconsistent fails LAY-1, not TOK-2.
- **vs. SLP-5** (identical-card grids / icon-tile templates): SLP-5 bans the generic
  AI grid template; LAY-1 would require a *declared* grid for deliberate layouts.
  They are complementary: SLP-5 says "not a cookie-cutter grid", LAY-1 says "use the
  product grid when you do use one."

---

### LAY-2 — Responsive breakpoints

`[proposed — pending design-lead approval]`

| Field | Value |
|---|---|
| `id` | LAY-2 |
| `title` | Layout is verified at 360 / 768 / 1280; content and controls hold their reading order and remain usable at each width |
| `tier` | L1 (proposed) |
| `check` | judgment (proposed) |
| `phase` | [verify] |
| `applies_to` | [page] |
| `verify` | "Screenshots captured at 360 / 768 / 1280 (already in Phase 5 evidence); evaluator confirms reading order and usability at each" |
| `fails_when` | - content or controls become unreachable or ambiguous at any captured width - reading order reverses or a primary action disappears at 360 |

**Overlap and deconfliction:**
- **vs. harness evidence step**: the three widths are already required by Phase 5;
  LAY-2 formalises the *standard* they must meet rather than just requiring the
  screenshots. No change to the evidence step needed.
- **vs. A11Y-2** (keyboard reach): A11Y-2 covers keyboard traversal; LAY-2 covers
  visual and structural layout reflow.

---

### LAY-3 — Information architecture / page templates

`[proposed — pending design-lead approval]`

| Field | Value |
|---|---|
| `id` | LAY-3 |
| `title` | A surface maps to a known page template (workspace view, form, flow step, dashboard, settings, empty state, onboarding) rather than an ad-hoc shell |
| `tier` | L2 (proposed) |
| `check` | judgment (proposed) |
| `phase` | [plan, verify] |
| `applies_to` | [page] |
| `verify` | "Evaluator matches the surface to a declared template; flags surfaces that re-invent structure when a template exists" |
| `fails_when` | - surface introduces a bespoke shell structure when an existing template applies - information hierarchy doesn't match the declared page type |

**Overlap and deconfliction:**
- **vs. SLP-10** (multi-section task gets a page, not a modal): SLP-10 is a specific
  anti-pattern; LAY-3 covers the positive statement: surfaces should adopt known
  templates.
- **vs. A11Y-7** (semantic structure): A11Y-7 is about HTML element semantics; LAY-3
  is about page-level information architecture. A page can have correct headings/lists
  (A11Y-7 pass) but wrong IA template (LAY-3 fail).

---

### LAY-4 — Reading measure / max-width

`[proposed — pending design-lead approval]`

| Field | Value |
|---|---|
| `id` | LAY-4 |
| `title` | Body text columns cap at a comfortable measure (~70ch); full-bleed running text is a finding |
| `tier` | L2 (proposed) |
| `check` | deterministic (proposed — a static width scan is feasible) |
| `phase` | [implement, verify] |
| `applies_to` | [page, component] |
| `verify` | "Scan for prose containers without a max-width constraint; check against app/globals.css `.prose { max-width: 70ch }` anchor" |
| `fails_when` | - body text columns have no max-width and span the full viewport at 1280 - max-width exceeds ~90ch (degrades readability) |

**Overlap and deconfliction:**
- **vs. TYP** (typography controls): measure is a layout property, not a type
  property — even correct font size/line-height (TYP-2) reads poorly on a 200ch
  line. LAY-4 is the layout complement to TYP's per-character decisions.
- Product anchor: `app/globals.css:59` — `.prose { max-width: 70ch; }` is the
  current anchor.

---

### LAY-5 — Content density

`[proposed — pending design-lead approval]`

| Field | Value |
|---|---|
| `id` | LAY-5 |
| `title` | Density suits the task — neither cramped (data entry) nor padded (scanning); extreme outliers in either direction are findings |
| `tier` | L2 (proposed) |
| `check` | judgment (proposed) |
| `phase` | [verify] |
| `applies_to` | [page, component] |
| `verify` | "Evaluator judges density against the page type and task (e.g. a marks entry form vs. a summary dashboard have legitimately different densities)" |
| `fails_when` | - a data-entry surface is too padded for efficient tab traversal - a reading surface is too cramped to scan without error |

**Overlap and deconfliction:**
- **vs. SLP-7** (spacing has rhythm): SLP-7 is the anti-pattern of *uniform* spacing;
  LAY-5 is the positive requirement that density *fits the task*. They point in
  different directions: SLP-7 says "vary spacing by relationship", LAY-5 says "match
  density to task type."
- **vs. SLP-5** (no identical-card grids): SLP-5 targets the template anti-pattern;
  LAY-5 targets the resulting density mismatch when that template is applied
  indiscriminately.

---

### LAY-6 — Alignment and optical consistency

`[proposed — pending design-lead approval]`

| Field | Value |
|---|---|
| `id` | LAY-6 |
| `title` | Shared edges align to the grid; optical alignment used where geometry misleads |
| `tier` | L2 (proposed) |
| `check` | judgment (proposed) |
| `phase` | [verify] |
| `applies_to` | [page, component] |
| `verify` | "Evaluator checks edge alignment in screenshots at 1280; flags apparent mis-alignment; distinguishes geometric alignment from optical alignment (e.g. an icon optically centred but geometrically offset)" |
| `fails_when` | - shared edges between components/sections do not align to the declared grid without a deliberate reason - text/icon baselines or optical centres are visibly misaligned |

**Overlap and deconfliction:**
- **vs. LAY-1** (grid): LAY-1 requires declaring and following a grid; LAY-6
  requires that shared edges *align within* that grid (or are optically compensated
  where the grid would produce visible mis-alignment).

---

### Shape/radius consistency — candidate for LAY or TOK-3?

Plan 016 added a peer-radius-consistency clause to TOK-3 (the judgment half).
This spike notes it as a candidate LAY control (call it LAY-7 if approved), but the
decision about whether to migrate it here or keep it under TOK-3 is an open question
for the design lead (see below). LAY-3 and LAY-6 touch this territory: a Section at
`rounded-lg` beside Cards at `rounded-3xl` is also an alignment/shape inconsistency
flagged by LAY-6's "deliberate reason" test.

---

## Open questions for the design lead

1. **L1 vs. L2 tiers.** LAY-2 is proposed as L1 because the three widths are already
   required evidence; the others are proposed L2 because they depend on declared
   product grids and templates that don't yet exist. Should any be L1 immediately?

2. **Deterministic feasibility.** Which LAY controls are realistically `deterministic`
   (a static scan — similar to `slop-layout` — could detect grid/measure/breakpoint
   reflow) vs. `judgment` (IA template matching, density, optical alignment)?
   LAY-4 (max-width) is the most plausible deterministic candidate; LAY-1 may require
   a declared grid manifest. Confirm before setting `check: deterministic` in the
   ratchet PR.

3. **Radius/shape consistency: stay in TOK-3 or migrate to LAY?**
   Plan 016 lives in TOK-3. If a LAY-7 is approved, should the peer-radius
   consistency rule move there, or should the two controls coexist as TOK-3
   (deterministic per-element scale) + LAY-7 (peer-consistency judgment)?

4. **Per-product layout systems.** Teacher Workspace, Glow, and CaseSync may grid
   differently. LAY-1 assumes a declared product grid — should that declaration be in
   `.tfx/component-manifest.json`, a separate `.tfx/layout-system.json`, or the CSS
   `@theme`? Coordinate with plan 019's component-manifest format.

5. **LAY-2 and the three widths.** LAY-2 should reference the same three widths
   (360 / 768 / 1280) already used in Phase 5 evidence. Are these product-invariant
   breakpoints or should products declare their own? Current position: portfolio-wide.

6. **Sequencing with the SLP anti-patterns.** SLP-4/5/7/10 cover layout anti-patterns;
   LAY covers positive standards. The reviewer should confirm the proposed LAY controls
   don't silently re-litigate SLP — LAY is "what good looks like", SLP is "what bad
   looks like". They should be additive, not duplicative.

---

## Honest interim position

Until the design lead approves and the catalog is updated via ratchet PR, layout is
graded as **HIG + judgment, not a checkable standard**. The `tfx-design-ui` and
`tfx-design-review` skills should say so where they discuss layout decisions (proposed
wording: *"Layout judgments draw on HIG Simplicity, Agency, and Familiarity as a
reference lens; there is no checkable LAY control yet."*). This spike does not edit
those skills — that is the follow-up ratchet PR's job.

---

## Ratchet proposal

On design-lead approval:
1. Add `LAY: Layout` to `meta.categories` in `standards/catalog.yaml`.
2. Commit chosen `LAY-*` controls (full YAML entries) to the catalog.
3. Create `standards/controls/lay-*.md` detail files (frontmatter must match
   catalog entries exactly per `validate.py` constraints).
4. For any `check: deterministic` or `check: hybrid` LAY control, build the
   corresponding `checks/slop-layout` or `checks/layout-scan` script following
   `validate.py`'s conventions (stdlib, ERROR-line output, exit 0 silent on pass).
5. Update the skills where they currently say "layout is HIG+judgment" to reference
   the new controls.

---

## Self-check (verify before marking spike done)

- [ ] `ls docs/spikes/layout-category/SPEC.md` — this file exists
- [ ] `grep -c "LAY-" docs/spikes/layout-category/SPEC.md` → ≥ 6
- [ ] `grep -c "Open Questions" docs/spikes/layout-category/SPEC.md` → ≥ 1
- [ ] Each `LAY-*` proposal carries `tier`, `check`, `applies_to`, `verify`, `fails_when`
- [ ] `git diff --stat -- standards/catalog.yaml` → no changes
- [ ] `python3 checks/validate.py` → OK
