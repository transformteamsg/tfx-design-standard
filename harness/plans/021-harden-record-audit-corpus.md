# Plan 021: Harden against record-audit-assertion regressions — test new assertions over the real corpus

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a8ca4fa..HEAD -- harness/CONTRIBUTING.md harness/evals/README.md`.
> If either changed since this plan was written, compare against the "Current
> state" excerpts before proceeding; on a mismatch, STOP. Paths are relative to
> the harness root.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW (doc/process additions; no code, no catalog change)
- **Depends on**: none (codifies the lesson from plan 019's post-execution eval)
- **Category**: dx
- **Planned at**: commit `a8ca4fa`, 2026-06-15

## Why this matters

Plan 019 Stage A added a stricter `checks/audit-record.py` assertion (CMP-1 must
carry a fixed verdict form). Its done-criteria passed — but only because the
self-test audits **synthetic** in-memory records. The three **real** v0 records
(attendance, grade-entry, student-notes) failed under the new assertion, which
the post-execution eval caught (record-audit + golden 001/002 went red). The
defect was fixed by migrating the records, but the *class* of escape remains:
**a self-test over fixtures can stay green while the real corpus breaks.** The
harness's own ratchet says an escaped defect with known ground truth becomes a
guard. This plan codifies two cheap guards so the next assertion change can't
escape the same way.

## Current state

- `checks/audit-record.py` — `run_self_test()` audits synthetic strings
  (`PASSING_RECORD` + mutations); it does **not** run over `docs/decisions/*.md`.
  The no-arg invocation (`python3 checks/audit-record.py`) is what audits the real
  corpus, but nothing in the plan/PR workflow *required* running it.
- `CONTRIBUTING.md` — the harness's ratchet-PR workflow doc. It describes how
  catalog/check changes are proposed and approved, but has no rule about testing a
  new corpus-scanning assertion against the real corpus.
- `evals/README.md` — has an "## The eval ratchet" section listing current traps
  and their origins ("Every escaped defect with known ground truth becomes a trap
  …"). The 2026-06-15 CMP-1-assertion regression is a new escaped defect not yet
  listed there.
- The relevant rule already exists implicitly: `evals/README.md` says
  "**Record audit — every run.**" The gap is that plan execution didn't honor it.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Record audit over real corpus | `python3 checks/audit-record.py` | `OK: N records audited` |
| Audit self-test | `python3 checks/audit-record.py --self-test` | `SELF-TEST OK (16 cases)` |
| Catalog validator | `python3 checks/validate.py` | `OK: …` |
| Rule present (CONTRIBUTING) | `grep -c "real corpus" CONTRIBUTING.md` | ≥ 1 |
| Trap recorded (evals) | `grep -c "CMP-1" evals/README.md` | ≥ 1 |

## Scope

**In scope** (the only files you modify):
- `CONTRIBUTING.md` — add the "test new corpus-scanning assertions over the real
  corpus" done-criterion rule.
- `evals/README.md` — add the CMP-1-assertion regression to the eval-ratchet
  current-traps list.

**Out of scope** (do NOT touch):
- `checks/audit-record.py` and any check script — no code change; the guard is a
  process rule, not new code.
- The decision records (already migrated by the fix commit).
- The catalog and skills.

## Git workflow

- Branch: `advisor/021-harden-corpus`. Conventional commits
  (`docs: require new record-audit assertions to be tested over the real corpus`).
  Do NOT push.

## Steps

### Step 1: Add the done-criterion rule to CONTRIBUTING.md

In `CONTRIBUTING.md`, in the section describing how check/assertion changes are
made (or as a new short subsection "Tightening a check"), add:

```markdown
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
```

**Verify**: `grep -c "real corpus" CONTRIBUTING.md` → ≥ 1.

### Step 2: Record the escaped defect in the eval ratchet

In `evals/README.md`, in the "## The eval ratchet" current-traps bullet list, add:

```markdown
- A record-audit assertion tightened without migrating the existing corpus broke
  three v0 records (2026-06-15, CMP-1 verdict-vocabulary). The guard is the
  standing "Record audit — every run" rule plus the CONTRIBUTING "tighten over the
  real corpus" criterion — run `checks/audit-record.py` (no args) on any PR that
  changes a record-audit assertion.
```

**Verify**: `grep -c "CMP-1" evals/README.md` → ≥ 1; `grep -c "real corpus" evals/README.md` → ≥ 1 (optional, if you echo the phrase).

### Step 3: Confirm nothing regressed

**Verify**: `python3 checks/audit-record.py --self-test` → `SELF-TEST OK (16 cases)`;
`python3 checks/audit-record.py` → `OK: N records audited` (assuming the record
migration landed); `python3 checks/validate.py` → OK.

## Test plan

No code/tests. Gates: the two greps, and the three existing checks stay green
(self-test 16, real-corpus audit OK, validator OK). A read-through confirms the
CONTRIBUTING rule is actionable (names the exact command) and the eval-ratchet
entry follows the existing bullet style.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "real corpus" CONTRIBUTING.md` → ≥ 1
- [ ] `grep -c "CMP-1" evals/README.md` → ≥ 1 (the new trap entry)
- [ ] `python3 checks/audit-record.py --self-test` → `SELF-TEST OK (16 cases)`
- [ ] `python3 checks/audit-record.py` → `OK: N records audited` (exit 0)
- [ ] `python3 checks/validate.py` → OK
- [ ] Only `CONTRIBUTING.md` and `evals/README.md` modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- `CONTRIBUTING.md` or `evals/README.md` differ from the "Current state" excerpts
  (drift) — the insertion points may have moved.
- The real-corpus audit (`python3 checks/audit-record.py`) is still red — the
  record migration (the CMP-1 verdict-line retrofit) has not landed on this branch;
  STOP and report, because this plan documents a guard that assumes the corpus is green.

## Maintenance notes

- This is a process guard, not a mechanical one. The stronger long-term fix is a
  PostToolUse hook that runs `audit-record.py` over the real corpus on any
  `docs/decisions/*` or `checks/audit-record.py` edit (noted hook-ready in
  `checks/README.md`); wire it when hooks are turned on.
- If a future check scans product source (e.g. `a11y-static`, `token-audit`), the
  same rule applies — run it over a real product tree before merge, not only its
  fixtures. The CONTRIBUTING wording is deliberately general ("any `checks/*` that
  scans an existing corpus").
