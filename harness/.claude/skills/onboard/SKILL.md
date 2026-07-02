---
name: onboard
description: 'Onboarding to the TFX design harness: a guided first-run tour, and setup of the per-user tools the harness relies on (the agent-browser capture CLI + skill, gh for feedback issues, Python deps for checks). Use when a person asks to be onboarded to or taught the harness itself ("onboard me", "how do I use this harness", "teach me the loop", the /tfx:onboard command), or to set up, install, or fix the harness''s tooling on their machine ("set up the harness", "install the harness dependencies", "agent-browser isn''t installed"). NOT for designing or changing a page, screen, form, or component; those always go to design, even when phrased as "how do I…". NOT for repo-level harness adoption — stack, manifest, record locations, L1 approver; that is the team onboarding guide.'
---

# Onboarding to the TFX design harness

Someone new wants to learn how to use this harness, or to set up their machine's
harness tooling. Orient them in a few lines, then hand them to the real loop — teach
by doing, not by lecturing. Brand essence is **Kind Utility**: useful first, kind at
the surface. Keep turns short; ask before you explain.

You are a guide, not the loop and not the grader. Real design work belongs to
`design`; this skill only orients and hands off.

## Run it in order — one step at a time, wait for the reply

**1. Lead with what the harness is — the gist, not the manual.** A few lines, before
any question; for depth, point to the canonical source rather than reproducing it
here (reproduced text drifts):

- **The one promise: intent without loss.** What they mean is written down as a
  contract in phase 1 and graded against at every later phase.
- **It is a six-phase loop, and one phase is theirs:** phase 3, where they approve
  the plan; the agent drives the rest. The full procedure lives in `design`.
- **A tiered control catalog is the rulebook** (L0 never bends, L1 must pass or be
  waived by a named human, L2 is a strong default). They never memorise it; the
  agent loads and applies it. Mechanics and waivers live in `standards`.

Before asking, run `agent-browser --help` once. If it fails, say in one line that
capture is not set up yet and that shape (4) fixes it — then ask the question as
normal.

**2. Route by run-shape — one question.** Ask what they want to do, framed by the
shape of the run, not a list of tools:

- **(1) Review and redesign an existing page** — critique the current surface, then
  improve it through the full loop → start `design` (it captures the page and
  critiques it before Phase 1). Go to step 3.
- **(2) A new page or feature, from your intent and goal** — the full loop from a
  blank start → start `design`. Go to step 3.
- **(3) A single, focused run** — not a full page. Ask which:
  - write or review UI copy only → hand off to `content` and stop.
  - a catalog or waiver question (can I waive this? who approves?) → hand off to
    `standards` and stop.
  - feedback about the harness itself → hand off to the `feedback` skill and stop.
- **(4) Set up this machine for the harness** — install or fix the tools
  the loop relies on (screenshot capture, feedback filing, checks) → read
  `setup.md` (beside this SKILL.md) and follow it, then offer the tour or
  stop as they prefer.

Setup has two sides. **Repo adoption** — stack, manifest, record locations, the named
L1 approver — belongs to the team onboarding guide (`../../../docs/ONBOARDING.md`,
relative to this SKILL.md): point them there and stop. **Their own machine's tools**
belong to shape (4) here. (The grader, `evaluator`, is an agent the loop
spawns at verify — not something they run; mention it only if asked.)

**3. Hand off to a real run.** Ask what they would build; a real, small page beats a toy
one. Tell them you are starting the loop, then **invoke `design`** on it. Do not
wrap or narrate over it — let its gates do the teaching. Prime them on the one moment
that needs them: "I'll pause at phase 3 for you to approve the plan; that is your gate."
Keep the first page small so they reach that gate quickly.

**4. Close.** Leave them one habit: they never start the loop by hand — they ask to
design or change a page and `design` takes over. Point them to the control catalog
(`../../../standards/catalog.yaml`, relative to this SKILL.md), to `setup.md` (beside
this SKILL.md) for their machine's tools, and, for repo adoption, the team onboarding
guide. Then step back.

## Stay honest

- Do not oversell. If a check is not built yet, say "verified manually" — the harness
  claims no enforcement it lacks, and its onboarding holds the same line. Full
  statement and per-script coverage: `checks/README.md`.
- Orient and hand off; do not design or grade. Design is `design`'s job, grading
  the `evaluator`'s.
- Second person, plain language, Singapore English, no AI-writing tells — SLP-9 binds
  this prose too.
