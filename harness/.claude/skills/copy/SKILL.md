---
name: copy
description: Improve, write, or review the copy on a product surface — the product's voice & tone (resolved from its context), naming, error-message anatomy, and anti-AI-writing rules (SLP-9), applied at generation time. Use for any copy-only edit — writing or reviewing user-facing text (page, form, notification, empty state, error state), tightening the wording on a page ("improve/polish the copy on the marks page"), or any longer prose (site content, marketing copy, documentation, decision records). Sufficient on its own for copy-only work; the design loop pulls it in at its implement phase. NOT for a whole-page review with no dimension named — that is critique; NOT for a named structural or visual change — that is design.
---

# Copy for product surfaces

The voice & tone (§4.1) and naming (§4.2) guidelines, applied at generation
time. The intent: copy arrives already on-voice, so no builder — least of all
non-native English speakers — carries the UX-writing burden personally. The product's
voice resolves from context (see "Resolving voice" below); the catalog controls bind
every product regardless. Catalog
controls CNT-1 (error anatomy), CNT-2 (naming), and CNT-3 (voice mechanics) bind this
skill.

**Source of truth.** The normative rules are the catalog controls — CNT-1 (error
anatomy), CNT-2 (naming), CNT-3 (voice mechanics), and SLP-9 (AI-writing tells), each
with a detail file in `../../../standards/controls/`. This skill is their application
layer (it travels in the plugin); the website's voice-tone and naming guidelines present
the same controls for human readers. If any of the three disagree, the catalog control
wins and the others are corrected.

**Improve-the-copy pass.** For a scoped "improve / polish the copy on `<page>`" run —
capture the surface, judge only the wording, propose ranked fixes, gate, and verify —
follow `../critique/pass.md` with this skill's dimension subset: **CNT-1, CNT-2, CNT-3,
CNT-4 (domain fidelity — content modeling a real-world artifact is faithful to it or
labelled illustrative), CNT-5 (device-agnostic action verbs), CNT-6 (low-informational-value
words), CNT-7 (lead with purpose), CNT-14 (voice quality + tone-fit — the copy sounds
Clear/Thoughtful/Approachable and its tone matches the surface context), SLP-9, and IDN-3
(IDN-4 on CaseSync surfaces)**. The rest of this file is that pass's reference: it is what
"on-voice" means.

## Resolving voice

Resolve the product's voice & tone from context, in order:

1. the product's `DESIGN.md` (`tone` / `voice` fields), else
2. its domain profile `voice` (`standards/domains/<domain>.yaml`), else
3. the foundation default — plain, direct, second person; every sentence earns its
   place or goes.

The catalog controls below (CNT-1..7, SLP-9) and the Voice/Tone tables bind every
product regardless of the resolved register — the resolution only sets the brand
character on top of them. For the **Teachers & School** binding — who you're writing
for, Kind Utility, and the per-product tone table — see the bottom of this file.

## Voice (constant)

| We are | We are not |
|---|---|
| Warm but not sappy | Corporate-speak or jargon-heavy |
| Clear but not cold | Overly casual or slang-filled |
| Helpful but not pushy | Condescending or preachy |
| Professional but not stiff | Vague or wishy-washy |
| Confident but not arrogant | Salesy or hype-driven |

## Tone (adapts by context)

| Context | Tone | Direction |
|---|---|---|
| Success | Celebratory, brief | Acknowledge, don't gush |
| Error | Calm, helpful | What happened → what it means → what to do next |
| Onboarding | Encouraging | Lower the stakes; show the quick win |
| Destructive action | Sober, precise | Plain consequences, no drama (CMP-2) |
| Empty state | Inviting | Lead with the next action |
| Permission / data request | Transparent, plain | Say what's collected, why, and how it's used — before asking |

## Writing mechanics (CNT-3)

- Second person ("you"); the product is "we" sparingly.
- Active voice: "Save the plan", not "The plan should be saved".
- Sentences ≤ 25 words. One idea per sentence.
- **Lead with purpose, not mechanism.** Open copy with what it does for the user and
  when to reach for it; the mechanism (the tool, token, library, or data structure)
  comes after, or in the body. This binds hardest on **descriptive prose** — page
  titles, descriptions, section intros, empty states, feature blurbs — where it is easy
  to state the *what* and skip the *why*. A reader should know why a thing exists and
  when they'd need it from the first line. *"shadcn/ui default token scales, unmodified"
  → "Consistent spacing is what makes a screen feel calm instead of busy. One shared
  scale."* (CNT-7, split from CNT-3 2026-07-03)
- Choose exactly the words needed to convey a concept or label a control — the
  simplest way to say something is usually the most universal.
- **Cut low-informational-value words** (CNT-6) unless clarity suffers: empty
  openers ("There is", "It is"), filler ("such", "just", "really", "very",
  "please"), and droppable articles/conjunctions. The canonical lists live in
  `cnt-6.md` (same resolved path as slp-9.md below). SLP-9 handles the AI-tell
  vocabulary and structures; CNT-6 is the no-op words in any copy, whoever wrote it.
- Avoid domain jargon unless it's universal among your users.
- Name the action, not the input device (CNT-5): "choose", "select", "view", never
  "click", "tap", "swipe", or "press". Link text names its destination — "View the
  report", never "click here" or "read more". Users reach these products on
  laptops, tablets, phones, and screen readers; device-agnostic verbs are correct
  for all of them at once.
- No marketing buzzwords (SLP-9): <!-- tfx-sync:slp9-buzzwords --> streamline, empower, supercharge, effortless,
  seamless, world-class <!-- /tfx-sync:slp9-buzzwords --> and kin describe nothing — say what the thing does. No
  em-dash chains standing in for sentence structure, and no label/sublabel/helper
  triplets that restate each other — if removing one line loses nothing, remove it.
- Read it aloud — if it sounds robotic, rewrite it.
- Singapore English spelling (British base): organise, colour, centre.

## The editing sequence (method, not a control)

Good microcopy is edited into shape, not written in one go. The controls above say
what "good" is; this is the working order that gets you there. It is a method — none
of these passes is itself a control, and none fails a check. Draft first, then edit
in passes:

1. **Draft.** Write what you want to say to the user. Don't polish yet.
2. **Purposeful.** Keep only words that serve the user's goal or the product's.
   Lead with the most important idea (CNT-7, lead with purpose).
3. **Concise.** Front-load the point; cut filler and empty openers (SLP-9). One idea
   per sentence, well under the 25-word ceiling (CNT-3).
4. **Conversational.** Second person, active voice; read it aloud (CNT-3). Name the
   action, not the device (CNT-5).
5. **Clear.** Simple words, simple present tense; no double negatives or noun stacks.
6. **Check.** Consistent terms (CNT-2), plain error anatomy (CNT-1), and a last pass
   for AI-writing tells (SLP-9).

The website's [UI text](/guidelines/ui-text) guideline presents the full sequence
for human readers; this skill is where an agent applies it.

## AI writing tells (SLP-9)

These rules apply to ANY prose written in a session — UI strings, site and marketing
content, documentation, decision records — not just product UI. The buzzword,
em-dash-chain, and redundant-pair rules above are part of the same control. The
canonical word lists and the full Flag / Do-not-flag calibration live in
`slp-9.md`, resolved relative to this SKILL.md three levels up at
`../../../standards/controls/slp-9.md` (it ships with the harness — the same path works in
the harness dev repo and when installed as the `tfx` plugin; do not expect
`standards/` in the project cwd) — that file wins if this summary drifts.

- **Copula avoidance.** "The dashboard serves as the daily hub" → "The dashboard is
  the daily hub". Say "is" when you mean is.
- **Negative parallelism.** "It's not just a gradebook, it's a teaching companion" →
  say what it is, once. One earned "X, not Y" per screen is fine; a pattern of them
  is the tell.
- **Rule-of-three padding.** "innovation, inspiration, and insights" → list only the
  items that carry weight, however many there really are.
- **AI vocabulary.** "delve", "testament", "pivotal" and kin — same treatment as
  the buzzword list: say what the thing does. The canonical word list is in
  slp-9.md's "How to verify".
- **Filler.** "In order to save" → "To save". "It is important to note that" →
  delete and keep the note. (Full phrase list: slp-9.md.)
- **Hedging stacks.** "could potentially possibly affect" → "may affect". One
  qualifier, maximum.
- **Chatbot artifacts.** "Great question!", "I hope this helps" and kin never ship
  anywhere. (Full phrase list: slp-9.md.)
- **Superficial -ing tails.** "…, ensuring a seamless experience" → cut it, or state
  the actual mechanism.
- **Significance inflation.** "a major step forward in assessment" → the concrete
  thing that changed.
- **Self-audit.** After writing, re-read asking "what here reads as generated?" and
  fix what you find — the prose twin of "Read it aloud".

Not imported from generic anti-AI guides: straight-quote preference (web interface
guidelines mandate curly quotes) and heading-case rules (sentence case is already
required).

## Errors (CNT-1)

State, in order: what happened, what it means for the user, what to do next.

- Never a raw error code as the primary message; codes may appear as secondary
  support detail ("…quote ref 4031").
- Never blame the user: "We don't recognise this date format — use DD/MM/YYYY", not
  "You entered an invalid date".
- Say what happened to their data: "Your draft is saved on this device."

## Naming (CNT-2)

A name that requires explanation has already failed.

- **Do**: plain language your users already use · name by function, not metaphor ·
  specific and descriptive · test names with real users.
- **Don't**: portmanteaus ("SyncFlow", "InsightHub") · technical jargon or acronyms ·
  cleverness over clarity · internal codenames in UI.
- Good: "Class Planner", "Student Notes". Bad: "SyncFlow", "InsightHub".

## Teachers & School voice & tone (the teachers-school binding)

Resolved from `standards/domains/teachers-school.yaml` when the product's domain is
`teachers-school`.

**Who you're writing for.** Teachers across Singapore — navigating dozens of platforms,
relearning seasonal workflows, already tired, already behind. Brand essence is **Kind
Utility**: useful first, kind at the surface. Every sentence either helps them work
faster with less stress, or it goes.

**Per-product tone calibration (§6).** Same character everywhere; calibrate weight,
never switch systems. This table is the register IDN-3 checks (normative table in
`standards/controls/idn-3.md`); the CaseSync row is hardened by IDN-4 (L1,
CaseSync-scoped: no celebration/gamification around case data):

- **Teacher Workspace** — calm daily command centre: neutral, steady, quietly confident.
- **CaseSync** — higher gravity: more reserved, restrained celebration, privacy-forward
  (sensitive casework).
- **Glow** — lighter, more encouraging: warmer accents, more celebratory moments.
- **Posts / PG Staff Portal** — pure TW, no nuance.

## What to do on conflict

Mandated programme names and legally vetted text win over style rules — record a
waiver (`dxd-waive CNT-2 reason="..."` inline — legacy `tfx-waive` markers remain
valid — or in the decision record for non-markup content) rather than rewording.
