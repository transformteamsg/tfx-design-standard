# Plan 021: Content sweep — waiver syntax, CI wiring, foundation inherit-signals, principle de-branding, small dedupes

> **Executor instructions**: Follow this plan step by step. Every edit in this
> plan is enumerated — make ONLY the listed edits. Run every verification and
> confirm the expected result. If any STOP condition occurs, stop and report.
> Do NOT update `plans/README.md` — your reviewer maintains the index.
>
> **Drift check (run first)**:
> `git diff --stat 7fbc703..HEAD -- content/sections/standards.mdx content/sections/for-agents.mdx content/sections/harness.mdx content/sections/guidelines.mdx content/guidelines/voice-tone.mdx content/principles/product-design-principles.mdx content/foundations/typography.mdx content/foundations/colour.mdx content/foundations/iconography.mdx content/harness/tools.mdx content/governance/governance.mdx`
> Expect no output. Any drift: compare the excerpt for that file below;
> mismatch = STOP for that file (do the others, report the skip).

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW (enumerated line-level prose edits)
- **Depends on**: none (lands alongside 016/019; file sets are disjoint)
- **Category**: docs
- **Planned at**: commit `7fbc703`, 2026-07-12

## Why this matters

A content audit (2026-07-12, all 41 content files) found the remaining
credibility leaks for tomorrow's division presentation: two pages still teach
the retired `tfx-waive` syntax as current, a guideline cites a skill by its
dead name, an engineer looking for "how do I wire this into CI" dead-ends, the
foundation pages present Teachers & School's concrete choices as if they were
the universal foundation, and a principle that is claimed to bind every domain
is titled "Design for One Teacher". Each fix below is small; together they make
the site's story consistent with the division model it now claims.

## Ground truth you must not contradict

- Canonical waiver syntax (catalog meta): `dxd-waive <ID> reason="<specific reason>"`;
  legacy `tfx-waive` markers remain valid — say so where you update syntax.
- Skills are namespaced `/dxd:` (e.g. `dxd:copy`) — see `content/harness/skills.mdx`.
- The division model: one foundation; domains declare brand (stack, type,
  colour are PROFILE facts, not foundation rules); foundation controls bind
  every domain; T&S is the first, settled domain.
- SLP-9 (AI-writing tells) binds all your prose: read
  `harness/standards/controls/slp-9.md` before writing.
- Singapore English (organise, colour, centre); second person; sentence case.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Build (MDX parse gate) | `pnpm build` | exit 0, no `[doc-page]` warnings |
| Standards guard | `node scripts/check-standards.mjs` | OK line |
| Content-lint (harness checker) | `python3 harness/checks/content-lint.py content/ 2>/dev/null \|\| true` | run it; if it reports NEW findings your edits introduced, fix them; pre-existing findings are not yours |

## Scope

**In scope** (ONLY these eleven files):
`content/sections/standards.mdx`, `content/sections/for-agents.mdx`,
`content/sections/harness.mdx`, `content/sections/guidelines.mdx`,
`content/guidelines/voice-tone.mdx`,
`content/principles/product-design-principles.mdx`,
`content/foundations/typography.mdx`, `content/foundations/colour.mdx`,
`content/foundations/iconography.mdx`, `content/harness/tools.mdx`,
`content/governance/governance.mdx`

**Out of scope** (sibling plans own them — do NOT touch):
`content/sections/landing.mdx`, `home.mdx`, `how-to-read.mdx`,
`products.mdx`, `domains.mdx` (plan 019); `content/harness/loop.mdx`,
`get-started.mdx` (plan 017); `content/governance/changes.mdx` (plan 016);
every file under `content/domains/`, `content/products/`; all frontmatter
`answers:` keys; all components and app code; `harness/**`.

## Git workflow

- Worktree branch `advisor/021-content-sweep`; commits per file-group;
  style `docs(site): …`; do not push.

## The edits

### E1 · standards.mdx — waiver syntax

Current (line 20 area): "Deviation requires a documented waiver in code:
`tfx-waive <ID> reason=\"<specific reason>\"`."
→ `dxd-waive <ID> reason="<specific reason>"` and append the sentence:
"Legacy `tfx-waive` markers remain valid."

### E2 · for-agents.mdx — waiver syntax + a CI section

1. Line 25 area: "L1 needs `tfx-waive <ID> reason=\"...\"` in code" →
   `dxd-waive`, with the same legacy note (once).
2. Append a new section at the end of the file:

```md
## Wire it into CI

Two layers, depending on how deep you integrate:

- **Consume the contract.** Point your tooling at
  [/standards/catalog.yaml](/standards/catalog.yaml) and grade what you build
  against each control's `verify` and `fails_when`.
- **Run the checks.** The harness repo carries the deterministic checkers the
  catalog references (schema validation, token audit, static accessibility)
  and this site's own CI runs them on every push — install the plugin from the
  [get started](/harness/get-started) page and your repo gets the same checks
  in the design loop. Not every control has a script; the catalog's `enforced`
  field says which are machine-checked today, and nothing unscripted is ever
  reported as "passed".
```

(The `enforced` honesty sentence is a hard requirement — the harness rules
forbid claiming unbuilt checks.)

### E3 · harness.mdx — one next step

Current body is one sentence ("The harness carries the repetitive 80%…").
Append: "New to it? [Get started](/harness/get-started) explains what adopting
takes; the [designer on-ramp](/harness/on-ramp) maps how far to hand over."

### E4 · guidelines.mdx — the lens note

Append one sentence to the section body: "Guidelines are written through the
Teachers & School lens — read "teacher" as your domain's user; the practice
they encode binds every domain."

### E5 · voice-tone.mdx — dead skill name

Line 7 area: "`tfx:copy` skill" → "`dxd:copy` skill". Nothing else.

### E6 · product-design-principles.mdx — de-brand the universal principles

1. The `## 02 — Design for One Teacher` heading → `## 02 — Design for One
   Person`. In its body, keep every teacher example but make the principle's
   opening line audience-neutral (one person with a name and a context — the
   teacher at 7:15am stays as the T&S illustration, introduced as such).
2. Scan the other principles' bodies for sentences that state a universal rule
   in teacher-only terms (the audit flagged e.g. "Teachers shouldn't see where
   one team's work ends and another's begins") — neutralise the RULE sentence
   ("Your users shouldn't see…") while keeping teacher examples clearly marked
   as examples. Do not touch principles that are explicitly T&S-scoped.
3. Do not change the file's `status` frontmatter. Note in NOTES that the
   design lead should re-confirm these principle wordings (they are settled
   content being aligned with the executed division decision R6).

### E7 · foundations inherit-signals (three files)

After the intro paragraph of each file, add one italic line:
- `typography.mdx`: *These are the Teachers & School profile's declarations on
  the shared foundation — the foundation demands a two-role system and a
  scale, your domain declares the faces. See [Domains](/domains).*
- `colour.mdx`: *The palette mechanics below are foundation; the named
  primaries are Teachers & School declarations. Your domain declares its own
  in its profile.*
- `iconography.mdx`: *The rules below are foundation; Lucide is the Teachers &
  School profile's set. Your domain may declare another in its profile.*

(Adjust wording to each page's voice; the fact pattern is fixed:
mechanics = foundation, named choices = domain profile.)

### E8 · tools.mdx — lead with who/when + dead frontmatter

1. Add one opening sentence before the status table: who these tools serve and
   when they meet them (builders inside the design loop; the loop invokes them
   for you — the table is what exists today and how far each is trusted).
   Match the page's existing voice.
2. Delete the `illustration:` frontmatter key (dead — this page type never
   renders it).

### E9 · governance.mdx — division scope + one dedupe

1. "Anyone in TransformX can propose a control, guideline, or tool." →
   "Anyone in DXD can propose a control, guideline, or tool."
2. The intro bullet "**The ratchet.** The catalog grows only from observed
   failures, never speculation. Every escaped defect becomes a control
   proposal." pre-states the `<Ratchet />` diagram below — shorten the bullet
   to: "**The ratchet.** The catalog grows only from observed failures —
   [step by step below](#the-ratchet-step-by-step)." (Verify the heading
   anchor exists: the page has `## The ratchet, step by step`, whose slug is
   `the-ratchet-step-by-step`.)

## Steps

1. Read every in-scope file fully. 2. Apply E1–E9. 3. Gates.

**Verify after all edits**:
- `pnpm build` → exit 0, no `[doc-page]` warnings (MDX parses).
- `grep -rn "tfx-waive" content/sections/` → matches ONLY inside "legacy …
  remains valid" notes (one per edited page).
- `grep -rn "tfx:copy" content/` → no matches.
- `grep -n "Design for One Teacher" content/principles/product-design-principles.mdx` → no matches.
- `grep -n "Anyone in TransformX" content/governance/governance.mdx` → no matches.
- `grep -c "illustration" content/harness/tools.mdx` → 0.
- `node scripts/check-standards.mjs` → OK.

## Test plan

No unit tests (prose). The greps above are the machine gates; additionally run
the content-lint command from the table and confirm your edits introduced no
new findings (report the before/after counts in NOTES).

## Done criteria

- [ ] All greps in "Verify after all edits" pass exactly as stated
- [ ] `pnpm build` exit 0, no `[doc-page]` warnings
- [ ] Only the eleven in-scope files modified (`git status`)
- [ ] NOTES records: content-lint before/after, and the E6 design-lead
      re-confirmation flag

## STOP conditions

- A file's current text doesn't contain the quoted phrase you're told to edit
  (drift) — skip that edit, do the rest, report which were skipped and why.
- content-lint reports a NEW finding your edit caused and you cannot rephrase
  within two attempts.
- Any edit would require touching an out-of-scope file.

## Maintenance notes

- E2's CI section must be revisited when a real per-control `enforced` script
  matrix page exists — today it deliberately points at the catalog field.
- E6 is flagged for design-lead re-confirmation; if rejected, reverting is one
  commit (the edits are isolated).
- The "vocabulary AI agents already know" motif on two foundation pages was
  audited and deliberately KEPT (recorded as rejected in the plans index) —
  don't "fix" it.
