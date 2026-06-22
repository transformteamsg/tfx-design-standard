# Design decision record — self-audit (TFX-DS site v0.1 catalog re-audit)

> The site must pass its own standard. This record covers the compliance pass that
> brings the TFX-DS website into conformance with the catalog it publishes.

- **Date:** 2026-06-16
- **Product:** TW surface — the TFX Design Standard site itself (TW Blue anchor)
- **Change type:** modification (catalog re-audit + compliance fix)
- **Page type:** documentation site — chrome, content rendering, landing
- **Run type:** attended
- **The teacher and the moment:** indirect — the reader is a builder or agent trusting
  the standard. The site's own compliance *is* its credibility; a rulebook whose home
  fails its own checks will not be followed. The one test is met through that lens.

## Sprint contract (done-criteria)

1. `python3 harness/checks/token-audit.py app components lib` exits 0 (TOK-1, TOK-2, COL-2 clear).
2. No display text above weight 600, and no off-scale `text-[…px]`: every size resolves
   to {11,12,14,16,18,20,24,32,48,72} (TYP-1, TYP-3).
3. Filter chips expose `aria-pressed`; the doc sidebar is a `<nav>`; a skip link is the
   first focusable element (A11Y-7, A11Y-8, A11Y-10).
4. White-on-`--tw-blue` text verified ≥ 4.5:1 at render, or darkened until it is (A11Y-1, L0).
5. `prebuild` runs `token-audit` + `a11y-static`; the build fails on violation.
6. No layout, iconography, radius, motion, or copy changes beyond the above —
   established design is preserved.

## Chosen approach

A compliance pass on the existing site, no structural redesign. COL-2 resolved with
**semantic Radix-backed tokens** (`--success/--warning/--danger` at Radix steps 9/11,
with `-subtle` bg and `-muted` border derived via `color-mix`); neutral zinc UI fills
tokenised (`--muted/--accent/--border-strong`); the TW-blue hover darken moved to
`--tw-blue-hover` (removing the literal `black` from call sites); `.prose` raw hex
mapped to tokens (`--prose-body`, plus reuse of `--foreground`/`--background`). Type
sizes banded onto the published scale; all weights capped at 600. Landing hero kept
bold at 48/72; interior page `h1` → 32. A11Y: `aria-pressed` on filter chips, sidebar
`<aside>` → `<nav>`, skip link added. Built checks wired into `prebuild`.

## Rejected options

- **Keep-identical allowlist (COL-2)** — register the raw Tailwind palette names in
  `@theme` / a `token-audit.allow` so existing classes pass unchanged. Rejected: it
  satisfies the checker without honouring COL-2's intent (functional colour from Radix
  scales, through the semantic layer) and perpetuates palette-class usage. The chosen
  route's cost is a slight, accepted badge hue shift.
- **Snap landing hero down to 32/48** — rejected to preserve hero impact; the scale
  offers 72, so the bold option is on-scale.

## Tradeoffs, named

- Conforming to TYP-1/TYP-3 visibly changes the site's feel: headings lose their
  700/800 weight (now 600) and the fine 13–17px ramp collapses onto the scale.
  Accepted — a standards site must wear its own type rules; SLP-6 hierarchy is
  re-checked at verify.
- Badge hues shift Tailwind → Radix. Accepted as more COL-2-correct.
- `prebuild` now depends on `python3`. Safe here (local build → `vercel --prebuilt`
  deploy), but it couples the web build to the harness checks; noted to watch.
- Breadth: ~16 files change for type/weight alone. Mechanical, minimal, reversible per edit.

## Controls in scope

TOK-1, TOK-2, TOK-3 (already passing — held), COL-1 (preserved), COL-2, TYP-1, TYP-2,
TYP-3, A11Y-1, A11Y-2 (preserved), A11Y-7, A11Y-8, A11Y-10, SLP-6 (verify),
SLP-1..5/8 (preserved). Out of scope, noted: CNT-3 prose sentence-length (separate copy
pass), MOT-1 600ms landing reveal (L2, rationale already in code), A11Y-11 copy-button
transient announce (minor).

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|

None — this sprint removes violations rather than waiving them. No L0/L1/L2 waiver claimed.

## Plan approval

- **Approved by:** wondo.jeong@gt.tech.gov.sg (session operator, attended run)
- **Approved on:** 2026-06-16

## Verify verdict

- **Screenshots:** `harness/docs/decisions/self-audit-shots/` — `catalog-1280.png`,
  `catalog-360.png`, `catalog-320.png` (LAY-2 canonical 320 target), `docpage-1280.png`,
  `landing-1280.png`. (Landing's scroll-reveal sections render blank in the static
  capture — headless Chrome doesn't scroll to trigger `useInView`; verified as a capture
  artifact, not missing content.)
- **Token block line range:** `app/globals.css` `:root` block (token-definition exemption).
- **Dark mode:** N/A — the site has no dark mode (no theme toggle, no `.dark` layer).
- **Deterministic controls:** `pnpm build` passes with the prebuild gate wired
  (`check-standards.mjs` → `token-audit.py` → `a11y-static.py`, `&&`-chained). token-audit
  exits 0 (TOK-1..3, COL-1..2; was exit 1 / ~40 violations); a11y-static exits 0
  (A11Y-2/3/8 static subset); check-standards OK (40 controls). TYP-1..3, SLP-5/6,
  LAY-2/4, and contrast were verified manually (type-scan / contrast scripts not built).
- **A11Y-1 (L0) contrast:** computed with a WCAG calculator validated against the
  evaluator's own figures, then independently recomputed by the evaluator. Final ratios
  (11px badge text, 4.5:1 floor): white-on-`--tw-blue` 4.92; success 4.69; **warning
  6.12** (after darkening amber-11 → `#8a5300` and lightening subtle bgs to 8%); danger
  4.75. All PASS. (Original warning badge was 4.30 — fail — confirmed by both readings.)

### Verification ledger

*Compiled from the Deterministic-controls bullet, the A11Y-1 contrast bullet, and the
two evaluator verdicts above — no new evidence; each row restates what this record
already captured. `script` rows are the prebuild-gated checks (token-audit, a11y-static,
check-standards) that exited 0; `manual` rows are controls whose scripts are unbuilt
(contrast, type-scan) or that the evaluator judged.*

| Control | Method | Evidence |
|---------|--------|----------|
| TOK-1..3, COL-1..2 | script | `token-audit.py` exits 0 (was exit 1 / ~40 violations); prebuild-gated via `check-standards.mjs` |
| Catalog integrity | script | `check-standards.mjs` OK (40 controls) |
| A11Y-2, A11Y-3, A11Y-8 (static subset) | script | `a11y-static.py` exits 0; A11Y-2 also confirmed manually — explicit `focus-visible:outline-(--color-tw-blue)` added on chips, copy-ID button, and both sidebar disclosure buttons |
| A11Y-1 | manual | contrast computed (calculator + evaluator recompute, script unbuilt): white-on-`--tw-blue` 4.92; success 4.69; warning 6.12 (after amber-11 → `#8a5300`); danger 4.75 — all PASS; original warning 4.30 reproduced as the real fail |
| A11Y-7 | manual | topbar `<nav aria-label="Primary">` added (topbar.tsx:18); doc sidebar is a `<nav>` |
| A11Y-10 | manual | skip link is the first focusable element; main/nav landmarks present |
| TYP-1..3 | manual | type-scan script unbuilt — verified manually: weights capped at 600, sizes banded onto the published scale {11,12,14,16,18,20,24,32,48,72} |
| SLP-5, SLP-6 | manual | SLP-6 fix verified — overview.tsx three h3 now 16px over 14px body, page h2 20px sits 1.25× above; flat-hierarchy fail condition not met |
| LAY-2 | manual | `catalog-320.png` is a genuine 320px capture — single-column reflow, no horizontal scroll, reading order intact |
| LAY-4 | manual | body-text measure ≤ 80ch |
| COL-1, SLP-1..4, SLP-8 | manual | preserved — established T&S Blue / anti-slop posture unchanged by this compliance pass |

### Evaluator verdict 1 — full review (pasted verbatim)

VERDICT: pass-with-findings

BLOCKING: A11Y-1 (L0, contrast) — `--warning` `#ab6400` text on `--warning-subtle`
computes 4.296:1, below the 4.5:1 body floor for 11px badge text, in
app/standards/catalog/page.tsx:16, components/catalog-browser.tsx:9 (tierStyles.L1), and
components/doc-page.tsx:46. Cross-checked across OKLab/sRGB/linear (4.28–4.34 in every
model). A11Y-1 carries waiver:none — cannot be waived. Fix: darken the warning text or
drop the tint under it.

ADVISORY: SLP-6 (L2) overview.tsx:92–112 — "Three readers" h3 subheads and body both
text-[14px] (1.0×), separated only by weight; SLP-6 (L2) close call — primary ladder has
a 24→20 step at 1.2×; LAY-2 (L1) — 360 reflows cleanly but the canonical 320/400%-zoom
target is not documented; A11Y-7 (L1, minor) — topbar `<nav>` (topbar.tsx:18) has no
accessible name; A11Y-2 (L0) — chips/copy/sidebar buttons rely on the UA default focus
ring (met, but inconsistent with the explicit rings elsewhere).

QUALITY GRADES — Design quality: strong (hierarchy holds after the 600 weight drop;
size + spacing carry it). Originality: strong, appropriately restrained (hairline rows
not cards; per-topic ink glyphs; functional section inks — not slop). Craft: acceptable
(strong details — tabIndex on collapsed links, aria-hidden decves, reduced-motion,
token-layer hover; held back by the warning-badge contrast and uneven focus rings).
Functionality: strong. Dark mode: N/A — product has no dark mode.

TOK-1/2/3 pass; COL-1 pass; COL-2 pass-with-caveat (red-as-severity is borderline
functional-vs-decorative — close call, not a fail); TYP-1 pass; TYP-2 pass-with-caveat
(leading-relaxed 1.625 marginally over the 1.6 ceiling); TYP-3 pass; SLP-5 pass; SLP-6
fail (L2); LAY-2 pass-with-caveat (320 untested); LAY-4 pass; SLP-1/2/3/4/8, MOT-1,
A11Y-5 pass (preserved). UNCOVERED: none — process note: A11Y-1/TYP are load-bearing yet
"verified manually" because checks/contrast and checks/type-scan are unbuilt; the
warning-badge miss is exactly what an automated contrast check would have caught.

### Evaluator verdict 2 — re-verification of the fixes (pasted verbatim)

VERDICT: pass

BLOCKING: None. The prior A11Y-1 (L0, waiver:none) finding is CLEARED. Independently
resolved each `color-mix(in oklab, step-9 8%, #ffffff)` and computed WCAG contrast of
each step-11 text on its resolved subtle bg: SUCCESS `#2a7e3b` on ≈#f1f8f1 = 4.69:1 PASS;
WARNING `#8a5300` on ≈#fffbf2 = 6.12:1 PASS (the previously failing badge); DANGER
`#ce2c31` on ≈#fff1f0 = 4.75:1 PASS; panel white on `--tw-blue` = 4.92:1 PASS. Reproduced
the prior failure (old `#ab6400` on 16% subtle = 4.31:1 FAIL) to confirm it was real and
is fixed. Shipped values in app/globals.css match the claimed fix; not taken on trust.
Caveat for human authority: success/danger pass with thin margins (4.69/4.75) — any
future change to `--surface`, the mix %, or the step-9 anchors must re-run this check.

ADVISORY: code comment at globals.css line 36 understated the margin (addressed); TYP-2
leading 1.625 — recording a rationale is acceptable for this L1 control (not a hard fail).

Advisory fixes confirmed present: A11Y-7 — topbar.tsx:18 `<nav aria-label="Primary">`;
SLP-6 — overview.tsx three h3 now text-[16px] over text-[14px] body (page h2 20px sits
1.25× above), flat-hierarchy fail condition not met; A11Y-2 — explicit
`focus-visible:outline-(--color-tw-blue)` on catalog-browser Chip + copy-ID button and
both sidebar disclosure buttons; no focus-suppressed control on the route. LAY-2 —
catalog-320.png is a genuine 320px capture: single-column reflow, no horizontal scroll,
reading order intact; the 320 gap is closed. QUALITY GRADES (touched surfaces only):
Design quality acceptable; Craft strong on the items touched; Functionality N/A; Dark
mode N/A. UNCOVERED: none.

> Post-verdict: the TYP-2 `leading-relaxed` (1.625) was subsequently **fixed** (not
> waived) — all 8 files snapped to `leading-[1.6]`, inside the 1.5–1.6 band — so no L1
> waiver is outstanding. The globals.css line-36 comment was corrected. A final
> `pnpm build` passed with the prebuild gate enforcing the checks.

## Ratchet

**Proposal [proposed — pending design-lead approval]: build `checks/contrast` (A11Y-1)
and `checks/type-scan` (TYP-1..3) next, and add them to the implement-phase hook.** This
sprint's one blocking finding (warning badge at 4.30:1) and the whole TYP fix were
"verified manually" only because those scripts are unbuilt — the contrast miss is exactly
a sub-threshold error an automated check catches at implement time, before review. The
token-audit precedent shows the pattern works; contrast is the highest-value next script
because A11Y-1 is L0 and amber/yellow functional colours are a recurring low-contrast
trap. No new control or anti-pattern is proposed — the catalog covered every finding
(A11Y-1, SLP-6, TYP-2); the gap was enforcement tooling, not coverage.
