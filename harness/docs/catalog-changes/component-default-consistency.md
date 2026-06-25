# Proposed control: component-default / sibling-page consistency

**Date:** 2026-06-25 · **Change type:** new control via ratchet (no tier change to any
existing control) · **Approved by:** design lead (rezailmi, repo owner), interactively in
session 2026-06-25 — approved as proposed: CMP-7, L2, `check: judgment`.

This record lives in `docs/catalog-changes/` rather than `docs/decisions/`: that
directory is audited by `checks/audit-record.py` against the loop-run template, and this
proposal is a feedback-driven catalog addition surfaced by the attendance loop run and
GitHub issue #5 — not a fresh loop run. Same placement rationale as
`cnt-3-lead-with-purpose.md` and `slp-9-ai-writing-tells.md`. The verbatim triggering
evidence lives in `docs/decisions/attendance.md` and issue #5 (HF-18, HF-19).

## Why this is a control, not a one-off fix

HF-19 (issue #5): the attendance run's avatar defect was a component **override that
diverged from the design-system default** while every other page used the default — and
it caused an L0 contrast fail. The toggle case mirrored it: only the *selected* option
carried a resting affordance, so the unselected members read as plain text. Nothing in
the catalog flags "you overrode a DS component default", "this differs from the same
component on sibling pages", or "a control group's members don't share a resting
affordance." A11Y-1 catches the *contrast consequence* after the fact; nothing catches
the *consistency* class that lets such divergences in. Per the ratchet rule, a defect a
human caught that no control covers becomes a control change.

This is the consistency **control**. It is complementary to, not duplicative of:
`checks/contrast` (plan 028 — the mechanical contrast backstop) and the HF-18 procedural
fix (plan 025 — stops "preserved" elements being waved through).

## The proposed control

- **Assigned id:** **CMP-7** — the next free CMP id at approval time (the catalog held
  CMP-1, CMP-2, CMP-3, CMP-5, CMP-6 and the 4 slot is reserved in
  `docs/decisions/student-notes-empty-state.md`). Committed to the catalog as CMP-7.
  **Option considered:** a dedicated `CON`/`CST` "Consistency" category
  instead of CMP — that would need a `schema.json` `id_prefixes` addition (this proposal
  assumes CMP, which needs no schema change).
- **Proposed title:** "Components stay consistent with their design-system defaults and
  with sibling-page usage — overriding a default's colour/contrast/shape, or breaking a
  control group's shared resting affordance, is a finding unless justified".
- **Tier:** propose **L2** (strong default; consistency & quality). Rationale: the
  *safety* consequence (contrast) is already L0 via A11Y-1; this control catches the
  *consistency* class that admits such divergences. The design lead may elevate to L1 if
  recurrence warrants.
- **check:** **judgment** now (evaluator), with a deterministic override-detection
  sub-check **planned** once the CMP-1 component manifest is wired (the manifest is what
  makes "overrode a default" mechanically detectable). Model: SLP-10/SLP-11 judgment +
  the LAY-4 "planned" note.
- **phase:** `[plan, implement, verify]` · **applies_to:** `[page, component]` ·
  **waiver:** `rationale`.
- **verify:** "Evaluator: the surface's components use their design-system defaults; any
  override of a default that changes colour, contrast, or shape is flagged (and its
  contrast re-checked under A11Y-1), the surface's component usage matches sibling pages,
  and a control group's members share one resting affordance; deterministic
  override-detection planned once the component manifest (CMP-1) is wired".
- **fails_when:**
  - a DS component default is overridden in a way that changes colour/contrast/shape with
    no recorded reason;
  - a component is used differently here than on sibling pages with no reason;
  - members of one control group (toggle set, segmented control) don't share a resting
    affordance — only the selected one reads as interactive.

## Triggering evidence (verbatim, from issue #5 / HF-19)

- The `AvatarFallback` overrode the design-system default text colour
  (`text-primary-foreground` → `text-foreground`), producing dark initials on a blue
  `bg-primary` while **every other page used the default** — an A11Y-1 contrast fail at
  **3.32:1** (L0). Caught by a human by eye, after the critique and two evaluator passes
  preserved it.
- The toggle case: only the **selected** option carried a resting affordance, so the
  unselected members read as plain text rather than as members of one control group.

Cross-reference: `docs/decisions/attendance.md` (the triggering loop-run record).

## Re-audit set (the ratchet requires this)

- The harness demo loop-run pages — `docs/loop-run/attendance.html`,
  `docs/loop-run/grade-entry.html`, `docs/loop-run/student-notes.html` — for the
  control-group / shared-resting-affordance facet, in scope until re-audited.
- Consumer surfaces (Teacher Workspace) are re-audited by the product team **in their own
  repo** — the avatar-default convention is a product-repo fact, not a harness control.

## Notes carried into the detail file (`standards/controls/cmp-7.md`)

- **How it would be verified:** evaluator-judged now; the override-diff becomes
  mechanical once the CMP-1 manifest is wired (plan 019 Stage B landed the manifest
  validator; override-detection is the natural next check).
- **Do not flag:** a *deliberate, recorded* override (a waiver with a real reason), or a
  product's documented nuance calibration (accent/tone per `tfx-design-standards`).
  Semantic colour-coding itself is never the finding.

---

**Status:** Step 2 committed 2026-06-25 — CMP-7 added to `standards/catalog.yaml` +
`controls/cmp-7.md`, with one-line wiring in `tfx-design-ui` (Phase-4 "Consistency is a
feature") and `tfx-design-review` (judgment-controls grading). Approved as proposed:
CMP-7, L2, `check: judgment`; CMP category kept (no `schema.json` change).
