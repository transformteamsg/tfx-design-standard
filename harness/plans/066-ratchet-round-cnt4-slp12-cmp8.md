# Plan 066: Ratchet round — propose CNT-4 (domain fidelity), a cross-user HTML-sanitisation control, and CMP-8 (draft safety / escapability) — design-lead gated

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `harness/plans/README.md` — unless a reviewer dispatched you and told you
> they maintain the index.
>
> **Drift check (run first)**: `git diff --stat e673294..HEAD -- harness/standards/ harness/docs/catalog-changes/ harness/.claude/skills/flow/SKILL.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW for the propose-only step; MED for the CMP-8 commit (overlap
  with CMP-2/CMP-3 needs careful scoping — see Step 1c)
- **Depends on**: **design-lead gate** (hard, Step 2). Execute after plan 065
  (both bump control counts; sequential avoids `[COUNT-SYNC]` collisions).
  Plan 065 is NOT a logical dependency — only an ordering one.
- **Category**: direction (catalog extension)
- **Planned at**: commit `e673294`, 2026-07-08

## Why this matters

Three evidence-grounded control gaps have accumulated outside the catalog:

1. **Domain fidelity (CNT family)** — GitHub issue **#27** (OPEN, titled
   "Proposed control: domain content must match the real-world artifact it
   models"). Evidence: a mock P1 report graded **Science** (which starts at P3
   in Singapore) and showed a P1 Mathematics LO "Statistics & Probability" —
   both read as fake to a real teacher; two evaluator passes graded this
   ad-hoc against the sprint contract because no control covered it.
2. **Cross-user HTML sanitisation** — GitHub issue **#26** (OPEN, titled
   "Proposed anti-pattern: sanitise user-authored HTML rendered to another
   user"). Evidence: teacher-authored rich text rendered to **parents** via
   `dangerouslySetInnerHTML` in the consumer repo
   (`src/components/reports/report-preview.tsx`), surfaced as UNCOVERED in two
   evaluator passes. No control covers untrusted-HTML rendering across a trust
   boundary — a ship-blocking security gap the catalog is silent on.
3. **Draft safety / escapability (CMP-8)** — the harness's own `flow` pass
   advertises grading "escapability, and draft safety"
   (`flow/SKILL.md:3`) but its dimension-controls list cites only CMP-2,
   CMP-3, A11Y-2, A11Y-11, SLP-10 — none governs unsaved-work protection or a
   non-destructive exit. The Student Notes evaluator observed the code
   preserves the draft on save-error but noted no control grades it (it rode
   on CNT-1 copy); the golden eval `evals/golden/003-broadcast-message.yaml`
   plants "draft is (saved|preserved)" copy expectations while the structural
   guarantee is ungoverned. This is a harness-internal audit finding: a pass
   skill claims to grade dimensions the catalog does not cover.

All three satisfy the ratchet rule (observed failure / audit finding — not
speculation). This plan writes the propose-only records and takes them to the
design-lead gate; the gate also carries one **close-or-promote decision item**
(peer-radius, issue #9) that needs an adjudication, not a proposal.

## Current state

Verified 2026-07-08 at `e673294`:

- Catalog families and next free ids: CNT-1..3 → next **CNT-4**; SLP-1..11 →
  next **SLP-12**; CMP-1..7 with CMP-4 reserved for plan 065 → next free is
  **CMP-8** (do NOT take CMP-4). Read the live catalog for free ids at
  execution time — plans 065 may have landed (the 027 precedent: read, don't
  hardcode).
- Issue #27 body (retrieved 2026-07-08, OPEN): proposes a CNT-family control;
  rule: "Where a surface presents content that models a real-world artifact,
  the content must be faithful to that artifact (correct scope, terminology,
  and structure), or be explicitly labelled as illustrative/placeholder
  in-product and in the decision record. 'Format is right but the specifics
  are invented' is a fail for a surface used in user testing…". Suggests
  **L2 judgment**; detection: named domain reviewer (e.g. HOD) sign-off before
  user testing, or an explicit "illustrative" label.
- Issue #26 body (retrieved 2026-07-08, OPEN): proposes rule: "When content
  authored by one user is rendered to a different user, HTML must be sanitised
  (e.g. DOMPurify with an allowlist) before render. Editor output being
  'schema-constrained' at author time is not sufficient… Acceptable to defer
  in a mock-data prototype if explicitly flagged; required before any ship."
  Suggests **L1**; detection: grep `dangerouslySetInnerHTML` / `v-html` on
  surfaces rendering another user's authored content + sanitiser-in-path
  check.
- `harness/.claude/skills/flow/SKILL.md:13-20` — dimension controls list
  (CMP-2, CMP-3, A11Y-2, A11Y-11, SLP-10); `:22-25` — the reference paragraph
  ends "Escapability is structure, not polish." `CMP-2`
  (catalog.yaml ~367) covers *destructive-action* consequence + undo/confirm
  only; CMP-3 (~382) covers async loading/success/error states — neither
  covers draft preservation on interruption or a non-destructive exit per step.
- `harness/docs/decisions/student-notes-empty-state.md:174` — evaluator
  ADVISORY: the code preserves the draft on failure and the reassurance is
  unstated; no control cited for the preservation itself.
- Issue #9 (OPEN, HF-4): "No radius/shape consistency control across peer
  components… **Ask:** a consistency control anchored to the app's Card
  radius. _Partially addressed: TOK-3 now includes peer-radius consistency.
  HF-19 extends this to general design-system component-default / sibling-page
  consistency._" — i.e. TOK-3's peer clause + CMP-7 may already cover the ask.
- Record exemplar (structure to copy): 
  `harness/docs/catalog-changes/idn-4-casesync-sensitivity.md` — including its
  `IDN-N` placeholder convention: `checks/validate.py`'s cross-ref sweep flags
  any `PREFIX-<digit>` id not in the live catalog, so propose-only records use
  `CNT-N` / `SLP-N` / `CMP-N` placeholders with a "confirm and assign at the
  gate" note.
- Governance (CONTRIBUTING.md): records → design-lead gate → per approved
  control, a two-file change set (catalog entry + detail file) plus every
  restating surface, count bumps, `reaudit-scope.py`, validate green.
- Authoring rules (`standards/README.md`): one control = one verifiable
  statement; "Fails when" anti-patterns mandatory; detail frontmatter repeats
  the catalog entry verbatim. Detail exemplar: `standards/controls/cmp-7.md`.

## Commands you will need

| Purpose | Command (from `harness/`) | Expected on success |
|---|---|---|
| Validator | `python3 checks/validate.py` | `OK: <N> controls valid`, exit 0 |
| Validator self-test | `python3 checks/validate.py --self-test` | `SELF-TEST OK` |
| Re-audit set | `python3 checks/reaudit-scope.py <ID>` (post-commit) | record list; exit 0 |
| Issue text (evidence refresh) | `gh issue view 27 --repo transformteamsg/tfx-design-standard --json title,state,body` | JSON with body |
| Website build (repo root) | `pnpm build` | exit 0 |

## Scope

**In scope** (post-gate items conditional):
- `harness/docs/catalog-changes/cnt-4-domain-fidelity.md` (create)
- `harness/docs/catalog-changes/cross-user-html-sanitisation.md` (create)
- `harness/docs/catalog-changes/cmp-8-draft-safety-escapability.md` (create)
- [post-gate] `harness/standards/catalog.yaml`, `harness/standards/controls/<id>.md`
  per approved control
- [post-gate] restating surfaces: `harness/.claude/skills/flow/SKILL.md`
  (cite CMP-8), `harness/.claude/skills/copy/SKILL.md` (cite CNT-4),
  `harness/.claude/agents/evaluator.md` (judgment halves),
  `harness/.claude/skills/design/SKILL.md` (sanitisation control in implement
  guidance) — body-only
- [post-gate] `harness/README.md` / `harness/docs/index.html` count bumps,
  `harness/CHANGELOG.md`
- `harness/plans/README.md` (status row)

**Out of scope**:
- The consumer repo (`report-preview.tsx` etc.) — evidence, not a target.
- New check scripts (the #26 grep detector is a follow-up; note it in the
  record's verification section as "planned"; the control lands
  evaluator/manual-verified like CMP-7 did).
- CMP-4/EVD-1 (plan 065), any existing control's wording, any `description:`
  frontmatter.
- GitHub issue state changes (closing #26/#27/#9 is the design lead's call —
  the records reference the issues; suggest closure text in your report, do
  not run `gh issue close`).

## Git workflow

- Branch: `catalog/ratchet-round-cnt4-slp12-cmp8`
- Record commits separate from post-gate catalog commits (053/057 pattern).
- Do NOT push, open PRs, or mutate issues.

## Steps

### Step 1: Write the three propose-only records

Model all three on `docs/catalog-changes/idn-4-casesync-sensitivity.md`
(placeholder ids, full proposed YAML entry, tier rationale, verification, open
questions, "Approved by: — pending"). Specifics per record:

**(a) `cnt-4-domain-fidelity.md`** — from issue #27, faithfully:
- Proposed entry: `CNT-N` (expected 4), tier **L2**, check **judgment**,
  `phase: [intent, implement, verify]`, `applies_to: [content]`.
- Title draft: "Content that models a real-world artifact is faithful to it
  (scope, terminology, structure) or explicitly labelled illustrative".
- `fails_when` drafts: a curriculum/subject/level detail a practitioner would
  recognise as wrong (e.g. a subject graded at a level where it isn't taught);
  invented specifics presented as real in a user-testing surface; placeholder
  content with no illustrative label.
- Verification: evaluator + named domain reviewer sign-off before user
  testing, or the illustrative label present. Open question for the gate:
  where the domain-reviewer attestation is recorded (decision-record evidence
  ledger row is the natural place).
- Evidence: quote issue #27's evidence paragraph verbatim; cite the issue URL.

**(b) `cross-user-html-sanitisation.md`** — from issue #26, faithfully:
- Proposed entry: placeholder id with the **category as an explicit gate
  question**: the issue says "anti-pattern entry" (SLP), but SLP's charter is
  the default-AI-aesthetic ("slop"), not security; CMP ("components &
  patterns") or a CNT fit is arguable. Present options **SLP-N vs CMP-N**
  with a recommendation for **CMP-N** (it is a component/render-boundary
  pattern rule, and keeps SLP aesthetically coherent); the gate decides.
- Tier **L1**, check **hybrid** (deterministic grep half + judgment
  render-boundary read), `phase: [implement, verify]`,
  `applies_to: [component, flow]`.
- Title draft: "Content authored by one user and rendered to another is
  sanitised at the render boundary; author-time schema constraints are not
  sufficient".
- `fails_when` drafts: `dangerouslySetInnerHTML`/`v-html` rendering another
  user's authored content with no sanitiser in the render path; sanitisation
  claimed at editor time only; a prototype deferral with no recorded flag.
- Verification: grep detector (planned — name it in the record; e.g. a
  detect.py rule) + evaluator judgment; waiver `documented` per L1.
- Evidence: quote issue #26's evidence paragraph verbatim; cite the issue URL.

**(c) `cmp-8-draft-safety-escapability.md`** — from the harness audit finding:
- Proposed entry: `CMP-N` (expected 8), tier **L1**, check **hybrid**,
  `phase: [plan, implement, verify]`, `applies_to: [flow]`.
- Title draft: "A multi-step or data-entry task offers a non-destructive exit
  at every step, and in-progress work is preserved or explicitly discarded on
  interruption — never silently lost".
- **Deconfliction section (mandatory — this is the MED-risk area)**: CMP-2
  keeps the *destructive-action* consequence/undo clause (deleting a thing);
  CMP-8 covers *the user's in-progress work* (drafts, wizard state) and *the
  ability to leave*. An explicit-discard confirmation ("Discard draft?") is
  CMP-8 surface but its confirm mechanics follow CMP-2. A11Y-11 keeps focus/
  announcement; SLP-10 keeps page-vs-modal. State these boundaries in the
  record so the gate approves scoped text, not a blur.
- `fails_when` drafts: a wizard/dialog with no cancel/back at some step;
  navigation away silently dropping typed content; an interrupted flow that
  resumes from zero with no warning at exit time; escape/close discarding a
  draft with no confirm (ties to CMP-2's mechanics).
- Evidence: `flow/SKILL.md:3` vs its control list (the pass grades dimensions
  no control covers — quote both); `student-notes-empty-state.md:174`
  (draft-preservation observed, ungraded); golden 003's draft-copy plants.
- Open question: L1 vs L2 (recommend L1 — losing a teacher's typed work is a
  trust breach, same class as CMP-2's L0 rationale but recoverable, hence L1
  not L0).

**Verify**: `python3 checks/validate.py` → `OK: 53 controls valid` (or the
post-065 count) — the records must not trip the cross-ref sweep (use
placeholder ids); `git status --short harness/standards/` → empty.

### Step 2: GATE — design-lead approval (STOP here when unattended)

Present the three records plus one decision item:

- **Decision item (no record needed): issue #9 / peer radius.** Ask: is the
  ask now covered by TOK-3's peer-radius clause + CMP-7's sibling-consistency
  control (both landed after #9 was filed)? Recommend: confirm covered, close
  #9 citing both controls. Alternative: promote a dedicated LAY-8; only if the
  lead wants it does a record get written (a follow-up, not this plan).

Unattended: STOP after Step 1; mark the row
`DONE-AS-PROPOSED (gate-pending: design lead)`.

### Step 3: Commit approved controls (per gate decisions; skip rejected ones)

Per approved control, the CONTRIBUTING change set:
1. Catalog entry (id assigned at the gate — read the live catalog for the next
   free number; provenance comment above the entry citing the record + date).
2. `standards/controls/<id>.md` — frontmatter verbatim from the catalog;
   structure per `controls/cmp-7.md`.
3. Restating-surface wiring (body-only):
   - CMP-8 → add to `flow/SKILL.md`'s dimension-controls list (this closes the
     pass↔catalog asymmetry that grounded it) and to the evaluator's judgment
     grading.
   - CNT-4 → cite in `copy/SKILL.md`'s pass subset and the evaluator.
   - Sanitisation control → cite in `design/SKILL.md` implement guidance and
     the evaluator; note the planned grep detector in `checks/README.md`'s
     "not built yet" area only if that file already lists planned checks (do
     not restructure it).
4. Count bumps everywhere `[COUNT-SYNC]` enforces + `CHANGELOG.md` entry.
5. `python3 checks/reaudit-scope.py <ID>` per new control; paste output into
   its record (the re-audit set: shipped records silently out of date).

**Verify**: `python3 checks/validate.py` → `OK: <new N> controls valid`;
self-test OK; `pnpm build` → 0; `grep -rn "CMP-8\|CNT-4" harness/.claude/`
≥ 1 hit per approved id; no `description:` changes.

## Test plan

No new test files. Gates as in Step verifies. If the gate approves the
sanitisation control with a detect.py rule in-plan (it should NOT — the
detector is out of scope), STOP: that's a scope change.

## Done criteria

- [ ] Three records exist, each with full proposed entry, evidence quoted
      verbatim, deconfliction (for CMP-8), and gate questions
- [ ] `python3 checks/validate.py` exits 0 after Step 1 with catalog untouched
- [ ] Gate outcomes recorded per proposal (+ the #9 adjudication noted in your
      report) — or row marked `DONE-AS-PROPOSED (gate-pending)`
- [ ] [per approved control] entry + detail file + wiring + counts + re-audit
      set, validate green, build green
- [ ] No `description:` frontmatter changed; no issue mutated; consumer repo
      untouched
- [ ] `harness/plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Unattended at Step 2 (expected stop, not a failure).
- `gh issue view 26`/`27` shows the issue CLOSED or its body materially
  different from the excerpts here — the proposal may have been handled;
  reconcile first.
- The live catalog's next free CNT/SLP/CMP numbers differ from expectations in
  a way the records' placeholder notes can't absorb.
- CMP-8's deconfliction with CMP-2 cannot be stated as two non-overlapping
  verifiable statements — report the overlap rather than shipping a blurred
  control (authoring rule 1).
- Plan 065's branch is unmerged and also edits catalog.yaml/README counts —
  sequence behind it or rebase; never resolve a count conflict by hand-picking.

## Maintenance notes

- The sanitisation control's grep detector (detect.py rule or standalone) is
  the natural next check-script plan; queue it behind plan 067's `enforced:`
  field.
- CMP-8 makes the flow pass's advertised dimensions fully control-backed;
  reviewer should re-read `flow/SKILL.md:3` against the final list — if the
  gate rejects CMP-8, the honest alternative is to soften the flow pass's
  description (a description change → full routing sweep → separate plan).
- If CNT-4 lands, the decision-record TEMPLATE's evidence ledger gains a
  domain-reviewer attestation row only if the gate asked for it — don't add
  template fields speculatively.
