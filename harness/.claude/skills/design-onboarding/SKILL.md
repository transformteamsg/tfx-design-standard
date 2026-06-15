---
name: design-onboarding
description: Orient someone new to the TFX design harness — what the skills are, how the design loop works, and how to drive it. Use when a person asks to get started with, be onboarded to, or learn how to use the harness, the design-ui loop, or the control catalog ("how do I use this", "onboard me", "teach me the loop", "what can this harness do"). Not for designing a page (use design-ui) or for making a product repo harness-ready (see the team onboarding guide).
---

# Onboarding to the TFX design harness

Someone wants to learn how to use this harness. Orient them fast, then hand them to the
real loop — teach by doing, not by lecturing. Brand essence is **Kind Utility**: useful
first, kind at the surface; onboarding is no different. Keep turns short, ask before you
explain, and show the harness working on something they actually care about.

## Run it in order — one step at a time, wait for the reply

**1. Place them.** Ask a single question: are they here to (a) design or change a page
now, (b) understand how the harness works first, or (c) set up a product repo to use it?

- (a) → skip to step 3, the hands-on run.
- (b) → give the tour in step 2, then offer step 3.
- (c) → this tour is the wrong tool: point them to the team onboarding guide
  (`../../../docs/ONBOARDING.md`, relative to this SKILL.md — the six-item harness-ready
  checklist) and stop.

**2. The tour** (only if they asked for the concept first — a few lines each, not a wall):

- **The promise — intent without loss.** What they mean is written down as a contract in
  phase 1; every later phase is graded against it; drift from it is a defect.
- **The loop is six phases, and phase 3 is theirs:**
  1. Intent — agree the sprint contract: purpose, the teacher and the moment, page type,
     done-criteria.
  2. Diverge — the agent offers two or three structural options; they pick one.
  3. **Plan — they approve it** (components, controls in scope, trade-offs, any proposed
     waivers). This is the human gate; approving here lets the rest run.
  4. Implement — the agent builds the approved plan against the catalog.
  5. Verify — checks and a separate evaluator grade the result against evidence.
  6. Ratchet — a decision record is written; new failures become new controls.
- **The catalog is the rulebook, tiered.** L0 never bends (accessibility and trust
  floor), L1 must pass or be waived by a named human, L2 is a strong default they can
  deviate from with a real reason. They do not memorise it; the agent loads and applies it.
- **The supporting skills** rarely need calling by hand: `content-style` (voice and
  tone), `design-standards` (catalog mechanics and waivers), `design-review` (how the
  evaluator grades).

**3. The hands-on run — the real teaching.**

- Ask what they would build. A real, small page beats a toy one: one page, one clear
  moment.
- Then start the `design-ui` loop on it for real, but narrate as a guide — before each
  phase say in a line what happens and what they decide; after each say what got
  recorded. Slow down at the phase-3 plan gate; approving the plan is the skill they most
  need to learn.
- Keep the first run small on purpose. Success is finishing it understanding the gates,
  not shipping something big.

**4. Hand off.** Tell them the one habit that matters: they never start the loop
themselves — they ask to design or change a page and `design-ui` takes over. Point them
to the control catalog (`../../../standards/catalog.yaml`, relative to this SKILL.md) and
the team onboarding guide for repo setup, then step back.

## Stay honest while you teach

- Do not oversell. If a check is not built yet, say "verified manually" — the harness
  claims no enforcement it lacks, and neither does its onboarding.
- This skill orients; it does not design or grade. Real design goes to `design-ui`,
  grading to the `design-evaluator`.
- Second person, plain language, Singapore English, no AI-writing tells — SLP-9 applies
  to this prose as much as to anything the harness ships.
