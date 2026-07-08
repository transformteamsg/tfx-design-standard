# Design Harness (TFX)

The harness layer of the **TFX Design Standard**: it wraps an AI agent
(Claude Code) so that what it designs for the Teacher & School portfolio complies
with the standard — not by asking nicely, but by structure: a control catalog it must
satisfy, a loop with human gates, and checks that always run.

The one promise: **intent without loss.** What the builder means is written down as a
contract in phase 1; every later phase is graded against that contract; drift from it
is a defect. Speed comes from the automation — quality comes from the contract
surviving the whole way to shipped UI.

```
NORMATIVE LAYER                       HARNESS                              ENFORCEMENT
standards/catalog.yaml                .claude/skills/                      checks/ + evaluator agent
├─ TFX-DS standards tier              ├─ start (router; /tfx:start)        ├─ Deterministic: scripts, a11y scan,
│   54 controls (latest ratchet 2026-07-08) ├─ setup (per-user tools + context)  │   DOM checks — non-skippable
├─ WCAG 2.2 AA (self-imposed floor)   ├─ design (the loop)                 ├─ Judgment: evaluator subagent
└─ References: SGDS, GOV.UK           ├─ critique (evaluate + polish)      └─ Human gates: plan approval, L1 waivers
                                      ├─ standards (catalog use)
   (reference points, not rules)      ├─ copy·polish·motion·flow·layout (focused passes)
                                      └─ feedback (harness issue filing)
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
   portfolio designer — the loop is how the quality bar stays
   independent of staffing.
4. **Generator–evaluator split (Anthropic harness guidance).** A separate evaluator
   agent grades output against the sprint contract and judgment controls. The designing
   agent never marks its own homework. Unwarranted novelty is flagged as readily as
   generic output.
5. **One catalog, whole portfolio.** TW, CaseSync, Glow, and TW surfaces share one
   set of controls; per-product difference is nuance calibration (accent,
   illustration, tone weighting), never separate rules or systems.

## Repository layout

```
design-harness/
├── README.md
├── CLAUDE.md                # always-on project facts — makes the harness discoverable
│                            # from any entry point, not just the design loop
├── CHANGELOG.md             # catalog + skill versions, tracked with plugin.json
├── CONTRIBUTING.md          # ratchet flow: how a new control gets proposed and merged
├── standards/
│   ├── README.md            # control catalog format spec + authoring guide
│   ├── catalog.yaml         # TFX-DS catalog: 54 controls (always loaded)
│   ├── schema.json          # machine-checkable schema validate.py validates against
│   └── controls/            # one file per control: YAML frontmatter + rationale,
│                            # pass/fail examples, verification detail (loaded on demand)
├── .claude/
│   ├── skills/
│   │   ├── start/            # user-invoked router: orient, context check, route (/tfx:start)
│   │   ├── setup/            # per-user tool setup + product context-layer init
│   │   ├── design/           # orchestrates the loop: intent → diverge → plan →
│   │   │                     # implement → verify (implement-craft.md: implement detail)
│   │   ├── critique/         # evaluate an existing page → ranked suggestions → gated fixes
│   │   │                     # (critique.md + layout-patterns.md; pass.md: shared pass procedure)
│   │   ├── standards/        # how to read, filter, and apply the catalog
│   │   ├── copy/             # TFX voice & tone + naming; also the improve-the-copy pass
│   │   ├── polish, motion, flow, layout/   # focused single-dimension passes (share critique/pass.md)
│   │   └── feedback/         # captures harness feedback mid-turn, files it as an issue
│   └── agents/
│       └── evaluator.md      # reviewer subagent — generator/evaluator split;
│                             # carries its own review procedure
├── checks/                  # 10 check scripts + fixtures/ — see checks/README.md for coverage
├── evals/
│   ├── golden/               # known-correct + planted-trap tasks that score loop output
│   ├── routing/               # prompts.yaml — catches skill-description drift
│   └── evaluator-recall/      # checks the evaluator subagent's own recall, not the loop
├── plans/                   # numbered improvement plans (this file's own backlog)
├── scripts/                 # repo-maintenance one-offs (e.g. file-feedback-issue.py)
└── docs/
    ├── index.html            # visual explainer of how the harness works
    ├── SYNC.md                # fragment sync: tfx-sync markers + validate.py parity checks
    ├── ONBOARDING.md          # adopting the harness in a product repo
    ├── UPDATING.md            # plugin update steps + auto-update setting
    ├── harness-feedback.md    # running log of feedback on the harness itself
    ├── decisions/             # one design decision record per page/change
    ├── loop-run/              # end-to-end loop run transcripts/evidence
    ├── reviews/               # standalone review writeups
    ├── spikes/                # exploratory spikes (e.g. layout-category)
    └── catalog-changes/       # ratchet proposals and their outcomes
```

Fragment sync (markers + validation): [docs/SYNC.md](docs/SYNC.md).

## Install

The harness ships as a Claude Code plugin. In your product repo (TW, CaseSync, Glow):

```
/plugin marketplace add transformteamsg/tfx-design-standard
/plugin install tfx@tfx
```

This installs the eleven skills (`start`, `setup`, `design`, `critique`, `standards`, `feedback`, and the five focused passes — `copy`, `polish`, `motion`, `flow`, `layout`), the `evaluator` subagent (which carries its own review procedure), and the control catalog (`standards/`) — the catalog ships with the plugin, not with your repo. Run `/tfx:start` for orientation and routing to the right one.

The design loop captures screenshots with the agent-browser CLI — to set it and the other per-user tools up, run `/tfx:start` (or invoke the `setup` skill directly) and follow the checklist (it lives in .claude/skills/setup/setup.md).

To work on the harness itself, just open a Claude Code session in this repository: the skills load from `.claude/skills/` automatically; no install step.

> **Updates**: run `/plugin marketplace update tfx` then `/reload-plugins` (or restart Claude Code). Updates are **manual** — third-party marketplaces do not auto-update by default. The catalog and skills are versioned together via `version` in `plugin.json` and recorded in [CHANGELOG.md](CHANGELOG.md); full steps and the auto-update setting are in [docs/UPDATING.md](docs/UPDATING.md).

Adopting the harness in a product repo? Follow [docs/ONBOARDING.md](docs/ONBOARDING.md).

## The loop (summary — full procedure in `design` skill)

| Phase | Actor | Gate |
|---|---|---|
| 1. Intent | Agent + user | Sprint contract agreed (purpose, the teacher & moment, page type, done-criteria) |
| 2. Diverge | Agent | 2–3 structural variants from manifest components, no pixel code; user picks |
| 3. Plan | Agent | **Human approves plan** — components, controls in scope, tradeoffs named, proposed waivers |
| 4. Implement | Agent | Constraints active: catalog controls filtered to `implement` phase |
| 5. Verify | Checks + evaluator | Deterministic checks pass (L0 blocks, L1 loops back) → screenshots as evidence → evaluator grades judgment controls + 4 criteria (design quality, originality, craft, functionality) |
| 6. Ratchet | Agent + user | Decision record finished; failures become new controls, anti-patterns, or check scripts |

## Status & roadmap

Aligned to TFX-DS v0.1 (June 2026). Catalog: the 22-control TFX-DS seed, plus 6
ratchet additions (GovTech a11y checklist, 2026-06-11), the 10 anti-slop controls
(SLP-1..10) adopted from the TFX-DS site seed catalog in the 2026-06-11
consolidation, and later ratchet additions (LAY-2/3/4/5/6, TYP-5, SLP-11, CMP-5,
CMP-6, LAY-1/7, IDN-2/3/4, CMP-4) — 54 controls, one file, consumed by both the harness (enforcement) and the
TFX-DS website (presentation).

- **V0 — now**: this standard as catalog source; skills installed; loop runnable in a
  Claude session (verify phase runs manually — see the "v0 reality" note in
  `design`). Verification baseline: `python3 checks/validate.py`.
- **V1 — next**: the deterministic floor — check scripts wired as hooks during
  implement and as the verify gate. MVP bet per TFX-DS: the evaluator's grading
  procedure as a screen-linter against the seed catalog + `content` so
  generated screens ship with on-voice copy; first user = designers.
- **V2 — later**: component manifest via MCP, screenshot-diff against approved
  baselines, full catalog buildout from ratchet evidence.

Rollout order: Teacher Workspace (flagship = reference implementation) → CaseSync →
Glow → TW surfaces (Posts, PG Staff Portal).

Proposing a control or change? See [CONTRIBUTING.md](CONTRIBUTING.md).
