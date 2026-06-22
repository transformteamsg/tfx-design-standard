# Plan 040: Build `checks/waiver-reconcile` — inline `tfx-waive` ↔ decision-record waiver tables ↔ catalog tiers

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **New self-tested check; no catalog change.** Pure stdlib, modeled on
> `checks/a11y-static.py` (scanning) + `checks/audit-record.py` (table parsing). The bar is
> honesty about what it can and cannot reconcile (only what it scans).
>
> **Drift check (run first)**: `git diff --stat 7629f00..HEAD -- harness/checks/a11y-static.py harness/checks/audit-record.py harness/standards/catalog.yaml harness/docs/decisions/TEMPLATE.md harness/checks/README.md`
> If `a11y-static.py`/`audit-record.py` (the models) changed materially, compare against "Current
> state" before building; on a mismatch, STOP.

## Status

- **Priority**: P3 (reliability: waivers are split across inline `tfx-waive` code comments and
  decision-record tables with **no reconciliation** — an inline waiver can lack a recorded
  approver, a recorded waiver can go stale, and an L0 can be waived inline undetected)
- **Effort**: M
- **Risk**: MED — a new cross-cutting check reading source + records + catalog; conservative
  flagging + honest scope keep false positives down.
- **Depends on**: none. Coordinate with **039** only if both touch `audit-record.py` (this plan
  builds a *separate* file, so normally independent).
- **Category**: dx (deterministic check)
- **Planned at**: commit `7629f00`, 2026-06-22

## Why this matters

Waivers live in two places with no link between them:
- **inline**, as `tfx-waive <CTL-ID> reason="..."` comments in code/CSS (the syntax CLAUDE.md and
  `token-audit.py` define; `token-audit` flags an inline TOK/COL waiver as `[waiver-claimed]` and
  still exits 1, leaving the human to "close the decision-record loop" — but nothing checks they
  did);
- in the **decision record**, as a "## Waivers granted" table row with a named approver
  (`audit-record.py` checks the row has an approver and isn't L0, but only *within* one record).

Nothing reconciles the two. So three failure modes ship silently: (1) an inline `tfx-waive` with
**no matching recorded waiver** (claimed in code, never approved in a record); (2) a recorded
waiver that's **stale** (no inline usage anymore); (3) an inline waiver on an **L0** control
(never allowed) that `token-audit` won't catch for non-TOK/COL controls. `waiver-reconcile` scans
the source tree + the records + the catalog and flags all three — closing the loop the harness
currently leaves to memory.

## Current state

- **Inline waiver syntax** (CLAUDE.md "Always-on rules"; `checks/README.md` line 102–105):
  `tfx-waive <CTL-ID> reason="..."`. `token-audit.py` already matches `tfx-waive TOK-…`/`COL-…`
  inline and downgrades to `[waiver-claimed]` (still exit 1) — this plan generalizes detection to
  **all** control prefixes and reconciles against records.
- **Decision-record waiver table** (`TEMPLATE.md` "## Waivers granted", lines 40–47):
  `| Control | Tier | Reason | Approver | Where recorded |`, with the note "L0 controls are never
  waivable. L1 waivers need a named human approver." `audit-record.py`'s `parse_table_rows()` /
  `column_index()` (lines 84–112) parse exactly this table — **reuse that logic** (copy the two
  helpers, or import them).
- **Catalog tiers** — `standards/catalog.yaml`; resolve it relative to the check like
  `validate.py` does (`os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
  "standards", "catalog.yaml")`), parse with `yaml`, build `id → tier`. (4 L0 controls today:
  A11Y-1/2/3, CMP-2.)
- **Models**: `a11y-static.py` (`TARGET_EXTENSIONS`, `scan_paths`, comment stripping,
  `check_file`, `run_self_test`, `main`); `audit-record.py` (`parse_table_rows`, `column_index`,
  `default_records`, `--repo-root`).
- **Decision records** live in `docs/decisions/*.md` (real set: `attendance.md`, `grade-entry.md`,
  `student-notes-empty-state.md`, `self-audit.md`).

### Repo conventions to honour

- Pure stdlib + `yaml` (already a dep). Output `ERROR <file>:<line> [<CTL>] <msg>` /
  `NOTE …` like the siblings; exit 0 clean / 1 on ERROR (NOTE alone stays 0). Embedded
  `--self-test` printing `SELF-TEST OK (N cases)`.
- `--repo-root` flag (like `audit-record.py`) so it can run against a consumer repo (inline
  waivers live in the product code; records may be in the product repo's `docs/decisions/`).

## Commands you will need

| Purpose | Command (from `harness/`) | Expected on success |
|---------|---------|---------------------|
| Self-test | `python3 checks/waiver-reconcile.py --self-test` | `SELF-TEST OK (N cases)`, exit 0 |
| Reconcile a tree | `python3 checks/waiver-reconcile.py --src ../app --records docs/decisions` | exit 0, or ERROR/NOTE lines |
| Validator unaffected | `python3 checks/validate.py` | `OK: <n> controls valid` (unchanged) |

## Scope

**In scope** (create/modify):
- `checks/waiver-reconcile.py` (create) — the reconciler with embedded self-test.
- `checks/README.md` — add a "Waiver reconcile" built section (scope + honest limits + self-test).
- `harness/CLAUDE.md` — add `waiver-reconcile.py` to the "Built `checks/` scripts" bullet.

**Out of scope** (do NOT touch):
- The catalog, control detail files, `schema.json`, control tiers.
- `token-audit.py` / `audit-record.py` — copy the small helpers you need (or import), do not
  rewrite them. (If importing `parse_table_rows` from `audit-record`, do it without triggering its
  `main`.)
- The records' content — this check reads them; it does not edit them.
- Prebuild/hook wiring — deferred until calibrated (like plan 007).

## Git workflow

- Branch: `advisor/040-waiver-reconcile`. Conventional commits
  (`feat(checks): add waiver-reconcile.py — inline tfx-waive ↔ record reconciliation`). Do NOT push.

## Steps

### Step 1: Collect the three inputs

In `checks/waiver-reconcile.py`:
- `find_inline_waivers(src_paths) -> list[(file, line, ctl_id, reason)]` — walk `src_paths`
  (`TARGET_EXTENSIONS` from `a11y-static.py`), strip comments-context optional (inline waivers
  ARE comments, so do NOT strip them — match them directly), regex
  `tfx-waive\s+([A-Z0-9]+-\d+)(?:\s+reason="([^"]*)")?`. Record each occurrence.
- `find_recorded_waivers(records_dir) -> list[(record, ctl_id, tier, approver)]` — for each
  `docs/decisions/*.md` (skip TEMPLATE.md), find the "Waivers granted" section and parse its table
  with the copied `parse_table_rows`/`column_index`; collect non-placeholder rows (a row with a
  control id in column 0).
- `catalog_tiers() -> dict[id, tier]` — parse `standards/catalog.yaml`.

### Step 2: Reconcile + emit

- **L0 inline waiver** (any prefix): for each inline waiver whose `catalog_tiers[id] == "L0"` →
  `ERROR <file>:<line> [<id>] inline tfx-waive on an L0 control — L0 is never waivable`.
- **Orphan inline waiver**: an inline `tfx-waive <id>` with **no** recorded waiver row for `<id>`
  in any scanned record → `ERROR <file>:<line> [<id>] inline waiver has no recorded waiver row
  (named approver) — add it to a decision record`. (L1/L2 only; L0 already errored above.)
- **Stale recorded waiver**: a recorded waiver row for `<id>` with **no** inline `tfx-waive <id>`
  in the scanned source → `NOTE <record> [<id>] recorded waiver has no inline usage in the scanned
  source — confirm it is still needed`. (NOTE, not ERROR — the source set scanned may be partial.)
- **Unknown control id** in an inline waiver (`id` not in the catalog) →
  `ERROR <file>:<line> [<id>] tfx-waive references an unknown control id`.
- **Honest scope** — put this in the script's **module docstring** (a "What this does NOT verify"
  section, exactly like `a11y-static.py`'s and `audit-record.py`'s module docstrings — code, not
  just the README): waivers in files/records outside the scanned paths; whether the recorded
  *reason* actually justifies the inline usage (judgment); L2-waiver rationale quality. The
  reconciliation is only as complete as the `--src`/`--records` paths given.
- Exit 1 if any ERROR; 0 if only NOTEs/clean.

### Step 3: Embedded self-test

`run_self_test()` with `tempfile` fixtures (temp source files + temp record files + a temp/real
catalog — for the catalog, you may read the **real** `standards/catalog.yaml` for tiers, like
`audit-record`'s assertion-7 reads real paths; keep it read-only). Cases:
- inline `tfx-waive A11Y-1` (L0) → `[A11Y-1]` L0 error.
- inline `tfx-waive TOK-1` with a matching record row → clean (reconciled).
- inline `tfx-waive TOK-1` with **no** record row → orphan ERROR.
- a record row for `TOK-2` with no inline usage → stale NOTE (exit still 0 if that's the only
  finding).
- inline `tfx-waive ZZZ-9` (unknown id) → unknown-id ERROR; assert the run exits **1** (any ERROR
  ⇒ exit 1).
- a placeholder/empty record row → ignored (no false stale NOTE).

Print `SELF-TEST OK (N cases)` / exit 0.

**Verify**: `python3 checks/waiver-reconcile.py --self-test` → `SELF-TEST OK (N cases)`;
`python3 checks/waiver-reconcile.py --src ../app --records docs/decisions` runs with no traceback.

### Step 4: Document + reconcile the README/CLAUDE list

- `checks/README.md` — "Waiver reconcile (built)" section: what it reconciles (inline ↔ record ↔
  catalog tier), the ERROR vs NOTE distinction, the honest non-coverage, and the `**Self-test:**`
  line.
- `harness/CLAUDE.md` — add `waiver-reconcile.py` to the built-scripts bullet.

**Verify**: `python3 checks/validate.py` → `OK` (unchanged); `claude plugin validate .` passes;
`git status` shows only in-scope files.

## Test plan

- Embedded `--self-test` (Step 3) — L0, orphan, stale, unknown-id, reconciled, placeholder cases.
- Run over the real repo (`--src ../app ../components`, `--records docs/decisions`) — report
  genuine findings; do not silence a real orphan/L0 to make it green.
- Verification: `--self-test` → `SELF-TEST OK (N cases)`.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `python3 checks/waiver-reconcile.py --self-test` → `SELF-TEST OK (N cases)`, exit 0
- [ ] An inline `tfx-waive` on an L0 control is flagged ERROR; an orphan inline waiver is flagged; a stale recorded waiver is a NOTE
- [ ] An unknown control id in a `tfx-waive` is flagged; a placeholder record row produces no false NOTE
- [ ] Runs over `../app` + `docs/decisions` with no traceback (exit 0 or genuine ERROR/NOTE)
- [ ] Stdlib + `yaml` only (`grep -nE "^import |^from " checks/waiver-reconcile.py`)
- [ ] `checks/README.md` + `CLAUDE.md` document it; `python3 checks/validate.py` → `OK`; `claude plugin validate .` passes
- [ ] Only in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- The decision-record waiver table format differs materially from `TEMPLATE.md` / `audit-record`'s
  parser (drift) — re-read and match the live `parse_table_rows` expectations.
- You cannot tell whether a recorded waiver is "stale" without scanning the whole product repo —
  keep it a NOTE (not ERROR) and document that completeness depends on the `--src` paths given.
- The check would need to judge whether a reason *justifies* a waiver — that is out of scope
  (judgment); only reconcile presence/approver/tier.

## Maintenance notes

- This closes the loop `token-audit.py` leaves open ("a human closes the decision-record loop") —
  but only for the scanned paths; run it with the same `--src` breadth as the other checks.
- As the verification ledger (plan 039) lands, a waiver and its ledger row should agree — a future
  enhancement could cross-check them; not in this plan.
- A reviewer should focus on the **stale = NOTE, orphan/L0 = ERROR** distinction (a partial source
  scan must not turn a stale NOTE into a false ERROR) and the honest non-coverage docstring.
