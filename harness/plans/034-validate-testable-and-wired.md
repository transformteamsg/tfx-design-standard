# Plan 034: Make `checks/validate.py` testable (`main()` + `--self-test`) and wire it into the build

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **This plan is a pure refactor + wiring change — it must NOT change what
> `validate.py` flags.** The existing validation logic is preserved byte-for-byte;
> you only move it under functions, add a `--self-test`, and add the script to the
> build. A real catalog that passes today must still pass, and a broken one must
> still fail with the identical message.
>
> **Drift check (run first)**: `git diff --stat 7629f00..HEAD -- harness/checks/validate.py harness/checks/a11y-static.py package.json harness/checks/README.md`
> Paths are from the repo/worktree root. If `validate.py` changed materially, compare
> against the "Current state" excerpts before refactoring; on a mismatch, STOP.

## Status

- **Priority**: P1 (foundation — plan 035's new sub-checks cannot be added until
  `validate.py` has a testable shape; and the validator is currently absent from the
  build, so catalog drift does not fail CI)
- **Effort**: M
- **Risk**: LOW (mechanical refactor of working code + one prebuild line) — the risk is
  *behaviour change by accident*, which the "logic preserved byte-for-byte" rule and the
  before/after parity check guard against
- **Depends on**: none. **Blocks**: plan 035 (adds sub-checks into the refactored shape).
- **Category**: dx (governance-critical check)
- **Planned at**: commit `7629f00`, 2026-06-22

## Why this matters

`checks/validate.py` is the harness's verification baseline (`checks/README.md:10`: "run it
before committing any `standards/` change"), yet two reliability gaps undercut it:

1. **It has no `--self-test` and no `main()`** — it runs **eagerly at module import** (all
   logic is top-level code, lines ~62–311). Every other built check (`a11y-static.py`,
   `token-audit.py`, `audit-record.py`, `component-manifest.py`) has an embedded
   `run_self_test()` printing `SELF-TEST OK (N cases)` and a `main()` dispatch. `validate.py`
   is the one governance-critical check with no test of its own logic — so a future edit to
   it (e.g. plan 035's sub-checks) can silently break detection with nothing to catch it.
2. **It is not wired into the build.** `package.json` `prebuild` runs `check-standards.mjs`,
   `token-audit.py`, and `a11y-static.py` — **not** `validate.py`. So a catalog that drifts
   (a tier/waiver mismatch, a detail-file/frontmatter divergence, an unknown control ID in a
   skill) does **not** fail `pnpm build`; it is caught only if a human remembers to run the
   validator by hand.

This plan fixes both: refactor `validate.py` into testable functions with a `--self-test`
(mirroring `a11y-static.py`), then add it to `prebuild`. It is the prerequisite for plan 035,
which adds the L0-list and SLP-9 parity sub-checks into the refactored shape.

## Current state

- `harness/checks/validate.py` (the file to refactor) — **runs at import**. Shape today:
  - Module top (lines ~17–60): imports; `REPO_ROOT`/`CATALOG_PATH`/`CONTROLS_DIR`/
    `CROSS_REF_FILES`/`SKILLS_DIR`/`AGENTS_DIR`/`CATALOG_CHANGES_DIR` path constants;
    `SCHEMA = json.load(...)` read **eagerly** from `standards/schema.json` (lines 47–48);
    the derived `REQUIRED_FIELDS`/`TIER_WAIVER`/`ALLOWED_*`/`CONTROL_ID_RE`/`XREF_RE`.
  - `errors = []` (line 62) — a **module-global** accumulator; `err(location, message)`
    (lines 65–66) appends to it.
  - Steps 1–7 are **top-level statements** that execute on import:
    - Step 1 (lines ~70–95): parse the catalog; on fatal errors `print` + `sys.exit(1)`.
    - Steps 2–5 (lines ~97–171): per-control loop populating `seen_ids` / `catalog_by_id`.
    - Step 5b (lines ~173–181): `meta.categories` covers every prefix.
    - Step 6 (lines ~183–264): reverse check over `standards/controls/*.md` frontmatter.
    - Step 7 (lines ~266–302): cross-reference sweep over `CROSS_REF_FILES` + globbed
      skills/agents/catalog-changes; `XREF_RE` finds control IDs; unknown ones `err()`.
    - Output (lines ~304–311): if `errors`, print them + `sys.exit(1)`; else
      `print(f"OK: {len(catalog_by_id)} controls valid")` + `sys.exit(0)`.
  - **There is no `def main()`, no `run_self_test()`, and no `if __name__ == "__main__"`.**

- `harness/checks/a11y-static.py` — **the exact structural model to copy** for the refactor:
  - Pure functions return error-string lists (`check_file()` lines ~259–324, `scan_paths()`
    ~327–344) — no module-global mutation.
  - `run_self_test()` (lines ~349–511): defines nested `assert_violations(...)` /
    `assert_clean(...)` helpers that bump a `case_count`, append to a `failures` list, and at
    the end print either `SELF-TEST OK ({case_count} cases)` + `sys.exit(0)` or the failures +
    `SELF-TEST FAILED (...)` + `sys.exit(1)`.
  - `main()` (lines ~516–534): `args = sys.argv[1:]`; empty → usage + exit 1; `--self-test` in
    args → `run_self_test()`; else `scan_paths(args)` → print errors + exit 1, or exit 0.
  - `if __name__ == "__main__": main()` (lines ~537–538).

- `package.json` (line 7) — `prebuild`, verbatim:
  ```
  "prebuild": "node scripts/check-standards.mjs && python3 harness/checks/token-audit.py app components lib && python3 harness/checks/a11y-static.py app components",
  ```
  Note these paths are **from the website/worktree root** (`harness/checks/...`), unlike the
  in-`harness/` invocation `python3 checks/validate.py`.

- `harness/checks/README.md:8–10` — the "Validator (built)" section. It does **not** mention a
  self-test (every other built check's section ends with a `**Self-test:**` line). Add one.

### Repo conventions to honour

- Pure standard-library Python 3 + the existing `import yaml` (already a dependency). No new
  third-party imports.
- Output format unchanged: `ERROR <location>: <message>` lines, `OK: <n> controls valid` on
  success, exit 0 clean / 1 on violations.
- Self-test prints `SELF-TEST OK (N cases)` and exits 0; `SELF-TEST FAILED (...)` and exits 1.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Validator (real catalog) — from `harness/` | `python3 checks/validate.py` | `OK: <n> controls valid`, exit 0 (**same `<n>` as before this plan**) |
| New self-test | `python3 checks/validate.py --self-test` | `SELF-TEST OK (N cases)`, exit 0 |
| Build (now runs the validator) — from repo root | `pnpm build` | prebuild passes incl. validator; `next build` completes |
| Plugin validation — from `harness/` | `claude plugin validate .` | `✔ Validation passed` |

## Scope

**In scope** (create/modify):
- `harness/checks/validate.py` — refactor to functions + `main()` + `run_self_test()` +
  `if __name__` guard. **No logic change.**
- `package.json` — add `validate.py` (and its self-test) to `prebuild`.
- `harness/checks/README.md` — add a `**Self-test:**` line to the "Validator (built)" section.

**Out of scope** (do NOT touch):
- The catalog, control detail files, `schema.json`, or any control's fields — this plan does
  not change *what* is validated, only *how the validator is structured and invoked*.
- The new parity sub-checks (L0 list, SLP-9 buzzwords) — those are **plan 035**, which builds
  on this refactor. Do not add them here.
- The other check scripts' structure.

## Git workflow

- Branch: `advisor/034-validate-testable`. Conventional commits
  (`refactor(checks): make validate.py testable + wire into prebuild`). Do NOT push.

## Steps

### Step 0 (baseline): capture the current validator output

Before changing anything, from `harness/` run `python3 checks/validate.py` and record the exact
final line (e.g. `OK: 40 controls valid`) and exit code. This is the parity oracle: the
refactored validator must print the **identical** line. If it already errors today, record the
full error set instead — STOP and report (a refactor on top of a currently-failing validator
is out of scope).

### Step 1: Move the eager logic into functions (no behaviour change)

Refactor `validate.py` so nothing runs at import. Recommended shape (preserve every check's
logic and message text exactly — you are relocating code, not rewriting it):

- Keep the imports and the regex/`SCHEMA`-derived constants, but make the schema load happen
  **inside** a function (so the self-test can point at a fixture root). Introduce a single
  entry function:
  - `def collect_errors(repo_root) -> list[str]` — does all of Steps 1–7 against `repo_root`,
    using a **local** `errors` list and a local `err(loc, msg)` closure (replacing the
    module-global `errors`/`err`). It computes `catalog_path`, `controls_dir`, the cross-ref
    file list, and loads `schema.json` **from `repo_root`**. For the fatal Step-1 cases
    (catalog missing / unparseable / no `controls`), append the error and `return errors`
    early (instead of the current `print`+`sys.exit`), so callers decide how to exit.
  - Factor the genuinely unit-testable pieces into small **pure** functions that
    `collect_errors` calls, so the self-test can drive them with in-memory inputs:
    - `validate_control(control: dict, idx: int, schema_bits) -> list[str]` — Steps 2–4 for
      one control (required fields, allowed values, tier→waiver, id shape). Returns error
      strings; no I/O.
    - `cross_ref_errors(rel_path: str, text: str, catalog_ids: set) -> list[str]` — Step 7's
      per-file sweep: for each `XREF_RE` match not in `catalog_ids`, an error with the
      computed line number. No I/O (caller reads the file).
  - `def main() -> None` — mirror `a11y-static.py:516`: `args = sys.argv[1:]`;
    `--self-test` → `run_self_test()`; otherwise `errors = collect_errors(REPO_ROOT)` (the
    real root, still derived from `__file__`), then print errors + `sys.exit(1)`, or
    `print(f"OK: {n} controls valid")` + `sys.exit(0)` exactly as today.
  - `if __name__ == "__main__": main()`.

Keep `REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))` for the real CLI
path; pass it into `collect_errors` from `main`.

**Verify**: from `harness/`, `python3 checks/validate.py` prints the **same** final line as
Step 0 (same `<n>`), exit code unchanged. `claude plugin validate .` passes.

### Step 2: Add `run_self_test()` mirroring the sibling checks

Add `run_self_test()` (model: `a11y-static.py:349–511`) with `assert_*` helpers and a
`case_count`/`failures` tally. Cover the validator's own logic with both pure-function unit
cases and a small filesystem integration case:

- **Pure `validate_control` cases** (no temp files):
  - valid L0 control (`tier: L0`, `waiver: none`, valid check/phase/applies_to, well-formed
    id) → no errors.
  - tier→waiver mismatch (`tier: L0`, `waiver: documented`) → an error mentioning the expected
    waiver.
  - invalid tier (`tier: L9`) → an "invalid tier" error.
  - judgment/hybrid control with no `detail` → the "requires a 'detail' file" error (this
    branch lives in the per-control loop; expose it so the self-test can hit it).
  - malformed id (`id: TOK1`) → an id-pattern error.
- **Pure `cross_ref_errors` cases**:
  - text mentioning a known id (e.g. `A11Y-1`, present in `catalog_ids`) → no error.
  - text mentioning an unknown id (`ZZZ-9` — but note `XREF_RE` only matches known *prefixes*;
    use a real-prefix-but-absent id like `A11Y-999`) → one "references unknown control id"
    error with the right line number.
- **One filesystem integration case** for `collect_errors`: write a temp `repo_root` with a
  minimal valid `standards/catalog.yaml` (2–3 controls), a **copy of the real
  `standards/schema.json`** (read it from the real repo and write it into the temp root so the
  allowed-values match), an empty `standards/controls/` dir, and no cross-ref files →
  `collect_errors(tmp_root)` returns `[]`. Then mutate the temp catalog (duplicate an id) →
  returns a "duplicate id" error. Clean up the temp dir.

Print `SELF-TEST OK (N cases)` / exit 0 on success, like the siblings. Aim ~10–14 cases.

**Verify**: `python3 checks/validate.py --self-test` → `SELF-TEST OK (N cases)`, exit 0.

### Step 3: Wire the validator into the build

Edit `package.json` `prebuild` to run the validator (and its self-test, cheap and catches a
broken check) **before** the website-content checks. Keep the existing commands and order
otherwise:

```
"prebuild": "python3 harness/checks/validate.py --self-test && python3 harness/checks/validate.py && node scripts/check-standards.mjs && python3 harness/checks/token-audit.py app components lib && python3 harness/checks/a11y-static.py app components",
```

(Validator paths are `harness/checks/validate.py` — from the repo/worktree root, matching the
other `harness/checks/...` prebuild entries. `validate.py` derives its own `REPO_ROOT` from
`__file__`, so it finds `standards/` regardless of cwd.)

**Verify**: from the repo root, `pnpm build` runs the validator first (you'll see
`SELF-TEST OK (...)` then `OK: <n> controls valid` in the prebuild output) and then completes
`next build`. Temporarily introducing a catalog error (e.g. duplicate an id in a scratch copy —
do **not** commit it) must make `pnpm build` fail at prebuild; revert it.

### Step 4: Document the self-test

In `harness/checks/README.md`, add to the "Validator (built)" section (after line ~10) a line
matching the siblings' style:
`**Self-test:** python3 checks/validate.py --self-test → SELF-TEST OK (N cases).`

**Verify**: `claude plugin validate .` passes; `git status` shows only the three in-scope files.

## Test plan

- The proof of *no behaviour change* is Step 0's parity oracle: the real-catalog output line is
  identical before and after.
- The new tests are the embedded `--self-test` (Step 2), covering the validator's own logic
  classes — these are the first tests `validate.py` has ever had.
- A build-level negative test (Step 3): a deliberately-broken catalog fails `pnpm build`.
- Verification: `python3 checks/validate.py --self-test` → `SELF-TEST OK (N cases)`;
  `python3 checks/validate.py` → unchanged `OK` line.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `python3 checks/validate.py` → the **same** `OK: <n> controls valid` line as Step 0, exit 0
- [ ] `python3 checks/validate.py --self-test` → `SELF-TEST OK (N cases)`, exit 0
- [ ] `validate.py` has `def main()`, `def run_self_test()`, and `if __name__ == "__main__": main()`; nothing runs at import — from `harness/checks/`, `python3 -c "import validate"` prints nothing (the module just imports; `main()` is not called). (`validate.py` has no hyphen, so it imports as `validate`.)
- [ ] `package.json` `prebuild` runs `harness/checks/validate.py` (and `--self-test`); `pnpm build` passes
- [ ] A deliberately-broken catalog makes `pnpm build` fail at prebuild (then reverted)
- [ ] `harness/checks/README.md` "Validator (built)" section has a `**Self-test:**` line
- [ ] No new third-party imports (`grep -nE "^import |^from " checks/validate.py` shows only stdlib + `yaml`)
- [ ] Only in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- The real catalog already fails `validate.py` before your refactor (Step 0) — fix-the-catalog
  is a separate concern; do not refactor on top of a red baseline.
- Making the schema load testable forces a behaviour change you can't avoid (e.g. the real run
  starts flagging something new) — the refactor must be behaviour-preserving; rethink the
  decomposition.
- `a11y-static.py`'s structure differs materially from the "Current state" description (drift)
  — re-read it and match the live shape.

## Maintenance notes

- This refactor is the **seam plan 035 plugs into**: 035 adds `l0_parity_errors(...)` and
  `slp9_parity_errors(...)` as new pure functions called by `collect_errors`, with their own
  self-test cases. Keep `collect_errors` the single integration point.
- If a future check needs the resolved catalog (`catalog_by_id`), have `collect_errors` (or a
  helper it calls) return it alongside the errors rather than re-parsing.
- A reviewer should diff the refactor against the pre-refactor file to confirm **no check's
  message text or condition changed** — the parity oracle (Step 0) is the headline check.
