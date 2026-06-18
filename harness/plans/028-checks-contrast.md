# Plan 028: Build `checks/contrast` — a static A11Y-1 contrast scan

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 5f95350..HEAD -- harness/checks/ app/globals.css`
> (git paths are from the repo/worktree root; `globals.css` lives at `app/globals.css`
> at the **worktree root**, a sibling of `harness/`, NOT under `harness/`). If
> `checks/a11y-static.py` (the structural model) or `app/globals.css` (the self-test
> fixture source) changed materially, compare against "Current state" before building;
> on a mismatch, STOP. **Path note for the whole plan:** the check scripts live under
> `harness/checks/` and are run from `harness/` (e.g. `python3 checks/contrast.py …`),
> but the CSS token source is in the sibling website project — from `harness/` it is
> **`../app/globals.css`**, not `app/globals.css`.

## Status

- **Priority**: P1 (issue #5 / HF-9 — an L0 A11Y-1 contrast fail was caught only by a
  manually-injected axe-core scan; `a11y-static.py` has no contrast coverage, so the
  static pass was silent)
- **Effort**: L
- **Risk**: MED — contrast is genuinely hard to resolve statically; the design bar is
  **honesty about the false-negative surface**, not full coverage. The reviewer must
  scrutinise what the check claims vs. what it actually resolves.
- **Depends on**: none (sibling of `checks/a11y-static.py`, `checks/token-audit.py`)
- **Category**: dx (deterministic check — makes part of A11Y-1 mechanical)
- **Planned at**: commit `5f95350`, 2026-06-17

## Why this matters

`a11y-static.py`'s own docstring says contrast (A11Y-1) "needs rendered colours" and is
**out of scope** for it. So the static accessibility pass is *silent* on contrast — the
attendance run's L0 avatar fail (3.32:1) and the functional-chip fails (~4.25–4.29:1)
were caught only by a manually-injected axe scan. `checks/contrast` closes the part of
that gap that **is** statically resolvable: when a colour and its background are set
together (same class string or rule) **and** both resolve to known token colours, the
ratio can be computed and a sub-AA pair flagged before render. It will not catch
inherited or computed backgrounds — and it must say so loudly, never report a silent
pass for what it cannot resolve. This mirrors the harness rule: never overstate
enforcement.

## Current state

- `checks/a11y-static.py` — **the structural model to copy**: `TARGET_EXTENSIONS`,
  per-line comment stripping (`_strip_block_comments`), `check_file()` returning
  `ERROR <file>:<line> [<CTL>] <found> — suggest: <…>` strings, `scan_paths()`, an
  embedded `run_self_test()` with `assert_violations` / `assert_clean` helpers printing
  `SELF-TEST OK (N cases)`, and `main()` taking `<path>... | --self-test`. Match this
  shape, output format, and exit-code convention (0 clean / 1 on violations) exactly.
- `app/globals.css` (at the **worktree root**, a sibling of `harness/` — so `../app/globals.css`
  when running from `harness/`, never `harness/app/...`) — the **token source and a real
  self-test fixture**. Relevant facts
  the check must resolve, all in `:root` (lines ~4–57) and `@theme inline` (lines ~59–83):
  - Direct hex tokens, e.g. `--foreground: #18181b;`, `--surface: #ffffff;`,
    `--tw-blue: #0064ff;` (the product primary), `--success: #2a7e3b;` (grass-11 text),
    `--danger: #ce2c31;` (red-11 text).
  - `color-mix(in oklab, var(--x) N%, var(--y))` tokens, e.g.
    `--success-subtle: color-mix(in oklab, var(--success-9) 8%, var(--surface));` and
    `--tw-blue-hover: color-mix(in oklab, var(--tw-blue) 88%, black);`.
  - `@theme inline` aliases that Tailwind utilities resolve through, e.g.
    `--color-foreground: var(--foreground);`, `--color-success: var(--success);` →
    a `text-foreground` / `bg-success` utility resolves to those hex values.
  - The file even states known-good ratios in comments ("step-11 text clears the 4.5:1
    floor", "amber-11 darkened → 6.1:1 on --warning-subtle") — use these as self-test
    oracles.
- There is **no `col-2.md`** and no contrast token doc — the check resolves colours from
  a CSS file passed on the command line via `--tokens` (the token file is
  product-specific; for this repo's own site it is `../app/globals.css` from `harness/`),
  not from the catalog.
- `checks/README.md` — documents each check's scope and honest limits; add a section.

### Repo conventions to honour

- Pure standard-library Python 3 (the sibling checks import only `os`, `re`, `sys`,
  `tempfile`). **No third-party dependencies.**
- Honest-scope docstring listing "What this script does NOT verify" (copy that section's
  spirit from `a11y-static.py`).
- Output and exit codes identical to the siblings so the verify phase can call it the
  same way.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Self-test (path-independent — inline temp fixtures) | `python3 checks/contrast.py --self-test` | `SELF-TEST OK (N cases)` exit 0 |
| Run on this repo's site (from `harness/`) | `python3 checks/contrast.py --tokens ../app/globals.css ../app/` | exit 0 (or ERROR/NOTE lines) — `../app` is the sibling website project, NOT `harness/app` |
| Resolve real tokens | `python3 checks/contrast.py --tokens <product>/app/globals.css <path>...` | resolves theme colours; no silent pass |
| Validator unaffected | `python3 checks/validate.py` | `OK: N controls valid` (unchanged) |

## Scope

**In scope** (the files you create/modify):
- `checks/contrast.py` (create) — the static contrast scan with embedded self-test.
- `checks/README.md` — add a "contrast" section (scope + honest limits).
- `.claude/skills/tfx-design-ui/SKILL.md` — the Phase-5 / v0-reality built-checks list
  (lines ~116–138 + the Phase-5 step-1 command list ~324–334): add one bullet/command
  for `checks/contrast` as a **static subset** of A11Y-1.
- `harness/CLAUDE.md` — the "Built `checks/` scripts" bullet: add `contrast.py`.

**Out of scope** (do NOT touch):
- The catalog, control detail files, `schema.json`.
- A11Y-1's tier or definition — this is tooling for an existing L0 control, not a new
  control. (The functional-chip *standard* refinement is plan 029.)
- Rendered-DOM / axe integration, non-text (UI) contrast, and arbitrary computed
  colours — explicitly deferred; the check must report these as "can't verify", not
  pass. Do NOT attempt a headless browser here.
- The stale "only validate, token-audit, audit-record are built" line in
  `tfx-design-review/SKILL.md:37` — it predates a11y-static/component-manifest too;
  note it for a separate cleanup, don't expand this plan to fix unrelated drift.

## Git workflow

- Branch: `advisor/028-checks-contrast`. Conventional commits
  (`feat(checks): add contrast.py — static A11Y-1 contrast subset (HF-9)`). Do NOT push.

## Steps

### Step 1: Build the token resolver

In `checks/contrast.py`, resolve a `name → (r,g,b)` map from a CSS file given by
`--tokens <file>` (the token source is product-specific — for this repo's own site,
`../app/globals.css` from `harness/`; the self-test uses inline temp fixtures, so it
needs no real path):

1. Parse `--<name>: <value>;` declarations inside `:root { … }`.
2. `<value>` is one of: a hex (`#rgb`/`#rrggbb`), `var(--other)` (resolve transitively),
   `color-mix(in oklab, var(--a) <p>%, <b>)` where `<b>` is `var(--c)`, a hex, `white`,
   or `black`, or a bare CSS colour keyword (`white`/`black` → `#ffffff`/`#000000`).
3. Build `@theme inline` aliases (`--color-foo: var(--bar)`) so a Tailwind
   `text-foo`/`bg-foo` utility maps to `--bar`'s resolved colour.
4. Resolve lazily with cycle protection; an unresolved token stays `None` (→ reported as
   "can't verify", never guessed).

**color-mix(in oklab, A p%, B)** — convert A and B from sRGB to OKLab, linearly
interpolate (`p` weights A, `100−p` weights B), convert back to sRGB. Use the standard
conversion (sRGB→linear→LMS via the OKLab matrices→Lab; reverse to return), per the
OKLab spec (https://bottosson.github.io/posts/oklab/). If implementing OKLab proves
unreliable within a reasonable attempt, take the **escape hatch in Step 4**.

**Verify**: a scratch call resolving `--success-subtle` and `--tw-blue` returns sane RGB
(e.g. `--surface` → (255,255,255)); confirmed via the self-test in Step 3.

### Step 2: Detect text/background pairings and compute the ratio

- **Line-local pairings only** (same philosophy as `a11y-static`): a violation needs
  BOTH a foreground and a background colour set on the same class string or CSS rule.
  - Tailwind: a class string containing `text-<name>` AND `bg-<name>` → resolve both
    through the theme alias map.
  - CSS/inline: a rule/`style="…"` with both `color:` and `background[-color]:` (hex or
    `var(--token)`).
- **WCAG 2.1 contrast**: relative luminance per channel `c∈[0,1]`:
  `lin = c/12.92 if c ≤ 0.03928 else ((c+0.055)/1.055)**2.4`;
  `L = 0.2126*R_lin + 0.7152*G_lin + 0.0722*B_lin`;
  `ratio = (Lmax + 0.05) / (Lmin + 0.05)`.
- **Thresholds**: ratio `< 3.0` → ERROR (fails even large-text). `3.0 ≤ ratio < 4.5` →
  ERROR noting "passes only as large text (≥24px / 18.66px bold); confirm the text size".
  `≥ 4.5` → clean. (Don't try to infer font-size line-locally; flag conservatively and
  let the note carry the large-text caveat.)
- **Unresolvable pair** (a token is `None`, a dynamic/`clsx` class, or only one of fg/bg
  present) → do **not** ERROR and do **not** pass silently: collect it and, in `main`,
  print a `NOTE contrast: could not resolve <…> at <file>:<line> — verify manually`
  line. Exit code stays 0 for notes alone; 1 only when a real ERROR is present.

Emit ERRORs in the sibling format:
`ERROR <file>:<line> [A11Y-1] text <fg> on <bg> = <ratio>:1 (below 4.5:1) — suggest: use a higher-contrast token (e.g. Radix step-12 for small text)`.

### Step 3: Embedded self-test

Add `run_self_test()` mirroring `a11y-static.py`'s structure (`assert_violations` /
`assert_clean`; plus a **new** `assert_ratio(name, fg_hex, bg_hex, expected, tol=0.1)`
helper you create — `a11y-static.py` has only `assert_violations`/`assert_clean`, NO
ratio helper to mirror, so you are adding one), with cases including:

- **The avatar fail** (the triggering bug): a `text-foreground`-on-`bg-tw-blue` class
  string (`#18181b` on `#0064ff`) → ratio **≈ 3.60** → ERROR `[A11Y-1]`. Use the real
  token name `bg-tw-blue` (this repo's primary is `--tw-blue` / `--color-tw-blue`;
  there is **no** `--primary` / `bg-primary` here — those are shadcn-convention names
  absent from this repo's tokens). The issue's "3.32:1" was the consumer app's slightly
  different pairing; for these exact hexes the WCAG formula gives ≈3.60. Both are below
  4.5, so both flag — assert with `tol=0.1` against **3.60**, not 3.3.
- **Unambiguous known-good**: `#ffffff` on `#18181b` → **≈ 17.7** → clean. (Do NOT use
  white-on-`#0064ff` as the clean oracle: it computes to **≈ 4.92**, which only just
  clears the 4.5 floor and makes a brittle test.)
- **color-mix resolution**: `--success` (`#2a7e3b`) on `--success-subtle`
  (8% grass-9 on white) → ≥ 4.5 → clean (the globals.css comment asserts this).
- **A genuine sub-AA functional pair** (the HF-9 evidence): a step-11-on-step-3-style
  pair computed to ≈ 4.25 → ERROR with the large-text note.
- **Unresolvable**: `text-[var(--unknownToken)]` or a `clsx(...)` dynamic class → a
  NOTE, not an ERROR, and not a silent pass.
- **Comment stripping**: a commented-out bad pair → clean (reuse the sibling's
  comment-strip helper).

**Verify**: `python3 checks/contrast.py --self-test` → `SELF-TEST OK (N cases)`, exit 0.

### Step 4 (escape hatch): known-bad-pairing fallback if OKLab is unreliable

If Step 1's `color-mix(oklab)` resolution cannot be made reliable (self-test ratios for
the mixed tokens don't match the globals.css-stated values within ±0.1), **do not ship a
wrong resolver**. Instead:

- Resolve only direct-hex and `var()` chains (drop `color-mix`).
- Add a small, documented **known-bad-pairing registry** — an explicit table of token
  pairs known to fail (e.g. functional step-11 text on a step-3 tint) seeded from the
  HF-9 evidence — and flag those by name.
- Report every `color-mix`-derived token as "can't verify (color-mix unresolved)" via
  the NOTE channel.
- Document this reduced scope prominently in the docstring and `checks/README.md`.

This keeps the check honest and useful even if full OKLab resolution is out of reach.

### Step 5: Document and wire

- `checks/README.md` — add a "contrast" section: what it resolves (line-local fg/bg
  pairs through the token map), the thresholds, and the **explicit non-coverage**
  (inherited/computed backgrounds, font-size-dependent large-text classification,
  non-text contrast, dynamic class names).
- `tfx-design-ui/SKILL.md` — add `checks/contrast.py` to the built-scripts list in the
  v0-reality note and a command line in the Phase-5 step-1 deterministic block, framed
  as a **static subset of A11Y-1** (it does not replace the manual contrast pass).
- `harness/CLAUDE.md` — add `contrast.py` to the "Built `checks/` scripts" bullet. While
  there, also add the already-built `a11y-static.py` and `component-manifest.py` (both
  missing from that stale list) and reconcile the "all other deterministic checks are
  not built yet" line so it stays true.

**Verify**: `python3 checks/contrast.py --tokens ../app/globals.css ../app/` runs and
either exits 0 or prints real ERROR/NOTE lines; `claude plugin validate .` passes;
`python3 checks/validate.py` unchanged (`OK`).

## Test plan

- New tests live in the embedded `--self-test` (the repo's convention for checks — see
  `a11y-static.py`), covering the six case classes in Step 3.
- Run over the **real corpus** (`checks/contrast.py --tokens ../app/globals.css ../app/`
  and `checks/contrast.py --tokens ../app/globals.css docs/loop-run/`) — per CONTRIBUTING's "Tightening a
  corpus-scanning check" rule, a check must run over real artifacts, not only the
  self-test. If the real corpus surfaces a true contrast fail, report it (don't suppress
  it to make the run green); if it surfaces a false positive, fix the resolver or widen
  the can't-verify path — never silence a real fail.
- Verification: `python3 checks/contrast.py --self-test` → `SELF-TEST OK (N cases)`.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `python3 checks/contrast.py --self-test` → `SELF-TEST OK (N cases)`, exit 0
- [ ] `python3 checks/contrast.py --tokens ../app/globals.css ../app/` runs; exit 0 or genuine ERROR/NOTE lines (no traceback)
- [ ] The avatar case (`#18181b` on `#0064ff`, ≈3.60) is flagged; the known-good (`#ffffff` on `#18181b`, ≈17.7) is clean (self-test)
- [ ] Unresolvable colours produce a NOTE, never a silent pass and never a false ERROR
- [ ] `checks/README.md` documents scope + non-coverage; `CLAUDE.md` + `tfx-design-ui` list the script
- [ ] `python3 checks/validate.py` → `OK` (unchanged); `claude plugin validate .` passes
- [ ] Only in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- OKLab `color-mix` resolution can't hit the globals.css-stated ratios within ±0.1 —
  take Step 4's escape hatch and report that you did (do not ship a resolver you can't
  validate).
- The check would need a rendered DOM to resolve a background (inherited/computed) for a
  case you think is important — that case is out of scope; record it as a NOTE and move
  on (it's the manual/axe pass's job), don't reach for a browser.
- `a11y-static.py`'s structure differs materially from the "Current state" description
  (drift) — re-read it and match the live shape.

## Maintenance notes

- This is a **static subset** of A11Y-1, exactly like `a11y-static.py` is a subset of
  A11Y-2/3/8. The manual contrast pass (and a real axe/headless run) remains the
  authority for inherited/computed/large-text cases. Keep the docstring honest as the
  resolver improves.
- It mechanically backs plan 029's functional-chip step-12 rule: once 029 lands, the
  known-bad-pairing registry (or the resolver) should flag step-11-on-step-3 small text.
- If a `checks/layout-scan` (plan 023 maintenance note) or other resolver-based check is
  built later, factor the token resolver out into a shared helper rather than copying it.
- A reviewer should focus on the **honesty of the non-coverage claims** — a contrast
  check that quietly passes unresolved pairs is worse than no check.
