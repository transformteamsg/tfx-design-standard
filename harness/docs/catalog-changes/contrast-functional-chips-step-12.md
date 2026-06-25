# COL-2 broadened: small functional-colour text uses Radix step-12 on a tint

**Date:** 2026-06-25 · **Change type:** scope broadening of an existing control (no new
control, no tier change) · **Approved by:** design lead (rezailmi, repo owner),
interactively in session 2026-06-25 — approved as proposed (COL-2 stays L1, deterministic).

This record lives in `docs/catalog-changes/` deliberately: `docs/decisions/` is audited
by `checks/audit-record.py` against the loop-run template, and this change came from the
HF-9 contrast evidence in issue #5, not a fresh loop run. Same placement rationale as
`cnt-3-lead-with-purpose.md`. Evidence: issue #5 / HF-9 and `docs/decisions/attendance.md`.

## Triggering incident (verbatim, from issue #5 / HF-9)

Functional status chips and an active toggle failed AA at **~4.25–4.29:1** — Radix
**step-11 text on a step-3 tint** for small text. They were caught only by a
manually-injected axe scan, because `a11y-static` has no contrast coverage. The fix was
moving to **step-12** (≈9.8–10.7:1).

The site's own `app/globals.css:30-44` already encodes this hard-won knowledge in
comments: base = step 9, **text = step 11**, the subtle (badge) background is an 8% mix
so that step-11 text "clears the 4.5:1 floor with margin (A11Y-1, L0)", and `--warning`
is amber-11 *darkened* because "amber-11 itself caps ~4.6:1 even on white … and fails AA
on a tinted bg." The HF-9 failure was step-11 on a **step-3** tint — a stronger tint than
the site's 8% subtle — so it landed below 4.5:1.

Per the ratchet rule, a defect a human caught that no control covered becomes a control
change. COL-2 already requires functional colours to come from the Radix scales but says
nothing about which step clears AA for small text on a tint, so a builder can pick
step-11 (the conventional "text" step) and land below 4.5:1. This is the same failure
family as the existing rule, so it **broadens COL-2** rather than creating a new control.
It is the *standard* half; plan 028 (`checks/contrast`) is the *mechanical* half.

## The change (proposed)

- **COL-2 `title`** → add the small-text clause, e.g.: "Functional colours
  (success/warning/danger) come from the shared Radix Colors scales, never ad-hoc; small
  functional-colour text (≤12px chips/labels) uses the scale's step-12 on a tinted
  background so it clears AA (A11Y-1)".
- **COL-2 `verify`** → "Success/warning/danger/info colours resolve to Radix scale
  tokens, and small functional-colour text on a tint resolves to step-12 (step-11 on a
  step-3 tint lands ~4.25:1 and fails AA); contrast computed by `checks/contrast`
  (plan 028) / verified manually until built".
- **COL-2 `fails_when`** → add: "small functional-colour text (≤12px) on a tint uses
  step-11 (or lower) and falls below 4.5:1".
- **Add `detail: controls/col-2.md`** (new) carrying the Radix step table and pass/fail
  examples. The detail file's ratios must be **computed from the actual Radix hex pair
  written in**, not transcribed from this record (they depend on the exact scale and
  tint; the repo's subtle bg is an 8% mix, not raw step-3) — verify each with the WCAG
  formula via `checks/contrast`.
- **Bump `meta.updated`** to the commit date.

**Tier/shape unchanged:** COL-2 stays **L1, deterministic, applies_to [page, component],
waiver documented** — only its scope widens (exactly the cnt-3 pattern). Cross-reference
A11Y-1 (the contrast floor this enforces inside the functional palette).

## Re-audit set

- The harness demo pages with functional chips — `docs/loop-run/attendance.html` (status
  chips), `docs/loop-run/grade-entry.html` if it uses status colour — in scope until
  re-audited.
- Consumer surfaces (Teacher Workspace) are re-audited by the product team **in their own
  repo**.

## Do-not-flag (for the detail file)

Semantic colour-coding itself is fine (the review skill's originality criterion already
protects it). The finding is **only low-contrast small text** in a functional colour —
never neutralise the colour system to "fix" it; move the text to step-12 instead.

---

**Status:** Step 2 committed 2026-06-25 — COL-2 broadened in `standards/catalog.yaml`
(title/verify/fails_when), `controls/col-2.md` created with a Radix step table whose ratios
were computed from the actual scale hexes via `checks/contrast` (amber-11 on amber-3 =
4.25:1, the HF-9 trap; step-12 clears at 10–12:1), and the one-line step-12 rule added to
`tfx-design-ui`. Tier/shape unchanged (L1, deterministic); COL-2 was not changed to hybrid.
