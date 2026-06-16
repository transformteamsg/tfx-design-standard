# Skill evals

How we know whether a skill edit made the harness better or worse. Skill text has
changed five times in two days; before this workflow existed, every change was judged
by reading it. These evals turn that judgment into measurement.

The organising principle mirrors the catalog's ratchet: **eval cases grow from
observed failures, never speculation.** Every pilot finding with known ground truth
is a trap somewhere in this directory.

## The three layers

| Layer | What it catches | Artifacts | Cost |
|---|---|---|---|
| **Routing** | Description drift — `design-ui` silently no longer firing on prompts it must fire on. Invisible from inside a session that already loaded the skill. | `routing/prompts.yaml` | One headless `claude -p` probe per case (cheap per case; the full sweep adds up — see cost honesty) |
| **Record audit** | Process non-compliance — a run that skipped the loop's required artifacts (verbatim verdict, named waiver approvers, plan approval, screenshot evidence). | `checks/audit-record.py` over `docs/decisions/*.md` | Seconds; deterministic; free to run every time |
| **Golden tasks + evaluator recall** | Output quality — known-correct answers and planted traps. Golden tasks check what the loop produces; the recall fixture checks the *evaluator itself*, because an evaluator that drifts lenient silently degrades everything downstream. | `golden/*.yaml` scored by `evals/score.py`; `evaluator-recall/planted-page.html` + `expected-findings.yaml` | Golden 001 is free (retroactive over existing artifacts). Golden 002+ each cost a full agent loop run. Evaluator recall costs one subagent dispatch |

Routing answers "does the right skill load?", the record audit answers "did the run
follow the skill?", and golden tasks answer "was the output actually right?". A
regression can hide in any one layer while the other two stay green.

## When to run

- **Record audit** — every run. It is a check, not an eval: run
  `python3 checks/audit-record.py` after any loop run finishes its decision record
  (hook-ready for PostToolUse on `docs/decisions/*` once hooks are wired).
- **Routing + golden suite** — on any skill edit. Spot-check routing (5-case
  sample) for body-text edits; full routing sweep only when a skill's frontmatter
  `description:` changes, because that is the text that decides triggering. Golden
  001 (retroactive, free) runs on every skill edit; golden 002/003 are dispatched
  by an orchestrator when the edit plausibly affects loop output.
- **Evaluator recall** — on any edit to `design-review` or the `design-evaluator`
  subagent definition. Requires spawning the subagent, so it is
  orchestrator/reviewer territory; record each run's score in
  `evaluator-recall/RESULTS.md` so drift is visible over time.

## Cost honesty

Golden tasks 002 onwards are **full loop runs** — intent through verify, evaluator
dispatch included. Each costs roughly one pilot run. So the suite stays small and
runs **on changes, not on timers**: there is no scheduled sweep, no nightly job.
The retroactive task (001) exists precisely so the scoring engine itself is
validated against real ground truth at zero agent cost. Routing probes are cheap
individually but a full sweep is ≥ 24 headless sessions — hence the 5-case
spot-check rule in `routing/prompts.yaml`.

## The eval ratchet

Every escaped defect with known ground truth becomes a trap in an existing or new
golden task — same PR discipline as catalog controls: lightweight PR, design-lead
approval, never edited to make a failing check pass. The reviewer of any
`design-ui` or `design-review` edit should ask: *which golden task would have caught
a regression here?* No answer means a missing task, and that is a finding on the
PR. Current traps and their origins:

- Error copy must say the draft/marks are preserved (CNT-1, attendance pilot).
- A message is never announced by both a live region and a focus move (A11Y-11,
  attendance pilot's double-announcement fix).
- Loading state needs a photographed frame — coded-but-unphotographed slipped
  through both pilots before the evidence rule existed.
- Destructive actions show consequence + undo/confirm (CMP-2, L0).
- Statutory or mandated names are waived (`tfx-waive`), never reworded
  (CNT-2/CNT-3).
- Raw hex / off-scale values fail `checks/token-audit.py` (TOK-1..3).
- AI-writing tells in copy are caught, and look-alike compliant copy is not
  (SLP-9, 2026-06-12 site-wide writing audit) — `evaluator-recall/planted-copy.md`
  + `expected-findings-copy.yaml`, with precision decoys testing the control's
  Do-not-flag calibration.
- A record-audit assertion tightened without migrating the existing corpus broke
  three v0 records (2026-06-15, CMP-1 verdict-vocabulary). The guard is the
  standing "Record audit — every run" rule plus the CONTRIBUTING "tighten over the
  real corpus" criterion — run `checks/audit-record.py` (no args) on any PR that
  changes a record-audit assertion.

## Deferred

- **The fourth layer — the TFX-DS §8 measures report.** Derived from decision
  records in aggregate (waiver rates, re-review rates, finding categories). It
  needs a population to mean anything; build it once ≥ 5 records exist.
- **LLM-judge usage rule.** Judges are for *screening only*. Anything that can be
  a deterministic assertion (file exists, grep, exit code) must be one; anything a
  judge flags as a close call goes to a human, not to a verdict. No layer above
  uses an LLM judge today — the evaluator-recall fixture grades the evaluator
  with hand/grep scoring against documented ground truth, not with another model.
