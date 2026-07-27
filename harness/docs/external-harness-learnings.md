# Learnings from external design harnesses, mapped by control category

> **Status:** review record, not an approved change. This document reads two
> external systems against the TFX catalog and says what TFX should adopt, adapt
> or reject. It changes no control, check, skill or website source. Anything
> marked *candidate* still needs TFX evidence and a ratchet PR before it can
> reach `standards/catalog.yaml`.
>
> **Written:** 27 July 2026, against `main` at `6d41710` (catalog: 70 controls,
> 4 script / 18 partial / 30 manual / 18 evaluator).
>
> **Sources reviewed:** the SLS design harness and its published knowledgebase
> (recorded in `public/sls-tfx-harness-comparison.html` and planned against in
> `plans/074-repository-binding-fresh-gates-and-skill-evals.md`), and the
> `vibedesignlab/slopslap` Claude Code plugin (MIT, single-commit public repo,
> read at `6b5dae1`).

## 1. Why this document exists

Two external reviews landed within a week of each other, and they taught
different things. The SLS review answered a question about **how a harness
runs**: where repository facts live, when a gate is still valid, what counts as
evidence. The slopslap review answers a different question: **how a design rule
becomes measurable, and how a finding stays honest between the agent that finds
it and the agent that fixes it.**

Keeping those as two separate write-ups would leave the reader to work out which
learning touches which control. This document merges them and files each
learning against the catalog category it changes. AI slop prevention (`SLP`) is
worked out in full, because it is the category with the largest gap between what
the catalog claims and what the harness can currently prove.

## 2. The two sources

### 2.1 SLS

A repository-native harness for one design system. Its centre of gravity sits at
the implementation layer: it reads its own tokens, components, commands and
delivery paths, then repeats a known workflow reliably. Its strengths are local
certainty (token and component conformance, stories, tests, visual regression,
merge-request previews) and a paired eval method that compares a skill against a
baseline over repeated runs.

Full comparison and the adopt/adapt/reject table:
`public/sls-tfx-harness-comparison.html` and plan 074.

### 2.2 slopslap

A single-skill Claude Code plugin that removes AI slop from a screen, stack
agnostic. Three parts matter:

1. **A taxonomy dataset** (`src/data/aiSlopTaxonomyData.js`). It self-reports 100
   items across 8 parts and 14 categories. Every item carries an id, a `tell`
   (what the shape reveals about the absent decision), a `severity`, a `cause`,
   external `source` citations, and a `detect` block typed `code`, `hybrid` or
   `judgment` with a `note` naming the conditions under which a hit is
   legitimate. The `cause` distribution is the dataset's own headline: 49%
   `median`, 29% `no-constraint`, 12% `underspec`, 10% `no-verify`.
2. **A pipeline skill** covering five inspection areas: decorative slop removal,
   layout and containers, spacing, typography, colour. The pipeline is preflight
   → parallel static inspection (one subagent per area) → served HTML findings
   report → sequential enforcement in a fixed dependency order → parallel
   re-inspection by fresh agents → one render pass for before/after screenshots.
   The taxonomy is wider than the pipeline: copy, imagery and motion have
   taxonomy parts but no inspection area, and copy is routed to a separate
   skill.
3. **Generated reference data** (`scripts/gen-reference-data.mjs`). Quantitative
   targets are read out of installed npm packages (`tailwindcss` default theme,
   `@radix-ui/colors`) plus WCAG spec constants, and each value is stamped with
   its package name and version. Hand-typed numbers are treated as invented
   constants rather than references.

An opt-in `transform` mode snaps a target to contracts measured from real sites.
TFX rejects that part; see §7.

### 2.3 What each source is evidence of

Both repositories are evidence of architectural intent, not proof that every
mechanism holds at scale. For SLS, several ADRs remain proposed and no eval
results are published. For slopslap, the repository is a single squashed commit
with no history to read, the failure records it cites are the author's own notes,
and the pipeline was not run as part of this review. Its reasoning is worth
taking seriously; its claimed results are not measurements TFX can cite.

## 3. The three layers

The merged picture separates cleanly, which is the main reason both reviews were
worth doing:

| Layer | Question it answers | Strongest source |
|---|---|---|
| **Design intent** | What counts as good design here, for whom, at what severity? | TFX. 70 tiered and scoped controls across accessibility, content, layout, type, colour, tokens, components, motion, identity and anti-slop, with waivers, an evaluator and a ratchet. |
| **Execution mechanics** | How does the harness run inside a repository, and when is a green result still true? | SLS. Repository facts, a fast loop plus an authoritative gate, worktree-keyed freshness, rendered confirmation, paired evals. |
| **Detection epistemics** | How does a rule become measurable, and how does a finding survive the handoff to whoever fixes it? | slopslap. Findings as re-measured predicates, tell-level detect typing with false-positive notes, generated reference values, staleness tracking. |

TFX owns the first layer and should keep owning it. Neither external system
covers accessibility, copy, identity, component reuse, tiering or governance in
the way the catalog does. The learnings below are all second-layer and
third-layer.

## 4. Cross-cutting mechanics

These are source-agnostic and do not belong to a single category.

| # | Mechanic | Source | TFX decision | Lands in |
|---|---|---|---|---|
| M1 | A finding carries a predicate re-measured from source, never a status word | slopslap | **Adopt** | critique + evaluator output format; verify phase |
| M2 | Four-layer failure triage: rule → checklist → enforcement → render | slopslap | **Adopt** | `feedback` skill routing; review records |
| M3 | Rule drop is a capacity problem, not a prompt-quality problem | slopslap | **Confirm** (TFX arrived here independently) | focused passes; progressive disclosure in `design` |
| M4 | Inspection is parallel and idempotent; enforcement is sequential and state-changing | slopslap | **Confirm** | already true: evaluator is a separate agent |
| M5 | Fix in dependency order, one commit per category | slopslap | **Adapt** | `critique` executing approved suggestions |
| M6 | Numeric thresholds are generated from a real source and stamped with it | slopslap | **Adopt** | catalog thresholds; `type-scan`'s catalog-sourced scale is the precedent |
| M7 | Detector hits are candidates; each tell states when a hit is legitimate | slopslap | **Adopt** | `checks/*.py` finding text; control `fails_when` |
| M8 | Unhit detectors are reported as "checked and absent" | slopslap | **Adopt** | `detect.py --json`; verify-phase honesty rules |
| M9 | Adversarial self-check at authoring time, not after N runs | slopslap | **Adopt** | ratchet proposal template |
| M10 | Freshness: a green gate is invalid after the worktree changes | SLS | **Adopt** (planned) | plan 074 U3/U4 |
| M11 | Fast advisory loop separate from an authoritative gate | SLS | **Adopt** (planned) | plan 074 U3 |
| M12 | Machine-readable repository facts, separate from prose context | SLS | **Adapt** (planned) | plan 074 U1/U2 |
| M13 | Paired skill evals with repeated runs, variance and cost | SLS | **Adopt** (planned) | plan 074 U7 |
| M14 | Findings published as one self-contained report, updated in place | slopslap | **Consider** | critique output; not yet scoped |

Four of these need explanation.

### M1 — a finding is a predicate, not a status

slopslap's sharpest idea. Every findings entry carries a `check` field holding a
predicate that can be evaluated true or false against source: `font-style:italic`
matches zero times, the hero's `max-width` references the measure token, the code
block's `scrollbar-color` resolves to the code background. The agent that fixes,
and the fresh agent that re-inspects, recompute the predicate every time. Neither
reads a status word.

The failure this prevents is specific and the repository records it: a findings
entry was written as "already done" for a terminal scrollbar colour, the enforcer
believed the text and skipped the item, and the defect shipped. A status word is a
cache of something once known. A predicate is a function that returns the same
answer whenever it runs.

TFX has the same exposure in a different place. Control verdicts and the manual
evidence ledger in a decision record are prose. Plan 074's U4 makes screenshots
carry provenance and an honest `unverified` state, which fixes freshness of
evidence but not the shape of a finding. Adopting M1 means every finding produced
by `critique` or the evaluator states the predicate a reader can re-run, and the
verify phase re-runs it rather than reading the earlier verdict.

### M2 — four-layer triage

When something was missed, decide which layer failed before proposing a fix:

1. **Rule** — was there a control at all?
2. **Checklist** — did the run's findings capture it?
3. **Enforcement** — was it captured, predicate false, and skipped anyway?
4. **Render** — was it fixed in source but absent from the rendered result?

TFX has the pieces (catalog, check, skill, capture) but no named triage, so
harness feedback tends to arrive as "the harness missed X" and gets routed by
guess. Naming the layers makes feedback routable: layer 1 goes to the ratchet,
layer 2 to the skill or check, layer 3 to the enforcement contract, layer 4 to
capture.

### M6 — generated, not typed

`gen-reference-data.mjs` reads spacing and font-size scales out of the installed
`tailwindcss` package and colour ramps out of `@radix-ui/colors`, then writes a
corpus where every value carries its package name and version. The stated reason:
a hand-typed number is not a reference, it is an invented constant wearing a
citation.

TFX already did this once without naming it. Plan 068 adopted Tailwind's default
type scale, and `type-scan.py` reads the scale from the catalog rather than
embedding a copy. The same discipline already covers the SLP-9 word lists, which
`content-lint.py` reads live from `controls/slp-9.md` through `tfx-sync` markers
so the lint and the catalog cannot diverge. M6 generalises the rule TFX has been
applying case by case: any numeric threshold in the catalog names its source, and
is generated where a package or spec can supply it.

### M9 — red team at authoring time

slopslap's `transform` mode ships with a median guard written before the mode ran:
two targets with different content must produce different results, and identical
results mean the reference set became an answer key. The contract also caps units
per style tag and requires at least three distinct style tags per cell. The
principle: the hole gets found by self-interrogation while writing the contract,
not by N cycles of running it.

TFX ratchet proposals in `docs/catalog-changes/` carry evidence for the addition.
They do not carry an authoring-time attack on the proposal. Adding one section
("how would this control be satisfied without the outcome it wants?") is cheap
and catches the class of control that is easy to pass and hard to fail.

## 5. Category ledger: AI slop prevention (SLP)

The catalog labels this category "Anti-slop". It is the prevention category: the
controls exist so that the statistically average choice cannot enter a Teacher &
School surface unnoticed.

### 5.1 Where the category stands today

Eleven controls, all settled, added from the TFX-DS site catalog on 11 June 2026
(SLP-1..10) and 17 June 2026 (SLP-11).

| Control | Tier | Typed | Enforced | Script |
|---|---|---|---|---|
| SLP-1 no purple/violet gradient palettes, cyan-on-dark, glow accents | L1 | deterministic | manual | — |
| SLP-2 no gradient text | L1 | deterministic | manual | — |
| SLP-3 no thick side-tab accent borders on rounded cards | L1 | deterministic | manual | — |
| SLP-4 no nested cards | L1 | deterministic | manual | — |
| SLP-5 no icon-tile feature-card template; no identical card grids | L2 | deterministic | manual | — |
| SLP-6 adjacent type steps differ by ≥ 1.25× | L2 | deterministic | manual | — |
| SLP-7 spacing has rhythm | L2 | deterministic | manual | — |
| SLP-8 no bounce or elastic easing | L1 | deterministic | manual | — |
| SLP-9 copy carries no AI-writing tells | L2 | hybrid | partial | `content-lint.py` |
| SLP-10 complex multi-section tasks get a page, not a modal | L1 | judgment | evaluator | — |
| SLP-11 a card is only for an interactive unit | L2 | judgment | evaluator | — |

`checks/README.md` lists the two scripts that would close this: `slop-scan` for
SLP-1..4 and `slop-layout` for SLP-5..7. Both are still planned.

### 5.2 The honesty gap this category carries

Eight of eleven SLP controls are typed `deterministic` and enforced `manual`.
That is the largest typed/enforced divergence of any category in the catalog.
The harness is honest about it — `checks/README.md` and `CLAUDE.md` both forbid
reporting an unbuilt check as passed — but honesty about a gap is not coverage.

slopslap supplies the explanation, and it is not "nobody wrote the script yet".
Its contract states that qualitative language evaporates across a handoff:
"align to the module" is true of both a 5:7 and a 7:5 split, so it cannot be a
contract, and only an operationalised number survives the trip from finder to
fixer. Read TFX's SLP-7 against that: "spacing has rhythm — related items grouped
tighter than unrelated ones" names the outcome and gives no measurable trigger.
SLP-5's "no identical card grids as default layout" leaves both "identical" and
"default" undefined. Those controls are typed deterministic because the *tell* is
mechanical, but the *rule text* was never operationalised, so no script could be
written from it. §5.5 writes the missing triggers.

### 5.3 Five conceptual corrections

These change how the category should be phrased, not just how it is checked.

**(a) A tell is a no-decision default, not a forbidden shape.** slopslap records
its own failure here: a centred-hero avoidance reflex flipped a seal-and-plaque
brand whose central symmetry was derived from its identity. The rule it wrote
afterwards: a composition decision justified only by avoidance is invalid, and a
content-positive justification is required. TFX's SLP-1..5 are phrased as
forbidden shapes. That is correct for pure decoration with no legitimate use
(gradient text, side-tab stripes), and wrong wherever the banned shape has a
derivable case. SLP-5 is the exposed one: a grid of identical cards is right when
the items genuinely are peers of equal priority, and the tell is the grid chosen
because nobody decided what mattered most.

**(b) Banning one default moves the default.** The taxonomy tracks this with a
`generation` field. `safe-green-regression` records models falling back to
emerald once indigo is prohibited; `tasteful-default-cream-serif` records the
cream-plus-serif-plus-sage combination becoming the new average precisely because
it reads as the tasteful escape from purple. There is also an escape-inversion
rule: when a prescribed escape hardens into a formula, the item carries a warning
that the escape is a principle rather than a recipe. SLP-1 names purple, violet,
cyan-on-dark and glow. As written it can be satisfied by the next default. Its
`fails_when` should describe the failure as an undecided palette rather than a
list of hues, with the named hues as examples.

**(c) Deletion tells and replacement tells behave differently.** slopslap marks
replacement tells (spacing ladder, type scale, palette ramp, measure, contrast)
with a quantitative snap target, and marks deletion tells `applies: false`
because there is no value to borrow. Mapped onto TFX: SLP-1..5, SLP-8, SLP-10 and
SLP-11 are deletion or restructuring tells that need no reference value, and only
SLP-6, SLP-7 and SLP-9 need one. All three already have a source (the Tailwind
type scale via TYP-3, the shadcn spacing scale via TOK-2, the word lists in
`slp-9.md`), which is why SLP-6 and SLP-7 are closer to scriptable than their
`manual` status suggests.

**(d) Deletion is the start of composition, not the end.** Recorded as
`unbalanced-void-after-deletion` after a cycle where the tool removed decoration
correctly and left a hole where it had been. The rule: space left by a removal
must be recomposed by re-centring, re-proportioning or re-grouping the content
that remains, and recomposition never means adding new decoration. "Cleanly
empty" is not a pass. TFX has no control for this. Every SLP control says what to
remove, and nothing requires the result to be composed. LAY-7 (one primary focal
region, reading order matching task priority) is the nearest neighbour and does
not cover the case.

**(e) Slop is a decision deficit, not a capability deficit.** The `cause`
distribution puts 49% at `median` (regression to the training corpus in the
absence of constraint) and another 29% at `no-constraint`. The conclusion drawn
is that prompting cannot cure median regression, and that the only prevention is
removing the freedom for an undecided value to enter: every value derives from a
declared base, with fixed multiples. TFX's token controls (TOK-1..3), COL-1..2
and TYP-3 are exactly that machinery, so this is validation rather than a new
idea. It does locate the remaining freedom: spacing *relationships* (SLP-7) and
grid *derivation* are where TFX still allows an undecided value, because TOK-2
pins which values exist without saying which relationship gets which value.

### 5.4 Control-by-control mapping

| TFX | Corresponding tells | What the external source adds | Action |
|---|---|---|---|
| SLP-1 | `purple-blue-gradient`, `indigo-accent`, `everywhere-glow`, `mesh-aurora-background`, `iridescent-palette`, `saturated-multicolor-palette`, `floating-gradient-orb`, `safe-green-regression`, `tasteful-default-cream-serif` | Per-tell regex signals; a repetition threshold for glow (a single focal instance is legitimate); the demotion of mesh/aurora to "not on its own" after adversarial review rejected it as a keyword artefact; the next-default regression records | Write `slop-scan`; rephrase `fails_when` per §5.3(b) |
| SLP-2 | `gradient-text` | Trigger is a co-occurrence, not a hue list | Write `slop-scan`; smallest and safest first rule |
| SLP-3 | `colored-left-border-cards` | Recolouring the stripe is a recorded false escape; the pattern itself is the tell, so the fix is removal | Write `slop-scan`; add the escape note to `fails_when` |
| SLP-4 | `meaningless-container-nesting`, `excessive-card-nesting`, box-in-box rule, ghost-wrapper rule | Surface is defined as *any one* of border, background, shadow or radius, not all three; a surface directly wrapping a surface is always flattened; a separate rule unwraps layout-inert wrappers | Widen the surface definition (ratchet); then `slop-scan` becomes writable |
| SLP-5 | `default-equal-thirds`, `undisciplined-grid`, `unbalanced-void-after-deletion` | Cell size should be a function of content priority; an equal split is the shape of a deferred decision; grid tracks exceeding item count leaves filler cells | Needs the content inventory step (§5.5) before it is measurable |
| SLP-6 | `unscaled-type-hierarchy`, `oversized-display-type` | Sizes snap to the real scale's rungs, and the whole set reduces to a single ratio in 1.2–1.5 within ±5%, measured at a stated viewport | Extend `type-scan.py`; do not write a second type checker |
| SLP-7 | `unscaled-spacing-ladder`, `unpartitioned-space`, `suffocating-density` | Base × fixed tiers, each tier at least 1.5× the previous; a cap on off-scale values; the rule that white space is the residue of partitioning rather than a value to nudge | Operationalise the rule text (ratchet), then write `slop-layout` |
| SLP-8 | none | slopslap's taxonomy has a motion part, but its pipeline has no motion area | TFX is ahead; nothing to import |
| SLP-9 | Part 6 (13 copy tells, Korean-language) | Copy is routed out of the pipeline entirely | TFX is ahead; the only transferable pattern is locale-gated tells (§6.3) |
| SLP-10 | `everything-is-a-modal` | Both judgement. Adds the cause: no risk classification happened, so "confirm equals safe" was applied wholesale | Convergent; optionally cite the cause in evaluator guidance |
| SLP-11 | surface-restraint rule, `excessive-card-nesting` | A machine trigger: a series item carrying a surface whose body is a single short field | Convergent, independently reached; the trigger may make part of SLP-11 hybrid rather than pure judgement |

### 5.5 Operational triggers for the unbuilt checks

Written so `slop-scan` and `slop-layout` can be implemented from the rule text.
Each trigger states its exoneration clause, per M7. None of these change a
control's meaning except where noted as needing the ratchet.

**`slop-scan` (SLP-1..4), source-static:**

- **SLP-2.** A rule declaring `background-clip: text` or
  `-webkit-background-clip: text` whose `background` or `background-image` in the
  same rule contains `gradient(`. No exoneration; TFX has no legitimate case.
- **SLP-3.** `border-left`, `border-inline-start` or the Tailwind equivalents with
  a computed width ≥ 3px and a non-neutral colour, on an element that also has a
  non-zero `border-radius`. Exoneration: a neutral hairline divider, and a
  full-height rule that is not attached to a card surface.
- **SLP-1a.** A gradient whose stops include two or more values from the
  violet/indigo/purple families, or two or more `from-`/`via-`/`to-` utilities in
  those families. Exoneration: CaseSync's declared indigo primary and any value
  resolving to a token in `app/globals.css` are never findings, since COL-1 owns
  the palette. The check runs on values outside the token set.
- **SLP-1b.** A `box-shadow` or `drop-shadow` with zero offset, blur ≥ 20px and a
  non-neutral colour, appearing on three or more distinct selectors. Exoneration:
  one focal instance is not a finding, matching slopslap's repetition threshold.
- **SLP-1c.** Three or more high-chroma accent hues outside the declared token set
  applied to sibling qualitative content. This overlaps COL-1 and TOK-1, so it
  should be reported once, by `token-audit`, not twice.
- **SLP-4.** Define `surface(el)` as true when any one of these holds: a border
  other than `none`, a background other than transparent or inherit, a
  `box-shadow` other than `none`, a non-zero `border-radius`. Flag any element
  where `surface(parent)` and `surface(child)` both hold and the child is a
  direct content child of the parent. Prescription: strip the inner surface,
  replace it with a top rule plus spacing, and keep at most one surface per
  group. Separately, unwrap a wrapper with a single child, no grid or flex
  display, no padding or margin, no background or border, and no semantic element
  or ARIA role. **This widens SLP-4's current definition** (which requires border
  *and* radius *and* background together) and therefore needs a ratchet PR before
  the script can enforce it.

**`slop-layout` (SLP-5..7):**

- **A content inventory runs first.** slopslap makes this a preflight step and it
  is a genuine addition rather than a detail: before judging layout, abstract the
  page's content into which blocks are repeated series (a list, a set of steps, a
  tier table, a feature list) and what each item's shape is. Without that, "grid
  of identical cards", "series alignment" and "surface per item" cannot be
  measured, because the checker cannot tell a series from a set of distinct
  sections. Teacher & School surfaces are dense with series (mark rows, class
  lists, case steps), so this step earns its keep here more than it does on a
  marketing page.
- **SLP-5.** Given the inventory: (i) a series of three or more sibling items
  where each item carries a surface and the item body is a single field or one
  short line; (ii) a grid whose declared track count exceeds the number of
  content items, leaving filler or empty cells; (iii) an equal split
  (`repeat(N, 1fr)`, thirds) across items of visibly different priority where no
  priority order is declared. Exoneration: genuine peers of equal priority in an
  equal split is the correct answer, per §5.3(a).
- **SLP-6.** Collect the font sizes actually used on the page, sort them, and flag
  any adjacent pair whose ratio is below 1.25. Stricter form worth considering:
  the whole set reduces to a single ratio in the 1.2–1.5 band within ±5%. Both
  are computable by machinery `type-scan.py` already has, since TYP-3 already
  reads the scale from the catalog. Extend that script rather than start a new
  one.
- **SLP-7.** Three triggers, all against the declared spacing scale that TOK-2
  already pins: (i) more than one fifth of the spacing values used fall off the
  scale; (ii) the gap between members of a group is greater than or equal to the
  gap between groups, which is rhythm flattened or inverted; (iii) one spacing
  value accounts for the large majority of all gaps on the page. Making (ii)
  checkable needs the catalog to name the relationships, which is the ratchet
  item: a declared tier ladder of within-group, action, block and section, each
  at least 1.5× the previous. TFX does not need to invent a ladder, only to say
  which rung of the existing scale each relationship takes.

### 5.6 Gaps with no TFX control

Candidates only. Each needs TFX evidence and a ratchet PR. Ordered by how much
the Teacher & School portfolio is exposed to them.

| # | Gap | External tell | Nearest TFX control | Why it matters here |
|---|---|---|---|---|
| G1 | Layout was never validated against the real data distribution: longest and shortest values, empty values, maximum row counts | `placeholder-data-shipped` (strong, `underspec`) | CMP-4 covers empty state; CMP-6 covers the table pattern | Long student names, missing marks, 40-plus student classes and unusually long subject names all break layouts that were only ever seen with sample data |
| G2 | Space left by a removal is not recomposed; a void is accepted as clean | `unbalanced-void-after-deletion` (strong, `no-verify`) | LAY-7 focal point | Directly caused by following SLP-1..5. TFX tells the agent to delete and never asks it to recompose |
| G3 | Colour used on every row of a status list, which destroys the signal it is meant to carry | `rainbow-status-list` (strong, `no-constraint`) | COL-2 governs which functional colours, not how many rows carry one | Marks, case status and submission state lists are the portfolio's most common surface |
| G4 | Navigation reduced to icons with no visible labels | `icon-only-sidebar` (weak, `no-constraint`) | A11Y-3 requires visible labels on fields, not on navigation | A teacher between classes should not have to learn an icon vocabulary |
| G5 | A chart carrying no data question, present to signal that data exists | `meaningless-decorative-chart` (weak, `no-constraint`) | CMP-6 covers tables; nothing covers charts | Applies as soon as a dashboard surface ships |
| G6 | A summary screen forced on a user with no activity yet | `waiting-room-dashboard` (weak, `underspec`) | CMP-4, LAY-3 | Weakest of the six; likely already covered by CMP-4 in practice |
| G7 | The SLP set has no staleness axis. `SLP-1`'s named hues are a 2024–25 tell, and the catalog has no way to notice that an anti-slop control has aged | the `generation` field plus per-item expiry and re-verification | none | This is a schema field and a review cadence, not a control. Cheapest of the seven and the one that keeps the other ten honest |

G7 is the recommended first move: it costs a schema field and a line in the
contributing flow, and without it every other SLP item quietly decays.

### 5.7 What this category must not import

- **The 100-item taxonomy wholesale.** The ratchet exists so that a control
  enters the catalog on TFX evidence from a TFX failure. The taxonomy is a useful
  candidate pool for §5.6 and nothing more. Importing it would also import its
  landing-page bias: its 8 parts are weighted towards marketing pages, and only
  one 8-item category addresses in-product UI.
- **The Korean-language tells** (Part 6 copy signals, and honorific and particle
  rules). Not applicable to Singapore English surfaces. The locale-gating
  *pattern* is worth keeping; see §6.3.
- **Blanket style prohibitions** such as deleting every italic with no exception.
  TFX's TYP controls own typography, and a blanket ban is the same
  avoidance-as-justification error described in §5.3(a).

## 6. Other categories

Shorter, because the learnings are thinner. Each entry says what the sources
contribute and where TFX is already ahead.

### 6.1 Content and copy (CNT, and SLP-9)

Nothing to import. slopslap routes copy out of its pipeline to a separate skill
and treats copy defects as out of scope for slop enforcement. SLS operationalises
design mainly through tokens and components. TFX's 14 CNT controls (three of them
still `proposed`) plus SLP-9, with the live word-list sync between `slp-9.md` and
`content-lint.py`, are the strongest part of the catalog by this comparison.
Six CNT controls already run in `content-lint.py`. The one transferable idea is
M6, already applied here: the lint reads its lists from the control file rather
than embedding a third copy.

### 6.2 Layout (LAY)

Three contributions.

- **The content inventory step** (§5.5) belongs to LAY as much as to SLP. LAY-1,
  LAY-3, LAY-5 and LAY-7 all judge a rendered page without first establishing
  what structural type its content is.
- **Grid derivation.** slopslap requires column boundaries to come from harmonic
  divisions of one shared module, and records that alternating mirrored splits
  (5:7 then 7:5) look disciplined while no vertical line runs through the page.
  TFX's LAY-1 is stronger in one respect, since it requires a *declared* product
  grid, and weaker in another, since it does not test that section boundaries
  resolve to it.
- **Width derivation.** The rule that container and column widths derive from one
  measure token rather than being fixed per section, and the paired rule that a
  measure must match the information density it carries. TFX has LAY-4 (body-text
  measure ≤ 80ch) and nothing for non-prose container widths.

### 6.3 Typography (TYP)

- SLP-6's trigger belongs to `type-scan.py`, per §5.5.
- The radius comparison is worth recording in the other direction: slopslap added
  `unscaled-radius-scale` after treating radius as hygiene rather than a scale
  discipline. TFX's TOK-3, with its peer-radius-consistency clause, already
  covers it. TFX is ahead.
- **Open question, not a candidate.** slopslap carries four Korean typesetting
  tells gated on the presence of Korean text: fallback-font jumps, missing
  `word-break: keep-all`, untuned Hangul letter-spacing, and an English type scale
  applied to Hangul. TFX has no typesetting control for Chinese, Malay or Tamil,
  even though Singapore school surfaces can carry all three. Whether that is a
  gap depends on whether TFX products render non-Latin text today, which this
  review did not establish. Worth asking before it becomes a live problem.

### 6.4 Colour and tokens (COL, TOK)

- G3 (colour as a signal budget) is the one real gap.
- §5.3(e) is validation: TOK-1..3 plus COL-1..2 are the machinery that removes the
  freedom for an undecided colour or spacing value to enter, which the cause
  analysis identifies as the only working prevention.
- Reject SLS's token and component rules, per plan 074. They are specific to one
  repository's packages and narrower than the TFX colour model.

### 6.5 Components (CMP)

- G1 (real-data validation) and G5 (decorative chart) sit here or in LAY.
- SLP-11 and slopslap's surface-restraint rule reached the same conclusion
  independently, from different directions: TFX from "a card means an interactive
  unit", slopslap from "a surface only when it separates real information
  groups". Independent convergence is the strongest evidence either had.
- Reject SLS's component-library mechanics. CMP-1 plus the component manifest is
  the TFX answer, and the manifest's generated-source work is already planned in
  074 U6.

### 6.6 Accessibility (A11Y)

Neither source contributes. slopslap's colour area ends at WCAG contrast maths
and it has no accessibility area; SLS's coverage is not visible in its published
skills. TFX's 11 A11Y controls, three of them L0, are the clearest case where
the catalog covers ground neither external system reaches. G4 (icon-only
navigation) is the single adjacent gap.

### 6.7 Motion (MOT, and SLP-8)

Nothing to import. slopslap's taxonomy has a 4-item motion part that its pipeline
never inspects. TFX has MOT-1 and SLP-8 settled, plus MOT-2 (motion tokens) and
MOT-3 (motion never carries meaning alone) still `proposed`. Even counting only
the settled pair, TFX is ahead.

### 6.8 Identity (IDN)

Nothing to import. Neither source has a concept of product identity, lockups,
approved icon families or per-product tone calibration. This is TFX-specific and
stays that way.

## 7. Consolidated reject list

| Rejected | Source | Reason |
|---|---|---|
| `transform` mode: snapping to contracts measured from Linear, Stripe, Apple and similar | slopslap | TFX has a fixed stack and its own tokens by design. Borrowing measured values from other products' sites contradicts COL-1 and TOK-1..3. Keep M6 (generate from a declared source) and drop the site capture |
| The `BOLD` gate, which scales up borders, shadows, padding and spacing for low-density, heavy-style screens | slopslap | Alien to Kind Utility. A teacher-facing surface does not get louder because the content is sparse |
| Non-interactive operation with no human gate | slopslap | The TFX loop's plan gate is where the design decision is made, and §5.3(e) argues that the decision is the only real prevention. Removing the gate would remove the thing that works |
| Per-area automatic commits, and creating branches or copies of the target | slopslap | TFX never auto-commits. Plan 074 already settled this: the skill may state work is ready, and the user commits |
| Blanket style bans with no exception clause | slopslap | Avoidance is not a justification, per §5.3(a) |
| Central usage telemetry | SLS | Local aggregate reports from existing artefacts first (074 U10) |
| Shared domain profiles or generic adapters | SLS | The 16 July 2026 decision cancelled division-level generalisation |
| Same-artefact per-merge-request previews | SLS | Deferred from v1; needs product CI ownership outside this repo |
| A formal spec lifecycle | SLS | Borrow the drift vocabulary only; a second spec system would fight the sprint contract |

## 8. What happens next

Nothing in this document is approved. In recommended order:

1. **G7 first** (§5.6): add a staleness axis to SLP controls. Smallest change,
   and it protects the other ten.
2. **`slop-scan` for SLP-2 and SLP-3** (§5.5): two triggers with no definitional
   change needed, which would take the category from zero scripts to two and
   test the trigger format before the harder ones.
3. **Ratchet PR for SLP-4's surface definition** (§5.5): widening from *and* to
   *or*, which makes the control both stricter and scriptable.
4. **Ratchet PR for SLP-7's tier ladder** (§5.5): the change that closes the
   category's largest typed/enforced gap.
5. **M1 and M2 into the skills** (§4): findings as predicates, and named
   four-layer triage in `feedback`.
6. **G1 and G2 as ratchet proposals** (§5.6), once a real TFX failure gives them
   evidence.
7. Plan 074 continues independently for the SLS execution mechanics (M10..M13).

Steps 3, 4 and 6 change the catalog and follow `CONTRIBUTING.md`. Steps 1, 2 and
5 do not.

## 9. Sources

**External, primary:**

- `vibedesignlab/slopslap`, MIT, read at commit `6b5dae1` on 27 July 2026.
  Skill contract at `.claude/skills/slopslap/SKILL.md`; area rules at
  `references/inspection-areas.md`; taxonomy at
  `src/data/aiSlopTaxonomyData.js`; reference generation at
  `scripts/gen-reference-data.mjs`; the author's reflection at
  `docs/ai-slop-reflection.md`.
- The SLS published knowledgebase and Storybook, as reviewed on 27 July 2026.
  The private SLS source and live skill files were not reviewed.

**Internal:**

- `public/sls-tfx-harness-comparison.html` — the SLS comparison briefing.
- `plans/074-repository-binding-fresh-gates-and-skill-evals.md` — the SLS
  adopt/adapt/reject decisions and their implementation units.
- `standards/catalog.yaml`, `standards/controls/slp-*.md`, `checks/README.md`.

**Not verified:** neither external system's pipeline was run. slopslap's
recorded failures and its claim that rule drop is a capacity problem are the
author's own notes, not measurements this review reproduced.
