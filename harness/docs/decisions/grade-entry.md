# Design decision record — Marks entry (Teacher Workspace)

- **Date:** 2026-06-11
- **Product:** TW
- **Change type:** new page
- **Page type:** workspace view / form (async save + destructive clear-column →
  inherits `[flow]` controls CMP-2, CMP-3)
- **Run type:** unattended (operator-proxy approvals)
- **The teacher and the moment:** Ms. Lim, P5 Math, the week before reports are due.
  A stack of 38 marked Paper 1 scripts in register order, twenty minutes between
  lessons. She enters one paper down the column, not one student across the row.
  Sometimes a column goes in against the wrong paper or with the wrong weighting —
  she needs to clear the whole column and start again without fear.

## Sprint contract (done-criteria)

1. Ms. Lim can enter a full column keyboard-only: Enter moves to the next student in
   the same column; one interaction per mark.
2. Clearing a column never loses work silently: the confirmation names the column and
   the number of marks removed, and a one-click undo restores every mark (CMP-2, L0).
3. The async save has designed loading, success, and error states; error and
   validation keep every entered mark and say so (CMP-3 + CNT-1 anatomy).
4. Save state is always unambiguous: the status chip reads Not saved / Saved <time> /
   Unsaved changes.
5. Out-of-range marks are flagged at the cell, block save with a clear fix path, and
   never discard valid marks.
6. Copy second person, active, ≤ 25 words (CNT-3); every input programmatically
   labelled by visible row + column headers (A11Y-3); keyboard reach with visible
   focus (A11Y-2); AA contrast (A11Y-1).

## Chosen approach

**Option A — marks grid**, a single semantic `<table>`:

- Rows: 38 students in register order (`<th scope="row">`). Columns: Paper 1
  (out of 40), Paper 2 (out of 60), computed read-only Total (out of 100).
- Each cell is a numeric text input labelled via `aria-labelledby` (student row
  header + column label), described by the column maximum. Enter advances down the
  column — matching the physical stack of scripts.
- Each paper column header carries a small **Clear** button (disabled when the
  column is empty). Clicking it opens a native `<dialog>` confirmation that names
  the column and the count ("This removes the 38 marks entered for Paper 1. You can
  undo straight after."). Confirming clears the column and shows a persistent undo
  banner (Undo / Dismiss) — no auto-dismiss, so undo cannot expire mid-thought.
- Sticky footer: live entered-count summary ("Paper 1: 38 of 38 · Paper 2: 12 of
  38 entered") + primary "Save marks". Save validates first (invalid marks → banner
  + cell highlights, nothing lost), then runs async with loading / success / error.

### A11Y-11 channel per async/state change (declared at plan time, per CMP-3)

| State change | Kind | Channel |
|---|---|---|
| Save loading | transient | visually-hidden `role="status"` live region: "Saving marks…"; button text "Saving…", disabled; no focus move |
| Save success | transient | toast `role="status"` "Marks saved."; chip flips; no focus move (the grid stays under her hands) |
| Save error | context replacement | focus moves to the error banner (`tabindex="-1"`, `role="group"`, **no** `role="alert"`) |
| Validation block (sync, on save attempt) | context replacement | same banner + focus-move channel |
| Clear dialog open/close | modal | native `showModal()` focus trap; initial focus on Cancel (least destructive); Esc/Cancel explicitly re-homes focus to the trigger |
| Column cleared | context replacement | focus moves to the revealed undo banner (`tabindex="-1"`, `role="group"`, no `role="alert"`, no live region — one channel). *Amended in implementation: the plan first said "focus returns to the trigger", but the trigger is disabled once its column is empty — live-DOM check caught the stranded focus; amendment approved by operator proxy — unattended run* |
| Undo | transient | live region announces "Restored N Paper 1 marks."; focus re-homes to the re-enabled Clear trigger (different content — not a double announcement) |
| Dismiss | none (user-initiated, visually acknowledged) | focus re-homes to the cleared column's first input (the Clear trigger is disabled while the column is empty) |

### Demo hooks (evidence reachability, noted per Phase 4 rule)

`?fail=1` or `tfxDemo.failNext = true` forces the save error; `tfxDemo.setMark()`
drives cell values for the invalid-state frame. All states are also reachable
through normal use.

## Rejected options

- **Option B — one paper at a time** (pick a paper, single-column list, attendance-
  style): simplest narrow layout, but doubles navigation for a two-paper assessment
  and hides the running total — Ms. Lim loses the cross-paper view she checks
  against the mark sheet.
- **Option C — per-student stepper** (one student at a time, both papers): lowest
  per-entry error risk, but ~38 step transitions per paper and it fights the real
  workflow — scripts arrive sorted by paper, not by student. Also gives "clear a
  column" no natural home.

## Tradeoffs, named

1. A dense grid at 360px is the cost of the tabular shape — mitigated by a
   horizontal-scroll wrapper and compact cells, not by hiding columns. If phone-first
   entry were the primary moment, Option B was the safer shape; the stated moment is
   desk work with scripts.
2. Confirmation **and** undo on clear-column is deliberate belt-and-braces: the
   action wipes up to 38 entries, so it is not "trivially reversible" (CMP-2's
   confirm-fatigue clause does not bite), and undo makes recovery cost one click
   (HIG: Agency, forgiveness beyond the minimum).
3. Undo holds only the most recent clear — a second clear overwrites the stash.
   Accepted: two consecutive column clears with a regret about the first is a rare
   compound case; an undo stack is complexity the moment doesn't need.
4. Explicit save (not autosave) — the chip + sticky button keep save state legible
   and the error story simple; the cost is one more action, accepted for v1.

## Controls in scope

A11Y-1, A11Y-2, A11Y-3 (L0) · A11Y-4, A11Y-5, A11Y-6, A11Y-7, A11Y-8, A11Y-9,
A11Y-11 (L1) · TOK-1..3 (L1) · TYP-1..3 (L1) · TYP-4 (L2) · COL-1..2 (L1) ·
CMP-1 (L1, hybrid) · **CMP-2 (L0, hybrid — clear-column is destructive)** ·
CMP-3 (L1, hybrid — async save inherits `[flow]`) · CNT-1..2 (L1) · CNT-3 (L2) ·
MOT-1 (L2). A11Y-10 n/a (standalone demo, no repeated chrome; `<main>` landmark
present). IDN-1 n/a (inner page, no lockup).

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| CMP-1 | L1 | No component manifest exists in harness v0; component existence (table, input, dialog, toast, button) asserted from Base UI/shadcn general knowledge, per the attendance-run precedent | approved by operator proxy — unattended run; **flagged for human ratification** | this record |

No L0 waivers (none are possible). No L2 deviations taken.

## Content outline

- Title: "Marks — Weighted Assessment 2, P5 Diligence Mathematics · Teacher
  Workspace" · context line: "P5 Diligence · Mathematics · Term 3 · Weighted
  Assessment 2" · h1: "Marks" · chip: "Not saved" / "Saved 2:47pm" / "Unsaved
  changes".
- Column headers: "Paper 1 / out of 40 / Clear", "Paper 2 / out of 60 / Clear",
  "Total / out of 100".
- Clear confirmation (CMP-2): "Clear all Paper 1 marks?" / "This removes the 38
  marks entered for Paper 1. You can undo straight after." / "Cancel" ·
  "Clear 38 marks".
- Undo banner: "Cleared 38 Paper 1 marks." / "Undo" · "Dismiss".
- Save error (CNT-1): "We couldn't save your marks — check your connection and try
  again. Your marks are kept on this page."
- Validation block (CNT-1): "Some marks are higher than the paper allows. Fix the
  marks highlighted in red, then save again. Nothing is lost." Cell hint: "Max 40" /
  "Numbers only".
- Success: toast "Marks saved."
- Names checked (CNT-2): "Marks", "Save marks", "Clear" — function-named, plain.
  "Weighted Assessment 2" / "WA2" is the term teachers use; spelt out in full here.

## Plan approval

- **Approved by:** approved by operator proxy — unattended run
- **Approved on:** 2026-06-11
- **Note:** Phase 2 option pick (Option A) also made under the same operator-proxy
  authorisation; rationale recorded under Rejected options for human review.

## Verify verdict

- CMP-1: asserted, no manifest — manifest absent for TW
- **Screenshots:** `docs/loop-run/screenshots/grade-entry/` — width evidence
  `360-default.png`, `768-default.png`, `1280-default.png` (rendered viewport
  widths confirmed 360/768/1280 via image inspection); state evidence at 768:
  `768-loading.png`, `768-success.png`, `768-error.png` (CMP-3),
  `768-invalid.png` (validation block, CNT-1), `768-confirm-clear.png` (CMP-2
  consequence dialog), `768-cleared-undo.png` (undo surface, focus ring visible
  on the banner), `768-undone.png` (recovery walked: marks restored, focus on the
  re-enabled Clear trigger).
- **Token block line range:** `grade-entry.html:11-69` (`/* tfx-tokens */` region).

### Deterministic controls

| Control | How verified | Result |
|---|---|---|
| TOK-1..3, COL-1..2 | **Scripted** — `python3 checks/token-audit.py docs/loop-run/grade-entry.html` | PASS (exit 0), re-run after the focus-management fix |
| Catalog integrity | **Scripted** — `python3 checks/validate.py` | PASS ("OK: 28 controls valid") |
| A11Y-1 contrast | Verified manually (script unbuilt) — token pairs reused from the attendance page (AA-checked there); new pair: danger solid `--color-danger-solid` on white ≈ 4.7:1 | pass (manual) — human re-check recommended |
| A11Y-2 keyboard/focus | Verified manually + live-DOM (Playwright): all controls are native buttons/inputs/dialog; `:focus-visible` ring tokens; focus paths asserted (`activeElement` after Esc → `clear-p1`, after clear → `undo-banner`, after undo → `clear-p1`, after dismiss-on-empty → `mark-p1-0`, after success → unchanged) | pass (manual + live-DOM) |
| A11Y-3 labels | Verified manually — every input `aria-labelledby` student row header + visible column label, `aria-describedby` column max (+ cell error when invalid) | pass (manual) — human re-check of the labelledby pattern recommended |
| A11Y-4 targets | Verified manually — buttons min 44px; small banner buttons 32px; header Clear buttons min-height 24px (at the floor); inputs 40px | pass (manual) — 24px Clear buttons are at the minimum; human re-check |
| A11Y-5 reduced motion | Verified manually — global `prefers-reduced-motion` guard | pass (manual) |
| A11Y-6 text alternatives | Verified manually — no images/icons on the page | pass (manual, vacuous) |
| A11Y-7 structure | Verified manually (deterministic half) — single `h1`, dialog `h2`, semantic `<table>` with caption, `scope="col"/"row"` headers | pass (manual); descriptive-quality half → evaluator |
| A11Y-8 name/role/value | Verified manually — native elements throughout; `aria-invalid` tracks cell state; dialog labelled by its heading | pass (manual); semantics-match half → evaluator |
| A11Y-9 title/lang | Live-DOM — `lang="en"`, title "Marks — Weighted Assessment 2, P5 Diligence Mathematics · Teacher Workspace" | pass (live-DOM) |
| A11Y-10 bypass blocks | n/a — standalone demo, no repeated chrome; `<main>` landmark present | n/a |
| A11Y-11 announcement channels | Live-DOM (deterministic half) — loading live region text "Saving marks…"; error/validation focus lands on `error-banner`; clear focus lands on `undo-banner`; zero `[role=alert]` in document; undo announces via live region only | pass (live-DOM); channel-choice judgment → evaluator |
| TYP-1..3 | Verified manually — PJS 600 display, Inter 400/500/600, sizes on scale {24,20,18,16,14,12,11}, body line-height 1.5 | pass (manual) |
| TYP-4, MOT-1 (L2) | Verified manually — no long all-caps; 150–200ms standard easing only | pass (manual) |
| CMP-2 (deterministic half) | Live-DOM — clear executes only via dialog confirm; consequence copy names column + count; undo restores all values (asserted `mark-p1-0` "" → "22") | pass (live-DOM); copy-quality half → evaluator |
| CMP-3 (deterministic half) | Live-DOM + screenshots — loading/success/error all reachable and photographed | pass; clarity half → evaluator |
| IDN-1 | n/a — no lockup on inner page | n/a |

Process check note: `checks/audit-record.py` will fail on this record until the
evaluator verdict is pasted (it asserts a verbatim `VERDICT:` + `QUALITY GRADES`
block) — expected while the verdict is pending; not run as a pass.

### Evaluator verdict (design-evaluator subagent)

*(Dispatched by the orchestrator 2026-06-11 after the executor stopped at Phase 5
step 3 — orchestrator-dispatch pattern. Payload: sprint contract and approved plan
above, screenshots directory, in-scope hybrid/judgment controls A11Y-7, A11Y-8,
A11Y-11, CMP-1, CMP-2, CMP-3, CNT-1, CNT-2, CNT-3, standards path
`/Users/rezailmi/Developer/design-harness/standards/`. Verdict pasted verbatim
below.)*

VERDICT: pass-with-findings

BLOCKING (must fix before ship):
- (none) — No L0 violation found. CMP-2 (L0) is satisfied: the consequence dialog names object, count, and reversibility before execution, and undo restores every mark (verified in code lines 607-641 and frames `768-confirm-clear.png` / `768-cleared-undo.png` / `768-undone.png`).

ADVISORY (should fix):
- CNT-1 — the validation banner copy is hardcoded to one cause but fires for two. `saveMarks()` (grade-entry.html:697) always shows "Some marks are higher than the paper allows. Fix the marks highlighted in red, then save again. Nothing is lost." Yet `updateCellValidity` (lines 533-534) also flags non-numeric input with the cell hint "Numbers only". A teacher who types letters gets a focus-receiving banner that misstates *what happened* ("higher than the paper allows") even though the cell says "Numbers only". CNT-1 requires the message to state what actually happened; for the non-numeric case it does not. The cell-level hint is correct; the banner — the primary, focus-announced message — can be inaccurate. Reword to cover both causes (e.g. "Some marks need fixing — check the cells highlighted in red…") or branch the banner text. Close call on severity, not on the defect: the inaccuracy is real and reachable.
- Craft (success toast placement) — in `768-success.png` the "Marks saved." toast renders mid-table, overlapping the Kavya Pillai row, rather than as a bottom-anchored toast. CSS positions it `bottom: var(--space-6)` fixed (lines 335-340), so the screenshot is likely a scroll-position artifact, but it reads as overlapping content over a data cell. Verify the toast sits clear of the grid at realistic scroll positions; success is not at risk (the chip also flips to "Saved 4:47pm"), so this is polish, not function.

QUALITY GRADES:
- Design quality — **strong**. Clear single-column read: context line → h1 "Marks" → status chip → grid → sticky footer with running count + primary action. Hierarchy matches the task (enter down the column, watch the total, save). Spacing rhythm uses the token scale consistently; the "01–38" register index supports the physical-stack workflow described in the contract. Kind Utility is present, not merely passed: persistent undo, "Nothing is lost" reassurance, no auto-dismissing recovery surface.
- Originality — **strong (appropriately restrained)**. No unwarranted novelty: native `<table>`, native `<dialog>`, native inputs, standard toast/banner patterns. The one distinctive decision — Enter advances *down* the column (line 582-588) rather than across — is justified by the stated moment (scripts sorted by paper) and is a fidelity-to-task choice, not decoration.
- Craft — **acceptable**. States are deliberately designed (loading button "Saving…" + disabled, success chip+toast, error banner, validation cell + banner, confirm dialog, undo surface, undone recovery — all photographed). `prefers-reduced-motion` guard present (lines 84-86). Edge cases handled: disabled Clear on empty column, focus-strand fallback to first input. Held back from strong by the two advisories (banner copy mismatch; toast placement read) and the 24px Clear buttons sitting *at* the A11Y-4 floor (line 239) — a generator self-flag I could not independently re-measure, recommend human re-check.
- Functionality — **strong**. The journey completes and is escapable at every step: keyboard column entry (Enter advances), confirm-or-cancel clear, persistent undo, error/validation keep all entered marks (`state.marks` untouched on failure, line 714). The walked recovery path (`768-cleared-undo.png` → `768-undone.png`) restores marks and re-homes focus to the re-enabled trigger. Teacher's work is preserved through every interruption case in the plan's flow map.

JUDGMENT CONTROL NOTES:
- A11Y-7 pass — single h1 "Marks" (line 369), dialog h2 (line 432), semantic `<table>` with a descriptive `<caption>` ("Marks for P5 Diligence… Paper 1 out of 40, Paper 2 out of 60, and the total out of 100", lines 392-395), `scope="col"`/`scope="row"` headers. Headings/labels read sensibly out of visual context.
- A11Y-8 pass — native elements throughout; `aria-invalid="true"` is set/removed in lockstep with the visual red state (lines 538-543), dialog labelled by its heading (`aria-labelledby="confirm-heading"`), Clear buttons' `aria-label="Clear all Paper 1 marks"` expands rather than contradicts the visible "Clear" (line 403).
- A11Y-11 pass-with-caveat — channel choices are sound: loading via visually-hidden `role="status"` "Saving marks…" with no focus move (line 705); success via toast `role="status"` + chip, no focus move (lines 719-720); error and validation move focus to `#error-banner` (tabindex="-1", `role="group"`, no `role="alert"`, lines 376/685). Caveat: the Undo handler fires a live-region message "Restored N Paper 1 marks." (line 669) *and* moves focus to the re-enabled Clear trigger (line 670). The record defends this as two channels carrying two *different* messages — defensible under "never both for the same message," and it passes — but it is the closest call on the page; recommend a human confirm a screen reader hears one coherent sequence, not a stutter.
- CMP-1 pass (waiver present) — **evidence source: (c) general knowledge of the Base UI / shadcn catalog**, no manifest read. The waiver carries a named approver (operator proxy, flagged for human ratification) and a specific v0 reason (no manifest), so per the detail file I record it and do not re-litigate. Substantively, every element here is native HTML or stack composition (table, input, native `<dialog>`, button, toast/banner) — no custom one-off replicates ≥90% of a stack component, so CMP-1 barely bites regardless. Note: the waiver lives only in the decision record; the detail file's inline `<!-- tfx-waive CMP-1 -->` annotation is absent from the page source — minor traceability gap, flag for the human ratifier.
- CMP-2 pass — consequence shown before execution: "Clear all Paper 1 marks?" / "This removes the 38 marks entered for Paper 1. You can undo straight after." / confirm button "Clear 38 marks" (lines 607-610, `768-confirm-clear.png`). Names object, count, and reversibility; Cancel holds initial focus (autofocus, line 435); undo restores all values (line 660-665). Confirm+undo belt-and-braces is proportionate for a ≤38-entry wipe, not confirm-fatigue.
- CMP-3 pass — all three states exist, are reachable, and are proportionate: scoped button-level loading ("Saving…", not a page takeover), perceivable success (chip + transient toast), and a visible error banner. Photographed at `768-loading.png` / `768-success.png` / `768-error.png`. Error copy graded under CNT-1.
- CNT-1 pass-with-caveat — the save-error copy is exemplary: "We couldn't save your marks — check your connection and try again. Your marks are kept on this page." (lines 712-713) — what happened, what to do, data-preserved reassurance, no raw code. Caveat is the validation-banner cause-mismatch raised in ADVISORY: the banner asserts "higher than the paper allows" even when the actual fault is non-numeric input ("Numbers only").
- CNT-2 pass — names are function-named and plain: "Marks", "Save marks", "Clear", "Total". "Weighted Assessment 2" is spelt out (not the "WA2" insider abbreviation). No portmanteaus or codenames.
- CNT-3 pass — copy is second person and active, all sentences ≤25 words: "This removes the 38 marks entered for Paper 1." / "You can undo straight after." / "Your marks are kept on this page." / "Fix the marks highlighted in red, then save again." Labels ("Clear", "Save marks", "Dismiss") are fragments, out of scope.

UNCOVERED (defects no control covers — feed the ratchet):
- **Endorse the generator's candidate ratchet: focus-target *validity* is uncovered.** No control checks whether a planned focus target stays focusable after the action that should hand focus to it. Here the plan first said "return focus to the trigger" after a column clear, but the Clear trigger *disables* on an empty column (line 558) — focus would have stranded. The implementation amended this (focus → undo banner on clear, line 640; → first input on dismiss-while-empty, line 651-652), and a live-DOM check caught it. A11Y-11 governs channel *choice* (live region vs focus move), not whether the chosen focus target is still a valid, focusable, non-disabled element at the moment focus moves. Recommend the ratchet add an A11Y-11 sub-clause or sibling control: "the focus target of a context replacement must be focusable and enabled at the moment of the move." This is a real gap, caught only because a human-grade live-DOM trace ran — worth promoting from observation to a checkable sub-requirement.
- Validation banner copy is generated from a single hardcoded string regardless of fault type (over-max vs non-numeric) — see ADVISORY/CNT-1. The narrow defect is covered by CNT-1; the *pattern* (one banner string standing in for multiple distinct validation causes) is a recurrent copy-architecture smell worth a content-lint rule that cross-checks banner copy against the set of cell-level error reasons actually present.

## Ratchet

Two proposals, both grounded in this run's findings and **endorsed by the
evaluator** (see UNCOVERED above):

1. **Focus-target validity** — no control covers focus targets that become
   disabled as a consequence of the very action that should receive focus back
   (the cleared column's Clear trigger disables on empty, so "return focus to
   the trigger" plans silently strand focus). Caught only by a live-DOM check;
   A11Y-11 covers channel choice, not target *validity*. Proposed: an A11Y-11
   sub-clause or sibling control — "the focus target of a context replacement
   must be focusable and enabled at the moment of the move."
2. **Banner-copy/cause cross-check** (evaluator-raised) — one hardcoded banner
   string standing in for multiple distinct validation causes is a recurrent
   copy-architecture smell; candidate content-lint rule cross-checking banner
   copy against the set of cell-level error reasons present.

Both go to the ratchet as lightweight PRs for design-lead approval — not applied
in this run.

