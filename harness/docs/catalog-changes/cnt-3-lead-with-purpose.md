# CNT-3 broadened: lead with purpose, not mechanism

**Date:** 2026-06-16 · **Change type:** scope broadening of an existing control (no
new control, no tier change) · **Approved by:** design lead (wondo.jeong, repo owner),
interactively in session 2026-06-16 — CNT-3 wording and this record reviewed and approved.

This record lives outside `docs/decisions/` deliberately: that directory is audited by
`checks/audit-record.py` against the loop-run template, and this change came from a user
observation about copy, not a loop run. Same placement rationale as
`slp-9-ai-writing-tells.md`.

## Triggering incident

While reviewing the TFX-DS site, the design lead observed that the standard's own
category descriptions lead with the **mechanism**, not the purpose — e.g. Spacing &
radius read "shadcn/ui default token scales, unmodified. Defaults are a feature." Apple's
Human Interface Guidelines, by contrast, open each category with why it matters and the
role it plays, so a designer knows at a glance when to reach for it. Ours answered the
*what* and skipped the *why*.

The harness already carried the seed of the fix — "Lead with the benefit, not the
feature" — but as a single fragment under CNT-3's sentence-length bullet, framed for
action labels. Nothing steered **descriptive prose** (titles, descriptions, section
intros, empty states) away from mechanism-first openings, so the descriptions drifted
there unchecked.

Per the ratchet rule, a defect the user caught that no control covered becomes a control
change. This is the same failure family as the existing "lead with the benefit" line, so
it **broadens CNT-3** rather than creating a new control.

## The change

- `standards/controls/cnt-3.md` — title and verify extended; Requirement gains a "leads
  with its purpose" paragraph; Passes/Fails when and Evaluator guidance gain purpose-first
  examples (including the canonical Spacing & radius before/after) and a do-not-flag for
  genuine reference/spec data where the mechanism *is* the point.
- `standards/catalog.yaml` — CNT-3 entry synced (title, verify, fails_when);
  `meta.updated` → 2026-06-16.
- `.claude/skills/tfx-content-style/SKILL.md` — the buried "Lead with the benefit, not
  the feature" fragment elevated into a named generation-time principle, "Lead with
  purpose, not mechanism," scoped explicitly to descriptive prose, with the before/after.
- `.claude/skills/tfx-design-ui/SKILL.md` — no change; its implement phase defers copy to
  tfx-content-style (no inline CNT-3 summary to sync).

CNT-3 stays **L2, hybrid, `applies_to: [content]`, waiver `rationale`** — unchanged tier
and shape; only its scope widened.

## Re-audit set

Surfaces the broadened control affects, in scope until re-audited:

- **All category descriptions** (Foundations, Guidelines, Products, Principles, Harness
  frontmatter `description` fields) — already rewritten purpose-first in commit `08d223c`
  (the triggering work), so already compliant.
- **Section landing descriptions** — re-checked in that pass; already lead with role.
- Future descriptive copy is covered at generation time by the skill principle.

No further re-audit outstanding: the surfaces this change affects were brought into
compliance in the same session.
