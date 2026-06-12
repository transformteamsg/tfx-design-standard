# Design Harness (TFX)

The harness layer of the **TFX Design Standard** (TFX-DS §7): it wraps an AI agent
(Claude Code) so that what it designs for the Teacher & School portfolio complies
with the standard — not by asking nicely, but by structure: a control catalog it must
satisfy, a loop with human gates, and checks that always run.

The one promise: **intent without loss.** What the builder means is written down as a
contract in phase 1; every later phase is graded against that contract; drift from it
is a defect. Speed comes from the automation — quality comes from the contract
surviving the whole way to shipped UI.

```
NORMATIVE LAYER                       HARNESS                            ENFORCEMENT
standards/catalog.yaml                .claude/skills/                    checks/ + evaluator agent
├─ TFX-DS standards tier (§3)         ├─ design-ui      (the loop)       ├─ Deterministic: scripts, a11y scan,
│   38 controls (consolidated 2026-06-11)    ├─ design-standards (catalog use)  │   DOM checks — non-skippable
├─ WCAG 2.2 AA (self-imposed floor)   ├─ content-style  (voice & tone)   ├─ Judgment: design-evaluator subagent
└─ References: SGDS, GOV.UK           └─ design-review  (evaluator)      └─ Human gates: plan approval, L1 waivers
   (reference points, not rules)
```

Normative source: [TFX-DS v0.1 draft](https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb)
(owner: Wondo Jeong). Harness lead: Reza Ilmi. The design stack is deliberately
boring and AI-legible: Base UI + Radix Colors + shadcn/ui default tokens; Plus
Jakarta Sans + Inter; Teacher & School Blue `#0064FF`.

## Core ideas

1. **Standards as a tiered control catalog, not prose.** Every standard is a control
   with an `id`, `tier`, and `check` type. The litmus: if you can't check it, it's a
   principle or guideline — not a standard. Tiers map to enforcement: L0 blocks
   outright (trust/safety/a11y floor), L1 must pass verification, L2 is a strong
   default waivable with inline rationale (`tfx-waive` protocol).
2. **Blueprint structure (Stripe Minions pattern).** The design loop alternates creative
   agent phases with deterministic checkpoints that always run. The agent cannot skip a
   checkpoint by judgment.
3. **Human approval at the plan, not the pixels (Open SWE pattern).** The human gate
   sits after converge/plan and before implementation — the cheapest place for
   judgment. On teams with no dedicated designer, the gates are reviewed async by a
   portfolio designer (TFX-DS §7.5) — the loop is how the quality bar stays
   independent of staffing.
4. **Generator–evaluator split (Anthropic harness guidance).** A separate evaluator
   agent grades output against the sprint contract and judgment controls. The designing
   agent never marks its own homework. Unwarranted novelty is flagged as readily as
   generic output.
5. **One catalog, whole portfolio.** TW, CaseSync, Glow, and TW surfaces share one
   set of controls; per-product difference is nuance calibration (accent,
   illustration, tone weighting — TFX-DS §6), never separate rules or systems.

## Repository layout

```
design-harness/
├── README.md
├── CLAUDE.md                # always-on project facts — makes the harness discoverable
│                            # from any entry point, not just the design-ui loop
├── standards/
│   ├── README.md            # control catalog format spec + authoring guide
│   ├── catalog.yaml         # TFX-DS catalog: 38 controls (always loaded)
│   └── controls/            # one file per control: YAML frontmatter + rationale,
│                            # pass/fail examples, verification detail (loaded on demand)
├── .claude/
│   ├── skills/
│   │   ├── design-ui/           # orchestrates the loop: intent → diverge → plan →
│   │   │                        # implement → verify
│   │   ├── design-standards/    # how to read, filter, and apply the catalog
│   │   ├── content-style/       # TFX voice & tone + naming, applied at generation time
│   │   └── design-review/       # evaluator procedure (used by the subagent)
│   └── agents/
│       └── design-evaluator.md  # reviewer subagent — generator/evaluator split
├── checks/
│   └── README.md            # deterministic check scripts, mapped to control ids (planned)
└── docs/
    ├── index.html           # visual explainer of how the harness works
    └── decisions/
        └── TEMPLATE.md      # design decision record — one per page/change
```

## Install

The harness ships as a Claude Code plugin. In your product repo (TW, CaseSync, Glow):

```
/plugin marketplace add <git-url-of-this-repo>   # placeholder until hosted — see note
/plugin install tfx-design-harness@tfx
```

This installs the four skills (`design-ui`, `design-standards`, `content-style`, `design-review`), the `design-evaluator` subagent, and the control catalog (`standards/`) — the catalog ships with the plugin, not with your repo.

To work on the harness itself, just open a Claude Code session in this repository: the skills load from `.claude/skills/` automatically; no install step.

> **Hosting note**: until this repo is pushed to a git host, replace `<git-url-of-this-repo>` with the local path to a checkout. The marketplace source must be reachable by every installing teammate.

Adopting the harness in a product repo? Follow [docs/ONBOARDING.md](docs/ONBOARDING.md).

## The loop (summary — full procedure in `design-ui` skill)

| Phase | Actor | Gate |
|---|---|---|
| 1. Intent | Agent + user | Sprint contract agreed (purpose, the teacher & moment, page type, done-criteria) |
| 2. Diverge | Agent | 2–3 structural variants from manifest components, no pixel code; user picks |
| 3. Plan | Agent | **Human approves plan** — components, controls in scope, tradeoffs named, proposed waivers |
| 4. Implement | Agent | Constraints active: catalog controls filtered to `implement` phase |
| 5. Verify | Checks + evaluator | Deterministic checks pass (L0 blocks, L1 loops back) → screenshots as evidence → evaluator grades judgment controls + 4 criteria (design quality, originality, craft, functionality) |
| 6. Ratchet | Agent + user | Decision record finished; failures become new controls, anti-patterns, or check scripts |

## Status & roadmap (tracks TFX-DS §7.4)

Aligned to TFX-DS v0.1 (June 2026). Catalog: the 22-control TFX-DS seed, plus 6
ratchet additions (GovTech a11y checklist, 2026-06-11), plus the 10 anti-slop
controls (SLP-1..10) adopted from the TFX-DS site seed catalog in the
2026-06-11 consolidation — 38 controls, one file, consumed by both the harness
(enforcement) and the TFX-DS website (presentation).

- **V0 — now**: this standard as catalog source; skills installed; loop runnable in a
  Claude session (verify phase runs manually — see the "v0 reality" note in
  `design-ui`). Verification baseline: `python3 checks/validate.py`.
- **V1 — next**: the deterministic floor — check scripts wired as hooks during
  implement and as the verify gate. MVP bet per TFX-DS: `design-review` as a
  screen-linter against the seed catalog + `content-style` so generated screens ship
  with on-voice copy; first user = designers.
- **V2 — later**: component manifest via MCP, screenshot-diff against approved
  baselines, full catalog buildout from ratchet evidence.

Rollout order: Teacher Workspace (flagship = reference implementation) → CaseSync →
Glow → TW surfaces (Posts, PG Staff Portal).

Proposing a control or change? See [CONTRIBUTING.md](CONTRIBUTING.md).
