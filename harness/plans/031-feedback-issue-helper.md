# Plan 031: A `gh` helper that files a deduped, labelled harness-feedback issue

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **The script files real issues.** Its embedded self-test must NOT — it tests pure
> logic with a stubbed `gh` runner. Never let the self-test hit the network or create
> an issue.
>
> **Drift check (run first)**: `git diff --stat 5f95350..HEAD -- harness/docs/harness-feedback.md harness/checks/a11y-static.py`.
> Plan 030 must have landed (`docs/harness-feedback.md` defines the marker + label
> scheme this script implements). If it has not, STOP — this plan depends on it.

## Status

- **Priority**: P2 (issue #6 — mechanizes the acceptance criteria)
- **Effort**: M
- **Risk**: MED (a side-effecting tool — it creates GitHub issues; the risk is held
  down by a pure, network-free self-test and a `--dry-run` default-safe path)
- **Depends on**: **plan 030** (the marker `[harness-feedback]` + the severity/category
  label scheme + the honest-failure rule are defined there). **Blocks**: plan 032.
- **Category**: dx (tooling)
- **Planned at**: commit `5f95350`, 2026-06-17

## Why this matters

Issue #6's acceptance criteria are mechanical: a captured feedback item becomes a
**labelled** GitHub issue with **no markdown write**; **no duplicate** issues (dedup by
marker/search); severity + category surface as **labels**; and when `gh` is unavailable
the tool gives a **clear report, not a silent skip**. Plan 030 wrote the process; this
plan makes it one command so the Phase-6 ratchet can file feedback reliably and
identically every time, instead of by hand.

## Current state

- `docs/harness-feedback.md` (created by plan 030) — defines: title marker
  `[harness-feedback] <summary>`; severity labels `L0-risk`/`high`/`med`/`low`; category
  labels `a11y`/`tooling`/`standards`/`harness-ux`/`onboarding`; dedup via
  `gh issue list --search`; honest failure when `gh` is unauth/unreachable. **This
  script implements that doc** — read it first; the doc is the spec.
- `checks/a11y-static.py` — the **self-test pattern to copy**: an embedded
  `run_self_test()` with `assert_*` helpers, printing `SELF-TEST OK (N cases)`, exit 0;
  `main()` dispatching on args. Reuse this shape (but this is an *action* tool, so it
  lives outside `checks/` — see Scope).
- `gh` CLI is the dependency. `gh auth status` (logged in as `rezailmi`), `gh issue
  create --title --body --label`, `gh issue list --search <q> --state all --json
  number,title,state`, `gh issue comment <n> --body`. The script shells out via
  `subprocess`.
- No `scripts/` directory exists at the harness root yet (the Python tooling all lives
  in `checks/`, which is for read-only validators run during verify). An issue-*creating*
  tool does not belong among the validators — this plan creates `scripts/`.

### Repo conventions to honour

- Pure standard-library Python 3 (`os`, `re`, `sys`, `subprocess`, `shutil`,
  `argparse`, `json`, `tempfile` for the self-test). No third-party deps.
- Embedded self-test, `SELF-TEST OK (N cases)` on success, exit-code discipline.
- Honest output — mirror the harness rule the doc states: on `gh` failure, print the
  issue that *would* have been filed + the reason, exit non-zero.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Self-test (pure, no network) | `python3 scripts/file-feedback-issue.py --self-test` | `SELF-TEST OK (N cases)` exit 0 |
| Dry run (no side effect) | `python3 scripts/file-feedback-issue.py --dry-run --severity med --category tooling --title "x" --body "y"` | prints the `gh` command + body; exit 0; files nothing |
| Honest failure path | (with `gh` absent on PATH) `python3 scripts/file-feedback-issue.py --severity med --category tooling --title x --body y` | clear "gh unavailable" report + the would-be issue; non-zero exit |
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` |

## Scope

**In scope** (create/modify):
- `scripts/file-feedback-issue.py` (create) — the helper with embedded self-test.
- `scripts/README.md` (create) — one short paragraph: what `scripts/` is (action tools,
  not validators) and how to run this one.
- `docs/harness-feedback.md` — replace the inline "run `gh issue create` by hand" note
  with the concrete `scripts/file-feedback-issue.py` usage (the script is now the
  mechanism).

**Out of scope** (do NOT touch):
- The backfill (plan 032) — this plan ships the tool; 032 uses it.
- `checks/` — keep validators and action tools separate.
- Creating the labels (plan 030 Step 4) or filing any real issue from this plan.
- Editing the skills (plan 030 already wired Phase 6 to the doc, which now points here).

## Git workflow

- Branch: `advisor/031-feedback-issue-helper`. Conventional commits
  (`feat(scripts): add file-feedback-issue.py — deduped, labelled gh issue filing (#6)`).
  Do NOT push.

## Steps

### Step 1: Build the helper with a testable `gh` indirection

Create `scripts/file-feedback-issue.py`. Structure it so the network calls sit behind a
single indirection the self-test can stub:

**Define the seam explicitly so the self-test injects fakes without monkeypatching or
the network.** Thread two dependencies — a `gh` runner and a `which` lookup — through
every function that touches the environment, all the way into `main`:

- `def run_gh(args, *, runner=None)` — the one place that invokes `gh`. `runner`
  defaults to a module-level `_subprocess_runner` that does
  `subprocess.run(["gh", *args], capture_output=True, text=True)`. A test passes a fake
  `runner` returning canned stdout/returncode, so **no test ever shells out**.
- `def preflight(*, runner, which)` — `which("gh")` and (if found)
  `run_gh(["auth","status"], runner=runner)`; returns a structured "available" /
  "unavailable(reason)" result. `which` is injectable so a test can simulate `gh`
  absent with `which=lambda _name: None`.
- `def find_duplicate(title, *, runner)` — `run_gh(["issue","list","--search",q,
  "--state","all","--json","number,title,state"], runner=runner)`; parse JSON; return
  the first issue whose title matches the marker + summary (case-insensitive,
  marker-stripped compare). NB: GitHub `--search` is fuzzy full-text, so re-filter the
  JSON results in Python by exact `[harness-feedback]`-prefix + summary — do not trust
  the search to be an exact match.
- `def main(argv=None, *, runner=_subprocess_runner, which=shutil.which)` — parse
  `argv` (defaults to `sys.argv[1:]`), then run: `preflight(runner=runner, which=which)`
  → if unavailable, **print the would-be issue (title, labels, body) + the reason and
  return a non-zero code** (honest failure, never silent). Else `find_duplicate(...,
  runner=runner)` → if duplicate, print "duplicate of #N — comment instead" and (unless
  `--dry-run`) comment, return 0 without creating. Else if `--dry-run`, print the
  `gh issue create` command + body and return 0; otherwise create and print the URL.
  Because `runner`/`which` are `main` kwargs, the self-test drives the honest-failure
  and dry-run cases by calling `main([...], runner=fake, which=stub)` directly — no
  monkeypatching, no network.
- `argparse`: `--title` (required), `--body` or `--body-file` (required), `--severity`
  (choice of the four), `--category` (one or more of the five, repeatable), `--dry-run`,
  `--self-test`, optional `--repo` (default `transformteamsg/tfx-design-standard`).
- `normalize_title(summary)` — prepend `[harness-feedback] ` if not already present
  (idempotent; never double-prefix).
- `build_labels(severity, categories)` — return the label list (one severity + ≥1
  category); validate against the allowed sets from the doc; error clearly on an
  unknown label.

### Step 2: Embedded self-test (pure, no network)

`run_self_test()` with a fake runner, covering the issue-#6 acceptance criteria as unit
assertions:

- **marker idempotency**: `normalize_title("X")` → `[harness-feedback] X`;
  `normalize_title("[harness-feedback] X")` → unchanged.
- **labels assembled**: `build_labels("L0-risk", ["a11y","standards"])` → exactly those
  three; an unknown severity/category raises a clear error.
- **dedup hit**: with a fake runner returning an issue list containing
  `[harness-feedback] X`, `find_duplicate` for "X" returns that issue (→ main would not
  create).
- **dedup miss**: empty issue list → returns None (→ main would create).
- **honest failure**: `main(["--severity","med","--category","tooling","--title","X",
  "--body","Y"], runner=fake, which=lambda _n: None)` → returns non-zero, prints the
  would-be issue (assert the body text appears in captured stdout), and the fake runner
  records **no** `issue create` call.
- **dry-run**: `main([...,"--dry-run"], runner=fake, which=lambda _n: "/usr/bin/gh")`
  (gh "present") → the fake runner records no `issue create` call; returns 0.

Print `SELF-TEST OK (N cases)` / exit 0 on success, like the siblings.

**Verify**: `python3 scripts/file-feedback-issue.py --self-test` → `SELF-TEST OK (N
cases)`; the dry-run command in the table prints a plausible `gh issue create …` and
files nothing.

### Step 3: Document and re-point the process doc

- `scripts/README.md` — one paragraph: `scripts/` holds action tools (not validators;
  those are in `checks/`); document `file-feedback-issue.py` usage + the `--dry-run` and
  `--self-test` flags.
- `docs/harness-feedback.md` — replace the by-hand `gh issue create` note (left by plan
  030) with the concrete `python3 scripts/file-feedback-issue.py …` invocation, keeping
  the dedup + honest-failure description (now implemented).

**Verify**: `claude plugin validate .` passes; `git status` shows only in-scope files.

## Test plan

- All tests are in the embedded `--self-test` (pure, stubbed `gh`), covering the six
  case classes in Step 2 — these *are* the issue-#6 acceptance criteria as unit tests.
- A manual `--dry-run` confirms the assembled `gh` command/labels/body look right
  without filing.
- A real end-to-end file is **not** part of this plan (that is plan 032's gated
  backfill / a live operator run) — do not file a test issue to prove it works; the
  dry-run + self-test are the proof here.
- Verification: `python3 scripts/file-feedback-issue.py --self-test` → `SELF-TEST OK`.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `python3 scripts/file-feedback-issue.py --self-test` → `SELF-TEST OK (N cases)`, exit 0
- [ ] `--dry-run` prints the `gh issue create` command + labels + body and files nothing
- [ ] With `gh` absent, the tool prints the would-be issue + reason and exits non-zero (no silent skip)
- [ ] Title marker is idempotent; labels validated against the doc's allowed sets; dedup detected from a `gh issue list` result
- [ ] `scripts/README.md` and the updated `docs/harness-feedback.md` describe usage
- [ ] No third-party imports (`grep -nE "^import |^from " scripts/file-feedback-issue.py` shows stdlib only)
- [ ] `claude plugin validate .` passes; `checks/validate.py` unaffected
- [ ] Only in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- `docs/harness-feedback.md` does not exist (plan 030 not landed) — this plan depends
  on it for the marker + label scheme.
- The self-test cannot be made network-free (you find yourself needing a real `gh`
  call to test) — refactor the `gh` indirection so a fake runner covers it; a self-test
  that hits the network or files an issue is unacceptable.
- `gh`'s `--json` output shape differs from what `find_duplicate` parses — adjust the
  parser to the live `gh issue list --json number,title,state` schema and note it.

## Maintenance notes

- The allowed label sets and the marker are duplicated from `docs/harness-feedback.md`
  by necessity (the script enforces them); if the doc's scheme changes, update both —
  add a comment in the script pointing at the doc as the source of truth.
- Plan 032 (backfill) drives this script in a loop over the historical HF items; keep
  the CLI stable for that.
- A reviewer should focus on the honest-failure path (the issue-#6 criterion most likely
  to regress to a silent skip) and confirm the self-test never touches the network.
