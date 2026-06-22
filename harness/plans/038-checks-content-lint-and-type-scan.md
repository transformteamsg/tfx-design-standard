# Plan 038: Build `checks/content-lint` (CNT-1/CNT-3/SLP-9) and `checks/type-scan` (TYP-1/2/4)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Two sibling checks, two commits.** Build `content-lint` first (Steps 1–3), commit,
> then `type-scan` (Steps 4–5). Each is modeled on `checks/a11y-static.py`, pure stdlib,
> with an embedded `--self-test`. The design bar is **honesty about the false-negative
> surface** — never report a control "passed" for text the check cannot resolve.
>
> **Drift check (run first)**: `git diff --stat 7629f00..HEAD -- harness/checks/a11y-static.py harness/checks/README.md harness/standards/controls/slp-9.md harness/standards/catalog.yaml`
> If `a11y-static.py` (the structural model) or `slp-9.md` (the word-list source) changed
> materially, compare against "Current state" before building; on a mismatch, STOP.

## Status

- **Priority**: P2 (the README's planned-checks table earmarks `type-scan` + `content-lint` as
  the implement-phase "fast subset"; both are currently unbuilt, so TYP-1..4 / CNT-1 / CNT-3 /
  SLP-9 are "verified manually" with no mechanical floor)
- **Effort**: L (two checks)
- **Risk**: MED — string-level static analysis has a real false-negative/false-positive surface
  (identifying "user-facing strings" statically is fuzzy); the bar is honest scope + conservative
  flagging, exactly like `a11y-static.py`.
- **Depends on**: none (siblings of `a11y-static.py` / `token-audit.py`). Reads `slp-9.md` for the
  SLP-9 word lists — best after **plan 035** (which marks that list), but works without it.
- **Category**: dx (deterministic checks)
- **Planned at**: commit `7629f00`, 2026-06-22

## Why this matters

`checks/README.md`'s planned-checks table lists `type-scan` (TYP-1..4) and `content-lint`
(CNT-1, CNT-3, SLP-9 deterministic half) as the **implement-phase fast subset** — and both are
unbuilt. So today: the SLP-9 buzzword/filler/chatbot lint (fully specified in
`standards/controls/slp-9.md` "How to verify") runs only as a manual/evaluator pass; CNT-3's
≤25-word rule and CNT-1's "no raw codes" are eyeballed; and TYP-1/2/4's font, size-floor, and
all-caps rules have no static check. The harness rule is "never report an unbuilt check as
passed" — so these are honestly "verified manually," which means an L1 typography or content
regression can ship undetected. This plan mechanizes the **statically-resolvable** parts and is
explicit about the rest.

A design point that reinforces the single-source model: **`content-lint` reads the SLP-9 word
lists from `slp-9.md` at runtime** (resolved relative to the check, like the skills resolve the
catalog), rather than embedding a third copy of the buzzword list. After plan 035 wraps that list
in `<!-- tfx-sync:slp9-buzzwords -->` markers, the check can read exactly the marked span.

## Current state

- `checks/a11y-static.py` — **the structural model**: `TARGET_EXTENSIONS`, per-line block-comment
  stripping (`_strip_block_comments` / `_ends_in_block_comment`), HTML/`//` comment stripping,
  `check_file()` returning `ERROR <rel>:<line> [<CTL>] <found> — suggest: <…>` strings,
  `scan_paths()`, `run_self_test()` with `assert_violations`/`assert_clean` printing
  `SELF-TEST OK (N cases)`, and `main()` taking `<path>… | --self-test`. **Match this shape,
  output format, and exit codes (0 clean / 1 on violations) exactly.**
- `standards/controls/slp-9.md` "## How to verify" → "Deterministic half (lint)" (lines ~75–87)
  — the **canonical word lists**: the buzzword list (streamline(d), empower, supercharge,
  effortless(ly), seamless(ly), world-class, revolutionise, leverage, unlock, elevate), the
  AI-vocabulary list (delve, robust, intricate, foster, vibrant, pivotal, testament, "landscape"),
  the filler list ("in order to", "it is important to note", "at this point in time", "due to the
  fact that"), the chatbot-artifact list ("great question", "i hope this helps", "let me know if",
  "certainly!", "you're absolutely right"), and "two or more em dashes inside one sentence". After
  plan 035 the buzzword list carries `<!-- tfx-sync:slp9-buzzwords -->` markers.
- Catalog control facts (from `standards/catalog.yaml`):
  - `CNT-1` — "Error messages state what happened and what to do next; no raw error codes as the
    primary message." fails_when: `"Something went wrong" with no next step`; `stack traces or
    codes shown to teachers`.
  - `CNT-3` — "Copy leads with its purpose, uses second person and active voice, and keeps
    sentences to 25 words or fewer." fails_when: `passive constructions in instructions`; `a
    title/description/intro that opens with the mechanism instead of what it does`.
  - `TYP-1` — "Display text is Plus Jakarta Sans (600); body/UI text is Inter (400/500/600); no
    other typefaces."
  - `TYP-2` — "Body text at least 14px; labels at least 11px; body line-height 1.5-1.6."
  - `TYP-3` — "Type sizes come from the TFX type scale; no off-scale sizes." (needs the scale —
    see Step 5 scope note.)
  - `TYP-4` — "All-caps is used only for short labels."
- `checks/README.md` — the planned-checks table (lines ~73–97) lists `type-scan` and
  `content-lint` with these exact approaches; this plan moves them from "planned" to "built".
- `package.json` `prebuild` runs `a11y-static.py` over `app components`; `content-lint` /
  `type-scan` may be wired similarly (see Maintenance notes — wiring deferred, like plan 007's
  hook wiring, until calibrated against a real product repo).

### Repo conventions to honour

- Pure stdlib Python 3 (`os`, `re`, `sys`, `tempfile`; plus the check reads `slp-9.md` via a
  path resolved relative to `__file__`, like `validate.py` resolves `standards/`). No third-party.
- Honest-scope docstring with a "What this script does NOT verify" section (copy the spirit from
  `a11y-static.py`).
- Output + exit codes identical to the siblings so the verify phase calls them the same way.

## Commands you will need

| Purpose | Command (from `harness/`) | Expected on success |
|---------|---------|---------------------|
| content-lint self-test | `python3 checks/content-lint.py --self-test` | `SELF-TEST OK (N cases)`, exit 0 |
| type-scan self-test | `python3 checks/type-scan.py --self-test` | `SELF-TEST OK (N cases)`, exit 0 |
| Run over the site | `python3 checks/content-lint.py ../app ../content` | exit 0, or genuine ERROR lines |
| Validator unaffected | `python3 checks/validate.py` | `OK: <n> controls valid` (unchanged) |

## Scope

**In scope** (create/modify):
- `checks/content-lint.py` (create) — CNT-1 + CNT-3 + SLP-9 deterministic lint, reading word
  lists from `slp-9.md`.
- `checks/type-scan.py` (create) — TYP-1 (fonts) + TYP-2 (size floors + line-height) + TYP-4
  (all-caps length). TYP-3 (on-scale) partial — see Step 5.
- `checks/README.md` — move `type-scan` and `content-lint` from "planned" to "built" sections
  with their honest scope + non-coverage; add `**Self-test:**` lines.
- `harness/CLAUDE.md` — add the two scripts to the "Built `checks/` scripts" bullet (and
  reconcile the "all other deterministic checks are not built yet" line).

**Out of scope** (do NOT touch):
- The catalog, control detail files, `schema.json`, control tiers/definitions — this is tooling
  for existing controls, not new controls.
- `targets` (A11Y-4), `reduced-motion` (A11Y-5), `alt-scan` (A11Y-6), `structure` (A11Y-7),
  `destructive`/`async-states` (CMP-2/3), `motion`, `slop-scan/slop-layout`, `identity` — the
  **remaining** unbuilt checks. Leave them planned; document the queue (Maintenance notes).
  `contrast` (A11Y-1) is plan 028 — do not touch it.
- Prebuild/hook wiring — deferred until calibrated (Maintenance notes), mirroring plan 007.
- The SLP-9 *evaluator half* (structural tells) — that stays judgment; this check is the
  deterministic lint half only.

## Git workflow

- Branch: `advisor/038-content-lint-type-scan`. Conventional commits, one per check
  (`feat(checks): add content-lint.py — CNT-1/CNT-3/SLP-9 lint`, then
  `feat(checks): add type-scan.py — TYP-1/2/4 static subset`). Do NOT push.

## Steps

### Step 1: `content-lint.py` — read the SLP-9 word lists from `slp-9.md`

Resolve `slp-9.md` relative to the check: `os.path.join(os.path.dirname(os.path.dirname(
os.path.abspath(__file__))), "standards", "controls", "slp-9.md")` (i.e. `../standards/controls/`
from `checks/`). Parse the word lists from its "How to verify" section:
- If the `<!-- tfx-sync:slp9-buzzwords -->` markers are present (post-035), extract that span for
  the buzzword list; otherwise parse the bullet beginning "the buzzword list —".
- Parse the AI-vocabulary, filler, and chatbot-artifact lists from their bullets similarly.
- **Escape hatch**: if `slp-9.md` cannot be found or parsed (e.g. a product repo without the full
  controls dir), fall back to a small embedded copy of the lists **and print a NOTE** that it used
  the fallback — never silently. Document this.

### Step 2: `content-lint.py` — detect violations (line-local, conservative)

Scan `TARGET_EXTENSIONS` files; strip comments as `a11y-static.py` does. For each line:
- **SLP-9 (L2, lint half)**: case-insensitive search for any buzzword / AI-vocab / filler /
  chatbot-artifact token (word-boundaried), and "two or more em dashes in one sentence" (≥2 `—`
  between sentence boundaries). Emit `ERROR <rel>:<line> [SLP-9] <token/pattern> — suggest: say
  what the thing does` (or the em-dash suggestion).
- **CNT-3 (≤25 words)**: for string literals that look user-facing (a quoted string of ≥ a few
  words, in a `.tsx/.jsx` text position or a `.mdx` line that isn't a heading/code), count words;
  > 25 → `ERROR … [CNT-3] sentence of N words (> 25) — suggest: split into shorter sentences`.
- **CNT-1 (no raw codes as primary copy)**: flag a user-facing string that is *only* an error
  code (matches e.g. `^[A-Z0-9_]{3,}$`, `0x…`, `ERR[_-]…`) or the literal "Something went wrong"
  with no following actionable verb on the same/next line. Conservative — when unsure, do not
  flag.
- **Unresolvable** (dynamic string, template interpolation, can't tell if user-facing): do NOT
  flag and do NOT pass silently for CNT — these are out of static reach; the manual pass covers
  them. (SLP-9 token hits are safe to flag regardless.)
- **Honest scope**: a docstring "What this does NOT verify": non-literal/interpolated strings,
  whether a string is truly user-facing vs. an internal label, CNT-3's lead-with-purpose
  *semantic* half (judgment), and SLP-9's structural-tell *evaluator* half.

### Step 3: `content-lint.py` self-test

`run_self_test()` mirroring `a11y-static.py`, with `assert_violations`/`assert_clean`:
- buzzword hit ("Effortlessly streamline your workflow") → `[SLP-9]`.
- em-dash chain ("Supercharge — effortlessly — seamlessly") → `[SLP-9]`.
- filler ("In order to save") → `[SLP-9]`.
- chatbot artifact ("Great question!") → `[SLP-9]`.
- clean copy ("Save marks") → no violation.
- 30-word sentence literal → `[CNT-3]`; a 10-word sentence → clean.
- raw-code-only string ("ERR_SYNC_500") → `[CNT-1]`; a code *with* a next step → clean.
- commented-out buzzword → clean (comment stripping).
- word-list-from-slp-9.md: assert the loader picked up a known buzzword (e.g. "supercharge") — if
  using the fallback, the NOTE path is exercised.

**Verify**: `python3 checks/content-lint.py --self-test` → `SELF-TEST OK (N cases)`; running over
`../content` and `../app` exits 0 or prints genuine ERROR lines (no traceback). If it surfaces a
real SLP-9 hit in the repo's own prose, report it (CONTRIBUTING's "run a corpus-scanning check
over real artifacts" rule) — do not suppress it.

### Step 4: `type-scan.py` — TYP-1 (fonts), TYP-2 (size floors + line-height), TYP-4 (all-caps)

Model on `a11y-static.py`. Line-local detection:
- **TYP-1 (fonts)**: a CSS `font-family:` or a Tailwind `font-[…]` arbitrary value naming a
  typeface other than Plus Jakarta Sans / Inter (allow the token names `--font-display` /
  `--font-body` / `font-display` / `font-sans` / `font-body`). Flag others → `[TYP-1]`.
- **TYP-2 (size floors + line-height)**: a `font-size:` or `text-[Npx]` with `N < 14` (or `< 11`
  if a label context is evident) → `[TYP-2]` (note the 11/14 ambiguity in the suggest text). A
  `line-height:`/`leading-[…]` outside 1.5–1.6 on body text → `[TYP-2]` (conservative: only flag
  explicit numeric line-heights clearly outside the band).
- **TYP-4 (all-caps)**: a `text-transform: uppercase` / `uppercase` class on an element whose
  same-line text content is long (> ~24 chars of letters) → `[TYP-4] all-caps on long text`.
- **Unresolvable / dynamic** → NOTE, never silent pass.

### Step 5: `type-scan.py` self-test + TYP-3 scope note

Self-test cases: `text-[13px]` → `[TYP-2]`; `text-[14px]` → clean; `font-family: Georgia` →
`[TYP-1]`; `font-display`/`font-sans` → clean; `uppercase` on a long sentence → `[TYP-4]`;
`uppercase` on "NEW" → clean; commented-out small size → clean.

**TYP-3 (on-scale sizes)**: flagging *off-scale* sizes needs the TFX type scale (the allowed size
set). **The scale IS available** — TYP-3's own catalog entry states it in its `verify` field:
`Sizes in {120,96,72,48,32,24,20,18,16,14,12,11}; checks/type-scan` (do NOT invent one; read or
embed exactly that set, and keep it sourced from the catalog so it can't drift — read TYP-3's
`verify` string, or embed the set with a comment pointing at the catalog). **Scope decision**:
implementing TYP-3 with that set is the preferred path (a `text-[Npx]`/`font-size:Npx` whose `N`
isn't in the set → `[TYP-3]`); if reading the set proves fiddly, you MAY defer TYP-3 and document
it — but do not claim "no scale exists." Note the choice you made.

**Verify**: `python3 checks/type-scan.py --self-test` → `SELF-TEST OK (N cases)`; running over
`../app ../components` exits 0 or genuine ERROR/NOTE lines.

### Step 6: Document + reconcile the README

- `checks/README.md` — move `type-scan` and `content-lint` from the planned table to "built"
  sections with their honest scope, non-coverage, and `**Self-test:**` lines. Strike them (or mark
  ✅) in the planned table like the existing built rows. If you deferred TYP-3 (above), record that
  decision in **both** `type-scan.py`'s docstring "What this script does NOT verify" section **and**
  the README's type-scan scope line — be explicit that TYP-3 is/ isn't covered and why.
- `harness/CLAUDE.md` — add `content-lint.py` and `type-scan.py` to the "Built `checks/` scripts"
  bullet; reconcile the "all other deterministic checks are not built yet" line so it stays true
  (note `a11y-static.py`, `component-manifest.py`, and — if landed — `contrast.py` too if they're
  still missing from that list).

**Verify**: `python3 checks/validate.py` → `OK` (unchanged — you referenced existing control IDs
only); `claude plugin validate .` passes; `git status` shows only in-scope files.

## Test plan

- Each check's embedded `--self-test` (Steps 3, 5) is the unit proof, covering each rule's hit +
  clean + comment-stripped + unresolvable cases.
- Run both over the **real corpus** (`../app`, `../components`, `../content`) per CONTRIBUTING's
  corpus rule — report genuine hits, don't suppress them; fix false positives by widening the
  can't-resolve path, never by silencing a real fail.
- Verification: both self-tests → `SELF-TEST OK (N cases)`.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `python3 checks/content-lint.py --self-test` → `SELF-TEST OK (N cases)`, exit 0
- [ ] `python3 checks/type-scan.py --self-test` → `SELF-TEST OK (N cases)`, exit 0
- [ ] `content-lint` reads its SLP-9 word lists from `slp-9.md` (or NOTEs the fallback) — no silent third copy
- [ ] Both run over `../app ../components ../content` with no traceback (exit 0 or genuine ERROR/NOTE lines)
- [ ] Both use only stdlib (`grep -nE "^import |^from " checks/content-lint.py checks/type-scan.py` shows stdlib only)
- [ ] `checks/README.md` documents both as built with non-coverage + self-test lines; TYP-3 scope decision recorded
- [ ] `harness/CLAUDE.md` lists both built scripts; `python3 checks/validate.py` → `OK`; `claude plugin validate .` passes
- [ ] Only in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- `slp-9.md` cannot be located/parsed for the word lists AND the embedded fallback would be the
  only source — that is acceptable *with the NOTE*, but if you find yourself wanting to hard-code
  the lists silently, STOP (that recreates the drift this whole effort is removing).
- TYP-3 on-scale detection cannot be done without inventing a type scale — defer TYP-3, document
  it, ship TYP-1/2/4. Do not guess a scale.
- `a11y-static.py`'s structure differs materially from "Current state" (drift) — re-read and match.
- A check would need rendered layout to be correct (e.g. true label-context for the 11px floor,
  or computed all-caps length) — flag conservatively / NOTE it; do not reach for a browser.

## Maintenance notes

- **Remaining unbuilt checks (the queue, prioritized):** `alt-scan` (A11Y-6 — statically
  tractable, next-highest), `reduced-motion` (A11Y-5), `structure` (A11Y-7 deterministic half),
  `targets` (A11Y-4 — needs computed layout, low static yield), `destructive`/`async-states`
  (CMP-2/3), `motion`, `slop-scan`/`slop-layout`, `identity`. Each is a follow-up plan modeled on
  this one. Record this queue in `plans/README.md`.
- **Hook wiring deferred** (like plan 007): once calibrated against a real product repo,
  `content-lint` + `type-scan` join the implement-phase fast subset in `package.json` prebuild /
  the PostToolUse hook. Do not wire blindly here.
- `content-lint` reading its lists from `slp-9.md` means the lint and the catalog never diverge —
  if the buzzword list grows, the check picks it up. A reviewer should confirm the loader, the
  fallback NOTE, and that no real SLP-9 hit in the repo's prose was silenced to make the run green.
