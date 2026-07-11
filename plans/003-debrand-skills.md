# Plan 003: De-brand the harness skills — domain-neutral language, profile-resolved brand

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 233f3be..HEAD -- harness/.claude harness/evals/routing`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/002-domain-profile-schema.md (needs the resolution order + T&S profile to point at)
- **Category**: tech-debt
- **Executor model**: Opus (prose judgment: every sentence decides what is foundation vs Teachers & School; routing descriptions are behaviour, not copy)
- **Planned at**: commit `233f3be`, 2026-07-10

## Why this matters

Every harness skill currently speaks as a Teachers & School tool: "Design or change a **Teacher & School product** UI…", the copy skill carries "TFX voice & tone", CLAUDE.md says the brand essence is Kind Utility. When a Platform/EduPass or Students team installs the plugin, that language actively misleads the agent (it will grade EduPass copy against teacher-facing tone) and the team ("this isn't for us"). After this plan, skills describe themselves in domain-neutral terms, and everything brand-specific resolves at run time from the layered context (product `DESIGN.md` > domain profile > foundation default) defined in plan 002. Requirement R6; acceptance example AE1 (an EduPass run must produce zero Teacher & School leakage).

## Current state

- Skills live in `harness/.claude/skills/` — eleven: `start`, `setup`, `design`, `critique`, `standards`, `copy`, `polish`, `motion`, `flow`, `layout`, `feedback`; agent `harness/.claude/agents/evaluator.md`.
- "Teacher & School" occurrences in skill files (grep at plan time): `design/SKILL.md` ×3, `copy/SKILL.md` ×5, `critique/SKILL.md` ×1 + `critique/layout-patterns.md` ×2, and ×1 each in `layout`, `setup`, `motion`, `polish`, `flow` SKILL.md files. Also sweep `start`, `standards`, `feedback`, `evaluator.md`, and all non-SKILL.md skill files (`design/implement-craft.md`, `critique/pass.md`, `critique/critique.md`, `copy/*`, etc.) — the grep above counted only one literal; also search `Teacher`, `teacher-facing`, `TFX voice`, `Kind Utility`, `T&S`.
- Skill *descriptions* (SKILL.md frontmatter) are routing surface: `harness/evals/routing/prompts.yaml` exists specifically to catch description drift.
- The copy skill carries tone weighting per product (§6 referenced by DESIGN-CONTEXT.md) — per-product tone is *already* parameterized there; the skill's framing is what's T&S-hardcoded.
- `harness/CLAUDE.md` states "Brand essence is Kind Utility — … does this help teachers work faster with less stress?" as an always-on rule.
- Layered context (from plan 002): product `.dxd/design.json`/`DESIGN.md` > `harness/standards/domains/<domain>.yaml` > foundation default. A repo with no declarations is valid and gets foundation defaults.

The rewrite rule (apply everywhere):

1. **Foundation voice**: what the skill does, the loop, the catalog, anti-slop, a11y — stays as-is, brand words removed. "a Teacher & School product page" → "a product page in your portfolio" (or "your product's UI").
2. **Brand facts become resolution instructions**: instead of "TFX voice & tone", the copy skill says "the product's voice & tone, resolved from its DESIGN.md / domain profile (`standards/domains/<domain>.yaml`); Teachers & School products use Kind Utility (see the T&S profile)".
3. **Never delete the T&S content** — it moves from "the rule" to "the teachers-school binding of the rule", clearly labelled, still fully present so TFX teams lose nothing.
4. Kind Utility's litmus test ("does this help teachers work faster with less stress?") generalises to "does this help your users get their task done faster with less stress?" with the teacher phrasing kept under the T&S binding.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Leakage inventory | `grep -rin 'teacher\|kind utility\|t&s\|tfx voice' harness/.claude/` | (used per step) |
| Build gate | `pnpm build` | exit 0 |
| Routing evals (inspect first) | see `harness/evals/README.md` + `harness/evals/routing/` | per its own docs |
| Catalog validator | `python3 harness/checks/validate.py` | exit 0 |

## Scope

**In scope**:
- `harness/.claude/skills/**` (all files), `harness/.claude/agents/evaluator.md`
- `harness/CLAUDE.md` (brand-essence bullet only — the stack bullet was plan 002's)
- `harness/evals/routing/prompts.yaml` (update expected routing phrasings to match new descriptions)

**Out of scope**:
- Skill *logic* and phase structure — this is a language/resolution pass, not a redesign of the loop.
- The catalog and control files (their `fails_when` bullets are product-truthful; controls scoped to products keep their names).
- Historical docs (`harness/plans/`, `harness/docs/decisions/`, etc.).
- The setup skill's *content* beyond de-branding — plan 004 rebuilds it; here only fix its description language (coordinate: if 004 already landed, skip setup files).
- The website (`content/`, `app/`, `components/`).

## Git workflow

- Branch: `advisor/003-debrand-skills` off `main` (after 002 merges).
- Commit per skill or logical cluster; match repo message style.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Build the leakage inventory

Run the leakage grep (commands table) plus `grep -rin 'plus jakarta\|inter\|0064FF\|tw-blue\|casesync\|glow' harness/.claude/` and classify every hit into: (a) foundation sentence to neutralise, (b) brand fact to convert into a resolution instruction + T&S binding, (c) legitimate product-scoped reference to keep (e.g. examples explicitly labelled as Teachers & School examples). Write the classified inventory into the PR description (or a scratch file outside the repo) — it is your worklist and the reviewer's checklist.

**Verify**: the inventory covers every file with ≥1 hit; count of files matches `grep -ril 'teacher\|kind utility\|tfx voice' harness/.claude/ | wc -l`.

### Step 2: Rewrite SKILL.md descriptions (routing surface)

For each of the eleven skills, rewrite frontmatter `description` per the rewrite rule — e.g. design: "Design or change a product UI in a DXD portfolio — a new page, screen, form, flow, or a modification…". Keep every routing cue (the NOT-for clauses, the named-dimension distinctions) intact; change only brand words. Then update `harness/evals/routing/prompts.yaml` expectations if they assert on description text; if the eval asserts routing *behaviour* (prompt → skill), leave assertions and re-run mentally against the new descriptions to confirm no cue was lost.

**Verify**: `grep -rn 'Teacher & School' harness/.claude/skills/*/SKILL.md` → only hits inside clearly-labelled T&S binding examples (target: zero in frontmatter descriptions).

### Step 3: Rewrite skill bodies with the resolution pattern

Apply the rewrite rule to skill bodies. The load-bearing conversions:

- **copy skill**: framing becomes "product voice & tone, resolved from context"; add a short "Resolving voice" preamble: read product DESIGN.md `tone`/`voice` → else domain profile `voice` → else foundation default (plain, direct, second person — the foundation copy rules in root `CLAUDE.md` stay). The existing per-product tone table and Kind Utility material stays under a "Teachers & School" heading.
- **design skill (intent phase)**: where the sprint contract says "the teacher & moment", generalise to "the user & moment" (audience resolved from the catalog `audiences:` + product context). Keep the teacher default note: catalog §Scope says audience defaults to `teachers` — change that default to "the product's declared audience; if undeclared, ask" (update `harness/standards/README.md` §Scope's teacher-default sentence to match — this one sentence is in scope here).
- **evaluator agent**: grading language reads brand expectations from the same resolution chain; where it names T&S tone/brand, convert to resolution instruction + T&S binding.
- **start/critique/passes**: mechanical neutralisation per the rule.

**Verify**: `grep -rin 'teacher' harness/.claude/ | grep -vi 'teachers-school\|Teachers & School binding\|teacher workspace\|example'` → review every remaining line; each must be a deliberate (c)-class keep. `pnpm build` → exit 0.

### Step 4: Generalise the always-on brand bullet

In `harness/CLAUDE.md`, rewrite the "Brand essence is Kind Utility" bullet: foundation form ("Every domain declares its brand essence in its profile; the always-on test: does this help your users get their task done faster with less stress?") + T&S binding ("Teachers & School: Kind Utility — useful first, kind at the surface; the test names teachers"). Point at `standards/domains/teachers-school.yaml`.

**Verify**: `grep -n 'Kind Utility' harness/CLAUDE.md` → present, inside the T&S binding sentence.

### Step 5: Run the acceptance probe (AE1 dry run)

Simulate the EduPass case textually: `grep -rin 'teacher\|jakarta\|0064FF\|kind utility' harness/.claude/skills/design/ harness/.claude/agents/evaluator.md` — every remaining hit must be inside a labelled T&S binding or example. Record the residual list in the PR description as the leakage audit.

**Verify**: residual list contains zero unlabelled brand facts stated as global rules.

## Test plan

- Routing evals: run per `harness/evals/README.md` if runnable locally; if they require a live agent session, state that in the PR and have the reviewer run one routing spot-check (`/dxd:start` with a neutral prompt).
- Regression gates: `pnpm build && pnpm test && python3 harness/checks/validate.py` → exit 0 (the SYNC parity checks in validate.py may assert fragment text shared between skills and docs — see `harness/docs/SYNC.md`; if a `tfx-sync` marker pair now mismatches, update **both** sides of the fragment, never one).

## Done criteria

- [ ] `pnpm build`, `pnpm test`, `python3 harness/checks/validate.py` exit 0
- [ ] Zero SKILL.md frontmatter descriptions contain "Teacher & School"
- [ ] Every remaining teacher/brand literal in `harness/.claude/` is inside a labelled Teachers & School binding, product-scoped example, or product name
- [ ] The copy skill documents the voice-resolution chain; the design skill's contract language is audience-neutral; the evaluator grades against resolved brand
- [ ] `harness/standards/README.md` teacher-default sentence updated to declared-audience default
- [ ] Leakage audit (step 5 residual list) recorded in the PR description
- [ ] No files outside the in-scope list modified; `plans/README.md` row updated

## STOP conditions

Stop and report back if:

- `harness/evals/routing/prompts.yaml` asserts literal description strings extensively — report how it's structured before rewriting expectations en masse.
- A `tfx-sync` fragment marker (per `harness/docs/SYNC.md`) spans a sentence you must rewrite and its twin lives in an out-of-scope file — report; don't break parity or silently expand scope.
- You find a skill whose *procedure* (not language) is Teachers-&-School-specific in a way the resolution chain can't express — that's a design gap for the operator, not a rewrite call.

## Maintenance notes

- The rewrite rule (foundation voice / resolution instruction / labelled T&S binding) is the pattern all future skill prose should follow; reviewers should reject new skill text that states any domain's brand as a global fact.
- Plan 004 (wizard) writes the DESIGN.md files this plan's resolution chain reads — descriptions must stay consistent.
- The routing evals are the canary for description drift: if routing quality drops after this lands, the descriptions lost a cue — diff against the pre-plan frontmatter.
