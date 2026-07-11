# Plan 013: Bring the design hook's file-type filter into parity with the checkers

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Do NOT update `plans/README.md` — the reviewer
> maintains the index.
>
> **Drift check (run first)**: `git diff --stat 233f3be..HEAD -- harness/hooks/design-hook.py harness/hooks/README.md`
> On any change, compare the "Current state" excerpts; on a mismatch, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug (silent coverage gap)
- **Planned at**: commit `233f3be`, 2026-07-11

## Why this matters

The PostToolUse design hook filters edited files by `UI_EXTENSIONS` before ever
spawning `detect.py`. That set omits `.js` and `.ts`, while every checker the
detector runs (`token-audit.py:52`, `contrast.py:66`, `a11y-static.py:70`,
`type-scan.py:74`, `waiver-reconcile.py:64`) includes them in its
`TARGET_EXTENSIONS`. So an agent editing a `.ts` file carrying user-facing
strings or raw colour values (design tokens and styled constants live in `.ts`
files) gets no post-edit reminder, even though the same file is flagged when
the checks run directly. Worse, the comment on the hook's set claims it
"matches detect.py's target set" — factually false. This plan adds the two
extensions and fixes the comment and README.

## Current state

`harness/hooks/design-hook.py:46-47`:

```python
# The file types the design controls apply to (matches detect.py's target set).
UI_EXTENSIONS = {".tsx", ".jsx", ".css", ".html", ".vue", ".svelte"}
```

Every checker defines:

```python
TARGET_EXTENSIONS = {".css", ".html", ".jsx", ".tsx", ".js", ".ts", ".vue", ".svelte"}
```

The hook's `process_event` (~line 197) drops non-matching paths and returns
`None` — `detect.py` is never spawned for them. The hook has an embedded
self-test (invoked with `--self-test`; find it near the bottom of the file)
including a "non-UI file → detector not run" case — follow its style.

`harness/hooks/README.md:79-81` documents the current set:
"Only UI extensions run the detector: `.tsx .jsx .css .html .vue .svelte`".

Note: adding `.ts`/`.js` means the hook fires on plain logic files too. The
checkers are conservative on non-UI content (they flag colour literals,
user-facing-looking strings, type-scale values), and a single-file detector run
is fast (`DETECT_TIMEOUT = 120` guards hangs) — accepted trade-off; note it in
the README wording.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Hook self-test | `python3 harness/hooks/design-hook.py --self-test` | self-test OK, case count grows |
| Syntax | `python3 -m py_compile harness/hooks/design-hook.py` | exit 0 |

## Scope

**In scope**:
- `harness/hooks/design-hook.py`
- `harness/hooks/README.md`

**Out of scope**:
- `harness/checks/*.py` — the checkers' sets are correct; do not touch.
- Extracting a shared constant across checks+hook — desirable but a separate
  refactor (see maintenance notes); do NOT attempt it here.
- `.md`/`.mdx` in the hook — content files are the content-lint pass's concern
  and deliberately not hook-triggered today; leave that boundary alone.

## Git workflow

- Branch: `advisor/013-design-hook-extension-parity` from `233f3be`
- Commit style: `fix(harness): design hook fires on .ts/.js edits like the checkers it fronts`
- Do NOT push or open a PR.

## Steps

### Step 1: Extend the set and correct the comment

```python
# The file types the wrapped checkers scan (their TARGET_EXTENSIONS), minus
# .md/.mdx: content files are the content-lint pass's concern, not the hook's.
UI_EXTENSIONS = {".tsx", ".jsx", ".js", ".ts", ".css", ".html", ".vue", ".svelte"}
```

**Verify**: `python3 -m py_compile harness/hooks/design-hook.py` → exit 0.

### Step 2: Add a self-test case

Following the existing self-test style, add: a `.ts` file edit event →
detector IS invoked (mirror the inverse of the existing "non-UI file →
detector not run" case, e.g. with a `.py` path for the negative).

**Verify**: `python3 harness/hooks/design-hook.py --self-test` → OK, case count increased.

### Step 3: Update the README

In `harness/hooks/README.md` (~line 79), update the extension list to include
`.ts .js` and add one sentence on the trade-off: logic-file edits also trigger
a (fast, single-file) detector run because tokens and user-facing strings live
in `.ts` files.

**Verify**: `grep -n "\.ts" harness/hooks/README.md` → the updated line lists `.ts` and `.js`.

## Test plan

The self-test case in step 2 is the regression test. Model it on the existing
cases in the hook's `--self-test` block.

## Done criteria

- [ ] `python3 harness/hooks/design-hook.py --self-test` → OK with the new case
- [ ] `grep -n "matches detect.py" harness/hooks/design-hook.py` → no matches (false comment gone)
- [ ] README documents the new set and trade-off
- [ ] Only the two in-scope files modified (`git status`)

## STOP conditions

- `UI_EXTENSIONS` or `process_event` no longer matches the excerpts (drift).
- The self-test harness has no way to assert "detector invoked" without
  actually running detect.py against a real file and that proves flaky —
  report rather than writing a sleep-based test.

## Maintenance notes

- Follow-up (deliberately deferred): one shared extension constant for the
  5 checkers + hook + detect.py's new `SCAN_EXTENSIONS` (plan 010) — seven
  hand copies today. Until then, any extension change must touch all copies.
- Reviewer: check the hook still exits fast (<1s) on a no-op `.py` edit event.
