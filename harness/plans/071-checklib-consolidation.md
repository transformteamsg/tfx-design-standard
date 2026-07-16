# Plan 071: `checklib.py` — one copy of the check-script scaffolding, adopted by all checks

> **Executor instructions**: Follow this plan step by step. Run every verification
> command and confirm the expected result before moving on. If anything in "STOP
> conditions" occurs, stop and report — do not improvise. Do NOT update
> `harness/plans/README.md` — your reviewer maintains the index.
>
> **Drift check (run first)**: `git diff --stat b329c0c..HEAD -- harness/checks`
> Plans 068/069/070 are expected to have landed (068 edits type-scan.py; 069/070 edit
> validate.py). Work from the LIVE files — the duplication pattern below survives
> those plans; STOP only if a named helper no longer exists where stated.

## Status

- **Priority**: P2 · **Effort**: L · **Risk**: MED (touches every check; every self-test must stay green at every step)
- **Depends on**: 068 merged; after 069/070 (same-file churn in validate.py, ordering only)
- **Category**: tech-debt / dx
- **Planned at**: commit `b329c0c`, 2026-07-16

## Why this matters

The 11 check scripts in `harness/checks/` share no library. Each re-implements:
comment stripping (5 copies — hashing the function bodies shows they have ALREADY
drifted into 4 textual variants), `TARGET_EXTENSIONS` + an `os.walk` filter loop
(6-8 copies with TWO different skip policies — most skip only dotfiles and would
descend into `node_modules` if pointed at a repo root; only `component-manifest.py`
skips `{node_modules,.git,.next,dist,out}`), an inline self-test harness with a
hand-counted `SELF-TEST OK (N cases)` line (11 copies), and the
`ERROR <file>:<line> [<CTL>] <found> — suggest: <…>` output format (re-defined per
script, reverse-parsed by `detect.py`'s `_FINDING_RE`). Fixing a comment-stripping
edge case today means 5 edits; writing check #12 means copying ~200 lines before the
first rule. Separately, `harness/checks/fixtures/` (pass/fail files for token-audit
and a11y-static) is read by NO script — dead test assets.

After this plan: one `harness/checks/checklib.py` holds the walker, the comment
stripper, the error formatter, and a self-test runner; all 11 scripts import it (by
path, the repo's existing pattern); the fixtures are exercised by the two owning
self-tests; behaviour is unchanged except where the skip-policy unification is an
explicit, documented improvement.

## Current state

- Duplicated helpers (verify each before touching):
  - `_strip_block_comments` / `_ends_in_block_comment`: `a11y-static.py:126,155`,
    `type-scan.py:~345`, `contrast.py:~358`, `content-lint.py:~493`,
    `token-audit.py:~303`. Variants differ in small ways (docstrings, possibly string
    handling) — Step 1 diffs them.
  - `TARGET_EXTENSIONS = {".css",".html",".jsx",".tsx",".js",".ts",".vue",".svelte"}`:
    `a11y-static.py:70`, `contrast.py:66`, `token-audit.py:52`, `type-scan.py:74`,
    `waiver-reconcile.py:64`, variant in `content-lint.py:72` (different set — it
    scans prose too; keep its own set, share the walker only).
  - Walk loop `dirs[:] = [d for d in dirs if not d.startswith(".")]` + extension
    filter: `a11y-static.py:~334`, `contrast.py:~424`, `token-audit.py:~598`,
    `type-scan.py:~478`, `content-lint.py:~556`, `waiver-reconcile.py:~102`,
    `detect.py:~167`; `component-manifest.py:136-138` uses the stricter skip set.
  - Self-test harnesses: each script defines `assert_violations`/`assert_clean`
    (names vary) + a failures list + `SELF-TEST OK (N cases)` print + `sys.exit`.
- Cross-script import precedent (FOLLOW THIS — `checks/` is not a package, there is no
  `__init__.py`): `waiver-reconcile.py:~80` and `reaudit-scope.py:~74` import
  `audit-record.py` via `importlib.util.spec_from_file_location` with a path relative
  to `__file__`. checklib must be imported the same way.
- `fixtures/token-audit/` and `fixtures/a11y-static/` contain pass/fail `.html`/
  `.tsx`/`.css` files; `grep -rn "fixtures" harness/checks/*.py` → only a docstring
  mention in `component-manifest.py`.
- README hardcodes each script's self-test case count (e.g. "SELF-TEST OK (46
  cases)") — counts will change; update them at the end from live output.
- Consumers that must keep working unchanged: `package.json` prebuild, CI (after plan
  069), `harness/hooks/design-hook.py` → `detect.py`, and the skills' documented
  invocations in `harness/.claude/skills/design/verify.md:6-15`.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| All self-tests | `for f in harness/checks/*.py; do python3 "$f" --self-test; done` | every line `SELF-TEST OK (…)`, exit 0 each |
| Live-tree run (behaviour baseline) | `python3 harness/checks/token-audit.py app components lib && python3 harness/checks/a11y-static.py app components && python3 harness/checks/type-scan.py app components` | exit 0 |
| detect façade | `python3 harness/checks/detect.py --self-test` | OK |
| Full gate | `pnpm build` | exit 0 |

## Scope

**In scope**: `harness/checks/checklib.py` (create), all 11 `harness/checks/*.py`,
`harness/checks/README.md` (counts + a short checklib section), `harness/checks/fixtures/**`
(wire, don't edit content unless a fixture is demonstrably wrong — then STOP and report).

**Out of scope**: `scripts/check-standards.mjs`; `package.json`; CI; hooks; any check's
RULE LOGIC (this is scaffolding-only — zero intended behaviour change except the
documented skip-policy unification); argparse standardisation (explicitly rejected —
leave each script's argv handling alone).

## Git workflow

Branch `advisor/071-checklib`. One commit per step so each lands with all self-tests
green; e.g. `refactor(checks): shared comment-stripper in checklib (5 call sites)`.

## Steps

### Step 1: Baseline + variant diff

Record the exact output of every `--self-test` and the live-tree run (baseline).
Extract the 5 comment-stripper variants and diff them; pick the most complete
behaviour as canonical and note any semantic differences.

**Verify**: baseline recorded; variant analysis in your notes. If two variants differ
SEMANTICALLY (not just docstrings/whitespace) in a way that changes findings on the
live tree, STOP and report which.

### Step 2: Create `checklib.py`

Contents (pure functions, stdlib only, module docstring explaining the import-by-path
convention):
- `strip_block_comments(line, in_comment)` / `ends_in_block_comment(line, in_comment)`
  — the canonical variant from Step 1.
- `TARGET_EXTENSIONS` (the 8-ext set) and `SKIP_DIRS = {"node_modules",".git",".next","dist","out"}`.
- `iter_target_files(paths, extensions=TARGET_EXTENSIONS)` — yields files; skips
  dotdirs AND `SKIP_DIRS` (the unified, stricter policy); prints/collects the existing
  "path not found" error contract (match the current per-script behaviour: an ERROR
  string, not an exception).
- `emit_error(rel, lineno, ctl, found, suggest)` → the canonical
  `ERROR {rel}:{lineno} [{ctl}] {found} — suggest: {suggest}` string.
- `SelfTest` — tiny runner: `st = SelfTest(); st.case(name, fn)` or the simpler
  functional shape `run_cases(failures, count)`; must reproduce the exact
  `SELF-TEST OK (N cases)` / `SELF-TEST FAILED (…)` output and exit codes the scripts
  print today (detect.py and docs grep for these strings).
- `load_by_path(name)` helper is NOT needed — each script inlines the 4-line importlib
  snippet copied from `waiver-reconcile.py` (keep that precedent verbatim).
- Give checklib its own `--self-test` (walker skip policy incl. a fake node_modules
  dir; stripper edge cases from the canonical variant's cases; emit format).

**Verify**: `python3 harness/checks/checklib.py --self-test` → OK.

### Step 3: Adopt per concern, across scripts

In this order, one commit each, ALL self-tests green after each:
1. Comment stripper → 5 scripts delete their copies, import checklib.
2. Walker + extensions → the 6-8 walk sites; `content-lint.py` passes its own
   extension set to `iter_target_files`; `component-manifest.py` keeps its walk if its
   traversal is genuinely different — judge, and say what you did.
3. `emit_error` → the per-script ERROR constructions (only where the format matches
   the canonical shape exactly; leave deviants like token-audit's `[waiver-claimed]`
   variant using their own formatting, noted).
4. SelfTest runner → all 11 scripts.

**Verify after EACH sub-step**: the all-self-tests loop → all OK; the live-tree
baseline run → identical exit codes and identical ERROR/NOTE lines (diff against
Step 1's recording; the ONLY permitted difference is findings disappearing/appearing
because of the unified skip policy — if any appear, list them and STOP unless they are
inside `node_modules`-class dirs, which is the fix working).

### Step 4: Wire fixtures

In `token-audit.py` and `a11y-static.py` self-tests: add a case iterating their
`fixtures/<name>/` dir — every `*fail*` file must produce ≥1 ERROR, every `*pass*`
file zero ERRORs. If a fixture fails that expectation, STOP and report (do not edit
the fixture to make it pass).

**Verify**: both self-tests OK with increased counts; deleting a fixture char to force
a mismatch fires the case (negative test, then revert).

### Step 5: Docs

Update `checks/README.md`: new self-test counts (from live output), a 6-line checklib
section (what it holds, the import-by-path convention, the unified skip policy), and
the fixtures-now-wired note.

**Verify**: `pnpm build` exit 0; `python3 harness/checks/detect.py --self-test` OK;
`python3 harness/checks/detect.py app components` exits with its documented code on
the clean tree.

## Done criteria

- [ ] `checklib.py` exists with its own passing `--self-test`
- [ ] Zero remaining copies: `grep -c "_strip_block_comments" harness/checks/*.py` → 1 file defines it (checklib); `grep -l "TARGET_EXTENSIONS = {" harness/checks/*.py` → checklib only (content-lint may hold its prose-set constant)
- [ ] All 11 script self-tests + checklib's pass; live-tree ERROR/NOTE output identical to the Step 1 baseline (or only node_modules-class differences, listed)
- [ ] Fixtures exercised: both owning self-tests fail when a fixture expectation is broken (negative test reported)
- [ ] `pnpm build` exit 0; `git status` clean outside scope

## STOP conditions

- Semantic divergence between stripper variants that changes live findings (Step 1).
- Any self-test cannot pass without changing a rule assertion (behaviour change —
  this plan is scaffolding-only).
- The live-tree diff after a sub-step shows findings changing outside the documented
  skip-policy effect.
- A fixture contradicts its pass/fail naming (Step 4).

## Maintenance notes

- New checks now start at ~their rule logic: import checklib, register self-test cases.
- checklib is imported by path; if `checks/` ever becomes a package, collapse the
  importlib snippets then — not now.
- detect.py's `_FINDING_RE` still reverse-parses the ERROR shape; `emit_error` is now
  the single producer of that shape, so change them together (note added to both).
