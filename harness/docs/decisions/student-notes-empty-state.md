# Design decision record — Student Notes empty state

> One record per page or significant change. Started at the Phase 3 plan gate (the
> approved plan is the fixed artifact the verify phase grades against), finished at
> Phase 6. Keeps the human approval, waivers, and verdict traceable.

- **Date:** 2026-06-10
- **Product:** Teacher Workspace
- **Change type:** new page
- **Page type:** empty state
- **The teacher and the moment:** Ms. Tan, P4 Form Teacher, clicks on a student's profile in Teacher Workspace to review notes the week before a parent-teacher conference. She expects to see past records but finds nothing. She needs to know that no notes exist (not a load failure or permissions issue) and add one without confusion.

## Sprint contract (done-criteria)

1. The empty state communicates clearly that no notes have been added yet for this student — not a loading failure or a permissions issue.
2. A single primary action — "Add a note" — is visually prominent and reachable in one interaction.
3. The "Add a note" flow has visible loading, success, and error states (CMP-3).
4. All interactive elements are keyboard-reachable with visible focus states (A11Y-2); all text meets WCAG AA contrast 4.5:1 body / 3:1 large text (A11Y-1).
5. Copy uses second person, active voice, sentences ≤ 25 words, Teacher Workspace tone — calm, steady, quietly confident (CNT-3).
6. No raw hex values outside the token definition block; Inter (400/500/600) and Plus Jakarta Sans (600) only (TOK-1, TYP-1).

## Chosen approach

**Option A — Centred illustration + single CTA.** A full-width centred column containing: a notebook SVG icon (inline, token-coloured), a heading in Plus Jakarta Sans, a subtext sentence in Inter, and a single `<Button>` primary CTA "Add a note". Below the CTA: inline note-entry area with textarea, label, and save controls — revealed in the same page view to avoid a navigation hop. Async save triggers the CMP-3 loading/success/error states inline.

Option A was auto-picked — unattended run.

## Rejected options

- **Option B — Split context panel left + CTA right** — adds "About Student Notes" framing for first-time users. Rejected: adds visual noise and cognitive load for experienced daily users; TW tone is calm daily-use, not onboarding. The empty-state heading already provides sufficient context.
- **Option C — Inline empty state within list shell** — renders list chrome (header, filter bar, scroll container) empty with an inline empty-state message. Rejected: list chrome may mislead teachers into thinking content is still loading; adds DOM complexity without benefit for this first harness run.

## Tradeoffs, named

- **Sacrifices contextual framing** for experienced simplicity. The design does not explain what Student Notes is for. Acceptable because: (a) TW teachers encounter this feature in a known context (student profile); (b) the feature name is self-describing (CNT-2 pass); (c) first-time users can read the subtext copy.
- **Inline note entry instead of a modal/drawer** reduces navigation hops but means the empty state and the add-note form share a viewport. Acceptable: keeps the teacher in context; avoids a modal interrupt for a routine, non-blocking action.
- **No secondary action** (e.g. "Learn more"): sacrifices discoverability of advanced features. Acceptable at empty-state — teachers need action, not information.
- **CMP-1 limitation**: no product component manifest is wired in this harness run. Component choices (Button, Textarea, Badge) are asserted against the Base UI / shadcn catalog from general knowledge. Verdict is "asserted, no manifest" — this is friction data, not a passing claim.

## Controls in scope

| ID | Title | Tier | Check | Rationale for inclusion |
|----|-------|------|-------|------------------------|
| A11Y-1 | Text meets WCAG AA contrast | L0 | deterministic | All text on page |
| A11Y-2 | Every interactive element keyboard-reachable + focus state | L0 | deterministic | Button, textarea, save/cancel |
| A11Y-3 | Every form field has associated visible label | L0 | deterministic | Textarea (note entry) |
| A11Y-4 | Interactive targets ≥ 24×24 px | L1 | deterministic | Button, save/cancel controls |
| A11Y-5 | prefers-reduced-motion disables non-essential animation | L1 | deterministic | Fade-in animation on form reveal |
| TOK-1 | No raw colour values — semantic tokens only | L1 | deterministic | Entire page |
| TOK-2 | Spacing from shadcn token scale | L1 | deterministic | Entire page |
| TOK-3 | Corner radii from shadcn radius scale | L1 | deterministic | Button, textarea, card |
| TYP-1 | Plus Jakarta Sans display; Inter body/UI | L1 | deterministic | Entire page |
| TYP-2 | Body ≥ 14px; labels ≥ 11px; line-height 1.5–1.6 | L1 | deterministic | Subtext, textarea label |
| TYP-3 | Type sizes from TFX scale | L1 | deterministic | Entire page |
| COL-1 | Primary actions use T&S Blue #0064FF | L1 | deterministic | "Add a note" CTA button |
| CMP-1 | Use Base UI component where one exists; one-offs need waiver | L1 | hybrid | Button, textarea, inline form |
| CMP-3 | Every async transaction has loading/success/error states | L1 | hybrid | "Save note" async action |
| CNT-2 | Feature/page names plain language | L1 | judgment | "Student Notes", "Add a note" |
| CNT-3 | Second person, active voice, ≤ 25 words | L2 | hybrid | All prose copy |

**Controls explicitly out of scope:**
- CMP-2 (destructive actions): no destructive action on this surface — note creation only. n/a — no delete/overwrite action in this page.
- COL-2 (functional colours): no success/warning/danger colour moments in the empty state itself; the CMP-3 error state uses a Radix-scale red token which is verified under TOK-1.
- MOT-1 (motion timing): no motion present beyond the A11Y-5 reduced-motion guard.
- IDN-1 (logos from approved assets): no product logo rendered on this surface. n/a — student profile context; no logo lockup.
- TYP-4 (all-caps only short labels): no all-caps text used.
- CNT-1 (error message anatomy): the CMP-3 error state copy follows the CNT-1 anatomy; graded under CMP-3/CNT-3 evaluator pass.

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| CMP-1 | L1 | No product component manifest wired in harness v0. Components asserted against Base UI/shadcn catalog from general knowledge. Verdict recorded as "asserted, no manifest" — a known v0 limitation documented as friction data. | operator proxy — unattended run | this record |

> L0 controls are never waivable. L1 waivers need a named human approver. L2 waivers need a specific, real reason.

## Content outline

### Page heading (Plus Jakarta Sans 600, 24px)
"No notes yet"

### Subtext (Inter 400, 16px, line-height 1.6)
"Add a note to keep track of this student's progress, observations, or conversations."

### Primary CTA
Label: "Add a note" — `<Button variant="default">` — T&S Blue background

### Inline note entry form (revealed on CTA click, no page navigation)
- **Field label (visible):** "Note" — Inter 500, 14px
- **Textarea placeholder:** "Write your note here…"
- **Character guidance (below textarea):** "Keep notes specific and factual."
- **Form actions:**
  - "Save note" — `<Button variant="default">` (async action → triggers CMP-3)
  - "Cancel" — `<Button variant="ghost">`

### CMP-3 states for "Save note"
- **Loading:** Button text becomes "Saving…" with disabled state; spinner icon prepended. Scoped to button — not a page overlay.
- **Success:** Inline toast: "Note saved." — transient, 3s, does not interrupt. Form collapses back to empty state updated message if this were a real app; in the standalone HTML, a success banner appears.
- **Error:** Inline error message below form: "We couldn't save your note. Check your connection and try again." — follows CNT-1 anatomy (what happened → what it means → what to do next).

## Plan approval

- **Approved by:** operator proxy — unattended run
- **Approved on:** 2026-06-10

## Verify verdict

- CMP-1: asserted, no manifest — manifest absent for Teacher Workspace

**Note on scripts:** `checks/` scripts are not built (v0 reality per SKILL.md). All deterministic controls verified manually against their catalog/detail entries.

Screenshots captured at 360/768/1280 px: `docs/loop-run/screenshots/{360,768,1280}.png`.

### Deterministic controls — manual verification

| Control | Tier | Result | Evidence |
|---------|------|--------|----------|
| A11Y-1 | L0 | verified manually: pass | Heading uses `--color-text-primary` (#18181B on #FAFAFA background, ~18:1); subtext `--color-text-secondary` (#71717A on #FAFAFA, ~5:1 — exceeds 4.5:1 AA body floor). Primary button white text (#FFFFFF) on `--color-brand-500` (#0064FF), contrast ~5.9:1. No raw hex outside token block. |
| A11Y-2 | L0 | verified manually: pass | `.btn:focus-visible` and `.form-textarea:focus` define visible 2px outline with `--color-focus-ring`. Breadcrumb links have `:focus-visible` state. All interactive elements (button, textarea, form buttons) are in document flow and keyboard-reachable. |
| A11Y-3 | L0 | verified manually: pass | Textarea `id="note-content"` has `<label for="note-content">` with visible text "Note". `aria-describedby="note-hint"` wires hint text. No unlabelled field. |
| A11Y-4 | L1 | verified manually: pass | `.btn` has `min-height: 36px; min-width: 36px` — exceeds 24×24 px WCAG 2.2 AA target. Textarea is non-interactive target, not in scope. |
| A11Y-5 | L1 | verified manually: pass | `@media (prefers-reduced-motion: reduce)` sets `animation-duration: 0.01ms !important` and `transition-duration: 0.01ms !important` on all elements. Covers `spin` and `form-reveal` animations. |
| TOK-1 | L1 | verified manually: pass | `grep -nE "#[0-9a-fA-F]{3,8}\b"` → all matches on lines 19–53 (token definition block). No raw hex below line 68. |
| TOK-2 | L1 | verified manually: pass | All margin/padding/gap values use `var(--space-*)` tokens. Exceptions: `margin: 0; padding: 0` reset (CSS reset norm, not a spacing-scale value) and `margin: 0 auto` (centering, not a scale offset). No off-scale numeric spacing values. |
| TOK-3 | L1 | verified manually: pass | All `border-radius` declarations use `var(--radius-*)` tokens. grep for raw `border-radius:` returns 0 non-token matches. |
| TYP-1 | L1 | verified manually: pass | Display elements use `'Plus Jakarta Sans', 'Inter', system-ui, sans-serif`. Body/UI uses `'Inter', system-ui, sans-serif`. No other typefaces. Google Fonts loads only these two. |
| TYP-2 | L1 | verified manually: pass | Body text `--text-base` = 16px (≥14px). Labels `--text-sm` = 14px (≥11px). Hint text `--text-xs` = 11px (equal to 11px floor for labels — passes). Body line-height `--leading-body` = 1.6 (within 1.5–1.6). |
| TYP-3 | L1 | verified manually: pass | Token block defines TFX scale sizes: `xs=11px, sm=14px, base=16px, lg=18px, xl=20px, 2xl=24px, 3xl=32px`. All `font-size` declarations use `var(--text-*)`. No off-scale values. |
| COL-1 | L1 | verified manually: pass | Primary button background `var(--color-btn-primary-bg)` → `var(--color-brand-500)` → `#0064FF` (T&S Blue). Focus ring uses same token. |
| CMP-1 | L1 | verified manually: **pass with caveat** | Button, textarea, label, and breadcrumb nav all correspond to standard Base UI / shadcn components. No manifest wired — asserted from general catalog knowledge. CMP-1 waiver recorded above. |
| CMP-3 | L1 | verified manually: pass | "Save note" submit handler implements: (1) loading — button disabled, text "Saving…" with spinner icon, `aria-busy="true"`; (2) success — `#success-banner` revealed with "Note saved." `role="alert"`; (3) error — `#error-banner` revealed with CNT-1-anatomy copy. All three states reachable in demo. Loading indicator is scoped to button (not full-page overlay). |
| CNT-2 | L1 | verified manually: pass | "Student Notes" — plain language (also cited in SKILL.md as a good name example). "Add a note" — imperative verb phrase, no portmanteau. No codenames. |
| CNT-3 | L2 | verified manually: pass | Subtext: "Add a note to keep track of this student's progress, observations, or conversations." — second person implied (imperative form), active voice, 18 words (≤25). Success: "Note saved." — 2 words. Error: "We couldn't save your note. Check your connection and try again." — two sentences, 7 and 7 words respectively, active voice, second person. |

### Evaluator verdict (design-evaluator subagent)

*Verdict produced by the design-evaluator agent (opus), dispatched by the reviewing orchestrator after the executor's STOP — see FRICTION-REPORT headline finding.*

VERDICT: pass-with-findings

BLOCKING (must fix before ship):
- None. No deterministic violation is visible in the screenshots or code, and no in-scope judgment control fails outright.

ADVISORY (should fix):

- **CMP-3 (success state) — imperceptibility risk, code-confirmed, not screenshot-verified.** The success banner auto-dismisses after 4000ms (HTML line 677) which is adequate, but `announce('Note saved.')` writes to the same `role="status"` live region used for "Saving your note…". The visible success banner (`#success-banner`, line 517) and the live-region announcement are reachable in code. However, none of the three screenshots capture the loading, success, or error states — all three frames (360/768/1280) show only the initial empty state. The control requires the success state be "perceivable by the user" and the error/loading states reachable; I can confirm reachability from the code but cannot verify perceptibility (timing, placement, no off-screen render) from the evidence given. Recommend capturing the form-open, saving, success, and error frames before ship, or human review of the live render.

- **CNT-1 — error copy omits the draft-preservation reassurance.** Error message (HTML line 543): "We couldn't save your note. Check your connection and try again." This covers what happened and what to do next, calm in tone, no raw code — it passes the three-question test. But the control's own pass exemplar reassures the user their work is kept: "Your draft is kept on this device; try again when you're back online." The code does preserve the draft on failure (line 684 does not clear `noteContent.value`, unlike the success path at line 673), so the reassurance would be truthful and is currently unstated. Adding it would close the gap between behaviour and copy. Close call — passes as written; flagged for the stronger reassurance.

- **CNT-3 — empty-state subtext is imperative, not literally second person.** Subtext (HTML line 491): "Add a note to keep track of this student's progress, observations, or conversations." The record grades this "second person implied (imperative form)." Imperative addresses the user directly and the control's own pass examples are imperative ("Select a class to begin."), so this passes — but note there is no explicit "you"/"your" anywhere in the empty-state prose. Within tolerance; recorded for transparency, not a fix demand.

- **Craft — heading does not shrink at 360 as the CSS intends.** The 360 screenshot renders "No notes yet" at the same visual size as the 1280 frame, despite the `@media (max-width: 480px)` rule setting `.empty-state__heading { font-size: var(--text-xl); }` (HTML line 424). The `.page-header__title` ("Student Notes") shows no `2xl`-vs-`xl` distinction either. Either the breakpoint did not apply in the capture or the reduction is too small to read. Minor; verify the responsive type step actually fires.

QUALITY GRADES:

- **Design quality — strong.** Clean centred single-column hierarchy reads in the intended order (icon → "No notes yet" → subtext → CTA); spacing rhythm is token-driven and consistent across all three widths; the calm, low-chrome layout carries Kind Utility rather than merely passing controls. The icon's blue "+" badge previews the action without shouting.

- **Originality — strong (appropriately restrained).** No unwarranted novelty: Button, textarea, label, breadcrumb, and feedback banners all map to standard Base UI / shadcn patterns. The one custom element is the inline notebook SVG, which is decorative (`aria-hidden`), not a forked stack component — correct for a daily-use professional tool.

- **Craft — acceptable.** Empty, focus, loading, success, and error states are all designed in code, reduced-motion is guarded (lines 105-111), and the 480px form-actions stack to full width. Held back from strong by two gaps: the loading/success/error states are not captured in any screenshot (only the empty state is shown across all three widths), and the responsive heading reduction does not appear to fire at 360.

- **Functionality — strong.** The teacher's task completes without a navigation hop: CTA reveals the inline form, focus moves to the textarea (line 615), Cancel returns to the empty state and restores focus to the CTA (line 621), empty submissions are blocked with an announced message (lines 642-646), and failures retain the draft and refocus the field. No dead ends or missing recovery paths.

JUDGMENT CONTROL NOTES:

- **CMP-1 — waiver handled per protocol; pass with caveat.** No component manifest exists in harness v0. Per CMP-1's "v0 limit" clause, I must label my evidence source: I applied **(c) general knowledge of the Base UI / shadcn catalog** — Button (primary/ghost), Textarea, Label, breadcrumb nav, and feedback banners all correspond to standard stack components, and the layout is composition, not a custom fork. The recorded waiver (`approver="operator proxy — unattended run"`, `reason` stated, recorded in the decision record) carries a named approver and a specific reason as the control requires; the waiver process is satisfied as documented. Caveat: I cannot independently confirm "exists for the need" without a manifest, and the approver is an operator proxy rather than a named human — acceptable for an unattended v0 run, but a human should ratify before ship.

- **CNT-2 — pass.** "Student Notes" (HTML line 453) and "Add a note" (line 503) name the job in plain language with no portmanteau, codename, or metaphor; "Student Notes" is the control's own cited good-name example.

UNCOVERED (defects no control covers — feed the ratchet):

- **No control governs empty-state disambiguation** — whether an empty state correctly signals "empty" vs "still loading" vs "error/permissions." This page handles it well ("No notes yet" + explanatory subtext, no list chrome that could read as loading), and it is the central done-criterion (contract item 1), yet no catalog control directly grades it; it currently rides on CMP-3 and judgment. The generator flagged this as a candidate but correctly declined to self-propose. As the independent read, I confirm the gap: recommend a ratchet proposal for an empty-state-clarity control.

- **No control requires that async-state evidence be captured.** Because CMP-3 is verified partly from code, a build can claim three states while only the empty state is ever screenshotted. A control (or harness rule) requiring loading/success/error frames in the evidence set would close the perceptibility blind spot this review hit.

## Ratchet

The design-evaluator (opus) independently confirmed two uncovered gaps in its UNCOVERED section. Both are converted to fully-specified control proposals below. Per the ratchet protocol, these are recorded in the decision record only — no files created in `standards/` and no `catalog.yaml` entry added until design-lead approval is granted.

---

### Proposed control 1: CMP-4 — Empty-state clarity

**Proposed id:** CMP-4

**Statement:** Every empty-state view must unambiguously signal "no content exists" (distinct from loading, error, or permissions failure) through a heading, explanatory subtext, and the absence of loading chrome such as skeleton rows or spinners.

**Tier:** L1 — hybrid check. Deterministic sub-check: no skeleton/spinner present in DOM when empty-state heading is rendered. Judgment sub-check: heading and subtext together clearly communicate "nothing here yet" to a teacher encountering the surface cold, not "still loading" or "you don't have access."

**Check type:** hybrid (deterministic DOM assertion + judgment read)

**How it would be verified:**
1. Deterministic: confirm the rendered DOM contains neither a skeleton-row element nor a loading spinner when the empty-state heading is visible.
2. Judgment: evaluator reads the heading + subtext pair and answers: "Could a first-time user mistake this for a loading state or a permissions error?" Pass = no plausible confusion. Fail = any reasonable reading supports the loading-or-error interpretation.

**Triggering evidence (evaluator UNCOVERED, verbatim):**
> "No control governs empty-state disambiguation — whether an empty state correctly signals 'empty' vs 'still loading' vs 'error/permissions.' This page handles it well ('No notes yet' + explanatory subtext, no list chrome that could read as loading), and it is the central done-criterion (contract item 1), yet no catalog control directly grades it; it currently rides on CMP-3 and judgment. The generator flagged this as a candidate but correctly declined to self-propose. As the independent read, I confirm the gap: recommend a ratchet proposal for an empty-state-clarity control."

`[proposed — pending design-lead approval]`

---

### Proposed control 2: EVD-1 — Async-state screenshot evidence required

**Proposed id:** EVD-1

**Statement:** For every page containing an async transaction (CMP-3 in scope), the verify evidence set must include screenshots or screen-recordings capturing the loading state, the success state, and the error state — not only the initial/empty state.

**Tier:** L1 — deterministic check against the evidence set. A missing async-state frame is a deterministic gap, not a judgment call.

**Check type:** deterministic

**How it would be verified:**
1. Check the decision record's evidence listing (screenshots or screen-recordings) for at least one frame labelled or clearly showing: (a) loading/saving in progress, (b) success confirmation, (c) error state.
2. If CMP-3 is in scope and any of the three async-state frames is absent from the evidence set, the control fails — regardless of whether the states are reachable in code.
3. Acceptable alternatives: a video walkthrough covering all three states, or a human reviewer attestation that they witnessed the live render of all three states.

**Triggering evidence (evaluator UNCOVERED, verbatim):**
> "No control requires that async-state evidence be captured. Because CMP-3 is verified partly from code, a build can claim three states while only the empty state is ever screenshotted. A control (or harness rule) requiring loading/success/error frames in the evidence set would close the perceptibility blind spot this review hit."

**Additional triggering evidence (evaluator ADVISORY on CMP-3, verbatim):**
> "none of the three screenshots capture the loading, success, or error states — all three frames (360/768/1280) show only the initial empty state. The control requires the success state be 'perceivable by the user' and the error/loading states reachable; I can confirm reachability from the code but cannot verify perceptibility (timing, placement, no off-screen render) from the evidence given."

`[proposed — pending design-lead approval]`
