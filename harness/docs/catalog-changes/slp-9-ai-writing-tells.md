# SLP-9 broadened: AI-writing tells

**Date:** 2026-06-12 · **Change type:** scope broadening of an existing control (no
new control, no tier change) · **Approved by:** design lead, interactively, in the
session that produced this change.

This record lives outside `docs/decisions/` deliberately: that directory is audited
by `checks/audit-record.py` against the loop-run template, and this change came from
a manual content audit, not a loop run.

## Triggering incident

A 2026-06-12 site-wide writing audit of the TFX-DS website (humanizer pass, 27 files)
found:

- **Em-dash chains throughout the site's own prose** — the exact pattern SLP-9
  already banned. The control existed; nothing applied it to prose outside product
  UI.
- **Tells no control covered:** a sentence duplicated verbatim in two landing-page
  sections; rule-of-three padding; negative-parallelism density ("X, not Y"
  appearing 10+ times across the site); copula avoidance ("serves as").

Per the ratchet rule, defects no control covers become control proposals. These are
the same failure family as SLP-9's buzzword copy ("the written form of AI slop"), so
they broaden SLP-9 rather than create a new control.

## The change

- `standards/controls/slp-9.md` — title, verify, fails_when extended; body gains
  structural-tell fail examples and a proper "Evaluator guidance" section with
  Flag / Do-not-flag calibration (including em-dash *clustering* in long-form
  prose, and do-not-flag cases learned from the audit: genuine enumerations,
  "X, not Y" when it is the rule being taught, single working dashes).
- `standards/catalog.yaml` — SLP-9 entry synced (title, verify, fails_when).
- `.claude/skills/content-style/SKILL.md` — compact generation-time section
  "AI writing tells (SLP-9)" plus an explicit scope statement: the rules apply to
  all prose written in a session (UI strings, site content, docs, records), not
  just product UI. Frontmatter description updated for routing. Word lists are NOT
  duplicated here — slp-9.md is canonical.
- `.claude/skills/design-ui/SKILL.md` — the implement phase's SLP-9 summary
  updated to the broadened scope (caught in review as a missed sync target).
- Website surfaces (the site reads this catalog directly; no mirror to sync):
  `content/guidelines/voice-tone.mdx`, `content/harness/skills.mdx` (table
  reconciled to the real skill inventory), root `CLAUDE.md` (prose hook for
  agents editing `content/`).
- `checks/README.md` — planned `content-lint` spec inherits the new lint lists.
- `evals/evaluator-recall/planted-copy.md` + `expected-findings-copy.yaml` — new
  recall fixture with planted SLP-9 tells and precision decoys.

## Tier rationale

Stays **L2 / hybrid / rationale waiver**. Structural tells are judgment-heavy;
blocking on them would start rewrite wars over close calls. If a hard tell (e.g. a
chatbot artifact) ever escapes to ship, that observed failure is the evidence to
split it out at L1.

## Verification

- `python3 checks/validate.py` — catalog ↔ detail consistency.
- Site `pnpm build` — the prebuild gate (`scripts/check-standards.mjs`) and MDX
  parse pass.
- Calibration smoke test: "Glow serves as a testament to our commitment to
  empowering teachers" must trip the Flag list; "Centre optically, not
  mathematically" must not.
