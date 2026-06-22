# Plan 041: Build `checks/reaudit-scope` — list the shipped surfaces a new/changed control affects

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **A read-only query tool, not a gate.** It answers "which decision records should I
> re-audit now that control X changed?" — it never edits anything. Pure stdlib + `yaml`,
> embedded `--self-test`.
>
> **Drift check (run first)**: `git diff --stat 7629f00..HEAD -- harness/checks/audit-record.py harness/standards/catalog.yaml harness/docs/decisions/TEMPLATE.md harness/CONTRIBUTING.md`
> If `audit-record.py` (the section-parsing model) or the catalog `meta.categories` changed
> materially, compare against "Current state" before building; on a mismatch, STOP.

## Status

- **Priority**: P3 (reliability: when a control is added or tightened, already-shipped surfaces
  are "silently non-compliant until re-audited" — but there is **no tool that lists which
  surfaces are affected**, so the re-audit set is reconstructed from memory)
- **Effort**: M
- **Risk**: LOW — a read-only query over the catalog + decision records; no mutation, no gate.
- **Depends on**: none. (Complements the catalog ratchet documented in `CONTRIBUTING.md`.)
- **Category**: dx (tooling)
- **Planned at**: commit `7629f00`, 2026-06-22

## Why this matters

The harness ratchet adds/tightens controls over time. `tfx-design-ui`'s "catalog update re-audit"
guidance and `CONTRIBUTING.md` both say a new control means already-shipped surfaces are silently
out of date "until re-audited" — and the re-audit set is "which already-shipped surfaces the new
control affects." But there is **no mechanism to compute that set**: today a maintainer must
remember which pages touched, say, colour when a new `COL` control lands. As the corpus of
decision records grows, that becomes unreliable, and surfaces get missed. `reaudit-scope` reads
the decision records' "Controls in scope" sections + the catalog's category map and, given a
changed/new control id, prints the records that (a) already list that control, or (b) list any
control in the same **category** (the domain the new control most likely affects). It turns the
re-audit set from a memory exercise into a command.

## Current state

- `standards/catalog.yaml` — `meta.categories` maps each id prefix to a category name (the website
  derives categories from it; `validate.py` step 5b enforces it). Each control's category =
  `meta.categories[id.split("-")[0]]`.
- `docs/decisions/*.md` — each record has a "## Controls in scope" section listing catalog ids by
  id (see `TEMPLATE.md` lines 34–38, e.g. `attendance.md`). The `PASSING_RECORD` example in
  `audit-record.py` (line 316) shows the format: `A11Y-1, A11Y-2, TOK-1, CMP-3.`
- `audit-record.py` — `split_sections()` / `find_section()` (lines 51–81) parse `## ` sections;
  reuse them (copy or import) to extract "Controls in scope". `XREF`-style id regex:
  `\b([A-Z0-9]+-\d+)\b`.
- `CONTRIBUTING.md` — the ratchet-PR workflow; it references the "re-audit set" concept. This tool
  operationalizes it (link it from CONTRIBUTING in Step 4).
- Models for shape: `audit-record.py` (`--repo-root`, `default_records`, `run_self_test`, `main`).

### Repo conventions to honour

- Pure stdlib + `yaml`. Embedded `--self-test` printing `SELF-TEST OK (N cases)`.
- `--repo-root` flag so it can scan a consumer repo's `docs/decisions/`.
- It's a **query** tool. Exit codes: **exit 0** when the query runs — *including when the result
  set is empty* (an empty re-audit set is a valid answer, not an error). **Exit 1** only on a
  usage error: the control id (or `--category`) is not in the catalog, or the records dir is
  missing. (So "no records matched" = exit 0; "you asked about a control that doesn't exist" =
  exit 1.)

## Commands you will need

| Purpose | Command (from `harness/`) | Expected on success |
|---------|---------|---------------------|
| Self-test | `python3 checks/reaudit-scope.py --self-test` | `SELF-TEST OK (N cases)`, exit 0 |
| Query by control | `python3 checks/reaudit-scope.py COL-2` | lists affected records (direct + same-category), exit 0 |
| Query by category | `python3 checks/reaudit-scope.py --category COL` | lists records touching any COL control, exit 0 |
| Validator unaffected | `python3 checks/validate.py` | `OK: <n> controls valid` (unchanged) |

## Scope

**In scope** (create/modify):
- `checks/reaudit-scope.py` (create) — the query tool with embedded self-test.
- `checks/README.md` — add a "Reaudit scope (built)" section.
- `harness/CONTRIBUTING.md` — one line in the ratchet workflow pointing at the tool for computing
  the re-audit set.

**Out of scope** (do NOT touch):
- The catalog, control detail files, decision records (read-only).
- Any gate/CI wiring — this is an on-demand query, not a build gate.
- Inferring affected surfaces in the **product repo's code** (it reasons over decision records,
  the harness's record of shipped surfaces — not a live code scan). Document this limit.

## Git workflow

- Branch: `advisor/041-reaudit-scope`. Conventional commits
  (`feat(checks): add reaudit-scope.py — compute the re-audit set for a changed control`). Do NOT
  push.

## Steps

### Step 1: Build the query

In `checks/reaudit-scope.py`:
- `catalog_categories() -> dict[id, category]` — parse `standards/catalog.yaml` (resolve relative
  to `__file__` like the siblings); for each control, `category = meta.categories[prefix]`.
- `record_controls(records_dir) -> dict[record_path, set[id]]` — for each `docs/decisions/*.md`
  (skip TEMPLATE.md), `find_section(..., "Controls in scope")`, regex all control ids in it.
- `affected_records(target_id_or_category, ...) -> {direct: [...], same_category: [...]}`:
  - `direct` = records whose in-scope set contains the target id (for a *changed* control: these
    explicitly used it and must be re-checked against the new clause).
  - `same_category` = records whose in-scope set contains **any** control sharing the target's
    category (for a *new* control: these surfaces are in the affected domain). Exclude records
    already in `direct`.
  - If invoked with `--category X`, treat every control with category X as the target set.
- `main()` — arg is a control id (e.g. `COL-2`) or `--category <name>`; print a short report:
  the target, its category, the `direct` records, the `same_category` records, and a one-line
  summary ("N records to re-audit"). Honest framing in the output: "same-category records are
  *candidates* — confirm each actually uses the affected pattern."

### Step 2: Embedded self-test

`run_self_test()` with `tempfile` records (temp `docs/decisions/*.md` with synthetic "Controls in
scope" sections) + the real catalog for the category map (read-only). Cases:
- a target id directly listed in one record → that record in `direct`.
- a record listing a different control of the **same category** → in `same_category`, not `direct`.
- a record listing only unrelated-category controls → in neither.
- `--category` mode returns all records touching that category.
- an unknown control id → usage error, exit 1 (not a silent empty result).
- a target whose `same_category` set is non-empty → the rendered output **contains the word
  "candidate"** (assert on the output string, not just the data structure) so the honest framing
  can't silently regress.
- a valid target with no matching records → exit 0 (empty result is not an error).
- TEMPLATE.md excluded.

Print `SELF-TEST OK (N cases)` / exit 0.

**Verify**: `python3 checks/reaudit-scope.py --self-test` → `SELF-TEST OK (N cases)`;
`python3 checks/reaudit-scope.py COL-2` prints a plausible affected set over the real records.

### Step 3: Document + link from CONTRIBUTING

- `checks/README.md` — "Reaudit scope (built)" section: what it computes (direct + same-category
  re-audit candidates from decision records), the honest limit (it reasons over *recorded*
  surfaces, not live product code), and the `**Self-test:**` line.
- `harness/CONTRIBUTING.md` — in the ratchet workflow's re-audit-set step, add: "compute the
  candidate re-audit set with `python3 checks/reaudit-scope.py <new-control-id>`."

**Verify**: `python3 checks/validate.py` → `OK` (unchanged); `claude plugin validate .` passes;
`git status` shows only in-scope files.

## Test plan

- Embedded `--self-test` (Step 2) — direct, same-category, none, `--category`, unknown-id, and
  TEMPLATE-excluded cases.
- Run over the real records for a known control (e.g. `COL-2`, `A11Y-1`) and sanity-check the
  output names real records.
- Verification: `--self-test` → `SELF-TEST OK (N cases)`.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `python3 checks/reaudit-scope.py --self-test` → `SELF-TEST OK (N cases)`, exit 0
- [ ] `python3 checks/reaudit-scope.py COL-2` lists direct + same-category records, exit 0
- [ ] `--category COL` mode works; an unknown control id exits 1 with a usage error (not silent)
- [ ] Output honestly frames same-category records as *candidates* to confirm
- [ ] Stdlib + `yaml` only; reads catalog + records read-only (no mutation)
- [ ] `checks/README.md` + `CONTRIBUTING.md` document/link it; `python3 checks/validate.py` → `OK`; `claude plugin validate .` passes
- [ ] Only in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- A decision record's "Controls in scope" section format differs materially from `TEMPLATE.md` /
  the `audit-record` example (drift) — re-read and match the live parsing expectations.
- The catalog `meta.categories` map is missing a prefix the records reference (validate.py would
  already fail) — STOP and report rather than guessing a category.

## Maintenance notes

- This reasons over **recorded** surfaces (decision records), which is the harness's ledger of
  what shipped — it does not scan the product repo's live code. When the records are complete, the
  re-audit set is complete; when records are missing, so is the set. Keep records current.
- Natural extension (not in this plan): accept a catalog *diff* (two SHAs) and compute the union of
  re-audit sets for every added/changed control automatically — pairs well with the ratchet PR.
- A reviewer should confirm the same-category set is framed as candidates (not a hard "these are
  non-compliant" claim) and that an unknown id fails loudly rather than returning an empty set.
