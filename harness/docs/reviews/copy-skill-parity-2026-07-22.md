# Copy-skill parity review — content controls ↔ `copy` skill ↔ guidelines

- **Date**: 2026-07-22
- **Commit reviewed**: `4d5354ce` (branch `tanlayhui/run-localhost`) — the content
  ratification (#37) that promoted voice & tone, CNT-5/6/7/14, and the UI-text /
  grammar-mechanics / text-patterns guidelines to `settled` and rewired `copy/SKILL.md`.
- **Reviewer**: content-owner audit (plan: audit propagation + parity checks), read-only.
- **Scope**: the content family only — CNT-1…CNT-14, SLP-9, IDN-3 — across the three
  surfaces that carry them: the **catalog** (`standards/catalog.yaml` + `controls/*.md`),
  the **`copy` skill** (`.claude/skills/copy/SKILL.md`), and the **guidelines**
  (`content/guidelines/{voice-tone,ui-text,grammar-mechanics,text-patterns}.mdx`).
- **Verdict**: **content-skill parity: clean** — zero `drift`, zero `needs-human`. #37 moved
  the skill together with the controls, so every surface agrees today. One structural note
  (B3 below) and the follow-up that makes three of these rows self-enforcing.

## Machine gate (the floor)

| Check | Command (dir) | Result | Exit |
| --- | --- | --- | --- |
| validate (real) | `checks/validate.py` (harness) | `OK: 70 controls valid` | 0 |
| validate self-test | `checks/validate.py --self-test` (harness) | `SELF-TEST OK (67 cases)` | 0 |

`[SLP9-SYNC]` and `[SKILL-SYNC]` (the two automated content guards) pass inside the real
run: the skill's buzzword span is a subset of `slp-9.md`, and all 14 CNT ids plus IDN-3 are
cited in the skill.

## Parity matrix (source → `copy/SKILL.md`)

| # | Source of truth | Skill surface | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| 1 | `catalog.yaml` CNT-1…14 titles + `controls/cnt-*.md` | "Source of truth" 14-item parenthetical + mechanics tags + Errors/Naming sections | `match` | skill names CNT-1…14 (+ SLP-9, IDN-3/4); each gloss tracks its control title; `[SKILL-SYNC]` green |
| 2 | `slp-9.md` (tells + word lists) | "AI writing tells (SLP-9)" + `tfx-sync:slp9-buzzwords` span | `match` | buzzword span ⊆ canonical (`[SLP9-SYNC]` green); prose tells (copula, negative-parallelism, rule-of-three, filler, hedging, chatbot, -ing tails, significance) all present |
| 3 | `cnt-6.md` (filler), `idn-3.md` (per-product tone) | mechanics CNT-6 bullet; "Per-product tone calibration" section | `match` | both detail files resolve; skill's TW/CaseSync/Glow/Posts rows equal idn-3.md's register table in substance |
| 4 | `voice-tone.mdx` voice + tone tables | skill "Voice (constant)" + "Tone (adapts by context)" tables | `match` | byte-identical row sets today (the baseline B1/B2 will lock) |
| 5 | `ui-text.mdx` editing process | skill "editing sequence" | `match` | skill steps 1–5 (Draft, Purposeful, Concise, Conversational, Clear) ↔ ui-text §1–5; see structural note below |
| 6 | `grammar-mechanics.mdx`, `text-patterns.mdx` (#37-touched) | mechanics list links | `match` | #37 changed only `status: proposed → settled` (+ text-patterns dropped its "this section is proposed" line); no rule changed, no skill contradiction |

### Structural note (row 5 — not drift)

The skill's editing sequence has **6** steps; `ui-text.mdx` has **11** sections. Steps 1–5
map 1:1 to §1–5; the skill's step 6 "Check" deliberately collapses ui-text §6–11
(consistency, readability, legibility, accessibility, grammar, voice/tone). This is
intentional compression, not disagreement — an automated check on this row is therefore a
**subset** check on the five shared draft-phase step names only; the Check-expansion stays
here in human review.

## Follow-up

Add three `tfx-sync` parity checks so rows 4 and 5 stop relying on this review:

- `[VOICE-SYNC]` — skill voice-attributes table `==` `voice-tone.mdx` "Voice attributes".
- `[TONE-SYNC]` — skill tone table `==` `voice-tone.mdx` "Tone by context".
- `[UITEXT-SYNC]` — skill draft-phase step names ⊆ `ui-text.mdx` section headings (subset).

Source = the plugin-shipped skill; consumers = the website mdx (website-optional
sub-checks that bail clean when the site tree is absent, per `../SYNC.md`). Row 3's IDN-3
tone table and row 6 remain human-review rows (idn-3.md defers its own parity check with a
pointer).

## Skill-pruning candidates (opt-in, not acted on here)

None found. `copy/SKILL.md` carries no drifted or duplicated content span against the
sources above; no sediment or no-op lines surfaced during the audit.
