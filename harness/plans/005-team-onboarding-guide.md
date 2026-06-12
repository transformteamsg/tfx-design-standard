# Plan 005: Write the product-team onboarding guide (TFX-DS §7.6 harness-ready checklist, mapped to artifacts)

> **Executor instructions**: Follow step by step; honor STOP conditions; update
> your row in `plans/README.md` when done.
>
> **Drift check (run first)**: confirm README.md has an "## Install" section
> (plan 001). If absent, STOP — this plan builds on it.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/001-git-init-and-install-docs.md
- **Category**: dx
- **Planned at**: `no-git (pre-init)`, 2026-06-10

## Why this matters

The rollout plan is Teacher Workspace → CaseSync → Glow, and the TFX Design
Standard (§7.6) defines a six-item "harness-ready" checklist a product must
satisfy: (1) the stack installed (Base UI, Radix Colors, shadcn default tokens,
no parallel component library), (2) a component manifest exists, (3) TFX skills
installed, (4) deterministic checks wired as hooks (V1), (5) decision-record
and waiver-registry locations configured, (6) a named human approver for L1
waivers. Nothing in this repo maps that checklist to concrete steps — a TW
engineer adopting the harness has install commands (post plan 001) and nothing
else. This plan writes the guide.

## Current state

- `README.md` — has Install (after plan 001), Core ideas, layout, loop summary,
  roadmap with `Rollout order: Teacher Workspace … → CaseSync → Glow → TW surfaces`.
- `CLAUDE.md` — always-on rules incl. the stack, L0 list, waiver syntax
  `tfx-waive <CTL-ID> reason="..."`, and a "Where things live" table.
- `docs/decisions/TEMPLATE.md` — decision-record template with a waivers table
  (`Control | Tier | Reason | Approver | Where recorded`).
- `.claude/skills/design-ui/SKILL.md` — Phase 3 says: on a team with no
  dedicated designer, the plan and verify gates "are reviewed async by a
  portfolio designer". The "v0 reality" section states the check scripts and
  component manifest are not built yet.
- The §7.6 checklist items are listed verbatim in this plan's "Why this
  matters" — treat that as the source; the full TFX-DS lives at
  https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
  (do not fetch it; the six items above are sufficient and authoritative for
  this plan).

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Plugin valid | `claude plugin validate .` | passes |
| Catalog valid (if built) | `python3 checks/validate.py` | OK |

## Scope

**In scope**:
- `docs/ONBOARDING.md` (create)
- `README.md` (one link line in the Install section)

**Out of scope**:
- Any skill, the catalog, CLAUDE.md.
- Inventing a component-manifest format — that is plan 008's spike. The guide
  marks item (2) as "format pending — see plans/008" and gives the interim
  answer (agent reads the product's component source; CMP-1 judged manually).
- Creating per-product files in TW/CaseSync repos (no access).

## Git workflow

Branch `advisor/005-onboarding`; conventional commits; do NOT push.

## Steps

### Step 1: Write `docs/ONBOARDING.md`

Structure (all six §7.6 items, each with: what it means, the concrete step,
status today):

```markdown
# Adopting the TFX design harness — product team guide

Audience: an engineer or designer on TW / CaseSync / Glow making their repo
"harness-ready" per TFX-DS §7.6. Time: ~1 hour plus team decisions.

## 0. Install the plugin            → README "Install" section, two commands
## 1. The stack                     → confirm Base UI + Radix + shadcn defaults;
                                      no parallel component library. If your
                                      product diverges, stop — raise with the
                                      design lead before installing the harness.
## 2. Component manifest            → REQUIRED by CMP-1, format pending
                                      (plans/008). Interim: the agent reads your
                                      component source; expect CMP-1 verdicts
                                      marked "asserted, no manifest".
## 3. Skills installed              → verify with: open a Claude session in the
                                      product repo, ask "design a test page" —
                                      the design-ui loop must trigger and ask
                                      intent questions. If it doesn't, /plugin
                                      list and check tfx-design-harness is
                                      enabled.
## 4. Deterministic checks (V1)     → not built yet; until then every verify
                                      phase reports "verified manually" — that
                                      is expected, not a misconfiguration.
## 5. Record locations              → create docs/decisions/ in YOUR repo;
                                      copy the template from the harness
                                      (docs/decisions/TEMPLATE.md); decide where
                                      L1 waivers are registered (default: the
                                      decision records themselves until a
                                      registry exists).
## 6. Named L1 approver             → name a person; record name + date in
                                      docs/decisions/APPROVER.md in your repo.
                                      Teams without a dedicated designer: the
                                      portfolio designer holds the plan and
                                      verify gates async (target < 1 day,
                                      TFX-DS §7.5).

## First real page — what to expect   → walk through of the six phases with a
                                      pointer to the worked example
                                      (docs/loop-run/, once plan 004 lands).

## When something fails               → L0 block = stop, fix, re-verify.
                                      Control seems wrong = waiver protocol in
                                      the design-standards skill, never silent
                                      deviation. Defect no control covers =
                                      ratchet (CONTRIBUTING.md, once plan 006 lands).
```

Write it in full prose (the outline above is the skeleton, not the text), in
the repo's existing doc voice — direct, second person, no marketing. Where a
dependency isn't built (manifest, checks, CONTRIBUTING), say so plainly with
the plan reference rather than promising it.

**Verify**: `grep -c "§7.6\|7\.6" docs/ONBOARDING.md` → ≥1; all six numbered
items present (`grep -cE "^## [0-6]\." docs/ONBOARDING.md` → 7 including item 0).

### Step 2: Link it

In `README.md`'s Install section, append:
`Adopting the harness in a product repo? Follow [docs/ONBOARDING.md](docs/ONBOARDING.md).`

**Verify**: `grep -c "ONBOARDING.md" README.md` → 1.

## Test plan

Read-through test: a reader who has only README + ONBOARDING can state, for
each of the six items, (a) what to do today and (b) what is deferred and where
it's tracked. No checklist item may silently assume an unbuilt artifact exists.

## Done criteria

- [ ] `docs/ONBOARDING.md` exists with items 0–6 + the two closing sections
- [ ] README links to it
- [ ] No claim that the manifest, check scripts, or CONTRIBUTING exist (grep for "checks/validate" is allowed only if plan 002 landed)
- [ ] `claude plugin validate .` passes
- [ ] `plans/README.md` updated

## STOP conditions

- README has no Install section (001 not done) — STOP.
- You find yourself specifying the component-manifest format — that's plan
  008's spike; reference it instead.

## Maintenance notes

- Update item 2 when plan 008 lands a format; item 4 when plan 007 lands the
  first check; the "first real page" section when plan 004's worked example
  exists. Each of those plans should touch this file — reviewers: check they did.
