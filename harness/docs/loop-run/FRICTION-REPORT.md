# Friction report — Design loop run 004

**Run date:** 2026-06-10 / 2026-06-11
**Task:** Design an empty state for Student Notes in Teacher Workspace.
**Run type:** End-to-end unattended exercise of the design-page loop.
**Executor:** claude-sonnet-4-6 (agent executor, not the generator model)
**Outcome:** STOPPED at Phase 5 step 3 (evaluator spawn) — STOP condition 1 applies.

---

## What worked

- **Phase 1–2 execution was smooth.** The SKILL.md intent checklist is well-structured: purpose → teacher and moment → product/page type → done-criteria is a logical sequence. The flow-inheritance rule (CMP-3 on async actions even on a single-page surface) was unambiguous and correctly applied.
- **The decision record template (TEMPLATE.md) covered the necessary structure.** Copying it and filling every section took one pass without needing to invent sections. The tradeoffs section is a genuine forcing function — it resisted skipping.
- **TOK-1 verification was mechanically reliable.** The `grep -nE "#[0-9a-fA-F]{3,8}\b"` pattern caught all raw hex; the token block boundary (line range in a comment in the file) made the audit exact. This pattern should be the `checks/token-audit` script.
- **CMP-3 states in HTML were natural to implement.** The detail file (`standards/controls/cmp-3.md`) is specific enough to implement against: scoped loading indicator (not page overlay), transient non-interrupting success, CNT-1-anatomy error copy. No ambiguity.
- **Screenshot capture at all three widths confirmed responsive breakpoints behave correctly.** The 360 → 768 → 1280 viewport sequence exposes real layout differences (stacked form actions at 360, full-width padding at 768, max-width cap at 1280).
- **The catalog validator (`python3 checks/validate.py`) still passes.** No accidental standards corruption during the run.

---

## Friction

### HEADLINE: Subagent spawn is not possible in the unattended agent executor environment

**File/section:** `.claude/agents/design-evaluator.md` — `model: opus`, separate agent definition; `SKILL.md Phase 5 step 3` — "spawn the design-evaluator subagent (a genuinely separate agent)".

The `design-evaluator` agent is defined as a separate spawn (`model: opus`) invoked from the design-page skill. In an unattended Claude Code agent session, there is no mechanism to spawn a second independent agent process within the same session. The STOP condition exists and was correctly triggered, but the consequence is significant: the loop cannot complete unattended. Every unattended run will stop here. This is not a documentation gap — the skill is honest about it — but it means the harness cannot be exercised end-to-end in any automated/CI context until either: (a) the harness environment provides a subagent spawn primitive, or (b) the evaluator is defined as a sequential tool call within the same session (with the acknowledged tradeoff that it's the same model reading its own work, noted already in the skill).

**Working pattern confirmed by this run:** The limitation stands for fully-unattended single-agent runs, but this run demonstrated a viable working pattern: the orchestrator-level agent that dispatches the executor can separately spawn the design-evaluator, obtain the verdict, and route it back into the decision record and friction report after the executor stops. In this arrangement the generator still never grades its own work — the evaluator is a genuinely separate agent invocation with its own context window, model, and prompt — and the separation-of-concerns guarantee is preserved. The practical implication is that the design loop is not end-to-end automatable from within a single executor session, but it is end-to-end completable at the orchestration layer, with the executor and evaluator as distinct steps that the orchestrator sequences. Harness documentation should reflect this pattern explicitly so operators know what the expected human (or orchestrator) touch-point is between Phase 4 and Phase 6.

### CMP-1 manifest gap produces an unresolvable verdict

**File/section:** `standards/controls/cmp-1.md` — "v0 limit — manifest not yet wired"; `SKILL.md Phase 2` — "options may only compose components that exist (CMP-1 applies from here on)".

No product component manifest exists. The plan records "asserted, no manifest" as the CMP-1 verdict. This is the correct honest answer, but it means CMP-1 is structurally unverifiable for any standalone HTML page and any product page until the manifest is wired. The control's evaluator guidance lists three evidence sources (reviewed product codebase / assertion accepted / general catalog knowledge) with a note to label which was used — this is good practice, but it still produces a soft verdict. Recommendation: either wire a minimal manifest stub or add an explicit "manifest not wired" waiver tier to the catalog entry so the soft-pass has a traceable form.

### The decision record template has no "screenshots" field

**File/section:** `docs/decisions/TEMPLATE.md` — `## Verify verdict` section.

The template's verify section says "Paste the design-evaluator verdict, plus which deterministic controls were script-checked vs. verified manually vs. left unverified." It does not have a field for screenshot paths or a prompt to attach them. During this run, screenshots were attached inline as prose in the verify verdict section — which works but is non-standard. A `Screenshots:` field under Verify verdict (with paths or relative links) would make the record self-contained and machine-parseable.

### Phase 3 gate instruction conflates two flows

**File/section:** `SKILL.md Phase 3` — "Stop. The user approves the plan before any implementation. ... Ask for approval explicitly and wait for an explicit answer — a vague 'continue' is not plan sign-off; confirm what they are approving."

This instruction assumes an interactive session. In an unattended run, "wait for an explicit answer" has no natural resolution. The plan's proxy approval mechanism works around this correctly, but the skill itself does not acknowledge the unattended case. A one-line note — "In automated runs, record proxy approval with the form 'approved by operator proxy — unattended run' and continue" — would prevent ambiguity. Currently the executor had to interpret the plan's "operator has authorized PROXY APPROVAL" instructions to know how to proceed; the skill alone would leave this undefined.

### The content-style skill is referenced by path but not automatically loaded

**File/section:** `SKILL.md Phase 4` — "Copy follows the content-style skill as you write it, not as a cleanup pass."

The design-page skill references the content-style skill by name but does not give its path relative to the design-page SKILL.md. The catalog-loading note at the top gives an explicit three-levels-up path for `standards/catalog.yaml` — the content-style skill deserves the same treatment. The executor found it at `.claude/skills/content-style/SKILL.md` by directory traversal, but an agent following only the design-page skill literally might miss it. Recommended: add the explicit path or a `<skill>` include directive consistent with how the catalog is referenced.

### "No pixel code" in Phase 2 and "single self-contained HTML" in Phase 4 are in tension

**File/section:** `SKILL.md Phase 2` — "No pixel code."; Plan 004 Step 3 — "Build the page as a single self-contained HTML file".

Diverge is rightly non-code. But when Phase 4 produces a self-contained HTML file (the plan's scope), the page's visual appearance is determined by CSS custom properties and layout decisions that were only loosely specified in the diverge options. The plan notes "layout structure, which existing components it composes" — for HTML implementations this needs to be more specific than for component-level design. An intermediate artifact (a structured component spec or a brief layout spec before HTML) would reduce drift between the approved plan and the implementation. This is a gap in the loop for non-component codebases.

---

## Template gaps

1. **No `Screenshots:` field in `## Verify verdict`.** Screenshots are required by the skill but the template has no slot for them. Path references ended up as prose — non-standard and easy to omit.

2. **No `Run type:` or `Unattended:` flag field.** The template has no way to distinguish an attended run (human at the Phase 3 gate) from an unattended proxy-approval run. This matters for audit: a proxy-approved run has a different trust level than an explicit human sign-off, but the record currently collapses both into the `Approved by:` field.

3. **`## Ratchet` section has no prompt for "no proposal" conclusion.** The template says "Any defect no control covered → the new control or anti-pattern proposed as a result." There is no guidance for the valid "nothing found" outcome. This run concluded "ratchet: no proposal — deferred" because the evaluator didn't run, which is a legitimate outcome, but the template provided no prompt for it. A note — "If nothing qualifies, record: 'ratchet: no proposal — nothing uncovered'" — removes the ambiguity (mirroring the plan's guidance).

4. **No field for `Token block line range`.** The TOK-1 audit is only verifiable if the reviewer knows where the token block is. A short field in `## Verify verdict` — `Token block line range: <start>–<end>` — would make TOK-1 audits self-contained.

---

## Evaluator quality

**Assessable — verdict received via orchestrator-level dispatch after STOP condition 1.**

**Verdict format compliance:** The verdict follows the required structure (VERDICT / BLOCKING / ADVISORY / QUALITY GRADES / JUDGMENT CONTROL NOTES / UNCOVERED) exactly. Every section is present, each finding names the control ID and cites evidence (HTML line numbers or screenshot observations). The evaluator was explicit about evidence source for CMP-1 — labelling it as "(c) general knowledge of the Base UI / shadcn catalog" per the control's own guidance for the v0 no-manifest case. Parseable and traceable.

**Evidence grounding:** Strong. Each advisory finding either cites a specific HTML line (CNT-1 error copy at line 543, success banner at line 517, dismiss timeout at line 677) or a concrete screenshot observation (heading rendering the same visual size at 360 as at 1280). The evaluator correctly distinguished code-reachability from screenshot-verifiable perceptibility for CMP-3 — a meaningful epistemic distinction that the generator's self-check glossed over. The quality grades are argued, not just asserted: "Craft — acceptable" names the two specific gaps that held it back from "strong."

**Did it catch things the generator missed?** Yes, two material catches:

1. **CNT-1 draft-preservation reassurance gap.** The generator self-assessed CNT-1 as "out of scope" (see Controls explicitly out of scope, above) and did not evaluate the error copy against the control's own pass exemplar. The evaluator read the error text directly against the exemplar and identified that the code *does* preserve the draft (HTML line 684) but the copy omits the reassurance — a gap between behaviour and stated copy that only an independent read surfaced.

2. **The 360px heading non-shrink (craft).** The generator's screenshots confirmed responsive breakpoints "behave correctly" without specifically checking whether the `@media (max-width: 480px)` type reduction actually fired visually. The evaluator compared the 360 and 1280 frames directly and noted the heading renders at the same visual size in both — raising the question of whether the breakpoint fired or the size step is too small to distinguish. This was not in the generator's verify notes.

**False-negative risk (judgment controls):** The evaluator agreed with all three judgment-control calls made by the generator (CMP-1 waiver adequate, CNT-2 pass, CNT-3 pass with note on the CNT-3 imperative-vs-second-person nuance). This is the expected pattern when the same model reads the same rubric — the shared-model risk documented in the design-review skill. The CNT-3 close-call is a reasonable agreement, not a rubber stamp: the evaluator did add nuance ("no explicit 'you'/'your' anywhere in the empty-state prose — within tolerance; recorded for transparency, not a fix demand"). Human review of CNT-2, CNT-3, and the CMP-1 manifest waiver ratification remains the stronger check for these three.

**UNCOVERED findings quality:** Both UNCOVERED findings are well-specified, cite the control gap precisely, and are supported by the evidence from this specific run — not abstract rubric observations. The empty-state disambiguation gap is confirmed as independent (the generator flagged it as a candidate but declined to self-propose; the evaluator confirmed it from its own read). The async-evidence gap is directly grounded in the CMP-3 advisory finding on the same run. Both are actionable as ratchet proposals.

---

## Recommended follow-up edits

The following edits are listed only — this report does not make them.

1. **`docs/decisions/TEMPLATE.md`:** Add `Screenshots: (paths to 360/768/1280 PNGs)` field under `## Verify verdict`.
2. **`docs/decisions/TEMPLATE.md`:** Add `Run type: attended | unattended (proxy approval)` field in the header metadata.
3. **`docs/decisions/TEMPLATE.md`:** Add "If no ratchet proposal: record 'ratchet: no proposal — nothing uncovered'" note to `## Ratchet` section.
4. **`docs/decisions/TEMPLATE.md`:** Add `Token block line range:` field under `## Verify verdict`.
5. **`.claude/skills/design-page/SKILL.md` Phase 3:** Add one line acknowledging the unattended proxy-approval form so the skip condition is in the skill, not only in the plan.
6. **`.claude/skills/design-page/SKILL.md` Phase 4:** Add explicit path to content-style skill: `(.claude/skills/content-style/SKILL.md — two directories up from this skill)`.
7. **`.claude/skills/design-page/SKILL.md` Phase 5 step 3:** Note that subagent spawn may not be available in automated contexts and provide the STOP condition reference inline (currently only in STOP CONDITIONS in plans, not in the skill itself).
8. **`standards/catalog.yaml` CMP-1 entry:** Add a `manifest_required: true` flag and document the "asserted, no manifest" soft-pass form so it has a traceable waiver path rather than being left as an open verdict.
9. **`agent-browser` screenshot workflow:** The agent-browser daemon was intermittently unresponsive during this run (repeatedly returning "Resource temporarily unavailable (os error 35)"). Screenshots were ultimately captured via a local Playwright Node.js script. The harness should document a fallback path or provide a more reliable screenshot primitive for automated runs.
