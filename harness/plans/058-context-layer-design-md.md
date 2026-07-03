# Plan 058: Per-product context layer — DESIGN.md + generated `.tfx/design.json`, loaded by the design loop

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If
> any STOP condition occurs, stop and report — do not improvise. When done,
> update the 058 row in `harness/plans/README.md` — unless a reviewer
> dispatched you and told you they maintain the index.
>
> **Drift check (run first)**, from repo root:
> `git diff --stat a8316df..HEAD -- harness/.claude/skills/design harness/scripts harness/docs/ONBOARDING.md harness/checks/README.md harness/docs/catalog-changes/lay-1-grid.md`
> (Re-stamped 2026-07-03 after plans 056+057 landed: 056 added scope clauses
> to the design skill's "Load first" para and intent step 3 — the same two
> paragraphs Step 5 edits. The excerpts and Step 5 below already reflect the
> post-056 text; 058's edits are ADDITIVE to 056's, not replacements.)
> On any change, compare the excerpts below before proceeding; mismatch = STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (new artifact spec consumed by the design loop; staleness is the failure mode)
- **Depends on**: none hard. Coordinates with 056 (audience is NOT in DESIGN.md — it's a catalog scope dimension) and with 053's gate (see Step 1).
- **Category**: direction
- **Planned at**: commit `48d13dd`, 2026-07-03; re-stamped `a8316df` after 056/057 landed

## Why this matters

Per-product design nuance is scattered: the per-product primary lives in
`standards/controls/col-1.md`, tone weighting in the content skill's §6
table, motion conventions nowhere, and plan 053 proposed a separate
`.tfx/layout-system.json` just for grid declarations. The design loop has no
single place to read "what makes this product this product".

Decisions (grilling session, 2026-07-03, operator-confirmed):
- **Two artifacts per product repo**: a human-owned `DESIGN.md` (visual
  parameters) AND a generated `.tfx/design.json` (machine twin) from day one,
  so deterministic checks/hooks can be product-aware immediately.
- **No PRODUCT.md** — audience is 056's catalog dimension; voice/tone is the
  content skill's §6. Do not create it.
- **No `register:` dimension** — brand impact is mostly colour choices,
  already carried by DESIGN.md colour parameters + COL-1. Note in the spec
  that a `register` field may be added later; do not add it now.
- **Code overrides stale docs** (impeccable's hedge, adopted): when DESIGN.md
  disagrees with the product's actual implemented conventions, the code wins
  and the agent flags the drift instead of applying the stale doc.
- **DESIGN.md carries only per-product parameters** — never restatements of
  catalog rules (that recreates the drift SYNC.md exists to prevent).

## Current state

- `harness/.claude/skills/design/SKILL.md` (~lines 28–36, post-056): "**Load
  first:** the control catalog at `standards/catalog.yaml` … resolve it
  relative to this SKILL.md file, three levels up … **Filter controls by
  `phase` and scope (`products`/`audiences` — absent = global) as you go**;
  read a control's `detail` file … before applying it. Also load the
  `standards` skill for the waiver protocol." (The bolded scope clause is
  056's addition — 058 adds a DESIGN.md-loading sentence to the SAME
  paragraph, after this one.)
- Intent step 3 (~lines 137–144, post-056): "**Product and page type**:
  which product (TW / CaseSync / Glow / TW surface — this sets tone
  calibration per `content`) … Page type selects controls via `applies_to`.
  **Audience**: who does this surface serve — teachers (the default …),
  students (ask which band …), or parents? Record it in the sprint
  contract…" (The Audience block is 056's addition — 058 adds a DESIGN.md
  sentence to this cluster.)
- `harness/docs/catalog-changes/lay-1-grid.md` (plan 053, **gate-pending**)
  proposes `.tfx/layout-system.json` in the product repo (lines 53, 95–110;
  grades N/A when the file is absent). This plan ABSORBS that file into
  `.tfx/design.json` — see Step 1.
- Recorded per-product facts (seed content for the templates):
  - `standards/controls/col-1.md` — TW → T&S Blue `#0064FF`, CaseSync →
    Radix indigo-9, Glow → Radix orange-9.
  - Content skill §6 — TW neutral/steady, CaseSync reserved/privacy-forward,
    Glow warmer/encouraging; Posts/PG Staff Portal = pure TW.
- `harness/scripts/` — currently `file-feedback-issue.py` + README; the
  generator lives here. Convention: stdlib-only Python, `--self-test`,
  honest failure (see file-feedback-issue.py as exemplar).
- `harness/docs/ONBOARDING.md` — the repo-adoption checklist; gains item for
  the context files.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Generator self-test | `cd harness && python3 scripts/generate-design-json.py --self-test` | exit 0 |
| Generate | `python3 harness/scripts/generate-design-json.py <repo-root>` | writes `.tfx/design.json`, exit 0 |
| Catalog validation | `cd harness && python3 checks/validate.py` | `OK:` line, exit 0 |
| Plugin validation | `claude plugin validate harness` | exit 0 (pre-existing root-CLAUDE.md warning only) |

## Scope

**In scope**:
- `harness/docs/DESIGN-CONTEXT.md` (create — the spec: DESIGN.md format,
  design.json schema, loading rules, code-overrides-stale-docs)
- `harness/docs/templates/DESIGN.md` (create — the annotated template product
  repos copy)
- `harness/scripts/generate-design-json.py` (create) + `harness/scripts/README.md` (one entry)
- `harness/.claude/skills/design/SKILL.md` (body only — the loading step)
- `harness/docs/ONBOARDING.md` (new checklist item)
- `harness/docs/catalog-changes/lay-1-grid.md` (one amendment note — Step 1)
- `harness/plans/README.md` (row)

**Out of scope**:
- Any skill `description:` (routing sweep trigger — STOP if needed).
- The catalog, schema.json, validators, website.
- Product repos themselves (they copy the template later).
- `checks/*.py` — consuming design.json is plan 059.
- The content skill §6 table and col-1.md — the template CITES them; their
  values are seeds for the template's examples, not moved.

## Git workflow

Branch `advisor/058-context-layer`; commits like
`feat(harness): per-product context layer — DESIGN.md spec + design.json generator (plan 058)`.
No push/PR unless instructed.

## Steps

### Step 1: Amend the 053 record (coordination, not a gate bypass)

Append a dated note to `docs/catalog-changes/lay-1-grid.md`: the proposed
`.tfx/layout-system.json` is superseded in *location* — its `layout-system`
object becomes a top-level key inside `.tfx/design.json` (plan 058); the
control proposal itself and its gate status are unchanged. Do not edit any
other part of the record.

**Verify**: `grep -c "design.json" harness/docs/catalog-changes/lay-1-grid.md` → ≥ 1.

### Step 2: Write the spec — `harness/docs/DESIGN-CONTEXT.md`

Contents (all normative rules from "Why this matters" above, plus):

- **DESIGN.md** lives at the product repo root. Sections (all optional, omit
  what doesn't differ from portfolio defaults): `## Colour` (primary +
  accent usage beyond COL-1's table), `## Tone weighting` (pointer to
  content §6 + any product-specific notes), `## Motion` (product
  conventions), `## Layout system` (the 053 grid declaration, prose form),
  `## Components` (product-specific component notes, e.g. AvatarFallback
  default). Rule stated in the spec: **parameters only, never catalog-rule
  restatements**; each section cites its normative source where one exists.
- **`.tfx/design.json`** — generated only, never hand-edited; header key
  `"generated_from": "DESIGN.md"` + `"generated_at"`. Schema: one top-level
  key per DESIGN.md section (`colour`, `tone`, `motion`, `layout_system`,
  `components`), values as structured data where the section carries any
  (hex/token strings, scale numbers), else the prose verbatim.
- **Loading rules** (for the design skill): read DESIGN.md at intent (product
  identification) and implement; absent file = portfolio defaults apply,
  grade nothing N/A-for-missing-context as a failure; **code overrides stale
  docs** — on disagreement, follow the implemented convention and tell the
  user DESIGN.md has drifted.
- A `register` field is reserved for the future; not used today.

**Verify**: file exists; `grep -c "code overrides\|code wins" harness/docs/DESIGN-CONTEXT.md` → ≥ 1.

### Step 3: Write the template — `harness/docs/templates/DESIGN.md`

Annotated template with the sections above, filled with commented examples
seeded from the recorded facts (COL-1 table values, §6 tone lines) and
`<!-- delete sections that don't differ -->` guidance. Keep ≤ 60 lines.

**Verify**: `grep -c "0064FF" harness/docs/templates/DESIGN.md` → 1 (the TW example).

### Step 4: Build the generator — `harness/scripts/generate-design-json.py`

Stdlib-only Python (match `file-feedback-issue.py`'s conventions): parse
DESIGN.md's `##` sections into the json schema from Step 2, write
`.tfx/design.json` under the given repo root, refuse to run if DESIGN.md is
absent (exit 1 with a clear message), `--check` mode that exits 2 when the
existing json is stale vs the markdown (for CI), `--self-test` with ≥ 8
cases (roundtrip, missing file, stale check, section omission). Add an entry
to `harness/scripts/README.md`.

**Verify**: `python3 harness/scripts/generate-design-json.py --self-test` → exit 0; run it against a temp dir containing the Step-3 template → produces valid json (`python3 -m json.tool` parses it), then delete the temp output.

### Step 5: Wire the design skill (body only)

1. In the "Load first" paragraph, immediately AFTER 056's scope-filter
   sentence ("…read a control's `detail` file … before applying it.") and
   before the "Also load the `standards` skill" sentence, add: "Also read
   the product's `DESIGN.md` (repo root) if present — per-product parameters
   only; on conflict with implemented code conventions, the code wins and
   you flag the drift. Spec: the harness's `docs/DESIGN-CONTEXT.md`." Do NOT
   remove or reword 056's scope-filter clause.
2. In intent step 3, at the END of the product+audience cluster (after
   056's "…it scopes `audiences:`-scoped controls for the rest of the
   loop."), add: "If the product repo has a `DESIGN.md`, load it now — it
   calibrates colour/tone/motion for everything downstream." Do NOT remove
   or reword 056's Audience block.

**Verify**: `grep -c "DESIGN.md" harness/.claude/skills/design/SKILL.md` → ≥ 2; `git diff harness/.claude/skills/design/SKILL.md | grep "^[-+]description:"` → empty.

### Step 6: ONBOARDING.md item + gates

1. Add a checklist item to `harness/docs/ONBOARDING.md` (after item 2,
   Component manifest): copy `docs/templates/DESIGN.md`, fill it, run the
   generator, commit both files. Mark it optional-but-recommended (absent =
   portfolio defaults).
2. Gates: `python3 checks/validate.py` → OK; `claude plugin validate harness`
   → exit 0; routing spot-check 5 cases (body-only edits — same 5 as plan
   056 step 11.5); `git status --short` → in-scope only. Update the index row.

## Test plan

- Generator `--self-test` (≥ 8 cases) is the regression suite.
- Template → generator roundtrip in Step 4 proves the pair agrees.
- validate.py + plugin validate + 5-case routing spot-check.

## Done criteria

- [ ] Spec, template, and generator exist; generator self-test exit 0
- [ ] Template roundtrips through the generator to valid json
- [ ] Design skill loads DESIGN.md (grep ≥ 2), description untouched
- [ ] 053 record carries the supersession note; nothing else in it changed
- [ ] `python3 harness/checks/validate.py` exit 0; `claude plugin validate harness` exit 0
- [ ] Routing spot-check 5/5; `git status` in-scope only; index row updated

## STOP conditions

- Any excerpt drifted since `a8316df` (the re-stamped base after 056/057).
- The change seems to need a skill `description:` edit or a catalog/schema change.
- You find yourself writing catalog rules INTO the template (restatement) —
  report instead.
- 053's record has moved past its gate in a way that conflicts with Step 1.

## Maintenance notes

- Staleness is the known failure mode: plan 059's detector should run the
  generator's `--check` mode; until then the skill's code-wins rule is the
  only guard.
- When 057 lands IDN-3 (tone calibration), its detail table and DESIGN.md's
  tone section must point at the same source (content §6) — watch for a
  third copy appearing.
- `audiences` (056) and DESIGN.md are orthogonal on purpose: who it's for is
  catalog scope; how this product looks is context. Don't merge them.
