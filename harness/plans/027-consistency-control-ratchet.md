# Plan 027: Propose a component-default / sibling-page consistency control (ratchet)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **This plan has a hard human gate.** Step 1 is propose-only (writes a proposal
> record, touches no catalog file). Step 2 commits the control and **must not run**
> until the design lead has approved the proposal. Do not skip the gate.
>
> **Drift check (run first)**: `git diff --stat 5f95350..HEAD -- harness/standards/catalog.yaml harness/standards/schema.json`.
> If `meta.categories`, the CMP block, or `id_prefixes` changed since this plan was
> written, compare against "Current state" before editing; on a mismatch, STOP.
> `python3 checks/validate.py` must pass before AND after Step 2. Paths are relative
> to the harness root.

## Status

- **Priority**: P2 (issue #5 / HF-19; broadens HF-4)
- **Effort**: M
- **Risk**: LOW for Step 1 (propose-only record); MED for Step 2 (first commit of a
  new control — gated on design-lead approval, validator-checked)
- **Depends on**: none for Step 1. Step 2 is **gated on design-lead approval**.
  (Models: plan 020 propose-only → plan 023 gated commit.)
- **Category**: docs (normative standard — new control via ratchet)
- **Planned at**: commit `5f95350`, 2026-06-17

## Why this matters

HF-19 (issue #5): the attendance run's avatar defect was a component **override that
diverged from the design-system default** (`text-primary-foreground` →
`text-foreground`) while every other page used the default — and it caused an L0
contrast fail (A11Y-1, 3.32:1). The toggle case mirrored it: only the *selected*
option carried a resting affordance, so the unselected members read as plain text.
**Nothing in the catalog flags "you overrode a DS component default" or "this differs
from the same component on sibling pages" or "a control group's members don't share a
resting affordance."** A11Y-1 catches the *contrast consequence* after the fact;
nothing catches the *consistency* class that lets such divergences in. HF-19 asks for
a consistency dimension/check. This plan proposes that control through the harness
ratchet (evidence in, rule out — propose first, design lead decides).

## Current state

- `standards/catalog.yaml` — the CMP ("Components & patterns") block begins at the
  `# ── Components & patterns ──` comment. **In this branch the catalog contains only
  CMP-1, CMP-2, CMP-3** (lines ~318–347) — so `grep "id: CMP-" | tail -1` returns
  **CMP-3**, and a naive "next integer" gives **CMP-4, which collides with a reservation**:
  - **`CMP-4` is reserved** for the pending empty-state-clarity proposal in
    `docs/decisions/student-notes-empty-state.md` (reserved in that *record*, not in the
    catalog — the validator does not see it).
  - **`CMP-5`/`CMP-6`** appear only in `plans/README.md` prose as an *in-flight
    uncommitted batch in `main`'s working tree* — they are **not in this branch's
    catalog or any record here**. They may or may not be committed by the time this
    plan runs.
  So the id is **not** "catalog max + 1". The executor MUST, at Step 2, take the next
  integer that is absent from the catalog **and** unreserved in every
  `docs/decisions/*` and `docs/catalog-changes/*` record, and **confirm that id at the
  design-lead approval gate** (the gate the commit already waits on) so an in-flight
  reservation can't collide. Do NOT hardcode an id (CMP-7 was a guess that assumed the
  `main` batch had landed).
- `standards/schema.json` — `"id_prefixes": […, "CMP", …]` already includes `CMP`
  (and `COL`), so **no schema change is needed** for a new CMP control (unlike plan
  023, which had to add `LAY`).
- `docs/decisions/attendance.md` — the triggering loop-run record. Its **"## Ratchet"
  section (lines ~252–277)** already holds `[proposed — pending design-lead approval]`
  entries (the A11Y-6 / EVD-1 proposals) in this exact format — numbered, each with
  **Statement / Verified by / Triggering evidence**. This is the proposal pattern.
  The avatar/toggle evidence lives in **GitHub issue #5 (HF-18, HF-19)**, not yet in
  this record.
- `docs/catalog-changes/cnt-3-lead-with-purpose.md` — the worked example of a
  *catalog-change record* (triggering incident, the change, tier rationale, who
  approved, re-audit set). Step 2 writes one of these.
- `standards/controls/a11y-8.md` — detail-file exemplar. **Frontmatter convention: a
  detail file repeats the catalog fields `id, source, title, tier, check, phase,
  applies_to, verify, waiver` verbatim and OMITS `fails_when`.** `validate.py`
  enforces the match (it rejects orphan detail files and catalog entries pointing at a
  missing detail file). It checks the fields just listed; **`refs` is conventional but
  NOT enforced**, so a refs mismatch won't fail the validator.
- `standards/controls/slp-10.md` (committed in this branch) — exemplar of a
  **`check: judgment`** control; model the new control's shape on it. (`slp-11.md`,
  another judgment exemplar, exists only in `main`'s uncommitted batch — do not rely on
  it being present in this branch.)
- `.claude/skills/tfx-design-ui/SKILL.md:300-303` — the Phase-4 **"Consistency is a
  feature (HIG: Familiarity, Flexibility)"** bullet, the natural home for a one-line
  reference to the new control once committed.
- `.claude/skills/tfx-design-review/SKILL.md` — the judgment-controls grading section
  (where in-scope judgment/hybrid controls are applied) gains the new control.

### Verification the proposal must state (the ratchet bar)

"If you can't state how it's verified, it isn't a control yet." The proposed control
is verified by the **evaluator** (judgment) for now, with a deterministic sub-check
**planned** once the CMP-1 component manifest is wired (the manifest is what makes
"overrode a default" mechanically detectable). State both.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Validator (Step 2, before & after) | `python3 checks/validate.py` | `OK: N controls valid` |
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` |
| CMP ids in catalog (Step 2) | `grep -oE "id: CMP-[0-9]+" standards/catalog.yaml \| sort -V` | the live catalog ids (CMP-1..3 in this branch) — `tail -1`+1 alone is UNSAFE (gives CMP-4, which is reserved) |
| CMP ids reserved in records (Step 2) | `grep -roE "CMP-[0-9]+" docs/decisions docs/catalog-changes` | reservations the catalog doesn't show (CMP-4 in student-notes-empty-state.md) — exclude these too |
| Frontmatter parse (Step 2) | `python3 -c "import yaml; yaml.safe_load(open('standards/controls/<id>.md').read().split('---')[1])"` | exit 0 |

## Scope

**Step 1 — In scope** (propose-only):
- `docs/catalog-changes/component-default-consistency.md` (create) — the proposal
  record, marked `[proposed — pending design-lead approval]`.

**Step 2 — In scope** (ONLY after approval):
- `standards/catalog.yaml` — one new CMP entry.
- `standards/controls/<id>.md` (create) — the detail file.
- `.claude/skills/tfx-design-ui/SKILL.md` and `.claude/skills/tfx-design-review/SKILL.md`
  — one-line wiring each.
- `docs/catalog-changes/component-default-consistency.md` — fill in the approved id +
  "approved by".

**Out of scope** (both steps):
- Editing `catalog.yaml` or anything in `standards/` during Step 1.
- Any other control, the in-flight CMP-5/6 batch, `schema.json` (CMP already valid).
- Building a deterministic check now (it's "planned" — gated on CMP-1 manifest).
- Consumer/product surfaces (Teacher Workspace) — those are a separate repo; the
  re-audit set names them but does not change them here.

## Git workflow

- Step 1 branch: `advisor/027-consistency-proposal`. Step 2 (after approval) branch
  per the reviewer's instruction (e.g. `catalog/cmp-7-component-consistency`).
  Conventional commits (`docs: propose component-default consistency control (HF-19)`
  / `feat(catalog): add CMP-N component-default consistency control`). Do NOT push.

## Steps

### Step 1 (propose-only): write the proposal record

Create `docs/catalog-changes/component-default-consistency.md`. Open with a placement
note (mirroring `cnt-3-lead-with-purpose.md`): it lives in `catalog-changes/` because
it is a feedback-driven catalog addition surfaced by the attendance run + GitHub issue
#5, with the verbatim triggering evidence in `docs/decisions/attendance.md` and issue
#5. Mark the whole proposal `[proposed — pending design-lead approval]`. Specify the
control fully:

- **Proposed id:** the next free CMP id (CMP-7 at time of writing — confirm against
  the live catalog at Step 2). Note that CMP-4 is reserved and CMP-5/6 are in-flight.
  Also record the open option of a dedicated `CON`/`CST` "Consistency" category if the
  design lead prefers it over CMP — a category choice is theirs.
- **Proposed title:** "Components stay consistent with their design-system defaults and
  with sibling-page usage — overriding a default's colour/contrast/shape, or breaking a
  control group's shared resting affordance, is a finding unless justified".
- **Tier:** propose **L2** (strong default; consistency & quality). Rationale: the
  *safety* consequence (contrast) is already L0 via A11Y-1; this control catches the
  *consistency* class that admits such divergences. Note the design lead may elevate to
  L1 if recurrence warrants.
- **Check:** **judgment** now (evaluator), with a deterministic override-detection
  sub-check **planned** once the CMP-1 manifest is wired. (Model: SLP-11 judgment +
  LAY-4 "planned" note.)
- **phase:** `[plan, implement, verify]`; **applies_to:** `[page, component]`;
  **waiver:** `rationale`.
- **verify:** "Evaluator: the surface's components use their design-system defaults;
  any override of a default that changes colour, contrast, or shape is flagged (and its
  contrast re-checked under A11Y-1), the surface's component usage matches sibling
  pages, and a control group's members share one resting affordance; deterministic
  override-detection planned once the component manifest (CMP-1) is wired".
- **fails_when:** (a) a DS component default is overridden in a way that changes
  colour/contrast/shape with no recorded reason; (b) a component is used differently
  here than on sibling pages with no reason; (c) members of one control group (toggle
  set, segmented control) don't share a resting affordance — only the selected one
  reads as interactive.
- **Triggering evidence (quote verbatim):** from issue #5 / HF-19 — the
  `AvatarFallback` text-colour override diverging from the DS default while every other
  page used it (A11Y-1 fail at 3.32:1), and the toggle case (only the selected option
  had a resting affordance). Cross-reference `docs/decisions/attendance.md`.
- **Re-audit set:** name it (the ratchet requires this) — the harness demo loop-run
  pages (`docs/loop-run/attendance.html`, grade-entry, student-notes) for the
  control-group/affordance facet; and an explicit note that consumer surfaces (Teacher
  Workspace) are re-audited by the product team in their own repo.
- **How it would be verified / Do-not-flag** notes for the eventual detail file:
  do-not-flag a *deliberate, recorded* override (a waiver with a real reason), or a
  product's documented nuance calibration (accent/tone per `tfx-design-standards`).

**Verify**: file exists; it is marked `[proposed — pending design-lead approval]`; it
states tier + check + verify + fails_when + triggering evidence + re-audit set; **no
file under `standards/` was created or edited** (`git status` shows only the new
`docs/catalog-changes/` file). STOP here and route the proposal to the design lead.

### Step 2 (GATED — only after design-lead approval): commit the control

Do not start until the design lead has approved the proposal and (if they chose) named
the tier/category. Then:

1. Determine the id. Collect the CMP ids present in `standards/catalog.yaml` AND the
   CMP ids reserved in any `docs/decisions/*` / `docs/catalog-changes/*` record (both
   Commands-table greps). Pick the lowest integer absent from **both** sets. In this
   branch that is CMP-4 in the catalog but CMP-4 is reserved in
   `student-notes-empty-state.md`, so the answer is **CMP-5** *unless* the `main`
   in-flight batch (which reserves CMP-5/6) has landed — in which case continue upward.
   **Confirm the final id with the design lead at the approval gate** before writing it,
   and update the proposal record's id to match. If the computed id is reserved anywhere,
   STOP and ask.
2. Add the catalog entry to the CMP block in `standards/catalog.yaml` with the approved
   id/tier/check and the fields from the proposal, plus `detail: controls/<id>.md` and
   `refs:`. Add a dated approval comment above it (as the in-flight batch and plan 023
   do).
3. Create `standards/controls/<id>.md` following the `a11y-8.md` frontmatter convention
   (repeat catalog fields verbatim, OMIT `fails_when`). Body: Requirement, Rationale
   (with the triggering incident), Passes when, Fails when, **Evaluator guidance**, and
   **Do not flag** (deliberate recorded overrides; product nuance calibration).
4. Wire the skills: in `tfx-design-ui/SKILL.md` add a clause to the Phase-4 "Consistency
   is a feature" bullet (`:300-303`) naming the new control; in `tfx-design-review/SKILL.md`
   add it to the judgment-controls grading guidance.
5. Fill the approval line + final id into the catalog-change record.

**Verify**: `grep -c "id: CMP-" standards/catalog.yaml` increased by 1; the
frontmatter-parse command → exit 0; `python3 checks/validate.py` → `OK`;
`claude plugin validate .` → passes; the new id appears in both skills.

## Test plan

No code/tests. Gates: Step 1 — proposal exists, propose-only honoured (`standards/`
untouched). Step 2 — `validate.py` OK before and after, frontmatter parses and matches
the catalog entry, plugin validation passes, both skills reference the new id, and a
read-through confirms the detail file follows `a11y-8.md` structure and the evidence is
quoted accurately. The website reads `catalog.yaml` directly — the new entry appears
verbatim on the site (reviewer confirms render).

## Done criteria

Machine-checkable. ALL must hold:

**Step 1 (propose):**
- [ ] `docs/catalog-changes/component-default-consistency.md` exists, marked `[proposed — pending design-lead approval]`
- [ ] States id-to-assign, tier, check, verify, fails_when, triggering evidence (quoted), re-audit set
- [ ] `git status` shows NO change under `standards/` — propose-only honoured
- [ ] `plans/README.md` row updated to reflect Step 1 done / Step 2 gated

**Step 2 (gated commit), additionally:**
- [ ] `python3 checks/validate.py` → `OK`; `claude plugin validate .` passes
- [ ] New CMP control present; `standards/controls/<id>.md` frontmatter matches the catalog entry
- [ ] Both skills reference the new id; catalog-change record carries the approved id + approver
- [ ] No out-of-scope file modified

## STOP conditions

Stop and report (do not improvise) if:

- The computed CMP id is already taken in the live catalog **or reserved in any
  `docs/decisions/*` / `docs/catalog-changes/*` record** (e.g. CMP-4 in
  student-notes-empty-state.md; or the `main` CMP-5/6 batch landed first) — re-derive
  the lowest integer free in both sets and confirm it at the approval gate; do not
  reuse a reserved id. If the design lead picks a dedicated *category* (CON/CST)
  instead of CMP, that needs a `schema.json` `id_prefixes` addition (then this is no
  longer a no-schema-change plan — flag it).
- Step 2 is reached without a recorded design-lead approval — STOP; Step 2 is gated.
- `validate.py` rejects the detail file for a reason not fixable by matching the catalog
  entry — report its output.
- `meta.categories`/CMP block differs from "Current state" (drift).

## Maintenance notes

- The deterministic sub-check (override-detection) is deferred until CMP-1's component
  manifest is wired (plan 019 Stage B landed the manifest validator; the override-diff
  is the natural next check). Until then this control is evaluator-judged — say so.
- This is the consistency *control*; plan 028 (`checks/contrast`) is the mechanical
  contrast backstop, and plan 025 (HF-18) is the procedural fix that stops "preserved"
  elements being waved through. The three are complementary, not duplicative.
- A reviewer should decide whether the control-group resting-affordance facet is better
  split into its own control later — it rode in here because it shares the
  consistency-of-component-usage root cause.
