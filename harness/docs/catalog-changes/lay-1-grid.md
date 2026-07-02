# Proposed control: LAY-N (grid / columns and gutters — the spike's reserved slot 1)

**Date:** 2026-07-02 · **Change type:** new control via ratchet (activates the id slot
the layout spike reserved; no tier change to any existing control) · **Approved by:**
pending — design-lead approval required before Step 3 (catalog commit). No approval is
recorded in this file yet.

> **Note on `LAY-N`:** written as a placeholder rather than a concrete number, because the
> id is committed to the catalog only at the gated Step 3, and `checks/validate.py`'s
> catalog-changes cross-ref sweep flags any `PREFIX-<digit>` id that isn't already in the
> catalog as "references unknown control id" (the same convention plan 027's
> `component-default-consistency.md` used for its own `CMP-N` placeholder — see that
> file's history). At proposal time the slot is **1** — the id the layout spike
> (`docs/spikes/layout-category/SPEC.md`) reserved for grid/columns/gutters and left
> deferred. Confirm it is still free at the approval gate (`grep -n "id: LAY-" ` on the
> live catalog); assign the concrete id there.

This record lives in `docs/catalog-changes/` per the same placement rule as
`component-default-consistency.md` and `contrast-functional-chips-step-12.md`: it is a
ratchet proposal, not a fresh loop-run decision record, so it does not go in
`docs/decisions/` (that directory is audited by `checks/audit-record.py` against the
loop-run template). Plan: `harness/plans/053-layout-ratchet-round-2.md`.

## Why this is a control, not a one-off fix

`harness/docs/spikes/layout-category/SPEC.md` designed the full `LAY-*` category and
proposed a grid control in full, then deliberately left it deferred — its status header
says the grid control (numbered 1 in the spike) remains deferred pending a declared
product grid (open question 4). LAY-2, LAY-3, LAY-4, LAY-5, and LAY-6 have since
ratified; the grid slot is the one candidate the spike could not close because it
depends on a declaration format that didn't exist yet. That is a scoping gap, not a rejection: the spike's own open question 4
asks exactly where the declaration should live, and no plan has answered it until now.
This record answers it and re-drafts the control against the answer, so the deferred slot
can go to the design lead for a real yes/no/amend rather than staying open indefinitely.

## Triggering evidence

I grepped `harness/docs/decisions/*.md`, `harness/docs/loop-run/FRICTION-REPORT.md`, and
`harness/docs/reviews/*.md` for grid/gutter/column/alignment friction (per the plan's
evidence-sourcing rule). I found no incident where an ad-hoc column count or an
off-scale gutter was caught and cost rework — the loop-run records that touch grid-like
territory (`grade-entry.md`'s marks table, `submit-marks-review.md`) pass their existing
LAY controls (LAY-2, LAY-5, LAY-6) without a grid-specific finding. **This proposal is
standards-derived, no incident** — it exists because the spike identified the gap and
left it open, not because a defect surfaced it. The design lead should weigh that: this
control closes a known deferral, not a caught failure, and its `check: hybrid`
deterministic half cannot fire at all until a product declares a grid (see below), so
until then it is honest-but-inert in the same way CMP-1 is inert without a component
manifest.

## The declaration (resolves spike open question 4)

Propose `.tfx/layout-system.json` in the product repo, sibling to
`.tfx/component-manifest.json` (plan 019's manifest — no such manifest is wired in this
harness checkout either; both stay "asserted, no file" until a product repo adds one).
Minimal schema:

```json
{
  "columns": 12,
  "gutter": "space-4",
  "margins": "space-6",
  "breakpoints": [360, 768, 1280],
  "maxContentWidth": "1280px"
}
```

- `columns` — integer column count for the product's primary grid.
- `gutter` / `margins` — a TOK-2 spacing-scale token name, not a raw value (so this
  control's deterministic half can check them against the same scale TOK-2 already
  enforces per-element).
- `breakpoints` — the widths the grid restructures at; defaults to the portfolio-wide
  `[360, 768, 1280]` already used in Phase 5 evidence and LAY-2, but a product may
  declare its own if it has a real reason.
- `maxContentWidth` — the outer cap the grid centres within; distinct from LAY-4's prose
  measure (`~66ch`, never above 80ch) — this is the grid's own edge, not the body-text
  column.

**Products without the file:** this control grades **N/A — no declared grid**, the same
honest v0 pattern as CMP-1's "asserted, no manifest" — it does not fail a product for
lacking a manifest it was never asked to write; it simply cannot check the deterministic
half until one exists. This directly resolves open question 4's premise ("Teacher
Workspace, Glow, and CaseSync may grid differently") — each product declares its own
file, so per-product difference is nuance calibration, not a portfolio-wide grid,
matching `standards/README.md` authoring rule 5 ("no per-product control overlays").

## The proposed control

- **id:** `LAY-N` (slot 1 at proposal time; the id the spike reserved — confirm still
  free at the gate).
- **title:** "Layout uses the product's declared column grid and gutter scale; ad-hoc
  column counts and off-scale gutters are findings — N/A where no grid is declared".
- **tier:** L2 (proposed, matching the spike's draft — a strong default, not a
  blocking floor, while the declaration mechanism is new and adoption is v0).
- **check:** hybrid (proposed) — deterministic half: once `.tfx/layout-system.json`
  exists, gutter/margin values resolve to the TOK-2 scale and column count matches the
  declared value; judgment half: whether the resulting column structure reads as
  coherent (a page can use on-scale gutters in an incoherent arrangement).
- **phase:** `[implement, verify]`.
- **applies_to:** `[page, component]`.
- **waiver:** rationale (follows L2).
- **verify:** "Grid scan checks gutter/margin tokens and column count against
  `.tfx/layout-system.json` where declared (`checks/layout-scan`, not yet built — see
  Maintenance notes); evaluator judges hierarchy-driven exceptions and grades N/A where
  no grid is declared."
- **fails_when:**
  - a declared grid exists and the layout uses an ad-hoc column count not drawn from it;
  - a declared grid exists and gutters/margins don't match the spacing scale (TOK-2)
    with no deliberate reason;
  - (does **not** fail when no `.tfx/layout-system.json` exists — that grades N/A, not
    fail, matching the CMP-1 v0 pattern).

## Deconfliction

- **vs. TOK-2** (spacing scale): TOK-2 checks per-element spacing values; this control
  checks whether the resulting layout grid is coherent as a whole. A page where every
  gap is on-scale but the column structure is inconsistent fails this control, not
  TOK-2.
- **vs. LAY-4** (reading measure): LAY-4 caps body-text prose width for readability;
  this control's `maxContentWidth` caps the grid's own outer edge. A page can satisfy
  one and violate the other independently (a full-bleed grid with a correctly measured
  prose column inside it, or vice versa).
- **vs. LAY-6** (alignment): LAY-6 requires shared edges to align *within whatever
  structure exists*, with or without a declared grid; this control requires that
  structure itself be a *declared* grid the layout actually follows. It sits upstream of
  LAY-6: once a grid is declared, LAY-6's "align to the grid" clause (softened to "shared
  edges align" per the spike, pending this ratchet) can tighten back to referencing it.
- **vs. SLP-5** (identical-card grids): SLP-5 bans the generic AI card-grid template as
  an anti-pattern; this control requires that *when* a deliberate grid is used, it
  follows the product's declared columns/gutters. They are complementary in the same
  direction the spike already described: SLP-5 says "not a cookie-cutter grid", this
  control says "use the declared grid when you do grid."

## Re-audit set

- The loop-run pages once a `.tfx/layout-system.json` is declared for the harness's
  reference stack: `harness/docs/loop-run/attendance.html`, `grade-entry.html`,
  `student-notes-empty-state.html`, `submit-marks-review.html` — all currently grade
  **N/A** under this proposal (no manifest exists), same as their CMP-1 verdicts.
  `submit-marks-review.md` already flags LAY-6 as `unverified — needs the 1280 frame`;
  this control doesn't change that verdict, it just adds an N/A row alongside it.
- The website itself (`app/globals.css`, `app/layout.tsx`) — no `.tfx/layout-system.json`
  exists in this repo either, so the site also grades N/A until one is authored.
- Consumer surfaces (Teacher Workspace, Glow, CaseSync) are re-audited by their own
  product teams once each declares its grid — not the harness's job to instantiate.

## Notes carried into the detail file (`standards/controls/lay-N.md`, if ratified)

- **How it would be verified:** judgment now for the coherence half; the
  gutter/column-count half becomes mechanical once `checks/layout-scan` exists and a
  product's `.tfx/layout-system.json` is present. Say "N/A — no declared grid" rather
  than "pass" when no file exists; don't infer a grid from a page's incidental spacing.
- **Do not flag:** a product with no declared grid (that's N/A, not a finding); a
  deliberate asymmetric or non-grid layout with a stated reason (the L2 `rationale`
  waiver covers it, same as LAY-6's "deliberate reason" clause).

---

**Status:** propose-only, Step 1 of plan 053. Not committed to `standards/catalog.yaml`.
Awaiting design-lead approve/amend/reject, recorded by name and date in this file before
any catalog change happens (per the harness's own CLAUDE.md: never edit the catalog to
make a failing check pass, and never commit without recorded approval).
