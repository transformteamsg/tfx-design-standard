# Design decision record — Attendance (Teacher Workspace)

- **Date:** 2026-06-11
- **Product:** TW
- **Change type:** new page
- **Page type:** workspace view (with async submit → inherits `[flow]` controls)
- **The teacher and the moment:** Mr. Rahman, P3 form teacher, 7:28am — two minutes
  before flag-raising, 38 students, usually 0–3 absences. Standing, device in hand,
  students still arriving. Designed for the stressed minute, not the quiet desk.

## Sprint contract (done-criteria)

1. The all-present happy path completes in ≤ 2 interactions.
2. Marking an exception (absent/late) takes ≤ 2 interactions per student, findable
   without search in a 38-row roster.
3. Submission state is unambiguous: the teacher always knows if today's attendance is
   submitted, and a correction path exists after submit.
4. Async submit has designed loading/success/error states; error keeps all marks
   (CMP-3 + CNT-1 anatomy, including draft-preserved reassurance).
5. All copy second-person, active, ≤ 25 words (CNT-3); statuses keyboard-reachable
   with visible focus (A11Y-2); every control labelled (A11Y-3).

## Chosen approach

**Option B — exception-first two-step**, single page, two states:

- State 1 ("the question"): "Is everyone present today?" + register count line.
  Primary "Yes — submit all 38 present" (count in the button label = blind-submit
  mitigation); ghost "No — mark exceptions".
- State 2 ("exceptions"): full roster, present-by-default, Present/Absent/Late
  segmented control per row; marked exceptions pin to top; live summary; "Submit
  attendance".
- Post-submit: status chip flips to "Submitted <time>"; quiet toast; "Make a
  correction" reopens State 2. Attendance stays editable — corrections are routine,
  so no destructive lock and CMP-2 is out of scope by design.

## Rejected options

- **A — roster with present-by-default (single state)** — recommended by the agent;
  the user chose B. A shows the full register at submit time (safer sighting), at the
  cost of scanning 38 rows daily.
- **C — seating grid** — parked by Earn the Feature: needs seating-chart data and
  photos not in the data model; novel pattern where stack components cover the need.

## Tradeoffs, named

1. B saves one decision on all-present days but hides the register at submit time —
   mitigated by the count-in-button, not eliminated. If school practice requires
   sighting the full register before submit, A was the safer shape.
2. Exceptions pinning to top reorders the list under the teacher's hands — accepted
   so "who did I mark?" never requires scrolling.
3. No undo on submit; correction-by-editing instead — simpler than undo given
   attendance is editable all day.

## Controls in scope

A11Y-1, A11Y-2, A11Y-3 (L0) · A11Y-4, A11Y-5 (L1) · TOK-1..3 (L1) · TYP-1..3 (L1) ·
TYP-4 (L2) · COL-1..2 (L1) · CMP-1 (L1, hybrid) · CMP-3 (L1, hybrid — async submit
inherits `[flow]`) · CNT-1..2 (L1) · CNT-3 (L2) · MOT-1 (L2). IDN-1 n/a (inner page,
no lockup). CMP-2 n/a (no destructive action by design — see Chosen approach).

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| CMP-1 | L1 | No component manifest exists in harness v0; component existence asserted from Base UI/shadcn general knowledge (per worked-example precedent) | Reza Ilmi (user), at the Phase 3 gate, 2026-06-11 | this record |

## Content outline

- Title: "Attendance" · context: "P3 Integrity · Wed 11 Jun" · chip: "Not submitted"
  / "Submitted 7:31am".
- State 1: "Is everyone present today?" / "38 students on the register." /
  "Yes — submit all 38 present" / "No — mark exceptions".
- State 2 summary: "36 present · 1 absent · 1 late" / "Submit attendance".
- CMP-3 states for submit: loading — button "Submitting…", controls disabled, scoped;
  success — chip flips + toast "Attendance submitted."; error — inline banner: "We
  couldn't submit attendance — check your connection and try again. Your marks are
  saved on this device."
- Names checked (CNT-2): "Attendance", "Submit attendance" — function-named, plain.

## Plan approval

- **Approved by:** Reza Ilmi (user) — typed "approve"
- **Approved on:** 2026-06-11
- **Process note:** the Phase 3 gate was initially presented as a modal dialog
  competing with the plan text; the user corrected the process ("present the plan
  first"). The `design-page` skill was amended mid-run (present first, ask second,
  plain text). Recorded here as ratchet input.

## Verify verdict

- CMP-1: asserted, no manifest — manifest absent for TW

### Deterministic controls

| Control | How verified | Result |
|---|---|---|
| TOK-1..3, COL-1..2 | **Scripted** — `python3 checks/token-audit.py docs/loop-run/attendance.html` | PASS (exit 0) — first run where these are mechanically verified |
| A11Y-1 contrast | Verified manually (script unbuilt) — token pairs chosen for AA; brand-600 on white, text on tinted backgrounds | pass (manual) — human re-check recommended |
| A11Y-2 keyboard/focus | Verified manually — all controls are buttons; `:focus-visible` ring tokens | pass (manual) |
| A11Y-3 labels | Verified manually — segmented group `aria-labelledby` student name; per-button `aria-label` "Status — Name" | pass (manual) |
| A11Y-4 targets | Verified manually — buttons min 44px; segment buttons 44×32 with full-row spacing | pass (manual) — 32px height relies on spacing exception; human re-check |
| A11Y-5 reduced motion | Verified manually — global `prefers-reduced-motion` guard | pass (manual) |
| TYP-1..3 | Verified manually — PJS 600 display, Inter 400/500/600, sizes on scale {24,20,18,16,14,12,11} | pass (manual) |
| TYP-4, MOT-1 (L2) | Verified manually — no long all-caps; 150–200ms standard easing | pass (manual) |
| IDN-1 | n/a — no lockup on inner page | n/a |

Screenshots: `docs/loop-run/screenshots/attendance/` — 360/768/1280 question state,
plus exceptions / loading / success / error state evidence (loading frame captured
after the evaluator flagged its absence; state-evidence frames rendered at desktop
width despite 768 filenames — width evidence is the three question-state frames).

### Verification ledger

*Compiled from the Deterministic-controls table and the evaluator verdict above — no
new evidence; each row restates what this record already captured.*

| Control | Method | Evidence |
|---------|--------|----------|
| TOK-1..3, COL-1..2 | script | `python3 checks/token-audit.py docs/loop-run/attendance.html` — PASS (exit 0) |
| A11Y-1 | manual | token pairs chosen for AA — brand-600 on white, text on tinted backgrounds; human re-check recommended (contrast script unbuilt) |
| A11Y-2 | manual | all controls are buttons; `:focus-visible` ring tokens; success/error focus moves later verified live-DOM by the orchestrator (`activeElement.id` → "correct" / "error-banner") |
| A11Y-3 | manual | segmented group `aria-labelledby` the student name; per-button `aria-label` "Status — Name" |
| A11Y-4 | manual | buttons min 44px; segment buttons 44×32 with full-row spacing — 32px height relies on the spacing exception; human re-check recommended |
| A11Y-5 | manual | global `prefers-reduced-motion` guard present |
| TYP-1..3 | manual | PJS 600 display, Inter 400/500/600, sizes on the scale {24,20,18,16,14,12,11} |
| TYP-4, MOT-1 | manual | no long all-caps; 150–200ms standard easing |
| CMP-1 | manual | asserted, no manifest — evidence source (c) general Base UI / shadcn knowledge; waiver recorded above |
| CMP-3 | manual | loading verified in code (attendance.html:422-423: button "Submitting…", disabled, scoped); exceptions/success/error photographed; loading frame `768-loading.png` captured before close |
| A11Y-11 | manual | modification re-audit: each async state uses exactly one channel; live-DOM checked — loading live-region "Submitting attendance…", after error `activeElement` = error-banner, zero `[role=alert]` in document |
| CNT-1 | manual | evaluator pass — error copy covers what happened, what to do, and the marks-saved reassurance; no raw code |
| CNT-2 | manual | evaluator pass — "Attendance", "Submit attendance", "Make a correction" are plain, function-named |
| CNT-3 | manual | evaluator pass — all sentences second person/active, under 25 words; button labels are fragments |

### Evaluator verdict (design-evaluator subagent)

*Verdict produced by the design-evaluator agent (opus), dispatched with the contract,
plan, screenshots, in-scope hybrid/judgment controls, and the standards path. Pasted
verbatim (an earlier revision of this record summarized it — corrected per the
verbatim rule; the CMP-3 loading advisory was addressed in-run: `768-loading.png`
captured before close).*

VERDICT: pass-with-findings

BLOCKING (must fix before ship):
- None. No deterministic violation is visible in code or screenshots, and the
  scripted TOK-1..3/COL-1..2 audit passed (exit 0). All in-scope judgment/hybrid
  controls pass.

ADVISORY (should fix):
- CMP-3 loading state — evidence gap, not a defect. This run was specifically about
  capturing async-state evidence (per the prior EVD-1 finding), and it captured
  exceptions/success/error but NOT the loading frame. The loading state is verifiable
  in code (attendance.html:422-423: `triggerBtn.textContent = "Submitting…"`, button
  disabled, scoped to the trigger — correctly NOT a page takeover), so I judge it
  present and proportional. But it is the one CMP-3 state I cannot SEE. Recommend
  capturing a "Submitting…" frame to close the evidence loop the run set out to
  close. *(Addressed in-run: `768-loading.png`.)*
- Success-state focus management (close call, human review) — on success the
  roster/question is hidden and `#done` is revealed (attendance.html:444), but focus
  is not moved to the `#done` panel; the toast carries `aria-live="polite"` and the
  chip flips, so the outcome is announced, but a keyboard/AT user's focus is left on
  a now-hidden control. A11Y-2 was marked manually verified and I cannot prove a
  violation from the static evidence — flagging as a close call, not a blocker.
- "Make a correction" is a text link styled control (`.btn--link`, min-height 24px)
  where a ghost button would match the State-1 "No — mark exceptions" affordance;
  meets A11Y-4 (24px) but is the least prominent control on the most consequential
  recovery path. Minor; consider a button.

QUALITY GRADES:
- Design quality — strong. State 1 reads in task order (question → register count →
  primary → escape), generous centred card, the count-in-button ("Yes — submit all
  38 present") is a genuine blind-submit mitigation. Exception rows pin to top with
  a tinted `row--exception` background (768-exceptions.png shows Chen Wei Ming/absent
  and Farah Binte Ismail/late lifted above the present block) so "who did I mark?"
  never requires scrolling. Carries Kind Utility, not just control-passing.
- Originality — strong (correctly restrained). The exception-first two-step is an
  appropriate, distinctive answer to the stressed-minute moment without inventing
  novel widgets; the segmented status control reuses the Base UI ToggleGroup pattern
  (attendance.html:212), Option C (seating grid) was correctly parked by Earn the
  Feature. No unwarranted novelty.
- Craft — strong. Empty/default, exceptions, success, and error states are all
  designed and captured; reduced-motion guard present (attendance.html:84-86);
  responsive collapse to full-width buttons at ≤480px verified at 360px
  (360-question.png); tabular-nums on the index and summary. Single gap: the loading
  frame is coded but uncaptured (see advisory).
- Functionality — strong. Both paths complete the task (≤2 interactions all-present:
  open → "Yes"; exception path: per-row toggle → "Submit attendance"), error keeps
  all marks and re-exposes both submit affordances (768-error.png), and "Make a
  correction" reopens an editable roster with the chip retained — no dead end,
  recovery path intact.

JUDGMENT CONTROL NOTES:
- CMP-1 — waiver handled per protocol; pass with caveat. No component manifest
  exists (v0); evidence source: (c) general knowledge of the Base UI / shadcn
  catalog. The recorded waiver carries a named approver (Reza Ilmi, Phase 3 gate)
  and a specific reason as the control requires.
- CNT-1 — pass. Error copy covers what happened, what to do, and the marks-saved
  reassurance; no raw code.
- CNT-2 — pass. "Attendance", "Submit attendance", "Make a correction" — plain,
  function-named; "P3 Integrity" is the teacher's own form-class term.
- CNT-3 — pass. All sentences second person/active, under 25 words; button labels
  are fragments (out of sentence scope).

UNCOVERED (defects no control covers — feed the ratchet):
- No control governs focus restoration on async state transition (success panel
  reveal / error banner reveal). CMP-3 covers state existence and proportionality;
  CNT-1 covers copy; A11Y-2 covers per-element focus visibility but not focus
  *movement* across a state change. Candidate for a new A11Y control on focus
  management across async/route transitions.
- No control requires that captured evidence cover every state a hybrid control
  asserts. EVD-1 (prior run) pushed for async-state evidence; a follow-on ratchet
  could require the loading frame specifically, since "loading" is the state most
  often coded-but-unphotographed.

### Re-review after addressing advisories (design-evaluator, targeted delta)

*Fixes: success focus → "Make a correction" button; error focus → banner
(`tabindex="-1"`); link → ghost button. Live-DOM verified by the orchestrator
(`activeElement.id` → "correct" / "error-banner"). Verdict pasted verbatim:*

VERDICT: pass

BLOCKING (must fix before ship):
- None.

ADVISORY (should fix):
- **Error state double-announcement (advisory 1, partially carried forward).** The
  error banner `#error-banner` carries `role="alert"` (line 301) AND receives
  programmatic `.focus()` (line 428) with its full text as the focus target's
  accessible name. A screen reader will announce this once when `is-visible` is
  added (alert live region) and again when focus lands on it — the same sentence
  twice in immediate succession. This is not harmful (no information lost, focus is
  correctly parked on the recovery context) but it is mildly redundant. The cleaner
  pattern is to keep the focus move and drop `role="alert"` (since focusing the
  surface already voices it), or keep `role="alert"` and move focus to the retry
  control rather than the banner. Close call, recommend human review of which to
  keep — the fix as shipped is acceptable, not wrong.

QUALITY GRADES:
- Design quality — strong: success panel reads top-down (chip → heading "Attendance
  submitted" → count detail → single recovery action), spacing rhythm intact, the
  correction button now carries proper button weight rather than floating as link
  text.
- Originality — acceptable: no new patterns introduced by the fixes; ghost button
  reuses the existing stack affordance, correct restraint.
- Craft — strong: success focus management now resolves the prior dead-focus-on-body
  gap; the triggering button is hidden post-submit and focus is deliberately
  re-homed to the only actionable element in the revealed panel — disorientation
  risk is low because the heading precedes it and a polite toast confirms.
- Functionality — strong: recovery path complete — "Make a correction" re-opens the
  roster with marks preserved (`state.marks` untouched on both error and
  correction), no dead ends.

JUDGMENT CONTROL NOTES:
- [A11Y-4] pass (belt-and-braces, deterministic) — `.btn { min-height: 44px }`
  applies to `.btn--ghost`; the changed button clears the 24px floor with margin.
- [A11Y-2] pass (belt-and-braces) — `.btn:focus-visible` ring applies to the
  now-ghost `#correct`; focus is both visible and programmatically delivered.

UNCOVERED (defects no control covers — feed the ratchet):
- Code comments cite "A11Y-6 draft" for focus-on-reveal, but no A11Y-6 exists in
  `catalog.yaml`. The success/error focus-management behavior these fixes implement
  is genuinely uncovered by any ratified control — it was caught only as an
  evaluator advisory. Recommend the ratchet add a focus-management-on-async-state-
  change control so this is enforced rather than discretionary. (Both fixes verified
  against generator orchestrator's live-DOM claim; I could not independently re-run
  the DOM — consistent with static code read, but the live assertion itself is
  unverified by me.)

**Open for human review:** the double-announcement pattern choice above (drop
`role="alert"` vs. focus the retry control instead). Shipped as-is pending that call.

## Ratchet

Proposals fed by this run's evaluator UNCOVERED findings (recorded here pending
design-lead approval, per CONTRIBUTING.md stage (a)):

1. **A11Y-6 — Focus moves to the revealed surface on async state transitions**
   `[SUPERSEDED 2026-06-11 — ratified as part of A11Y-11 in the catalog, merged with
   the GovTech checklist's "Status messages" item; approved by harness lead]` —
   originally: L1, hybrid, applies_to [flow,
   component]. Statement: when an async action replaces or reveals a surface
   (success panel, error banner), keyboard focus moves to the revealed surface or
   its first actionable element. Verified by: script enumerates state transitions
   and asserts a focus target; evaluator judges the landing point is sensible.
   Triggering evidence: this run — focus remains on a hidden control after submit
   success (evaluator advisory 2 + uncovered finding 1). Gap: A11Y-2 covers focus
   *visibility*, nothing covers focus *movement*.

2. **EVD-1 (amendment) — evidence set must include every state a hybrid control
   asserts, explicitly including loading** `[proposed — pending design-lead
   approval]` — extends the prior run's EVD-1 proposal: loading is the state most
   often coded-but-unphotographed (it happened again this run before being caught).

Process ratchet already applied mid-run: `design-page` Phase 3 gate amended to
"present first, ask second, plain-text approval" after user correction.

- **Accepted by user:** pending (presented 2026-06-11)

## Modification run — catalog re-audit (2026-06-11, later)

After A11Y-6..11 entered the catalog (GovTech checklist ratchet), this page was
re-audited via the modification loop. Scoped plan: A11Y-6/7/8/9 pass as built;
A11Y-10 n/a (standalone demo, no repeated chrome; `<main>` landmark present);
A11Y-11 — one violation (error banner `role="alert"` + focus = double announcement)
and one gap (loading state silent to AT). Approved by operator proxy — user-directed
test run.

Fixes: banner alert role removed, focus is the channel, banner is a named non-live
container (`role="group"` aria-label "Submission error", per evaluator refinement);
loading announces via visually-hidden `role="status"` live region, cleared on
completion. Live-DOM verified: loading live-region text "Submitting attendance…";
after error `activeElement` = error-banner, zero `[role=alert]` in document.

Evaluator delta verdict: **pass** — each async state uses exactly one A11Y-11
channel; success's toast + focus move are two channels for two distinct messages
(matches the control's own pass examples); A11Y-7/8 graded pass with evidence;
A11Y-6/9 spot-checked pass; A11Y-10 n/a concurred. Two advisories for human/SR
confirmation: roleless-container voicing (addressed via role="group") and whether a
polite live-region update is swallowed while focus sits on the banner during retry
(needs a real screen-reader pass — not verifiable statically).

Lessons ratcheted into skills: "catalog update re-audit" entry point added to
`design-page`; "name the re-audit set" rule added to `design-standards` Growing the
catalog.
