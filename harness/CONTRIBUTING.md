# Contributing to the TFX design harness

This document covers **process**: how changes reach this repository, who approves
them, and what a proposal looks like. It does not restate content rules — those live
in the authoritative source for each layer.

---

## What can be contributed

- **Controls** — new or revised entries in the control catalog, via the ratchet
  (the main path; see below).
- **Guideline / skill edits** — changes to `.claude/skills/` or `standards/README.md`
  that clarify how existing controls are applied or how the loop runs.
- **Check scripts** — new or improved scripts in `checks/` that make a currently
  judgment-only control deterministic, or that add a missing sub-check.

---

## The ratchet rule

The catalog only grows from evidence. The authoritative statement of *when* to propose
and *what* a proposal must contain lives in the tfx-design-standards skill:
`.claude/skills/tfx-design-standards/SKILL.md` — section "## Growing the catalog (the
ratchet)". Read that section before opening a branch.

Short version: evidence in, rule out. If you cannot state how a control is verified,
it is not a control yet.

---

## Proposing a control — the workflow

### (a) Decision record first

A proposal must first appear fully specified in a **decision record**, not in a branch.
Write the proposed control in the decision record that contains the triggering incident:
id, tier, check type, verification steps, and the verbatim evidence that motivated it.
Mark it:

```
[proposed — pending design-lead approval]
```

The worked example is
`docs/decisions/student-notes-empty-state.md` — two control proposals (CMP-4 and
EVD-1) are recorded there at the bottom of the Ratchet section, each with a triggering
incident and a full specification, both marked pending approval. Use that file as the
pattern.

Do not create any file in `standards/` and do not edit `standards/catalog.yaml` until
the design lead signals interest.

### (b) Open a branch once the design lead signals interest

Branch name convention: `catalog/<id-slug>`

Example: `catalog/cmp-4-empty-state-clarity`

### (c) The change set is exactly two files — nothing else

A complete proposal PR contains:

1. A new detail file `standards/controls/<id>.md` (follow the format spec in
   `standards/README.md`).
2. The matching entry appended to `standards/catalog.yaml`.

The validator (`checks/validate.py`) fails on either alone — it detects orphan detail
files (a detail file with no catalog entry) and catalog entries pointing to a
non-existent detail file. Both files must be present and consistent for the gate to
pass. No other files should change in the same PR.

### (d) Gate: validator must pass

```
python3 checks/validate.py
```

Expected output: `OK: N controls valid` (N will be 23 or higher after your addition).
A PR with a failing validator will not be reviewed. Restated fragments (the inline L0
list, the SLP-9 buzzword summary) stay in sync with their source via `<!-- tfx-sync:… -->`
markers + `validate.py` parity checks — see [docs/SYNC.md](docs/SYNC.md).

### (e) PR body — use the template below

Copy the block from the **PR template** section and fill in all five fields. An empty
field is a missing justification and the PR will be sent back.

## Revising an existing control

The flow above covers *new* controls surfaced by loop runs. A **revision** (scope
broadening, tier change, reworded requirement) follows the same evidence-first rule
but differs in two ways:

- **The record goes in `docs/catalog-changes/<id-slug>.md`**, not `docs/decisions/`.
  Decision records are loop-run artifacts audited by `checks/audit-record.py`
  against the loop-run template; a catalog change that came from outside a loop run
  (a manual audit, recurring waivers) would fail that audit. A catalog-change record
  states: the triggering incident with evidence, the change, the tier rationale, and
  who approved. `validate.py` cross-checks control IDs referenced in these records.
- **The change set is the detail file, `standards/catalog.yaml`, plus every surface
  that restates the control**: any skill or check that summarises it (grep the old
  title to find them). The website needs no separate sync — it reads this catalog
  directly. The record lists what was touched.

Gates are the same: `checks/validate.py` must pass (the site repo's
`scripts/check-standards.mjs` build gate re-verifies the catalog on deploy), and
the design lead approves.

### (f) Approval

Design lead: `<DESIGN_LEAD — to be named>`

The design lead approves or rejects with a stated reason. Rejected proposals stay
recorded in the PR and remain in the decision record marked
`[rejected — <reason> — <date>]`. A rejection is not lost work: it is evidence about
where the bar is.

---

## PR template

When opening a proposal PR, paste this block as the PR body and fill in every field:

```markdown
## Triggering incident
<!-- Describe the defect, audit finding, or recurring waiver that motivated this
     control. Paste the verbatim evidence from the decision record. -->

## Proposed control (id, tier, check)
<!-- e.g. CMP-4 · L1 · hybrid -->

## How it's verified
<!-- Exact command, DOM assertion, evaluator prompt, or combination. Must be
     reproducible by someone who was not present at the incident. -->

## Why this tier
<!-- L0: non-negotiable trust/safety/accessibility floor.
     L1: mandatory — consistency and quality.
     L2: strong default, deliberate deviation allowed.
     Justify why this tier and not the one below it. -->

## Evidence
<!-- Link to the decision record section and quote the relevant passage.
     For an L1 or L0 proposal, include more than one incident if available. -->
```

---

## Waiver registry note

L1 waivers currently live in decision records. If the same control is waived two or
more times in a single quarter, that is a signal — not to keep waiving, but to arrive
here with a proposal: either fix the standard (tighten the verification step, add an
exception clause) or demote the tier if the evidence shows the bar is miscalibrated.
Recurring waivers are ratchet evidence; use them.

---

## Skill and doc edits

Edits to `.claude/skills/`, `standards/README.md`, `checks/`, or `docs/` follow the
same PR flow as control proposals — decision record not required, but a clear commit
message stating *why* the meaning changed. Any edit that changes normative meaning
(e.g. redefining a tier, changing a waiver protocol, altering the loop gate sequence)
must be flagged for design-lead review in the PR description, even if it touches only
documentation.

---

## Tightening a corpus-scanning check

**Tightening a corpus-scanning check.** When a PR adds or tightens an assertion
in `checks/audit-record.py` (or any `checks/*` that scans an existing corpus —
records, pages, components), its done-criteria MUST include running it over the
**real corpus**, not only `--self-test`. A self-test audits synthetic fixtures and
can stay green while real artifacts fail. Required before merge:
`python3 checks/audit-record.py` (no args, audits every real record) exits 0, and
any check that scans product files is run over a real target tree. If the real
corpus fails the new assertion, either migrate the corpus in the same PR or
grandfather the assertion explicitly — never ship a check the existing corpus
cannot pass. (Origin: the 2026-06-15 CMP-1 verdict-vocabulary assertion broke
three v0 records whose self-test had passed.)
