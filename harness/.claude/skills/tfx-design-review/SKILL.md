---
name: tfx-design-review
description: Evaluator procedure for grading a designed page against the sprint contract, judgment controls, and design quality criteria. Used by the tfx-design-evaluator subagent during the verify phase — not by the agent that produced the design.
---

# Design review (evaluator procedure)

You are grading someone else's design work. You did not produce it; do not try to fix
it — your output is findings, not patches. Self-evaluation skews positive, which is
why this role exists separately.

## Inputs you should receive

1. The **sprint contract** (done-criteria from the intent phase).
2. The **approved plan** (structure, components, waivers granted).
3. **Screenshots** at 360/768/1280, plus the code or rendered DOM. For flows and
   multi-step interactions, also the journey evidence: the happy path traversed
   frame-by-frame plus one walked recovery path. If a flow arrives with per-step
   stills only, say so — you cannot grade a journey from pages.
4. The **judgment and hybrid controls** in scope (from `standards/catalog.yaml`,
   filtered to `check: judgment | hybrid`, `phase: verify`).
5. The **component inventory** from Phase 1 — the route, every component, and every
   interactive control with its states.

If any input is missing, say so and grade only what you can — never invent a contract.

**independently enumerate the surface's interactive controls** — from the
component inventory **and** from reading the route's code (you have Read/Grep/
Glob/Bash). Do not grade only the screenshots you were handed: a control that was
never photographed is still in scope. Spot-check each interactive control for a
visible focus state (A11Y-2), role + accessible name (A11Y-8/A11Y-3), and that
its ARIA state tracks the visual (A11Y-8, per controls/a11y-8.md). A control the
builder's evidence omits, found this way, is a finding — not an excuse.

Deterministic controls are primarily the `checks/` scripts' job, not yours — but do
not *assume* they ran. Only validate, token-audit, and audit-record are built (v0);
for the rest, ask whether each was verified manually; if neither, say the control is
unverified rather than passed. Any deterministic violation you can see — in a
screenshot or in the code — is a finding regardless, belt and braces.

**Findings sort by tier and waiver status, never by how you found them:**

- An in-scope control violated with no waiver on file → **BLOCKING** for L0 and L1,
  **ADVISORY** for L2. An L1 violation is not an advisory just because a waiver
  *could* be written — no waiver on file means blocking; say what a waiver would
  need, don't grant one hypothetically.
- **UNCOVERED is only for defects no in-scope control covers.** A violation of an
  in-scope control never goes there, even when you verified it manually because its
  script is unbuilt — file it under BLOCKING/ADVISORY per tier and note "verified
  manually" as the evidence source.

## Grading

**1. Contract compliance.** For each done-criterion: met / not met / partially, with
the evidence (quote the copy, name the screen region).

**2. Plan fidelity.** Does the build match the approved structure? Structure drift
during implementation is a finding even when the drifted version looks fine — the
plan was the human-approved artifact.

**3. Judgment controls.** Apply each in-scope control using its detail file's
"Evaluator guidance" section. Quote the specific text or element you judged. Respect
granted waivers; flag waivers that don't carry a specific reason.

**4. Design quality — four criteria**, each graded strong / acceptable / weak with
one sentence of reasoning. These draw on Apple's HIG design principles as a
reference lens (a judgment aid, not a checkable standard):

- **Design quality** — hierarchy, spacing rhythm, alignment; does the page read in
  the order the task needs? Is hierarchy doing its job (HIG: Simplicity) — does the
  teacher know where they are and what comes next? Does it carry Kind Utility —
  approachable, frictionless, safe, reliable — or does it merely pass the controls?
- **Originality** — appropriate distinctiveness. For professional daily-use tools
  this is inverted from consumer work: flag *unwarranted* novelty (a custom pattern
  where a stack component exists is a finding) as readily as generic slop. Slop is
  control-backed since the catalog consolidation: where the generic-AI tell matches
  an SLP control (SLP-1..10), cite the control id as a graded finding rather than
  marking it down only in this grade. Apple's
  test applies (HIG: Delight): don't mistake delight for decoration — character that
  gets between the teacher and the task is a finding, not a flourish.
  **Do not flag** deliberate semantic colour-coding as slop: per-section or
  per-status colour that is decorative (`aria-hidden`) wayfinding, or functional
  status colour from the Radix scales (COL-2), is intentional design — it is not
  the SLP-1 "rainbow"/gradient AI tell. Flag *unmotivated* multi-hue decoration,
  not a deliberate colour system.
- **Craft** — quality sets the tone (HIG: Craft): is each decision deliberate?
  States designed (empty, loading, error, focus), edge content lengths,
  responsive behavior between the three captured widths.
- **Dark mode** is graded only when the product supports it and a dark frame was
  captured. If the product has no dark mode (no toggle, no re-rendering `.dark`
  layer), mark dark-mode checks **N/A — product has no dark mode**; never grade
  a TOK-1 "dark-safe" pass from token resolution alone for a mode that never
  renders.
- **Functionality** — does the flow actually complete the teacher's task; dead ends,
  missing recovery paths. Recovering from a mistake should not cost the teacher time
  or work, and any guided flow must be skippable or escapable (HIG: Agency). For
  flows, grade the journey against the plan's flow map: do entry points, exits, and
  the interruption/resume cases behave as planned, and is the teacher's work
  preserved through each of them?

## Output format

```
VERDICT: pass | pass-with-findings | fail

BLOCKING (must fix before ship):
- [control-id or contract item] finding — evidence
  (MECHANICAL RULE, no severity discretion: every in-scope control you judge
  "fail" with no waiver on file goes HERE if it is L0 or L1, ADVISORY if L2.
  Do not demote an L1 because the element is peripheral, the fix is small, or
  a waiver could be imagined — the tier already encodes severity. A "fail" in
  JUDGMENT CONTROL NOTES that appears in neither findings section is a defect
  in your verdict.)

ADVISORY (should fix):
- ... (L2 violations; waived L1s worth noting; close calls that are not control
  failures)

QUALITY GRADES: design quality / originality / craft / functionality — with reasons

JUDGMENT CONTROL NOTES (one line per in-scope judgment/hybrid control):
- [control-id] pass | pass-with-caveat | fail — the evidence you judged, quoted.
  For CMP-1, always name your evidence source (manifest diff / product codebase
  read / general stack knowledge) per its detail file's v0-limit clause.

UNCOVERED (defects no control covers — feed the ratchet):
- ...
```

Calibration: you are a screening pass, not the final authority. Be decisive on clear
violations; on close calls, say it's a close call and recommend human review rather
than manufacturing confidence either way.
