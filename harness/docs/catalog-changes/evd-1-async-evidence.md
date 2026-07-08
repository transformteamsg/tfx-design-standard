# Proposed control: EVD-N (Async-state screenshot evidence required)

**Date:** 2026-07-08 · **Change type:** new control OR harness rule via ratchet — the
gate's central decision, see "Control vs harness rule" below · **Approved by:** pending —
design-lead approval required before any change lands. No approval is recorded in this
file yet.

> **Note on `EVD-N`:** placeholder, not a concrete id — `EVD` is **not** currently in
> `standards/schema.json`'s `id_prefixes`; adding an `EVD-1` catalog entry would require
> a schema change (see below). This record uses the placeholder convention regardless, so
> `checks/validate.py`'s cross-ref sweep does not flag a stray literal id while this
> proposal is open.

This record lives in `docs/catalog-changes/` per the plan-053 placement rule. Plan:
`harness/plans/065-ratchet-cmp4-empty-state-evd1-evidence.md`.

## Why this is a control (or harness rule) candidate

The Student Notes evaluator could not verify CMP-3 perceptibility because all three
captured evidence frames showed only the empty state — a build can claim loading,
success, and error states exist in code while none is ever screenshotted. This is not a
one-off: GitHub issue #19 (HF-16, OPEN) independently states "the evaluator grades the
builder's evidence set, not the surface," and the golden eval
`evals/golden/003-broadcast-message.yaml` already demands "the loading frame (the
habitually missing state)" — the same failure class recurring across three independent
sources.

## Triggering evidence (verbatim)

**UNCOVERED, Student Notes evaluator:**
> "No control requires that async-state evidence be captured. Because CMP-3 is verified
> partly from code, a build can claim three states while only the empty state is ever
> screenshotted. A control (or harness rule) requiring loading/success/error frames in the
> evidence set would close the perceptibility blind spot this review hit."

**ADVISORY on CMP-3, same evaluator, same run:**
> "none of the three screenshots capture the loading, success, or error states — all
> three frames (360/768/1280) show only the initial empty state. The control requires the
> success state be 'perceivable by the user' and the error/loading states reachable; I can
> confirm reachability from the code but cannot verify perceptibility (timing, placement,
> no off-screen render) from the evidence given."

— `docs/decisions/student-notes-empty-state.md:200` and `:247-248`, transcribed into the
full proposal at `docs/decisions/student-notes-empty-state.md:229-250`.

## Control vs harness rule — the gate's central decision

Two paths, presented honestly, both closing the same gap:

- **(a) Control path.** Add `EVD` as a new category prefix: a `standards/schema.json`
  `id_prefixes` change, a `meta.categories` entry (`EVD: Evidence`), a catalog entry, and
  a `controls/evd-1.md` detail file. This sets precedent that *process evidence* — what
  the builder captured and submitted, not a property of the shipped UI — can be a
  first-class catalog control. It is a genuinely new category of thing the catalog grades.
- **(b) Harness-rule path (recommended).** No catalog change. Instead, a MANDATORY
  evidence-set requirement written directly into `.claude/skills/design/verify.md` (the
  verify procedure every loop run follows) and `docs/decisions/TEMPLATE.md`'s evidence
  ledger (a REQUIRED row, not an optional one). Same enforcement teeth — a missing frame
  is still a deterministic, checkable gap — with no catalog change, keeping the catalog
  about the product surface rather than the loop's own process. A `checks/audit-record.py`
  assertion enforcing this deterministically over the real record corpus is the natural
  next step, but is **not** added in this proposal — see "Deferred: the audit-record
  assertion" below.

**Recommendation:** (b), the harness-rule path — it keeps the catalog scoped to what the
*product* must do, not what the *builder's evidence set* must contain, while giving the
requirement the same mandatory force. The gate decides.

## The proposed control (if the gate chooses path (a))

- **id:** `EVD-1`.
- **title:** "For every page containing an async transaction (CMP-3 in scope), the verify
  evidence set includes screenshots or screen-recordings capturing the loading, success,
  and error states — not only the initial/empty state".
- **tier:** L1 (proposed) — deterministic check against the evidence set.
- **check:** deterministic.
- **phase:** `[verify]`.
- **applies_to:** `[flow]`.
- **waiver:** `documented` (follows L1).
- **verify:** "Check the decision record's evidence listing for at least one frame
  labelled or clearly showing: (a) loading/saving in progress, (b) success confirmation,
  (c) error state. If CMP-3 is in scope and any of the three is absent, the control fails
  regardless of code-level reachability. Acceptable alternatives: a video walkthrough
  covering all three states, or a named human reviewer's attestation that they witnessed
  the live render of all three."
- **fails_when:**
  - CMP-3 is in scope and the evidence set contains no loading-state frame, video, or
    attestation;
  - CMP-3 is in scope and the evidence set contains no success-state frame, video, or
    attestation;
  - CMP-3 is in scope and the evidence set contains no error-state frame, video, or
    attestation.
- **detail:** `controls/evd-1.md`.

## Deferred: the audit-record assertion (explicit scoping note)

Whichever path the gate chooses, a deterministic `checks/audit-record.py` assertion that
enforces the loading/success/error-frame requirement over the **real** decision-record
corpus is the natural mechanization — but it is a **planned follow-up, not part of this
proposal's landing**. Reason: `harness/CONTRIBUTING.md`'s corpus-scanning rule requires
that any new or tightened `audit-record.py` assertion be run over the real corpus and
either pass, be migrated, or be explicitly grandfathered before it ships — never shipped
against a corpus it fails. The existing record corpus predates this rule entirely (none
of the current records were built with an EVD-1-aware evidence set in mind), which is
exactly the plan-019 regression class CONTRIBUTING's rule exists to prevent. Adding the
assertion now would require either fabricating evidence for past records or grandfathering
the whole corpus in the same commit that introduces the rule — neither is honest work for
this ratchet round. This gap stays machine-visible instead: it is queued as a follow-up
(see plan 065's Maintenance notes and plan 067's `enforced:` field).

## Non-duplication statement

- **vs. CMP-3:** CMP-3 is a property of the *shipped surface* (do loading/success/error
  states exist and are they perceivable). This proposal is a property of the *verify
  evidence set* (were those states actually captured and submitted for review). A surface
  can satisfy CMP-3 in code while the evidence submitted for it fails this rule — that gap
  is exactly the triggering incident.

## Re-audit set

Not applicable if the gate chooses the harness-rule path (b) — there is no catalog control
id, so `checks/reaudit-scope.py` has nothing to compute against. If the gate instead
chooses path (a), run `python3 checks/reaudit-scope.py EVD-1` after the catalog commit and
paste the output here.

---

**Status:** propose-only, Step 1 of plan 065. Not committed to `standards/catalog.yaml`
or `standards/schema.json`. Awaiting design-lead approve/amend/reject (including the
control-vs-harness-rule decision), recorded by name and date in this file before any
change happens.
