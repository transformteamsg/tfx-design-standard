# Plan 011: Make `checks/token-audit` project-token-aware and scan arbitrary values

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a8ca4fa..HEAD -- harness/checks/token-audit.py`.
> If it changed since this plan was written, compare the "Current state"
> excerpts against the live file before proceeding; on a mismatch, treat it as a
> STOP condition. Paths are relative to the harness root.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (this is the one check teams already run; a regression in either
  direction further erodes trust — the self-test is the guardrail)
- **Depends on**: none (plan 007 built the scanner; this is its anticipated
  follow-up tuning pass — `007-token-audit-check.md:163-165`)
- **Category**: bug
- **Planned at**: commit `a8ca4fa`, 2026-06-15

## Why this matters

`token-audit` is the **only** deterministic control check teams run, so its
accuracy sets the credibility of the whole "deterministic floor" idea. Today it
mis-grades the app's real token layer in both directions:

- **False positive** — it flags theme-mapped Radix steps. A consuming repo that
  maps `--color-amber-11` into Tailwind v4's `@theme` legitimately uses
  `text-amber-11` as a *semantic token utility*, but the scanner red-bars it as a
  palette bypass. It keys on the **colour name**, not on whether the token is
  defined: it flags `text-amber-11` (a Tailwind name) while passing `text-crimson-11`
  (a Radix-only name) — proving it never consults the project's tokens. Every run
  on a product using functional Radix scales red-bars correct code.
- **False negative** — it is blind to raw colour inside arbitrary-value
  utilities. It catches a bare `bg-white` literal but not the `black` inside
  `bg-[color-mix(in oklab, var(--tw-blue) 88%, black)]`. **Reproduced in this
  repo** at `components/tool-card.tsx:37` (and `app/.../page.tsx:42,140`) — the
  scanner passes that line clean today.

The fix: teach the scanner the consuming app's `@theme`/`:root` colour-token
names (an allowlist of what's legitimately defined) and extend raw-colour
detection into `[...]` arbitrary values. This supersedes the original HF-1 report
with its mechanism.

## Current state

`checks/token-audit.py` — the relevant pieces (verbatim):

- The palette-bypass detector that produces the false positive
  (`token-audit.py:95-98`):
  ```python
  TAILWIND_PALETTE_RE = re.compile(
      r'\b(bg|text|border)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|'
      r'blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b'
  )
  ```
  `\d{2,3}` also means single-digit Radix steps (`amber-3`) never match — the
  scanner passes them for the wrong reason (digit count, not token-awareness).
- It is applied to every line regardless of style context
  (`token-audit.py:392-394`):
  ```python
  for m in TAILWIND_PALETTE_RE.finditer(scan_line):
      emit("COL-2", f"Tailwind palette class '{m.group()}'", "use a semantic token class (e.g. bg-primary, text-destructive)")
  ```
- Raw-colour checks (`HEX_COLOUR_RE`, `RGB_COLOUR_RE`, `NAMED_COLOUR_RE`, etc.)
  run **only** when `effective_style` is true (`token-audit.py:360-390`) — i.e.
  inside `.css`, `<style>`, `style="…"`, or a tagged template literal. A `black`
  inside a JSX `className="bg-[color-mix(…,black)]"` is not a style context, so
  it is never scanned. This is the false negative.
- `StyleContextTracker` already detects `:root { --*: … }` token-definition
  blocks for the *exemption* logic (`token-audit.py:167-232`) — proof the file
  can already parse custom-property declarations; reuse that machinery to build
  the allowlist.

How the consuming app defines its tokens (Tailwind v4) — `app/globals.css`
(this repo): `@theme inline { --color-tw-blue: …; --color-casesync: …;
--color-glow: …; … }` (`globals.css:30-41`) generates utilities `bg-tw-blue`,
`text-casesync`, etc. A product using Radix functional scales does the same with
`--color-amber-11`, `--color-lime-3`, … → `text-amber-11`, `bg-lime-3` are valid
**theme** utilities, not bypasses. The scanner must learn these names from the
CSS it is pointed at.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Self-test | `python3 checks/token-audit.py --self-test` | `SELF-TEST OK (N cases)`, N > 18 |
| Existing fixtures still pass | `python3 checks/token-audit.py checks/fixtures/token-audit/pass.css checks/fixtures/token-audit/pass.html` | exit 0, no output |
| False-negative repro now caught | `python3 checks/token-audit.py ../components/tool-card.tsx` | exit 1, an ERROR citing the `black` in the `color-mix` |
| Catalog validator | `python3 checks/validate.py` | `OK: …` |

## Scope

**In scope** (the only files you modify/create):
- `checks/token-audit.py`
- `checks/fixtures/token-audit/` — add fixtures for the new behaviour (a
  theme-defined name that passes, an undefined name that fails, a raw colour in
  an arbitrary value that fails)
- `checks/README.md` — update the token-audit "Coverage" paragraph (`:13-23`) to
  document project-token-awareness and arbitrary-value scanning

**Out of scope** (do NOT touch):
- Any other check script; the TOK-2/TOK-3 spacing/radius logic (unchanged).
- The five TOK/COL **catalog entries** — behaviour change only, no spec change.
- Product code in `../components` / `../app` (read-only, for the repro test).

## Git workflow

- Branch: `advisor/011-token-audit-project-aware`. Conventional commits. Do NOT push.

## Steps

### Step 1: Build a project-token allowlist from the consuming app's CSS

Add a function `collect_theme_color_names(paths) -> set[str]` that scans the
target `.css` files (and `<style>` blocks) **once, up front**, for colour token
declarations and returns the set of utility *names* they license:

- For each custom property matching `--color-<name>: …` (Tailwind v4 `@theme`
  convention), add `<name>` (e.g. `--color-amber-11` → `amber-11`; `--color-tw-blue`
  → `tw-blue`). Reuse the existing `CUSTOM_PROP_RE` / `StyleContextTracker` block
  detection — do not write a new CSS parser.
- Also accept an explicit override: a `--allow name1,name2,…` CLI flag and/or a
  `checks/token-audit.allow` file (one name per line, `#` comments) merged into
  the set. This lets a team license names defined outside the scanned paths.

A name is "theme-defined" if it is in this set. Pass the set into `check_file`.

**Verify**: add a temporary `print(sorted(names))` while developing; on
`app/globals.css` it must include `tw-blue`, `casesync`, `glow`; remove the print
before finishing.

### Step 2: Make the palette-bypass rule consult the allowlist

- Change `TAILWIND_PALETTE_RE`'s `\d{2,3}` to `\d{1,3}` so single-digit Radix
  steps are seen.
- In the emit loop (`token-audit.py:392-394`), before emitting, extract the
  matched `<name>-<step>` (and the bare `<name>`) and **skip** the violation if
  either is in the theme allowlist from step 1. Only emit `[COL-2]` for a palette
  class whose name is **not** theme-defined (a genuine bypass like a raw
  `bg-red-500` in a repo that never mapped `red-500`).

This fixes the false positive (`text-amber-11` passes when `--color-amber-11` is
defined) without going blind (`bg-red-500` still flagged when undefined).

**Verify**: a fixture line `<div class="text-amber-11">` with a sibling
`--color-amber-11:` definition in the same scanned set → no COL-2; the same line
with no such definition → COL-2.

### Step 3: Scan inside arbitrary-value utilities for raw colour

Add a pass (running on **all** lines, not just style contexts) that finds
arbitrary-value utilities — `(?:bg|text|border|ring|fill|stroke|shadow|from|via|to|outline|decoration)-\[([^\]]*)\]`
— and runs the existing `HEX_COLOUR_RE`, `RGB_COLOUR_RE`, `HSL_COLOUR_RE`,
`OKLCH_COLOUR_RE`, and the named-colour check against the bracket contents. A raw
hex/rgb/hsl/oklch or a standalone named colour (`white|black|red|…`) inside the
brackets — excluding `var(--…)` references — emits `[TOK-1]`:
`ERROR … [TOK-1] raw colour '<found>' in arbitrary value — suggest: define it as a token and reference var(--…)`.

So `bg-[color-mix(in oklab, var(--tw-blue) 88%, black)]` flags `black` but a
hypothetical `bg-[var(--surface)]` stays clean.

**Verify**: `python3 checks/token-audit.py ../components/tool-card.tsx` → exit 1
with an ERROR naming `black` at line 37.

### Step 4: Extend the self-test and fixtures, then update the README

Add self-test cases: (a) theme-defined name passes, (b) undefined palette class
still fails, (c) single-digit undefined step now fails, (d) raw colour in an
arbitrary value fails, (e) `var(--…)` in an arbitrary value passes. Add matching
fixture lines. Then update `checks/README.md:13-23`: note the scanner reads
`--color-*` names from the scanned CSS (and `--allow`/`.allow`) to license theme
utilities, and that it scans arbitrary `[...]` values for raw colour.

**Verify**: `python3 checks/token-audit.py --self-test` → `SELF-TEST OK (N cases)`
with N strictly greater than the current 18.

## Test plan

- The embedded self-test is the test surface (no framework). New cases listed in
  step 4; existing 18 cases must still pass unchanged (no regression).
- Calibration note: running the fixed scanner over **this** repo's `../components`
  will still flag `border-red-300`, `bg-amber-50`, `text-emerald-700`,
  `bg-zinc-50` (catalog-browser.tsx, doc-page.tsx, sidebar.tsx) — those names are
  **not** in this repo's `@theme` (`globals.css:30-41` defines only
  `tw-blue/casesync/glow` + neutrals), so they are *true* bypasses, not false
  positives. Do not "fix" the scanner to silence them; that is the website's own
  COL-2 debt, out of scope here.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `python3 checks/token-audit.py --self-test` → `SELF-TEST OK (N)`, N > 18
- [ ] A `text-amber-11` line passes when `--color-amber-11` is in the scanned CSS, and fails when it is not (fixtures prove both)
- [ ] `python3 checks/token-audit.py ../components/tool-card.tsx` → exit 1 citing `black` at line 37
- [ ] Existing `checks/fixtures/token-audit/pass.*` still exit 0; `fail.*` still exit 1
- [ ] `python3 checks/validate.py` passes
- [ ] `checks/README.md` documents both new behaviours
- [ ] Only in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- The existing 18 self-test cases can't be kept green alongside the new ones —
  report the conflict rather than weakening an existing assertion.
- Tailwind v4 `@theme` turns out to license utility names by a rule more complex
  than `--color-<name>` (e.g. nested namespaces) such that the allowlist would
  mis-license real bypasses — report what you found; do not ship a permissive
  guess.
- `token-audit.py` differs from the "Current state" excerpts (drift) — STOP.

## Maintenance notes

- This is the "follow-up tuning pass against a real product repo" that plan 007
  explicitly deferred; the next true calibration is the Teacher Workspace repo,
  whose Radix functional scales are the original false-positive source. Run it
  there before wiring any hook.
- If a future product defines colour tokens via a JS/TS Tailwind config instead
  of CSS `@theme`, the allowlist source must be extended to read that config —
  flag it for the reviewer.
- Reviewer should confirm the arbitrary-value regex doesn't over-match
  non-colour utilities like `grid-cols-[…]` or `w-[…]` (those contain no colour,
  so the colour regexes won't fire — but verify with a fixture).
