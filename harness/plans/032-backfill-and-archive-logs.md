# Plan 032: Backfill historical HF items as issues, then confirm the logs are archived

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **This plan is side-effecting and operator-gated.** It creates multiple real
> GitHub issues. Do NOT run any filing step without explicit operator go-ahead, and
> always dry-run first. **Never invent a feedback item** — if a source is missing,
> STOP.
>
> **Drift check (run first)**: confirm plans 030 and 031 have landed —
> `test -f harness/docs/harness-feedback.md && test -f harness/scripts/file-feedback-issue.py && echo ok` → `ok`. If not, STOP (this plan depends on both).

## Status

- **Priority**: P3 (issue #6 migration — lowest leverage; most historical HF items are
  already resolved, so this is mostly bookkeeping)
- **Effort**: S–M
- **Risk**: MED (creates real issues; held down by dry-run-first, dedup, and the
  resolved-item skip)
- **Depends on**: **plan 030** (marker + labels + archive) and **plan 031** (the filing
  helper). Operator-gated.
- **Category**: migration
- **Planned at**: commit `5f95350`, 2026-06-17

## Why this matters

Issue #6's migration: open the existing items (HF-1..19) as issues so the GitHub
tracker is the complete system of record, then mark the markdown logs archived. The
nuance that makes this *careful* rather than mechanical: **most HF items are already
resolved** (the harness `plans/README.md` chronicles HF-1/2/6/8/9/12/16 as folded into
shipped plans 010–022) and **issue #5 already covers HF-6/9/17/18/19**. A naive backfill
would spray ~19 OPEN issues, several of them noise. The job is to file only the
genuinely-open historical items, record the resolved ones as closed (or skip with a
note), and dedup against what already exists — honestly, without inventing anything.

## Current state

- **The canonical HF-1..19 list lives in the consumer repo** at
  `docs/decisions/HARNESS-FEEDBACK.md` (Teacher Workspace) — **not in this repo**. This
  worktree has only the *upstream* `docs/loop-run/FRICTION-REPORT.md` (run 004) and the
  HF references chronicled in `harness/plans/README.md`:
  - The **"## Findings considered and rejected → Batch 2" section** of
    `harness/plans/README.md` (NOT the "Dependency notes → Batch 2" block — that one is
    about shared-file sequencing, not HF resolution). It records, in prose, that several
    HF items were resolved by shipped plans — e.g. HF-1 folded into plan 011, HF-2 into
    plan 015, HF-8 is product-only, HF-9's honesty half already shipped (its
    `checks/contrast` half is plan 028), HF-12/HF-16 already in the skills. Read the
    section for the live list; do not transcribe these as exact quotes. These resolved
    items are **not OPEN backfill candidates**.
  - Issue #5 already tracks **HF-17, HF-18, HF-19, HF-6 (re-raised), HF-9 (evidence)** →
    these must be **excluded by the manual candidate-list classification in Step 1**
    (below). **The helper's automated dedup will NOT catch them**: issue #5 is titled
    plain "harness feedback" with no `[harness-feedback]` marker, so 031's marker-based
    `find_duplicate` won't match it. Do not rely on `--dry-run`/the script to exclude
    issue #5's items — exclude them by hand in Step 1.2.
- `scripts/file-feedback-issue.py` (plan 031) — the filing helper: marker, labels,
  dedup, honest failure, `--dry-run`. Use it for every filing.
- `docs/harness-feedback.md` (plan 030) — the workflow + label scheme.
- `docs/loop-run/FRICTION-REPORT.md` — **already archived by plan 030** (header pointer).
  Its body is run-004 friction (the source for any upstream HF items not in the consumer
  log).
- Existing issues: `#5` (harness feedback, open) and `#6` (this automation, open).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Deps present | `test -f docs/harness-feedback.md && test -f scripts/file-feedback-issue.py && echo ok` | `ok` |
| Helper self-test | `python3 scripts/file-feedback-issue.py --self-test` | `SELF-TEST OK (N cases)` |
| Existing feedback issues | `gh issue list --search "[harness-feedback]" --state all` | the current set (dedup baseline) |
| Dry-run one item | `python3 scripts/file-feedback-issue.py --dry-run --severity <s> --category <c> --title "<HF-n summary>" --body-file <f>` | prints command + body; files nothing |
| Friction log archived | `grep -ic "archived" docs/loop-run/FRICTION-REPORT.md` | ≥ 1 (from plan 030) |

## Scope

**In scope** (side-effecting, gated):
- Creating GitHub issues for the **genuinely-open** historical HF items, via
  `scripts/file-feedback-issue.py` (one per item, labelled, deduped).
- Optionally closing the issues created for already-resolved items with a one-line
  "resolved by plan NNN" note (or skipping them — see Step 2).

**In scope** (repo files):
- `docs/harness-feedback.md` — append a short "Backfill (one-time)" note recording when
  the backfill ran, the source used, and that the markdown logs are now archived.

**Out of scope** (do NOT touch):
- The consumer repo's `docs/decisions/HARNESS-FEEDBACK.md` — it lives in Teacher
  Workspace; its archival header is a **consumer-repo change**, made there, not here.
  Note it; don't edit it.
- The helper script (plan 031) or the process docs' core (plan 030).
- Re-filing anything issue #5 already covers, or any resolved item as an OPEN issue.

## Git workflow

- Branch (for the doc note): `advisor/032-backfill-note`. Conventional commits
  (`docs: record one-time harness-feedback backfill (#6)`). Do NOT push. The issue
  creation is a remote `gh` action, independent of the branch.

## Steps

### Step 1 (operator-gated): obtain the HF source and build the candidate list

Do not proceed without operator go-ahead. Then:

1. Get the canonical HF-1..19 list. It is in the **consumer repo**
   `docs/decisions/HARNESS-FEEDBACK.md`. The operator must provide the path to a
   checkout (or paste the list). **If the source is not available, STOP** — do not
   reconstruct HF items from memory or from the partial README chronicle; an invented
   feedback item is worse than a missing one.
2. For each HF-n, classify from its status in that log + the `plans/README.md` chronicle:
   - **Resolved** (folded into a shipped plan, or fixed in skills) — e.g. HF-1, 2, 8, 12,
     16, and the shipped halves of 6/9. → skip, OR file-then-close with "resolved by
     plan NNN" if the operator wants a complete closed-issue archive.
   - **Already an open issue** (issue #5 covers 6/9/17/18/19) → skip. Exclude these
     **by hand here** — issue #5 is unmarked, so the helper's marker-based dedup will
     not catch it.
   - **Genuinely open / untracked** → backfill candidate.
3. Produce the candidate list (open items only) with, for each: a `[harness-feedback]`
   summary, a severity (`L0-risk`/`high`/`med`/`low`), category labels, and a body
   (the ask + source context, quoting the HF entry). Show this list to the operator
   before filing anything.

### Step 2 (operator-gated): dry-run, then file

1. For every candidate, run the helper with `--dry-run` first; confirm the title marker,
   labels, dedup decision, and body look right.
2. With operator go-ahead, file for real (drop `--dry-run`). The helper dedups, so a
   re-run is idempotent. If `gh` is unavailable, the helper reports honestly and files
   nothing — STOP and hand back to the operator.
3. For resolved items (if the operator chose to archive them as closed issues): file,
   then `gh issue close <n> --comment "resolved by plan NNN"`. Otherwise skip them and
   record the skip in Step 3.

### Step 3: Record the backfill and confirm archives

- Append to `docs/harness-feedback.md` a "Backfill (one-time)" note: the date, the source
  used, how many issues were created vs. skipped-as-resolved vs. deduped, and a one-line
  index (or a `gh issue list --search "[harness-feedback]"` pointer).
- Confirm the upstream `FRICTION-REPORT.md` archived header is present (plan 030).
- Note that the consumer-repo `HARNESS-FEEDBACK.md` archival header is applied **in the
  consumer repo** (link the consumer-repo task; do not edit it here).

**Verify**: `gh issue list --search "[harness-feedback]"` shows the backfilled set;
`grep -ic "archived" docs/loop-run/FRICTION-REPORT.md` → ≥ 1; the backfill note exists.

## Test plan

- No code. The proof is: a dry-run of every candidate before filing; dedup confirmed
  (re-running files no duplicate); the resolved-item handling matches the operator's
  choice; and the recorded counts reconcile with `gh issue list`.
- Do NOT add a synthetic test issue — the dry-run is the safe rehearsal.

## Done criteria

ALL must hold:

- [ ] HF source obtained from the consumer log (or operator-provided); **no item invented**
- [ ] Candidate (open-only) list reviewed by the operator before any real filing
- [ ] Every candidate dry-run before filing; issue #5's items and resolved items not re-filed as open
- [ ] Backfilled issues exist and carry the marker + severity + category labels (`gh issue list --search "[harness-feedback]"`)
- [ ] `docs/harness-feedback.md` has the backfill note; `FRICTION-REPORT.md` archived header present
- [ ] Consumer-repo log archival is noted as a separate-repo task (not edited here)
- [ ] `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- The canonical HF-1..19 source is not available — do not reconstruct items from memory.
- `gh` is unavailable (the helper reports it) — hand back to the operator.
- A candidate's resolved/open status is ambiguous — ask the operator rather than guessing
  (filing a resolved item as a live bug is noise; dropping a real open one loses it).
- A candidate overlaps issue #5's coverage (HF-6/9/17/18/19) — exclude it in the Step-1
  manual classification and note it; don't expect the helper's dedup to catch issue #5
  (it is unmarked).

## Maintenance notes

- This is a **one-time** migration; after it, all new feedback flows through plan 031's
  helper at capture time (Phase-6 ratchet), so the tracker stays complete without
  another backfill.
- Keep the backfill conservative: when in doubt, fewer, well-labelled issues beat a wall
  of historical noise. The README chronicle and the plans are the durable record of the
  *resolved* items; issues are for what is still open.
- A reviewer should confirm nothing issue #5 already tracks was duplicated and no
  resolved item was filed as an open bug.
