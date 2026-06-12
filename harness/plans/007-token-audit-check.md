# Plan 007: Build `checks/token-audit` — the first deterministic check script (V1 starts here)

> **Executor instructions**: Follow step by step; honor STOP conditions; update
> your row in `plans/README.md` when done.
>
> **Drift check (run first)**: read `checks/README.md` — the `token-audit` row
> must still list controls TOK-1..3 + COL-1..2. Confirm Python 3.9 +
> pyyaml available (`python3 -c "import yaml"`). Mismatch → STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (false positives would erode trust in the whole checks idea — see step 3)
- **Depends on**: plans/002-catalog-validator.md (establishes `checks/` conventions and the validator pattern)
- **Category**: direction
- **Planned at**: `no-git (pre-init)`, 2026-06-10

## Why this matters

The harness's V1 bet is "the deterministic floor": check scripts that make L1
control failures mechanical instead of manual. Twelve are planned; token-audit
is the highest-leverage first build — it covers five controls (TOK-1 no raw
colours, TOK-2 spacing scale, TOK-3 radius scale, COL-1 brand blue, COL-2 Radix
functional colours), needs no browser or rendering (pure text scanning), and
targets the single most-documented AI failure mode this harness exists to stop:
hardcoded values drifting from the token layer. No product repo exists yet, so
the script is built and proven against fixtures — that constraint is real and
shapes the test plan.

## Current state

- `checks/README.md` — the contract for every check: "exits 0 on pass and 1 on
  violation, and prints violations with file/line/element and the control id —
  verbose on failure, silent on success." The token-audit row: "Scan changed
  files for raw colour / off-scale spacing / off-scale radii; assert functional
  colours resolve to Radix tokens, brand colours to T&S Blue ramp; suggest
  nearest token". Waiver handling: "checks must respect inline
  `tfx-waive <CTL-ID> reason=\"...\"` comments for L2 controls only — a waiver
  on an L0/L1 control is itself reported as a violation unless it appears in
  the decision record with a named approver" (TOK/COL are all L1 — so inline
  waivers do NOT silence them; see step 2.4).
- `standards/catalog.yaml` — TOK-1/2/3, COL-1/2: all `tier: L1`,
  `check: deterministic`, `waiver: documented`.
- `checks/validate.py` exists if plan 002 landed — match its style (plain
  python3 + stdlib + pyyaml, ERROR-line output contract).
- No product code in this repo. Target file types for the scanner: `.css`,
  `.html`, `.jsx`, `.tsx`, `.js`, `.ts`, `.vue`, `.svelte`.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Run (after build) | `python3 checks/token-audit.py <path>...` | exit 0 silent / exit 1 with violation lines |
| Self-test | `python3 checks/token-audit.py --self-test` | `SELF-TEST OK (N cases)` |
| Validator | `python3 checks/validate.py` | OK |

## Scope

**In scope**:
- `checks/token-audit.py` (create)
- `checks/fixtures/token-audit/` (create — pass and fail fixture files)
- `checks/README.md` (move token-audit from the "Planned" table to a "Built"
  subsection mirroring the validator's entry; keep the table row with a
  "✅ built" marker rather than deleting it)
- `docs/ONBOARDING.md` item 4 — one-line status update IF the file exists

**Out of scope**:
- The other 11 planned checks.
- Hook wiring (`settings.json` PostToolUse) — deferred until the script has
  run against one real product repo; premature wiring of a false-positive-prone
  check is worse than no hook.
- Any change to the five TOK/COL catalog entries.

## Git workflow

Branch `advisor/007-token-audit`; conventional commits; do NOT push.

## Steps

### Step 1: Define the detection rules (write them as a table in the script's docstring)

- **TOK-1 / COL-x raw colour**: regex hits for `#[0-9a-fA-F]{3,8}\b`,
  `rgb(a)?\(`, `hsl(a)?\(`, `oklch\(`, and CSS named colours from a small list
  (`white|black|red|green|blue|gray|grey|orange|yellow|purple` as standalone
  CSS values) — in style contexts only (inside `<style>`, `.css` files,
  `style=""` attributes, styled-template literals). EXEMPT: lines inside a
  token-definition block — a contiguous block of `--*:` custom-property
  declarations, or a file/段 marked `/* tfx-tokens */` … `/* /tfx-tokens */`.
  This exemption is load-bearing: tokens must be DEFINED somewhere.
- **TOK-2 spacing**: `margin|padding|gap|top|left|right|bottom` with a raw
  `px`/`rem` value not in the shadcn default scale
  {0,1,2,4,6,8,10,12,14,16,20,24,28,32,36,40,44,48,56,64,80,96,112,128}px
  (and their rem equivalents at 16px base). Values via `var(--…)` always pass.
- **TOK-3 radius**: `border-radius` raw values not in {0,2,4,6,8,12,16,24,9999}px.
- **Tailwind bypass**: class strings matching `\b(bg|text|border)-(red|blue|green|...)-\d{2,3}\b`
  → violation (semantic-token classes pass).
- Output per violation: `ERROR <file>:<line> [<CTL-ID>] <found> — suggest: <nearest token or scale value>`.

### Step 2: Implement `checks/token-audit.py`

- CLI: positional paths (files or directories, recursive over the target
  extensions). `--self-test` runs the embedded fixture assertions.
- Nearest-token suggestion: for spacing/radius, nearest scale value; for
  colours, name the rule ("use a semantic token / Radix scale"), no colour math.
- Waiver handling per the L1 rule: an inline `tfx-waive TOK-…` does NOT
  suppress the violation; it downgrades the line to
  `ERROR … [TOK-1][waiver-claimed] … — verify approver in decision record`
  and still exits 1. (The decision-record lookup is out of scope; humans close
  that loop.)
- Exit contract identical to validate.py.

**Verify**: `python3 checks/token-audit.py --self-test` → `SELF-TEST OK`.

### Step 3: Build fixtures and calibrate false positives

`checks/fixtures/token-audit/pass.css|pass.html` — token-layer definitions,
var() usage, on-scale values, semantic Tailwind-ish classes.
`fail.css|fail.html` — one violation per rule, each on a commented line naming
the expected control id. Then the calibration gate: run the scanner over THIS
repo's `docs/loop-run/` page (if plan 004 landed) or `docs/index.html` — the
explainer is NOT subject to the catalog, so treat this purely as a
false-positive stress test: review every hit and confirm each is a true raw
value (the explainer intentionally uses raw CSS, so hits are expected — the
test is that line/rule attribution is accurate, not that it passes).

**Verify**: `python3 checks/token-audit.py checks/fixtures/token-audit/pass.css checks/fixtures/token-audit/pass.html`
→ exit 0, no output. `… fail.css fail.html` → exit 1, one ERROR per planted
violation, control ids matching the fixture comments exactly.

### Step 4: Update docs

`checks/README.md`: add the "Built" entry (command, what it covers, the L1
waiver behavior); mark the table row ✅. `docs/ONBOARDING.md` item 4 (if it
exists): note token-audit is available to run manually.

**Verify**: `grep -c "token-audit.py" checks/README.md` → ≥ 1.

## Test plan

The self-test + fixtures ARE the tests (this repo has no test framework):
pass fixtures exit 0; fail fixtures exit 1 with exact control-id attribution;
self-test embeds ≥ 8 cases (one per detection rule incl. the token-block
exemption and the waiver-claimed path).

## Done criteria

- [ ] `python3 checks/token-audit.py --self-test` → SELF-TEST OK
- [ ] Fixture pass/fail behavior exactly as specified
- [ ] Waiver-claimed lines still exit 1 with the `[waiver-claimed]` marker
- [ ] `checks/README.md` updated; validator + plugin validation still pass
- [ ] `plans/README.md` updated

## STOP conditions

- You cannot make the token-definition exemption reliable (token definitions
  keep flagging as violations) — STOP and report the cases; a noisy scanner
  must not ship.
- Scope pressure toward parsing real CSS with a full parser dependency —
  stdlib + regex is the v1 bar; if it genuinely can't hold, report why.

## Maintenance notes

- First run against a REAL product repo (TW) is the true calibration; expect a
  follow-up tuning pass — budget for it before wiring any hook.
- When the hook IS wired (post-TW-calibration), the fast-subset guidance in
  `checks/README.md` already names token-audit — keep its runtime under ~1s
  per changed file.
