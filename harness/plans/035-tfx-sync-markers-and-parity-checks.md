# Plan 035: `tfx-sync` markers + L0-list / SLP-9-buzzword parity checks in `validate.py`, and a `SYNC.md` architecture doc

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **This edits the always-on `CLAUDE.md` and two skills.** The edits are
> **additive markers + deferral wording only** — you do NOT change any rule, control,
> tier, or list *content*. The markers are HTML comments (invisible in Markdown). After
> this plan, the inline L0 list and the SLP-9 buzzword list can no longer drift from
> their sources without `validate.py` failing.
>
> **Drift check (run first)**: `git diff --stat 7629f00..HEAD -- harness/checks/validate.py harness/CLAUDE.md "harness/.claude/skills/tfx-design-ui/SKILL.md" "harness/.claude/skills/tfx-content-style/SKILL.md" harness/standards/controls/slp-9.md harness/standards/catalog.yaml`
> If any in-scope file changed materially, compare against the "Current state" excerpts
> before editing; on a mismatch, STOP.
>
> **Depends on plan 034** — it refactors `validate.py` into `collect_errors(repo_root)` +
> pure helpers + `run_self_test()` + `main()`. **If `validate.py` still runs at import
> (no `main()` / no `--self-test`), STOP — land 034 first.**

## Status

- **Priority**: P1 (the headline reliability gap: the L0 non-negotiables and the SLP-9
  buzzword list are restated in prose in two files each, with no check that they match the
  source — they can silently drift)
- **Effort**: M
- **Risk**: MED — the parser must be exact (set comparison, not string matching) so prose
  edits around the lists don't false-positive, and the markers must not change what the
  files mean. **Touches the always-on `CLAUDE.md` + two skills → design-lead review required
  before merge.**
- **Depends on**: **plan 034** (the testable `validate.py` shape this slots into).
- **Category**: dx (drift-prevention check) + docs (SYNC.md)
- **Planned at**: commit `7629f00`, 2026-06-22

## Why this matters

Two fragments are duplicated as prose across files, with no mechanical guarantee they agree:

1. **The L0 non-negotiables list.** `tfx-design-ui/SKILL.md:18–20` and the "Non-negotiables
   (L0)" bullet in `CLAUDE.md` both restate the four L0 controls — *because the SKILL travels
   in the plugin and CLAUDE.md does not* (`tfx-design-ui/SKILL.md:21–23` says so). The catalog
   is the source of truth (4 controls are `tier: L0`: A11Y-1, A11Y-2, A11Y-3, CMP-2). If a
   fifth L0 control is ever ratified, both prose restatements go stale and a builder reads the
   wrong "these are the non-negotiables" set. `validate.py` checks the IDs *exist*; it never
   checks the inline list *equals the catalog's L0 set*.
2. **The SLP-9 buzzword list.** The canonical list lives in `standards/controls/slp-9.md:77–80`;
   `tfx-content-style/SKILL.md:58–59` restates a subset for fast in-context recall (and line 84
   already says "The canonical word list is in slp-9.md … that file wins if this summary
   drifts"). But nothing enforces that: the skill could acquire a buzzword the canonical control
   doesn't carry, and the evaluator (which reads slp-9.md) would never flag it.

A git symlink cannot fix either — the drift is a *fragment inside a larger file*, and the
files must each ship in their own context (the plugin vs. the website vs. the project root).
The fix is a marker-delimited equality check: wrap each inline list in
`<!-- tfx-sync:NAME -->` … `<!-- /tfx-sync:NAME -->`, and teach `validate.py` to compare the
marked span against its source. This turns silent drift into a CI failure. `SYNC.md` records
the model so future restatements register themselves with the check instead of free-floating.

## Current state

- **Catalog L0 set** — `standards/catalog.yaml` has exactly **four** `tier: L0` controls:
  `A11Y-1` (entry ~30), `A11Y-2` (~44), `A11Y-3` (~58), `CMP-2` (~352). (47 controls total:
  4×L0, 28×L1, 15×L2.) This set is the **source** for the L0 parity check.

- `harness/.claude/skills/tfx-design-ui/SKILL.md:18–23` — the inline L0 list, verbatim:
  ```
  **Non-negotiables (L0), binding even outside the loop:** AA contrast (A11Y-1); keyboard
  reach with visible focus (A11Y-2); a visible label on every field (A11Y-3); destructive
  actions show consequences and offer undo or confirm (CMP-2). These never bend — if one
  seems impossible, that is a blocking question for the user, not a judgment call. (The
  catalog carries the rest; these four are restated here because this SKILL.md travels in
  the plugin while the harness's CLAUDE.md does not.)
  ```
  The four control IDs in this span = {A11Y-1, A11Y-2, A11Y-3, CMP-2}.

- `harness/CLAUDE.md` — in "## Always-on rules", the bullet beginning
  `- **Non-negotiables (L0) that bind even outside the loop**:` (locate by that exact string),
  listing the same four IDs:
  ```
  - **Non-negotiables (L0) that bind even outside the loop**: AA contrast (A11Y-1),
    keyboard reach + visible focus (A11Y-2), visible labels on every field (A11Y-3),
    destructive actions show consequences and offer undo/confirm (CMP-2).
  ```

- `harness/standards/controls/slp-9.md:77–80` — the canonical buzzword list, the **source** for
  the SLP-9 parity check (under "## How to verify", "Deterministic half (lint)"):
  ```
  - the buzzword list — streamline(d), empower, supercharge, effortless(ly),
    seamless(ly), world-class, revolutionise, leverage, unlock, elevate — plus the
    AI-vocabulary list: delve, robust, intricate, foster, vibrant, pivotal,
    testament, "landscape" as an abstract noun;
  ```
  Buzzword tokens (the segment up to "elevate", **before** "— plus the AI-vocabulary list"):
  streamline(d), empower, supercharge, effortless(ly), seamless(ly), world-class,
  revolutionise, leverage, unlock, elevate.

- `harness/.claude/skills/tfx-content-style/SKILL.md:58–59` — the inline subset, verbatim:
  ```
  - No marketing buzzwords (SLP-9): streamline, empower, supercharge, effortless,
    seamless, world-class and kin describe nothing — say what the thing does. ...
  ```
  Subset tokens: streamline, empower, supercharge, effortless, seamless, world-class (+ "and
  kin"). Line 84 already names slp-9.md as canonical.

- `harness/checks/validate.py` (post-034) — `collect_errors(repo_root)` is the integration
  point; the cross-ref sweep already reads `CLAUDE.md` and globs `.claude/skills/*/SKILL.md`,
  so those files are already in hand. `XREF_RE` matches `(A11Y|TOK|…)-\d+`.

- `harness/docs/` — holds `decisions/`, `catalog-changes/`, `loop-run/`. `SYNC.md` is new and
  goes at `harness/docs/SYNC.md`.

### Repo conventions to honour

- Markers are HTML comments — invisible in Markdown, harmless in the plugin and in
  `/llms-full.txt` (which serves slp-9.md raw). They must NOT change any rendered/visible text.
- New `validate.py` logic is pure-stdlib, lives in functions called by `collect_errors`, and is
  covered by `run_self_test()` cases. Output stays `ERROR <location>: <message>`.

## Commands you will need

| Purpose | Command (from `harness/`) | Expected on success |
|---------|---------|---------------------|
| Validator (real) | `python3 checks/validate.py` | `OK: <n> controls valid`, exit 0 |
| Self-test | `python3 checks/validate.py --self-test` | `SELF-TEST OK (N cases)`, exit 0 (N grew vs. 034) |
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` |
| Find a marker | `grep -rn "tfx-sync:" CLAUDE.md .claude standards/controls/slp-9.md` | the 4 open + 4 close markers |

## Scope

**In scope** (create/modify):
- `harness/CLAUDE.md` — wrap the L0 bullet in `<!-- tfx-sync:L0 source=catalog -->` markers.
- `harness/.claude/skills/tfx-design-ui/SKILL.md` — wrap the L0 list (18–20) in the same markers.
- `harness/standards/controls/slp-9.md` — wrap the buzzword list (77–78, up to "elevate") in
  `<!-- tfx-sync:slp9-buzzwords source -->` markers (this is the SOURCE block).
- `harness/.claude/skills/tfx-content-style/SKILL.md` — wrap the inline subset (58–59) in
  `<!-- tfx-sync:slp9-buzzwords -->` markers (the CONSUMER block).
- `harness/checks/validate.py` — add `l0_parity_errors(...)` and `slp9_parity_errors(...)`
  pure helpers + a shared marker-extractor, called from `collect_errors`; add self-test cases.
- `harness/docs/SYNC.md` — new: the source-of-truth model + marker grammar + symlink rejection.
- `harness/checks/README.md` — note the two new sub-checks in the "Validator (built)" section.

**Out of scope** (do NOT touch):
- Any rule, control, tier, or list *content* — markers and one deferral sentence only.
- The catalog and `schema.json` — no control changes; no new control IDs.
- The `validate.py` step-6 frontmatter parity — markers go in the BODY of slp-9.md, never the
  frontmatter, so that check is unaffected. Confirm you did not touch the `--- … ---` block.
- The other inline control lists in `tfx-design-ui/SKILL.md` (e.g. the Phase-5 verify checklist
  at ~296–297, which lists MORE than the L0 set on purpose) — only the canonical
  "Non-negotiables (L0)" block at 18–20 carries the `tfx-sync:L0` marker.

## Git workflow

- Branch: `advisor/035-tfx-sync-markers`. Conventional commits
  (`feat(checks): tfx-sync markers + L0/SLP-9 parity checks; add SYNC.md`). Do NOT push.

## Steps

### Step 1: Add the markers (additive, content-unchanged)

Wrap each block. Place markers on their own lines immediately bracketing the block (these files
are consumed as text by agents/validators; list-rendering is not a concern). Grammar:
`<!-- tfx-sync:NAME [source][ key=val] -->` … `<!-- /tfx-sync:NAME -->`.

- `tfx-design-ui/SKILL.md` around lines 18–20:
  ```
  <!-- tfx-sync:L0 source=catalog -->
  **Non-negotiables (L0), binding even outside the loop:** AA contrast (A11Y-1); keyboard
  reach with visible focus (A11Y-2); a visible label on every field (A11Y-3); destructive
  actions show consequences and offer undo or confirm (CMP-2).
  <!-- /tfx-sync:L0 -->
  ```
  (Keep the "These never bend …" sentence and the parenthetical *after* the closing marker —
  the marked span is just the list sentence carrying the four IDs.)
- `CLAUDE.md` around the "Non-negotiables (L0)" bullet: open marker on the line before the
  bullet, close marker on the line after it.
- `slp-9.md` around the buzzword segment (the SOURCE — mark only up to "elevate", before
  "— plus the AI-vocabulary list", so the AI-vocab list is NOT inside the span):
  ```
  <!-- tfx-sync:slp9-buzzwords source -->
  ... streamline(d), empower, supercharge, effortless(ly), seamless(ly), world-class,
  revolutionise, leverage, unlock, elevate <!-- /tfx-sync:slp9-buzzwords --> — plus the
  AI-vocabulary list: ...
  ```
  (Here the close marker is inline, right after "elevate", so the AI-vocab continuation stays
  outside the span. Adjust to keep the sentence readable.)
- `tfx-content-style/SKILL.md` around lines 58–59 (the CONSUMER):
  ```
  - No marketing buzzwords (SLP-9): <!-- tfx-sync:slp9-buzzwords --> streamline, empower,
    supercharge, effortless, seamless, world-class <!-- /tfx-sync:slp9-buzzwords --> and kin
    describe nothing — say what the thing does. ...
  ```

**Verify**: `grep -rn "tfx-sync:" CLAUDE.md .claude standards/controls/slp-9.md` shows exactly
4 open + 4 close markers (2 named `L0`, 2 named `slp9-buzzwords`), and the rendered text is
unchanged (the only new bytes are the comments).

### Step 2: Add the marker-extractor + two parity helpers to `validate.py`

Add pure functions (called from `collect_errors`, after `catalog_by_id` is built):

- `extract_sync_block(text, name) -> str | None` — regex
  `r"<!-- tfx-sync:" + re.escape(name) + r"\b[^>]*-->(.*?)<!-- /tfx-sync:" + re.escape(name) + r" -->"`
  with `re.DOTALL`; return the captured span or `None` if absent.
- `tokenize_buzzwords(span) -> set[str]` — lowercase; split on commas/whitespace/bullets; for
  each token strip a trailing parenthetical inflection with the regex `^(\w+)\(\w*\)$` →
  group 1 (`streamline(d)` → `streamline`, `effortless(ly)` → `effortless`); drop connector/noise
  tokens (`and`, `kin`, `the`, `—`/`-`, `…`, `plus`, empty). Return the set. **No morphological
  stemming** — match by the paren-stripped token only; the live lists already align this way
  (source `streamline(d)`→`streamline`; skill `streamline`→`streamline`).
- `l0_parity_errors(repo_root, catalog_by_id) -> list[str]`:
  - source set = `{id for id, c in catalog_by_id.items() if c.get("tier") == "L0"}`.
  - For each consumer (`CLAUDE.md`, `.claude/skills/tfx-design-ui/SKILL.md`): read the file;
    `span = extract_sync_block(text, "L0")`; if `None` → `ERROR <rel> [L0-SYNC]: missing
    tfx-sync:L0 markers`. Else collect IDs via `XREF_RE` within the span; if that set ≠ source
    set → an error. Format the sets as sorted comma-joined IDs, e.g.:
    `ERROR harness/CLAUDE.md [L0-SYNC]: inline L0 list {A11Y-1, A11Y-2, A11Y-3} != catalog L0 set {A11Y-1, A11Y-2, A11Y-3, CMP-2}`.
- `slp9_parity_errors(repo_root) -> list[str]`:
  - read `standards/controls/slp-9.md`; `src = extract_sync_block(text, "slp9-buzzwords")`; if
    `None` → `ERROR standards/controls/slp-9.md [SLP9-SYNC]: missing source marker`. Else
    `source = tokenize_buzzwords(src)`.
  - read `.claude/skills/tfx-content-style/SKILL.md`; `con = extract_sync_block(...)`; if `None`
    → missing-marker error. Else `consumer = tokenize_buzzwords(con)`.
  - **subset rule**: `extra = consumer - source`; if `extra` → `ERROR <rel> [SLP9-SYNC]: skill
    buzzword(s) {extra} not in canonical slp-9.md list`.
  - **required core**: `REQUIRED_CORE = {"streamline", "empower", "supercharge"}` — **hard-coded
    by design** (a stable floor that must appear in both lists; it is NOT synced from slp-9.md, so
    that the check has an anchor even if both lists are edited). Document this in SYNC.md (Step 4):
    if the canonical list ever drops one of these, update `REQUIRED_CORE` too. If
    `REQUIRED_CORE - consumer` or `REQUIRED_CORE - source` is non-empty → `ERROR … [SLP9-SYNC]:
    required core buzzword(s) {missing} absent`.
- In `collect_errors`, after the existing steps: `errors += l0_parity_errors(repo_root,
  catalog_by_id)` and `errors += slp9_parity_errors(repo_root)`.

**Verify**: `python3 checks/validate.py` → `OK: <n> controls valid` (the real files are in sync,
so no new errors). If it now errors with `[L0-SYNC]`/`[SLP9-SYNC]`, your markers or tokenizer are
off — fix before proceeding.

### Step 3: Self-test cases (extend `run_self_test`)

Add cases driving the pure helpers with synthetic spans (no real files needed for most):

- **L0 clean**: `XREF_RE` set from a span listing exactly A11Y-1, A11Y-2, A11Y-3, CMP-2 vs.
  source `{A11Y-1,A11Y-2,A11Y-3,CMP-2}` → no error.
- **L0 missing a control**: span omits CMP-2 → `[L0-SYNC]` error.
- **L0 extra control**: span adds A11Y-4 → `[L0-SYNC]` error.
- **L0 order/prose-insensitive**: span lists the four in a different order with different
  surrounding words → clean (proves set comparison).
- **L0 missing markers**: `extract_sync_block(text_without_markers, "L0")` is `None` → the
  consumer loop yields a `missing markers` error.
- **buzzword clean subset**: consumer `{streamline,empower,supercharge}` ⊆ source (the 10) → no
  error.
- **buzzword full set**: consumer == source → no error.
- **buzzword rogue token**: consumer adds `disrupt` (not in source) → `[SLP9-SYNC]` error.
- **buzzword inflection (paren-strip)**: source token `streamline(d)` → `streamline`; consumer
  token `streamline` → `streamline` → match, no error. (This is the realistic live case; the
  tokenizer only strips a trailing `(...)`, it does NOT stem `streamlined`.)
- **buzzword missing core**: consumer lacks `streamline` → required-core error.
- **extractor**: `extract_sync_block` returns the inner span for a well-formed block and `None`
  when the close marker is absent.

Target ~10–12 new cases on top of 034's. Keep the `SELF-TEST OK (N cases)` line.

**Verify**: `python3 checks/validate.py --self-test` → `SELF-TEST OK (N cases)`, exit 0, N up.

### Step 4: Write `SYNC.md`

Create `harness/docs/SYNC.md` capturing:
- **The model**: harness = source · website = publisher (reads harness files through; see
  `lib/catalog.ts`, `lib/llms.ts`) · `validate.py` = the guarantee.
- **The rule**: whole-file duplication → read-through; a fragment that must ship in two
  contexts (the plugin + the project root, or the skill + the control) → `<!-- tfx-sync:NAME -->`
  marker + a `validate.py` parity check; **never a git symlink** — record why (a symlink syncs
  whole files, not the L0-list-inside-CLAUDE.md fragment; and it would dangle or invert the
  plugin/website dependency).
- **The marker grammar**: `<!-- tfx-sync:NAME [source] -->` … `<!-- /tfx-sync:NAME -->`; the
  registered blocks (`L0` → catalog `tier:L0`; `slp9-buzzwords` → slp-9.md source); the
  normalization rules; and "to add a new restated fragment, wrap it and add a helper in
  validate.py."
- Cross-link so SYNC.md is discoverable — one line each: in `harness/README.md` (its
  repository-layout / "where things live" section, e.g. "Fragment sync (markers + validation):
  `docs/SYNC.md`") and in `harness/CONTRIBUTING.md` (near the ratchet/validation workflow, e.g.
  "Restated fragments stay in sync via markers + `validate.py` — see `docs/SYNC.md`"). If an
  obvious section heading isn't present, append under the most relevant existing one and note
  where you put it.

### Step 5: Document the sub-checks

In `harness/checks/README.md` "Validator (built)" section, add a sentence: the validator also
enforces `[L0-SYNC]` (inline L0 lists in CLAUDE.md + tfx-design-ui equal the catalog L0 set) and
`[SLP9-SYNC]` (the tfx-content-style buzzword list is a subset of slp-9.md's canonical list),
via `<!-- tfx-sync:… -->` markers — see `docs/SYNC.md`.

**Verify**: `claude plugin validate .` passes; `git status` shows only in-scope files.

## Test plan

- The embedded `--self-test` (Step 3) is the unit proof — drift, order-insensitivity, inflection
  normalization, subset, required-core, missing-marker.
- Real-file proof: `python3 checks/validate.py` stays `OK` (the live files are in sync).
- **Negative test (proves the guarantee, do NOT commit)**: delete `CMP-2` from the `tfx-sync:L0`
  span in one file → `python3 checks/validate.py` fails with `[L0-SYNC]`, and `pnpm build` (which
  runs the validator after 034) fails at prebuild. Revert.
- Verification: `python3 checks/validate.py --self-test` → `SELF-TEST OK (N cases)`.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] 4 open + 4 close `tfx-sync` markers exist (`grep -rc "tfx-sync:" …` reconciles); no visible text changed
- [ ] `python3 checks/validate.py` → `OK: <n> controls valid` (same `<n>` as before; live files in sync)
- [ ] `python3 checks/validate.py --self-test` → `SELF-TEST OK (N cases)`, N greater than 034's
- [ ] Deleting a control from a `tfx-sync:L0` span makes `validate.py` and `pnpm build` fail with `[L0-SYNC]` (then reverted)
- [ ] Adding a non-canonical buzzword to the skill's `slp9-buzzwords` span fails with `[SLP9-SYNC]` (self-test case)
- [ ] `harness/docs/SYNC.md` exists with the model, marker grammar, and symlink rejection; README + CONTRIBUTING link it
- [ ] slp-9.md frontmatter untouched (`git diff` shows changes only below the closing `---`); `claude plugin validate .` passes
- [ ] Only in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- `validate.py` still runs at import (plan 034 not landed) — land 034 first; this plan needs
  `collect_errors` + `run_self_test`.
- The catalog's L0 set is NOT exactly {A11Y-1, A11Y-2, A11Y-3, CMP-2} at execution time (a new
  L0 control landed) — that is fine and expected; update BOTH inline lists to match the catalog
  in Step 1, and note it. (The whole point is they track the catalog.) Only STOP if you cannot
  determine the live L0 set.
- The tokenizer cannot be made to treat the live skill list as a subset of the live slp-9.md
  list without hard-coding — the lists have genuinely diverged; report the diff rather than
  forcing the check green.

## Maintenance notes

- To add a future restated fragment to the guarantee: wrap it in `<!-- tfx-sync:NEWNAME -->`
  markers, add a `<newname>_parity_errors(...)` helper in `validate.py` with self-test cases,
  and document the block in `SYNC.md`. The pattern is the extractor + a set comparison.
- If a fifth L0 control is ratified, the parity check will *fail loudly* until both inline lists
  are updated — that is the design working, not a bug.
- A reviewer should confirm (a) no rule/list *content* changed, only markers + the validator;
  (b) the SLP-9 check is subset-not-equality (the skill is allowed to show fewer words, never
  more); (c) the markers in slp-9.md are in the body, not the frontmatter.
- **Design-lead review** is required because this edits the always-on `CLAUDE.md` and two
  skills — but it changes no rule, only adds the drift guarantee.
