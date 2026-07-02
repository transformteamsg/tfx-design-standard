# Plan 051: App verification baseline — working ESLint, a typecheck script, and characterization tests for the twin/catalog machinery

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `harness/plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat c42d695..HEAD -- package.json lib/ .github/workflows/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW–MED (the first lint run may surface a backlog)
- **Depends on**: none (independent; safe alongside 050 — coordinate on package.json if run concurrently)
- **Category**: dx / tests
- **Planned at**: commit `c42d695`, 2026-07-02

## Why this matters

The website has no working linter (`"lint": "next lint"` with no ESLint config
anywhere and no eslint in devDependencies — the script is dead, and `next lint`
is deprecated in Next 15), no standalone typecheck, and zero unit tests. The only
safety net is a full `next build` plus `scripts/check-standards.mjs`. The most
bug-prone code — the JSX-stripping/twin-derivation string machinery in
`lib/markdown-twin.ts` and the deny-by-default field allowlisting in
`lib/catalog.ts` (which decides what the public catalog route EXPOSES — a
regression there leaks internal fields) — has no fast check at all. This plan
establishes the baseline: a real ESLint flat config, `pnpm typecheck`,
Vitest characterization tests for those two modules, and a CI job that runs them
on every push/PR, separate from the deploy workflow.

## Current state

- `package.json` scripts:

  ```json
  "dev": "next dev",
  "prebuild": "node scripts/check-standards.mjs && (test -n \"$VERCEL\" && echo '…' || (python3 harness/checks/validate.py && … && python3 harness/checks/a11y-static.py app components))",
  "build": "next build",
  "check:standards": "node scripts/check-standards.mjs",
  "start": "next start",
  "lint": "next lint",
  "gen:icons": "node scripts/generate-ink-icons.mjs"
  ```

  No `test`, no `typecheck`. devDependencies: `@tailwindcss/postcss`,
  `@types/*`, `roughjs`, `tailwindcss`, `typescript` — no eslint, no test runner.

- No ESLint config file exists (checked: no `.eslintrc*`, no `eslint.config.*`).

- `lib/markdown-twin.ts` — key exports to characterize:
  `toMarkdown(title, description, body)` (line 34), `stripJsx(body)` (line 45,
  with internal `skipElementBlock` line 102 and `renderStrippedBlock` line 139),
  `controlMarkdown(id)` (line 278), `allTwins()` (line 309, memoized),
  `mdPaths()` (line 321), `resolveTwin(segments)` (line 327),
  `markdownResponse(text, htmlPath)` (line 333), `mdAlternate(htmlPath)` (line 347).
  These read `content/` and `harness/standards/` from disk at call time — tests
  can run against the real repo corpus (deterministic, checked in).

- `lib/catalog.ts` — `PUBLIC_FIELDS` (line 24) and `PUBLIC_META` (line 64,
  `["version", "updated", "waiver_syntax", "categories"]`) drive a
  deny-by-default projection of `harness/standards/catalog.yaml` for the public
  routes (lines 69–74 filter meta and controls to those keys).

- `.github/workflows/deploy.yml` — deploys to Vercel on push to main;
  `permissions: contents: read`; uses a `VERCEL_TOKEN` secret. There is no CI
  workflow running checks on PRs. Do NOT modify deploy.yml.

- Next 15 flat-config convention (from Next docs): use `FlatCompat` with
  `eslint-config-next`:

  ```js
  // eslint.config.mjs
  import { FlatCompat } from "@eslint/eslintrc";
  const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
  export default [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    { ignores: [".next/**", "node_modules/**", "components/ink-icons.generated.ts"] },
  ];
  ```

- Repo conventions: pnpm; TypeScript strict (check tsconfig.json `strict`
  before assuming); generated file `components/ink-icons.generated.ts` is
  committed and must be lint-ignored, not "fixed".

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `pnpm install` | exit 0 |
| Lint | `pnpm lint` | exit 0 after Step 2 triage |
| Typecheck | `pnpm typecheck` | exit 0 |
| Tests | `pnpm test` | all pass |
| Build | `pnpm build` | exit 0 |

## Scope

**In scope**:
- `package.json` (scripts + devDependencies) and `pnpm-lock.yaml`
- `eslint.config.mjs`, `vitest.config.ts` (create)
- `lib/markdown-twin.test.ts`, `lib/catalog.test.ts` (create)
- `.github/workflows/ci.yml` (create)
- Source files ONLY where a lint error requires a mechanical fix (unused import,
  missing dep array entry) — see Step 2's triage rule

**Out of scope** (do NOT touch):
- `.github/workflows/deploy.yml`
- Any behaviour change to `lib/markdown-twin.ts` / `lib/catalog.ts` — these
  tests CHARACTERIZE current behaviour; if a test reveals a bug, record it in
  the test as `// KNOWN: …` with a skip or an assertion of the current (buggy)
  output, and report it — do not fix it here.
- `harness/` entirely.
- The `prebuild` script line (Python gate) — leave as is; CI runs the node gate.

## Git workflow

- Branch: `advisor/051-verification-baseline`
- Commit style: `chore(web): working eslint flat config, typecheck script, vitest characterization tests, CI job`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add the toolchain

`pnpm add -D eslint eslint-config-next @eslint/eslintrc vitest`. Create
`eslint.config.mjs` per the snippet in Current state. Update scripts:

```json
"lint": "eslint .",
"typecheck": "tsc --noEmit",
"test": "vitest run"
```

**Verify**: `pnpm lint --version 2>/dev/null || pnpm exec eslint --version` → a 9.x version prints; `pnpm typecheck` → exit 0 (if it fails, the errors predate this plan — record them, fix ONLY mechanical ones like unused `@ts-expect-error`, and STOP if more than 10 non-mechanical errors).

### Step 2: Triage the first lint run

Run `pnpm lint`. Expected: a backlog of warnings/errors from the un-linted
history. Triage rule:

- Auto-fixable (`pnpm exec eslint . --fix`): apply, then eyeball `git diff` —
  revert any fix that changes behaviour (e.g. hook dependency additions that
  alter effect timing; prefer `// eslint-disable-next-line react-hooks/exhaustive-deps`
  with a one-line reason for those).
- Manual errors ≤ 15: fix the mechanical ones (unused vars/imports), disable-with-reason
  the judgment ones.
- Manual errors > 15: STOP and report the list — the operator decides
  fix-vs-ratchet.

**Verify**: `pnpm lint` → exit 0.

### Step 3: Vitest config + characterization tests

Create `vitest.config.ts` (node environment, include `lib/**/*.test.ts`; no
jsdom needed). Write:

- `lib/markdown-twin.test.ts` — cases:
  1. `stripJsx` preserves fenced code blocks verbatim (input with a ```block
     containing `<Component/>` keeps it).
  2. `stripJsx` removes a JSX element block spanning multiple lines, including
     nested same-tag blocks (exercises `skipElementBlock`).
  3. `stripJsx` on a self-closing component line yields no leftover fragment.
  4. `toMarkdown` output starts with `# <title>` and includes the description
     when present (assert the actual current format — read the function first).
  5. `resolveTwin(["standards", "catalog"])`-style known path (derive a real
     path from `mdPaths()`: assert `mdPaths().length > 0`, then
     `resolveTwin(<first path's segments>)` returns a twin whose markdown is
     non-empty).
  6. `resolveTwin(["nope", "nothing"])` → `null`.
  7. `controlMarkdown("tok-1")` (a control with a detail file) contains the
     control id, and an unknown id behaves per current implementation (read it
     first; assert that behaviour).
  8. `mdAlternate` maps an html path to its `.md` twin URL per current
     behaviour.
- `lib/catalog.test.ts` — cases:
  1. The public catalog projection exposes ONLY `PUBLIC_META` keys at the meta
     level (compute set-difference against the parsed YAML's meta keys — must
     equal the allowlist intersection).
  2. Every control object in the public projection has keys ⊆ `PUBLIC_FIELDS`.
  3. Deny-by-default regression guard: add a fake key to a parsed control
     in-memory (do NOT edit the YAML) and assert the projection drops it —
     if the projection function only takes the file path, restructure the test
     to assert on the real corpus only and note the limitation.

Read both modules fully before writing assertions — characterize what IS, not
what seems right.

**Verify**: `pnpm test` → all pass (≥ 11 tests).

### Step 4: CI workflow

Create `.github/workflows/ci.yml`: trigger `on: [push, pull_request]` (push:
branches-ignore nothing; PRs to main), `permissions: contents: read`, one job:
checkout (same action major as deploy.yml uses — v7), setup-node v6 + pnpm
(mirror deploy.yml's setup steps — read it for the exact pnpm bootstrapping),
then `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`,
`pnpm test`, `node scripts/check-standards.mjs`. Do NOT run `pnpm build` in CI
(the Python gate and Vercel handle build; keep CI fast) and do NOT touch
deploy.yml.

**Verify**: `pnpm exec node -e "const y=require('fs').readFileSync('.github/workflows/ci.yml','utf8'); console.log(y.includes('pnpm lint') && y.includes('typecheck') && y.includes('vitest')===false)"` → prints `true` (script names, not raw vitest); plus a YAML sanity parse (`python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/ci.yml'))"` → exit 0).

### Step 5: Full pass

`pnpm lint && pnpm typecheck && pnpm test && pnpm build` → all exit 0.

## Test plan

Steps 3's eleven-plus characterization cases are the deliverable. Model
structure on standard Vitest (`describe`/`it`, no snapshot files — inline
assertions so drift is readable in review). The lint/typecheck scripts are
self-verifying.

## Done criteria

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` all exit 0
- [ ] ≥ 11 tests across the two test files, all passing
- [ ] `eslint.config.mjs` ignores `.next`, `node_modules`, `ink-icons.generated.ts`
- [ ] `.github/workflows/ci.yml` exists, parses, runs the four checks; deploy.yml untouched
- [ ] Any KNOWN bugs found by characterization are listed in the completion report
- [ ] No behaviour change in `lib/` (`git diff lib/ --stat` shows only new `*.test.ts` files)
- [ ] `harness/plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `pnpm typecheck` fails with more than 10 non-mechanical errors (Step 1).
- The first lint run has more than 15 manual errors (Step 2).
- A characterization test reveals the public catalog projection currently
  LEAKS a non-allowlisted field — that is a live finding, not a test to
  make pass; report immediately.
- `eslint-config-next` and the installed Next version are incompatible with the
  FlatCompat pattern (config fails to load) — report the exact error rather
  than downgrading packages.

## Maintenance notes

- CI now fails on lint/type/test regressions before deploy; the deploy workflow
  still runs independently on main — a reviewer may later want deploy gated on
  CI (deliberately deferred: gating deploys changes release behaviour and needs
  the operator's call).
- When `lib/markdown-twin.ts` next changes (e.g. new twin types), the
  characterization tests will fail loudly — update the assertions WITH the
  behaviour change in the same PR; that is the tests doing their job.
- Deferred: component/route testing (would need jsdom/playwright — not worth it
  for a static site yet), and `pnpm audit` in CI (advisory noise vs. value —
  operator's call).
