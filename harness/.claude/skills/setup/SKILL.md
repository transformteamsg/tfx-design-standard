---
name: setup
description: 'Set up a person for the DXD design harness. Three modes: (A) set up my machine — install and verify the per-user tools the loop relies on: the agent-browser capture CLI + skill, an authenticated gh for feedback issues, Python + PyYAML for the checks; (B) onboard my product to the standard — interview you for your brand basics (primary colour, typefaces, domain) and write your product''s design context (DESIGN.md + its generated twin), no file editing needed, every unanswered field falling back to the standard''s default; (C) orient me — orient a newcomer to the harness. Use to set up, install, or fix tooling ("set up the harness", "install the harness dependencies", "agent-browser isn''t installed"), to onboard a product ("onboard our product to the standard", "get my repo brand-ready", "set up our design context"), or when someone asks to be onboarded to or taught the harness itself ("onboard me", "I''m new to the harness", "how do I use this harness", "teach me the loop"). NOT for designing or changing a page, screen, form, or component; those always go to design, even when phrased as "how do I…". NOT for repo-level harness adoption — stack, manifest, record locations, the L1 approver; that is the team onboarding guide.'
---

# Harness setup — machine, product, and orientation

Get a person ready for the DXD design harness: their machine, their product's brand
context, or their first orientation. Brand essence is **Kind Utility**: useful first,
kind at the surface. Keep turns short; ask before you install or write.

The harness makes an agent follow the DXD Design Standard whenever it builds product UI
(Teacher & School is the reference portfolio; other domains adopt the same standard). One
promise — *intent without loss* — held by a six-phase loop and a tiered control catalog.
This skill has three modes; pick the one the request matches, or ask which the person
wants.

- **Mode A — set up my machine.** Install and verify the per-user tools the loop relies
  on. Run this for "set up the harness", "install the dependencies", "capture isn't set
  up".
- **Mode B — onboard my product.** A plain-language interview that captures your brand
  basics and writes your product's design context for you — no YAML, no git, no file
  editing. Run this for "onboard our product", "get my repo brand-ready", "set up our
  design context".
- **Mode C — orient me.** Orient a newcomer to the harness and route them onward. Run
  this for "I'm new here", "teach me the loop", "how does this work".

For the full front-door orientation and routing to any skill, `/dxd:start` is the front
door; this skill's own job is machine, product context, and first orientation, so continue
here for those.

## Mode A — set up my machine

Work the checklist in `setup.md` (beside this file) top to bottom: run each check; if it
passes, move on; if not, offer the install, run it once you have a yes, and re-run the
check. Two rules bind every row and do not change:

- **Ask before installing.** Show the exact command, get a yes, then run it. In an
  unattended run, install nothing — list what is missing with the commands a human
  should run, marked "missing, not installed".
- **Verify, then say so.** A tool is set up only when its check command passes; report
  the actual output, never more than the check shows — the same honesty line the checks
  hold (`../../../checks/README.md`).

Close with the end-to-end health check named at the bottom of `setup.md`, then tell the
user what passed, what was installed, and what is still missing (and why) in one short
list.

## Mode B — onboard my product

Run the interview in `interview.md` (beside this file). It is a scripted, plain-language
conversation: you ask one question at a time about the product's brand basics — name,
domain, audiences, primary colour, typefaces, stack, illustration, voice — and every
non-essential question offers "skip — use the standard's default". At the end you write
the product's `DESIGN.md`, generate its machine twin `.dxd/design.json`, and read the
choices back in plain language.

The whole point is that a person who knows only their primary colour and their font names
can finish with a valid, working product context. Never assume the user knows YAML or git.
A skipped question writes **nothing** — absent means the standard's default applies, which
is a valid, complete state, never a gap to fill with a placeholder.

## Mode C — orient me

Two lines for a newcomer: the harness makes an agent follow the DXD Design Standard
whenever it builds product UI — one promise, *intent without loss*, held by a six-phase
loop (intent → diverge → plan → implement → verify → ratchet) and a tiered control
catalog. Then route: to design a page, use the `design` skill; to review one, `critique`;
to read the catalog, `standards`; to set their machine up, Mode A here; to onboard their
product's brand, Mode B here. For the full orientation, run `/dxd:start`.

## Stay honest

- Do not oversell. If a check is not built yet, say "verified manually" — the harness
  claims no enforcement it lacks. Full statement and per-script coverage:
  `../../../checks/README.md`.
- Brand facts — the stack, typefaces, primary colours — are not fixed in this skill. They
  resolve from the product's `DESIGN.md` and its domain profile
  (`../../../standards/domains/<slug>.yaml`); Teacher & School specifics appear only as
  labelled examples.
- Repo-level adoption — the stack, the component manifest, record locations, the named
  L1 approver — belongs to the team onboarding guide (`../../../docs/ONBOARDING.md`),
  not here. That doc is your repo and team; this skill is your machine and your product's
  brand context. Point there and stop.
- Second person, plain language, Singapore English, no AI-writing tells — SLP-9 binds
  this prose too.
