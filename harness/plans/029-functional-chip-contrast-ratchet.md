# Plan 029: Broaden COL-2 — small functional-colour text uses Radix step-12 (ratchet)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **This plan has a hard human gate.** Step 1 is propose-only (writes a
> catalog-change record, touches no catalog file). Step 2 commits the broadening and
> **must not run** until the design lead has approved. Do not skip the gate.
>
> **Drift check (run first)**: `git diff --stat 5f95350..HEAD -- harness/standards/catalog.yaml harness/app/globals.css`.
> If the COL-2 entry or the functional-colour tokens changed since this plan was
> written, compare against "Current state" before editing; on a mismatch, STOP.
> `python3 checks/validate.py` must pass before AND after Step 2. Paths relative to
> the harness root.

## Status

- **Priority**: P2 (issue #5 / HF-9 evidence + the functional-chip finding)
- **Effort**: S (propose) / MED (gated commit)
- **Risk**: LOW for Step 1; MED for Step 2 (catalog revision — gated, validator-checked)
- **Depends on**: none for Step 1; Step 2 gated on design-lead approval. Soft-links to
  plan 028 (`checks/contrast` is the mechanical backing for this rule).
- **Category**: docs (normative standard — scope broadening of COL-2 via ratchet)
- **Planned at**: commit `5f95350`, 2026-06-17

## Why this matters

HF-9 evidence (issue #5): functional status chips and an active toggle failed AA at
~4.25–4.29:1 — Radix **step-11 text on a step-3 tint** for small text. The fix was
moving to **step-12** (9.8–10.7:1). The catalog's COL-2 requires functional colours to
come from the Radix scales but says **nothing about which step clears AA for small
text on a tint**, so a builder can pick step-11 (the conventional "text" step) and land
below 4.5:1 on a tinted chip. This broadens COL-2 with a small-text step rule,
cross-referenced to A11Y-1 (the contrast floor), so the standard names the trap. It is
the *standard* half; plan 028 (`checks/contrast`) is the mechanical half.

## Current state

- `standards/catalog.yaml:304-316` — the COL-2 entry (no `detail:` file today):
  ```
  - id: COL-2
    source: TFX-DS
    title: Functional colours (success/warning/danger) come from the shared Radix Colors scales, never ad-hoc
    tier: L1
    check: deterministic
    phase: [implement, verify]
    applies_to: [page, component]
    verify: "Success/warning/danger/info colours resolve to Radix scale tokens"
    waiver: documented
    fails_when:
      - custom green/red/amber values
      - red used decoratively
    refs: [https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb]
  ```
- `app/globals.css:30-44` — the functional tokens and the design rationale already in
  comments: base = step 9, **text = step 11**, subtle (bg) = an 8% mix so step-11 text
  "clears the 4.5:1 floor with margin (A11Y-1, L0)", and `--warning` is amber-11
  *darkened* because "amber-11 itself caps ~4.6:1 even on white … and fails AA on a
  tinted bg." So the site already treats step-11-on-tint as a contrast hazard — this
  broadening writes that hard-won knowledge into the standard. **The failing case (HF-9)
  was step-11 on a step-3 tint, a stronger tint than the site's 8% subtle.**
- `docs/catalog-changes/cnt-3-lead-with-purpose.md` — the **exact precedent**: a COL-2-
  style broadening of an existing control (no new id, no tier change), recording the
  triggering incident, the change, the unchanged tier/shape, who approved, and the
  re-audit set. Mirror its structure.
- `standards/controls/a11y-8.md` — detail-file frontmatter convention (repeat catalog
  fields verbatim, OMIT `fails_when`). If Step 2 adds a `col-2.md` detail file, follow it.
- `standards/schema.json` — `COL` is already a valid `id_prefix`; **no schema change**.
- `.claude/skills/tfx-design-ui/SKILL.md` Phase-4 implement constraints reference the
  COL controls; `.claude/skills/tfx-design-review/SKILL.md` already has a "do not flag
  deliberate semantic colour-coding" note (the originality criterion) — the broadening
  must not contradict it (semantic colour is fine; *low-contrast small text* in that
  colour is the finding).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Validator (Step 2, before & after) | `python3 checks/validate.py` | `OK: N controls valid` |
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` |
| COL-2 broadened | `grep -A12 "id: COL-2" standards/catalog.yaml \| grep -ic "step-12\|small text\|tint\|A11Y-1"` | ≥ 1 (after Step 2) |
| Detail parses (if added) | `python3 -c "import yaml; yaml.safe_load(open('standards/controls/col-2.md').read().split('---')[1])"` | exit 0 |

## Scope

**Step 1 — In scope** (propose-only):
- `docs/catalog-changes/contrast-functional-chips-step-12.md` (create) — the
  catalog-change record, marked `[proposed — pending design-lead approval]`.

**Step 2 — In scope** (ONLY after approval):
- `standards/catalog.yaml` — broaden the COL-2 `title`/`verify`/`fails_when`; add
  `detail: controls/col-2.md`; bump `meta.updated`.
- `standards/controls/col-2.md` (create) — the detail file with the Radix step table +
  pass/fail examples.
- `.claude/skills/tfx-design-ui/SKILL.md` — one line in the implement-phase
  functional-colour guidance.
- `docs/catalog-changes/contrast-functional-chips-step-12.md` — fill in "approved by".

**Out of scope** (both steps):
- Editing `catalog.yaml`/`standards/` during Step 1.
- Changing COL-2's tier (stays L1) or creating a new control id.
- The contrast *check* itself (plan 028).
- Consumer/product surfaces (Teacher Workspace) — re-audit set names them only.

## Git workflow

- Step 1 branch: `advisor/029-functional-chip-contrast-proposal`. Step 2 (after
  approval) per the reviewer's instruction (e.g. `catalog/col-2-functional-contrast`).
  Conventional commits (`docs: propose COL-2 small-text step-12 rule (HF-9)` /
  `docs(standards): broaden COL-2 — small functional text uses Radix step-12`). Do NOT push.

## Steps

### Step 1 (propose-only): write the catalog-change record

Create `docs/catalog-changes/contrast-functional-chips-step-12.md`, mirroring
`cnt-3-lead-with-purpose.md`:

- **Header**: date, change type "scope broadening of an existing control (no new
  control, no tier change)", "Approved by: `[proposed — pending design-lead approval]`".
- **Placement note**: lives in `catalog-changes/` (feedback-driven broadening, not a
  fresh loop run), evidence in issue #5 / HF-9 and `docs/decisions/attendance.md`.
- **Triggering incident** (quote verbatim from issue #5 / HF-9): functional chips +
  active toggle at 4.25–4.29:1 (Radix step-11 text on step-3 tint), caught only by a
  manually-injected axe scan because `a11y-static` has no contrast coverage; fixed at
  step-12 (9.8–10.7:1). Note the corroborating `globals.css` comments (amber-11 fails on
  a tint; the 8% subtle bg exists precisely so step-11 clears AA).
- **The change** (proposed):
  - COL-2 `title` → add the small-text clause, e.g. "Functional colours come from the
    shared Radix scales; small functional-colour text (≤12px chips/labels) uses the
    scale's step-12 on a tinted background so it clears AA (A11Y-1)".
  - COL-2 `verify` → "… and small functional-colour text on a tint resolves to step-12
    (step-11 on a step-3 tint lands ~4.25:1 and fails AA); contrast computed by
    `checks/contrast` (plan 028) / verified manually until built".
  - COL-2 `fails_when` → add: "small functional-colour text (≤12px) on a tint uses
    step-11 (or lower) and falls below 4.5:1".
  - Add `detail: controls/col-2.md` (new) carrying the Radix step table and examples.
  - **Tier/shape unchanged**: COL-2 stays **L1, deterministic, applies_to
    [page, component], waiver documented** — only its scope widens (exactly the cnt-3
    pattern). Cross-reference A11Y-1 (the contrast floor this enforces in the functional
    palette).
- **Re-audit set**: the harness demo pages with functional chips (`docs/loop-run/`
  attendance status chips; grade-entry if it uses status colour), in scope until
  re-audited; consumer surfaces (Teacher Workspace) re-audited by the product team.

**Verify**: file exists, marked `[proposed — pending design-lead approval]`, states the
exact `title`/`verify`/`fails_when` deltas + evidence + re-audit set; `git status` shows
NO change under `standards/`. STOP and route to the design lead.

### Step 2 (GATED — only after design-lead approval): commit the broadening

1. Edit the COL-2 entry in `standards/catalog.yaml` per the approved deltas; add
   `detail: controls/col-2.md`; bump `meta.updated` to the commit date.
2. Create `standards/controls/col-2.md` (a11y-8.md frontmatter convention; OMIT
   `fails_when`). Body: Requirement (Radix scales + the small-text step-12 rule),
   Rationale (the HF-9 incident + the amber-11/tint math), a **Radix step table**
   (step-9 base, step-11 text on white/light surfaces, **step-12 for small text on a
   step-3 tint**). **Compute each table cell's contrast ratio from the actual Radix hex
   pair you write in** — do NOT transcribe the ~4.25 / 9.8–10.7 figures from this plan
   or the issue; they depend on the exact Radix scale and tint, and the repo's own
   subtle bg is an 8% mix, not raw step-3. Verify each with the WCAG formula (e.g. via
   plan 028's `checks/contrast`). Then Passes when, Fails when, Evaluator guidance, and
   a **Do not flag**
   (semantic colour-coding itself is fine per the review skill; the finding is only
   low-contrast small text — never neutralise the colour system to "fix" it).
3. `tfx-design-ui/SKILL.md` — add one line to the implement-phase functional-colour
   guidance: small functional-colour text on a tint uses step-12 (COL-2 / A11Y-1).
4. Fill the approver into the catalog-change record.

**Verify**: `grep -A12 "id: COL-2" standards/catalog.yaml | grep -ic "step-12|small text|tint|A11Y-1"` ≥ 1; the detail-parse command → exit 0; `python3 checks/validate.py` → `OK`; `claude plugin validate .` passes.

## Test plan

No code/tests. Gates: Step 1 — record exists, propose-only honoured. Step 2 —
`validate.py` OK before and after (the new `detail:` makes the validator require
`col-2.md`, so create it in the same change — never the catalog entry alone), detail
frontmatter matches the broadened catalog entry, plugin validation passes, the skill
carries the one-line rule, and a read-through confirms the step table is correct
(step-12 for small text on tint) and the do-not-flag preserves semantic colour-coding.

## Done criteria

Machine-checkable. ALL must hold:

**Step 1 (propose):**
- [ ] `docs/catalog-changes/contrast-functional-chips-step-12.md` exists, marked `[proposed — pending design-lead approval]`
- [ ] States the exact COL-2 title/verify/fails_when deltas, evidence (quoted), re-audit set
- [ ] `git status` shows NO change under `standards/`
- [ ] `plans/README.md` row updated (Step 1 done / Step 2 gated)

**Step 2 (gated commit), additionally:**
- [ ] COL-2 entry broadened; `standards/controls/col-2.md` created and frontmatter matches
- [ ] `python3 checks/validate.py` → `OK`; `claude plugin validate .` passes
- [ ] `tfx-design-ui` carries the small-text step-12 line; record has an approver
- [ ] COL-2 tier still `L1`; no new control id introduced
- [ ] No out-of-scope file modified

## STOP conditions

Stop and report (do not improvise) if:

- The COL-2 entry differs from "Current state" (drift) — reconcile against the live
  catalog before editing.
- Adding `detail: controls/col-2.md` without creating the file (or vice versa) — the
  validator fails on either alone; both must land together.
- Step 2 is reached without recorded design-lead approval — STOP; it is gated.
- The design lead wants COL-2 changed to `check: hybrid` (small-text identification is
  partly judgment) — that's a bigger shape change than this plan scopes; re-spec with
  the detail file required by the hybrid check, and confirm before proceeding.

## Maintenance notes

- This is the *standard*; plan 028's `checks/contrast` is the *mechanism* — once both
  land, the step-11-on-step-3 trap is both written down and mechanically flagged.
- Keep it reconciled with the review skill's "do not flag deliberate semantic
  colour-coding" note: the colour system is intentional; only the small-text contrast is
  the finding.
- The Radix step convention (9 base / 11 text / 12 for small-on-tint) is portfolio-wide
  (the site's own `globals.css` uses Radix grass/amber/red) — not product-specific — so
  it belongs in the catalog, not in per-product nuance.
