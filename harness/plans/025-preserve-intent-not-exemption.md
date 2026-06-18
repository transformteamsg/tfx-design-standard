# Plan 025: Preserving intent never exempts an element from its controls (generator + evaluator)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 5f95350..HEAD -- harness/.claude/skills/tfx-design-ui/SKILL.md harness/.claude/skills/tfx-design-review/SKILL.md harness/.claude/agents/tfx-design-evaluator.md`.
> If any of these changed since this plan was written, compare against the
> "Current state" excerpts before editing; on a mismatch, STOP. An in-flight
> craft batch adds *adjacent* sections to the UI skill (Phase 2 diverge, a Phase 3
> "Interaction plan" bullet, a Phase 4 "Interface craft" block) — those do not
> touch the two blocks below, so your target excerpts should still match; if they
> don't, STOP. Paths are relative to the harness root.

## Status

- **Priority**: P1 (issue #5 / HF-18 — an L0 contrast fail survived the critique
  and two evaluator passes; caught by a human by eye)
- **Effort**: M
- **Risk**: LOW (skill/agent prose; no code, no catalog change) — but it **changes
  normative meaning** (what "preserve" licenses and what the evaluator must grade),
  so flag for design-lead review per `CONTRIBUTING.md` "Skill and doc edits".
- **Depends on**: none (extends plans 013 critique-first, 014 evaluator enumeration,
  015 conservative-defaults — all DONE)
- **Category**: docs (normative — harness behaviour)
- **Planned at**: commit `5f95350`, 2026-06-17

## Why this matters

HF-18 (issue #5), an L0-risk finding from the attendance loop run: the critique's
"what works — preserve" list **and both** independent evaluator passes preserved /
passed an `AvatarFallback` that overrode the design-system default text colour
(`text-primary-foreground` → `text-foreground`), producing dark initials on a blue
`bg-primary` — an **A11Y-1 contrast fail at 3.32:1** (L0). The fail survived the
critique and two evaluator reads; a human caught it by eye. Two root causes:

1. The conservative-defaults rule ("do not restyle what is already deliberate") was
   read as *exempting* preserved elements from their controls. Preserving the
   **intent** of an element must never exempt it from A11Y-1/-2/-3 or any in-scope
   control — a preserved avatar still needs its contrast verified. The critique's
   "what works" step must **verify**, not assume.
2. The evaluator treated "preserved / established" as a pass reason and waved the
   element through on the builder's say-so; and a contrast fail on the page's **own**
   avatar was wrongly dismissed as "external chrome / out of scope" without
   confirming the element renders outside the surface.

This plan closes both halves: the generator's critique + conservative-defaults rule
(so "preserve" means "don't restyle the look", not "skip the checks"), and the
evaluator's procedure (grade preserved elements; confirm an out-of-scope-chrome
exclusion against where the element actually renders).

## Current state

### File 1 — `.claude/skills/tfx-design-ui/SKILL.md`

- **Block A — the critique step (lines 84–91)**, under "### Existing surfaces:
  critique before you polish":
  ```
  2. **Write a short design critique of what is there** — against the in-scope
     catalog controls *and* Kind Utility: what works and should be preserved
     (call out established iconography, radius, layout, and copy that are
     deliberate — do not "fix" them, cf. the conservative-defaults rule in
     Phase 3/4), and what genuinely underperforms (control violations, hierarchy,
     friction in the teacher's task). Ground each point in the screenshot.
  ```
- **Block B — the conservative-defaults bullet, Phase 4 (lines 264–272)**:
  ```
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

### File 2 — `.claude/skills/tfx-design-review/SKILL.md`

- **Block C — the independent-enumeration paragraph (lines 27–33)**:
  ```
  **independently enumerate the surface's interactive controls** — from the
  component inventory **and** from reading the route's code (you have Read/Grep/
  Glob/Bash). Do not grade only the screenshots you were handed: a control that was
  never photographed is still in scope. Spot-check each interactive control for a
  visible focus state (A11Y-2), role + accessible name (A11Y-8/A11Y-3), and that
  its ARIA state tracks the visual (A11Y-8, per controls/a11y-8.md). A control the
  builder's evidence omits, found this way, is a finding — not an excuse.
  ```
- **Block D — the findings-sort / UNCOVERED rules (lines 41–50)**:
  ```
  **Findings sort by tier and waiver status, never by how you found them:**

  - An in-scope control violated with no waiver on file → **BLOCKING** for L0 and L1,
    **ADVISORY** for L2. An L1 violation is not an advisory just because a waiver
    *could* be written — no waiver on file means blocking; say what a waiver would
    need, don't grant one hypothetically.
  - **UNCOVERED is only for defects no in-scope control covers.** A violation of an
    in-scope control never goes there, even when you verified it manually because its
    script is unbuilt — file it under BLOCKING/ADVISORY per tier and note "verified
    manually" as the evidence source.
  ```

### File 3 — `.claude/agents/tfx-design-evaluator.md`

- **Block E — the independent-enumeration line (lines 25–26)**:
  ```
  independently enumerate the surface's interactive controls from the inventory and the
  route's code; do not limit your review to the screenshots supplied.
  ```

### Repo conventions to honour

- Skill prose is second person, plain language, Singapore English (organise, colour,
  centre), no AI-writing tells (SLP-9). Match the surrounding voice.
- Control ids are cited bare (`A11Y-1`, not "the contrast control"). L0 = AA contrast
  (A11Y-1), keyboard + focus (A11Y-2), labels (A11Y-3), destructive consequence
  (CMP-2) — these bind even on "preserved" elements.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Plugin validation | `claude plugin validate .` | `✔ Validation passed` (harness root) |
| Generator: preserve ≠ exempt (0 pre-edit) | `grep -ic "not.*exempt\|still.*verif\|preserve.*intent\|stays in scope" .claude/skills/tfx-design-ui/SKILL.md` | ≥ 1 (these strings are absent pre-edit — genuine gate) |
| Evaluator: preserved is graded (0 pre-edit) | `grep -ic "not waivers\|on the builder's say-so\|grade it like any other" .claude/skills/tfx-design-review/SKILL.md` | ≥ 1 — anchored to text unique to Step 3a. (Do NOT grep `preserved\|established` here: the word "preserved" already appears at line 105 in an unrelated sentence, so it would pass with no edit.) |
| Evaluator: out-of-scope-chrome check (0 pre-edit) | `grep -ic "renders outside\|external chrome" .claude/skills/tfx-design-review/SKILL.md` | ≥ 1 (dropped the generic "out of scope" so the gate binds to the boundary-confirmation language) |
| Agent line updated (0 pre-edit) | `grep -ic "preserved\|established\|out of scope" .claude/agents/tfx-design-evaluator.md` | ≥ 1 (the agent file is tiny and contains none of these today) |
| Agent names A11Y-1 (0 pre-edit) | `grep -c "A11Y-1" .claude/agents/tfx-design-evaluator.md` | ≥ 1 — A11Y-1 appears 0 times in the agent file today, so this is a genuine gate (do NOT grep A11Y-1 in `tfx-design-ui/SKILL.md`, where it is already common) |

## Scope

**In scope** (the only files you modify):
- `.claude/skills/tfx-design-ui/SKILL.md` — Block A (critique step) and Block B
  (conservative-defaults bullet) only.
- `.claude/skills/tfx-design-review/SKILL.md` — add to Block C / after Block D.
- `.claude/agents/tfx-design-evaluator.md` — extend Block E.

**Out of scope** (do NOT touch):
- The catalog, any control detail file, any check script.
- Any other phase or section of the UI skill (the in-flight craft batch owns Phase 2
  diverge, the Phase 3 "Interaction plan" bullet, and the Phase 4 "Interface craft"
  block — do not edit or conflict with those).
- The evaluator's output format / verdict structure — only the procedure prose.

## Git workflow

- Branch: `advisor/025-preserve-intent`. Conventional commits
  (`docs: preserving intent never exempts an element from its controls (HF-18)`).
  Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Generator — make the critique verify preserved elements

In `.claude/skills/tfx-design-ui/SKILL.md`, extend Block A (the critique step) so the
"what works and should be preserved" clause requires **verification**, not assumption.
Add to that sentence (keep the existing text; insert the new clause):

> … what works and should be preserved (call out established iconography, radius,
> layout, and copy that are deliberate — do not "fix" them, cf. the
> conservative-defaults rule in Phase 3/4) — **but verify, do not assume: every
> element you list as "preserve" stays in scope for its controls, so check it against
> the L0 floor (A11Y-1 contrast especially) before calling it good. "Preserve" means
> do not restyle a deliberate choice; it never means skip the check** — and what
> genuinely underperforms …

### Step 2: Generator — state that preserve ≠ exemption in the conservative-defaults rule

In Block B (Phase 4), add one sentence after "Default to the smallest reversible
change that meets the contract." (before the parenthetical example):

> **Preserving the intent of an element never exempts it from its controls.** A
> preserved avatar, badge, or icon still must pass A11Y-1 (contrast), A11Y-2/-3, and
> every other in-scope control; "deliberate" protects its *look* from gratuitous
> restyling, not its *compliance* from verification. If a preserved element fails a
> control, fixing it is in scope — flag the fix as above, but do not leave the
> failure standing because the element was "established".

### Step 3: Evaluator skill — grade preserved elements; verify out-of-scope-chrome claims

In `.claude/skills/tfx-design-review/SKILL.md`:

(a) After Block C (the independent-enumeration paragraph, ~line 33), add a short
paragraph:

> **"Preserved" and "established" are not waivers.** When the builder's critique or
> plan lists an element as "what works — preserve", grade it like any other element:
> a preserved or established component is fully in scope for its controls, and its
> contrast, focus, name, and state must be verified, not accepted on the builder's
> say-so. The most expensive misses hide here — a default that was overridden, or a
> long-standing element nobody re-checks. Read the element against its L0/L1 controls
> directly.

(b) After Block D (the findings-sort / UNCOVERED rules, ~line 50), add:

> **Before you exclude a finding as "external chrome / out of scope," confirm the
> element actually renders outside the surface.** Read the route's code or DOM to
> establish where it comes from; if it is part of the page you are grading (the
> page's own avatar, header, or badge), it is in scope and a violation on it is a
> finding — not chrome. Excluding an in-surface element as someone else's chrome is
> how an L0 fail slips a review. State your evidence for the boundary ("rendered by
> the shared `AppShell`, not this route") when you exclude.

### Step 4: Evaluator agent — extend the enumeration line

In `.claude/agents/tfx-design-evaluator.md`, extend Block E so the agent's own brief
carries the two rules (the skill is the full rubric; the agent file is the short
brief that points at it):

> independently enumerate the surface's interactive controls from the inventory and
> the route's code; do not limit your review to the screenshots supplied. **Treat
> "preserved" / "established" elements as gradable, not waved through — verify their
> L0/L1 controls (A11Y-1 contrast especially). Before excluding anything as
> out-of-scope chrome, confirm from the code/DOM that it renders outside the surface;
> a fail on the page's own element is a finding.**

**Verify**: the four greps in the Commands table return ≥ 1 each; `claude plugin
validate .` passes.

## Test plan

No code/tests. Gates: `claude plugin validate .` passes; the grep checks; a
read-through confirming (a) the critique step now says verify-don't-assume, (b) the
conservative-defaults rule says preserve-≠-exempt with A11Y-1 named, (c) the
evaluator skill grades preserved elements and gates out-of-scope-chrome exclusions on
where the element renders, (d) the agent brief carries both rules. Optional regression
signal: the `evals/evaluator-recall/` suite (see `evals/README.md`) should still pass
its recall target — these edits *raise* recall (catch the preserved-element class),
they must not lower it.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -ic "not.*exempt\|still.*verif\|preserve.*intent\|stays in scope" .claude/skills/tfx-design-ui/SKILL.md` → ≥ 1 (0 pre-edit)
- [ ] `grep -ic "not waivers\|on the builder's say-so\|grade it like any other" .claude/skills/tfx-design-review/SKILL.md` → ≥ 1 (0 pre-edit — NOT `preserved\|established`, which passes pre-edit via line 105)
- [ ] `grep -ic "renders outside\|external chrome" .claude/skills/tfx-design-review/SKILL.md` → ≥ 1 (0 pre-edit)
- [ ] `grep -ic "preserved\|established\|out of scope" .claude/agents/tfx-design-evaluator.md` → ≥ 1 (0 pre-edit)
- [ ] `grep -c "A11Y-1" .claude/agents/tfx-design-evaluator.md` → ≥ 1 (genuine gate — 0 pre-edit). The UI-skill conservative-defaults addition also names A11Y-1; that is covered by the unique-text grep above (A11Y-1 is already common in `tfx-design-ui`, so don't gate on it there)
- [ ] `claude plugin validate .` passes
- [ ] Only the three in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- Block A, B, C, D, or E differs from its "Current state" excerpt (drift) — locate the
  live block and reconcile before editing; do not paste blindly.
- Editing Block A/B would collide with the in-flight craft batch's Phase 2/3/4
  additions (you find the surrounding text already rewritten) — report the overlap.
- You are tempted to add a new catalog control for this — HF-18 is a *behaviour* fix
  to existing controls (A11Y-1 already covers contrast); a new control is out of scope
  here (HF-19's consistency control is plan 027).

## Maintenance notes

- This is the behaviour half of HF-18. The mechanical half — a contrast *check* that
  would have caught the 3.32:1 avatar statically — is plan 028 (`checks/contrast`);
  the two are complementary (procedure + tooling).
- A reviewer should scrutinise that "preserve" still discourages gratuitous restyling
  (the original intent of plan 015) while no longer reading as a control exemption —
  the two must coexist, not cancel.
- The consumer-app convention behind the triggering bug (`AvatarFallback` default =
  `bg-primary text-primary-foreground`; never override the text colour) is a
  *product-repo* fact, not a harness control; HF-19 (plan 027) is where "you overrode
  a DS component default" becomes a gradeable consistency dimension.
