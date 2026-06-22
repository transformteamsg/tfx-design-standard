# Plan 045: Resolve the `font-mono` TYP-1 self-compliance gap on the site

> **Executor instructions**: This plan has a **DECISION GATE** — the design-lead
> must pick one option (A/B/C) before you implement. Do not pick for them. Once
> an option is chosen, follow only that option's steps, run its verification, and
> honor the STOP conditions. Update this plan's row in `plans/README.md` when done
> (unless a reviewer maintains the index).
>
> **Why a gate**: whether the harness's own UI may use a monospace typeface for
> code/ID tokens is a design-standard judgment (TYP-1 says "no other typefaces").
> The options range from "remove it" to "amend the control" — that is the
> design-lead's call, not the executor's.
>
> **Drift check (run first)**: `git diff --stat e1ccae1..HEAD -- components/catalog-browser.tsx "app/standards/catalog/[id]/page.tsx" components/illo.tsx app/globals.css harness/standards/catalog.yaml`
> If any changed since this plan was written, compare against "Current state" first; on a
> mismatch, STOP.

## Status

- **Priority**: P2 (the site that publishes TYP-1 does not fully pass it — a visible
  self-compliance gap on the catalog page itself; but it is cosmetic, not user-harming, so it
  ranks below the check fix in 044)
- **Effort**: S (A or C) / M (B — includes a catalog ratchet)
- **Risk**: LOW (A/C) / MED (B touches the catalog → ratchet + design-lead approval)
- **Depends on**: plan **044** for the verification gate (until 044 lands, `type-scan` cannot
  confirm the TYP-1 finding is gone). The fix itself is independent of 044.
- **Category**: bug (self-compliance) + (option B only) governance/catalog
- **Planned at**: commit `e1ccae1`, 2026-06-22

## Why this matters

The 2026-06-22 harness self-run found that `font-mono` is used on the control-ID chips and the
per-control detail page, with no `--font-mono` token defined — so it resolves to the default
`ui-monospace, Menlo, …` stack, a third typeface. TYP-1 (L1): "Display text is Plus Jakarta Sans
(600); body/UI text is Inter (400/500/600); **no other typefaces**." The site must pass its own
standard, and this surfaces on `/standards/catalog` — the page that browses TYP-1 itself. This
plan removes the gap.

## Current state

- `components/catalog-browser.tsx:96` — the per-control copy-ID button:
  `className="rounded-md border border-border bg-accent px-2 py-0.5 font-mono text-[12px] font-semibold …"`
- `app/standards/catalog/[id]/page.tsx:83` — the control-ID badge on the detail page:
  `<span className="rounded-md border border-border bg-accent px-2 py-0.5 font-mono text-[12px] font-semibold">`
- `components/illo.tsx:25` — a code block: `<code className="… font-mono text-[12px] …">`
- `app/globals.css` `@theme` (lines ~81–82) defines only:
  ```css
  --font-display: "Plus Jakarta Sans Variable", system-ui, sans-serif;
  --font-body: "Inter Variable", system-ui, sans-serif;
  ```
  There is **no `--font-mono`** (and no `--font-sans`). `app/layout.tsx` imports only
  `@fontsource-variable/inter` and `@fontsource-variable/plus-jakarta-sans`.
- TYP-1 in `harness/standards/catalog.yaml`: tier `L1`, `check: deterministic`,
  `waiver: documented`, `fails_when: [any third typeface in product UI]`. (No `controls/typ-1.md`
  detail file — TYP-1 is a catalog-only control.)
- `font-sans` is NOT used anywhere in `app`/`components`/`lib` (verified) — so this gap is purely
  `font-mono` at the three sites above.

## The decision (design-lead picks ONE)

| Option | What | Pro | Con | Touches catalog? |
|---|---|---|---|---|
| **A — Remove `font-mono`** (recommended default) | Drop `font-mono` from the 3 sites; IDs render in the body font (Inter) | Simplest; zero new typeface; fully TYP-1-compliant; no governance step | Loses the monospace "code token" look | No |
| **B — Sanction a mono token (ratchet)** | Amend TYP-1 to permit a defined monospace face for code/ID tokens; add `--font-mono` (mapped to a chosen mono face) + import it; add `"font-mono"` to `type-scan`'s `ALLOWED_FONT_TOKENS` | Keeps the code-token aesthetic, done properly and enforceably | A control change → catalog ratchet + design-lead approval; adds a third typeface + a font dependency | **Yes (ratchet)** |
| **C — Inline waive** | `tfx-waive TYP-1 reason="…"` at the 3 sites (L1 ⇒ needs a named human approver) | Fast; honest record | A waiver on the standard's own site is a smell if the pattern is intentional and repeated; not a real end-state | No |

**Recommendation**: **A** unless the monospace code-token look is considered important to the
design language — in which case **B** (do it properly via the ratchet). **C** only as a temporary
stopgap if a decision can't be made now. The reviewer/design-lead records the chosen option in
this plan's README row.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Build (MDX + routes) | `pnpm build` (repo root) | exit 0 |
| TYP-1 now clean on the 3 sites (needs 044) | `python3 checks/type-scan.py ../components ../app` (from `harness/`) | no `[TYP-1]` line for `font-mono` |
| Catalog valid (option B) | `python3 checks/validate.py` (from `harness/`) | `OK: <n> controls valid` |
| Plugin validates | `claude plugin validate .` | `✔ Validation passed` |

## Scope

**In scope** depends on the option:
- **A**: `components/catalog-browser.tsx`, `app/standards/catalog/[id]/page.tsx`, `components/illo.tsx` (remove `font-mono`).
- **B**: the three component files (keep `font-mono`), `app/globals.css` (+`--font-mono`),
  `app/layout.tsx` (font import if the chosen face needs one), `harness/standards/catalog.yaml`
  (TYP-1 amendment), `harness/checks/type-scan.py` (`ALLOWED_FONT_TOKENS` += `"font-mono"`), and a
  `harness/docs/catalog-changes/*.md` propose record.
- **C**: the three component files (add an inline `tfx-waive TYP-1 reason="…"` comment per site).

**Out of scope** (all options): unrelated styling; the TYP-2 size findings on those lines (a
separate concern — see plan README F3); wiring `type-scan` into prebuild.

## Git workflow

- Branch: `advisor/045-font-mono-typ1`. Conventional commit naming per the chosen option
  (`fix(web): …` for A/C; `feat(catalog): …` + ratchet for B). Do NOT push.

## Steps

### If Option A (remove)
1. In each of the three files, delete the `font-mono` class token (leave the rest of the
   className intact). The ID text will inherit the body font.
2. **Verify**: `pnpm build` exits 0; `grep -rn "font-mono" app components lib` returns nothing;
   (after 044) `python3 checks/type-scan.py ../components ../app` prints no `[TYP-1]` line.

### If Option B (sanction a mono token — ratchet)
1. Write `harness/docs/catalog-changes/typ1-permit-mono-token.md` (propose-only,
   `[proposed — pending design-lead approval]`) describing the TYP-1 amendment: permit one
   defined monospace face for code/ID tokens via a `--font-mono` token. **STOP for design-lead
   approval before step 2** (catalog ratchet).
2. On approval: amend TYP-1's `title`/`fails_when` in `catalog.yaml` to allow the sanctioned mono
   token — **use the exact wording the design-lead supplies in the step-1 approval; do NOT invent
   the carve-out language** (the current `fails_when` is `any third typeface in product UI`, so the
   amendment needs precise wording the design-lead owns); add
   `--font-mono: "<chosen face>", ui-monospace, monospace;` to `globals.css @theme`; import the
   face in `app/layout.tsx` if it is a bundled webfont; add `"font-mono"` to `ALLOWED_FONT_TOKENS`
   in `harness/checks/type-scan.py`.
3. **Verify**: `python3 checks/validate.py` → `OK`; `pnpm build` exits 0; (after 044)
   `type-scan ../components ../app` prints no `[TYP-1]` for `font-mono`;
   `python3 checks/type-scan.py --self-test` still green.

### If Option C (waive)
1. Add an inline `{/* tfx-waive TYP-1 reason="monospace for code/ID tokens; approver: <name>" */}`
   adjacent to each `font-mono` usage (JSX comment; CSS/`.ts` use the language's comment form).
2. **Verify**: `pnpm build` exits 0; an inline `tfx-waive TYP-1` comment carrying a reason + a
   **named approver** is present at all 3 sites. Note — Option C's verification is intentionally
   **soft**: `waiver-reconcile.py` emits an inline L1 waiver that has no matching decision-record
   row as a NOTE (exit 0, not a failure), so it cannot mechanically confirm the waiver is
   justified. That softness is exactly why C is a stopgap, not an end state. There is no decision
   record governing the catalog site's own chrome — do not invent one; the named approver in the
   comment is the record.

## Done criteria

Machine-checkable. ALL must hold (for the chosen option):

- [ ] The chosen option is recorded in this plan's README row (which one + why)
- [ ] `pnpm build` exits 0
- [ ] **A**: `grep -rn "font-mono" app components lib` → no matches · **B**: `--font-mono` defined + `"font-mono"` in `ALLOWED_FONT_TOKENS` + TYP-1 amended + `validate.py` OK · **C**: a `tfx-waive TYP-1` with reason + approver at all 3 sites
- [ ] **Precondition — 044 must have landed for this gate to mean anything.** If 044 has NOT landed, `type-scan` never flagged `font-mono` in the first place, so "reports no `[TYP-1]`" is trivially (and meaninglessly) true — do NOT check this box; mark the plan **BLOCKED-on-044** instead. Once 044 is in: `python3 checks/type-scan.py ../components ../app | grep TYP-1` reports no `font-mono` finding
- [ ] `claude plugin validate .` passes; only the chosen option's in-scope files changed
- [ ] `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- No option has been chosen — this plan is gated; do not pick for the design-lead.
- (Option B) the catalog amendment is not yet approved — stop after writing the propose record.
- Removing `font-mono` (A) visibly breaks layout beyond the typeface (it should not — only the
  font changes) — report rather than restyling.
- The live code at the three sites differs from "Current state" (drift) — re-read and report.

## Maintenance notes

- This is the resolution half of the self-run's TYP-1 finding; plan **044** is the detection half
  (it makes `type-scan` flag exactly this). They should land together or 044 first.
- If Option B is chosen, the new `--font-mono` token becomes part of the design language — TYP-1's
  amendment and the `ALLOWED_FONT_TOKENS` entry must stay in sync (a `tfx-sync`-style parity could
  later guard it, but is not needed for one token).
- A reviewer should confirm the chosen option leaves `type-scan` TYP-1-clean on the three sites and
  that no third typeface remains unaccounted for.
