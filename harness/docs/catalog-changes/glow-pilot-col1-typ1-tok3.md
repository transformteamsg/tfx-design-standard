# Catalog changes: COL-1 re-tag + Glow primary, TYP-1 wordmark exception, TOK-3 coverage caveat

**Date:** 2026-07-01 · **Change type:** re-tag + content amendments to existing controls
(no new control ids, no tier changes) · **Approved by:** design lead, interactively in
session 2026-07-01 — approved the four amendments below and the Glow-primary settle.

This record lives in `docs/catalog-changes/` (not `docs/decisions/`) for the same reason
as `component-default-consistency.md` and `slp-9-ai-writing-tells.md`: it is
feedback-driven catalog maintenance surfaced by a loop run, not a fresh loop run. The
triggering evidence is the **whole-app TFX conformance audit of the Glow pilot**
(2026-07-01) — the pilot's stated purpose was to test whether the standard governs a
whole teacher-facing product well.

## Triggering evidence

The Glow pilot audit produced a §5 "feedback on the standard" section. Reconciling its
claims against the **actual** dev catalog (48 controls) corrected several:

- The audit's flagship claim — that CMP-5/6/7 and TYP-5 are "phantom controls, ratify
  or scope out" — was **false**. All four already exist in the dev catalog (ratified
  2026-06-17 / 06-25) and precisely cover the auditors' observations. The synthesis had
  reasoned against a **stale 40-control copy** of the catalog (the installed plugin),
  not the 48-control dev repo. No controls were created here.
- The genuinely valid items became the four amendments below.

## The changes

### 1. COL-1 re-tagged `deterministic` → `hybrid` (was mistagged)

`col-1.md` already documented a "Deterministic half / Judgment half" split, but the
catalog tagged the control `deterministic` — so the harness read it as mechanically
covered when it is not. The mechanical half (colour resolves to *a* product token)
passes trivially; the real pilot failure was **a legitimately-tokenised neutral variant
sitting where the brand primary belongs** — pure judgment, invisible to the gate. The
verify line now names the judgment half and dovetails it with **CMP-5** (one primary
action per view): the evaluator confirms the view's single primary action resolves to
the product primary.

### 2. Glow primary confirmed at Radix orange-9 `#F76B15`; foreground-pairing rule added

The per-product table listed Glow as `#F76B15 (proposed)`. Confirmed by the design lead
this session, `(proposed)` dropped. Crucially, the pilot exposed that **white label text
on `#F76B15` is 2.97:1 — it fails A11Y-1** (the shipped Glow app used a darker
`#c2410c`, which passes on white). COL-1 gave no foreground guidance, so a mechanical
"make it brand" would ship an inaccessible control. Added:

- **Foreground pairing:** a light-hue primary (orange/amber/lime/yellow) takes the
  scale's **dark** contrast step (Radix "contrast" / step-12), not white — the Radix
  convention. New `fails_when`: a light-hue primary paired with white text that fails AA.
- **Same-hue collision:** applying COL-1 can *create* an A11Y-1 failure (orange primary
  on an orange field). The container must change (neutral card) or the action stays
  neutral, recorded — re-check the 3:1 UI-component boundary before recolouring.

### 3. TYP-1 settled-brand-wordmark exception (new detail file `typ-1.md`)

TYP-1 ("no other typefaces") flagged Glow's deliberate `--font-logo: Inria Sans`
wordmark as a hard L1 violation with no registered exception — unlike COL-1 (per-product
colour table) or IDN-1 (logo images). Added a **per-product registered-wordmark
registry** (Glow → Inria Sans, scoped to the wordmark/logo lockup only). A registered
wordmark in its lockup passes; the same face promoted to headings/body, or a
loaded-but-unused font `@import` (e.g. Glow's dead Geist import), remains a finding.

### 4. TOK-3 (and TOK-2 / TYP-3) coverage caveat for Tailwind products

`token-audit` resolves raw px/rem CSS properties, arbitrary `[…]` utilities, and
palette-bypass classes, but does **not** map *named* Tailwind utilities to px — so an
off-scale named class like `rounded-4xl` (32px) **passes** the "deterministic" check.
Added a caveat to `tok-3.md`: for utility-first products, off-scale named radius/size/
spacing utilities are evaluator-judged until a Tailwind-class→value resolver lands; do
not report TOK-2/3 / TYP-3 as "mechanically clean" without eyeballing named classes.

## Re-audit set (surfaces silently affected)

- **COL-1 (Glow app):** the confirmed `#F76B15` + dark-foreground rule means the Glow
  app must (a) move `--primary` from `#c2410c` → `#F76B15`, and (b) pair the `brand`
  button variant with a **dark** foreground, not white — including re-fixing the login
  CTA already shipped with white text. This is a Glow-rollout item, tracked in the Glow
  repo's rollout waves (COL-1 wave), not here.
- **TYP-1 (Glow app):** the Inria wordmark on login/masthead is now conformant
  (registered); the dead Geist `@import` is still a finding to remove.
- **TOK-3:** re-audit Glow's named radius utilities (the pilot flagged a `rounded-4xl`
  on Collection/CollectionCard) that the gate did not catch.
- Teacher Workspace / CaseSync: no change (their primaries take white text; no wordmark
  face registered yet).

## Not fixed here — flagged to the design lead (distribution / release)

The pilot exposed the highest-leverage governance risk: the **dev catalog (48 controls)
is ahead of the installed plugin (40)** that the harness actually runs. Missing from the
running harness: `CMP-5 CMP-6 CMP-7 TYP-5 LAY-3 LAY-5 LAY-6 SLP-11`. Controls authored
in this repo are **not in force** until released to the plugin — which is why the audit
synthesis judged against the stale copy. Releasing the dev catalog → plugin is a
versioning/distribution action left to the design lead (this session made the content
changes only). Until then, any product audit must be pointed explicitly at the dev
catalog, and even that is fragile (the pilot proves it).
