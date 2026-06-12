---
name: content-style
description: TFX voice & tone and naming rules for UI copy in Teacher & School products — plain language, tone by context, error message anatomy, naming. Use whenever writing or reviewing any user-facing text in a page, form, notification, empty state, or error state. Sufficient on its own for copy-only edits; when designing a full page the design-ui loop already pulls this skill in at its implement phase.
---

# Content style for Teacher & School products

The TFX-DS voice & tone (§4.1) and naming (§4.2) guidelines, applied at generation
time. The intent: copy arrives already on-voice, so no builder — least of all
non-native English speakers — carries the UX-writing burden personally. Catalog
controls CNT-1 (error anatomy), CNT-2 (naming), and CNT-3 (voice mechanics) bind this
skill.

## Who you're writing for

Teachers across Singapore — navigating dozens of platforms, relearning seasonal
workflows, already tired, already behind. Brand essence is **Kind Utility**: useful
first, kind at the surface. Every sentence either helps them work faster with less
stress, or it goes.

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
- Sentences ≤ 25 words. One idea per sentence. Lead with the benefit, not the feature.
- Choose exactly the words needed to convey a concept or label a control — the
  simplest way to say something is usually the most universal.
- Avoid ed-tech jargon unless it's universal among teachers.
- No marketing buzzwords (SLP-9): streamline, empower, supercharge, effortless,
  seamless, world-class and kin describe nothing — say what the thing does. No
  em-dash chains standing in for sentence structure, and no label/sublabel/helper
  triplets that restate each other — if removing one line loses nothing, remove it.
- Read it aloud — if it sounds robotic, rewrite it.
- Singapore English spelling (British base): organise, colour, centre.

## Errors (CNT-1)

State, in order: what happened, what it means for the teacher, what to do next.

- Never a raw error code as the primary message; codes may appear as secondary
  support detail ("…quote ref 4031").
- Never blame the user: "We don't recognise this date format — use DD/MM/YYYY", not
  "You entered an invalid date".
- Say what happened to their data: "Your draft is saved on this device."

## Naming (CNT-2)

A name that requires explanation has already failed.

- **Do**: plain language teachers already use · name by function, not metaphor ·
  specific and descriptive · test names with real teachers.
- **Don't**: portmanteaus ("SyncFlow", "InsightHub") · technical jargon or acronyms ·
  cleverness over clarity · internal codenames in UI.
- Good: "Class Planner", "Student Notes". Bad: "SyncFlow", "InsightHub".

## Per-product tone calibration (§6)

Same character everywhere; calibrate weight, never switch systems:

- **Teacher Workspace** — calm daily command centre: neutral, steady, quietly confident.
- **CaseSync** — higher gravity: more reserved, restrained celebration, privacy-forward
  (sensitive casework).
- **Glow** — lighter, more encouraging: warmer accents, more celebratory moments.
- **Posts / PG Staff Portal** — pure TW, no nuance.

## What to do on conflict

Mandated programme names and legally vetted text win over style rules — record a
waiver (`tfx-waive CNT-2 reason="..."` inline, or in the decision record for
non-markup content) rather than rewording.
