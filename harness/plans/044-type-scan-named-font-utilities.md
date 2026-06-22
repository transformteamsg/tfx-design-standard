# Plan 044: Close the type-scan TYP-1 blind spot — flag named `font-mono`/`font-serif` utilities

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **This is a check-accuracy fix, not a control change.** It widens
> `checks/type-scan.py`'s TYP-1 detection to catch a class of violation it
> currently misses; it changes no control, tier, or catalog entry. `type-scan.py`
> is a governance-critical check → design-lead review before merge.
>
> **Drift check (run first)**: `git diff --stat e1ccae1..HEAD -- harness/checks/type-scan.py harness/checks/README.md`
> If `type-scan.py` changed since this plan was written, compare the "Current
> state" excerpts against the live code before editing; on a mismatch, STOP.

## Status

- **Priority**: P1 (a deterministic check has a silent blind spot: the harness's own site
  ships a TYP-1 violation — `font-mono` resolving to a third typeface — that `type-scan`
  does not flag. Until the check is fixed, the same gap recurs unseen on every consumer repo.)
- **Effort**: S–M
- **Risk**: LOW — additive detection in one check + self-test cases; behaviour-preserving for
  everything it already catches.
- **Depends on**: none. (Plan 045 *resolves* the live `font-mono` usages this check will now
  flag; the two coordinate — see Maintenance.)
- **Category**: dx (check accuracy) / bug (missed-detection)
- **Planned at**: commit `e1ccae1`, 2026-06-22

## Why this matters

The 2026-06-22 harness self-run found a real TYP-1 self-compliance gap on the harness's own
website — `font-mono` is applied to the control-ID chips and the per-control detail page
(`components/catalog-browser.tsx:96`, `app/standards/catalog/[id]/page.tsx:83`,
`components/illo.tsx:25`), but no `--font-mono` token is defined in `app/globals.css`, so the
Tailwind `font-mono` utility resolves to its default `ui-monospace, Menlo, …` stack — a third
typeface. TYP-1 says "no other typefaces." **`checks/type-scan.py` did not flag it** — it
inspects CSS `font-family:` and Tailwind `font-[…]` *arbitrary* values, but never the *named*
Tailwind family utilities `font-mono` / `font-serif`. So a whole class of TYP-1 violation is
invisible to the deterministic check, on the harness's own site and on any consumer repo. This
plan teaches the check to catch it, so the gap can't recur silently. (Resolving the harness's
own three usages is plan 045.)

## Current state

`harness/checks/type-scan.py` — the TYP-1 ("FONT") rule. Read these exact pieces:

- The allowed family tokens (lines ~110–114) — `font-display`, `font-body`, `font-sans` are
  allowed named utilities; `font-mono` / `font-serif` are **not** listed (so they are neither
  allowed nor matched):
  ```python
  ALLOWED_FONT_TOKENS = (
      "plus jakarta sans", "inter", "font-display", "font-body", "font-sans",
      "--font-display", "--font-body", "var(--font-display)", "var(--font-body)",
      "inherit", "initial", "unset",
  )
  GENERIC_FAMILY_KEYWORDS = (
      "sans-serif", "serif", "monospace", "system-ui", "ui-sans-serif",
      "ui-monospace", "ui-serif", "cursive", "fantasy", "-apple-system",
      "blinkmacsystemfont", "segoe ui", "roboto", "helvetica", "arial",
  )
  CSS_FONT_FAMILY_RE = re.compile(r"font-family\s*:\s*([^;{}]+)", re.IGNORECASE)
  TW_FONT_ARBITRARY_RE = re.compile(r"\bfont-\[([^\]]+)\]")
  ```
- `_check_font_rule(scan_line)` (lines ~125–155) — it runs `judge()` over (a) the first family
  of each CSS `font-family:` and (b) each Tailwind `font-[…]` arbitrary value. **There is no
  branch for named utilities like `font-mono`.** `judge()` returns early (allows) when the value
  is a `GENERIC_FAMILY_KEYWORDS` entry — so even a CSS `font-family: monospace` as the primary
  family is currently allowed.
- The emit loop (lines ~373–375): `for found, suggest in _check_font_rule(scan_line): emit("TYP-1", found, suggest)`.
- The self-test (`run_self_test`, lines ~422–521) — `assert_violations(name, content, ext,
  [ctl_ids])` and `assert_clean(name, content, ext)`. The FONT cases are at lines ~472–484
  (e.g. `assert_violations("FONT: CSS Georgia", ".h { font-family: Georgia, serif; }", ".css",
  ["TYP-1"])`, `assert_clean("FONT: font-display token clean", '<h1 className="font-display">…')`).
  Current count: **18 cases** (`SELF-TEST OK (18 cases)`).

### The distinction that makes this safe (do not over-flag)

Tailwind `font-<word>` utilities are two unrelated families:
- **Family utilities**: `font-sans`, `font-serif`, `font-mono` (built-in) + `font-display`,
  `font-body` (this project's custom tokens). These pick a typeface.
- **Weight utilities**: `font-thin`, `font-light`, `font-normal`, `font-medium`,
  `font-semibold`, `font-bold`, `font-extrabold`, `font-black`. These pick a weight, NOT a
  typeface — they must **never** be flagged by a TYP-1 family rule.

So the new rule must match only the built-in non-approved **family** utilities `font-serif` and
`font-mono` — never the weight utilities. Match them by an explicit alternation, not a generic
`font-\w+`.

### Repo conventions to honour

- Pure stdlib; line-local regex rules; `ERROR <file>:<line> [TYP-1] <found> — suggest: <...>`;
  embedded `--self-test` printing `SELF-TEST OK (N cases)`; exit 0 clean / 1 on ERROR. Model is
  the file itself + `a11y-static.py`.
- Keep the allow-list mechanism: a project that *sanctions* a mono/serif token (plan 045 option)
  adds the utility to `ALLOWED_FONT_TOKENS`, and the check then passes it — same pattern as
  `font-sans` today.

## Commands you will need

| Purpose | Command (from `harness/`) | Expected on success |
|---------|---------|---------------------|
| Self-test | `python3 checks/type-scan.py --self-test` | `SELF-TEST OK (23 cases)` (18 existing + 5 net-new) |
| Prove the gap is closed | `python3 checks/type-scan.py ../components/catalog-browser.tsx \| grep TYP-1` | prints a `[TYP-1]` line for line 96 (the `font-mono` chip) |
| Validator unaffected | `python3 checks/validate.py` | `OK: 47 controls valid` |
| Plugin validates | `claude plugin validate .` | `✔ Validation passed` |

## Scope

**In scope** (modify):
- `harness/checks/type-scan.py` — add named-family-utility detection to the FONT rule + flag a
  CSS `font-family` whose primary family is a non-approved generic (`monospace`/`serif`/
  `ui-monospace`/`ui-serif`); add self-test cases.
- `harness/checks/README.md` — update the type-scan FONT-rule description + self-test count.

**Out of scope** (do NOT touch):
- Any `app/`, `components/`, `lib/`, `content/`, or `globals.css` file — do **not** fix the live
  `font-mono` usages here; that is plan 045 (a design decision). This plan only makes the check
  *able to see* them.
- The catalog, control files, other checks.
- Wiring `type-scan` into `package.json` prebuild — it stays unwired (it has pre-existing
  recording-only findings, and after this plan it will also report the 3 `font-mono` sites until
  045 resolves them). Wiring is out of scope.

## Git workflow

- Branch: `advisor/044-type-scan-font-utilities`. Conventional commits
  (`fix(checks): type-scan flags named font-mono/font-serif utilities (TYP-1)`). Do NOT push.

## Steps

### Step 1: Add named-family-utility detection

In `_check_font_rule`, after the existing CSS + `font-[…]` loops, add a scan for the built-in
non-approved family utilities. Target shape:
```python
# Named Tailwind family utilities. Only the built-in non-approved *family*
# utilities are checked here (font-serif / font-mono) — NEVER the weight
# utilities (font-semibold, font-bold, …), which are not a typeface choice.
TW_FONT_NAMED_FAMILY_RE = re.compile(r"\bfont-(serif|mono)\b")
```
and in `_check_font_rule`:
```python
for m in TW_FONT_NAMED_FAMILY_RE.finditer(scan_line):
    util = "font-" + m.group(1)
    if util in ALLOWED_FONT_TOKENS:   # a project may sanction one (see plan 045)
        continue
    hits.append((
        f"Tailwind {util} utility (resolves to the default {m.group(1)} stack, "
        f"not Plus Jakarta Sans or Inter)",
        f"use font-display/font-body, or define a --{util[5:]} token mapped to an "
        f"approved face and add '{util}' to ALLOWED_FONT_TOKENS",
    ))
```

### Step 2: Flag a non-approved generic as the *primary* CSS family

Today `judge()` allows any `GENERIC_FAMILY_KEYWORDS` value, so `font-family: monospace` (primary)
passes. Tighten ONLY for the deliberately-non-approved primaries — `monospace`, `serif`,
`ui-monospace`, `ui-serif` — while keeping the sans fallbacks (`sans-serif`, `system-ui`,
`ui-sans-serif`) allowed (they are the standard fallback for the approved Inter/PJS). In `judge()`,
before the generic-keyword early-return, add:
```python
NON_APPROVED_PRIMARY_GENERICS = {"monospace", "serif", "ui-monospace", "ui-serif"}
...
if val in NON_APPROVED_PRIMARY_GENERICS:
    hits.append((
        f'font-family "{family_value.strip()}" ({source})',
        "use Plus Jakarta Sans (display) or Inter (body) via the font tokens",
    ))
    return
```
Define `NON_APPROVED_PRIMARY_GENERICS` at module level beside `GENERIC_FAMILY_KEYWORDS`, and
insert the `if val in NON_APPROVED_PRIMARY_GENERICS:` block **inside `judge()`, immediately after
the `if not val: return` guard (line ~131) and before the `if val in GENERIC_FAMILY_KEYWORDS:
return` line (~134)** — `val` must already be computed at that point. It fires only on the primary
family because `_check_font_rule` passes only the first family to `judge()` for CSS.

**Verify**: `python3 checks/type-scan.py ../components/catalog-browser.tsx | grep TYP-1` (from
`harness/`) now prints a `[TYP-1]` line for the `font-mono` chip at line 96. (Without the grep you
will also see ~7 pre-existing `[TYP-2]` size lines in that file — expected; isolate TYP-1 with the
grep so success is unambiguous.)

### Step 3: Self-test cases

Extend `run_self_test` (model on the existing FONT cases) — add:
- `assert_violations("FONT: Tailwind font-mono utility", '<span className="font-mono text-[12px]">SLP-2</span>', ".tsx", ["TYP-1"])`
- `assert_violations("FONT: Tailwind font-serif utility", '<p className="font-serif">x</p>', ".tsx", ["TYP-1"])`
- `assert_clean("FONT: font-semibold is a WEIGHT not a family", '<p className="font-semibold">x</p>', ".tsx")`
- `assert_clean("FONT: font-medium weight clean", '<p className="font-medium">x</p>', ".tsx")`
- `assert_violations("FONT: CSS monospace primary", ".code { font-family: monospace; }", ".css", ["TYP-1"])`
- `assert_clean("FONT: CSS sans-serif fallback still clean", ".b { font-family: 'Inter', sans-serif; }", ".css")` (already covered — confirm still passes)
- Do NOT add a test that mutates the module global `ALLOWED_FONT_TOKENS`. The allow-list path (a project sanctioning `font-mono`) is exercised by plan 045, not here.

**Verify**: `python3 checks/type-scan.py --self-test` → `SELF-TEST OK (23 cases)` (18 existing + the
5 net-new cases above). If you add a different number of cases, that's fine — but Step 4 must write
the same number to the README.

### Step 4: Document

- `harness/checks/README.md` — in the type-scan section, update the FONT-rule line to say it now
  also flags the named `font-mono`/`font-serif` utilities and a non-approved generic primary
  family; set the `**Self-test:**` case count to the exact number `--self-test` prints (23 if you
  added the 5 cases in Step 3) — it must match the done-criterion.

**Verify**: `python3 checks/validate.py` → `OK: 47 controls valid` (unaffected);
`claude plugin validate .` → passes; `git status` shows only the two in-scope files.

## Test plan

- Embedded `--self-test` (Step 3): font-mono flagged, font-serif flagged, font-semibold/medium
  (weights) clean, CSS monospace-primary flagged, CSS Inter+sans-serif still clean.
- Real-tree proof (Step 2): `type-scan ../components ../app` now reports `[TYP-1]` for the three
  known `font-mono` sites (`components/catalog-browser.tsx`, `app/standards/catalog/[id]/page.tsx`,
  `components/illo.tsx`) — the exact gap the self-run found.
- Verification: `--self-test` green; the 3 sites flagged; `validate.py` unaffected.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `python3 checks/type-scan.py --self-test` → `SELF-TEST OK (23 cases)` (= 18 + the 5 net-new Step 3 cases); the README count (Step 4) matches the same number
- [ ] `python3 checks/type-scan.py ../components/catalog-browser.tsx` prints a `[TYP-1]` line for `font-mono`
- [ ] `font-semibold` / other weight utilities are NOT flagged (self-test proves it)
- [ ] `python3 checks/validate.py` → `OK: 47 controls valid`; `claude plugin validate .` passes
- [ ] Only `harness/checks/type-scan.py` + `harness/checks/README.md` modified; no website/catalog file touched
- [ ] `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- A generic `font-\w+` regex is tempting — do NOT use it; it would flag weight utilities
  (`font-semibold` etc.) as typeface violations. Match only `font-(serif|mono)` explicitly.
- After Step 1–2 the self-test shows NEW failures in cases unrelated to fonts (a sign the regex is
  over-matching) — narrow the pattern and re-run.
- `type-scan.py`'s structure differs materially from the "Current state" excerpts (drift) — re-read
  and match before editing.

## Maintenance notes

- **Coordination with plan 045** (the live `font-mono` resolution): after THIS plan lands,
  `type-scan` reports the 3 `font-mono` sites as TYP-1. That is intended — it is the proof the
  blind spot is closed. Plan 045 then either (a) removes `font-mono`, (b) sanctions a `--font-mono`
  token and adds `"font-mono"` to `ALLOWED_FONT_TOKENS` (this file), or (c) inline-waives. Do not
  wire `type-scan` into prebuild until 045 has resolved them (a wired-and-failing check breaks the
  build) — and even then, only after the TYP-2 recording-only findings are addressed.
- A reviewer should confirm the rule never flags weight utilities and that `font-sans`/
  `font-display`/`font-body` stay clean.
- Natural extension (not here): read the project's `@theme` (`globals.css`) to learn which
  `--font-*` tokens are defined and what faces they map to, so the check can *precisely* allow a
  sanctioned `font-mono` and flag an unsanctioned one — instead of the allow-list. Deferred:
  line-local + a single allow-list is simpler and matches the existing design.
