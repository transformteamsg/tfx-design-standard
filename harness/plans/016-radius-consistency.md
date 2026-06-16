# Plan 016: Extend TOK-3 with a peer-radius-consistency clause anchored to the product's Card radius

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a8ca4fa..HEAD -- harness/standards/catalog.yaml harness/checks/token-audit.py harness/checks/README.md`.
> If the TOK-3 entry or the radius scale changed since this plan was written,
> compare the "Current state" excerpts against the live files; on a mismatch,
> STOP. `python3 checks/validate.py` must pass before AND after your changes.
> Paths are relative to the harness root.

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: LOW (additive `fails_when` bullet + a new detail file; the validator
  guards catalog↔detail consistency)
- **Depends on**: none
- **Category**: docs (normative standard)
- **Planned at**: commit `a8ca4fa`, 2026-06-15

## Why this matters

TOK-3 checks only that corner radii are **on-scale** and that nesting is
**concentric** (`fails_when: child radius larger than parent`). It says nothing
about consistency across *peer* containers. In a real run, a profile `Section`
at `rounded-lg` (8px) and the metric/header cards at `rounded-3xl` (24px) both
passed TOK-3 yet looked inconsistent side by side — the fix was to align the
`Section` to the card radius. Two on-scale values can still read as careless when
peers of the same kind disagree. The standard needs a consistency clause anchored
to the product's Card/base radius as the default for peer cards and sections.

This consistency is **cross-element**, so it is not statically checkable by the
current line-local `token-audit` scanner — the new clause's deterministic half
stays partial (on-scale + concentric, as today) and the **evaluator** carries the
peer-consistency judgment. The detail file must say so honestly rather than imply
a script enforces it.

## Current state

- `standards/catalog.yaml:216-228` — the TOK-3 entry (verbatim):
  ```yaml
  - id: TOK-3
    source: TFX-DS
    title: Corner radii come from the shadcn default radius scale
    tier: L1
    check: deterministic
    phase: [implement, verify]
    applies_to: [component]
    verify: "No off-scale border-radius values; checks/token-audit"
    waiver: documented
    fails_when:
      - ad-hoc radius values
      - child radius larger than parent (non-concentric nesting)
    refs: [https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb]
  ```
  TOK-3 has **no `detail:` field** today.
- `checks/token-audit.py:62-64` — the on-scale radius set the deterministic half
  uses (verbatim): `RADIUS_SCALE_PX = {0, 2, 4, 6, 8, 12, 16, 24, 9999}`. This is
  per-value, per-line — it cannot compare two different elements, so it cannot
  see peer inconsistency. No code change here.
- `app/globals.css:27` — the product's base radius anchor (verbatim):
  `--radius: 0.5rem;` (8px). Peer cards/sections should anchor to this (or the
  product's `Card` component radius) by default.
- `standards/controls/a11y-8.md` and `standards/controls/cmp-2.md` — detail-file
  exemplars. Note the **frontmatter convention**: a detail file repeats the
  catalog fields `id, source, title, tier, check, phase, applies_to, verify,
  waiver, refs` **verbatim** and does NOT include `fails_when` (see `a11y-8.md`
  lines 1-13). `validate.py` enforces that the fields present match the catalog.
  Body sections: `## Requirement`, `## Rationale`, `## Passes when` /
  `## Fails when` (hybrid-style split) or `## How to verify`, and
  `## Evaluator guidance` for the judged half.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Validator | `python3 checks/validate.py` | `OK: …` (before AND after) |
| Frontmatter parse | `python3 -c "import yaml; yaml.safe_load(open('standards/controls/tok-3.md').read().split('---')[1])"` | exit 0 |
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` (run from harness root) |
| Detail pointer present | `grep -c "detail: controls/tok-3.md" standards/catalog.yaml` | 1 |

## Scope

**In scope** (the only files you modify/create):
- `standards/catalog.yaml` — TOK-3 entry **only**: add one `fails_when` bullet
  and the `detail: controls/tok-3.md` field. Change nothing else in the file.
- `standards/controls/tok-3.md` (create) — the detail file with the
  peer-consistency rule and the honest verify split.
- `checks/README.md` — one line in the token-audit coverage note stating
  peer-radius-consistency is judgment-only (no static check).

**Out of scope** (do NOT touch):
- `checks/token-audit.py` — no code change; the scanner cannot compare peers and
  this plan does not try to make it.
- Any other catalog entry or detail file; the TOK-1/TOK-2 controls.
- Product code (`app/globals.css` etc.) — this is the *standard*, not the product.

## Git workflow

- Branch: `advisor/016-radius-consistency`. Conventional commits
  (`docs: TOK-3 peer-radius-consistency clause + detail file`). Do NOT push.

## Steps

### Step 1: Extend the TOK-3 catalog entry

In `standards/catalog.yaml`, edit **only** the TOK-3 entry:
- add a third `fails_when` bullet: `peer containers of the same kind use
  different corner radii — anchor to the product's Card/base radius`
- add `detail: controls/tok-3.md` (place it after the `fails_when` block / before
  `refs`, matching the field order of entries that already carry `detail:` — e.g.
  TOK-1 at `:200`, CMP-1 at `:326`).

Keep `tier: L1` and `check: deterministic` unchanged; leave `verify` as-is (the
detail file carries the deterministic/judgment split).

**Verify**: `grep -c "detail: controls/tok-3.md" standards/catalog.yaml` → 1;
`python3 checks/validate.py` → OK (it now requires `controls/tok-3.md` to exist —
created next).

### Step 2: Write `standards/controls/tok-3.md`

Frontmatter repeats the TOK-3 catalog fields verbatim **except `fails_when`**
(mirror the `a11y-8.md` field set: `id, source, title, tier, check, phase,
applies_to, verify, waiver, refs`). Then:

- `## Requirement` — corner radii are on-scale ({0,2,4,6,8,12,16,24,9999}px) and
  nesting is concentric (child ≤ parent); **and** peer containers of the same
  kind (cards, sections, tiles) share a single radius, anchored by default to the
  product's `Card` component radius / `--radius` token (`0.5rem` in this product).
- `## Rationale` — two on-scale radii can still read as careless when peers
  disagree (a `rounded-lg` section beside `rounded-3xl` cards). Consistency across
  peers is what makes a surface feel deliberate.
- `## Fails when` — ad-hoc/off-scale radius; child radius larger than parent;
  peer containers of the same kind using different radii with no deliberate
  hierarchy reason.
- `## How to verify` — deterministic half: on-scale + concentric via
  `checks/token-audit` (per-value, per-line). **Peer-consistency is
  evaluator-judged** — there is no cross-element static check; name the anchor
  (the product's Card/`--radius`) the evaluator compares peers against.
- `## Evaluator guidance` — **Flag**: peer cards/sections with divergent corner
  radii on the same surface. **Do not flag**: a deliberately different radius that
  signals a different element *class* (e.g. a full-bleed hero vs. inset cards) —
  hierarchy is a reason, drift is not.

**Verify**: the frontmatter-parse command → exit 0; `python3 checks/validate.py`
→ OK.

### Step 3: Note the limitation in the checks README

In `checks/README.md`, in the token-audit coverage note, add one line:
peer-radius-consistency (TOK-3) is **judgment-only** — the scanner checks
on-scale and concentric nesting per element but cannot compare peers; the
evaluator carries consistency.

**Verify**: `grep -c "peer" checks/README.md` → ≥ 1.

## Test plan

No code/tests. Gates: `validate.py` pass (before and after), frontmatter parse,
plugin validation, and a read-through confirming `tok-3.md` follows the
`a11y-8.md`/`cmp-2.md` section structure and frontmatter convention.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `python3 checks/validate.py` → OK (before and after)
- [ ] `grep -c "detail: controls/tok-3.md" standards/catalog.yaml` → 1
- [ ] `ls standards/controls/tok-3.md` exists; frontmatter parses and matches the TOK-3 catalog fields
- [ ] TOK-3 `fails_when` has the new peer-consistency bullet (`grep -c "peer containers" standards/catalog.yaml` → 1)
- [ ] `checks/README.md` notes peer-consistency is judgment-only
- [ ] `claude plugin validate .` passes
- [ ] Only in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- The TOK-3 entry differs from the "Current state" excerpt (drift) — STOP.
- `validate.py` rejects the new detail file's frontmatter for a reason not fixable
  by matching the catalog entry exactly (e.g. it expects `fails_when` in the
  detail file) — report the validator output rather than guessing the schema.
- You are tempted to add peer-consistency detection to `checks/token-audit.py` —
  that is a cross-element check out of scope here; STOP and note it as a future
  enhancement.

## Maintenance notes

- This clause is a strong candidate to migrate under the proposed **LAYOUT
  (`LAY-*`) category** (plan 020) as a "shape consistency" control; cross-reference
  020 so the two don't both grow the same rule independently.
- If a future cross-element scanner is built, its `How to verify` line in
  `tok-3.md` moves from "evaluator-judged" to the real command (mirror the
  pattern other detail files use for planned checks).
- Reviewer should confirm the website still renders TOK-3 correctly — it reads
  `catalog.yaml` raw, so the new `fails_when` bullet appears verbatim on the site.
