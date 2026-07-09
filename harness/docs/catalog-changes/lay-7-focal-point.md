# Proposed control: LAY-N (one focal point, hierarchy matches task order — next free LAY slot 7)

**Date:** 2026-07-02 · **Change type:** new control via ratchet (no tier change to any
existing control) · **Approved by:** Reza Ilmi (design lead), 2026-07-06 — in-session approval. Assigned
**LAY-7**, L2, judgment. Phase remapped from the proposed `[diverge, verify]` to
**`[plan, verify]`** to fit the catalog schema's phase enum (the catalog has no `diverge`
phase; `plan` is the composition-decision phase, matching LAY-3).

> **Note on `LAY-N`:** written as a placeholder rather than a concrete number, for the
> same reason as the sibling proposal `lay-1-grid.md` — `checks/validate.py`'s
> catalog-changes cross-ref sweep flags any `PREFIX-<digit>` id not already in the
> catalog. At proposal time the next free LAY id is **7** (`grep -n "id: LAY-" ` on the
> live catalog shows LAY-2 through LAY-6 committed; slot 1 is the sibling grid proposal,
> still open). Confirm still free and assign the concrete id at the approval gate.

This record lives in `docs/catalog-changes/` per the same placement rule as
`component-default-consistency.md` and `contrast-functional-chips-step-12.md`: it is a
ratchet proposal, not a fresh loop-run decision record, so it does not go in
`docs/decisions/` (that directory is audited by `checks/audit-record.py` against the
loop-run template). Plan: `harness/plans/053-layout-ratchet-round-2.md`.

## Why this is a control, not a one-off fix

"One focal point, hierarchy matches the task order" is a composition rule the harness
already teaches — but only as prose, spread across three places that each cover a slice
of it:

- Phase 2's "Compose, don't fill" (`.claude/skills/tfx-design-ui/SKILL.md`, the "Compose,
  don't fill" paragraph): "one clear focal point — the teacher's primary task and its
  single primary action … with related content grouped by proximity … and everything
  else stepped down so hierarchy does the explaining."
- CMP-5: one primary (filled) *action* per view — a button-styling rule, not a
  whole-page composition rule.
- SLP-6: adjacent type-scale steps differ by at least 1.25x — a *typographic* mechanism
  for hierarchy, not a statement about which region should read first.

None of the three states the whole-page rule as a checkable claim: that a page has one
primary focal *region*, and its visual reading order matches what the task actually
needs done first. A page could pass CMP-5 (one filled button) and SLP-6 (real type-scale
steps) while still failing this — e.g. a dashboard where a decorative summary card is
sized and positioned to read before the data-entry surface the task requires. Per
`standards/README.md` authoring rule 1, if it's currently "prose spread across three
places, checkable as a whole nowhere," it isn't a standard yet — this record makes it
one.

## Triggering evidence

I grepped `harness/docs/decisions/*.md`, `harness/docs/loop-run/FRICTION-REPORT.md`, and
`harness/docs/reviews/*.md` for focal-point / competing-region / hierarchy-mismatch
friction. I found no incident where a page shipped with two competing focal regions or a
first-read that missed the task — the loop-run decision records that discuss hierarchy
report it *working*: `grade-entry.md` ("Hierarchy matches the task … Clear
single-column read: context line → h1 "Marks" → status chip → grid → sticky footer with
running count + primary action") and `student-notes-empty-state.md` ("Clean centred
single-column hierarchy reads in the intended order"). **This proposal is
standards-derived, no incident** — the loop-run pages already exhibit the behaviour this
control would check; the gap is that nothing in the catalog would catch it if a future
page didn't. The design lead should weigh that the evidence is confirmatory (the pattern
already works in practice) rather than corrective (nothing has failed yet).

## The proposed control

- **id:** `LAY-N` (next free slot; 7 at proposal time — confirm at the gate).
- **title:** "The page has one primary focal region and its visual reading order
  matches the task's priority order".
- **tier:** L2.
- **check:** judgment.
- **phase:** `[diverge, verify]`.
- **applies_to:** `[page]`.
- **waiver:** rationale (follows L2).
- **verify:** "Evaluator applies the squint test (does the first-glance read land on the
  region the task needs done first?) and enumerates the page's distinct visual regions
  by weight (size, colour, position, whitespace isolation); a page with two or more
  regions of comparable weight and no task reason for the tie, or whose first-read
  region is not the task's priority region, fails."
- **fails_when:**
  - two or more regions compete for first read with no task reason for the tie;
  - the squint-test first-read lands on secondary content (e.g. a summary card
    outranking the entry surface on a data-entry page);
  - the primary action's region is visually subordinate to decoration.

## Deconfliction

- **vs. CMP-5** (one primary action): CMP-5 is a *component* rule — at most one filled
  button per view. This control is the *whole-page composition* rule — even a page with
  exactly one filled button can fail this if a decorative or secondary region outweighs
  the region that button lives in. A page can pass CMP-5 and fail this control, or vice
  versa (a page with two filled buttons in the same visually-subordinate secondary
  region, correctly reading as one focal region, would fail CMP-5 but might still read
  with one focal point).
- **vs. SLP-6** (type-scale contrast): SLP-6 is one *mechanism* hierarchy can use —
  adjacent type steps differing by ≥1.25x. This control is the *outcome*: even with a
  compliant type scale, two headings at the required ratio apart can still both be sized
  to compete for first read if they're both oversized relative to the page. Passing
  SLP-6 is necessary but not sufficient for passing this control.
- **vs. LAY-3** (page templates): LAY-3 says *which shell* a surface should use
  (workspace view, form, dashboard, …). This control says *what leads inside* that
  shell once chosen — a page can correctly adopt the dashboard template (LAY-3 pass)
  and still have the wrong region leading inside it (this control fails).

## Evaluator guidance (for the detail file)

- Use the **squint test**: blur or step back from the screenshot: which region draws the
  eye first? Compare that to the task's stated priority (Phase 1's stated primary task).
- **Region enumeration**: list the page's distinct visual regions (not DOM elements) and
  rank them by apparent weight — size, colour saturation, position (top/centre draws
  first), and whitespace isolation. A finding is two or more regions within the same
  rank with no task reason.
- If plan 052 has landed by the time this control is evaluated, align the region
  enumeration with `layout-patterns.md` item 1's layout read rather than inventing a
  separate procedure — the two texts should point at each other, not duplicate (see
  Maintenance notes).
- **Do not flag** a deliberate two-panel comparison view where the task IS side-by-side
  comparison (e.g. before/after, two students' work compared) — two regions of
  comparable weight are correct there because the task itself has no single priority
  region; that is the "no task reason" clause's exception, not a violation of it.

## Re-audit set

- The harness demo loop-run pages — `harness/docs/loop-run/attendance.html`,
  `grade-entry.html`, `student-notes-empty-state.html`, `submit-marks-review.html` — all
  currently described in their decision records as having a working single-focal-point
  hierarchy (see Triggering evidence); worth a formal re-audit against this control's
  wording once ratified, in scope until re-audited.
- The website itself — no dedicated pass has checked its own pages against this specific
  reading-order framing; in scope for a follow-up self-audit once ratified.
- Consumer surfaces (Teacher Workspace, Glow, CaseSync) are re-audited by their own
  product teams in their own repos.

## Notes carried into the detail file (`standards/controls/lay-N.md`, if ratified)

- **How it would be verified:** judgment only — no deterministic sub-check is proposed
  or planned; "which region reads first" is not mechanically scorable without a gaze
  model, unlike LAY-4's max-width scan.
- **Do not flag:** a deliberate two-panel or multi-region comparison view where the task
  itself has no single priority region (see Evaluator guidance above); a page with
  exactly one region by design (e.g. a single-decision confirmation card) trivially
  passes.

---

**Status:** propose-only, Step 2 of plan 053. Not committed to `standards/catalog.yaml`.
Awaiting design-lead approve/amend/reject, recorded by name and date in this file before
any catalog change happens (per the harness's own CLAUDE.md: never edit the catalog to
make a failing check pass, and never commit without recorded approval).
