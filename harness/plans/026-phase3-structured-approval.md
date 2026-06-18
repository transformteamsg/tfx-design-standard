# Plan 026: Phase-3 plan approval is a structured Approve / Adjust in the follow-up turn

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 5f95350..HEAD -- harness/.claude/skills/tfx-design-ui/SKILL.md`.
> If Phase 3 changed since this plan was written, compare against the "Current
> state" excerpts before editing; on a mismatch, STOP. The in-flight craft batch
> adds a Phase 3 "Interaction plan" bullet to the plan-*contents* list (above the
> approval block) — that does not touch the approval block below, so your excerpts
> should still match; if they don't, STOP. Paths are relative to the harness root.

## Status

- **Priority**: P2 (issue #5 / HF-6 re-raised)
- **Effort**: S
- **Risk**: LOW (skill prose) — but it **changes the documented Phase-3 gate
  mechanics**, a normative loop-gate change → flag for design-lead review per
  `CONTRIBUTING.md` "Skill and doc edits".
- **Depends on**: none (refines plan 015, which added the structured-question
  preference; DONE)
- **Category**: docs (normative — loop gate)
- **Planned at**: commit `5f95350`, 2026-06-17

## Why this matters

HF-6, re-raised in issue #5: the Phase-3 plan approval should be a structured
`AskUserQuestion` (**Approve / Adjust**) in the **follow-up turn** — plan presented in
turn 1, the structured ask in turn 2 — not the current plain-text "type an answer"
close. The harness already (a) forbids an option dialog **in the same turn as** the
plan (the reader must read the plan first) and (b) says a structured Approve / Adjust
is *preferred* at the Phase-2 pick and at continuation/verify gates — but it stops
short of making the structured ask the Phase-3 default, leaving Phase-3 sign-off as
free text. This plan reconciles the two: the same-turn prohibition stays; the
structured Approve / Adjust becomes the documented **default for Phase-3 sign-off, in
the next turn**, with free-text approval still accepted. A structured ask makes the
gate unmistakable (Approve vs Adjust, not a vague "continue") while honouring the
read-the-plan-first rule.

## Current state

`.claude/skills/tfx-design-ui/SKILL.md`, "## Phase 3 — Plan (human gate)":

- **Block A — the approval instruction (lines 220–228)**:
  ```
  **Stop. The user approves the plan before any implementation.** This is the cheapest
  place for human judgment — structural mistakes caught here cost a conversation, not a
  rebuild. **Present first, ask second**: the full plan goes in your message body, and
  the approval ask is a plain-text question at the END of that same message — never a
  modal/option dialog in the same turn as the plan, which forces a decision before the
  reader has read what they're deciding on. Wait for an explicit typed answer — a vague
  "continue" is not plan sign-off; confirm what they are approving. (Option dialogs are
  fine for the Phase 2 pick, where the options are short enough to read inside the
  dialog itself.)
  ```
- **Block B — the structured-question note (lines 230–234)**:
  ```
  At the Phase 2 option pick and at continuation/verify gates, a structured
  **Approve / Adjust** question is preferred over free text. Never use an option
  dialog in the *same turn* as the Phase 3 plan (the reader must read the plan
  first) — there, the plan goes in the message body and the ask is plain text at
  the end, as above.
  ```
- **Unchanged — the unattended proxy-approval paragraphs (lines 236–246)**: these
  describe the no-human-reachable case; leave them as-is. The follow-up-turn ask is
  the *attended* default and does not replace proxy approval.

### Repo conventions to honour

- Second person, plain language, Singapore English, no AI-writing tells (SLP-9).
- "AskUserQuestion" / "Approve / Adjust" are the harness's existing terms for the
  structured ask (Block B already uses "Approve / Adjust"). Reuse them.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` (harness root) |
| **Edit landed** (load-bearing — 0 pre-edit) | `grep -ic "follow-up turn\|next turn\|turn 2\|second turn" .claude/skills/tfx-design-ui/SKILL.md` | ≥ 1 — absent before the edit, so this is the real proof |
| Both target blocks landed | `grep -c "Approve / Adjust" .claude/skills/tfx-design-ui/SKILL.md` | ≥ 2 — file has **1** pre-edit (in Block B, which Step 2 replaces); reaching 2 needs **both** Step 1 and Step 2 to land. A count of 1 means one block didn't land — check Steps 1 and 2 separately |
| Same-turn prohibition retained (GUARD ONLY — 2 pre-edit) | `grep -ic "same turn\|same-turn" .claude/skills/tfx-design-ui/SKILL.md` | ≥ 1 — confirms you didn't delete the rule; does NOT prove the rewrite |

## Scope

**In scope** (the only file you modify):
- `.claude/skills/tfx-design-ui/SKILL.md` — Block A and Block B (the Phase-3 approval
  instruction and the structured-question note) only.

**Out of scope** (do NOT touch):
- The unattended proxy-approval paragraphs (236–246) and everything else in Phase 3
  (the plan-contents list, the decision-record write).
- Any other phase, the catalog, checks, or other skills.
- The actual `AskUserQuestion` tool behaviour — this is documentation of *when/how*
  to use it, not a code change.

## Git workflow

- Branch: `advisor/026-phase3-structured-approval`. Conventional commits
  (`docs: Phase-3 approval is a structured Approve/Adjust in the follow-up turn (HF-6)`).
  Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Rewrite Block A so the gate is plan-now, structured-ask-next-turn

Replace Block A (lines 220–228) with a version that keeps the same-turn prohibition
and the "confirm what they're approving" intent, but makes the structured ask the
follow-up-turn default. Target shape:

```markdown
**Stop. The user approves the plan before any implementation.** This is the cheapest
place for human judgment — structural mistakes caught here cost a conversation, not a
rebuild. The gate runs across **two turns**:

- **Turn 1 — present the plan.** The full plan goes in your message body. Close with
  a plain-text line that you will ask for approval next — **never a modal/option
  dialog in the same turn as the plan**, which forces a decision before the reader
  has read what they're deciding on.
- **Turn 2 — the structured ask.** In the follow-up turn, ask for sign-off with a
  structured **Approve / Adjust** `AskUserQuestion` — this is the documented Phase-3
  default. "Approve" proceeds to implement; "Adjust" sends you back to revise the
  plan (then re-present and re-ask). A free-text approval is still accepted; a vague
  "continue" is not — confirm what they are approving.
```

### Step 2: Update Block B so it names Phase 3 alongside the other gates

Replace Block B (lines 230–234) so the structured-Approve/Adjust preference now
includes Phase 3 (in the follow-up turn) and still forbids the same-turn dialog:

```markdown
A structured **Approve / Adjust** question is the default at the Phase 2 option pick,
at the Phase 3 plan gate (in the follow-up turn, per the two-turn sequence above), and
at continuation/verify gates. The one hard rule: **never an option dialog in the same
turn as the Phase 3 plan** — the reader must read the plan first, so turn 1 is the
plan in the message body and turn 2 is the structured ask. (At the Phase 2 pick the
dialog may be same-turn, because the options are short enough to read inside it.)
```

**Verify**: the four greps in the Commands table return their expected counts;
`claude plugin validate .` passes.

### Step 3: Confirm the proxy-approval paragraphs still read coherently

Read lines 236–246 (unattended proxy approval). Confirm the new two-turn attended
default does not contradict them — proxy approval remains the no-human-reachable path
and is recorded verbatim as before.

**Verify**: read-through; `claude plugin validate .` passes.

## Test plan

No code/tests. Gates: `claude plugin validate .` passes; the grep checks; a
read-through confirming (a) turn 1 = plan + plain-text close, turn 2 = structured
Approve / Adjust, (b) the same-turn prohibition is intact, (c) "Adjust" has a defined
route back to revision, (d) proxy approval (unattended) is untouched, (e) Singapore
English, no AI-writing tells.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] **(load-bearing, 0 pre-edit)** `grep -ic "follow-up turn\|next turn\|turn 2\|second turn" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1
- [ ] `grep -c "Approve / Adjust" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 2 (1 pre-edit; both Step-1 and Step-2 blocks must land — a count of 1 means one didn't)
- [ ] (guard only — 2 pre-edit) `grep -ic "same turn\|same-turn" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1 (proves the rule wasn't deleted)
- [ ] "Adjust" has an explicit route back to plan revision (read-through)
- [ ] The unattended proxy-approval paragraphs are unchanged
- [ ] `claude plugin validate .` passes
- [ ] Only `tfx-design-ui/SKILL.md` modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- Block A or Block B differs from its "Current state" excerpt (drift) — reconcile
  against the live Phase-3 section first.
- The proxy-approval paragraphs are entangled with Block A/B such that editing one
  forces editing the other — report rather than expanding scope.

## Maintenance notes

- This is the attended default. Keep it reconciled with the unattended proxy-approval
  path (don't let a future edit make the structured ask mandatory in unattended runs,
  where no human is reachable to answer it).
- If the harness later standardises a single approval helper, this is the canonical
  description of the Phase-3 gate to point it at.
- A reviewer should confirm the same-turn prohibition survives — it is the rule HF-6
  is explicitly reconciling with, not removing.
