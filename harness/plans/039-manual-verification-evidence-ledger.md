# Plan 039: A machine-checkable manual-verification evidence ledger (audit-record + review skill + template)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **This tightens process artifacts.** It adds a structured ledger so "verified
> manually" claims carry evidence and can be audited. It does NOT change any control or its
> tier. Touches `audit-record.py` (governance-critical check), `TEMPLATE.md`, and the review
> skill → design-lead review before merge.
>
> **Drift check (run first)**: `git diff --stat 7629f00..HEAD -- harness/checks/audit-record.py harness/docs/decisions/TEMPLATE.md "harness/.claude/skills/tfx-design-review/SKILL.md"`
> If any changed materially, compare against "Current state" before editing; on a mismatch, STOP.
>
> **Coordinate with plan 040** — both edit `harness/checks/audit-record.py`? No: 040 builds a
> *separate* `waiver-reconcile.py`. But if 040 is being executed in parallel and DOES touch
> audit-record, land one then rebase the other so the self-test case numbers don't collide.

## Status

- **Priority**: P3 (reliability: "verified manually" is currently an unauditable text blob — there
  is no record of *what* was manually checked, so a re-audit can't tell a real manual pass from a
  rubber stamp)
- **Effort**: M
- **Risk**: MED — changes the decision-record contract and a governance-critical check; the bar is
  that existing records still pass (migrate the corpus, like plan 019's lesson).
- **Depends on**: none hard. Coordinate with **040** on `audit-record.py` if parallel.
- **Category**: dx / docs (process honesty)
- **Planned at**: commit `7629f00`, 2026-06-22

## Why this matters

Most controls aren't mechanically checked yet (only `validate`, `token-audit`, `audit-record`,
`a11y-static` are built; the rest — plus the judgment/hybrid halves — are "verified manually").
The harness rule is honest: say "verified manually," not "passed." But **"verified manually" today
is unauditable** — `tfx-design-review`'s output and the record's "Verify verdict" section carry it
as prose, with no required statement of *what* was checked and *how*. Six months on, a re-audit
cannot distinguish a real manual contrast check ("measured fg/bg with the picker, 5.1:1") from a
glance ("looked fine"). This plan adds a **verification ledger**: a per-control row stating the
method (script / manual / unverified) and, for manual, the concrete evidence — emitted by the
evaluator, recorded in the decision record, and validated by `audit-record.py`. It turns "verified
manually" from a pinky-promise into an auditable claim.

## Current state

- `harness/docs/decisions/TEMPLATE.md` "## Verify verdict" (lines 54–65) — currently a prose
  bullet: "**Deterministic controls:** which were script-checked vs. verified manually vs. left
  unverified — per control." Plus "**Evaluator verdict:** paste the full … verdict verbatim." There
  is **no structured, machine-checkable per-control ledger.**
- `harness/.claude/skills/tfx-design-review/SKILL.md`:
  - lines 35–50 — the verified-manually guidance: "ask whether each was verified manually; if
    neither, say the control is unverified rather than passed … note 'verified manually' as the
    evidence source." Already requires naming the source, but not in a structured, checkable form.
  - "## Output format" (lines 108–135) — `VERDICT / BLOCKING / ADVISORY / QUALITY GRADES /
    JUDGMENT CONTROL NOTES / UNCOVERED`. The CMP-1 line (130–131) is the existing precedent for a
    *required, fixed-form* per-control evidence line — model the ledger on it.
- `harness/checks/audit-record.py` — `audit_record(text, name, repo_root)` returns message
  strings; `REQUIRED_SECTIONS` includes "Verify verdict"; assertion 4 requires a `VERDICT:` line +
  a `QUALITY GRADES` block in that section; assertion 9 is the CMP-1 fixed-form precedent (lines
  216–238) — **the exact pattern to copy for a new ledger assertion.** `run_self_test()` has 16
  cases using `PASSING_RECORD`; `parse_table_rows()` / `column_index()` (lines 84–112) parse
  markdown tables (reuse for the ledger table).
- `harness/docs/decisions/*.md` — existing records (`attendance.md`, `grade-entry.md`,
  `student-notes-empty-state.md`, `self-audit.md`) that must keep passing — so the new assertion
  must be **lenient on absence** (only validate a ledger if one is present) OR you migrate the
  records (recommended; see Step 3). Plan 019's lesson: a new record-audit assertion must be run
  over the **real corpus**, not only the synthetic self-test.

### Repo conventions to honour

- `audit-record.py`: pure stdlib; pure `audit_record` function returning messages; `run_self_test`
  with `assert_passes`/`assert_fails` on in-memory `PASSING_RECORD` variants; `SELF-TEST OK (N
  cases)`; exit 0/1.
- The ledger is a markdown table (parsed by the existing `parse_table_rows`).
- Review-skill / template prose follows tfx-content-style.

## Commands you will need

| Purpose | Command (from `harness/`) | Expected on success |
|---------|---------|---------------------|
| Record audit (real corpus) | `python3 checks/audit-record.py` | `OK: <n> records audited`, exit 0 |
| Record-audit self-test | `python3 checks/audit-record.py --self-test` | `SELF-TEST OK (N cases)`, exit 0 (N grew) |
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` |

## Scope

**In scope** (modify):
- `harness/docs/decisions/TEMPLATE.md` — replace the prose "Deterministic controls:" bullet with a
  structured **Verification ledger** table.
- `harness/.claude/skills/tfx-design-review/SKILL.md` — add the ledger to the output format; tie
  the "verified manually" guidance to it (manual rows must name what + how).
- `harness/checks/audit-record.py` — new assertion: validate the ledger if present (manual rows
  need non-empty evidence; methods from a fixed vocabulary); + self-test cases.
- Existing `docs/decisions/*.md` — migrate to add a ledger (Step 3), so the real corpus passes.

**Out of scope** (do NOT touch):
- Any control, tier, or the catalog.
- The waiver reconciliation (plan 040) — separate check.
- The evaluator *agent* file (`.claude/agents/tfx-design-evaluator.md`) — it follows the review
  skill; the skill edit is sufficient. (Mention only if the agent restates the output format.)

## Git workflow

- Branch: `advisor/039-verification-ledger`. Conventional commits
  (`feat(checks): audit-record validates a manual-verification evidence ledger`). Do NOT push.

## Steps

### Step 1: Add the Verification ledger to the template + review skill

- `TEMPLATE.md` "## Verify verdict": replace the prose "Deterministic controls" bullet with:
  ```
  - **Verification ledger** (one row per in-scope control):

    | Control | Method | Evidence |
    |---------|--------|----------|
    | A11Y-1  | manual | measured fg/bg with the picker — 5.1:1 at the smallest text |
    | TOK-1   | script | `checks/token-audit.py` clean |
    | A11Y-4  | unverified | needs computed layout — flag for a human |

    Method is one of `script` / `manual` / `unverified`. A `manual` row MUST name what was
    checked and how. A `script` row names the script/command. `unverified` says why.
  ```
- `tfx-design-review/SKILL.md`: in the output format (after JUDGMENT CONTROL NOTES), add a
  required **VERIFICATION LEDGER** block (same three columns), and update the lines 35–50 guidance
  to "when you record 'verified manually', state what you checked and how — it becomes a ledger row
  the record audit validates." Reference the CMP-1 fixed-form precedent as the model.

**Verify**: `claude plugin validate .` passes; the template renders the table.

### Step 2: `audit-record.py` — validate the ledger (assertion 10)

Add a new assertion in `audit_record`, modeled on assertion 9 (CMP-1, lines 216–238):
- Find the "Verify verdict" section; within it, locate the ledger table (the table whose header
  contains "Method" and "Evidence" — use `parse_table_rows` + `column_index`).
- If a ledger is present:
  - each row's Method must be one of `script` / `manual` / `unverified` (case-insensitive) →
    else `ledger row '<control>' has invalid method '<m>'`;
  - a `manual` row with an empty Evidence cell → `ledger row '<control>' is 'manual' with no
    evidence — name what was checked and how`;
  - an `unverified` row with empty Evidence → `ledger row '<control>' is 'unverified' with no
    reason`.
- **Leniency + ordering (do this in order — making it required before migrating breaks the real
  records):** if NO ledger table is present, do not error in this assertion *yet*. **Order:** (1)
  implement the assertion in *optional* mode (only validates a ledger when one exists); (2) do
  Step 3 — add a ledger to every real record; (3) only then flip to *required* (the "Verify
  verdict" section MUST contain a Method/Evidence table) and re-run `audit-record.py` over the real
  corpus to confirm all pass. Decide and document required vs. optional. **Recommended: required,
  after Step 3.** (For the self-test's "valid ledger passes" cases you'll need a `PASSING_RECORD`
  variant that *includes* a ledger — `PASSING_RECORD` has none today.)

Add self-test cases (extend `run_self_test`, using `PASSING_RECORD` variants — note PASSING_RECORD
must gain a ledger if the assertion is required):
- valid ledger (script + manual-with-evidence + unverified-with-reason) → passes.
- manual row with empty Evidence → fails with "no evidence".
- invalid method ("eyeballed") → fails with "invalid method".
- (if required) Verify verdict with no ledger table → fails with "no verification ledger".

**Verify**: `python3 checks/audit-record.py --self-test` → `SELF-TEST OK (N cases)`, N greater
than 16.

### Step 3: Migrate the existing records (so the real corpus passes)

For each `docs/decisions/*.md` (except TEMPLATE.md), add a Verification ledger to its "Verify
verdict" section reflecting what that record already states (script/manual/unverified per its
in-scope controls — read the record; do not invent evidence — if a record's manual evidence is
genuinely absent, write `unverified — original record did not capture evidence` rather than
fabricating). This is the plan-019 lesson: a new record-audit assertion must be run over the real
corpus as a done-criterion.

**Verify**: `python3 checks/audit-record.py` → `OK: <n> records audited` (all real records pass).

### Step 4: Document

- `harness/checks/README.md` "Audit record (built)" section — note the new ledger assertion in the
  per-record list and bump the self-test case count in the `**Self-test:**` line.

**Verify**: `claude plugin validate .` passes; `git status` shows only in-scope files.

## Test plan

- Embedded `--self-test` (Step 2) — valid ledger, empty-manual-evidence, invalid-method, and
  (if required) missing-ledger cases.
- Real corpus (Step 3) — every existing record passes after migration.
- Verification: both `python3 checks/audit-record.py` and `--self-test` green.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `TEMPLATE.md` "Verify verdict" has a Verification ledger table; the review skill's output format requires it
- [ ] `audit-record.py` validates the ledger (invalid method, empty manual evidence) with new self-test cases
- [ ] `python3 checks/audit-record.py --self-test` → `SELF-TEST OK (N cases)`, N > 16
- [ ] `python3 checks/audit-record.py` → `OK: <n> records audited` (all real records migrated + passing)
- [ ] `checks/README.md` notes the assertion + updated case count; `claude plugin validate .` passes
- [ ] No control/tier/catalog change; only in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- Migrating a real record (Step 3) would require inventing manual evidence that the original run
  did not capture — write `unverified — not captured` instead; do NOT fabricate a measurement.
- Making the ledger *required* breaks records you cannot migrate honestly — fall back to the
  lenient (optional-ledger) mode and document that the requirement is deferred until the corpus is
  migrated.
- `audit-record.py`'s structure differs materially from "Current state" (drift) — re-read and match
  (especially the assertion-9 / `parse_table_rows` patterns).

## Maintenance notes

- The ledger makes "verified manually" auditable: every manual claim now names its evidence, and a
  re-audit can check it. As more `checks/` scripts land (plans 028, 038, 040), rows flip from
  `manual` to `script` — the ledger is the migration tracker.
- A reviewer should confirm (a) the assertion is lenient-or-migrated (no real record breaks), (b)
  no fabricated evidence entered the migrated records, and (c) the review skill emits the ledger so
  records can paste it verbatim.
- Coordinate `audit-record.py` edits with plan 040 (waiver reconciliation) if both are in flight.
