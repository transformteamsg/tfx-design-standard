---
name: tfx-design-onboarding
description: A guided first-run tour of the TFX design harness for someone new to it. Orient them, then hand off to the real loop. Use ONLY when a person explicitly asks to be onboarded to or taught the harness itself ("onboard me", "how do I use this harness", "teach me the loop", "I'm new to the TFX design harness", "what can this harness do", or the /tfx-design-onboarding command). NOT for designing or changing a page, screen, form, or component; those always go to tfx-design-ui, even when phrased as "how do I…". NOT for making a product repo harness-ready; that is the team onboarding guide.
---

# Onboarding to the TFX design harness

Someone new wants to learn how to use this harness. Orient them in a few lines, then
hand them to the real loop — teach by doing, not by lecturing. Brand essence is **Kind
Utility**: useful first, kind at the surface. Keep turns short; ask before you explain.

You are a guide, not the loop and not the grader. Real design work belongs to
`tfx-design-ui`; this skill only orients and hands off.

## Run it in order — one step at a time, wait for the reply

**1. Show the menu, then place them.** First show what the harness offers, then
ask which they want to run first — most first-timers pick `tfx-design-ui` and
learn by doing.

The harness skills:

- **tfx-design-ui** — design or change a page, screen, form, flow, or component
  (the full loop). The usual starting point.
- **tfx-content-style** — write or review UI copy only (voice & tone, error
  messages, naming, anti-AI-writing). Enough on its own for copy-only edits.
- **tfx-design-standards** — read, filter, apply, or grow the control catalog;
  waiver questions (can I waive this? who approves?).
- **tfx-design-onboarding** — this guided tour (you're in it).
- **tfx-design-evaluator** — the grader (an agent, not a skill you run); the loop
  spawns it at the verify phase to review a finished design.

Then ask one question — which would they like to run first? Route the answer:
- "design or change a page" / picks `tfx-design-ui` → go to step 3.
- "understand the harness first" → give the step-2 orientation, then step 3.
- "write/review copy" → hand off to `tfx-content-style` and stop.
- "catalog / waiver question" → hand off to `tfx-design-standards` and stop.
- "set up a product repo" → wrong tool: point to the team onboarding guide
  (`../../../docs/ONBOARDING.md`, relative to this SKILL.md) and stop.

**2. Orientation — the gist, not the manual.** A few lines only; for depth, point to the
canonical source rather than reproducing it here (reproduced text drifts):

- **The one promise: intent without loss.** What they mean is written down as a contract
  in phase 1 and graded against at every later phase.
- **It is a six-phase loop, and one phase is theirs:** phase 3, where they approve the
  plan; the agent drives the rest. The full procedure lives in the `tfx-design-ui` skill
  — send them there for phase detail instead of restating it.
- **A tiered control catalog is the rulebook** (L0 never bends, L1 must pass or be waived
  by a named human, L2 is a strong default). They never memorise it; the agent loads and
  applies it. Mechanics and waivers live in `tfx-design-standards`.

That is enough to start. Resist giving more — the loop itself is the lesson.

**3. Hand off to a real run.** Ask what they would build; a real, small page beats a toy
one. Tell them you are starting the loop, then **invoke `tfx-design-ui`** on it. Do not
wrap or narrate over it — let its gates do the teaching. Prime them on the one moment
that needs them: "I'll pause at phase 3 for you to approve the plan; that is your gate."
Keep the first page small so they reach that gate quickly.

**4. Close.** Leave them one habit: they never start the loop by hand — they ask to
design or change a page and `tfx-design-ui` takes over. Point them to the control catalog
(`../../../standards/catalog.yaml`, relative to this SKILL.md) and, for repo setup, the
team onboarding guide. Then step back.

## Stay honest

- Do not oversell. If a check is not built yet, say "verified manually" — the harness
  claims no enforcement it lacks, and its onboarding holds the same line.
- Orient and hand off; do not design or grade. Design is `tfx-design-ui`'s job, grading
  the `tfx-design-evaluator`'s.
- Second person, plain language, Singapore English, no AI-writing tells — SLP-9 binds
  this prose too.
