# Plan 012: Make COL-1 a per-product primary colour, not Teacher & School Blue portfolio-wide

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a8ca4fa..HEAD -- harness/standards/catalog.yaml harness/.claude/skills/tfx-design-ui/SKILL.md harness/CLAUDE.md`.
> If COL-1 or the "stack" notes changed since this plan was written, compare the
> "Current state" excerpts against the live files; on a mismatch, STOP.
> `python3 checks/validate.py` must pass before AND after your changes. Paths are
> relative to the harness root.

## Status

- **Priority**: P1 (direct, repeated user direction from the harness lead)
- **Effort**: S–M
- **Risk**: LOW (additive detail file + rewording; validator guards consistency)
- **Depends on**: none
- **Category**: docs (normative standard correction)
- **Planned at**: commit `a8ca4fa`, 2026-06-15

## Why this matters

COL-1 currently names **Teacher & School Blue `#0064FF` as *the* primary**, and
its `fails_when` literally flags *"another product's primary used for emphasis."*
That is correct only for Teacher Workspace. The portfolio is **independent
products**: Glow's primary is orange, CaseSync's is indigo. As written, the
control would mark Glow's own orange CTA a violation — backwards. The harness
lead has stated this twice: the primary is **per product**, not portfolio-wide.
The same portfolio-wide framing is echoed in the design-ui skill and the harness
CLAUDE.md, so an agent designing a Glow screen is told to anchor on blue. Fix the
control to "each product's own primary," with a per-product token/hex table, and
align the two skill/memory notes.

## Current state

- `standards/catalog.yaml` — COL-1 entry (verbatim, `catalog.yaml:286-298`):
  ```yaml
  - id: COL-1
    source: TFX-DS
    title: Primary actions and brand moments use Teacher & School Blue #0064FF or its ramp
    tier: L1
    check: deterministic
    phase: [implement, verify]
    applies_to: [page, component]
    verify: "Primary action / brand-moment colours resolve to T&S Blue or its ramp tokens"
    waiver: documented
    fails_when:
      - primary CTA in a non-primary colour
      - another product's primary used for emphasis
    refs: [https://moediva.notion.site/...]
  ```
  COL-1 has **no `detail:` field** today.
- The per-product primaries are already defined in the product repo —
  `app/globals.css:13-15` (verbatim):
  ```css
  --tw-blue: #0064ff;        /* Teacher Workspace — brand anchor */
  --casesync: #3e63dd;       /* Radix indigo-9 (proposed) */
  --glow: #f76b15;           /* Radix orange-9 (proposed) */
  ```
  So the table is: **Teacher Workspace** = `#0064FF` (Teacher & School Blue);
  **CaseSync** = Radix indigo-9 `#3E63DD`; **Glow** = Radix orange-9 `#F76B15`.
  (Glow/CaseSync values are marked "proposed" in the product CSS — note that in
  the detail file so a later confirmed value can supersede them.)
- `.claude/skills/tfx-design-ui/SKILL.md:36-37` (verbatim): *"Teacher & School
  Blue `#0064FF` anchors primary actions and brand moments. Build from these by
  default."*
- `harness/CLAUDE.md` — the "stack is fixed and boring" bullet: *"Teacher &
  School Blue `#0064FF` for primary actions and brand moments."*
- `standards/controls/cnt-2.md` / `cmp-2.md` — use either as the structural
  exemplar for a detail file (frontmatter repeating the catalog entry verbatim,
  then `## Requirement`, `## Rationale`, `## How to verify` or `## Evaluator
  guidance`). `validate.py` enforces frontmatter ↔ catalog consistency.
- `standards/README.md` — the control format/schema the validator checks; read
  the frontmatter field list before writing the detail file.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Validator | `python3 checks/validate.py` | `OK: …` (before AND after) |
| Frontmatter parse | `python3 -c "import yaml; yaml.safe_load(open('standards/controls/col-1.md').read().split('---')[1])"` | exit 0 |
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` (run from harness root) |
| No portfolio-wide blue left | `grep -rn "0064FF\|0064ff\|Teacher & School Blue" standards/ .claude/skills/ CLAUDE.md` | only the per-product table / TW-specific lines remain |

## Scope

**In scope** (the only files you modify/create):
- `standards/catalog.yaml` — reword COL-1 `title`, `verify`, `fails_when`; add
  `detail: controls/col-1.md`. Change **nothing else** in the file.
- `standards/controls/col-1.md` (create) — the detail file with the per-product
  table.
- `.claude/skills/tfx-design-ui/SKILL.md` — reword the stack note at `:36-37`.
- `harness/CLAUDE.md` — reword the matching stack bullet.

**Out of scope** (do NOT touch):
- Any other catalog entry or detail file.
- COL-2 (functional colours) — separate control, unchanged.
- Product code (`app/globals.css` etc.) — the tokens already exist; this plan is
  the *standard*, not the product.
- The website's rendering components — they read the catalog raw; no code change
  needed.

## Git workflow

- Branch: `advisor/012-per-product-primary`. Conventional commits
  (`docs: COL-1 is each product's own primary, not T&S Blue portfolio-wide`).
  Do NOT push.

## Steps

### Step 1: Reword the COL-1 catalog entry

In `standards/catalog.yaml`, edit **only** the COL-1 entry:
- `title:` → `Primary actions and brand moments use the product's own primary brand colour (or its ramp)`
- `verify:` → `Primary action / brand-moment colours resolve to the active product's primary token or its ramp (see controls/col-1.md for the per-product table)`
- `fails_when:` →
  - `primary CTA in a colour that is not the product's primary`
  - `one product's primary used inside another product's surface`
- add `detail: controls/col-1.md` (place it after `fails_when`/before `refs`,
  matching the field order of entries that already carry `detail:` — e.g.
  CMP-1).

**Verify**: `python3 checks/validate.py` → OK (it will now require
`controls/col-1.md` to exist with matching frontmatter — created next).

### Step 2: Write `standards/controls/col-1.md`

Frontmatter repeats the updated catalog entry verbatim (all fields, same values
— the validator enforces this), then:
- `## Requirement` — each product anchors primary actions and brand moments in
  its **own** primary brand colour and that colour's ramp; do not import another
  product's primary for emphasis. The active product is set in Phase 1 of the
  design-ui loop.
- `## Per-product primary` — a table:

  | Product | Primary | Token | Value |
  |---|---|---|---|
  | Teacher Workspace | Teacher & School Blue | `--tw-blue` | `#0064FF` |
  | CaseSync | Radix indigo-9 | `--casesync` | `#3E63DD` (proposed) |
  | Glow | Radix orange-9 | `--glow` | `#F76B15` (proposed) |
  | TW surfaces (Posts / PG Staff Portal) | Teacher & School Blue | `--tw-blue` | `#0064FF` |

  Note the "(proposed)" marker mirrors `app/globals.css:14-15`; replace with the
  confirmed value when the design lead settles it.
- `## Rationale` — products are independent identities; teachers recognise a
  product partly by its colour. Forcing one blue across the portfolio erases that
  and mislabels a correct Glow orange CTA as a violation.
- `## How to verify` — deterministic half: the active product's primary token
  resolves the CTA/brand colour (the `checks/token-audit` allowlist already knows
  the product's `--color-*` names — see plan 011). Judgment half: the evaluator
  confirms no *other* product's primary appears for emphasis on the surface.

**Verify**: the frontmatter-parse command → exit 0; `python3 checks/validate.py`
→ OK.

### Step 3: Align the two stack notes

- `.claude/skills/tfx-design-ui/SKILL.md:36-37` — replace the T&S-Blue sentence
  with: *"Each product anchors primary actions and brand moments in its **own**
  primary (Teacher Workspace → Teacher & School Blue `#0064FF`; Glow → orange;
  CaseSync → indigo — see COL-1's detail file for the table). Build from these by
  default."*
- `harness/CLAUDE.md` — change the stack bullet from "Teacher & School Blue
  `#0064FF` for primary actions and brand moments" to "Each product's **own**
  primary for primary actions and brand moments (TW → T&S Blue `#0064FF`; Glow →
  orange; CaseSync → indigo; COL-1)."

**Verify**: the `grep -rn "0064FF\|0064ff\|Teacher & School Blue" …` command →
every remaining hit is either the per-product table or an explicitly
TW-scoped/example mention; no surviving line presents blue as *the* portfolio
primary.

## Test plan

No code/tests. Gates: `validate.py` pass, frontmatter parse, plugin validation,
and the grep sweep confirming no portfolio-wide-blue framing survives outside the
per-product table.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `python3 checks/validate.py` → OK (before and after)
- [ ] `ls standards/controls/col-1.md` exists; its frontmatter parses and matches the updated COL-1 catalog entry
- [ ] `grep -c "detail: controls/col-1.md" standards/catalog.yaml` → 1
- [ ] `grep -c "Per-product primary" standards/controls/col-1.md` → 1
- [ ] `claude plugin validate .` passes
- [ ] The grep sweep shows no surviving "blue is the primary" framing outside the table / TW-specific lines
- [ ] Only in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- `validate.py` rejects the new detail file's frontmatter for a reason you can't
  resolve by matching the catalog entry exactly — report the validator output.
- You find COL-1's portfolio-wide framing referenced in a file **outside** the
  in-scope list (e.g. `tfx-design-standards` skill, the evaluator agent, content
  pages) — STOP and report the list rather than editing out-of-scope files.
- The Glow/CaseSync values in `app/globals.css` differ from `#F76B15` / `#3E63DD`
  (the source drifted) — use the live values and note the discrepancy.

## Maintenance notes

- Glow and CaseSync primaries are marked "proposed" in `app/globals.css`; when
  the design lead confirms them, update the table in `col-1.md` (one edit) — the
  catalog entry need not change.
- This pairs with plan 011: once `token-audit` is project-token-aware, the COL-1
  deterministic half ("resolves to the product's primary token") becomes
  mechanically checkable per product rather than hard-coded to one hex.
- Reviewer should confirm the website still renders COL-1 correctly — it reads
  `catalog.yaml` raw, so the reworded title/verify appear verbatim on the site.
