# Plan 020: Spike — design and propose a LAYOUT (`LAY-*`) category for the catalog

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a8ca4fa..HEAD -- harness/standards/catalog.yaml`.
> If `meta.categories` changed since this plan was written, compare the "Current
> state" excerpt against the live file; on a mismatch, STOP. This plan must NOT
> change `catalog.yaml` — the drift check is only to confirm the proposal targets
> the real category set. Paths are relative to the harness root.

## Status

- **Priority**: P3
- **Effort**: L
- **Risk**: LOW (additive proposal document; no catalog mutation, no code)
- **Depends on**: none (overlaps conceptually with plan 016 — radius/shape consistency)
- **Category**: direction
- **Planned at**: commit `a8ca4fa`, 2026-06-15

## Why this matters

Typography is well covered (TYP-1..4 typefaces/weights/sizes/all-caps, SLP-6
type-scale contrast). **Layout has no category at all** — it is covered only
obliquely by TOK-2/3 (spacing/radius scales), SLP-4/5/7/10 (nesting, identical
grids, spacing rhythm, modal-vs-page), A11Y-7/10 (semantic structure, bypass
blocks), and skill prose. There is no checkable standard for grid systems,
responsive breakpoints, information architecture / page templates, reading
measure / max-width, content density, or alignment. The honest current position
is: layout is HIG + judgment, not a checkable standard — and the harness should
say so until that changes. This spike designs a LAYOUT (`LAY-*`) category and
proposes it for design-lead approval. It deliberately does **not** commit controls
to the catalog: what the controls are, their tiers, and which are mechanically
checkable are design-lead calls, exactly as the component-manifest spike (008)
left its schema decisions to the lead.

## Current state

- `standards/catalog.yaml:16-25` — `meta.categories` (verbatim), with **no LAY**:
  ```yaml
    categories:
      A11Y: Accessibility
      TOK: Tokens & theming
      TYP: Typography
      COL: Colour
      CMP: Components & patterns
      CNT: Content & naming
      MOT: Motion
      IDN: Identity
      SLP: Anti-slop
  ```
- Oblique layout coverage a LAY category must deconflict with (cite, don't
  duplicate): TOK-2 spacing scale (`catalog.yaml:203-214`), TOK-3 radius
  (`:216-228`), SLP-4 no nested cards (`:474-485`), SLP-5 no identical-card grids /
  icon-tile templates (`:487-498`), SLP-7 spacing rhythm (`:513-524`), SLP-10
  multi-section task gets a page not a modal (`:556-568`), A11Y-7 semantic
  structure (`:116-129`), A11Y-10 bypass blocks / landmarks (`:160-171`).
- `docs/spikes/component-manifest/SPEC.md` — the **structural exemplar** for a
  spike spec: Problem → Proposed format → How each consumer uses it → Maintenance
  → Open questions for the design lead → Self-check. Mirror its shape.
- `standards/README.md` — the control schema any proposed `LAY-*` control must
  conform to (`id`, `source`, `title`, `tier`, `check`, `phase`, `applies_to`,
  `verify`, `waiver`, `fails_when`, optional `detail`). Use valid schema so a
  later ratchet PR can adopt the controls without rework.
- `CONTRIBUTING.md` and the `tfx-design-standards` skill ("Growing the catalog")
  define the ratchet proposal format — the spike's output is a
  `[proposed — pending design-lead approval]` entry, not a committed control.
- The product's own layout signals to anchor proposals in: `app/globals.css:59`
  `.prose { max-width: 70ch; }` (reading measure); the harness already screenshots
  at **360 / 768 / 1280** (`tfx-design-ui/SKILL.md:241-250`) — the de-facto
  breakpoints a LAY-breakpoints control would name.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Spec exists | `ls docs/spikes/layout-category/SPEC.md` | path prints |
| Controls proposed | `grep -c "LAY-" docs/spikes/layout-category/SPEC.md` | ≥ 6 |
| Open questions present | `grep -c "Open Questions" docs/spikes/layout-category/SPEC.md` | ≥ 1 |
| Catalog untouched | `git diff --stat -- standards/catalog.yaml` | no changes |
| Validator still green | `python3 checks/validate.py` | `OK: …` |
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` |

## Scope

**In scope** (the only file you create):
- `docs/spikes/layout-category/SPEC.md` (create)

**Out of scope** (do NOT touch):
- `standards/catalog.yaml` — **no LAY ids committed**; adding a category/controls
  is a design-lead-approved ratchet PR, not this spike.
- Any control detail file under `standards/controls/`.
- Any `checks/` script — a `slop-layout`-style check follows approval, not now.
- The skills — proposing where they should say "layout is HIG+judgment until LAY
  lands" is fine *inside the spec*, but do not edit the skills here.

**Coordination**: writes only the new spike doc (no shared-file overlap). Overlaps
conceptually with plan 016 (radius/shape consistency) — cross-reference it as a
candidate LAY "shape consistency" control.

## Git workflow

- Branch: `advisor/020-layout-spike`. Conventional commits
  (`docs: spike — propose a LAYOUT (LAY-*) catalog category`). Do NOT push.

## Steps

### Step 1: Draft the candidate controls with full schema fields

Create `docs/spikes/layout-category/SPEC.md` (mirror the component-manifest
SPEC's shape). Propose candidate controls, each with the full schema (`id`,
`title`, `tier`, `check`, `phase`, `applies_to`, `verify`, `fails_when`) and each
marked `[proposed — pending design-lead approval]`:

- **LAY-1** — grid / columns & gutters: layout uses the product's column grid and
  gutter scale; ad-hoc column counts and gutters are findings.
- **LAY-2** — responsive breakpoints: layout is verified at the harness's three
  widths (360 / 768 / 1280); content and controls hold their reading order and
  remain usable at each.
- **LAY-3** — information architecture / page templates: a surface maps to a known
  page template (workspace view, form, flow step, dashboard, settings, empty
  state, onboarding — the `applies_to` page types) rather than an ad-hoc shell.
- **LAY-4** — reading measure / max-width: body text columns cap at a comfortable
  measure (~70ch, cf. `app/globals.css:59`); full-bleed running text is a finding.
- **LAY-5** — content density: density suits the task (scanning vs. data entry);
  neither cramped nor sparse beyond the spacing-rhythm rule (deconflict with
  SLP-7).
- **LAY-6** — alignment & optical consistency: shared edges align to the grid;
  optical alignment where geometry misleads.

For each, add a **"Overlap & deconfliction"** note naming the existing control it
brushes against and how LAY differs: LAY-1/LAY-5 vs SLP-5 (identical-card grids)
and SLP-7 (spacing rhythm); LAY-4 vs TYP (measure is layout, size is type); LAY-3
vs SLP-10 (page-vs-modal) and A11Y-7 (semantic structure); and **shape/radius
consistency from plan 016** as a candidate LAY control vs. staying in TOK-3.

**Verify**: `grep -c "LAY-" docs/spikes/layout-category/SPEC.md` → ≥ 6.

### Step 2: Write the Open Questions for the design lead

Add an "## Open Questions for the Design Lead" section: which LAY controls are L1
vs L2; which are realistically `deterministic` (a `slop-layout`-style scan can
see grid/measure/breakpoint reflow) vs `judgment`/`hybrid` (IA, density,
alignment); whether radius/shape consistency migrates here from TOK-3 (plan 016)
or stays; how LAY relates to product-specific layout systems (TW vs Glow vs
CaseSync may grid differently); and whether LAY-2 should reference the same three
widths the evidence step already uses.

**Verify**: `grep -c "Open Questions" docs/spikes/layout-category/SPEC.md` → ≥ 1.

### Step 3: State the honest interim position + the ratchet proposal

In the spec, add a short closing note: until LAY is approved and added to the
catalog, layout is graded as **HIG + judgment, not a checkable standard**, and the
`tfx-design-ui` / `tfx-design-review` skills should say so where they discuss
layout (propose the wording; do not edit the skills here). Frame the whole spec as
a single ratchet proposal `[proposed — pending design-lead approval]` per
`CONTRIBUTING.md`. Confirm no catalog mutation occurred.

**Verify**: `git diff --stat -- standards/catalog.yaml` → no changes;
`python3 checks/validate.py` → OK.

## Test plan

No code/tests. Gates: the spec exists with ≥ 6 `LAY-*` proposals carrying valid
schema fields, an Open Questions section, the honest interim note, an unchanged
`catalog.yaml`, and a green validator + plugin validation. A read-through confirms
each proposed control conforms to `standards/README.md`'s schema so a later PR can
adopt it verbatim.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `ls docs/spikes/layout-category/SPEC.md` exists
- [ ] `grep -c "LAY-" docs/spikes/layout-category/SPEC.md` → ≥ 6
- [ ] `grep -c "Open Questions" docs/spikes/layout-category/SPEC.md` → ≥ 1
- [ ] Each `LAY-*` proposal carries `tier`, `check`, `applies_to`, `verify`, `fails_when`
- [ ] `git diff --stat -- standards/catalog.yaml` shows no changes
- [ ] `python3 checks/validate.py` passes; `claude plugin validate .` passes
- [ ] Only `docs/spikes/layout-category/SPEC.md` created; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- You find yourself adding LAY ids or a LAY category to `standards/catalog.yaml` —
  that requires design-lead approval; the spike only proposes.
- The `meta.categories` block differs from the "Current state" excerpt (drift).
- A proposed control can't be expressed in the `standards/README.md` schema
  without inventing a new field — note it as an open question rather than
  extending the schema unilaterally.

## Maintenance notes

- On design-lead approval, a follow-up ratchet PR commits the chosen LAY controls
  + their detail files + any feasible `checks/` (e.g. a `slop-layout` scan for
  grid/measure/breakpoint reflow) — the same path token-audit followed from its
  spec. Sequence that PR after this spec is signed off.
- If plan 016 lands first, its TOK-3 peer-radius-consistency clause is the live
  home for shape consistency; this spec should note whether LAY absorbs it or
  leaves it in TOK-3 (an open question, not a decision).
- Reviewer should check the proposals don't silently re-litigate SLP-5/SLP-7/
  SLP-10 — LAY is the positive layout standard; the SLP controls remain the
  anti-patterns.
