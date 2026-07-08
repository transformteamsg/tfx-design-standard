# Plan 065: Ratchet — ratify CMP-4 (empty-state clarity) and decide EVD-1 (async-state evidence) — design-lead gated

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `harness/plans/README.md` — unless a reviewer dispatched you and told you
> they maintain the index.
>
> **Drift check (run first)**: `git diff --stat e673294..HEAD -- harness/standards/ harness/docs/decisions/student-notes-empty-state.md harness/checks/validate.py harness/standards/schema.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW (catalog additions are additive; both proposals pre-specified)
- **Depends on**: **design-lead gate** (see Step 2 — hard gate; everything after
  it is conditional on approval). Sequence before 066 (both bump control counts).
- **Category**: direction (catalog extension)
- **Planned at**: commit `e673294`, 2026-07-08

## Why this matters

The harness has carried two **fully-specified, still-pending control proposals**
since 2026-06-16, recorded per the ratchet protocol in
`docs/decisions/student-notes-empty-state.md` and marked
`[proposed — pending design-lead approval]`:

- **CMP-4 — empty-state clarity.** The catalog even reserves the id: a comment
  in `catalog.yaml` (~line 397) says "CMP-4 is reserved for the pending
  empty-state-clarity proposal … do not reuse this id elsewhere." Empty-state
  disambiguation ("nothing here yet" vs "still loading" vs "no access") was the
  central done-criterion of the Student Notes run, yet no control grades it.
- **EVD-1 — async-state evidence required.** The Student Notes evaluator could
  not verify CMP-3 perceptibility because all three captured frames showed only
  the empty state; a build can claim loading/success/error states while none is
  ever screenshotted. Independently corroborated: GitHub issue #19 (HF-16,
  OPEN) — "the evaluator grades the builder's evidence set, not the surface" —
  and the golden eval `evals/golden/003-broadcast-message.yaml` already demands
  "the loading frame (the habitually missing state)".

Every empty state and every async surface designed since has had no citable
rule for either. This plan takes both through the ratchet gate. It is
**gated**: the design lead approves, adjusts, or rejects each proposal; a
rejection is recorded, not discarded.

## Current state

Verified 2026-07-08 at `e673294`:

- `harness/docs/decisions/student-notes-empty-state.md:208-225` — the CMP-4
  proposal. Statement: "Every empty-state view must unambiguously signal 'no
  content exists' (distinct from loading, error, or permissions failure)
  through a heading, explanatory subtext, and the absence of loading chrome
  such as skeleton rows or spinners." Tier: **L1, hybrid** — deterministic
  sub-check: no skeleton/spinner in DOM when the empty-state heading renders;
  judgment sub-check: heading + subtext cannot be mistaken for loading or
  permissions failure. Verbatim triggering evidence quoted in the record.
- `harness/docs/decisions/student-notes-empty-state.md:229-250` — the EVD-1
  proposal. Statement: "For every page containing an async transaction (CMP-3
  in scope), the verify evidence set must include screenshots or
  screen-recordings capturing the loading state, the success state, and the
  error state — not only the initial/empty state." Tier: **L1,
  deterministic** against the evidence set; alternatives: video walkthrough or
  human attestation. Two verbatim evidence quotes in the record.
- `harness/standards/catalog.yaml:397-398` — the reservation comment sits
  between CMP-3 and CMP-5:
  `# CMP-4 is reserved for the pending empty-state-clarity proposal recorded in`
  `# docs/decisions/student-notes-empty-state.md — do not reuse this id elsewhere.`
- `harness/standards/schema.json` — `id_prefixes` is the list
  `["A11Y","TOK","TYP","COL","CMP","CNT","MOT","IDN","SLP","LAY"]`; **EVD is
  not in it** — an `EVD-1` catalog entry fails validation until the prefix is
  added (and `meta.categories` in catalog.yaml needs a display name).
- `harness/standards/README.md` — format spec; authoring rules (one control =
  one verifiable statement; anti-patterns section mandatory; detail file
  frontmatter repeats the catalog entry verbatim). Detail-file exemplar to
  copy the structure from: `harness/standards/controls/cmp-7.md` (frontmatter
  + Requirement + Rationale + Passes/Fails when + How to verify).
- `harness/CONTRIBUTING.md` — the ratchet workflow: proposal already lives in
  the decision record (done); a complete proposal PR = exactly the detail file
  + the catalog entry (+ every surface that restates it, for anything beyond
  the two files, listed in the record); gates: `python3 checks/validate.py`
  passes and the design lead approves; compute the re-audit set with
  `python3 checks/reaudit-scope.py <id>`.
- Precedent for the gate mechanics: plans 053/057 ran "DONE-AS-PROPOSED" then
  "GATE CLEARED (Reza Ilmi, in-session approval)" with tier/fold decisions made
  at the gate — see their rows in `harness/plans/README.md`. The design lead
  for this repo is the harness lead (Reza Ilmi).
- `[COUNT-SYNC]`: `harness/README.md` prose says "53 controls" in ≥ 3 places;
  the validator fails the build until every claim matches the new count. (If
  plan 064 landed, `docs/index.html` is also scanned.)
- The design skill's verify procedure lives at
  `harness/.claude/skills/design/verify.md`; the evaluator at
  `harness/.claude/agents/evaluator.md`; the decision-record template at
  `harness/docs/decisions/TEMPLATE.md` (its evidence ledger is REQUIRED and
  audited by `checks/audit-record.py`).

## Commands you will need

| Purpose | Command (from `harness/`) | Expected on success |
|---|---|---|
| Validator | `python3 checks/validate.py` | `OK: <N> controls valid` (N = 53 + committed count) |
| Validator self-test | `python3 checks/validate.py --self-test` | `SELF-TEST OK` |
| Re-audit set | `python3 checks/reaudit-scope.py CMP-4` (after commit) | lists records; exit 0 |
| Record audit | `python3 checks/audit-record.py` | `OK: <N> records audited` |
| Website build (repo root) | `pnpm build` | exit 0 (`scripts/check-standards.mjs` re-validates the catalog) |

## Scope

**In scope** (conditional on the gate — see steps):
- `harness/docs/catalog-changes/cmp-4-empty-state-clarity.md` (create, Step 1)
- `harness/docs/catalog-changes/evd-1-async-evidence.md` (create, Step 1)
- `harness/standards/catalog.yaml` (Step 3, only after gate approval)
- `harness/standards/controls/cmp-4.md` (create, Step 3)
- `harness/standards/controls/evd-1.md` (create, Step 3 — only if EVD-1 approved as a control)
- `harness/standards/schema.json` (Step 3 — only if EVD prefix approved)
- `harness/checks/validate.py` (only if a schema self-test fixture must learn the EVD prefix)
- `harness/README.md`, `harness/docs/index.html` (count bumps), `harness/CHANGELOG.md`
- `harness/.claude/skills/design/SKILL.md` + `design/verify.md`,
  `harness/.claude/agents/evaluator.md`, `harness/.claude/skills/critique/pass.md`
  (wiring, Step 4 — body-only)
- `harness/docs/decisions/student-notes-empty-state.md` (Step 5 — status marker
  update ONLY on the two proposal lines; nothing else in a historical record)
- `harness/plans/README.md` (status row)

**Out of scope**:
- Any new check script (the CMP-4 deterministic sub-check and the EVD-1
  evidence-set check are follow-ups; the controls land with "verified
  manually / evaluator" wording like TYP-5 did).
- All other controls and skills; any `description:` frontmatter.
- Product repos.

## Git workflow

- Branch: `catalog/cmp-4-empty-state-clarity` (CONTRIBUTING's convention for
  catalog PRs; keep EVD-1 on the same branch — one gate, one review).
- Conventional commits; separate commits for records (Step 1) vs catalog
  commit (Step 3+), mirroring plans 053/057.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Write the two catalog-change records (propose-only — no catalog edits)

Create `harness/docs/catalog-changes/cmp-4-empty-state-clarity.md` and
`harness/docs/catalog-changes/evd-1-async-evidence.md`, modelled structurally on
`harness/docs/catalog-changes/idn-4-casesync-sensitivity.md` (header: date,
change type, "Approved by: — pending"; then: why this is a control candidate,
the proposed entry in full catalog YAML shape, tier rationale, verification,
re-audit set, open questions for the gate). Content source: transcribe the two
proposals from `docs/decisions/student-notes-empty-state.md:208-250` —
faithfully, not creatively; quote the triggering evidence verbatim.

Open questions each record must put to the gate:

- **CMP-4**: (a) confirm tier L1 hybrid as proposed; (b) `phase:` suggestion
  `[plan, implement, verify]`, `applies_to: [page, component]` — confirm;
  (c) `fails_when` bullets to carry to the catalog entry (draft them from the
  proposal: skeleton/spinner visible alongside the empty-state heading;
  heading/subtext readable as loading or as a permissions error; empty state
  with list chrome that reads as loading).
- **EVD-1**: (a) **control vs harness rule** — a new `EVD` category prefix is a
  schema + categories change and sets precedent that *process evidence* (not
  UI properties) can be a control; the alternative is a harness rule: a
  MANDATORY evidence-set requirement written into `design/verify.md` +
  `docs/decisions/TEMPLATE.md`'s evidence ledger + a `checks/audit-record.py`
  assertion (deterministic, same enforcement teeth, no catalog change).
  Present both with this trade-off; recommend the harness-rule option as the
  default (keeps the catalog about the product surface; the record stays as
  the spec either way) but the gate decides. (b) if control: tier L1
  deterministic as proposed, `applies_to: [flow]`, `phase: [verify]`.

**Verify**: `python3 checks/validate.py` → `OK: 53 controls valid` (records
reference proposed ids in prose; validate.py's cross-ref sweep tolerates
`CMP-4` here only if written as proposed-id placeholders per the idn-4 record's
`IDN-N` note — if validate flags the literal `CMP-4`/`EVD-1` strings in the new
records, use the `CMP-N`/`EVD-N` placeholder convention from that record and
note the assignment at the gate). Catalog and `standards/` untouched:
`git status --short harness/standards/` → empty.

### Step 2: GATE — design-lead approval (STOP here when unattended)

Present both records to the design lead (Reza Ilmi). This is a hard gate:

- **Attended session**: walk through each record's open questions; record the
  decision inline in the record ("Approved by: … / decisions: …"), exactly as
  the idn-4 record does.
- **Unattended run**: STOP after Step 1. Mark the plans/README row
  `DONE-AS-PROPOSED (gate-pending: design lead)` — the 053/057 pattern. Do not
  proceed to Step 3.

### Step 3: Commit the approved catalog changes (only per the gate's decisions)

For CMP-4 (if approved):
1. Append the catalog entry in the reserved slot (replace the reservation
   comment with the entry; keep a one-line provenance comment above it citing
   the record and approval date, matching the style of the IDN-2..4 comment
   block). Fields per the gate's decisions; `verify:` must name both halves
   (DOM assertion — manual until a script exists; evaluator judgment) and
   `detail: controls/cmp-4.md`.
2. Create `standards/controls/cmp-4.md` — frontmatter repeats the catalog entry
   verbatim (validate.py enforces this); body per `standards/README.md` format,
   structure copied from `controls/cmp-7.md`; the Rationale quotes the
   triggering evidence; "Fails when" carries concrete negative examples from
   the proposal.

For EVD-1, per the gate's choice:
- **Control path**: add `EVD` to `schema.json` `id_prefixes` and
  `meta.categories` in catalog.yaml (`EVD: Evidence`); entry + detail file as
  above. Check `validate.py --self-test` still passes; if a self-test fixture
  hardcodes the prefix list, update it in the same commit.
- **Harness-rule path**: no catalog change. Instead: add the evidence-set
  requirement to `design/verify.md` (screenshots must include loading, success,
  and error frames when CMP-3 is in scope; video or named-human attestation are
  acceptable substitutes) and a matching REQUIRED row/assertion in
  `docs/decisions/TEMPLATE.md`'s evidence ledger. If you add an
  `audit-record.py` assertion, CONTRIBUTING's corpus rule applies: run
  `python3 checks/audit-record.py` over the REAL corpus and either migrate the
  existing records honestly or grandfather explicitly — never ship an
  assertion the corpus fails.

Count bumps in the same commit: update every `<N> controls` claim in
`harness/README.md` (and `docs/index.html` if plan 064 landed) to the new
count; validate.py's `[COUNT-SYNC]` enforces this. Add a `CHANGELOG.md`
Unreleased entry.

**Verify**: `python3 checks/validate.py` → `OK: <new N> controls valid`;
`python3 checks/validate.py --self-test` → OK; `pnpm build` (repo root) → 0.

### Step 4: Wire the new control(s) into the loop (body-only)

- `design/SKILL.md`: name CMP-4 where empty states are discussed (the loop's
  implement/verify guidance) — one line, catalog-cite style.
- `evaluator.md`: add CMP-4's judgment half to the graded judgment controls
  (could a first-time user mistake this for loading or no-access?).
- `critique/pass.md` consumers pick controls by phase/scope filter — verify no
  edit is needed there (read it; if it enumerates CMP ids anywhere, add CMP-4).
- EVD-1 wiring per the gate's path (Step 3 already covers the harness-rule
  path; the control path needs a `design/verify.md` line citing EVD-1).

**Verify**: `grep -rn "CMP-4" harness/.claude/ | wc -l` ≥ 2; no
`description:` lines changed (`git diff <base>..HEAD -- harness/.claude/skills | grep '^[+-]description:'` → empty).

### Step 5: Close the loop on the records

1. In `docs/decisions/student-notes-empty-state.md`, update ONLY the two
   `[proposed — pending design-lead approval]` markers to
   `[approved — <date>, see docs/catalog-changes/<record>.md]` or
   `[rejected — <reason> — <date>]` per the gate. Touch nothing else in the
   record. Run `python3 checks/audit-record.py` → still OK.
2. Run `python3 checks/reaudit-scope.py CMP-4` (and `EVD-1` if a control) and
   paste the output into the catalog-change record as the re-audit set —
   shipped surfaces (the four decision records' pages) are silently
   out-of-date until re-run; the record names them for the design lead.

**Verify**: `python3 checks/audit-record.py` → `OK: <N> records audited`.

## Test plan

- No new test files. Gates: validate.py (+ self-test), audit-record.py over the
  real corpus (mandatory if any assertion changed — CONTRIBUTING's
  corpus-scanning rule), pnpm build, and the negative check that `standards/`
  is untouched until the gate clears.

## Done criteria

Machine-checkable. ALL must hold (post-gate items conditional as marked):

- [ ] Two records exist in `harness/docs/catalog-changes/` with the full
      proposal spec and gate questions
- [ ] `python3 checks/validate.py` exits 0 both after Step 1 (53) and after
      Step 3 (new count)
- [ ] Gate outcome recorded in both records (approved/adjusted/rejected + date)
      — or plans/README row says `DONE-AS-PROPOSED (gate-pending)`
- [ ] [if CMP-4 approved] catalog entry + `controls/cmp-4.md` exist; frontmatter
      matches the catalog verbatim; `grep -rn "CMP-4" harness/.claude/ | wc -l` ≥ 2
- [ ] [if EVD-1 harness-rule] `design/verify.md` and `docs/decisions/TEMPLATE.md`
      carry the evidence-set requirement; `python3 checks/audit-record.py` exits 0
      over the real corpus
- [ ] Every `<N> controls` prose claim equals the catalog count (validate.py green)
- [ ] `pnpm build` exits 0
- [ ] `harness/plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Unattended and the gate is not cleared → stop after Step 1 (this is the
  expected unattended outcome, not a failure).
- The reservation comment at catalog.yaml ~397 is gone or CMP-4 already exists
  in the catalog (someone ratified it first — reconcile, don't duplicate).
- The decision-record proposals at lines 208-250 don't match the excerpts here.
- validate.py rejects the EVD prefix in a way the schema.json edit doesn't fix.
- An audit-record assertion you added fails on the real corpus and migration
  would require fabricating evidence — grandfather explicitly or stop.

## Maintenance notes

- Follow-up (not this plan): a deterministic check for CMP-4's DOM half
  (skeleton/spinner co-present with empty-state heading) and, if EVD-1 became a
  control, an evidence-set check — queue them behind plan 067's `enforced:`
  field so the gap stays machine-visible.
- Reviewer should scrutinise: the catalog entry vs the proposal wording (no
  silent scope drift during transcription); the tier decision recorded with
  reasons; the re-audit set actually listed in the record.
- If EVD-1 lands as a harness rule, the `EVD` prefix stays unused — record
  that in the evd-1 record so a future proposal doesn't half-adopt it.
