# Plan 002: Build the catalog validator — one command that proves the normative layer is internally consistent

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: if git exists (plan 001 done), run
> `git log --oneline -5` and note the HEAD. Either way, confirm the "Current
> state" excerpts below match the live files; on a mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (001 recommended first so the work lands in git)
- **Category**: tests
- **Planned at**: `no-git (pre-init)`, 2026-06-10

## Why this matters

`standards/catalog.yaml` is the normative layer of this harness — 22 controls
that an AI agent must satisfy when designing UI. Nothing validates it. A typo'd
`tier:`, a `detail:` pointing at a missing file, a control ID referenced in a
skill but absent from the catalog, or a detail file whose frontmatter drifts
from its catalog entry — all fail silently, and silent drift in the rulebook is
the exact failure the harness exists to prevent. Additionally,
`standards/README.md` currently claims detail-file frontmatter "is the source
of truth; catalog.yaml is regenerated from these files when both exist" — **no
regeneration mechanism exists**, so that sentence is wrong and must be fixed to
match reality (catalog is source of truth; validator enforces the match).

## Current state

- `standards/catalog.yaml` — 22 controls under a top-level `controls:` list.
  Entry shape (excerpt, first entry):

  ```yaml
  controls:
    # ── Accessibility (WCAG 2.2 AA — self-imposed floor) ──────────────────
    - id: A11Y-1
      source: TFX-DS
      title: Text meets WCAG AA contrast — 4.5:1 body, 3:1 large text and UI components
      tier: L0
      check: deterministic
      phase: [implement, verify]
      applies_to: [page, component]
      verify: "Contrast scan (axe or checks/contrast); zero violations"
      waiver: none
      refs: [https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb]
  ```

  Exactly 5 entries carry a `detail:` field: TOK-1 → `controls/tok-1.md`,
  TYP-2 → `controls/typ-2.md`, CMP-2 → `controls/cmp-2.md`,
  CNT-1 → `controls/cnt-1.md`, CNT-2 → `controls/cnt-2.md`.
- `standards/controls/` — exactly 5 files: `cmp-2.md cnt-1.md cnt-2.md tok-1.md typ-2.md`.
  Each has YAML frontmatter between `---` lines repeating the catalog fields,
  e.g. `standards/controls/typ-2.md` starts:

  ```markdown
  ---
  id: TYP-2
  source: TFX-DS
  title: Body text at least 14px; labels at least 11px; body line-height 1.5-1.6
  tier: L1
  ...
  ---
  ```

- `standards/README.md` — the schema spec. Allowed values it defines:
  `tier:` L0|L1|L2 · `check:` deterministic|judgment|hybrid · `phase:` subset of
  [intent, plan, implement, verify] · `applies_to:` subset of
  [page, component, flow, content] · `waiver:` none|documented|rationale.
  Tier→waiver pairing: L0→none, L1→documented, L2→rationale.
  The sentence to fix is in the "Detail file format" section:
  `# frontmatter repeats the catalog entry verbatim (it is the source of truth;`
  `# catalog.yaml is regenerated from these files when both exist)`
- Control IDs are referenced in prose across `.claude/skills/*/SKILL.md`,
  `CLAUDE.md`, `checks/README.md`, `docs/decisions/TEMPLATE.md` using the
  pattern `(A11Y|TOK|TYP|COL|CMP|CNT|MOT|IDN)-<n>` (ranges written like
  `TOK-1..3` also appear — the validator only needs to check plain IDs).
- Environment: Python 3.9.6 at `python3`, **pyyaml 6.0.3 importable**
  (verified: `python3 -c "import yaml"` succeeds). No package.json, no CI.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| YAML loads | `python3 -c "import yaml,sys; yaml.safe_load(open('standards/catalog.yaml'))"` | exit 0 |
| Run validator (after step 1) | `python3 checks/validate.py` | `OK: 22 controls valid` and exit 0 |
| Plugin still valid | `claude plugin validate .` | `✔ Validation passed` |

## Scope

**In scope**:
- `checks/validate.py` (create)
- `checks/README.md` (add a short "Validator (built)" subsection)
- `standards/README.md` (fix the source-of-truth sentence; document the validator command)
- `README.md` (mention the validator in "Status & roadmap" V0 line — one clause)

**Out of scope**:
- `standards/catalog.yaml` and `standards/controls/*.md` content — if the
  validator finds real inconsistencies in them, that is a FINDING to report,
  not something to silently fix (see STOP conditions; trivial mechanical
  mismatches in frontmatter MAY be fixed to match the catalog, since the plan
  declares catalog.yaml the source of truth — list every such fix in your report).
- The 12 planned check scripts in `checks/README.md` (contrast, token-audit,
  …) — this plan builds the catalog validator only, not the design checks.
- Skill prose beyond the single sentence in `standards/README.md`.

## Git workflow

- Branch: `advisor/002-catalog-validator` if git exists; otherwise work in
  place and note it.
- Conventional commits, e.g. `feat: add catalog validator (checks/validate.py)`.
- Do NOT push.

## Steps

### Step 1: Write `checks/validate.py`

Plain Python 3.9 + pyyaml, no other deps. It must check, in order:

1. `standards/catalog.yaml` parses; top-level key `controls` is a non-empty list.
2. Per control — required fields present: `id, source, title, tier, check,
   phase, applies_to, verify, waiver`. Allowed values exactly as in "Current
   state" above. `phase`/`applies_to` are lists with only allowed members.
3. Tier→waiver pairing: L0→none, L1→documented, L2→rationale. Violation = error.
4. `id` uniqueness and prefix shape `^(A11Y|TOK|TYP|COL|CMP|CNT|MOT|IDN)-\d+$`.
5. Every `detail:` path exists relative to `standards/`.
6. Reverse check: every `standards/controls/*.md` file corresponds to a catalog
   entry (filename lowercased id, e.g. `tok-1.md` ↔ `TOK-1`) AND its YAML
   frontmatter fields, where present, match the catalog entry exactly
   (`id, source, title, tier, check, phase, applies_to, verify, waiver`).
   Mismatch = error naming the field, file value, and catalog value.
7. Cross-reference sweep: scan `CLAUDE.md`, `README.md`, `checks/README.md`,
   `docs/decisions/TEMPLATE.md`, `.claude/skills/*/SKILL.md`,
   `.claude/agents/*.md` for the regex `\b(A11Y|TOK|TYP|COL|CMP|CNT|MOT|IDN)-\d+\b`;
   every match must be an id in the catalog. (Skip matches inside
   `plans/` — plans may reference historical ids.)

Output contract: on success print `OK: <n> controls valid` and exit 0. On
failure print one line per violation as `ERROR <file>: <message>` and exit 1.
Verbose on failure, quiet on success — this matches the convention already
documented in `checks/README.md` ("verbose on failure, silent on success").

**Verify**: `python3 checks/validate.py` → `OK: 22 controls valid`, exit 0.
Then prove it catches errors: temporarily change one control's `tier: L1` to
`tier: L9`, rerun → exit 1 with an `ERROR` line naming the control; revert the
change; rerun → OK again.

### Step 2: Fix the source-of-truth sentence in `standards/README.md`

Replace the comment lines inside the "Detail file format" code block:

```
# frontmatter repeats the catalog entry verbatim (it is the source of truth;
# catalog.yaml is regenerated from these files when both exist)
```

with:

```
# frontmatter repeats the catalog entry verbatim. catalog.yaml is the source
# of truth; checks/validate.py fails if a detail file drifts from it.
```

Also add one sentence at the end of the README's intro (after "Standards are
the only layer the harness can enforce automatically."):
`Run `python3 checks/validate.py` to verify the catalog, detail files, and all cross-references are consistent.`

**Verify**: `grep -c "regenerated" standards/README.md` → 0;
`grep -c "validate.py" standards/README.md` → ≥ 2.

### Step 3: Document the validator in `checks/README.md` and `README.md`

In `checks/README.md`, add directly under the intro paragraph (before the
"Planned for V1" table):

```markdown
## Validator (built)

`python3 checks/validate.py` — validates `standards/catalog.yaml` against the
schema in `standards/README.md`: field presence and allowed values, tier→waiver
pairing, `detail:` file existence, detail-frontmatter ↔ catalog consistency,
and that every control ID referenced in skills/docs exists in the catalog.
Exit 0 silent-ish on pass, exit 1 with `ERROR` lines on failure. This is the
repo's verification baseline — run it before committing any `standards/` change.
```

In root `README.md`, in the "Status & roadmap" V0 bullet, append:
`Verification baseline: python3 checks/validate.py.`

**Verify**: `grep -c "validate.py" checks/README.md README.md` → ≥ 1 each;
`python3 checks/validate.py` → OK; `claude plugin validate .` → passes.

## Test plan

The validator is its own test subject; the mutation check in Step 1's Verify is
the regression test. Additionally run these three mutations (revert after each):
remove `waiver:` from one control → ERROR; rename `standards/controls/tok-1.md`
to `tok-9.md` → ERROR (orphan file); add `FAKE-9` to a sentence in CLAUDE.md →
ERROR (unknown reference). All three must fail with exit 1, then pass after revert.

## Done criteria

- [ ] `python3 checks/validate.py` → `OK: 22 controls valid`, exit 0
- [ ] All four mutation tests produced exit 1 with a specific ERROR line, and the repo is reverted clean afterwards
- [ ] `grep -c "regenerated" standards/README.md` → 0
- [ ] `claude plugin validate .` → `✔ Validation passed`
- [ ] Only in-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- The validator, once correct, reports REAL errors in the existing catalog or
  detail files beyond trivial frontmatter mismatches — report them as findings
  with the ERROR output; do not rewrite controls to silence the tool.
- `import yaml` fails (environment drifted from recon) — report; do not
  pip-install into the user's environment.
- The catalog has a different count than 22 controls (content drifted; the
  validator should still work, but report the discrepancy).

## Maintenance notes

- When plan 004's loop run or the ratchet adds controls, the validator is the
  gate — wire it into CI (and optionally a PostToolUse hook on `standards/`
  edits) once a remote/CI exists; that wiring is deliberately deferred to keep
  this plan environment-independent.
- If the catalog grows fields, update BOTH `standards/README.md` (spec) and
  `checks/validate.py` (enforcement) in the same change.
