# Plan 009: Build the skill eval workflow — routing, record audit, golden tasks, evaluator recall

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat f711262..HEAD -- checks/ docs/decisions/ .claude/skills/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live files before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: LOW (all additive; the only executable code is read-only scoring)
- **Depends on**: none (plans 001–008 are DONE and merged)
- **Category**: tests
- **Planned at**: commit `f711262`, 2026-06-11

## Why this matters

The harness now has four skills, an evaluator agent, a 28-control catalog, and two
completed pilot runs — but no way to know whether a skill *edit* made things better
or worse. Skill text changed five times in two days; every change was judged by
reading it. The eval workflow turns that into measurement, on three layers:

1. **Routing** — does `design-ui` still fire on the prompts it must fire on?
   (Description drift is invisible from inside a session that already loaded it.)
2. **Process compliance** — did a run actually follow the skill? Our decision
   records are structured artifacts, so most of this is mechanically checkable.
3. **Output quality** — golden tasks with planted traps and known correct answers,
   plus a recall test for the evaluator itself (an evaluator that drifts lenient
   silently degrades everything downstream).

The eval principle mirrors the catalog's ratchet: **eval cases grow from observed
failures, never speculation.** Every pilot finding with known ground truth becomes a
trap. And golden task 001 is *retroactive* — the attendance run's artifacts already
exist in-repo, so the scoring engine is validated against real ground truth with
zero new agent runs.

## Current state

- `checks/validate.py` — the style/contract exemplar for any new check script:
  plain python3 + stdlib + pyyaml, prints `ERROR <location>: <message>` lines,
  exit 0 with an `OK: …` line on success, exit 1 on failure. `python3
  checks/validate.py` → `OK: 28 controls valid`.
- `checks/token-audit.py` — has `--self-test` (embedded assertions, prints
  `SELF-TEST OK (18 cases)`); follow that pattern for the scorer's self-test.
- `docs/decisions/` — `TEMPLATE.md` plus two real records. The template's required
  header fields include `**Run type:** attended | unattended (operator-proxy
  approvals)` and the Verify verdict section requires: a `Screenshots:` line, a
  `Token block line range:` line, deterministic controls listed per-control, and
  the evaluator verdict pasted **verbatim** ("a summary here is a defect").
- `docs/decisions/attendance.md` — the richest real record: sprint contract
  (5 numbered done-criteria), waivers table with named approver, two verbatim
  evaluator verdicts (initial `VERDICT: pass-with-findings`, re-review
  `VERDICT: pass`), a "Modification run — catalog re-audit" section, and a Ratchet
  section. Screenshots at `docs/loop-run/screenshots/attendance/` — exactly:
  `360-question.png 768-question.png 1280-question.png 768-exceptions.png
  768-loading.png 768-success.png 768-error.png`.
- `.claude/skills/design-ui/SKILL.md` — the rules a compliance audit asserts:
  verbatim verdict in the record; width evidence (360/768/1280) AND one frame per
  state each in-scope hybrid control asserts (loading included); plan approval
  explicit (or recorded operator-proxy); L1 waivers carry a named approver;
  unattended proxy approval recorded as exactly "approved by operator proxy".
- `.claude/skills/*/SKILL.md` frontmatter `description:` fields define triggering;
  `design-ui` covers design/create/build/add/change/fix/restyle of
  page/screen/form/component/flow; `content-style` is "sufficient on its own for
  copy-only edits".
- Known pilot findings with ground truth (the trap source): error copy must
  state the draft/marks are preserved (CNT-1); focus must move to the revealed
  surface on async context replacement, and a message must never be announced by
  both a live region and a focus move (A11Y-11); loading state needs a frame
  (evidence rule); destructive actions need consequence + undo/confirm (CMP-2,
  L0); statutory names are waived (`tfx-waive`), never reworded (CNT-2/CNT-3);
  raw hex/off-scale values fail token-audit (TOK-1..3).
- Environment: Python 3.9.6, pyyaml 6.0.3. Headless runs exist via the `claude`
  CLI (`claude -p "<prompt>" --output-format json`); cost note — a full headless
  design-loop run is expensive, which shapes step 5's design.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Catalog validator | `python3 checks/validate.py` | `OK: 28 controls valid` |
| Record audit (after step 2) | `python3 checks/audit-record.py docs/decisions/attendance.md` | `OK: …`, exit 0 |
| Scorer self-test (after step 4) | `python3 evals/score.py --self-test` | `SELF-TEST OK (N cases)` |
| Retroactive golden task (after step 4) | `python3 evals/score.py evals/golden/001-attendance-retro.yaml` | `PASS … assertions`, exit 0 |
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` |

## Scope

**In scope** (create unless noted):
- `evals/README.md` — the workflow doc: the three layers, when each runs, costs
- `evals/routing/prompts.yaml` — the routing dataset
- `evals/golden/001-attendance-retro.yaml` — retroactive task over existing artifacts
- `evals/golden/002-grade-entry.yaml`, `evals/golden/003-broadcast-message.yaml`
  — authored-not-yet-run tasks (brief + traps + assertions)
- `evals/evaluator-recall/planted-page.html` + `evals/evaluator-recall/expected-findings.yaml`
- `evals/score.py` — the deterministic assertion engine
- `checks/audit-record.py` — decision-record compliance check
- `checks/README.md` (modify — add audit-record to the Built section)
- `plans/README.md` status row (reviewer maintains if dispatched)

**Out of scope** (do NOT touch):
- Running golden tasks 002/003 end-to-end (each is a full agent loop — they are
  authored here, executed by an orchestrator later).
- Running the evaluator-recall eval (requires spawning the design-evaluator
  subagent — executors cannot; the reviewer runs it during review).
- CI/hook wiring, any skill or catalog edits, `docs/index.html`.
- The TFX-DS §8 measures report (derived from records once more runs exist —
  deliberately deferred; note it in evals/README.md as the fourth layer).

## Git workflow

- Branch: `advisor/009-skill-evals`. Conventional commits
  (`feat(evals): …`, `feat(checks): add audit-record`). Do NOT push.

## Steps

### Step 1: Write `evals/README.md`

Document the workflow so a human can run it without this plan. Sections:
**The three layers** (routing / record audit / golden tasks + evaluator recall) —
what each catches, what each costs; **When to run** — record audit: every run
(it's a check); routing + golden suite: on any skill edit; evaluator recall: on
any design-review/evaluator edit; **Cost honesty** — golden tasks 002+ are full
loop runs (≈ one pilot run each), the suite stays small and runs on changes, not
timers; **The eval ratchet** — every escaped defect with known ground truth
becomes a trap in an existing or new golden task; **Deferred** — §8 measures
report once ≥5 records exist; LLM-judge usage rule (screening only; deterministic
assertions wherever possible; close calls to humans).

**Verify**: `grep -cE "^## " evals/README.md` → ≥ 4.

### Step 2: Write `checks/audit-record.py`

CLI: one or more record paths (default: all `docs/decisions/*.md` except
`TEMPLATE.md`). Match validate.py's output contract. Assertions per record —
each failure is one `ERROR <file>: <message>` line:

1. Required sections present: `## Sprint contract`, `## Tradeoffs`,
   `## Controls in scope`, `## Waivers granted`, `## Plan approval`,
   `## Verify verdict`, `## Ratchet` (heading match is substring-tolerant —
   records may extend headings).
2. Header has a `**Run type:**` line OR an explicit proxy-approval note
   (older records predate the field — accept either; flag if neither).
3. Sprint contract has ≥ 3 numbered done-criteria.
4. Verbatim-verdict heuristic: the Verify verdict section contains a line
   starting `VERDICT:` AND a `QUALITY GRADES` heading/line (a summary
   paraphrase will lack the structured blocks).
5. Waivers table rows (if any non-empty row exists) have a non-empty Approver
   cell, and L0 never appears as a waived tier.
6. Plan approval section contains either "Approved by" with content or the
   literal "operator proxy".
7. Every screenshot path referenced in the record that points under `docs/`
   exists on disk.
8. Ratchet section is non-empty (the explicit "no proposal — nothing uncovered"
   text counts as content).

Include `--self-test` running embedded cases (a minimal passing record string, and
one mutated copy per assertion class — ≥ 8 cases).

**Verify**: `python3 checks/audit-record.py --self-test` → `SELF-TEST OK`;
`python3 checks/audit-record.py docs/decisions/attendance.md docs/decisions/student-notes-empty-state.md`
→ exit 0 (if either real record genuinely fails an assertion, STOP condition 2
applies — report, don't edit the record or soften the check).

### Step 3: Write the routing dataset `evals/routing/prompts.yaml`

Schema: `cases:` list of `{prompt, expect}` where `expect` is one of
`design-ui | content-style | design-standards | none`. Author ≥ 24 cases:
≥ 12 design-ui positives spanning all three entry points (new page;
modification phrasings like "add a remarks field to attendance" and "restyle the
status chip"; catalog re-audit phrasing like "the catalog gained new controls —
re-check the attendance page"); ≥ 4 content-style (copy-only: "rewrite this
error message", "is this empty-state text on-voice?"); ≥ 3 design-standards
("can I waive TOK-1 here?", "propose a control for X"); ≥ 5 `none`
("what does L1 mean?" → that's a question, "summarize TFX-DS", "what's the
catalog count?"). Add a `how_to_run:` comment block at the top: the probe is
`claude -p "<prompt>" --max-turns 2 --output-format json` in a fresh session at
repo root, pass = the expected skill appears in the transcript's tool calls;
note the cost cap — spot-check a 5-case sample per skill edit, full sweep only
on description changes.

**Verify**: `python3 -c "import yaml; d=yaml.safe_load(open('evals/routing/prompts.yaml')); assert len(d['cases'])>=24; assert all(c['expect'] in ('design-ui','content-style','design-standards','none') for c in d['cases']); print('OK', len(d['cases']))"` → OK ≥24.
Then execute ONE live probe as a smoke test (any single design-ui positive)
and report its result in NOTES — do not run the full set.

### Step 4: Write `evals/score.py` + golden task 001 (retroactive)

`score.py`: takes a task YAML; runs its `assertions` against the repo; output
contract like validate.py (`PASS <task>: N assertions` / `ERROR` lines + exit 1);
plus `--self-test`. Assertion types (keep to exactly these four — they cover
everything needed and stay deterministic):

- `{type: file_exists, path}`
- `{type: grep, path, pattern, expect: present|absent}` (regex, multiline)
- `{type: command, run, exit: 0|1}` (whitelist: only commands beginning
  `python3 checks/` — refuse anything else so task files can't smuggle arbitrary
  execution)
- `{type: count, path, pattern, min}` (regex match count ≥ min)

Task YAML schema: `id, brief, traps: [..] (documentation), artifacts: {record,
page, screenshots_dir}, assertions: [..]`.

`evals/golden/001-attendance-retro.yaml` — brief: the attendance page task as
run in the pilot; artifacts point at the existing repo files; assertions (all
must pass TODAY against the real artifacts — this validates the engine):

- record exists; `command: python3 checks/audit-record.py docs/decisions/attendance.md` exit 0
- grep record for `VERDICT: pass` present
- grep record for `tfx-waive|operator proxy` present (waiver/approval trail)
- grep page (`docs/loop-run/attendance.html`) for `role="alert"` **absent**
  (A11Y-11 trap — the double-announcement fix)
- grep page for `Your marks are saved` present (CNT-1 draft-reassurance trap)
- file_exists for each of the 7 screenshots incl. `768-loading.png`
  (state-evidence trap)
- `command: python3 checks/token-audit.py docs/loop-run/attendance.html` exit 0

**Verify**: `python3 evals/score.py --self-test` → SELF-TEST OK;
`python3 evals/score.py evals/golden/001-attendance-retro.yaml` → PASS, exit 0.
Mutation test: temporarily edit the task YAML to expect `role="alert"` present →
scorer exits 1 with the failing assertion named; revert; PASS again.

### Step 5: Author golden tasks 002 and 003 (not run)

Same schema; these are run later by an orchestrator (each is a full loop run).
Design the traps from the ground-truth list in Current state:

- **002-grade-entry.yaml** — brief: "Design a marks entry page for P5 Math in
  Teacher Workspace; teachers sometimes need to clear a whole column of marks."
  Traps: the clear-column action is destructive (CMP-2 L0: consequence +
  undo/confirm must appear; assertions grep the produced page for a confirm/undo
  surface); async save (CMP-3 states + A11Y-11 channels; assert no element
  carries both a live-region role and programmatic focus for the same message —
  grep heuristics documented in the task); marks table semantics (A11Y-7: assert
  `<table>` or `<ol>` present, no div-grid); token discipline (token-audit exit 0).
- **003-broadcast-message.yaml** — brief: "Design a 'send announcement to
  parents' compose page for TW; the programme name 'ComLink+' must appear
  exactly as written." Traps: mandated name (CNT-2/CNT-3: assert
  `tfx-waive CNT` present in page or record — waived, not reworded; assert
  `ComLink\+` present verbatim); send is irreversible-ish (CMP-2: confirm with
  plain consequences); recipient-count in the confirm (the count-in-button
  pattern from the pilot — advisory assertion, marked `severity: advisory` …
  do NOT add severity to the schema; instead put it in the trap documentation
  and make the assertion a plain grep for a digit in the confirm copy).

Both files must pass YAML load and schema sanity via the same python one-liner
pattern as step 3 (write it in the Verify).

**Verify**: `python3 -c "import yaml; [yaml.safe_load(open(f)) for f in ['evals/golden/002-grade-entry.yaml','evals/golden/003-broadcast-message.yaml']]; print('OK')"` → OK.
`python3 evals/score.py evals/golden/002-grade-entry.yaml` → exits 1 with
"artifact missing" style ERRORs (correct — the task hasn't been run; confirm the
failure message is clear, not a crash).

### Step 6: Author the evaluator-recall fixture

`evals/evaluator-recall/planted-page.html` — a small self-contained TW-style
page (reuse the token-block pattern from `docs/loop-run/attendance.html`) with
EXACTLY six planted violations, each marked by an adjacent HTML comment
`<!-- PLANT n: <control-id> — <what> -->` so ground truth is auditable:

1. CNT-1: error message that is a raw code ("Error 500")
2. A11Y-3: an input with no associated label
3. CMP-2: a "Delete all notes" button with no confirm/undo
4. A11Y-11: a status message with BOTH `role="alert"` and a focus() script
5. CNT-2: a feature named "SyncFlow"
6. TYP-2 bait for belt-and-braces: body copy at 12px (deterministic control —
   tests whether the evaluator reports visible deterministic violations)

`expected-findings.yaml`: the six plants (control id + short description) plus
scoring rules: recall = plants caught / 6 (target ≥ 5); precision note = invented
blocking findings count (target 0); close-call advisories don't count against
precision. Add a `how_to_run:` block: spawn `design-evaluator` with this page, a
minimal contract ("all 6 controls in scope"), no screenshots (code-only review,
say so in the dispatch), then score the verdict against this file by hand or
with `grep`.

**Verify**: `python3 checks/token-audit.py evals/evaluator-recall/planted-page.html`
→ exit 0 OR exits 1 only on lines that are documented plants (if a plant
involves raw values, list the expected token-audit hits inside
expected-findings.yaml so the noise is ground truth, not slop). Comment count:
`grep -c "PLANT" evals/evaluator-recall/planted-page.html` → 6.

### Step 7: Register the new check + final gates

Add an "Audit record (built)" entry to `checks/README.md` under the built
section, mirroring the validator's entry (command, what it asserts, exit
contract). Run all gates.

**Verify**: `grep -c "audit-record" checks/README.md` → ≥ 1;
`python3 checks/validate.py` → OK; `claude plugin validate .` → passed;
`git status --short` clean after commit.

## Test plan

The self-tests ARE the tests: audit-record ≥ 8 embedded cases; score.py
self-test covering all four assertion types incl. the command whitelist
rejection (a task with `run: rm -rf /` must be REFUSED with an ERROR, not
executed — this is a required self-test case); golden-001 passing against real
artifacts is the integration test; the step-4 mutation test proves the scorer
can fail.

## Done criteria

- [ ] `python3 checks/audit-record.py --self-test` → SELF-TEST OK; both real records pass (or failures reported as findings, not silenced)
- [ ] `python3 evals/score.py --self-test` → SELF-TEST OK, incl. command-whitelist rejection case
- [ ] `python3 evals/score.py evals/golden/001-attendance-retro.yaml` → PASS, exit 0
- [ ] Tasks 002/003 parse and fail cleanly as not-yet-run
- [ ] Routing dataset ≥ 24 cases, valid; one live probe smoke-tested
- [ ] Planted page carries exactly 6 documented plants
- [ ] `checks/README.md` updated; validator + plugin validation pass
- [ ] Only in-scope files modified; committed; `git status --short` clean
- [ ] `plans/README.md` status row updated

## STOP conditions

- A real decision record fails audit-record on an assertion you believe is
  CORRECT — report the ERROR output as a finding; do not edit the record and do
  not weaken the assertion to green-wash it.
- The verbatim-verdict heuristic (step 2.4) can't distinguish the real records'
  verdicts from a summary — report with examples rather than shipping a check
  that passes everything.
- The single live routing probe (step 3) can't detect skill invocation from
  headless output — author the dataset anyway, document the limitation in
  evals/README.md, and report it.
- Any temptation to add assertion types beyond the four, or to widen the
  command whitelist — STOP and report why the four don't suffice.

## Maintenance notes

- **The eval ratchet**: future loop-run findings with ground truth get added as
  assertions to existing tasks or new tasks — same PR discipline as catalog
  controls. The reviewer of any `design-ui`/`design-review` edit should ask
  "which golden task would have caught a regression here?" — no answer means a
  missing task.
- When the orchestrator first RUNS task 002/003, expect assertion tuning (grep
  heuristics meeting real output); tune the task file, never the page, to match
  ground truth intent.
- audit-record.py is hook-ready: once hooks are wired (V1), run it PostToolUse
  on `docs/decisions/*` edits.
- The evaluator-recall run needs subagent spawning — orchestrator/reviewer
  territory; record results in `evals/evaluator-recall/RESULTS.md` per run so
  evaluator drift is visible over time.
