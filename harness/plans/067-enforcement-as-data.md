# Plan 067: Enforcement as data — optional `enforced:`/`script:` catalog fields + derived coverage listing

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `harness/plans/README.md` — unless a reviewer dispatched you and told you
> they maintain the index.
>
> **Drift check (run first)**: `git diff --stat e673294..HEAD -- harness/standards/schema.json harness/standards/catalog.yaml harness/checks/validate.py lib/catalog.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. Plans 065/066 may legitimately have
> added controls — a changed catalog.yaml is expected; re-read it and stamp
> the new controls too.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED — schema change with ~12 downstream consumers; kept additive
  and optional to bound the blast radius
- **Depends on**: none (soft: run after 065/066 so their new controls get
  stamped in the same pass)
- **Category**: dx / tech-debt
- **Planned at**: commit `e673294`, 2026-07-08

## Why this matters

The catalog cannot distinguish "enforced by a script" from "deterministic in
principle but verified manually". Today ~20 of the 33 deterministic/hybrid
controls have **no script at all** (all of SLP-1..8, A11Y-4/5/6/9/10, MOT-1,
IDN-1/2, TYP-5, LAY-4, plus the deterministic halves of CMP-2/3 and LAY-1),
and the only place that gap is written down is a hand-maintained list in
`harness/plans/README.md` — which has **already drifted**: it omits IDN-2 and
LAY-1, both added 2026-07-06. Four catalog `verify:` strings promise
"(planned)" scripts that don't exist (TYP-5 tabular-nums, LAY-1/LAY-4
layout-scan, CMP-7 override-detection). The harness's own always-on rule says
"never report an unbuilt or un-run check as passed" — this plan makes the
built/unbuilt boundary machine-readable so that honesty stops depending on
prose. This was direction finding #1 in the plans README (operator-weighed,
now selected); impeccable.style's 45-rule deterministic detector is the
precedent that this class of check pays off.

## Current state

Verified 2026-07-08 at `e673294`:

- `harness/standards/schema.json` — top-level keys include `comment`,
  `required_fields` (id, source, title, tier, check, phase, applies_to,
  verify, waiver), `tier_waiver`, `checks`, `id_prefixes`
  (["A11Y","TOK","TYP","COL","CMP","CNT","MOT","IDN","SLP","LAY"]). The
  comment says: "Catalog schema shared by harness/checks/validate.py and
  scripts/check-standards.mjs — edit here, never in the validators." Optional
  fields precedent: `products:`/`audiences:` (plan 056) are optional,
  absent = global, never empty-list.
- `harness/checks/validate.py` — validates catalog entries against
  schema.json; has `--self-test` (34 cases); `collect_errors(repo_root)`
  aggregates step functions (e.g. `count_parity_errors` at ~line 311).
- `scripts/check-standards.mjs` (repo root) — the website's build gate;
  re-validates the catalog on deploy using the same schema.json.
- `lib/catalog.ts:26-44` — `PUBLIC_FIELDS` is a deny-by-default projection of
  catalog fields the website exposes; `products`/`audiences` were appended at
  lines 37-38 (plan 056 pattern, incl. `getScopeMeta()`); characterization
  tests exist (vitest, `pnpm test`, 18 passing as of plan 056's row).
- Ground-truth coverage map (audited 2026-07-08 — use as the stamping table;
  re-verify each `script:` claim against `harness/checks/README.md` before
  stamping):
  - `checks/token-audit.py` → TOK-1, TOK-2, TOK-3 (scale half), COL-1
    (partial: palette-bypass only), COL-2 (partial)
  - `checks/contrast.py` → A11Y-1 (static subset), COL-2 (contrast half)
  - `checks/a11y-static.py` → A11Y-2 (partial), A11Y-3 (partial), A11Y-8
    (partial)
  - `checks/type-scan.py` → TYP-1, TYP-2 (partial), TYP-3, TYP-4
  - `checks/content-lint.py` → CNT-1 (partial), CNT-3 (partial), SLP-9 (lint
    half)
  - `checks/component-manifest.py` → CMP-1 (partial, gated on
    `coverage:complete`)
  - No script: A11Y-4/5/6/7/9/10/11, TYP-5, CMP-2/3 (deterministic halves),
    CMP-5/6/7, CNT-2, MOT-1, IDN-1/2/3/4, SLP-1..8, SLP-10/11, LAY-1..7.
  - `checks/detect.py` is a façade over the six page-check scripts — it adds
    no coverage of its own and should NOT be stamped as a control's script.
- The `check:` field already encodes deterministic/judgment/hybrid; the new
  field must encode *enforcement reality*, orthogonal to check type.
  `judgment` controls are evaluator-verified by design — they are not
  "unscripted gaps" and must not read as such.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Validator (from `harness/`) | `python3 checks/validate.py` | `OK: <N> controls valid` |
| Validator self-test | `python3 checks/validate.py --self-test` | `SELF-TEST OK (≥34 cases)` |
| Coverage listing (new) | `python3 checks/validate.py --coverage` | table; exit 0 |
| Website gate (repo root) | `node scripts/check-standards.mjs` | exit 0 |
| Website tests (repo root) | `pnpm test` | all pass |
| Build (repo root) | `pnpm build` | exit 0 |

## Scope

**In scope**:
- `harness/standards/schema.json` (two optional fields)
- `harness/standards/catalog.yaml` (stamping `script:` where true; NO wording,
  tier, or `verify:` changes)
- `harness/standards/README.md` (schema doc: the two fields)
- `harness/checks/validate.py` (field validation + `--coverage` + self-tests)
- `harness/checks/README.md` (one paragraph: the field + the derived listing
  replaces hand lists)
- `scripts/check-standards.mjs` (only if it hardcodes allowed fields — read it
  first; if it validates via schema.json alone, no edit)
- `lib/catalog.ts` + its test file (expose `enforced`/`script` via
  PUBLIC_FIELDS — follow the plan-056 pattern)
- `harness/plans/README.md` (status row + replace the drifted hand list in the
  direction-findings section with a pointer to `--coverage`)

**Out of scope**:
- Building ANY new check script (slop-scan, layout-scan, etc.) — this plan
  makes the backlog queryable; building it is follow-up plans.
- Changing any control's `verify:` text, tier, or title — stamping only.
- The website's control-page UI (rendering the new field is optional follow-up
  for the site team; exposing the data is enough here).
- The `detail:` files — frontmatter repeats the catalog entry verbatim, so
  **stamping a control that has a detail file requires updating that detail
  file's frontmatter too** (validate.py enforces the match). This IS in scope
  — listed here so it isn't missed: every stamped control with a `detail:`
  needs its `controls/<id>.md` frontmatter updated identically.

## Git workflow

- Branch: `advisor/067-enforcement-as-data`
- Conventional commits, e.g. `feat(standards): optional enforced/script fields; validate + coverage listing (plan 067)`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extend the schema

In `harness/standards/schema.json`, add two OPTIONAL per-control fields
(mirroring how `products:`/`audiences:` are specified there — read their spec
first and match it):

- `enforced`: one of `script` | `partial` | `manual` | `evaluator`.
  Semantics (document in `standards/README.md` §Schema):
  - `script` — a checks/ script fully covers the control's deterministic claim
  - `partial` — a script covers a subset; the rest is manual/evaluator
  - `manual` — deterministic in principle, no script yet (the honest gap)
  - `evaluator` — judgment control; the evaluator subagent is the enforcement
  - Absent = `manual` for deterministic/hybrid, `evaluator` for judgment
    (defaults keep the field optional; validators apply the default, never
    write it back).
- `script`: repo-relative path(s) (string or list) to the covering script(s),
  e.g. `checks/token-audit.py`. Only valid when `enforced` is `script` or
  `partial`.

**Verify**: `python3 -c "import json; json.load(open('standards/schema.json'))"`
→ no error.

### Step 2: Validate the fields in validate.py

Add a step function (following the existing step-function pattern in
`collect_errors`): for each control — `enforced` value in the allowed set;
`script` present ⇒ `enforced` ∈ {script, partial}; every `script` path exists
on disk; `enforced: script|partial` ⇒ `script` present; `enforced: evaluator`
only on `check: judgment|hybrid` controls. Add self-test cases per the
existing fixture pattern (one passing, plus one failing case per rule —
missing file, bad value, script-without-enforced).

**Verify**: `python3 checks/validate.py --self-test` → `SELF-TEST OK (N
cases)`, N ≥ 40; `python3 checks/validate.py` → still `OK` (fields optional,
nothing stamped yet).

### Step 3: Stamp the catalog from the ground-truth map

Stamp ONLY controls a script actually covers, per the map in Current state —
`enforced: partial` + `script:` for every "partial" row, `enforced: script` +
`script:` only where coverage is full (TOK-1, TOK-2, TYP-1, TYP-3, TYP-4 —
re-verify each against `checks/README.md`'s per-script coverage section before
writing). Do not stamp `manual`/`evaluator` explicitly (defaults carry them).
Update the frontmatter of every stamped control's detail file identically
(validate.py fails otherwise — that failure is your safety net, run it).

**Verify**: `python3 checks/validate.py` → `OK: <N> controls valid`;
`grep -c "enforced:" standards/catalog.yaml` → equals the number of stamped
controls (expect ~13-15); `git diff standards/catalog.yaml | grep '^-' | grep -v '^---'`
→ no removed lines other than none (stamping is purely additive — no existing
line may change).

### Step 4: Derived coverage listing

Add `--coverage` to `validate.py`: print a table (id · tier · check ·
enforced[defaulted] · script) and a summary line
(`X script / Y partial / Z manual / W evaluator`), exit 0. This output
replaces the hand-maintained gap lists. Update `checks/README.md` (one
paragraph) and edit `harness/plans/README.md`'s direction-finding #1 hand
list to point at `python3 checks/validate.py --coverage` instead of
enumerating ids.

**Verify**: `python3 checks/validate.py --coverage` → table with one row per
control, summary counts sum to the control count; exit 0.

### Step 5: Expose via the website projection

Read `scripts/check-standards.mjs` — if it re-derives allowed fields from
schema.json, no edit; if it hardcodes a field list, add the two fields. In
`lib/catalog.ts`, append `"enforced"` and `"script"` to `PUBLIC_FIELDS` and
the control type (optional fields, plan-056 pattern at lines 12-13/37-38/63-64).
Update the characterization tests the way plan 056 did (find the vitest file
asserting the projection; add the fields to its expectations).

**Verify**: `node scripts/check-standards.mjs` → exit 0; `pnpm test` → all
pass; `pnpm build` → exit 0.

## Test plan

- validate.py self-test: ≥ 6 new cases (Step 2 rules, pass + fail each).
- Website: extend the existing catalog-projection characterization test for
  the two new optional fields (present on a stamped control, absent
  elsewhere); `pnpm test` all green.
- Manual negative test: temporarily stamp a control with
  `script: checks/does-not-exist.py`, run validate, confirm the error names
  the path, revert. Report the observed error line.

## Done criteria

- [ ] schema.json carries `enforced`/`script` as optional fields; README §Schema documents semantics + defaults
- [ ] `python3 checks/validate.py --self-test` → OK, ≥ 40 cases
- [ ] Catalog stamped per the map; purely additive diff; detail-file frontmatter in sync (validate green)
- [ ] `python3 checks/validate.py --coverage` prints the full table; summary counts sum to the catalog count
- [ ] plans/README direction-finding list replaced with the `--coverage` pointer
- [ ] `node scripts/check-standards.mjs` exit 0; `pnpm test` all pass; `pnpm build` exit 0
- [ ] Negative test (nonexistent script path) fired and reverted (reported)
- [ ] No control's title/tier/verify/waiver text changed (`git diff` inspection)
- [ ] `harness/plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `scripts/check-standards.mjs` REJECTS unknown fields rather than ignoring
  them and the fix is more than adding the two field names — the website gate
  breaking on deploy is the blast radius this plan must not have.
- A stamping claim in the Current-state map contradicts `checks/README.md`'s
  own coverage description — trust checks/README, note the discrepancy.
- The projection characterization tests fail in a way that suggests the
  website renders unknown fields (leak) — report; do not patch the UI.
- Plans 065/066 landed new controls whose coverage you cannot determine from
  checks/README — stamp nothing for them and note it.

## Maintenance notes

- Every future check-script plan must stamp its controls (`enforced` upgrade +
  `script:` path) in the same PR — validate.py's path-existence rule makes a
  wrong path fail loudly, but an *unstamped* new script is still possible;
  reviewers of checks/ PRs should ask "did the catalog get stamped?".
- The four "(planned)" `verify:` strings (TYP-5, LAY-1, LAY-4, CMP-7) become
  queryable as `manual` rows — when each script lands, update both the stamp
  and the verify string.
- Natural follow-up plan: `slop-scan` for the statically-checkable SLP-1..8
  subset — the biggest single `manual` cluster; after it, A11Y title/lang +
  skip-link (cheap static wins).
