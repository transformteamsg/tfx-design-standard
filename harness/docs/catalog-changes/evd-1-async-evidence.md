# Async-state screenshot evidence required — APPROVED AS A HARNESS RULE, NOT A CONTROL

**Date:** 2026-07-08 · **Change type:** harness-rule adoption via ratchet — the gate chose
path (b) below over a new catalog control · **Approved by:** Reza Ilmi (design lead),
2026-07-08 — in-session directive ("execute all and then ship"); recommended options
adopted. **Decision: path (b), the harness-rule path — the recommended option — not path
(a), a new `EVD` control.** Additional reviewer scoping decision: no
`checks/audit-record.py` assertion is added in this run (see "Deferred: the audit-record
assertion" below, unchanged by the gate's decision). **The `EVD` prefix stays unused** —
no `standards/schema.json` change, no `meta.categories` entry, no catalog entry, no
`controls/evd-1.md`. Record this explicitly so a future proposal does not half-adopt the
prefix.

> **Note on the `EVD-N` placeholder used below:** `EVD` was never added to
> `standards/schema.json`'s `id_prefixes` — that is precisely what the gate declined to
> do — so `checks/validate.py`'s cross-ref sweep never actually matches an `EVD-<digit>`
> string regardless of what this file writes. The specification sections below still use
> `EVD-N` for readability and to mirror the CMP-4 record's convention, not because the id
> is reserved anywhere; no id was ever assigned, and none is now.

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
requirement the same mandatory force.

**Gate decision: (b), the harness-rule path.** Recommended option adopted as-is. Landed
in `.claude/skills/design/verify.md` (Phase 5's state-evidence step now names the
MANDATORY loading/success/error-frame requirement when CMP-3 is in scope, with the
video/attestation substitutes) and `docs/decisions/TEMPLATE.md`'s evidence ledger (a
REQUIRED line under Screenshots naming the same requirement). No schema, categories,
catalog, or detail-file change — the section below ("The proposed control (if the gate
chooses path (a))") is retained only as the specification that was NOT adopted, for the
record.

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

**Not applicable — the gate chose the harness-rule path (b).** There is no catalog
control id, so `checks/reaudit-scope.py` has nothing to compute against. The rule still
has a practical re-audit implication worth naming for the design lead: every decision
record written before 2026-07-08 (all four in the current corpus) predates this
requirement and was not built with an EVD-aware evidence set in mind — those records are
not retroactively non-compliant (the rule did not exist when they shipped), but a future
CMP-3-scoped re-audit of those surfaces should also capture the missing frames while it's
there.

**Status:** APPROVED AS A HARNESS RULE (Step 3 of plan 065). No `standards/catalog.yaml`
or `standards/schema.json` change — none was ever made. `.claude/skills/design/verify.md`
and `docs/decisions/TEMPLATE.md` carry the MANDATORY requirement.
