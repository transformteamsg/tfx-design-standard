# Proposed control: CNT-14 (voice quality + tone-fit — the CNT family's fourteenth slot)

**Date:** 2026-07-10 · **Change type:** new control via ratchet (no tier change to any
existing control) · **Status:** APPROVED (design-lead verbal sign-off, 2026-07-22) —
now settled; the source guideline moved to `content/guidelines/voice-tone.mdx`.

Committed to the catalog as a proposal at **CNT-14**, **L2**, **judgment**,
`phase: [implement, verify]`, `applies_to: [content]`, `waiver: rationale`, with the
`fails_when` bullets below carried into the catalog entry and `controls/cnt-14.md`. No
`enforced:`/`script:` keys — judgment controls omit them (cf. CNT-7). On the
2026-07-22 sign-off the ratchet-proposal comment header was updated to record the
approval date.

This record lives in `docs/catalog-changes/` per the plan-053 placement rule. Source
guideline: `content/guidelines/voice-tone.mdx` (`status: settled`) — the control and
the guideline settled together on approval.

## Why this is a control candidate

The voice & tone guideline (`content/guidelines/voice-tone.mdx`) describes the
TFX voice — **Kind Utility**, the voice attributes (Clear / Thoughtful / Approachable
with a "we are / we are not" table), and a tone-by-context table (success, error,
onboarding, destructive, empty state, permission). No control enforced any of it.

The **mechanical** slices of voice are already owned and mostly lint-backed: CNT-3
(person, active voice, ≤25 words), CNT-6 (filler / empty openers), CNT-5 (device verbs),
CNT-8 (nominalisations), CNT-12 (sentence case), CNT-13 (spelling), SLP-9 (AI-writing
tells). What none of them capture is the **holistic gestalt**: copy can pass every
mechanical control and still be tonally wrong — an *alarmist* error, a *gushing* success,
a *patronising* empty state, a *dramatic* destructive confirmation.

That gestalt was, until now, only a soft signal inside the evaluator's design-quality
"Kind Utility" grade. CNT-14 makes it a named, waivable finding pointing at a written
standard — the same move SLP made for slop (a taste call became control-backed) and
CNT-7 made for lead-with-purpose (a judgment clause split out of CNT-3).

## The proposed control

- **id:** `CNT-14`.
- **title:** "Copy embodies the TFX voice (Clear, Thoughtful, Approachable) and its tone
  fits the surface context".
- **tier:** L2 (a strong default with genuine, context-dependent exceptions — a firm
  warning that *should* be firm is on-voice — so a deviation takes a recorded reason, not
  a block).
- **check:** judgment. There is no deterministic half; the mechanical voice controls
  carry the lintable slices. The evaluator reads the copy against the voice attributes
  and the tone-by-context table.
- **phase:** `[implement, verify]`.
- **applies_to:** `[content]`.
- **waiver:** `rationale`.
- **fails_when:**
  - an error message that is alarmist or dramatic rather than calm and helpful;
  - a success message that gushes instead of acknowledging briefly;
  - an empty state or onboarding step that is patronising or careless;
  - a destructive confirmation written with drama instead of sober, plain consequences.

## Non-duplication statement

- **vs. CNT-3** (person, active voice, sentence length): CNT-3 owns mechanical voice —
  second person, active constructions, ≤25 words. CNT-14 owns the gestalt. A string can
  be second-person and active and short, and still be alarmist. No token overlap.
- **vs. CNT-6** (low-informational-value words): CNT-6 flags specific filler tokens;
  CNT-14 never flags a token, only the overall sound. Disjoint.
- **vs. CNT-7** (lead with purpose): CNT-7 grades the *ordering* of a descriptive line
  (purpose before mechanism); CNT-14 grades its *tone*. A line can lead with purpose and
  still be cold, or vice versa.
- **vs. CNT-8** (nominalisations): CNT-8 catches a specific structural pattern; CNT-14 is
  holistic. No overlap.
- **vs. SLP-9** (AI-writing tells): SLP-9 catches how *AI* writing sounds — buzzwords,
  phrase filler, forced triads, copula avoidance — via word lists and structural tells.
  CNT-14 catches whether *any* copy, regardless of author, sounds on-voice and fits its
  context. The two are neighbouring quality reads, not overlapping ones; per the standing
  boundary discipline, one token never fires both.
- **vs. CMP-2** (destructive actions show consequences + undo/confirm): CMP-2 governs the
  destructive-action **behaviour** — that consequences are shown and undo/confirm is
  offered. CNT-14 governs only whether the destructive **wording** is sober vs dramatic.
  The guideline's destructive row already cites CMP-2; the two are complementary.

## Boundary with the design-quality grade

The evaluator's design-quality criterion still reads the whole surface for Kind Utility.
CNT-14 does not replace that holistic read — it makes the *copy* slice of it a citable
control id (like SLP-1..11 did for the slop slice), so a voice/tone miss lands as a
graded, waivable finding rather than only a soft mark-down.

---

**Status:** PROPOSAL committed to `standards/catalog.yaml` pending design-lead approval.
Catalog 67 → 68 controls. `python3 checks/validate.py` passes at 68; `content-lint.py
--self-test` is unchanged (CNT-14 is judgment-only, no lint).
