---
name: tfx-design-ui
description: Design or change a Teacher & School product UI — a new page, screen, form, flow, OR a modification to an existing one (adding a field, editing copy, restyling a component). Use whenever the user asks to design, create, build, add to, change, fix, or restyle any page, screen, form, component, or user flow — and whenever they ask to re-audit, re-check, or re-verify an existing page against the standards catalog (e.g. after the catalog gains new controls). Orchestrates the full loop — intent, diverge, plan (human gate), implement, verify — with the TFX-DS standards catalog enforced throughout. For copy-only edits the tfx-content-style skill is sufficient; for questions about the catalog itself use tfx-design-standards.
---

# Design UI

You are designing UI for the Teacher & School portfolio (Teacher Workspace, CaseSync,
Glow, and TW surfaces). The normative source is the TFX Design Standard; brand essence
is **Kind Utility** — useful first, kind at the surface. Standards compliance is not a
final check — it shapes every phase. Work through the phases in order; do not skip a
gate even if the request seems simple.

The harness's one promise: **intent without loss**. What the builder means is written
down as a contract in Phase 1; every later phase is graded against that contract;
drift from it is a defect.

<!-- tfx-sync:L0 source=catalog -->
**Non-negotiables (L0), binding even outside the loop:** AA contrast (A11Y-1); keyboard
reach with visible focus (A11Y-2); a visible label on every field (A11Y-3); destructive
actions show consequences and offer undo or confirm (CMP-2).
<!-- /tfx-sync:L0 -->
These never bend — if one
seems impossible, that is a blocking question for the user, not a judgment call. (The
catalog carries the rest; these four are restated here because this SKILL.md travels in
the plugin while the harness's CLAUDE.md does not.)

**Load first:** the control catalog at `standards/catalog.yaml`. **Locating it:** the
catalog ships with this harness, not with the product repo — resolve it relative to
this SKILL.md file, three levels up: `<this-skill-dir>/../../../standards/catalog.yaml`
(the same path works in the harness dev repo and when installed as the
`tfx-design-harness` plugin; do not expect `standards/` in the project cwd). Filter
controls by `phase` as you go; read a control's `detail` file (same `standards/`
directory) before applying it. Also load the `tfx-design-standards` skill for the waiver
protocol.

**The stack** (deliberately boring, AI-legible): Base UI components, Radix Colors
scales, shadcn/ui default tokens for spacing/radius/type. Plus Jakarta Sans (600) for
display, Inter (400/500/600) for body/UI. Each product anchors primary actions and
brand moments in its **own** primary (Teacher Workspace → Teacher & School Blue
`#0064FF`; Glow → orange; CaseSync → indigo — see COL-1's detail file for the
table). Build from these by default.

**Judgment lens.** Where no control decides and Kind Utility alone is too coarse,
weigh trade-offs against Apple's HIG design principles (Purpose, Agency,
Responsibility, Familiarity, Flexibility, Simplicity, Craft, Delight —
developer.apple.com/design/human-interface-guidelines/design-principles). A
reference point like SGDS and GOV.UK, never a checkable standard: principles settle
trade-offs; they are not used to "check" work. The phase notes below name the ones
that recur in this portfolio.

**Layout controls (partial coverage).** Layout now has five checkable controls:
LAY-2 (reflow at 320 px — WCAG 2.2 SC 1.4.10, L1), LAY-3 (page-template fit, L2),
LAY-4 (body-text measure ≤ 80ch, target ~66ch — L2), LAY-5 (density fits the task,
L2), and LAY-6 (edge / optical alignment, L2). Grid systems remain HIG +
judgment until a declared product grid lands.

## New page vs. modification

This loop covers both. Choose the entry depth by change size, never skip the gates:

- **New page or flow** — run all six phases.
- **Modification** (add a field, change a layout region, restyle a component) — run a
  scoped loop: a one-line intent, skip diverge if the structure is fixed, a short plan
  naming the controls the *changed surface* pulls in, then implement and verify the
  changed surface. A modification still binds its controls — adding a field still
  triggers A11Y-3, restyling still triggers TOK-1..3, touching an async action still
  triggers CMP-3. The common failure is treating "just add a field" as outside the
  harness; it is not.
- **Catalog update re-audit** — when controls are ADDED to the catalog, existing
  shipped surfaces are silently out of date until re-audited. Run each affected
  surface through the modification loop: the "change" is the catalog delta, the
  scoped plan is the audit findings against the new controls only.

### Existing surfaces: critique before you polish

Whenever the surface **already exists** (a modification, a restyle, an
"improve / polish this", or a catalog re-audit), do not propose changes before
you have seen and judged the current state. Before Phase 1's contract:

1. **Clarify the ask — dimension and ambition.** Do this first; it sets the lens
   for everything below. An open-ended request ("apply the standards", "improve
   this", "polish it") names no dimension of change, and you cannot infer one — use
   Phase 1's "Clarify the ask before you scope it" to pin down which dimension(s)
   are in scope (visual & brand, layout, UX & flow, copy, or compliance-only) and
   how far the look may move. A critique run through the wrong lens scopes the wrong
   polish.
2. **Capture the current page.** Take a screenshot of the live surface at 1280
   (and 360 if the change is responsive). Capture mechanism: use Claude-in-Chrome
   by default, or the user's installed browser agent of choice; the local
   Playwright fallback from Phase 5 applies. **If capture keeps failing, ask the
   user to provide the screenshot** — never critique a page you cannot see, and
   never fabricate what it looks like.
3. **Write a short design critique of what is there** — through the dimensions the
   builder chose in step 1, against the in-scope catalog controls *and* Kind
   Utility: what works and should be preserved
   (call out established iconography, radius, layout, and copy that are
   deliberate — do not "fix" them, cf. the conservative-defaults rule in
   Phase 3/4) — **but verify, do not assume: every element you list as
   "preserve" stays in scope for its controls, so check it against the L0 floor
   (A11Y-1 contrast especially) before calling it good. Preserved is not waived:
   "preserve" means do not restyle a deliberate choice, it never means skip the
   check** — and what
   genuinely underperforms. What counts as underperforming widens with the ask: for
   a compliance pass it is control violations, hierarchy, and friction in the
   teacher's task; when visual & brand is in scope it also includes a surface that
   is compliant but does not yet carry the product's brand expression as boldly as
   the builder wants. Ground each point in the screenshot.
4. The critique's "what underperforms" list **is** the scope of the polish; it
   feeds the Phase 1 contract and the Phase 3 plan. Improvement is the goal —
   the critique keeps it targeted instead of a blanket restyle.

## A flow is not a stack of pages

The page is the unit of evidence, but the design is the journey. When the surface is
a flow — or a single page hosts a multi-step interaction — design the journey, not
just each screen:

- **Map it in Phase 1**: entry points (where does the teacher arrive from, and with
  what already known?), the done state, and every exit — back, cancel, abandon. A
  flow with only its happy path mapped is a demo, not a design.
- **Edge cases are structure, not polish.** Decide in Phase 3, not during build:
  interruption (timeout, network loss mid-flow), partial completion and resume, the
  teacher who left at step 2 and returns tomorrow, data that already exists
  elsewhere. For each, the plan says what happens to the teacher's work — "your
  draft is saved" must be a designed behaviour before it can be honest copy.
- **Interactions carry the flow.** Transitions preserve context — content and
  controls stay in predictable positions across steps (HIG: Flexibility); keyboard
  traversal works across the whole journey, not just within each screen (A11Y-2 at
  flow scope); focus lands somewhere sensible after every step change (A11Y-11
  applies at each transition, not only at async states).
- **Escapability is part of the structure** (HIG: Agency): the teacher can leave at
  any step without losing work, and the route out is visible, not discovered.

## What actually runs today

Not every deterministic control has a script yet, and every built script covers only a
**static subset** of its control — it reads line-local code, never the rendered DOM.
`checks/README.md` is the single source of truth for which scripts exist and exactly
what each does *not* cover; read it before the verify phase rather than assuming a
control is mechanically enforced. Phase 5 names the scripts that catch the most.

The rule this note exists to enforce: **never report a `checks/`-backed control as
"passed" when no script ran.** Say "verified manually" or "could not verify
mechanically", and list what a human should re-check. Overstating enforcement is the
failure this prevents.

## Phase 1 — Intent (sprint contract)

### Clarify the ask before you scope it

A request like "apply the standards", "improve this", "polish it", or "make it
better" names *no dimension of change* — and you cannot infer one, so do not try.
"Apply the standards" in particular reads by default as a **compliance + anti-slop
pass**: on a surface that is already decent, that can finish with the visuals looking
almost unchanged. That is exactly what disappointed the Glow pilot — the builder
wanted a brand-forward visual redesign, said "apply the standards", and got a run that
tightened UX the surface had mostly got right already. The fix is not to guess bigger;
it is to **ask**. When the request is open-ended, use a structured `AskUserQuestion`
to pin down which **dimension(s)** are in scope:

- **Visual & brand expression** — colour, type expression, imagery, the surface's
  energy, and how strongly it carries the product's brand (Glow's warmth, TW's blue,
  CaseSync's indigo). This is the dimension "apply the standards" silently drops.
- **Layout & structure** — hierarchy, composition, page template, density.
- **UX & flow** — the teacher's path, the steps, the states, the friction.
- **Copy** — headings, labels, microcopy, error states.
- **Compliance & anti-slop only** — fix control violations, change nothing that is
  deliberate. This is the *narrowest* ask; confirm it is what the builder meant
  rather than the default they fell into.

Pair the dimensions with an **ambition level** — the smallest reversible change that
meets the contract (Phase 4's standing default), a targeted lift of the
underperforming parts, or a bold reimagining *within the product's existing system*
(never an invented aesthetic — COL-1, TYP-1, SLP-1 still bind). Standards compliance
is the floor in every case; this question decides whether the ceiling is in scope
too. Write the answer into the done-criteria so the evaluator grades against the
dimension the builder wanted, not the one the phrase defaulted to.

Establish the rest, asking the user only what you cannot infer:

> For an **existing** surface, run "Existing surfaces: critique before you polish"
> (above) before writing the contract — the contract's done-criteria should target the
> critique's findings *through the dimensions chosen above*, not a blanket redesign and
> not a compliance-only pass when the builder asked for more. ("Critique the current
> state first".)

1. **Purpose**: what must the teacher accomplish on this page? One sentence. Apply
   the one test: *does this help teachers work faster with less stress?* If not,
   raise that before designing anything. Keep the scope focused (HIG: Purpose):
   prioritise the few things this moment actually needs and make those truly good —
   a page with a clear use beats one that does everything.
2. **The teacher and the moment**: anchor in a specific teacher's real workflow, not
   an abstract "user" — can you name the teacher and the moment this serves? ("Ms.
   Lim, P5 Math, entering marks the week before reports are due.") Design for the
   stressed week, not the average one.
3. **Product and page type**: which product (TW / CaseSync / Glow / TW surface — this
   sets tone calibration per `tfx-content-style`), and what kind of surface: workspace
   view, form, flow step, dashboard, settings, empty state, onboarding. Page type
   selects controls via `applies_to`. **Any surface with an async or destructive
   action inherits the `[flow]` controls** (CMP-2, CMP-3) even when it is a single
   page — do not let the page/flow split scope them out.
4. **Done-criteria**: write a short sprint contract — the 3–6 statements the evaluator
   will later grade against. State the **dimension(s) and ambition** chosen in "Clarify
   the ask" as explicit criteria (e.g. "the surface visibly carries Glow's warmth", not
   just "passes the standards") — otherwise the evaluator has no way to catch a run that
   delivered compliance when the builder wanted a visual redesign. Include the
   `intent`-phase controls (CNT-2 naming applies here: name the feature in plain
   language now, before a placeholder name spreads).
5. **Component inventory**: list the surface as a coverage checklist — the route,
   every component it renders (by import name), and every **interactive control**
   on it (buttons, inputs, dropdowns/combobox, toggles, tabs, links, menus). For
   each interactive control, name the states to exercise later: open, keyboard-tab
   (focus visible?), screen-read (role + accessible name + state?). This is the
   list Phase 5 checks off and the evaluator independently verifies — coverage is
   a provable checklist, not a vibe. (For an existing surface, build this during
   "Existing surfaces: critique before you polish".)

Output: the sprint contract, shown to the user.

## Phase 2 — Diverge

Produce 2–3 structurally different options. **No pixel code.** For each option:
layout structure, which existing components it composes, how the flow splits across
steps, a one-line **visual thesis** (the mood and energy it carries — stated as an
extension of the product's existing system, never an invented new aesthetic), and one
sentence on the trade-off. Use the product's component manifest
(`.tfx/component-manifest.json`, filtered to `status: "stable"` entries) —
options may only compose components that exist in the manifest (CMP-1 applies from
here on). If the product has no manifest yet, fall back to the v0-limit procedure
in `standards/controls/cmp-1.md` and note "asserted, no manifest".
Progressive disclosure is the default pattern: show the core path, reveal complexity
on demand. Three anti-slop controls bind at this altitude: a complex multi-section
task gets a page, never a modal (SLP-10) — if an option puts tabs, columns, or its
own scrolling inside a dialog, it is not an option; a grid of identical cards is
not a default layout (SLP-5) — structure should come from the task's hierarchy, not
a template; and a card is only for an interactive unit (SLP-11) — if an option boxes
static content in card chrome where spacing, type, and a divider would group it, that
is a finding, not a layout. Two lenses bind here too: simplicity is not minimalism (HIG: Simplicity) —
keep the important things close and let the rest fall away, never hide what the task
needs; and keep the teacher free to move (HIG: Agency) — an option that locks people
into a guided flow or mode must make it easy to skip or escape.

**Compose, don't fill.** Treat the first screen as a composition, not a container to
pack: one clear focal point — the teacher's primary task and its single primary action
(CMP-5) — with related content grouped by proximity and a shared region rather than
boxed in cards (SLP-11), and everything else stepped down so hierarchy does the
explaining (SLP-6). Each option's layout is graded at verify against LAY-3 (does it fit
a known page template for its type?), LAY-5 (does its density fit the task?), and
LAY-6 (do shared edges align?) — design to them now, not as a cleanup pass.

Output: the options with a recommendation. The user picks.

## Phase 3 — Plan (human gate)

Expand the chosen option into a plan:

- Page/step structure and the component for each region.
- Tokens/patterns used; any **missing component** surfaced explicitly with options
  (extend an existing Base UI component / request from the design system — never
  improvise a one-off without a CMP-1 waiver).
- **Interaction plan**: name the 2–3 specific motions the chosen option uses — one
  entrance, one state transition, one hover/reveal — described concretely (what moves,
  from what to what), not "add animations". Reuse the product's existing motion
  conventions; every motion is bound by MOT-1 (100–300ms, standard easing, none on
  critical paths beyond functional feedback), SLP-8 (no bounce/elastic), and A11Y-5
  (a reduced-motion variant). Motion that improves neither hierarchy nor feedback is cut.
- The controls in scope for this page (filtered catalog), with any proposed waivers
  and their rationale — waivers are decided here, not improvised during implementation.
- Content outline: headings, key copy, names checked against CNT-2, error states
  (CMP-3: enumerate loading/success/error states per async action — and for each
  state, its A11Y-11 announcement channel: live region or focus move; CMP-2: every
  destructive action's consequence + undo/confirm, decided now).
- **Flow map** (when the surface is a flow or hosts a multi-step interaction): entry
  points, done state, every exit, and the edge cases from "A flow is not a stack of
  pages" — interruption, partial completion, resume — each with what happens to the
  teacher's work. A plan that covers the steps but not the journey between them is
  incomplete.
- **Tradeoffs, named**: what this design sacrifices and why that's acceptable. A plan
  without a tradeoffs section is incomplete.

**Stop. The user approves the plan before any implementation.** This is the cheapest
place for human judgment — structural mistakes caught here cost a conversation, not a
rebuild. The gate runs across **two turns**:

- **Turn 1 — present the plan.** The full plan goes in your message body. Close with
  a plain-text line that you will ask for approval next — **never a modal/option
  dialog in the same turn as the plan**, which forces a decision before the reader
  has read what they're deciding on.
- **Turn 2 — the structured ask.** In the follow-up turn, ask for sign-off with a
  structured **Approve / Adjust** `AskUserQuestion` — this is the documented Phase-3
  default. "Approve" proceeds to implement; "Adjust" sends you back to revise the
  plan (then re-present and re-ask). A free-text approval is still accepted; a vague
  "continue" is not — confirm what they are approving.

This structured **Approve / Adjust** question is the default at the Phase 2 option pick
and at continuation/verify gates too — but the two-turn split above is Phase 3 only.
At the Phase 2 pick the dialog may be same-turn, because the options are short enough
to read inside it.

In an **unattended run** with no human reachable, proxy approval is
permitted only when the operator authorized it up front — record it verbatim as
"approved by operator proxy — unattended run" in the decision record, never as if a
human approved.

Proxy approval is not a substitute for review. In an unattended run, still emit a
**compact, reviewable plan + intended-diff summary** for async sign-off: the files
to be touched, the specific visual/structural changes, and — explicitly — what is
being **preserved**. Route it to the async reviewer (the portfolio designer) and
record that it was sent; do not treat "operator proxy" as equivalent to a human
having read the diff.

On a team with no dedicated designer, this gate (and the verify gate) is reviewed
async by a portfolio designer — route the plan to them rather than treating the gate
as optional. Write the approved plan to a decision record at `docs/decisions/<page>.md` in
the **product repo**. If `docs/decisions/TEMPLATE.md` does not yet exist there,
copy it from the plugin first — it ships at
`<this-skill-dir>/../../../docs/decisions/TEMPLATE.md` (resolved the same way as
the catalog in the Load-first note, three levels up) — so records conform to
`audit-record.py` by default. Base the new record on that template. The approved
plan is the artifact the verify phase grades against, so it must be fixed, not
whatever you last proposed. Any L1 waiver granted here records its named approver
in that file.

## Phase 4 — Implement

Build exactly the approved plan. Constraints, non-negotiable:

- **Conservative, reversible defaults — do not restyle what is already
  deliberate.** Established iconography, corner radius, layout structure, and
  settled copy are presumed intentional: do not change them as a side effect of a
  scoped task. If a change to one is genuinely warranted, flag it explicitly as a
  *proposed* change with its rationale and a one-line revert note in the plan/diff
  summary — never silently. Default to the smallest reversible change that meets
  the contract. **But preserved is not waived:** "deliberate" protects an element's
  *look* from restyling, never its *compliance* from verification. A preserved avatar,
  badge, or icon still must pass A11Y-1 (contrast), A11Y-2/-3, and every in-scope
  control; if it fails one, fixing it is in scope — flag the fix as above rather than
  leave the failure standing because the element was "established". (Example:
  per-section semantic colour-coded icons that are decorative `aria-hidden` wayfinding
  are **not** SLP-1 "rainbow slop" — preserve them; neutralising them is a restyle to
  flag, not a default.)
- Compose only manifest components (`status: "stable"` from `.tfx/component-manifest.json`
  if the product has one; CMP-1); semantic shadcn tokens only — no raw
  colour, off-scale spacing, or off-scale radii (TOK-1..3); Plus Jakarta Sans /
  Inter only, on-scale sizes (TYP-1..3).
- Functional colours come from the Radix scales (COL-2); **small functional-colour
  text (≤12px) on a tint uses step-12, not step-11** — step-11 on a tint dips below
  the 4.5:1 AA floor (A11Y-1).
- Visible label on every field (A11Y-3); keyboard reach + focus states (A11Y-2);
  AA contrast (A11Y-1); targets ≥ 24px, 44px on mobile (A11Y-4); respect reduced
  motion (A11Y-5).
- Anti-slop (SLP-1..8) — the default AI aesthetic is a defect: no purple/violet
  gradient palettes, cyan-on-dark, or glow accents (SLP-1); no gradient text
  (SLP-2); no thick side-tab accent borders on rounded cards (SLP-3); no nested
  cards — flatten with spacing, typography, dividers (SLP-4); no identical-card
  grids or icon-tile-above-heading templates (SLP-5); adjacent type-scale steps
  ≥ 1.25x apart (SLP-6); spacing has rhythm — related tighter than unrelated
  (SLP-7); no bounce or elastic easing (SLP-8).
- Accessibility structure (GovTech checklist Essential tier, A11Y-6..10): text
  alternatives or `aria-hidden` on every image/icon (A11Y-6); semantic headings/
  lists/groups, descriptive labels (A11Y-7); custom controls expose name/role/value
  (A11Y-8); descriptive `<title>` + `lang` attribute (A11Y-9); skip link or
  landmarks past repeated chrome (A11Y-10).
- Every async state change picks ONE announcement channel (A11Y-11): transient →
  live region, no focus steal; context replacement → focus moves to the revealed
  surface, no `role="alert"` on the focus target. Declare the channel per state in
  the Phase 3 plan alongside CMP-3's state enumeration.
- Destructive actions: consequence + undo/confirm before execution (CMP-2, L0).
  Build forgiveness beyond CMP-2's minimum (HIG: Agency): recovering from the
  unexpected should not cost the teacher time or work — preserve drafts, keep
  back-navigation safe, make reversal cheap.
- Consistency is a feature (HIG: Familiarity, Flexibility): once an element's
  behaviour or appearance is established, reuse it across the surface, and keep
  content and controls in predictable positions across the three widths — people
  learn faster when new interactions work the way the last one did. **Use
  design-system components at their defaults and the way sibling pages use them
  (CMP-7): an override that changes a default's colour/contrast/shape, or a control
  group whose members don't share a resting affordance, is a finding unless recorded
  with a reason — re-check any colour/contrast override under A11Y-1.**
- **Action hierarchy** (CMP-5): one primary (filled) action per view — secondary steps
  down to outline/tonal, tertiary to ghost/link; a destructive action takes its own
  variant, never the primary style (CMP-2). The primary's colour is the product's own
  brand primary (COL-1). Make the next step obvious without a label.
- **Tables** (CMP-6): for tabular data — gradebooks, rosters, attendance — use a real
  `<table>` with `<th>` headers (A11Y-7); right-align numeric columns in tabular figures
  (TYP-5) and left-align text; keep the header visible while scrolling; design the empty
  and loading states (CMP-3); set density to the task (LAY-5); separate rows with spacing
  or hairline dividers, not nested-card chrome (SLP-4). If records are not compared across
  shared columns, a list or cards may fit better than a table (SLP-11).
- **Interface craft** (HIG: Craft) — the small details that read as care: tabular
  figures, concentric radius, property-scoped interruptible transitions, press
  feedback, hit-area expansion, feels-instant loading, layered shadows, type polish,
  image edges, and disciplined `will-change`. Each refines the controls above, none
  replaces them, and the evaluator grades Craft on them. Apply the ones the surface
  calls for **from `implement-craft.md`** (beside this skill) as you build — the
  specifics live there so this list stays scannable; don't defer them to a cleanup pass.
- Copy follows the `tfx-content-style` skill as you write it, not as a cleanup pass
  (it ships with this harness: `../tfx-content-style/SKILL.md` relative to this skill).
  That includes the anti-slop copy rule (SLP-9): no AI-writing tells — buzzwords,
  em-dash chains, filler, chatbot artifacts, structural tells (negative
  parallelism, forced triads, copula avoidance), or label/helper pairs that
  restate each other. Canonical lists and calibration:
  `standards/controls/slp-9.md` — resolved relative to this SKILL.md (three levels up),
  as in the Load-first note above.
- **Make every asserted state reachable for evidence.** If a hybrid control claims
  loading/success/error states, the verify phase must photograph them — build a
  clearly-marked demo-only hook where needed (e.g. a `?fail=1` query param to force
  the error state) and note it in the decision record. A state that can't be
  demonstrated can't be verified.
- Structure drift from the approved plan is a defect — if implementation reveals the
  plan was wrong, go back to the user, don't silently improvise.

## Phase 5 — Verify

Run in this order; do not present output to the user while a step is failing:

1. **Deterministic controls** — all L0/L1 `deterministic` controls. Run the built
   `checks/` scripts first — `checks/README.md` is the authority for the full set,
   each script's flags, and the static subset each does *not* cover. The three that
   catch the most:
   - `python3 checks/token-audit.py <path>...` — TOK-1..3, COL-1..2.
   - `python3 checks/a11y-static.py <path>...` — static subset of A11Y-2/3/8.
   - `python3 checks/contrast.py --tokens <globals.css> <path>...` — static subset of A11Y-1.
   Each reads line-local code only: traversal order, computed hit-area, ARIA-state,
   inherited/computed backgrounds, and font-size classification all stay in the manual
   pass. Everything without a script: verify by hand against the control's detail file
   and label it "verified manually" (see "What actually runs today" above).
   For the manual accessibility pass, work through the catalog's A11Y controls in id
   order — they mirror the GovTech checklist's Essential tier
   (a11y.tech.gov.sg/checklist), which addresses ~96% of common web accessibility
   errors. L0 failure blocks everything; L1 failure sends you back to Phase 4.
2. **Render and screenshot.** Evidence sets, all that apply required:
   - **Width evidence**: the primary state at 360/768/1280.
   - **State evidence**: one frame per state asserted by each in-scope hybrid
     control — *including loading*, the state most often coded-but-unphotographed
     (it slipped through both pilot runs before this rule existed). Use the
     demo-only hooks built in Phase 4.
   - **Journey evidence** (flows and multi-step interactions): traverse the happy
     path end-to-end, one frame per step, **plus one recovery path** from the Phase
     3 flow map actually walked — e.g. abandon at step 2 and return, or fail
     mid-flow and resume. Per-step screenshots that never demonstrate a traversal
     are page evidence, not flow evidence.
   Check each frame's *actual* rendered viewport before naming it — a screenshot
   named `768-*.png` taken at a stale viewport is mislabeled evidence.
   Capture mechanism: **use Claude-in-Chrome by default, or the user's installed
   browser agent of choice**. If the agent-browser daemon misbehaves (it has
   intermittently returned "os error 35"), a local Playwright script is the
   proven fallback. If capture still keeps failing after a reasonable retry,
   **ask the user to provide the screenshot** — any source is fine; the evidence
   set is not optional, and unverified work is never presented as verified.
   - **Inventory checkoff**: walk the Phase-1 component inventory and tick each
     interactive control as operated — tab to it (focus visible per A11Y-2),
     activate by keyboard, confirm role + accessible name + state (A11Y-8/A11Y-3).
     Run `checks/a11y-static` (if built) as the static pre-pass, then operate what
     a static scan can't see. An un-operated control is uncovered, not clean.
   - **Dark mode: supported?** Before grading anything as dark-safe, establish
     whether the product actually supports dark mode: is there a visible theme
     toggle, and does a `.dark` (or `[data-theme="dark"]`) layer re-render the
     tokens? If **not**, record dark-mode checks as **N/A — product has no dark mode**
     in the decision record — this is a truthful outcome, never a pass.
     If **yes**, capture one dark frame using the capture convention above (an
     init-script that sets `.dark` / the theme attribute *before* load, or the
     app's own toggle); a token-resolution argument alone is not evidence that
     the mode renders.
3. **Evaluator review** — spawn the `tfx-design-evaluator` subagent (a genuinely separate
   agent — do not write the verdict yourself) with: the sprint contract, the approved
   plan, the screenshots, the component inventory from Phase 1, the judgment/hybrid
   controls in scope, **and the absolute path to the harness's `standards/` directory**
   (the evaluator cannot resolve it from the product cwd). **If you cannot spawn subagents** (you are yourself a
   subagent, or running unattended), stop at this step and report — the proven
   pattern is *orchestrator dispatch*: whoever orchestrates you spawns the evaluator
   and routes its verdict back to you. Never write the verdict yourself, and never
   present unverified work as verified while waiting.
   **Paste the full verdict verbatim into the decision record** — the record is the
   durable artifact; a summary in its place is a defect ("full text in the session
   log" does not survive the session). You never grade your own design work. Note
   the shared limit honestly: the evaluator runs the same model on the same
   standards, so it is a second read, not a fully independent one — treat split
   findings and any control you could not mechanically verify as candidates for
   human review.
4. Address findings; re-run from step 1 after changes.

## Phase 6 — Ratchet

After the user accepts the result, finish the decision record started in Phase 3
(`docs/decisions/<page>.md`): chosen option, rejected options and why, waivers granted
and by whom, and the verify verdict. Then:

- Any failure the evaluator or user caught that no control covered → propose a new
  control or anti-pattern entry for `standards/`. Follow the "Growing the catalog"
  section of the `tfx-design-standards` skill — it is the single authoritative description
  of the proposal format.
- Harness friction the run surfaced that is **not** a control gap — a confusing step, a
  missing/unbuilt check, a process or onboarding nit — is filed as a **GitHub issue**
  (the system of record), per `docs/harness-feedback.md`: title `[harness-feedback]
  <summary>`, one severity + one or more category labels, dedup first. Do not append to a
  markdown feedback log.
