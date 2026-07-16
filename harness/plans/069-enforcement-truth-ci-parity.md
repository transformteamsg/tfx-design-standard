# Plan 069: Make enforcement claims true — CI runs the Python gate, type-scan wired, wiring parity-checked, detect.py role settled

> **Executor instructions**: Follow this plan step by step. Run every verification
> command and confirm the expected result before moving on. If anything in "STOP
> conditions" occurs, stop and report — do not improvise. Do NOT update
> `harness/plans/README.md` — your reviewer maintains the index.
>
> **Drift check (run first)**: `git diff --stat b329c0c..HEAD -- harness/checks .github/workflows/ci.yml package.json`
> Plan 068 (type-scale migration) and an upstream content-controls batch are EXPECTED
> to have landed after this plan was written — that is required, not drift (see
> "Depends on"). STOP only if the "Current state" excerpts below no longer match.

## Status

- **Priority**: P1 · **Effort**: M · **Risk**: MED (wiring checks into CI can surface real findings)
- **Depends on**: plan 068 merged (type-scan must be clean over `components app` — it is post-068)
- **Category**: dx / correctness (enforcement truth)
- **Planned at**: commit `b329c0c`, 2026-07-16

## Why this matters

The catalog's `enforced: script|partial` fields (added in plan 067) advertise automated
enforcement that automation does not deliver. Today `.github/workflows/ci.yml` runs
**none** of the Python checks — its "Standards gate" step is only
`node scripts/check-standards.mjs` (catalog shape + content registration). The local
`package.json` prebuild runs 3 of the 8 catalog-referenced scripts (`validate.py`,
`token-audit.py`, `a11y-static.py`); `type-scan.py`, `content-lint.py`, `contrast.py`,
`component-manifest.py` run nowhere automatically. A reader trusting `enforced: script`
on a control believes it is gated; on CI it is not. There is also no machine check that
keeps the catalog's claims and the actual run set consistent — they drift silently.

After this plan: CI runs the same Python gate as prebuild; `type-scan.py` is wired into
both (its tree is clean post-068); `validate.py` gains a `[WIRING-SYNC]` sub-check that
fails when a script-enforced control's script runs in neither prebuild nor CI and is not
on a documented exemption list; and `detect.py`'s hook-only role is stated in
`checks/README.md` instead of being implied.

## Current state

- `.github/workflows/ci.yml` — steps: checkout, pnpm/node setup, `pnpm install
  --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, then
  `- name: Standards gate` / `run: node scripts/check-standards.mjs`. No Python setup,
  no `harness/checks/*.py` anywhere in the file.
- `package.json` `prebuild`:
  `node scripts/check-standards.mjs && (test -n "$VERCEL" && echo '…skipping Python…' || (python3 harness/checks/validate.py --self-test && python3 harness/checks/validate.py && python3 harness/checks/token-audit.py app components lib && python3 harness/checks/a11y-static.py app components))`
- `harness/checks/validate.py` — the catalog validator. Relevant internals:
  - `effective_enforcement(control)` → `(value, was_defaulted)`; default `manual`
    (deterministic/hybrid) or `evaluator` (judgment).
  - `collect_errors` (~line 600) already chains parity helpers:
    `l0_parity_errors(...)`, `slp9_parity_errors(...)`,
    `count_parity_errors(repo_root, len(catalog_by_id))` — follow this exact pattern.
  - `count_parity_errors` (~line 345) is the exemplar extractor: regex over files,
    emit `ERROR <rel> [COUNT-SYNC]: …` strings, return a list.
  - `run_self_test()` (~line 613) — inline cases; `[COUNT-SYNC]` cases at ~863-897
    show the pattern for testing a parity helper against a tempdir.
- `harness/checks/detect.py` — a runner façade (curated profile: token-audit, contrast,
  a11y-static, type-scan TYP-1 only; `--all` adds the rest). Its ONLY caller is
  `harness/hooks/design-hook.py`, and `harness/hooks/README.md:39-40` says the hook is
  deliberately NOT shipped in the plugin (`plugin.json` has no `hooks` key) — it's a
  paste-in `settings.json` snippet, consent by construction.
- `harness/checks/README.md` "Wiring status" paragraph (~lines 313-325) is stale
  post-068: it still says type-scan "flags sub-14px `text-[11/12/13px]` labels …
  across `app`/`components`" and that wiring "is deferred until the live tree is clean"
  — the tree IS clean now.
- Catalog scripts claimed by `enforced: script|partial` (via `script:` fields):
  `checks/contrast.py`, `checks/a11y-static.py`, `checks/token-audit.py`,
  `checks/type-scan.py`, `checks/content-lint.py`, `checks/component-manifest.py`,
  plus `validate.py` self-referentially on some meta controls. Confirm the live set
  with: `python3 harness/checks/validate.py --coverage`.

Repo conventions: checks are stdlib+PyYAML Python; every script has `--self-test`;
error lines are `ERROR <loc> [<TAG>]: <msg>`; Singapore English in prose; never report
an un-run check as passed.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Validate | `python3 harness/checks/validate.py --self-test && python3 harness/checks/validate.py` | self-test OK; `OK: <N> controls valid` |
| Coverage table | `python3 harness/checks/validate.py --coverage` | table + summary, exit 0 |
| Type-scan | `python3 harness/checks/type-scan.py components app` | exit 0, zero ERRORs (post-068) |
| Full local gate | `pnpm build` | exit 0 |
| CI file syntax | `node -e "console.log('n/a')"` — CI can't run locally; verify by careful YAML review + `pnpm build` equivalence | — |

## Scope

**In scope**: `.github/workflows/ci.yml`, `package.json` (prebuild string only),
`harness/checks/validate.py`, `harness/checks/README.md` (Wiring status + detect.py
role prose), `harness/docs/SYNC.md` (register the new check).

**Out of scope**: `harness/checks/detect.py` (no code change — role is documented, not
altered), `harness/hooks/*`, `scripts/check-standards.mjs` (the JS/Python validator
split is a separate concern — do NOT try to port `enforced:` validation into it here),
all other check scripts, the catalog itself, `content-lint.py`/`contrast.py`/
`component-manifest.py` wiring (stays manual — they surface pre-existing findings;
they go on the exemption list with reasons, they do NOT get wired in this plan).

## Git workflow

Branch `advisor/069-enforcement-truth`. Commit per step; conventional style, e.g.
`ci: run the Python standards gate`, `feat(checks): [WIRING-SYNC] parity between catalog enforcement claims and the run set`.

## Steps

### Step 1: CI runs the Python gate

In `.github/workflows/ci.yml`, after the pnpm/node setup steps, add Python setup and a
gate step mirroring prebuild's Python chain:

```yaml
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install PyYAML
        run: pip install pyyaml
```

and extend the Standards gate (or add a following step `Python standards gate`) to run:
`python3 harness/checks/validate.py --self-test && python3 harness/checks/validate.py && python3 harness/checks/token-audit.py app components lib && python3 harness/checks/a11y-static.py app components`

**Verify**: run that exact command chain locally → exit 0. YAML parses:
`python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"` → no error.

### Step 2: Wire type-scan into prebuild and CI

Append `&& python3 harness/checks/type-scan.py app components` to the Python chain in
BOTH `package.json` prebuild and the CI step from Step 1.

**Verify**: `python3 harness/checks/type-scan.py app components` → exit 0 zero ERRORs
(if not, plan 068 has not landed — STOP). `pnpm build` → exit 0.

### Step 3: `[WIRING-SYNC]` parity check in validate.py

Add `wiring_parity_errors(repo_root)` modelled on `count_parity_errors`:

1. Claimed set: for each control where `effective_enforcement(control)[0]` is
   `script` or `partial`, collect its `script:` values (string or list — reuse the
   normalisation in `format_script`), basenames like `checks/type-scan.py`.
2. Running set: regex `checks/([a-z0-9-]+\.py)` over the text of `package.json` and
   `.github/workflows/ci.yml` (resolve both relative to the REPO ROOT above
   `harness/` — note `validate.py`'s `REPO_ROOT` points at `harness/`; walk one level
   up for these two files, and skip gracefully with a NOTE if either is absent, e.g.
   when the harness ships standalone as a plugin).
3. Exemption list: a module-level constant, e.g.
   `WIRING_EXEMPT = {"checks/content-lint.py": "pre-existing CNT-3 findings in content/ — wire after cleanup", "checks/contrast.py": "…", "checks/component-manifest.py": "…"}`
   (verify each reason against `checks/README.md`'s wiring prose and keep them
   one-line honest).
4. For each claimed script neither in the running set nor exempt →
   `ERROR harness/standards/catalog.yaml [WIRING-SYNC]: <id> claims enforced:<val> via <script> but it runs in neither prebuild nor CI and is not exempted`.
   An exempt entry whose script no longer exists or is no longer claimed → ERROR too
   (dead exemption). A running script not claimed by any control is NOT an error.

Call it from `collect_errors` after `count_parity_errors`. Self-test: add cases per the
`[COUNT-SYNC]` pattern (~lines 863-897) — claimed+running → clean; claimed+unwired+
unexempted → fires; dead exemption → fires. Register `[WIRING-SYNC]` in
`harness/docs/SYNC.md`'s Registered blocks table (source: catalog `enforced/script`
fields; consumers: package.json prebuild + ci.yml).

**Verify**: `python3 harness/checks/validate.py --self-test` → OK, case count up ≥3;
`python3 harness/checks/validate.py` → exit 0 (after Steps 1-2, type-scan is wired, so
only the three exempted scripts remain unwired — by design).

### Step 4: Truthful prose — README wiring status + detect.py role

In `harness/checks/README.md`: rewrite the "Wiring status" paragraph to the new
reality (type-scan wired into prebuild + CI post-068; content-lint/contrast/
component-manifest manual with the same reasons as `WIRING_EXEMPT`; `[WIRING-SYNC]`
now enforces this list). Add a short "detect.py role" note where detect.py is
documented: it is the **hook-only** runner (consent-by-construction settings snippet,
see `hooks/README.md`) and is deliberately NOT part of prebuild/CI — the decision is
"keep, hook-only", not deprecation.

**Verify**: `grep -n "not yet wired" harness/checks/README.md` → the stale type-scan
claim is gone; `python3 harness/checks/validate.py` still exit 0.

## Done criteria

- [ ] `.github/workflows/ci.yml` contains the Python gate incl. `type-scan.py`; YAML loads
- [ ] `package.json` prebuild includes `type-scan.py app components`; `pnpm build` exit 0
- [ ] `validate.py --self-test` OK with new `[WIRING-SYNC]` cases; `validate.py` exit 0
- [ ] Removing `type-scan.py` from prebuild+CI locally (temporary edit, then revert) makes `validate.py` fail with `[WIRING-SYNC]` — negative test, result reported
- [ ] `checks/README.md` wiring prose matches reality; SYNC.md table gains the row
- [ ] `git status` — no files outside scope

## STOP conditions

- `type-scan.py app components` is not clean (plan 068 missing).
- The claimed-scripts set from `--coverage` differs materially from the one listed in
  Current state (catalog drifted) — report the live set before proceeding.
- Step 3's repo-root resolution proves wrong (package.json not found where expected).
- `pnpm build` fails for reasons unrelated to your edits — twice after one fix attempt.

## Maintenance notes

- Future check scripts: stamping a control `enforced: script` now REQUIRES wiring the
  script or adding an exemption with a reason — that friction is the point.
- CI runtime grows by the pip install (~seconds); if it matters later, cache pip.
- Deferred, recorded: porting `enforced:` validation into `check-standards.mjs`
  (Vercel/CI JS path) — separate decision; promoting detect.py to the single runner —
  rejected for now (hook-only role documented in Step 4).
