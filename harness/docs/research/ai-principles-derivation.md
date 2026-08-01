# Deriving the education AI principles

**Status: all five sources harvested. Cut settled to eight clusters, with a documented judgement call on a ninth.** See "Settled clusters" below. The four raw harvests live beside this file (`harvest-pair.md`, `harvest-shapeofai-aiverse.md`, `harvest-impactbench.md`, and AI Elements conventions in `skills/ai/composition.md`).

## Why this file exists

An earlier draft of this work asserted "nine principles" with no traceable derivation. Verified against the repo, nothing anywhere held such a list: the previous page had three principles, the agent skill has six rules, the site's product principles number seven. The number had been borrowed by accident from MIT Impact Bench's nine nutrition-label categories.

The research that would have justified it lived only in a model context window and was destroyed by compaction. **This file is the fix.** Every principle below traces to harvested rules; every harvested rule traces to a URL.

## Method

1. **Harvest** every rule each source asserts, verbatim, with URL. Not summaries.
2. **Normalise** each to one imperative, checkable statement.
3. **Cluster** by failure mode - one distinct way the product harms someone per cluster.
4. **Test MECE, falsifiably.** A rule fitting two clusters means the cut is wrong. A cluster holding one rule is a rule, not a principle.
5. **Name** in plain language.
6. **Education overlay** - mark which clusters education weights differently.

**The principle count is an output, not an input.**

## Sources - five, and only five

| Source | Harvested | Rules | Notes |
|---|---|---|---|
| The Shape of AI | Yes | 59 patterns, 8 groupings | `harvest-shapeofai-aiverse.md` |
| AIverse | Yes | 40 patterns, 5 phases | same file; detail pages PRO-gated but all 40 index rules are public |
| MIT Impact Bench | Yes | 9 categories, 360 metrics | `harvest-impactbench.md`; pulled from the public CDN, not the marketing page |
| Vercel AI Elements | Yes | implementation conventions | captured separately in `skills/ai/composition.md` |
| Google PAIR | **NO** | - | agent killed by session limit; **the remaining blocker** |

Microsoft HAX and IBM Carbon are excluded from the derivation, not merely from the citation list.

## Corrections this harvest forced

Recorded because each was believed confidently and was wrong.

| Believed | Actually |
|---|---|
| Shape of AI: 58 patterns, 7 groupings | 59 patterns, 8 groupings |
| 3 cross-library overlaps | 17 |
| 77 merged components | 82 |
| "Dark Matter" is a substantial anti-pattern group | It holds exactly **one** pattern (Rating), and its stance is "ambiguous, handle with care", not prohibition |
| Impact Bench metric definitions "convert losslessly into design rules" | **False for 149 of them.** For negative metrics the definition *describes the bad behaviour*, because the evaluator sees only the definition and answers "is this present?". Lift the text naively and you write the opposite of the rule. Every lifted definition must carry `pass = PRESENT` or `pass = ABSENT`. |
| Impact Bench: 375 metrics / 14 models | 360 metrics provable across three files with zero set difference; the 375 headline cannot be reproduced. Models: **16** carry the nutrition label, 14 appear on `/explore` - both prior claims were right about different surfaces. |
| `Direct Answer Provision` is a failure whenever a direct answer is given | Only **when the person explicitly asked for guidance**. The qualifier is load-bearing. |

## Structural evidence for the cut

Three findings from the overlap analysis, which are evidence rather than opinion because they survive re-cutting across two incompatible taxonomies:

1. **Governance concepts survive re-cutting.** 8 of Shape of AI's 13 "Governors" collide with an AIverse pattern, so a control cluster is not an artifact of one library's taxonomy.

   **Correction - do not use this test in the other direction.** An earlier draft argued that Shape of AI's 5 "Identifiers" collide with little in AIverse and are therefore "cosmetic". That reasoning is invalid, and inconsistent with finding 2 below, which reads *low* overlap as evidence of a genuine gap. Overlap measures taxonomic convergence, not significance; both libraries are written for builders and may under-weight the same concerns for the same reasons. **Cluster membership is decided by the failure-mode test only.**
2. **AIverse has no counterpart to Shape of AI's Trust builders** - Consent, Data ownership, Watermark and Footprints match nothing. A whole concern is visible in one library and absent from the other, which is what a genuine gap looks like.
3. **Neither library states any rule about what happens when the AI is wrong and the person does not notice.** Both lean on user oversight as the safety mechanism, which silently assumes the error is detectable.

Finding 3 is the strongest candidate for an original contribution. It is sharpest in education, where the person affected is often not the person operating the tool - a learner scored by an admissions tool cannot catch the error, and the operator gets no signal there was one.

## Role vocabulary - every rule must name who it protects

**"The user" is not usable in an education standard**, because the person operating the AI is frequently not the person it is about. Three roles, which may be three different people or the same person:

| Role | Definition | Example where they differ |
|---|---|---|
| **Operator** | hands on the interface | A teacher drafting a progress report |
| **Subject** | bears the consequence of the output | The student that report is about, who never sees the tool |
| **Learner** | whose skill development is at stake | May be the operator (a student revising), the subject (a pupil being assessed), or neither (an admissions officer screening) |

**Every rule must state which role it protects.** A rule that says "the user" is under-specified and will be applied to the wrong person.

### Why this is load-bearing, not pedantry

It **changes principle 4**. "In learning, helping beats answering" applies **only when the operator is the learner**. A teacher asking for a lesson plan is using a work tool, and withholding it helps nobody. The shipped page originally opened this principle with "judge it per task type", which a teacher would reasonably read as a reason to withhold answers from themselves.

Corrected order of questions, now on the page:
1. **Is the person asking the person learning?** If no, answer directly.
2. If yes, then judge by task type (fact / procedure / judgement-and-craft).

It also disambiguates the identity rule. "Identity cues get more explicit as the user gets younger" is under-specified: it scales with the **operator's** age. Disclosure to the **subject** is a separate rule, because a subject may never touch the interface and so can never be reached by an on-screen cue at all - which is precisely the case where undetected error does its damage (see structural finding 3).

## Provisional clusters

Numbers in brackets are supporting rules found so far.

| # | Failure mode | Working name | Support |
|---|---|---|---|
| 1 | It should not have been AI at all | Right tool for the task | Weak from the pattern libraries - both assume you are building AI. **PAIR-dependent.** |
| 2 | The person has an inaccurate picture of what it is and how far to trust it | Accurate expectations | ~10: Disclosure, Watermark, Caveat, Prompt details, Disclaimer, Confidence, Initial CTA, Nudges, Example gallery, Smart onboarding |
| 3 | You cannot see where the answer came from | Traceable | ~6: Citations, References, Footprints, Stream of Thought, Citations & traceability, Agent observability |
| 4 | It acts without your agreement | You stay in control | ~13: Controls, Verification, Action plan, Sample response, Variations, Branches, Draft mode, Review actions, Pause & Stop, Inline/Visual editing, Autonomy control, Guardrails & permissions, Follow up |
| 5 | Data goes somewhere you did not agree to | Data stays where you put it | ~6: Consent, Data ownership, Incognito Mode, Memory, Temporary chat, Connectors/Knowledge bases |
| 6 | It fails and you cannot recover | Fails safely | ~3: Error states & recovery, Evaluation/Testing, Cost estimates. **Thin - PAIR has an errors chapter and should strengthen this.** |
| 7 | It teaches the wrong thing | Serves the learner | Impact Bench: Promotes Learning & Skill Development, Promotes Agency, Promotes Creativity, Promotes Wellbeing, Avoids Sycophancy |
| 8 | It works worse for some people | Works for everyone | **Nothing in either pattern library.** Impact Bench's child/adult split is indirect evidence. **PAIR-dependent.** |

### MECE problems still open

- **Confidence fits 2 and 3.** AIverse's own rule says it helps users "gauge reliability, and understand the basis of the output" - genuinely both. Provisional split: the confidence *value* is expectations; the *basis* is traceability.
- **Memory fits 4 and 5.** Shape of AI files it under Governors (a control); AIverse under Adapting (a capability). Provisional line: **cluster 5 governs what the system may hold and send; cluster 4 governs what it may do.** Memory is data, so it sits in 5.
- **Cluster 1 and 8 are currently too thin to qualify** under the "at least two rules" test. If PAIR does not supply them, they are not principles and must be dropped or merged - not padded.

- **Is "make AI recognisable" its own principle?** Provisionally **no - it merges into cluster 2**, but for a reason that had to be corrected. Avatar, Colour, Iconography and Name share a failure mode with Disclosure and Watermark, which already sit in cluster 2: *the person does not realise they are dealing with a machine, and so cannot calibrate trust.* A rule that fits an existing cluster cannot also be its own principle. It is merged because MECE requires it, not because identity is unimportant.

  **The education inversion, which the generic libraries do not carry and this standard should.** Children anthropomorphise, and Impact Bench scores this territory directly - `Promotes Social Interaction` and `Avoids Sexual & Intimate Behavior` are both scored separately for under-18s. The resulting rule runs against designers' instincts: **as the user gets younger, identity cues should become more explicit, not more human.** The reflex on a children's product is a warm name, a friendly avatar and a chatty personality; each of those works against the child holding onto what they are talking to. Personality is the sharpest case and may need to sit under the learner cluster (7) rather than cluster 2, since its failure mode is a parasocial one rather than a calibration one. **Open pending PAIR.**

### The one contradiction that must be adjudicated, not absorbed

The identical mechanic - thumbs up/down on a response - is Shape of AI's sole anti-pattern (Rating) and AIverse's Feedback pattern. AIverse's stated rule, "capturing quick sentiment on results to steer quality", is precisely the framing Shape of AI argues erodes trust when the user is not told what their rating steers.

Resolved as a **condition of use, not a ban**, faithful to Shape of AI's actual "handle with care" stance: feedback ships only where the loop visibly closes. This is already the shipped wording on the components page.

## Settled clusters (after PAIR)

PAIR resolved all three thin clusters. Each of the eight below now clears the two-rule minimum and names a distinct failure mode. The count is where the evidence landed, not a target.

| # | Failure mode (what goes wrong) | Principle name | Anchor rules (verbatim source) |
|---|---|---|---|
| 1 | It should not have been AI at all | **Earn the AI** | PAIR: "aligned on whether AI is a solution worth pursuing and why"; "Rule-based or non-AI systems - Heuristics"; "Knowing when to automate, augment, or leave control with the user". Shape of AI has no equivalent - the libraries assume you are already building AI. |
| 2 | The person has a wrong picture of what it is and how far to trust it | **Set honest expectations** | Shape of AI: Disclosure, Watermark, Caveat. AIverse: Disclaimer, Confidence (value). PAIR: whole Mental Models chapter, "Introduce AI in stages". *Absorbs the identity cues - Avatar, Colour, Name - by shared failure mode.* |
| 3 | You cannot see where the answer came from | **Show the working** | Shape of AI: Citations, Footprints, References, Stream of Thought. AIverse: Citations & traceability, Confidence (basis), Agent observability. |
| 4 | It acts without your agreement | **Keep the human steering** | Shape of AI: Verification, Action plan, Controls. AIverse: Review actions, Pause & Stop. PAIR: "the more consequential the outcome, the more human oversight should be required". |
| 5 | Data goes somewhere the person did not agree to | **Keep data where it was put** | Shape of AI: Consent, Data ownership, Incognito. AIverse: Temporary chat, Memory. PAIR: "explain to users how their input is sent"; "distinction between... personalized experience versus... model training should be obvious". |
| 6 | It is wrong or fails, and the person cannot tell or cannot recover | **Fail safely, even when the failure is invisible** | PAIR: "Imperceptible System Errors"; "Background errors that neither the user nor the system register"; "you'll need a dedicated quality assurance process to... identify 'unknown unknowns'". AIverse: Error states & recovery. |
| 7 | It teaches the wrong thing, or does the learning for the person | **In learning, help beats answer** | Impact Bench: Direct Answer Provision scored a failure; Promotes Learning & Skill Development; Promotes Agency; "Avoid completing the task without teaching". |
| 8 | It works worse for some people | **Work for everyone** | PAIR: "AI may have uneven performance for people across cultures, contexts and dimensions of identity"; "this disaggregation can reveal specific populations for which your AI might actually fail"; over-correction warning. |

### MECE resolutions (each boundary case assigned to one cluster, with the rule)

- **Confidence → split by what it shows.** The confidence *value* answers "how far do I trust this" (cluster 2). The *basis / why* answers "where did this come from" (cluster 3). Two behaviours, two clusters, no double-home.
- **Memory → cluster 5.** Cluster 5 governs what the system may hold and send; cluster 4 governs what it may do. Memory is retained data, so it is 5.
- **Identity cues (Avatar, Colour, Name) → cluster 2.** Same failure mode as Disclosure: the person does not realise they are dealing with a machine. Merged by the failure-mode test, not because identity is trivial.
- **Sycophancy → cluster 9, not 7 or 2.** It fits three (a false picture, impeded learning, and telling people what pleases them). It cannot sit in cluster 7, because cluster 7 only applies when the operator is the learner, and a flattering false reassurance to a parent or an administrator is still sycophancy. Its home is 9: the model optimising for the person's feeling over their good, which applies to every user. (An earlier draft of this file assigned it to 7; that was wrong for the reason just given, and the shipped page and skill both place it in 9.)

### The genuine ninth-cluster question - flagged, not silently resolved

Three of Impact Bench's nine categories are about the person's psychological safety, not their skill or their calibration: **Promotes Wellbeing, Avoids Sexual & Intimate Behavior, and the parasocial-attachment half of the identity problem** (a child forming a bond with a warm, named, chatty agent). That is a distinct failure mode - *the product harms the person emotionally, or forms an unhealthy attachment* - and it does not sit cleanly in any of the eight:

- Not cluster 2 (it is not about trust calibration).
- Not cluster 7 (a five-year-old bonding with an avatar is not a learning failure).

So a fully rigorous cut arguably yields **nine**, with a ninth principle: **Protect the person's wellbeing** (no sycophantic manipulation, no engagement-maximising, no romantic or parasocial pull, weighted hardest for the youngest users).

**This is a real judgement call, not one to bury in a count.** Note the irony worth stating plainly: the number nine was *ungrounded* when first asserted (borrowed from Impact Bench's category count), yet a from-scratch derivation independently arrives near it for real, traceable reasons. That is a coincidence of number, not a vindication of the original claim - the original nine had no contents, these do.

### The contradiction, resolved (unchanged by PAIR)

Thumbs up/down is Shape of AI's sole anti-pattern (Rating) and AIverse's Feedback pattern at once. Resolved as a **condition of use, not a ban**, faithful to Shape of AI's "handle with care" stance: feedback ships only where the loop visibly closes. Already the shipped wording on the components page.

## Decision and status

**Settled at nine, grouped under four questions** (2026-08-01). The ninth (Protect the person's wellbeing) ships because it is a distinct failure mode and the one most specific to education and to children.

Shipped to `content/guidelines/ai.mdx` under four family headings:

| Question | Principles |
|---|---|
| Is AI the right call? | Earn the AI |
| Is it honest? | Set honest expectations · Show the working · Fail safely, even when the failure is invisible |
| Does the person stay in charge? | Keep the human steering · Keep data where it was put |
| Is it safe for the person it affects? | In learning, help beats answer · Work for everyone · Protect the person's wellbeing |

Done: derivation, page rewrite (content-lint clean, renders 200).
Remaining: mirror the nine into `skills/ai/SKILL.md` (retire teacher-era R1-R6); per-rule traceability appendix here; decision record; evaluator pass.
