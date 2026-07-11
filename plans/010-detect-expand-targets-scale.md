# Plan 010: Make detect.py's ignoreFiles expansion survive real repos (prune vendor dirs, filter extensions)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Do NOT update `plans/README.md` — the reviewer
> maintains the index.
>
> **Drift check (run first)**: `git diff --stat 233f3be..HEAD -- harness/checks/detect.py`
> On any change, compare the "Current state" excerpts against the live code;
> on a mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `233f3be`, 2026-07-11

## Why this matters

When a product repo configures `detector.ignoreFiles` in `.tfx/config.json`,
`detect.py` expands directory targets into a flat file list via `os.walk`,
pruning **only dot-directories**, and passes the entire list as argv to each of
4–6 check subprocesses. `node_modules` is walked in full. Measured on this very
repo: 53,417 files under `node_modules`, ~7.8 MB of path bytes — 7.4× over
macOS `ARG_MAX` (1,048,576). `subprocess.run` raises `OSError` (E2BIG), which
`_run_subprocess` maps to a crash, so every check reports "crash" and detect
exits 1. The `ignoreFiles` feature therefore breaks the detector in exactly the
repos that need scan-noise control. The self-test only exercises tiny temp
dirs, so it never catches this.

Fix at the right depth: prune vendor/build directories during the walk and
filter the expanded list to the extensions the wrapped checks actually scan —
this keeps argv small in every realistic repo.

## Current state

- `harness/checks/detect.py` — façade that runs the check scripts; the only
  file in scope.

`harness/checks/detect.py:158-173` today:

```python
def expand_targets(paths, ignore_globs, repo_root):
    """Expand dir targets into a flat file list and drop ignoreFiles matches. Only
    called when ignoreFiles is set — otherwise the raw targets are passed straight
    through (each script recurses itself)."""
    files = []
    for p in paths:
        if os.path.isfile(p):
            files.append(p)
        elif os.path.isdir(p):
            for root, dirs, fnames in os.walk(p):
                dirs[:] = [d for d in dirs if not d.startswith(".")]
                for fn in sorted(fnames):
                    files.append(os.path.join(root, fn))
        else:
            files.append(p)  # let the script report the missing path
    return [f for f in files if not is_ignored(f, ignore_globs, repo_root)]
```

`harness/checks/detect.py:455-456` (the only call site):

```python
    # Only expand + filter targets when ignoreFiles is set; else pass raw targets.
    scan_targets = expand_targets(targets, ignore_files, repo_root) if ignore_files else list(targets)
```

`harness/checks/detect.py:310` (argv construction, unchanged by this plan):

```python
            argv = [sys.executable, script] + spec["args"][1:] + list(targets)
```

The wrapped checks' own recursion (used when ignoreFiles is NOT set) already
skips vendor dirs — see each check's walker (e.g. `token-audit.py`,
`a11y-static.py`); they each define
`TARGET_EXTENSIONS = {".css", ".html", ".jsx", ".tsx", ".js", ".ts", ".vue", ".svelte"}`
and `content-lint.py` additionally scans `.md`/`.mdx`. The expanded list only
needs to contain files at least one check would scan.

`detect.py` has an embedded self-test (`--self-test`, around line 565) that
builds tiny temp trees — follow its existing style when adding cases.

Repo conventions: Python stdlib only, no third-party imports in `checks/`;
module-level constants in CAPS; self-test cases are plain asserts with a
one-line label.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Self-test | `python3 harness/checks/detect.py --self-test` | `SELF-TEST OK` (case count increases) |
| Detector on this repo | `python3 harness/checks/detect.py app components` | exit 0 or 2 (not 1), no crash lines |
| Syntax | `python3 -m py_compile harness/checks/detect.py` | exit 0 |

## Scope

**In scope**:
- `harness/checks/detect.py`

**Out of scope**:
- The individual check scripts (`token-audit.py`, etc.) — their recursion is fine.
- `harness/hooks/design-hook.py` — plan 013 covers hook parity; do not touch.
- Chunking argv across multiple subprocess invocations — NOT needed once
  pruning+filtering is in (a filtered UI-file list is orders of magnitude
  smaller); do not implement it.

## Git workflow

- Branch: `advisor/010-detect-expand-targets-scale` from `233f3be`
- Commit style: `fix(harness): prune vendor dirs and filter extensions in detect.py target expansion`
- Do NOT push or open a PR.

## Steps

### Step 1: Add module-level constants

Near the other constants at the top of `detect.py`, add:

```python
# Directories never scanned during ignoreFiles expansion (mirrors the check
# scripts' own recursion, which skips vendor and build output).
PRUNE_DIRS = {"node_modules", "dist", "build", "out", "coverage", "vendor", "__pycache__"}

# Union of every wrapped check's TARGET_EXTENSIONS (content-lint adds .md/.mdx).
SCAN_EXTENSIONS = {".css", ".html", ".jsx", ".tsx", ".js", ".ts", ".vue",
                   ".svelte", ".md", ".mdx"}
```

**Verify**: `python3 -m py_compile harness/checks/detect.py` → exit 0.

### Step 2: Prune and filter in expand_targets

In the `os.walk` loop, extend the prune line and filter by extension:

```python
            for root, dirs, fnames in os.walk(p):
                dirs[:] = [d for d in dirs
                           if not d.startswith(".") and d not in PRUNE_DIRS]
                for fn in sorted(fnames):
                    if os.path.splitext(fn)[1].lower() in SCAN_EXTENSIONS:
                        files.append(os.path.join(root, fn))
```

Explicit file targets (the `os.path.isfile(p)` branch) keep passing through
unfiltered — a user who names a file gets it scanned regardless of extension.
Update the function docstring to state both behaviours.

**Verify**: `python3 harness/checks/detect.py --self-test` → still OK (existing cases pass).

### Step 3: Add self-test cases

Following the existing self-test style, add cases that build a temp tree with:
1. `node_modules/pkg/index.js` and `src/page.tsx` → with `ignoreFiles=["legacy/*"]`,
   the expanded list contains `src/page.tsx` and nothing under `node_modules`.
2. `src/notes.txt` and `src/page.tsx` → expanded list excludes `notes.txt`.
3. An explicit file target `weird.xyz` passed directly → survives expansion
   (isfile branch, no extension filter).

**Verify**: `python3 harness/checks/detect.py --self-test` → `SELF-TEST OK` with the case count increased by 3 (or however many asserts you add).

### Step 4: End-to-end sanity on this repo

**Verify**: create a throwaway config exercise —
`cd "$(mktemp -d)" && mkdir -p .tfx src node_modules/junk && echo '{"detector":{"ignoreFiles":["legacy/*"]}}' > .tfx/config.json && printf 'export const x = 1;\n' > src/a.ts && for i in $(seq 1 200); do echo x > node_modules/junk/f$i.js; done && python3 /Users/jeongwondo/Developer/tfx-design-standard/harness/checks/detect.py . ; echo "exit=$?"`
→ exit 0 or 2 (findings), NOT 1; output contains no `crash`.
(Note: node_modules `.js` files must be pruned by directory name even though
`.js` is a scan extension — that is what case 1 asserts.)

## Test plan

Covered by the self-test cases in step 3 plus the end-to-end rehearsal in
step 4. Model new cases on the existing `--self-test` block (~line 565).

## Done criteria

- [ ] `python3 harness/checks/detect.py --self-test` → SELF-TEST OK, new cases included
- [ ] Step 4 rehearsal exits 0/2 with no crash lines
- [ ] `python3 harness/checks/detect.py app components` on this repo behaves as before (same exit class as at 233f3be)
- [ ] Only `harness/checks/detect.py` modified (`git status`)

## STOP conditions

- `expand_targets` or its call site no longer matches the excerpts (drift).
- Any existing self-test case fails after step 2 — do not weaken existing
  cases to pass; report.
- You find the wrapped checks rely on receiving non-`SCAN_EXTENSIONS` files
  (e.g. a manifest) through expansion — report instead of widening the set.

## Maintenance notes

- If a new check script with new extensions is added, `SCAN_EXTENSIONS` must
  be updated — note this in the constant's comment (done in step 1's wording).
- Plan 013 (hook extension parity) touches the same conceptual set from the
  hook side; if both land, a follow-up may unify them into one shared constant.
