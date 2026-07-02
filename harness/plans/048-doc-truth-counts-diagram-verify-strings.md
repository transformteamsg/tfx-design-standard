# Plan 048: Make the harness docs tell the truth — control count, layout diagram, self-test counts, catalog `verify:` script names

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `harness/plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat c42d695..HEAD -- harness/README.md harness/checks/README.md harness/checks/validate.py harness/standards/catalog.yaml`
> Plans 046/047 landing first is expected drift (skill fold + renames). For
> anything else, compare the "Current state" excerpts against the live code
> before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S–M
- **Risk**: LOW
- **Depends on**: 047 (soft — the regenerated README diagram should use the post-rename skill names; if 047 has not landed, use the current names and note it)
- **Category**: docs
- **Planned at**: commit `c42d695`, 2026-07-02

## Why this matters

The harness's credibility rests on its docs being exactly true — its own CLAUDE.md
rule is "don't overstate enforcement", and the 0.2.0 release existed largely to
kill doc drift. Yet today: the README says "47 controls" three times while the
catalog has 48; the README's repository-layout diagram shows four skills and a
`checks/` directory containing only a README "(planned)" while ten built check
scripts ship; `checks/README.md` documents type-scan's self-test as 27 cases while
it actually reports 34; and several catalog `verify:` fields cite script names
that don't exist under that name (`checks/labels`) or are still marked "(planned)"
though the script shipped (`checks/type-scan`). Each is small; together they are
exactly the drift class the harness claims to prevent. This plan fixes them and
adds a validator assertion so the control-count claim can never drift again.

## Current state

- `harness/README.md` — "47 controls" at lines 17, 60, 117 (pre-046/047 line
  numbers; find with grep). Actual count:
  `grep -c '^  - id:' harness/standards/catalog.yaml` → **48**.
- `harness/README.md:53-79` — repository-layout diagram. It lists only four
  skills (omits the onboarding skill), shows `checks/` as
  `└── README.md  # deterministic check scripts, mapped to control ids (planned)`,
  and omits `evals/`, `plans/`, `scripts/`, `CHANGELOG.md`, `CONTRIBUTING.md`,
  `standards/schema.json`, and the `docs/` subtrees (`loop-run/`, `reviews/`,
  `spikes/`, `catalog-changes/`).
- `harness/checks/README.md:179` — `**Self-test:** python3 checks/type-scan.py
  --self-test → SELF-TEST OK (27 cases)`. Actual:
  `python3 harness/checks/type-scan.py --self-test` → `SELF-TEST OK (34 cases)`.
  (All nine OTHER self-test counts in that README are correct — verified:
  validate 27, token-audit 23, audit-record 21, a11y-static 14, contrast 15,
  waiver-reconcile 7, reaudit-scope 8, content-lint 19, component-manifest 11.)
- `harness/standards/catalog.yaml` `verify:` fields citing scripts
  (`grep -n 'checks/' harness/standards/catalog.yaml`):
  - line 37 (A11Y-1): `checks/contrast` — correct, script exists.
  - line 65 (A11Y-3): `checks/labels` — **no such script**; the shipped static
    scan is `checks/a11y-static.py` (checks/README.md maps labels/focus/nrv to it).
  - lines 197/211/224 (TOK-1..3): `checks/token-audit` — correct.
  - lines 241/254/269/282 (TYP-1..4): `checks/type-scan` — correct.
  - line 300 (TYP-5): `checks/type-scan (planned)` — **stale**: type-scan ships,
    but it covers TYP-1..4 only; the tabular-nums subcheck is what's planned.
  - line 333 (COL-2): `checks/contrast / verified manually until wired` — acceptable, leave.
  - line 698 (LAY-4): `checks/layout-scan (planned)` — genuinely unbuilt; leave
    the "(planned)" but confirm the name matches the planned-scripts table in
    checks/README.md (line ~213).
- `harness/checks/validate.py` — pattern for adding a check: each check is a
  `*_errors(repo_root)` function returning a list of `ERROR ...` strings, called
  from main, with self-test cases in the `--self-test` block (currently 27
  cases). The existing `[L0-SYNC]` function (line ~200) is the exemplar to match.
- `harness/checks/README.md:14` documents validate's self-test count
  (`SELF-TEST OK (27 cases)`) — adding cases means updating this line too, in the
  same commit (this is the drift class being fixed; don't reproduce it).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Control count | `grep -c '^  - id:' harness/standards/catalog.yaml` | `48` |
| Validate | `python3 harness/checks/validate.py` | `OK: 48 controls valid`, exit 0 |
| Validate self-test | `python3 harness/checks/validate.py --self-test` | `SELF-TEST OK (N cases)` — N grows with your new cases |
| type-scan self-test | `python3 harness/checks/type-scan.py --self-test` | `SELF-TEST OK (34 cases)` |
| Website build | `pnpm build` | exit 0 (catalog.yaml feeds the site) |

## Scope

**In scope**:
- `harness/README.md` (counts + layout diagram)
- `harness/checks/README.md` (type-scan count; validate count after Step 4)
- `harness/standards/catalog.yaml` (ONLY the `verify:` strings at lines 65 and 300)
- `harness/checks/validate.py` (+ its self-test cases)

**Out of scope** (do NOT touch):
- Any control's `id`, `tier`, `check`, `applies_to`, `phase`, `title`, or
  `detail` fields — `verify:` wording at the two cited lines only. Changing
  enforcement semantics is a ratchet decision, not a docs fix.
- `checks/type-scan.py` itself — the script is right; its doc line is wrong.
- The LAY control ordering in catalog.yaml (LAY-4 appears before LAY-3) —
  considered and rejected as cosmetic churn; do not reorder.
- Skill files (`harness/.claude/skills/`).

## Git workflow

- Branch: `advisor/048-doc-truth`
- Commit style: `docs(harness): true up control count, layout diagram, self-test counts; guard the count`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fix the control count in README

`grep -n "47 controls" harness/README.md` — update every hit to "48 controls".
Also scan for a bare "47" used as the count elsewhere in the file
(`grep -n " 47 " harness/README.md`) and fix any that mean the control count.

**Verify**: `grep -c "47 controls" harness/README.md` → `0`; `grep -c "48 controls" harness/README.md` → `>= 2`.

### Step 2: Regenerate the repository-layout diagram

Rewrite the tree in `harness/README.md` (the fenced block starting
`design-harness/`) from the ACTUAL layout (`find harness -maxdepth 2 -type d`
plus the key files). It must include: all skills that exist on disk (post-047:
`design`, `standards`, `content`, `onboard`), `implement-craft.md` under the
design skill, `.claude/agents/evaluator.md`, `standards/` (README, catalog.yaml,
schema.json, controls/), `checks/` ("10 check scripts + fixtures/ + README —
see checks/README.md for coverage"), `evals/` (golden, routing,
evaluator-recall), `plans/`, `scripts/`, `docs/` (with one-line entries for
decisions/, loop-run/, reviews/, spikes/, catalog-changes/, SYNC.md,
ONBOARDING.md, UPDATING.md, harness-feedback.md, index.html), `CHANGELOG.md`,
`CONTRIBUTING.md`, `CLAUDE.md`. Keep the per-line comments in the current style
(short, purpose-first). Do not list every script filename — point at
checks/README.md as the source of truth (that is the repo's own convention:
"single-source built-checks").

**Verify**: every directory named in the new diagram exists
(`for d in standards checks evals plans scripts docs; do test -d harness/$d || echo MISSING $d; done` → no output), and the diagram names the same number of skills as `ls harness/.claude/skills/ | wc -l`.

### Step 3: Fix the two catalog `verify:` strings

- Line 65 (A11Y-3): replace `checks/labels` with `checks/a11y-static` (that
  script's label scan is the shipped static subset).
- Line 300 (TYP-5): replace `checks/type-scan (planned)` with
  `checks/type-scan tabular-nums subcheck (planned)` — the script exists; the
  TYP-5 coverage doesn't. Keep the rest of the string byte-identical.

**Verify**: `grep -n "checks/labels" harness/standards/catalog.yaml` → no output; `python3 harness/checks/validate.py` → `OK: 48 controls valid`; `pnpm build` → exit 0.

### Step 4: Fix the type-scan self-test count in checks/README

`harness/checks/README.md` line ~179: `27 cases` → `34 cases` for type-scan.

**Verify**: `python3 harness/checks/type-scan.py --self-test` output matches the documented count: `grep -n "type-scan.py --self-test" harness/checks/README.md` shows `34 cases`.

### Step 5: Add a [COUNT-SYNC] assertion to validate.py

Add a `count_parity_errors(repo_root)` function modelled on the existing
`[L0-SYNC]` one: read `harness/README.md` (path: `os.path.join(repo_root,
"README.md")` — note validate.py's repo_root is the `harness/` directory), find
every occurrence of the pattern `(\d+) controls`, and emit
`ERROR README.md [COUNT-SYNC]: says N controls, catalog has M` for any N != the
catalog's control count. Wire it into main alongside the other checks. Add
self-test cases (at minimum: matching count passes; mismatched count fires;
README with no count claim passes). Update `harness/checks/README.md`'s validate
section: the self-test count line AND the description of what validate checks
(add one line for [COUNT-SYNC]).

**Verify**:
1. `python3 harness/checks/validate.py` → exit 0.
2. `python3 harness/checks/validate.py --self-test` → `SELF-TEST OK (N cases)` with N ≥ 30.
3. Negative test: temporarily change one README "48 controls" to "49 controls", run validate → `[COUNT-SYNC]` ERROR, exit 1; revert.
4. `grep -n "COUNT-SYNC" harness/checks/README.md` → one hit, and the validate self-test count line matches step 2's N.

## Test plan

The validator self-test additions in Step 5 ARE the new tests (pass case, fire
case, absent-claim case — follow the structure of the existing [L0-SYNC]
self-test cases in validate.py's self-test block). Plus the two manual negative
tests (Steps 3/5 verifies).

## Done criteria

- [ ] `grep -c "47 controls" harness/README.md` → 0
- [ ] README diagram matches disk (Step 2 verify passes)
- [ ] `grep -n "checks/labels" harness/standards/catalog.yaml` → no output
- [ ] checks/README type-scan line says 34; validate line matches actual new count
- [ ] `python3 harness/checks/validate.py` exit 0; `--self-test` OK; [COUNT-SYNC] negative test fired and was reverted
- [ ] `pnpm build` exit 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `harness/plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The catalog count is not 48 when you run the count command (a control landed
  or was removed since planning) — recompute and adjust, but if the delta is
  more than ±1, report first.
- Editing a `verify:` string makes validate.py or the website build fail — the
  string is parsed somewhere this plan didn't anticipate.
- validate.py's repo_root does not resolve `README.md` where expected (check how
  the existing checks compute paths before assuming).

## Maintenance notes

- The durable fix for the `verify:`-string drift class is **enforcement as
  data**: a per-control `script:` (or `enforced:`) field in the catalog schema so
  "deterministic but unscripted" is machine-visible and the planned `slop-scan`
  can be tracked as data rather than prose. That is deliberately out of scope
  here (it touches schema.json, the website's public-catalog field allowlist in
  `lib/catalog.ts`, and validate.py) — see the direction findings in
  `harness/plans/README.md`. If adopted later, the [COUNT-SYNC] pattern from
  Step 5 is the exemplar.
- Whoever next adds a control: [COUNT-SYNC] now fails the build until README
  counts are updated — that is intended behaviour, not a validator bug.
