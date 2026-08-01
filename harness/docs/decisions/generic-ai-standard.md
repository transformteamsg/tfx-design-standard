# Decision: generic education AI design standard

**Date:** 2026-08-01
**Status:** settled

> Scope: this record documents the standard and the derivation only. It deliberately omits who directed the change and the internal team split - those belong in project comms, not in the standard's audit trail.

## What changed and why

The AI guidance in this repo was teacher-specific. The remit moved: teacher-specific AI design principles are owned elsewhere, co-created from teacher needs; this standard now covers the **generic, education-wide AI design layer** that gets forked into a Generic Design Harness for other domains (Edupass, then Students, Parents, Platform).

The standing risk, recorded in [dxd-harvest.md](dxd-harvest.md): the previous division-wide standard was cancelled as "too big... blurred what each product needs". The failure mode is abstraction. Mitigated here by varied concrete examples across education roles and a catalogue bounded to what is actually buildable.

## Decisions

1. **Domain-neutral language, varied role examples.** No teacher-as-default framing. Where a concrete example is needed, vary the role (student, parent, administrator, teacher, course lead, admissions officer). Verified: zero teacher-lock terms across the four pages, the demos, and the machine skill.

2. **Five sources, for inputs as well as citations.** Google PAIR, The Shape of AI, AIverse, Vercel AI Elements, MIT Impact Bench. Microsoft HAX and IBM Carbon demoted to further reading and excluded from the derivation. The streamlining decision applied to what was harvested, not only to what is cited.

3. **Nine principles, derived MECE from scratch, grouped under four questions.** See below.

4. **Component catalogue bounded to the buildable set** - the 27 installed AI Elements plus the shadcn-composed patterns, roughly 33 entries, with the wider merged pattern set listed but not claimed as shipped.

5. **Regression made mechanical.** A component-fidelity check (`checks/component-fidelity.py`) now enforces the deterministic subset of CMP-7 and is wired into the build; the open A11Y-5 reduced-motion finding is closed.

## The principles and how they were derived

The number was an output of the derivation, not a target. An earlier draft asserted "nine principles" with no traceable basis; that number had been borrowed by accident from Impact Bench's nine nutrition-label categories, and the supporting research had been lost to context compaction. This time every principle traces to harvested source rules, and the harvests are persisted in [../research/](../research/) rather than left in a context window.

Full method, harvests, MECE tests, boundary-case resolutions, and the eight-versus-nine judgement call: [../research/ai-principles-derivation.md](../research/ai-principles-derivation.md).

The settled nine, grouped:

| Question | Principles |
|---|---|
| Is AI the right call? | Earn the AI |
| Is it honest? | Set honest expectations · Show the working · Fail safely, even when the failure is invisible |
| Does the person stay in charge? | Keep the human steering · Keep data where it was put |
| Is it safe for the person it affects? | In learning, help beats answer · Work for everyone · Protect the person's wellbeing |

The last family is the education-weighted set - the principles about the person the AI affects, who is often not the person operating it. Three of the nine (help-beats-answer, work-for-everyone, protect-wellbeing) are where this standard diverges from generic AI UX, and are the justification for it existing rather than deferring to PAIR.

## Corrections the research forced

Recorded because each was believed confidently and was wrong, and because a design lead auditing this should see them:

- Shape of AI publishes 59 patterns / 8 groupings, not 58 / 7. Its "Dark Matter" anti-pattern group holds exactly one pattern (Rating), and its stance is "handle with care", not prohibition.
- The two pattern libraries share 17 concept-level overlaps, not 3; the merged pattern set is ~82, not 77.
- PAIR does publish a `/guidebook/patterns` page (5 Principles, 23 Patterns); its own nav link to it is broken, which is likely why a prior pass concluded it did not exist. The specific claim that PAIR calls grounded Q&A a named pattern was still false and was removed.
- Impact Bench is 360 metrics (provable across three data files), not the site headline's 375; 16 models carry the nutrition label, 14 appear on the explore surface. Both prior model figures were right about different surfaces.
- Impact Bench metric definitions do **not** convert losslessly into design rules: for the 149 negative metrics the definition describes the *bad* behaviour, so a naive lift inverts the rule. `Direct Answer Provision` is a failure only when the person explicitly asked for guidance.

## Verification

Recorded in the plan's verification section and re-run at close: content-lint clean on all four pages; the fidelity guard self-tests and catches a deliberate violation; `pnpm build` exit 0 with the full standards gate; zero teacher-lock; all cross-page anchors resolve. Evaluator verdict appended below once the pass completes.

## Evaluator verdict

An independent evaluator graded the four pages, the derivation, and the machine skill against the quality bar. Verdict: **shippable as a v1 proposed draft, conditional on fixing the child-safety gap.** It rated mechanics clean, technical terms defined, roles varied, and the page/skill twin genuinely in sync.

Three substantive findings were raised and all three fixed before close:

1. **Child-safety content was missing from principle 9 (high).** The principle was derived to carry Impact Bench's "Avoids Sexual & Intimate Behavior" but the shipped wording dropped it, leaving "the AI produces harmful content to a minor" uncovered by any of the nine. Fixed: principle 9 now names harmful and age-inappropriate content, and carries a concrete check (no engagement-maximising mechanics on a young-learner surface, plus an age-matched content filter).
2. **Sycophancy was homed in two clusters (medium-high).** The derivation assigned it to cluster 7 in one place and cluster 9 in another; the shipped page and skill used 9. Fixed: settled on 9, with the reason recorded (cluster 7 only applies when the operator is the learner, and sycophancy harms non-learners too), and cluster 7's anchor list corrected.
3. **Adversarial input was covered by no principle (medium).** Prompt injection is treated as first-class on the prompts page but named by none of the nine. Fixed: the Overview now scopes it explicitly as a prompt-tier concern, deliberately outside the nine, with a pointer, rather than padding the count.

Polish also applied: principle 4's "separate check" reworded to distinguish undetectable-error QA from principle 5's visible approval gate; "streaming" defined at first use on the patterns page.

Findings deliberately not actioned: the evaluator noted "Fail safely" sits under the "Is it honest?" family and could read as miscategorised. Kept as-is - the four questions are a soft navigational grouping, not the MECE layer, and the "even when the failure is invisible" framing is genuinely a truth-telling concern (the system reads as confident while wrong).

Post-fix state: content-lint clean on all four pages, `pnpm build` exit 0 with the full standards gate, the fidelity guard self-testing and catching a deliberate violation.
