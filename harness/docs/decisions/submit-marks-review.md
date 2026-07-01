# Design decision record — Submit marks for review (harness self-run)

> Self-validation dogfood run of `tfx-design-ui` after the writing-great-skills edits.
> Confirms the loop, the built checks, the disclosed craft file, and the evaluator all
> work against the improved dev-repo skills.

- **Date:** 2026-07-01
- **Product:** TW
- **Change type:** new page
- **Page type:** form
- **Run type:** unattended (operator-proxy approvals)
- **The teacher and the moment:** Ms. Lim, P5 Mathematics, submitting a class's marks for HOD review the week before reports are due.

## Sprint contract (done-criteria)

1. One clear primary action (CMP-5).
2. The destructive "Discard draft" shows its consequence and is reversible before it runs (CMP-2, L0).
3. Submit has designed loading/success/error states, each announced (CMP-3, A11Y-11).
4. Counts hold still, do not jitter (TYP-5 tabular figures).
5. No AI-slop aesthetic (SLP-1..8).

## Chosen approach

Option A — a single inline card. Eyebrow → h1 → lead → progress summary (tabular counts)
→ optional reviewer note → action row (Submit / Keep editing / Discard) → inline discard
confirm → polite live-region status. Native `<button>`/`<textarea>`. Craft applied from
`implement-craft.md`.

## Rejected options

- **Option B — modal confirm** — SLP-10 (submit is a multi-part task, not a single
  decision) and a modal hides the counts the teacher is deciding on.
- **Option C — separate confirmation page** — extra navigation for a one-screen decision;
  loses the in-context counts.

## Tradeoffs, named

The inline discard confirm costs vertical space versus a modal; accepted because keeping
the counts visible during the decision matters more than compactness. Known limitation
carried forward from verify: the Submit trigger is not disabled during the loading state
(double-submit risk) — see Ratchet.

## Controls in scope

A11Y-1, A11Y-2, A11Y-3, A11Y-4, A11Y-5, A11Y-6, A11Y-7, A11Y-8, A11Y-9, A11Y-10, A11Y-11;
CMP-1, CMP-2, CMP-3, CMP-5, CMP-7; TOK-1, TOK-2, TOK-3; TYP-1, TYP-2, TYP-3, TYP-4, TYP-5;
COL-1, COL-2; SLP-1..11; MOT-1; CNT-1, CNT-3; LAY-2, LAY-3, LAY-4, LAY-5, LAY-6.

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| | | | | inline `tfx-waive` / this record |

None. No L0/L1 control required a waiver.

## Plan approval

- **Approved by:** approved by operator proxy — unattended run
- **Approved on:** 2026-07-01

## Verify verdict

- **Screenshots:** `docs/loop-run/screenshots/submit-marks/` — width evidence
  `1280-idle.png`, `768-idle.png`, `360-idle.png`; destructive-confirm state
  `768-discard-confirm.png`. Transient submit states (loading/success/error) are
  code-verified by the evaluator (setState + live region); their visual frames were not
  captured — agent-browser degraded (repeated hangs, the documented daemon flakiness)
  after the first successful batch. Not presented as visually verified.
- **Token block line range:** `submit-marks-review.html:11-69` (the `tfx-tokens` region
  exempt from token-audit).
- **Dark mode:** N/A — product has no dark mode (no `.dark` layer, no toggle).
- **Verification ledger** (from the evaluator, one row per in-scope control):

  | Control | Method | Evidence |
  |---------|--------|----------|
  | TOK-1 | script | `checks/token-audit.py` clean (exit 0) |
  | TOK-2 | script | `checks/token-audit.py` clean (exit 0) |
  | TOK-3 | script | token-audit clean (on-scale, concentric); peer-radius judged manually — single card, no conflict |
  | COL-1 | script | token-audit clean; primary + progress fill resolve to `--color-brand-600` #0064FF (TW primary); no other-product primary present |
  | COL-2 | script | token-audit clean; functional colours from Radix scales; computed success/danger text on tints ≥4.73:1 (manual) |
  | A11Y-1 | script | `checks/contrast.py --tokens` clean (exit 0); manually computed static fg/bg pairs — lowest 4.55:1, primary white-on-#0064FF 4.92:1, all ≥AA |
  | A11Y-2 | script | `checks/a11y-static.py` clean; `:focus-visible` 2px offset ring on every native control (manual) |
  | A11Y-3 | script | a11y-static clean; textarea has associated visible `<label for>`; buttons have visible text names (manual) |
  | A11Y-5 | manual | `@media (prefers-reduced-motion: reduce)` disables all transition/animation + press transform |
  | A11Y-6 | manual | decorative spinner/fill `aria-hidden`; progress track `role="img" aria-label`; count has visually-hidden full-text alternative |
  | A11Y-7 | manual | one `<h1>`, `<main>`, `<section aria-labelledby>`, real `<label>` — semantic structure |
  | A11Y-8 | manual | `aria-expanded` on discard trigger flips in lockstep with `hidden`; native names elsewhere |
  | A11Y-9 | manual | `<html lang="en">` + descriptive `<title>` |
  | A11Y-10 | manual | single `<main>` landmark, no repeated chrome |
  | A11Y-11 | manual | transient status `role="status" aria-live="polite"`, no focus steal; Cancel restores focus to trigger |
  | A11Y-4 | unverified | hit-area needs computed layout; buttons declare `min-height:44px` — confirm rendered targets incl. demo dashed buttons |
  | TYP-1 | script | type-scan clean for families; only Inter + PJS (approved weights). Delivery via CDN not Fontsource — advisory |
  | TYP-2 | script | during verify: type-scan exit 1 line 128 (h1 heading line-height) — false positive (TYP-2 is body-scoped); the check was then fixed to exclude headings and now passes clean |
  | TYP-3 | script | type-scan reports no off-scale sizes |
  | TYP-4 | script | type-scan clean — no all-caps / uppercase transform |
  | TYP-5 | manual | `font-variant-numeric: tabular-nums` on `.summary__count` and `.summary__hint` |
  | CMP-1 | manual | asserted, no manifest — Teacher Workspace; general Base UI/shadcn knowledge + artifact read; all native, confirm is composition |
  | CMP-2 | manual | consequence copy names object + consequence + reversibility; explicit Discard/Cancel confirm before run |
  | CMP-3 | manual | three states reachable via demo toggle; loading scoped; caveat: submit not disabled during load |
  | CMP-5 | manual | one filled primary; secondary outline; destructive distinct danger variant; one primary per region |
  | CMP-7 | manual | no contrast/shape-breaking default override; demo group shares resting affordance; single artifact |
  | CNT-1 | script | content-lint clean; error copy states what happened + next step, no raw code |
  | CNT-3 | script | content-lint clean; second person, active voice, purpose-first, ≤25 words |
  | MOT-1 | manual | durations 100-200ms, standard easing, property-scoped (no `transition: all`); entrance 200ms ease-out |
  | SLP-1..3 | manual | no purple/violet/cyan/glow; no gradient text; no thick side-tab border |
  | SLP-4 | manual | no nested content cards (confirm is a tinted alert panel, not a card-in-card) |
  | SLP-6/7 | manual | real type ratio (24px h1 vs 14px lead); varied spacing rhythm |
  | SLP-8 | manual | press feedback `scale(0.97)`, no bounce/elastic |
  | SLP-9 | script | content-lint clean; no structural AI tells; helper text non-redundant (manual) |
  | SLP-10 | manual | inline confirm, single decision — not a modal |
  | SLP-11 | manual | one card = the focused task unit; no static content boxed decoratively |
  | LAY-2 | unverified | 320px reflow needs a rendered viewport; single-column fluid — 360 frame captured, confirm 320 has no horizontal scroll |
  | LAY-3 | manual | matches form / flow-step template |
  | LAY-4 | manual | prose bounded by `max-width:480px`, measure well under 80ch |
  | LAY-5 | manual | density fits a single-decision card |
  | LAY-6 | unverified | edge/optical alignment needs the 1280 frame; no misalignment inferable from source |

- **Evaluator verdict:** the full `tfx-design-evaluator` verdict, verbatim:

VERDICT: pass-with-findings

BLOCKING (must fix before ship):
- None. No L0 or L1 in-scope control is violated with no waiver on file. The one deterministic finding surfaced (type-scan line 128) is a static false-positive, not a real TYP-2 violation.

ADVISORY (should fix):
- Fonts loaded from Google Fonts CDN, not Fontsource (project constraint / self-containment). Lines 7-9 use `<link>` to `fonts.googleapis.com`/`fonts.gstatic.com`. The project CLAUDE.md is explicit: "Fonts: … via Fontsource." Not a TYP-1 failure (the two typefaces and weights are approved), but a delivery-mechanism deviation and a privacy/offline concern. A real page in this repo must use the Fontsource imports.
- Submit button is not disabled during the loading state (`setState('loading')`). CMP-3's loading state exists and is announced, but the trigger stays enabled, so a teacher can double-submit. Consider disabling `#submit-btn` while loading.
- The confirmed-discard action is not wired (`#discard-confirm-btn` has no handler). Acceptable for a state-demo artifact, but the destructive path's own async states (CMP-3) and post-discard announcement (A11Y-11) are unverifiable here — a human must confirm the real implementation gives "Discard draft" its own states + announcement.

QUALITY GRADES:
- Design quality — strong. Clear single-column hierarchy; real type ratio; spacing rhythm (SLP-6/7 pass); carries Kind Utility (the "submit now and add them later" hint removes fear).
- Originality — strong (appropriately boring). No unwarranted novelty; native controls; the inline discard confirm is a deliberate, plan-recorded choice. No SLP tells.
- Craft — strong. Tabular-nums (TYP-5), layered single-direction shadow, property-scoped transitions (never `all`), press feedback `scale(0.97)` (not a bounce), ease-out entrance, complete `prefers-reduced-motion` reset. States designed with a scoped spinner.
- Functionality — acceptable. Happy path completes and is announced; discard reversible before it runs (Cancel restores focus). Held back by the two robustness gaps and the un-rendered-viewport items a human must confirm.
- Dark mode: N/A — product has no dark mode.

JUDGMENT CONTROL NOTES:
- CMP-2 (L0) pass — consequence shown before run; names object, consequence, reversibility; explicit Discard/Cancel.
- CMP-3 (L1) pass — three states present and reachable; loading contextual. Caveat: submit stays enabled during loading (advisory).
- CMP-5 (L2) pass — one filled primary; secondary outline; destructive distinct danger variant; one primary per region.
- CMP-1 (L1) pass — CMP-1: asserted, no manifest — manifest absent for Teacher Workspace. Evidence: general Base UI/shadcn knowledge + artifact read; all native, confirm is composition.
- CMP-7 (L2) pass — no default overridden in a contrast/shape-breaking way; demo group shares resting affordance.
- A11Y-8 (L1) pass — `aria-expanded`/`aria-controls` on discard trigger flip in lockstep with `hidden`.
- A11Y-11 (L1) pass — transient status `role="status" aria-live="polite"`, no focus steal, no double-announce; Cancel returns focus to trigger.
- CNT-1 (L1) pass — error copy states what happened + what to do; no raw code as primary.
- CNT-3 (L2) pass — second person, active voice, purpose-first; longest sentence ~22 words.
- SLP-9 (L2) pass — no buzzwords/em-dash chains/artifacts/structural tells; helper adds real info.
- SLP-10 (L1) pass — single-decision inline confirm, not a modal.
- SLP-11 (L2) pass — one card is the focused task unit; demo block deliberately not card-styled.
- TYP-5 (L2) pass — both counts carry `tabular-nums`.
- TOK-3 (L2 peer-radius) pass — all radii on-scale; card 12px with nested 8/4px is concentric; note a real TW page should anchor to the product Card radius (8px).
- LAY-2 (L1) pass-with-caveat — single-column fluid; reflow at 320 not rendered — confirm no horizontal scroll.
- LAY-3 (L2) pass — maps to form/flow-step template.
- LAY-4 (L2) pass — prose under 80ch.
- LAY-5 (L2) pass — density fits a single-decision card.
- LAY-6 (L2) pass-with-caveat — shared left edge from source; confirm visually at 1280.

UNCOVERED (defects no in-scope control covers — feed the ratchet):
- No control governs font delivery mechanism. TYP-1 governs which typefaces + weights, not how they load. This artifact loads the approved families from the Google Fonts CDN, contradicting the repo's "via Fontsource" stack (offline/privacy). Consider a TYP/IDN clause on asset delivery.
- No control asserts a mutating action is guarded against double-submit. CMP-3 requires the states exist and communicate; it does not require the trigger to lock during the pending state. Candidate ratchet: "async triggers lock during their pending state."

Calibration: core contract met — one primary (CMP-5), reversible destructive confirm with consequence before it runs (CMP-2, L0), designed + announced async states (CMP-3/A11Y-11), tabular counts (TYP-5), no slop. The single deterministic failure is a confirmed static false-positive. Remaining items are advisories and three un-renderable checks (320px reflow, computed hit-area, 1280 alignment) that a human must confirm.

## Ratchet

Two control-proposal candidates from the evaluator's UNCOVERED section, both
`[proposed — pending design-lead approval]`:

1. **Asset-delivery clause** — a TYP/IDN control that fonts (and other assets) load from
   the sanctioned mechanism (Fontsource / self-contained), not a third-party CDN. TYP-1
   covers *which* typefaces, not *how* they load.
2. **Async-trigger lock** — a CMP-3 extension: a mutating action's trigger disables/locks
   during its pending state, so it cannot be double-fired.

Harness-friction findings from this run (filed as GitHub issues per `docs/harness-feedback.md`,
not control proposals):

- **type-scan TYP-2 false-positive on heading line-height — FIXED.** `checks/type-scan.py`
  applied the body line-height band (1.5-1.6) to any unitless `line-height`, including
  headings (`h1..h6`), producing an L1 `exit 1` on correct heading typography. TYP-2 is
  scoped to body copy per its catalog `fails_when` and detail file. Fix applied: the
  scanner now tracks CSS selector context and heading elements, and excludes h1–h6
  line-heights from the band (self-test 27→34 cases; also cleared 2 pre-existing
  false-positives in the website, zero regressions). The artifact now passes type-scan.
- **Installed plugin cache is stale.** `~/.claude-work/plugins/cache/tfx/tfx-design-harness/0.1.1`
  is behind the dev repo (older skill text, no `implement-craft.md`, older catalog). The
  improvements do not take effect via `/tfx-design-ui` until the plugin is republished /
  reinstalled (version bump).
