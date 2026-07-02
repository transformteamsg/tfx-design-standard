# Plan 053: Layout ratchet round 2 — propose the grid and focal-point controls (propose-only → design-lead gate)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `harness/plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat c42d695..HEAD -- harness/standards/ harness/docs/catalog-changes/ harness/docs/spikes/layout-category/`
> Plans 046–052 landing first is expected drift (they don't touch these paths
> except docs). On other drift, compare "Current state" excerpts first.

## Status

- **Priority**: P2
- **Effort**: M (Step 1–2 propose-only S–M; Step 3 gated commit S–M)
- **Risk**: LOW while propose-only; the catalog commit is design-lead-gated
- **Depends on**: none (052 is a soft sibling — its layout-patterns.md re-anchors to these controls if they ratify)
- **Category**: direction / tech-debt
- **Planned at**: commit `c42d695`, 2026-07-02

## Why this matters

The user wants layout and pattern best practices *in the controls*, not only in
guidance prose. The catalog already has five LAY controls (LAY-2..6), but the
layout spike (`harness/docs/spikes/layout-category/SPEC.md`) deliberately
deferred the two that make layout quality enforceable rather than advisory:
**LAY-1 (grid/columns/gutters)** — deferred "pending a declared product grid"
(spike open question 4) — and the composition rule the skills carry only as
prose: **one focal point, hierarchy matches the task order** (today spread
across Phase 2's "Compose, don't fill", CMP-5, and SLP-6, none of which states
it as a checkable whole-page rule). impeccable.style demonstrates the end state
worth ratcheting toward: layout anti-patterns detected deterministically
(45 rules, no LLM). This plan follows the repo's own governance exactly
(plans 020 → 023, 027, 029): write the proposal records, get the design-lead
gate, only then commit.

## Current state

- `harness/docs/spikes/layout-category/SPEC.md` — status header: "**LAY-1
  (grid) remains deferred** pending a declared product grid (open question 4)".
  Open question 4: "Teacher Workspace, Glow, and CaseSync may grid differently.
  LAY-1 assumes a declared product grid — should that declaration be in
  `.tfx/component-manifest.json`, a separate `.tfx/layout-system.json`, or the
  CSS `@theme`? Coordinate with plan 019's component-manifest format." The
  spike's LAY-1 proposal (full schema table) is in that file — reuse it as the
  draft, updated per this plan.
- `harness/standards/catalog.yaml` — 48 controls; LAY category exists
  (`meta.categories` includes LAY); LAY-2..6 committed. Next free LAY id: check
  at execution time (`grep -n "id: LAY-" harness/standards/catalog.yaml`) —
  expected LAY-1 (reserved by the spike's numbering; confirm no collision) and
  LAY-7 for the focal-point control.
- Governance pattern to follow (the repo's ratchet): a proposal is a record in
  `harness/docs/catalog-changes/<slug>.md` describing the control, the
  triggering evidence, and the exact YAML entry + detail file; the catalog
  commit happens ONLY after design-lead approval, recorded in the file. Exemplar
  records: `harness/docs/catalog-changes/component-default-consistency.md`
  (plan 027 / CMP-7) and `contrast-functional-chips-step-12.md` (plan 029) —
  read one before writing.
- Detail-file format spec: `harness/standards/README.md`; validator:
  `python3 harness/checks/validate.py` enforces catalog↔detail frontmatter
  parity, tier↔waiver pairing, and (post-048) the README control count.
- `harness/.claude/skills/design/SKILL.md` layout headnote (post-049): "Grid
  systems remain HIG + judgment until a declared product grid lands" — Step 3
  updates this only if the gate ratifies LAY-1.
- Evidence base available for the "triggering incident" sections: the loop-run
  records under `harness/docs/decisions/` and `harness/docs/loop-run/
  FRICTION-REPORT.md` (grep them for layout/alignment/density friction), plus
  the 2026-06-22 self-run review under `harness/docs/reviews/`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Validate | `python3 harness/checks/validate.py` | exit 0 (48 controls while propose-only; 49–50 after a ratified commit) |
| Next LAY ids | `grep -n "id: LAY-" harness/standards/catalog.yaml` | LAY-2..6 today |
| Website build (after any catalog commit) | `pnpm build` | exit 0 |

## Scope

**In scope**:
- `harness/docs/catalog-changes/lay-1-grid.md` and
  `harness/docs/catalog-changes/lay-7-focal-point.md` (create — propose-only)
- `harness/docs/spikes/layout-category/SPEC.md` (status-header update only,
  after the gate)
- GATED (Step 3, only with recorded design-lead approval):
  `harness/standards/catalog.yaml`, `harness/standards/controls/lay-1.md`,
  `lay-7.md`, `harness/README.md` control count (post-048 [COUNT-SYNC] will
  force it), the design skill's layout headnote, `layout-patterns.md`
  re-anchoring (if 052 landed)

**Out of scope** (do NOT touch, ever, in this plan):
- Any SLP control — spike open question 6 settled the split: LAY is "what good
  looks like", SLP is "what bad looks like"; do not re-litigate.
- `checks/` scripts — a `layout-scan` is a follow-up plan once a control
  ratifies with `check: deterministic`/`hybrid`; do not build it speculatively.
- Product repos' `.tfx/` files — the layout-system declaration FORMAT is
  proposed here; creating instances is the product teams' work.

## Git workflow

- Branch: `advisor/053-layout-ratchet-2`
- Commit style: `docs(standards): propose LAY-1 grid + LAY-7 focal point (ratchet records)`; the gated commit separately as `feat(standards): ratify LAY-1/LAY-7 (design-lead approved <date>)`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Write the LAY-1 proposal record (grid, with the declaration format)

Create `harness/docs/catalog-changes/lay-1-grid.md` from the spike's LAY-1
schema table, resolving what the spike left open:

- **The declaration**: propose `.tfx/layout-system.json` in the product repo
  (sibling to `.tfx/component-manifest.json`, per spike Q4) with a minimal
  schema: `{ "columns": …, "gutter": "<token>", "margins": "<token>",
  "breakpoints": [360, 768, 1280], "maxContentWidth": "<value>" }`. Products
  without the file: LAY-1 is **N/A — no declared grid** (the honest v0 state,
  same pattern as CMP-1's "asserted, no manifest").
- **Control draft**: id LAY-1, tier L2, `check: hybrid` (deterministic half =
  gutter/margin values on the TOK-2 scale once declared; judgment half =
  coherent column structure), `phase: [implement, verify]`, `applies_to:
  [page, component]`, `fails_when` from the spike, plus the N/A clause.
- **Triggering evidence**: cite real friction from `docs/decisions/` /
  FRICTION-REPORT / the 2026-06-22 self-run (grep for alignment/grid/edge
  items). If NO real evidence exists, say so plainly in the record and mark the
  proposal "standards-derived, no incident" — the design lead weighs that.
- **Re-audit set** (required by the ratchet): the shipped surfaces the control
  would apply to (the loop-run pages + the website itself).

**Verify**: record exists; `python3 harness/checks/validate.py` → exit 0 with the catalog UNCHANGED (`git diff --stat -- harness/standards/catalog.yaml` → empty).

### Step 2: Write the LAY-7 proposal record (focal point / hierarchy matches task order)

Create `harness/docs/catalog-changes/lay-7-focal-point.md`:

- **Control draft**: id LAY-7, title "The page has one primary focal region and
  its visual reading order matches the task's priority order", tier L2,
  `check: judgment`, `phase: [diverge, verify]`, `applies_to: [page]`.
  `fails_when`: two or more regions compete for first read with no task reason;
  the squint-test first-read lands on secondary content (e.g. a summary card
  outranking the entry surface on a data-entry page); the primary action's
  region is visually subordinate to decoration.
- **Deconfliction section** (required — the spike's Q6 discipline): vs. CMP-5
  (one primary *action* — a button rule; LAY-7 is the whole-page composition),
  vs. SLP-6 (type-scale contrast is one *means*; LAY-7 is the outcome), vs.
  LAY-3 (template fit says which shell; LAY-7 says what leads inside it).
- **Evaluator guidance** in the draft detail file: use the squint test and the
  region enumeration (aligned with 052's layout read, if landed — cite
  `layout-patterns.md` item 1); "Do not flag" a deliberate two-panel
  comparison view where the task IS side-by-side comparison.
- **Triggering evidence + re-audit set**: same sourcing rule as Step 1.

**Verify**: record exists; catalog still unchanged; both records carry `tier`, `check`, `phase`, `applies_to`, `verify`, `fails_when`, deconfliction, re-audit set (grep each heading).

### Step 3 (GATED — design-lead approval required): Commit the ratified subset

**STOP here and obtain design-lead approval per record** (approve / amend /
reject, recorded by name and date IN the record — the exemplar records show the
form). Then, for each APPROVED control only:

1. Add the YAML entry to `harness/standards/catalog.yaml` (LAY block, id order
   per the file's existing convention).
2. Create `harness/standards/controls/lay-1.md` / `lay-7.md` with frontmatter
   exactly matching the catalog entry (validate.py enforces).
3. Update the README control count (048's [COUNT-SYNC] will fail the build
   until you do — that is the guard working).
4. Update the design skill's layout headnote (drop "grid systems remain HIG +
   judgment" if LAY-1 ratified; name the new controls) and, if 052 landed,
   re-anchor `layout-patterns.md` items 1 and 7 to LAY-7/LAY-1.
5. Update the spike SPEC's status header (partially/fully ratified, date).

**Verify**: `python3 harness/checks/validate.py` → `OK: <new count> controls valid`; `pnpm build` → exit 0; `grep -rn "remain HIG + judgment" harness/.claude/skills/design/` → consistent with what ratified.

## Test plan

Propose-only steps: the validator run (catalog untouched) + the heading greps.
Gated step: validate.py (catalog+detail parity), [COUNT-SYNC], `pnpm build`,
and one evaluator dry-run if a live session is available — hand the evaluator a
loop-run screenshot and the new controls, confirm it can grade LAY-7 from the
detail file's guidance without inventing a rubric.

## Done criteria

- [ ] Two proposal records exist with all required sections; catalog untouched until the gate
- [ ] Design-lead decision recorded by name/date in each record (approve/amend/reject)
- [ ] IF approved: catalog + detail files + count + skill headnote + spike status all consistent; validate.py and `pnpm build` green
- [ ] IF rejected: records marked rejected; spike status updated; nothing else changed
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `harness/plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- You cannot reach the design lead for Step 3 — the plan is DONE-as-proposed at
  the end of Step 2; say so and stop. NEVER commit catalog changes without the
  recorded approval (the harness's own CLAUDE.md forbids it).
- `grep "id: LAY-"` shows LAY-1 or LAY-7 already taken by something unexpected.
- The evidence grep finds a decision record that CONTRADICTS a proposal (e.g. a
  deliberate two-focal-point layout approved by a human) — cite it in the
  record's "Do not flag" and let the design lead weigh it, don't drop the
  proposal silently.

## Maintenance notes

- If LAY-1 ratifies, the follow-up queue gains: (a) a `layout-scan` check for
  its deterministic half (model on plan 038's script conventions), (b) the
  `.tfx/layout-system.json` format landing in the ONBOARDING doc, and (c) each
  product declaring its grid — until then LAY-1 grades N/A, which is honest.
- If LAY-7 ratifies, plan 052's layout read becomes its evidence procedure —
  keep the two texts pointing at each other, not duplicating.
- The spike's open question 3 (radius consistency: TOK-3 vs a LAY control) was
  settled as "stays in TOK-3" — do not reopen it here.
