# Harness self-run — end-to-end run, quality assessment, recursive learning

- **Date**: 2026-06-22
- **Commit**: `e1ccae1` (main, post-Batch-4)
- **Method**: ran the harness against itself — the full deterministic check suite, the
  three eval layers (routing, record audit, golden + evaluator recall), and an
  agent-browser pass over the live site (`pnpm start` on `:3000`). The website is the
  harness's own product, so this is a genuine dogfood run.
- **Verdict**: the harness is **sound and calibrated**. Every deterministic gate is green,
  the evaluator still catches 6/6 planted defects with zero invented blockers, and the
  live agent-readable layer is excellent. The run surfaced **one real self-compliance gap
  and the matching check blind spot** (TYP-1 / `font-mono`) — captured below as the
  recursive-learning output that feeds the next `/improve` round.

## What was run

### Deterministic layer — GREEN

| Check | Self-test | Real run |
| --- | --- | --- |
| validate | 27 cases | `OK: 47 controls valid` |
| audit-record | 21 cases | `OK: 4 records audited` |
| component-manifest | 11 cases | — |
| content-lint | 19 cases | findings (recording-only, see L-2) |
| type-scan | 18 cases | findings (recording-only, see L-2/L-3) |
| waiver-reconcile | 7 cases | clean (0 inline waivers; 3 expected CMP-1 stale NOTEs) |
| reaudit-scope | 8 cases | `COL-2 → 4 records`, unknown id → exit 1 |
| token-audit | — | clean over `app components lib` |
| a11y-static | — | clean over `app components` |

- **Golden tasks** — `score.py` self-test 15 cases; golden 001 (retroactive) **PASS, 14 assertions**.
- **Record audit** — all 4 real decision records pass (incl. the plan-039 verification ledgers).

### Evaluator recall — PASS (run 6)

The real `tfx-design-evaluator` agent reviewed the blind planted page (6 marked plants
stripped). Result: **recall 6/6** (target ≥5/6), **precision 0 invented blocking
findings** (target 0). All six plants placed as BLOCKING; the historically-unstable L1
severity placement (TYP-2, CNT-2 — see runs 2–4) was **stable and correct** this run, so
the run-5 mechanical rule is holding. The two UNCOVERED items it raised (no compose field;
the stub button) were correctly flagged for human review, not as blocking. Recorded in
`evaluator-recall/RESULTS.md`.

### Routing — unaffected

No skill frontmatter `description:` changed in Batch 4 (body-only edits to
`tfx-design-ui`, `tfx-content-style`, `tfx-design-review`). Per `evals/README.md`, a full
routing sweep is only required when the triggering text (`description:`) changes; body
edits take a spot-check. Triggering is unaffected; a headless `claude -p` sweep was not run.

### Agent-browser — live site, strong

An agent browsed the running site (`:3000`). The agent-readable layer is excellent:
`/llms.txt` is a genuine curated index (all 33 internal links resolve 200), the `.md`
twins are clean self-contained markdown with zero JSX leak, correct
`content-type: text/markdown` + `rel=canonical` + `x-robots-tag: noindex` headers, and the
catalog twin embeds a balanced fenced YAML block. The rendered surfaces read as deliberate
craft: zero raw hex (TOK-1), no gradient text, no nested cards, a real (non-flat) type
hierarchy, a sticky filter header, an A11Y-10 skip link, and a `Details →` affordance per
control. An agent could learn and apply the standard from the twins alone.

## Quality assessment

- **Deterministic machinery: healthy.** Nine checks self-test clean and run clean over the
  real tree; the catalog, records, and golden task all pass. The build wires the validator
  + token-audit + a11y-static into prebuild, so these can't silently rot.
- **The evaluator (the quality gate's core): healthy and honest.** 6/6 recall with 0
  invented blockers, correct L0/L1 placement, and honest hedging of visual-only items in a
  code-only review. No leniency drift.
- **Honesty about coverage holds.** `CLAUDE.md` and `checks/README.md` correctly list which
  controls are mechanically checked vs. still manual, and the new checks are *not* wired
  into the build precisely because they surface pre-existing findings (below) — the harness
  does not overstate enforcement.

## Recursive learning — what running the harness on itself revealed

The point of a self-run is to find the harness's own blind spots. This run found one that
matters, plus the known recording-only findings.

- **L-1 — TYP-1 self-compliance gap (the site does not fully pass its own standard).**
  `font-mono` is applied to the control-ID chips and the new per-control detail page —
  `components/catalog-browser.tsx:96`, `app/standards/catalog/[id]/page.tsx:83`,
  `components/illo.tsx:25` — but no `--font-mono` is defined in `app/globals.css @theme`,
  and only Inter + Plus Jakarta are imported (`app/layout.tsx`). So `font-mono` resolves to
  Tailwind's default `ui-monospace, Menlo, …` stack — a third typeface. TYP-1 says "no
  other typefaces." Fix options: define `--font-mono` mapped to an approved face, drop
  `font-mono`, or record an inline `tfx-waive TYP-1`. (Pre-existing in `illo.tsx`; Batch 4's
  detail page propagated the pattern.)
- **L-2 — `type-scan` has a TYP-1 blind spot (the matching check gap).** `type-scan` flags
  the TYP-2 sizes on those exact lines but emits **zero** TYP-1 findings for the
  `font-mono`-without-token case. The deterministic check could not have caught L-1 — the
  agent-browser did. The check should learn to flag a `font-(mono|serif)` utility (or a raw
  `font-family`) that does not resolve to a defined `--font-*` token.
- **L-3 — recording-only findings stand (known, from plan 038 / the 042 review).** 13
  CNT-3 long-sentence findings in `content/`; ~37 TYP-2 small-text findings in
  `app`/`components` (most are the documented 11/14 px short-label ambiguity — e.g. the
  12 px ID chips are short labels, defensible). These are triage items, not gate failures;
  `content-lint`/`type-scan` are intentionally unwired from prebuild for this reason.
- **L-4 — eval drift watch.** Recall/precision have never moved (6/6, 0 across runs 1–6);
  the thing to keep watching is **L1 severity placement**, stable this run. No new drift.

## Feeds `/improve`

L-1 (define `--font-mono` / waive) and L-2 (teach `type-scan` the missing-font-token case)
are the headline targets for the next improvement round, alongside the still-open Batch 4
follow-ups (F1 `cmp-1` `<date>` escape → plan 043; F2/F3 lint triage; F4 stale waivers).
