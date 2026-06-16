# Plan 015: Conservative, reversible defaults in autonomous runs — a reviewable diff summary, no silent restyles, structured gate questions

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat a8ca4fa..HEAD -- harness/.claude/skills/tfx-design-ui/SKILL.md harness/.claude/skills/tfx-design-review/SKILL.md`.
> If Phase 3, Phase 4, or the review-skill Originality grade changed since this
> plan was written, compare the "Current state" excerpts against the live files;
> on a mismatch, treat it as a STOP condition. All paths below are relative to the
> harness root (`harness/` in the dev repo; the plugin root when installed).

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: LOW (skill/review prose; no code, no catalog change)
- **Depends on**: none (complements plan 013 critique-first and plan 014 inventory)
- **Category**: dx
- **Planned at**: commit `a8ca4fa`, 2026-06-15

## Why this matters

Every autonomous run here proxied the Phase-3 human gate, and the cost showed up
as **post-build user corrections**: a set of semantic colour-coded header icons
neutralised to a single `bg-muted` chip for "anti-slop" (the colours were
deliberate, decorative `aria-hidden` wayfinding — the user reversed it); an
enlarged section radius; a duplicated metric label. These are exactly the cheap
structural/aesthetic calls the gate exists to catch *before* code. In unattended
mode the cheap-correction moment is absent, so the harness must (a) emit a
compact, **reviewable plan + intended-diff summary** for async sign-off rather
than treating proxy approval as equivalent to review, and (b) bias to
**conservative, reversible defaults** — never restyle established iconography,
corner radius, layout, or established copy without explicitly flagging each as a
proposed change with its rationale. The semantic-icon reversal is the canonical
instance of (b). This plan also pins the gate-question UX (structured
Approve/Adjust where the existing rules already allow it).

## Current state

`.claude/skills/tfx-design-ui/SKILL.md` and `.claude/skills/tfx-design-review/SKILL.md`
— the relevant text (verbatim):

- Phase 3 proxy-approval recording is **already present** (`tfx-design-ui/SKILL.md:166-171`):
  *"In an **unattended run** with no human reachable, proxy approval is permitted
  only when the operator authorized it up front — record it verbatim as 'approved
  by operator proxy — unattended run' in the decision record, never as if a human
  approved."* So the **recording** is covered; what is MISSING is the
  conservative-defaults rule and the async plan/diff summary.
- The "present first, ask second" + option-dialog caveat (`tfx-design-ui/SKILL.md:162-168`):
  *"the full plan goes in your message body, and the approval ask is a plain-text
  question at the END of that same message — never a modal/option dialog in the
  same turn as the plan … (Option dialogs are fine for the Phase 2 pick, where the
  options are short enough to read inside the dialog itself.)"* — the constraint
  any gate-question note must respect (HF-6).
- Phase 4 build constraints (`tfx-design-ui/SKILL.md:181-227`) — where the
  conservative-defaults rule belongs; today the anti-slop bullet (`:189-195`) says
  "the default AI aesthetic is a defect" but nothing protects *established,
  deliberate* product choices from being restyled in its name.
- Review-skill Originality grade (`tfx-design-review/SKILL.md:64-70`): *"Slop is
  control-backed since the catalog consolidation: where the generic-AI tell
  matches an SLP control (SLP-1..10), cite the control id …"* — the right home for
  a "deliberate semantic colour-coding is not slop" do-not-flag note.
- `standards/catalog.yaml:435-446` — SLP-1 ("No purple/violet gradient palettes,
  cyan-on-dark theming, or glow accents"); **no detail file**. The semantic-icon
  clarification belongs in the review skill's guidance, **not** a reword of SLP-1
  (do not touch the catalog).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` (run from harness root) |
| Diff-summary rule present | `grep -c "intended-diff\|reviewable plan summary" .claude/skills/tfx-design-ui/SKILL.md` | ≥ 1 |
| Conservative-defaults rule present | `grep -c "do not restyle established\|conservative" .claude/skills/tfx-design-ui/SKILL.md` | ≥ 1 |
| Semantic-icon do-not-flag present | `grep -c "semantic colour-coding" .claude/skills/tfx-design-review/SKILL.md` | ≥ 1 |
| Gate-question note present | `grep -c "Approve / Adjust\|Approve/Adjust" .claude/skills/tfx-design-ui/SKILL.md` | ≥ 1 |

## Scope

**In scope** (the only files you modify):
- `.claude/skills/tfx-design-ui/SKILL.md` — Phase 3 (autonomous diff summary +
  gate-question note) and Phase 4 (conservative-defaults rule).
- `.claude/skills/tfx-design-review/SKILL.md` — the semantic-colour-coding
  do-not-flag note in the Originality grade.

**Out of scope** (do NOT touch):
- `standards/catalog.yaml` and SLP-1 — the semantic-icon point is evaluator
  guidance, not a control reword.
- The proxy-approval *recording* text (`:166-171`) — already correct; add beside
  it, don't rewrite it.
- `checks/` scripts; the critique-first step (plan 013) and inventory (plan 014)
  — reference, don't rewrite.

> **Coordination**: edits `tfx-design-ui/SKILL.md` (also touched by plans
> 010/012/013/014/017/018/019) and `tfx-design-review/SKILL.md` (also 014/018).
> Executors of overlapping plans should rebase, not clobber.

## Git workflow

- Branch: `advisor/015-conservative-defaults`. Conventional commits
  (`docs: conservative defaults + intended-diff summary for autonomous runs`).
  Do NOT push.

## Steps

### Step 1: Require a reviewable plan + intended-diff summary in unattended runs

In `.claude/skills/tfx-design-ui/SKILL.md` Phase 3, beside the proxy-approval
sentence (`:166-171`), add:

```markdown
Proxy approval is not a substitute for review. In an unattended run, still emit a
**compact, reviewable plan + intended-diff summary** for async sign-off: the files
to be touched, the specific visual/structural changes, and — explicitly — what is
being **preserved**. Route it to the async reviewer (the portfolio designer) and
record that it was sent; do not treat "operator proxy" as equivalent to a human
having read the diff.
```

**Verify**: `grep -c "intended-diff\|reviewable plan summary" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1.

### Step 2: Add the conservative-defaults rule to Phase 4

In Phase 4 — Implement (`:181-227`), add a constraint bullet:

```markdown
- **Conservative, reversible defaults — do not restyle what is already
  deliberate.** Established iconography, corner radius, layout structure, and
  settled copy are presumed intentional: do not change them as a side effect of a
  scoped task. If a change to one is genuinely warranted, flag it explicitly as a
  *proposed* change with its rationale and a one-line revert note in the plan/diff
  summary — never silently. Default to the smallest reversible change that meets
  the contract. (Example: per-section semantic colour-coded icons that are
  decorative `aria-hidden` wayfinding are **not** SLP-1 "rainbow slop" — preserve
  them; neutralising them is a restyle to flag, not a default.)
```

**Verify**: `grep -c "do not restyle established\|conservative" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1.

### Step 3: Tell the evaluator not to flag deliberate semantic colour-coding

In `.claude/skills/tfx-design-review/SKILL.md`, in the Originality grade
(`:64-70`), add:

```markdown
  **Do not flag** deliberate semantic colour-coding as slop: per-section or
  per-status colour that is decorative (`aria-hidden`) wayfinding, or functional
  status colour from the Radix scales (COL-2), is intentional design — it is not
  the SLP-1 "rainbow"/gradient AI tell. Flag *unmotivated* multi-hue decoration,
  not a deliberate colour system.
```

**Verify**: `grep -c "semantic colour-coding" .claude/skills/tfx-design-review/SKILL.md` → ≥ 1.

### Step 4: Pin the structured gate-question UX (HF-6)

In Phase 3, near the present-first-ask-second caveat (`:162-168`), add one line:

```markdown
At the Phase 2 option pick and at continuation/verify gates, a structured
**Approve / Adjust** question is preferred over free text. Never use an option
dialog in the *same turn* as the Phase 3 plan (the reader must read the plan
first) — there, the plan goes in the message body and the ask is plain text at
the end, as above.
```

**Verify**: `grep -c "Approve / Adjust\|Approve/Adjust" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1.

## Test plan

No code/tests. Gates: `claude plugin validate .` passes; the four grep checks; a
read-through confirming the new Phase 3/4 prose does not contradict the existing
proxy-approval and present-first-ask-second rules (it extends them).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -c "intended-diff\|reviewable plan summary" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1
- [ ] `grep -c "do not restyle established\|conservative" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1
- [ ] `grep -c "semantic colour-coding" .claude/skills/tfx-design-review/SKILL.md` → ≥ 1
- [ ] `grep -c "Approve / Adjust\|Approve/Adjust" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1
- [ ] `claude plugin validate .` passes
- [ ] Only the two in-scope files modified (`git status`); `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- Phase 3, Phase 4, or the review Originality grade differ from the "Current
  state" excerpts (drift) — insertion points may have moved.
- The conservative-defaults rule appears to conflict with the anti-slop bullet
  (`:189-195`) — it does not (anti-slop targets the *default AI aesthetic*;
  this protects *established deliberate* choices), but if the prose collides,
  STOP and report rather than weakening either.
- You are tempted to reword SLP-1 in the catalog to carry the semantic-icon
  exception — that is a design-lead catalog change; keep it as evaluator guidance
  and STOP if it seems to require a catalog edit.

## Maintenance notes

- This rule and plan 013's critique-first step are the two halves of "look before
  you change": 013 makes the run *see* the current state; 015 makes it *preserve*
  what's deliberate unless flagged. Keep their language consistent if either is
  revised.
- When the component manifest (plan 019) lands, "established iconography/component"
  becomes partly mechanical (a manifest entry's `status`) — revisit whether the
  conservative-defaults rule can cite it.
- Reviewer should confirm the conservative-defaults rule doesn't become an excuse
  to skip warranted fixes — it requires *flagging*, not avoiding, real changes.
