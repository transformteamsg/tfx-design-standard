# Harness feedback — GitHub issues are the system of record

Harness *feedback* and *friction* — a confusing step, a missing or unbuilt check, a
process gap, an onboarding nit — is filed as a **GitHub issue** on
`transformteamsg/tfx-design-standard`. Issues are the system of record. Do not append to
a markdown feedback log; the old logs are archived (see "Archived logs" below).

## What goes here vs. the ratchet

Keep the boundary clear:

- **Harness feedback / friction → a GitHub issue** (this doc). Skill confusion, a missing
  check, a process or onboarding gap, a reliability nit.
- **A control proposal** (a new or revised catalog control) → a **decision /
  catalog-change record** through the ratchet, per `CONTRIBUTING.md`. Unchanged.

A feedback issue may *spawn* a control proposal — but the issue tracks the feedback, and
the record specs the control. Don't file a control spec as an issue, and don't record a
feedback nit as a catalog change.

## Filing an issue

- **One issue per feedback item.** Group trivial nits from a single run into one issue.
- **Title marker:** `[harness-feedback] <summary>` — the marker makes the set findable
  and lets the helper (below) dedup.
- **Body:** the ask + the source context — which skill / check / phase surfaced it, and
  the evidence (quote it, link the run or record).
- **Labels for triage** — one severity + one or more category:
  - severity: `L0-risk`, `high`, `med`, `low`
  - category: `a11y`, `tooling`, `standards`, `harness-ux`, `onboarding`
  - The colour + description each label carries is defined in the label-creation step of
    plan 030 (`harness/plans/030-feedback-as-issues-process.md`).

## Dedup before filing

Search before you file so the tracker doesn't accumulate duplicates:

```
gh issue list --search "[harness-feedback] <keywords>" --state all
```

`--state all` catches closed items too. GitHub `--search` is **fuzzy full-text**, so
`[harness-feedback]` is a search *term*, not an exact-match qualifier — re-filter the
results by the exact marker prefix before deciding. If a match exists, comment on or
reopen it instead of opening a duplicate. (The helper does this filtering in code.)

## Honest failure

If `gh` is unauthenticated or the repo is unreachable, **report it clearly** — print the
issue body that *would* have been filed and the failure reason, and exit non-zero. Never
silently skip. This mirrors the harness rule: never overstate enforcement, never claim a
side effect that didn't happen.

## The mechanism

Until plan 031's helper lands, file by hand with the marker + labels:

```
gh issue create \
  --repo transformteamsg/tfx-design-standard \
  --title "[harness-feedback] <summary>" \
  --label <severity> --label <category> \
  --body "<ask + source context>"
```

Plan 031 (`scripts/file-feedback-issue.py`) makes this one command with dedup and the
honest-failure path built in.

## Archived logs

The markdown feedback logs are read-only historical archives — do not append to them:

- `docs/loop-run/FRICTION-REPORT.md` (upstream, loop run 004).
- `docs/decisions/HARNESS-FEEDBACK.md` (the consumer repo, Teacher Workspace) — archived
  there, in that repo; named here only for completeness.

If a file view of open feedback is still wanted, generate a thin index *from* issues
(`gh issue list --label …`) — never hand-maintain a list, which reintroduces the drift
issues remove. The one-time backfill of historical items is plan 032.
