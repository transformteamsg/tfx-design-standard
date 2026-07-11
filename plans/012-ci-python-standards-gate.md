# Plan 012: Run the Python standards gate in CI

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Do NOT update `plans/README.md` — the reviewer
> maintains the index.
>
> **Drift check (run first)**: `git diff --stat 233f3be..HEAD -- .github/workflows/ci.yml package.json`
> On any change, compare the "Current state" excerpts; on a mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests (CI coverage gap)
- **Planned at**: commit `233f3be`, 2026-07-11

## Why this matters

The CI workflow's "Standards gate" runs only `scripts/check-standards.mjs`.
The deeper invariants live in `harness/checks/validate.py` — enforced/script
field pairing, script-path existence, doc registration, COUNT-SYNC (prose
control-counts match the catalog), and a 45-case self-test — and that runs in
**no** workflow. Vercel builds skip it too (the `prebuild` script bypasses the
Python gate when `$VERCEL` is set, because PyYAML isn't provisioned there). So
a PR that renames a check script, typos a `script:` path, or lets a doc count
drift stays green everywhere; the invariants only run when someone happens to
run `pnpm build` locally. CI is the natural home: Ubuntu runners have Python,
and installing PyYAML is one line.

## Current state

`.github/workflows/ci.yml` (full checks job today):

```yaml
jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - uses: pnpm/action-setup@v4
        with:
          version: 11

      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Standards gate
        run: node scripts/check-standards.mjs
```

`package.json` `prebuild` (the local gate this plan mirrors):

```
node scripts/check-standards.mjs && (test -n "$VERCEL" && echo 'Vercel build: skipping Python standards gate (pyyaml not provisioned; catalog validated by check-standards.mjs)' || (python3 harness/checks/validate.py --self-test && python3 harness/checks/validate.py && python3 harness/checks/token-audit.py app components lib && python3 harness/checks/a11y-static.py app components))
```

`harness/checks/validate.py` needs PyYAML (`import yaml`). `token-audit.py`
and `a11y-static.py` are stdlib-only. All are Python 3.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| YAML syntax | `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/ci.yml'))"` | exit 0 |
| Local rehearsal of the new steps | `python3 harness/checks/validate.py --self-test && python3 harness/checks/validate.py && python3 harness/checks/token-audit.py app components lib && python3 harness/checks/a11y-static.py app components` | all OK, exit 0 |

## Scope

**In scope**:
- `.github/workflows/ci.yml`

**Out of scope**:
- `package.json` — do not change the prebuild/Vercel behaviour.
- `deploy.yml` or any other workflow.
- The check scripts themselves.

## Git workflow

- Branch: `advisor/012-ci-python-standards-gate` from `233f3be`
- Commit style: `ci: run the Python standards gate (validate.py + static checks)`
- Do NOT push or open a PR.

## Steps

### Step 1: Add Python setup and the gate steps

After the "Standards gate" step in `.github/workflows/ci.yml`, add:

```yaml
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install PyYAML
        run: pip install pyyaml

      - name: Python standards gate
        run: |
          python3 harness/checks/validate.py --self-test
          python3 harness/checks/validate.py
          python3 harness/checks/token-audit.py app components lib
          python3 harness/checks/a11y-static.py app components
```

(This mirrors the local `prebuild` gate exactly, so CI and local builds enforce
the same set. Keep the step name "Python standards gate" — the header comment
at the top of ci.yml describes the job as "the fast checks"; these add ~seconds.)

**Verify**: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"` → exit 0.

### Step 2: Rehearse the exact commands locally

**Verify**: run the four commands from the new step in order at the repo root →
each exits 0 (`validate.py --self-test` prints `SELF-TEST OK (45 cases)` or
more; `validate.py` prints `OK: 60 controls valid…`).

## Test plan

No unit tests — a CI workflow is verified by YAML parse + local rehearsal of
its commands (steps 1–2). The real proof lands on the first push of this
branch to GitHub, which is the operator's call.

## Done criteria

- [ ] `ci.yml` parses as YAML and contains the four-command Python gate
- [ ] All four commands exit 0 locally at the repo root
- [ ] Only `.github/workflows/ci.yml` modified (`git status`)

## STOP conditions

- Any of the four commands fails locally at 233f3be — the gate would land red;
  report the failing command and output instead of committing.
- `ci.yml` has structurally changed since the excerpt (drift).

## Maintenance notes

- If the Vercel environment ever gains PyYAML, the `$VERCEL` bypass in
  `package.json` prebuild can be removed — separate change.
- If validate.py gains new sub-gates (e.g. `--coverage` assertions), add them
  here AND in prebuild together — the two lists must stay mirrored.
