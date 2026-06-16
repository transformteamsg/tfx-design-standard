# Plan 017: Ship TEMPLATE.md to the consumer repo and make `audit-record` audit the consumer's records

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a8ca4fa..HEAD -- harness/checks/audit-record.py harness/.claude/skills/tfx-design-ui/SKILL.md harness/docs/decisions/TEMPLATE.md`.
> If `audit-record.py`, the design-ui record step, or TEMPLATE.md changed since
> this plan was written, compare the "Current state" excerpts against the live
> files; on a mismatch, treat it as a STOP condition. All paths below are
> relative to the harness root (`harness/` in the dev repo; the plugin root when
> installed).

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: LOW (a CLI flag with a backward-compatible default + a skill-prose step; the 14-case self-test is the guardrail)
- **Depends on**: none (sequence before plan 019, which also edits `audit-record.py`)
- **Category**: dx
- **Planned at**: commit `a8ca4fa`, 2026-06-15

## Why this matters

The harness ships `docs/decisions/TEMPLATE.md` **inside the plugin**, with
headings that match `audit-record.py`'s required sections. But a consumer
(product) repo has no `docs/decisions/TEMPLATE.md`, and the design-ui skill
points builders at that bare repo path — so builders improvise records that fail
the audit (a prior `student-analytics.md` failed `audit-record`; `students.md`
only passed after a retrofit). Worse, `audit-record.py` computes `REPO_ROOT` from
its own file location, so when shipped as a plugin it audits the **harness's**
records, not the consumer's — the team's own process check cannot even see the
records it exists to grade. Two fixes: (a) the skill copies TEMPLATE.md from the
plugin into the consumer's `docs/decisions/` on first run (resolving the plugin
path the way the catalog already is), and (b) `audit-record.py` accepts the
consumer repo root so it can audit consumer records and resolve their referenced
paths.

## Current state

- `docs/decisions/TEMPLATE.md` exists in the harness; its `## ` headings —
  *Sprint contract (done-criteria)*, *Tradeoffs, named*, *Controls in scope*,
  *Waivers granted*, *Plan approval*, *Verify verdict*, *Ratchet* — match
  `audit-record.py`'s `REQUIRED_SECTIONS` (substring-tolerant). **Its content is
  correct; do not rewrite it.**
- `checks/audit-record.py:30-31` (verbatim):
  ```python
  REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
  DECISIONS_DIR = os.path.join(REPO_ROOT, "docs", "decisions")
  ```
  So default targets are the HARNESS's `docs/decisions/`, not the consumer's.
- `checks/audit-record.py:114` — `audit_record(text, name, repo_root)` **already
  takes a `repo_root` parameter**; the referenced-path check uses it
  (`:202-206`: `os.path.join(repo_root, ref_clean)`). The signature is ready; only
  the callers hard-code the harness `REPO_ROOT`.
- `checks/audit-record.py:219-239` — `audit_file(path)` resolves `abs_path`,
  computes `rel` relative to `REPO_ROOT`, then calls
  `audit_record(text, rel, REPO_ROOT)`.
- `checks/audit-record.py:242-250` — `default_records()` lists
  `DECISIONS_DIR/*.md` except `TEMPLATE.md`.
- `checks/audit-record.py:476-497` — `main()`: `paths = args if args else
  default_records()`; loops `audit_file`. It accepts explicit record paths but
  always roots path checks at the harness `REPO_ROOT`.
- `checks/audit-record.py:312-471` — `run_self_test()` audits in-memory strings
  via `audit_record(text, name, REPO_ROOT)`; `PASSING_RECORD` references
  `docs/decisions/TEMPLATE.md`, which exists under the harness `REPO_ROOT`. So as
  long as the repo-root **default stays the harness root**, all 14 cases remain
  green.
- `.claude/skills/tfx-design-ui/SKILL.md:172-176` (verbatim): *"Write the
  approved plan to a decision record (`docs/decisions/<page>.md`, template in
  `docs/decisions/TEMPLATE.md`) before implementing"* — this bare path does not
  exist in a consumer repo.
- `.claude/skills/tfx-design-ui/SKILL.md:26-31` — the established
  plugin-path-resolution idiom for the catalog: *"resolve it relative to this
  SKILL.md file, three levels up: `<this-skill-dir>/../../../standards/catalog.yaml`"*.
  TEMPLATE.md is at `<this-skill-dir>/../../../docs/decisions/TEMPLATE.md`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Self-test (after change) | `python3 checks/audit-record.py --self-test` | `SELF-TEST OK (14 cases)` |
| Default (harness) audit still works | `python3 checks/audit-record.py` | `OK: N records audited` (unchanged behaviour) |
| Repo-root flag parses | `python3 checks/audit-record.py --repo-root . docs/decisions/attendance.md` | audits that record against repo root `.` |
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` (from harness root) |
| Skill step present | `grep -c "first run\|copy.*TEMPLATE" .claude/skills/tfx-design-ui/SKILL.md` | ≥ 1 |

## Scope

**In scope** (the only files you modify):
- `checks/audit-record.py` — add a `--repo-root <path>` flag threaded through
  `main()` → `default_records()` → `audit_file()` → `audit_record()`; default
  unchanged (harness `REPO_ROOT`).
- `.claude/skills/tfx-design-ui/SKILL.md` — update the Phase-3 record step
  (`:172-176`) with the first-run template-copy instruction and the
  plugin-relative source path.
- `checks/README.md` — one line in the audit-record entry noting `--repo-root`
  targets a consumer repo (optional, if cheap).

**Out of scope** (do NOT touch):
- `docs/decisions/TEMPLATE.md` **content** — it already conforms to the auditor.
  (Plan 018 adds a single dark-mode field line; leave that to 018.)
- The other check scripts and the catalog.
- The CMP-1 verdict-vocabulary assertion in `audit-record.py` — that is plan
  019's edit to the same file; do not pre-empt it.

## Git workflow

- Branch: `advisor/017-template-shipping`. Conventional commits
  (`fix: audit-record --repo-root + ship TEMPLATE.md to consumer repos`). Do NOT
  push.

## Steps

### Step 1: Add a backward-compatible `--repo-root` to `audit-record.py`

In `main()`, parse an optional `--repo-root <path>` from `argv` (default: the
existing module-level `REPO_ROOT`). Compute `decisions_dir =
os.path.join(repo_root, "docs", "decisions")` and use it in `default_records()`
(pass `repo_root`/`decisions_dir` as a parameter rather than reading the global).
In `audit_file(path, repo_root)`, compute `rel` relative to the chosen
`repo_root` and call `audit_record(text, rel, repo_root)`. The module-level
constants stay as the defaults so nothing changes when the flag is absent.

**Verify**: `python3 checks/audit-record.py --self-test` → `SELF-TEST OK (14
cases)` (default path unchanged); `python3 checks/audit-record.py --repo-root .
docs/decisions/attendance.md` runs and roots referenced-`docs/` path checks at
`.`.

### Step 2: Make the design-ui record step ship the template to the consumer

In `.claude/skills/tfx-design-ui/SKILL.md`, replace the bare-path sentence at
`:172-176` so it reads (in substance):

```markdown
Write the approved plan to a decision record at `docs/decisions/<page>.md` in
the **product repo**. If `docs/decisions/TEMPLATE.md` does not yet exist there,
copy it from the plugin first — it ships at
`<this-skill-dir>/../../../docs/decisions/TEMPLATE.md` (resolved the same way as
the catalog in the Load-first note) — so records conform to `audit-record.py` by
default. Base the new record on that template.
```

**Verify**: `grep -c "TEMPLATE.md" .claude/skills/tfx-design-ui/SKILL.md` ≥ 1 and
the plugin-relative path string is present (`grep -c "three levels up\|../../../docs/decisions/TEMPLATE.md"`).

### Step 3: Note the flag in the checks README (optional)

In `checks/README.md`, in the audit-record entry, add: "Pass `--repo-root <path>`
to audit a consumer repo's `docs/decisions/` (the default roots at the harness)."

**Verify**: `grep -c "repo-root" checks/README.md` ≥ 1.

## Test plan

The embedded 14-case self-test is the test surface (no framework):
- all 14 existing cases stay green with the flag absent (default = harness root);
- a manual run with `--repo-root .` against an existing harness record
  (`docs/decisions/attendance.md`) audits it and resolves its `docs/` references
  against `.` — confirm no spurious "referenced path does not exist".

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `python3 checks/audit-record.py --self-test` → `SELF-TEST OK (14 cases)`
- [ ] `python3 checks/audit-record.py` (no args) → `OK: N records audited` (unchanged default behaviour)
- [ ] `python3 checks/audit-record.py --repo-root . docs/decisions/attendance.md` runs without a spurious missing-path error
- [ ] The design-ui record step names the plugin-relative TEMPLATE.md path and the first-run copy
- [ ] `claude plugin validate .` passes
- [ ] Only in-scope files modified (`git status`); `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- Any of the 14 self-test cases goes red — the repo-root default was not kept
  backward-compatible; revert and report.
- `audit-record.py` or the cited SKILL.md lines differ from the "Current state"
  excerpts (drift).
- Threading `repo_root` would require changing `audit_record`'s signature — it
  already takes the parameter, so if you think it doesn't, you are looking at a
  drifted file; STOP.

## Maintenance notes

- Plan 019 adds a CMP-1 verdict-vocabulary assertion to this same
  `audit-record.py`; sequence 017 before 019, or rebase 019 onto it.
- Plan 018 adds a single dark-mode field to `TEMPLATE.md`; that is the only other
  edit to the template — keep the two changes from colliding.
- If a consumer repo vendors its own copy of the checks, the `--repo-root` flag
  is what lets a CI job in that repo audit its own records; document it in the
  team onboarding guide (`docs/ONBOARDING.md`) when that guide is next revised.
