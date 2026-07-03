# Plan 059: Unified detector — one `checks/detect.py` entry over the existing checks, with `.tfx/config.json` ignores

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> any STOP condition occurs, stop and report. When done, update the 059 row
> in `harness/plans/README.md` — unless a reviewer told you they maintain it.
>
> **Drift check (run first)**, from repo root:
> `git diff --stat 48d13dd..HEAD -- harness/checks harness/docs/DESIGN-CONTEXT.md`
> (If 058 has landed, DESIGN-CONTEXT.md exists — read it. If in-scope checks
> files changed, compare excerpts; mismatch = STOP.)

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW–MED (a façade over existing scripts; the scripts themselves don't change behaviour)
- **Depends on**: 058 (soft — design.json awareness degrades gracefully when absent). Must land before 060 (hooks call the detector).
- **Category**: dx
- **Planned at**: commit `48d13dd`, 2026-07-03

## Why this matters

The harness has 8+ deterministic check scripts, each run by hand with its
own invocation. Impeccable's detector shows the shape that makes checks
actually get run: **one entry point, path or file targets, `--json`, exit
codes 0/2/1, and a config-based ignore layer for team intent** ("fast signal
without asking an AI"). This plan builds that façade — `detect.py` — over
the existing scripts without changing any script's rules, plus a
`.tfx/config.json` ignore mechanism for product repos. It is the
prerequisite for hook wiring (plan 060).

Decision (grilling, 2026-07-03): the detector's default profile is the
**curated low-false-positive subset** — `token-audit`, `contrast`,
`a11y-static`, and type-scan's TYP-1 rule only. TYP-2 and other known-noisy
rules stay recording-only, available via `--all`. This honours the F3
deferral (plans/README.md batch 5): do NOT promote TYP-2 to blocking.

Config ignores COMPLEMENT tier waivers, never replace them: waivers are
per-instance control exceptions with a named approver; config ignores are
scan noise control (a legacy folder, a sanctioned raw value). The doc must
say this explicitly.

## Current state

- `harness/checks/` — `validate.py` (catalog self-check, NOT a page check —
  exclude from detect), `token-audit.py`, `contrast.py`, `a11y-static.py`,
  `type-scan.py`, `content-lint.py`, `component-manifest.py`,
  `audit-record.py` (record process check — exclude), `reaudit-scope.py`
  (query tool — exclude), `waiver-reconcile.py` (repo reconcile — exclude).
- Convention (`checks/README.md`): "exits 0 on pass and 1 on violation,
  prints violations with file/line/element and the control id — verbose on
  failure, silent on success." Each has `--self-test`.
- `token-audit.py` already has an allowlist mechanism (`--allow`,
  `checks/token-audit.allow`) — the config layer feeds it, doesn't replace it.
- No `.tfx/config.json` exists anywhere yet. 058 introduces the `.tfx/` dir
  (design.json).
- Impeccable's exit-code contract (adopted): **0 = clean, 2 = findings,
  1 = tool failure** — NOTE this differs from the existing per-script 0/1;
  detect.py maps script exit 1 (violations) → detect exit 2, and reserves 1
  for crashes/misconfiguration.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Detector self-test | `cd harness && python3 checks/detect.py --self-test` | exit 0 |
| Run curated profile | `python3 harness/checks/detect.py <path>` | 0 clean / 2 findings / 1 failure |
| All rules | `python3 harness/checks/detect.py --all <path>` | same contract |
| JSON output | `python3 harness/checks/detect.py --json <path>` | valid JSON on stdout |
| Existing self-tests | `cd harness && for c in token-audit contrast a11y-static type-scan; do python3 checks/$c.py --self-test; done` | all exit 0 |

## Scope

**In scope**:
- `harness/checks/detect.py` (create)
- `harness/checks/README.md` (new section: detect entry, exit-code contract, config ignores, waiver-vs-ignore distinction)
- `harness/docs/DESIGN-CONTEXT.md` (if 058 landed: one paragraph — detect runs the generator's `--check` staleness mode when `.tfx/design.json` exists)
- `harness/plans/README.md` (row)

**Out of scope**:
- Every existing check script's RULES and output — detect imports/invokes
  them (the `importlib` pattern from `waiver-reconcile.py` importing
  `audit-record.py` is the precedent); it does not edit them. Exception: if a
  script needs a tiny hook to accept an ignore list programmatically, that
  is allowed ONLY as an additive keyword argument, self-test proven.
- Promoting TYP-2 (or any recording-only rule) into the curated profile.
- Skills, catalog, website, hooks (060).
- The tier-waiver system.

## Git workflow

Branch `advisor/059-unified-detector`; commit
`feat(checks): detect.py unified entry — curated profile, --json, 0/2/1 exits, .tfx/config.json ignores (plan 059)`.

## Steps

### Step 1: Build `detect.py`

Stdlib-only. Behaviour:
- Targets: files/dirs (recursive), default `.`.
- Profiles: default = curated (`token-audit`, `contrast`, `a11y-static`,
  `type-scan --rules TYP-1` — if type-scan lacks per-rule selection, add the
  additive flag to type-scan.py with self-test cases); `--all` = every
  page-check script (adds content-lint, component-manifest, full type-scan).
- Reads `.tfx/config.json` from the target repo root when present:
  `{"detector": {"ignoreFiles": [globs], "ignoreValues": [strings], "ignoreRules": [ids]}}`
  — ignoreFiles filters targets, ignoreValues feeds token-audit's allow
  mechanism, ignoreRules drops whole rule ids from the run. `--no-config`
  bypasses.
- Output: pass through each script's text findings grouped per script;
  `--json` emits `{"findings": [{"check", "control", "file", "line", "message"}], "counts": …}`
  (parse the scripts' `ERROR`-line format — it is stable per checks/README).
- Exit: 0 clean, 2 findings, 1 any script crashed or config invalid.
- If `.tfx/design.json` exists AND 058's generator is present, also run
  `generate-design-json.py --check`; staleness = a finding, not a crash.
- `--self-test` ≥ 10 cases: profile selection, exit-code mapping, each
  ignore type, invalid config → exit 1, json shape.

**Verify**: `python3 harness/checks/detect.py --self-test` → exit 0; run against `harness/docs/loop-run/` (known corpus) with and without `--json` → exit code consistent between the two.

### Step 2: Document

`checks/README.md`: new top section for detect (contract, profiles, config
schema, and the waivers-vs-ignores paragraph verbatim in meaning from "Why
this matters"). Note the honest-enforcement line still binds: detect covers
only the built checks — never report unbuilt controls as passed.

**Verify**: `grep -c "detect.py" harness/checks/README.md` → ≥ 2.

### Step 3: Gates

All four existing self-tests still exit 0 (proves any additive type-scan
flag broke nothing); `python3 checks/validate.py` OK; `git status` in-scope
only; index row.

## Test plan

detect.py self-test (≥ 10) + the four wrapped scripts' unchanged self-tests
+ a real-corpus run over `docs/loop-run/`.

## Done criteria

- [ ] `detect.py --self-test` exit 0 (≥ 10 cases)
- [ ] Curated default excludes TYP-2; `--all` includes it (prove via self-test case)
- [ ] Exit contract 0/2/1 proven via self-test
- [ ] `.tfx/config.json` ignores honoured; `--no-config` bypasses
- [ ] Existing check self-tests all still exit 0
- [ ] README documents detect + waiver-vs-ignore distinction
- [ ] `git status` in-scope only; index row updated

## STOP conditions

- A wrapped script's output format doesn't match the documented `ERROR`-line
  convention closely enough to parse — report which one.
- Per-rule selection in type-scan requires more than an additive flag.
- Anything tempts you to change a rule's threshold or promote TYP-2.

## Maintenance notes

- New checks join detect by registration, not rewrite — document the
  registration point in detect.py's docstring.
- Plan 060 consumes the `--json` output and exit contract — changing either
  after 060 lands is a breaking change to the hook.
- The curated profile is a policy choice (grilling 2026-07-03); widening it
  is a design-lead decision, not a code tweak.
