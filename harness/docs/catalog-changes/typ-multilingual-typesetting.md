# Proposal: typesetting for non-Latin scripts, gated on the script being present

**Date:** 2026-07-27 · **Change type:** TYP-1 clause extension, plus a candidate new TYP
control (id assigned at approval) · **Status:** `[rejected — TFX product surfaces render
English only; no Chinese or Tamil text today and none planned — 2026-07-28]`

**Provenance:** external review of `vibedesignlab/slopslap` (MIT, read at `6b5dae1`).
Filed as the open question in `docs/external-harness-learnings.md` §6.3. The learning
comes from **slopslap**; the SLS review contributed nothing here.

**Nothing in `standards/` has changed.** No control, no tier, no waiver. The rejection
leaves TYP-1 exactly as it stands.

## Outcome

The blocking question below was answered on 2026-07-28: **TFX product surfaces are
English only.** No surface renders Chinese or Tamil text today and none is planned.

Under the decision tree in §The blocking question, that answer is the first branch:
reject both parts. A pre-emptive control has no evidence behind it, and the ratchet rule
holds. The latent conflict in TYP-1 described below is **conditional and does not exist
today** — with English-only content, Plus Jakarta Sans and Inter cover everything
rendered, so there is nothing to fall back from.

Answered by the harness owner as a product-scope fact, not as a design-lead ruling on the
control's merit. The analysis stays on file because the answer can change.

### Reactivation triggers

Reopen this record at Part A, before the first affected surface ships, if any of these
become true:

1. A product surface starts rendering Chinese or Tamil in its UI, content or data.
2. **Person and place names entered by schools.** The most likely first carrier, and the
   quietest: an English UI can still receive a student or parent name in Chinese or Tamil
   script through a data field. Nothing in the current stack would raise a finding, and
   the result renders in whatever face the device supplies. Worth a look the next time
   someone audits a name-bearing surface, and not a reason to hold this proposal open.
3. A parent-facing message composer ships, where a school authors the text.

### Not rejected: the pattern behind it

Two things in this record are worth keeping even though the control is not:

- **Script-gated checking.** slopslap's precondition — evaluate only when the script is
  actually present in the content — is the mechanism that makes a locale-specific control
  safe to add to a mostly-English portfolio. Reusable for any future content-conditional
  control.
- **TYP-1's registration pattern.** Part A is a copy of how the Glow wordmark exception
  was handled: register the exception in a scoped table rather than waive it per surface.
  That pattern already works and is worth reaching for the next time TYP-1 meets a
  legitimate exception.

## What the external source has

slopslap's taxonomy carries a four-item category, Part 2 / `slop-cat-13` "Korean
Typesetting", added in its v0.6 round specifically to cover a locale its
landing-page-shaped taxonomy had missed:

| Item | What it catches |
|---|---|
| `korean-fallback-font-jump` | The declared Latin font has no Hangul coverage, so the browser silently substitutes a system font mid-run. Weight, x-height and metrics jump between scripts in the same paragraph |
| `no-keepall-word-break` | Missing `word-break: keep-all`, so Korean lines break inside a word |
| `untuned-hangul-spacing` | A Latin letter-spacing value applied to Hangul, where the optical result differs |
| `english-type-scale-on-hangul` | A Latin type scale applied unchanged to a script with different vertical proportions |

The important part is the precondition attached to the category: "전제: 한글 텍스트
존재 시에만 검사(영문 사이트 오탐 금지)" — check only when Korean text is present, and
never flag an English-only site. The category is gated on the script appearing in the
content, not on a project setting.

## Why this may apply to TFX

Singapore school surfaces can carry Chinese, Malay and Tamil. The obvious carriers:
mother-tongue subject names in a marks table, student and parent names, and any
parent-facing message a school composes. Malay uses Latin script and is unaffected.
Chinese and Tamil are not.

## The stronger argument: a latent conflict in TYP-1

The part worth the team's attention, and not an imported idea: a contradiction already
sits in a settled L1 control, and the external source made it visible.

TYP-1 is titled "Display text is Plus Jakarta Sans (600); body/UI text is Inter
(400/500/600); no other typefaces". Its detail file registers exactly one exception, a
per-product brand wordmark face confined to the lockup, and states the failure mode the
exception does not excuse: "a dead font `@import` (a typeface loaded but used by nothing)
is still a TYP-1 finding".

Neither Plus Jakarta Sans nor Inter covers Chinese or Tamil. So if a TFX surface renders
either script today, TYP-1 forces one of three outcomes, and all three are bad:

1. **Silent fallback.** No third face is added, the browser substitutes whatever the
   operating system offers, and the rendered result differs per device. This passes
   `checks/type-scan` because no unapproved `font-family` is declared. The failure is
   exactly `korean-fallback-font-jump`, and the harness cannot see it.
2. **A recurring waiver.** A Chinese or Tamil face is added and waived on every surface
   that renders it. The Glow pilot hit the same failure on 1 July 2026 with
   `--font-logo: Inria Sans`, which was resolved by registering the face in a table
   rather than waiving it repeatedly.
3. **A TYP-1 finding for doing the right thing.** The face is added correctly and flagged
   as an unapproved typeface.

Outcome 1 is the likely current state, because it requires no one to do anything and
produces no finding.

## The proposed change — two parts, in order

### Part A — extend TYP-1 with a registered per-script fallback stack

Follow the pattern TYP-1 already established for wordmarks. Add a second registered
table to `controls/typ-1.md`:

| Script | Face | Token | Scope |
|---|---|---|---|
| Latin | Inter / Plus Jakarta Sans | existing | all UI |
| Chinese (Simplified) | *to be settled* | `--font-cjk` | glyphs in that script only |
| Tamil | *to be settled* | `--font-tamil` | glyphs in that script only |

The scope column is the whole safeguard: a registered script face is approved for glyphs
in its own script, and using it for Latin running text is a TYP-1 finding, exactly as a
wordmark face used as a heading is. The existing dead-`@import` rule stays: a registered
script face loaded on a surface that renders none of that script is still a finding.

`checks/type-scan.py` needs one change: allowlist the registered script tokens the same
way it already allowlists `--font-logo`.

Tier and title unchanged. The change clarifies scope in the same way the Glow wordmark
registration did, rather than broadening the control.

### Part B — a candidate new TYP control for per-script typesetting properties

Separate from Part A, because a face being present is not the same as being set well.
Specified here so the team can judge it; **the id is deliberately unassigned** until
approval.

- **title (draft):** "Text in a non-Latin script is set with that script's typesetting
  properties (line-breaking, letter-spacing and size floor) rather than the Latin
  defaults"
- **tier:** L2. A strong default with real exceptions, and no accessibility floor is
  breached by a slightly wrong letter-spacing. Note that if a size floor is involved the
  A11Y and TYP-2 floors already bind independently, so L2 here does not weaken anything.
- **check:** hybrid. Deterministic half: where a container's content includes CJK
  codepoints, assert `word-break` or `line-break` is set rather than inherited from the
  Latin default, and assert no Latin `letter-spacing` value is applied to it. Judgment
  half: whether the result reads correctly to someone who reads the script.
- **phase:** `[implement, verify]`
- **applies_to:** `[page, component]`
- **waiver:** `rationale`
- **gate, carried over from the external source:** the check runs only when the script is
  present in the content. A surface with no CJK or Tamil text is not evaluated and is
  never a finding. Without this gate the control produces false findings on every
  English-only surface in the portfolio, which is the failure mode slopslap wrote its
  precondition to avoid.
- **fails_when (draft):**
  - a paragraph mixing scripts where the non-Latin run falls back to a system face;
  - CJK text breaking mid-word because `word-break` was left at the Latin default;
  - a Latin `letter-spacing` value applied to a non-Latin run.

The judgment half needs a reviewer who reads the script. That is a real staffing
constraint and belongs in the decision, not hidden in a footnote.

## The blocking question

> **Answered 2026-07-28: no. English only, none planned.** First branch below applies.
> See §Outcome.

**Does any TFX product surface render Chinese or Tamil text today?** This review did not
establish it, and the answer decides the outcome:

- **No, and none is planned** → reject both parts. A pre-emptive control has no evidence
  and the ratchet rule should hold. Record the rejection with its reason, so the analysis
  is on file when the answer changes.
- **No, but it is planned** → take Part A only, before the first surface ships. Part A is
  cheap, and outcome 1 above (silent fallback) is much harder to find after the fact than
  to prevent.
- **Yes** → Part A is not a proposal, it is a defect report against a settled L1 control,
  and Part B follows once Part A lands.

Someone with product knowledge can answer this in a sentence. It should be answered
before the team spends time on the wording.

## Non-duplication

- **vs TYP-1** — TYP-1 governs *which* faces are allowed. Part A extends that list by
  script; Part B governs how text in a script is *set*, which TYP-1 says nothing about.
- **vs TYP-2** (size floors, unitless line-height) — TYP-2's floors are script-agnostic
  and still bind. Part B addresses line-breaking and letter-spacing, which TYP-2 does not
  mention.
- **vs TYP-3** (on-scale sizes) — a shared scale across scripts is what
  `english-type-scale-on-hangul` questions, but Part B as drafted does not touch the
  scale. Deliberately out of scope: changing TYP-3 per script would fragment the type
  system for a benefit no one has measured here.
- **vs TYP-6** (measure, ~66ch) — character count per line means something different in
  CJK, where one character occupies roughly twice the advance width. Worth flagging as a
  follow-up if Part B lands, and out of scope for this record.
- **vs LAY-2** (reflow at 320 CSS px) — LAY-2 is about layout reflow, not intra-word
  line-breaking. A CJK paragraph can satisfy LAY-2 and still break mid-word.
- **vs A11Y-1** (contrast) — unrelated, though a fallback face at a different weight can
  change perceived contrast at small sizes.
- **vs CNT-13** (spelling, Singapore English) — CNT-13 governs which words. This governs
  how glyphs are set. No overlap.

## Re-audit scope

> Not triggered. The proposal was rejected before any clause changed, so no record needs
> re-auditing. Kept for whoever reopens this under a reactivation trigger.

`python3 checks/reaudit-scope.py TYP-1` reports six records directly in scope for a
TYP-1 clause change, and zero same-category candidates:

```
docs/decisions/attendance.md          docs/decisions/self-audit.md
docs/decisions/broadcast-message.md   docs/decisions/student-notes-empty-state.md
docs/decisions/grade-entry.md         docs/decisions/submit-marks-review.md
```

Part A therefore carries six record re-audits. The expected outcome for all six is
unchanged, because none of them is likely to render a non-Latin script, but the whole
point of the re-audit list is that expectation is not confirmation.
`docs/decisions/broadcast-message.md` is the one to check first: a broadcast composed by
a school is the most plausible carrier of Chinese or Tamil text in the current corpus.

Part B is a new control and its re-audit set is the same six records plus any surface
that renders non-Latin text, which cannot be enumerated until the blocking question is
answered.

## What is deliberately not proposed

- **Importing the four Korean items as controls.** They are Korean-specific and TFX has
  no Korean surface. Only the *shape* transfers: a script-gated typesetting control.
- **A per-script type scale.** See the TYP-3 note above.
- **Malay.** Latin script, already covered.

## Sources

- `docs/external-harness-learnings.md` §6.3 — the review entry this expands.
- `vibedesignlab/slopslap` at `6b5dae1`: `src/data/aiSlopTaxonomyData.js`,
  Part 2 / `slop-cat-13` "Korean Typesetting" and its presence precondition.
- `standards/controls/typ-1.md` — the wordmark registration pattern and the Glow pilot
  rationale that Part A copies.
- `checks/type-scan.py` — the font-family allowlist Part A extends.

---

**Status:** `[rejected — TFX product surfaces render English only; no Chinese or Tamil
text today and none planned — 2026-07-28]`. Nothing under `standards/` was created or
edited, and the re-audit scope below was therefore never triggered. Catalog remains at
70 controls; `python3 checks/validate.py` passes unchanged.
