# Plan 037: Make the guidelines single-source — catalog controls are normative; skill + website are pointers

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Edits are pointers + framing, not rule changes.** You make the relationship
> between the guidance and the catalog explicit; you do NOT change any rule, add a control,
> or rewrite the voice/tone tables' content. Touches a skill + two website docs → design-lead
> review before merge.
>
> **Drift check (run first)**: `git diff --stat 7629f00..HEAD -- "harness/.claude/skills/tfx-content-style/SKILL.md" content/guidelines/voice-tone.mdx content/guidelines/naming.mdx harness/standards/controls/cnt-1.md harness/standards/controls/cnt-2.md harness/standards/controls/cnt-3.md harness/docs/SYNC.md`
> If any in-scope file changed materially, compare against "Current state" before editing;
> on a mismatch, STOP.
>
> **Depends on plan 035** (it creates `harness/docs/SYNC.md`, which this plan extends) and is
> best after **plan 036** (which gives each control a page to link to — `/standards/catalog/cnt-2`).
> If `SYNC.md` does not exist, STOP — land 035 first. If 036 isn't landed, the `/standards/catalog/<id>`
> links still resolve to the catalog list's in-page anchors (`#CNT-2`), so proceed but note it.

## Status

- **Priority**: P2 (the "guidelines recorded + maintained" half of the request: the prose
  guidance the skills depend on overlaps the website's guidelines with no single source)
- **Effort**: S–M
- **Risk**: LOW — pointers + framing; no rule content changes. Design-lead review (skill prose).
- **Depends on**: **plan 035** (SYNC.md). Soft-depends on **plan 036** (control pages to link).
- **Category**: docs (source-of-truth clarity)
- **Planned at**: commit `7629f00`, 2026-06-22

## Why this matters

The skills' content guidance and the website's guidelines describe the same rules without a
declared source of truth:

- `harness/.claude/skills/tfx-content-style/SKILL.md` carries voice/tone tables, writing
  mechanics, naming rules, and the SLP-9 tells — and already says CNT-1/CNT-2/CNT-3 "bind this
  skill" (line 11–12) and defers the SLP-9 word lists to `slp-9.md` (lines 70–74, 84).
- `content/guidelines/voice-tone.mdx` restates the **same voice/tone tables** and says (line 7)
  it "exists primarily so the `tfx-content-style` skill has rules to apply"; it already links the
  catalog for SLP-9 (line 36) and cites CNT-1 (line 33).
- `content/guidelines/naming.mdx` restates naming Do/Don'ts and cites CNT-2 (line 11).

So the normative rules already live in the catalog controls **CNT-1** (error anatomy), **CNT-2**
(naming), **CNT-3** (voice mechanics: lead-with-purpose, second person, active voice, ≤25 words),
and **SLP-9** (AI-writing tells) — each with a detail file in `harness/standards/controls/`. What
is missing is an **explicit, one-directional declaration**: the controls are the source; the
skill is the application layer (it ships in the plugin); the website guidelines are the human
presentation. Without it, an editor "fixing" voice-tone.mdx can quietly diverge from CNT-3 and
the skill, and nobody knows which wins.

This plan makes the relationship explicit (pointers from the website guidance to the now-browsable
control pages; a "source of truth" note in the skill), and records the mapping in `SYNC.md` so it
stays the model. The SLP-9 *word-list* fragment is already parity-checked by plan 035; the rest is
made drift-resistant by pointing rather than restating — there is nothing normative left to drift,
because the rules live once, in the controls. (A mechanical voice/tone *table* parity check is
deliberately deferred — see Maintenance notes — because the tables are low-drift-cost presentation
and a table-parity check crossing the harness↔website boundary is brittle.)

## Current state

- **CNT controls** (`standards/catalog.yaml`): `CNT-1` (~422) "Error messages state what happened
  and what to do next; no raw error codes…"; `CNT-2` (~437) "Feature and page names use plain
  language; no invented portmanteaus, no internal codenames…"; `CNT-3` (~451) "Copy leads with its
  purpose, uses second person and active voice, and keeps sentences to 25 words or fewer." Each has
  a detail file: `controls/cnt-1.md`, `cnt-2.md`, `cnt-3.md`.
- `tfx-content-style/SKILL.md` — lines 8–12 already name CNT-1/2/3 as binding; "## Writing
  mechanics (CNT-3)" (line 42); the SLP-9 section (lines ~65–102) defers word lists to slp-9.md
  ("that file wins if this summary drifts"). After plan 035, the buzzword block here carries
  `<!-- tfx-sync:slp9-buzzwords -->` markers.
- `content/guidelines/voice-tone.mdx` — line 7 declares its purpose ("so the `tfx-content-style`
  skill has rules to apply"); the voice attribute table (11–17) matches the skill's, but the
  **tone-by-context table (21–27) has ALREADY drifted from the skill's**: the skill's tone table
  (`tfx-content-style/SKILL.md` ~33–40) has **6 rows** — including a "Permission / data request"
  row and a "(CMP-2)" note on the Destructive-action row — while voice-tone.mdx has only **5 rows**
  and neither annotation. "## Writing rules" (29–37) maps to CNT-3; line 33 cites CNT-1; line 36
  links the catalog for SLP-9.
- **Decision baked into this plan:** the skill's tables are **canonical** (the skill is the
  plugin-shipped application layer — Model i). Step 2 reconciles the website tone table **up to**
  the skill's 6-row version. That is *correcting a drifted copy toward its source*, not changing a
  rule. (The design-lead may flip which side is canonical at review; default = skill.)
- `content/guidelines/naming.mdx` — Do/Don't (lines 9–11) with "(CNT-2)" on line 11; a Good/Bad
  table; an "Invisible Seams" consistency note (line 18).
- `harness/docs/SYNC.md` (from plan 035) — the source-of-truth model + marker grammar. This plan
  adds the **guidelines row** to its source-of-truth table.
- Plan 036 (if landed) publishes each control at `/standards/catalog/<id>` (e.g.
  `/standards/catalog/cnt-2`). Before 036, the catalog list page anchors each control at
  `/standards/catalog#CNT-2` (the card's `id={c.id}`).

### Repo conventions to honour

- tfx-content-style rules (apply to all prose you write here): second person, active voice,
  sentence case, lead with purpose, no buzzwords, ≤25-word sentences. The pointer wording itself
  must pass SLP-9.
- Plugin portability: the skill must stay self-contained — it may reference control IDs and the
  plugin-relative `../../../standards/controls/*.md` paths, but must NOT depend on `content/`
  existing.
- Singapore English spelling.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build (validates content + catalog) | `pnpm build` | prebuild + `next build` pass |
| Validator (from `harness/`) | `python3 checks/validate.py` | `OK: <n> controls valid` (incl. 035's parity checks) |
| Plugin validation (from `harness/`) | `claude plugin validate .` | `✔ Validation passed` |
| Control refs resolve | `python3 checks/validate.py` | no `references unknown control id` errors for CNT-1/2/3 |

## Scope

**In scope** (modify/extend):
- `harness/.claude/skills/tfx-content-style/SKILL.md` — add a short "Source of truth" note: the
  catalog controls CNT-1/2/3 + SLP-9 are normative; this skill applies them; the website
  guidelines present them for humans; on disagreement the catalog wins.
- `content/guidelines/voice-tone.mdx` — make the deferral explicit: this page presents CNT-3
  (writing mechanics) + CNT-1 (error anatomy) + SLP-9; link each to its control page; keep the
  human-facing tables, framed as the presentation of those controls.
- `content/guidelines/naming.mdx` — turn the "(CNT-2)" mention into an explicit "normative rule:
  [CNT-2](/standards/catalog/cnt-2)" pointer.
- `harness/docs/SYNC.md` — add the guidelines row to the source-of-truth table.

**Out of scope** (do NOT touch):
- Any rule *content* — naming examples and writing rules stay; you add framing + links only.
  **One permitted exception:** reconciling the already-drifted website tone table up to the
  canonical skill version (Step 2 — adding the "Permission / data request" row). That corrects a
  copy to its source; it is not a rule change. Nothing else in the tables changes.
- The catalog, the CNT/SLP detail files' bodies, `schema.json`.
- A voice/tone **table parity check** — deferred (see Maintenance notes); do not build it here.
- The other website guidelines (`interaction`, `web-interface`, `data-viz`, `illustration`,
  `product-icons`) — they are presentation guidance not tied to a single content control; leave
  them. (Only voice-tone + naming overlap CNT-1/2/3 + SLP-9.)

## Git workflow

- Branch: `advisor/037-guidelines-single-source`. Conventional commits
  (`docs: declare catalog controls the source of truth for content guidelines`). Do NOT push.

## Steps

### Step 1: Declare the source of truth in the skill

In `tfx-content-style/SKILL.md`, near the top (after the lines 8–12 that already name the binding
controls), add a short note, e.g.:

> **Source of truth.** The normative rules are the catalog controls — CNT-1 (error anatomy),
> CNT-2 (naming), CNT-3 (voice mechanics), and SLP-9 (AI-writing tells), each with a detail file
> in `../../../standards/controls/`. This skill is their application layer (it travels in the
> plugin); the website's voice-tone and naming guidelines present the same controls for human
> readers. If any of the three disagree, the catalog control wins and the others are corrected.

Keep it plugin-relative (no dependency on `content/`). Do not restate the rules; this is the
pointer.

**Verify**: `claude plugin validate .` passes; `python3 checks/validate.py` still `OK` (the
control IDs CNT-1/2/3 resolve; 035's parity checks unaffected — you didn't touch the markers).

### Step 2: Make `voice-tone.mdx` an explicit presentation of the controls

**Link form (applies to Steps 2 and 3):** if plan 036 has landed, link a control as
`/standards/catalog/<id-lower>` (e.g. `/standards/catalog/cnt-3`); if not, link the catalog
list's in-page anchor `/standards/catalog#<ID-UPPER>` (e.g. `/standards/catalog#CNT-3`) — the
catalog browser card carries `id={c.id}` with the **uppercase** id, so the anchor works **today**.
Pick the form that resolves at execution time.

In `content/guidelines/voice-tone.mdx`:
- Strengthen the existing purpose line (7) into an explicit pointer: this page presents the
  catalog controls **CNT-3** (voice mechanics), **CNT-1** (error anatomy), and **SLP-9**
  (AI-writing tells) for human readers; the controls are normative. Link each (per the Link-form
  note above).
- In "## Writing rules", keep the rules but tag the section as "CNT-3 in practice" (it already
  cites CNT-1 on line 33; add the CNT-3 link at the section head).
- **Reconcile the drifted tone table.** The tone-by-context table here has only 5 rows; the
  canonical skill table (`tfx-content-style/SKILL.md` ~33–40) has 6 — add the missing
  "Permission / data request" row (copy it verbatim from the skill: tone "Transparent, plain",
  direction "Say what's collected, why, and how it's used — before asking"). Keep the
  Destructive-action row's "(CMP-2)" reference optional on the website (link it per the Link-form
  note, or omit) — the row content, not the annotation, is what must match. The voice attribute
  table already matches; leave it. Do **not** delete the tables.

**Verify**: `pnpm build` (content guard + build) passes; the page renders with working control
links; the tone table now has the same 6 rows as the skill (the `git diff` shows the added
Permission row + the link framing, nothing else).

### Step 3: Make `naming.mdx` point at CNT-2 as normative

In `content/guidelines/naming.mdx`, replace the bare "(CNT-2)" on line 11 with an explicit
pointer near the top, e.g. a lead line: "The normative rule is `[CNT-2](<link>)`; this page is
its human-facing guidance." — where `<link>` follows the Link-form note in Step 2
(`/standards/catalog/cnt-2` post-036, else `/standards/catalog#CNT-2`). Keep the Do/Don't and the
Good/Bad table as presentation.

**Verify**: `pnpm build` passes; the CNT-2 link resolves.

### Step 4: Record the guidelines mapping in `SYNC.md`

Add a row (or short section) to `harness/docs/SYNC.md`'s source-of-truth table:

| Artifact | Source (normative) | Consumers | Sync mechanism |
|---|---|---|---|
| Voice/tone/naming guidance | catalog controls CNT-1/2/3 + SLP-9 (+ detail files) | `tfx-content-style` skill (applies); `content/guidelines/voice-tone.mdx` + `naming.mdx` (present) | pointers (skill + docs link the controls); SLP-9 word list parity-checked (see `tfx-sync:slp9-buzzwords`) |

Add one line noting the deferred voice/tone-table parity check (low drift cost; pointers suffice
for v1).

**Verify**: `claude plugin validate .` passes; `git status` shows only in-scope files.

## Test plan

- No code change; verification is build + validator + plugin-validate + a read-through that the
  pointers are correct and the prose passes SLP-9 (no buzzwords, ≤25-word sentences).
- Confirm the control links resolve (post-036 to `/standards/catalog/<id>`; pre-036 to the
  catalog anchor).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `tfx-content-style/SKILL.md` has a "Source of truth" note naming CNT-1/2/3 + SLP-9 as normative and the catalog as the tie-breaker
- [ ] `voice-tone.mdx` links CNT-3 + CNT-1 (+ keeps the SLP-9 catalog link); `naming.mdx` links CNT-2 as the normative rule
- [ ] No rule *content* changed except reconciling the drifted website tone table to the canonical skill version (Step 2 — the added "Permission / data request" row); naming examples + writing rules intact — `git diff` shows framing/links + that one tone-row reconciliation, not rule edits
- [ ] `harness/docs/SYNC.md` has the guidelines source-of-truth row + the deferred-table-check note
- [ ] `python3 checks/validate.py` → `OK` (CNT-1/2/3 references resolve; 035 parity checks pass); `claude plugin validate .` passes; `pnpm build` passes
- [ ] The skill stays self-contained (no `content/` dependency); only in-scope files modified; `plans/README.md` row updated

## STOP conditions

Stop and report (do not improvise) if:

- `SYNC.md` does not exist (plan 035 not landed) — land 035 first.
- Making the skill point at the controls would require it to read `content/` — it must not;
  reference control IDs + the plugin-relative `../../../standards/controls/*.md` paths only.
- You find a divergence **beyond** the known tone-table drift (the missing "Permission / data
  request" row + the "(CMP-2)" annotation, which Step 2 reconciles toward the canonical skill
  version) — e.g. the voice *attribute* table or the writing rules also differ in substance, or
  the two tone tables conflict in wording rather than just row count. Then report the diff and ask
  the design-lead which is canonical rather than silently picking one. (The known row-count drift
  is NOT a STOP — Step 2 resolves it.)

## Maintenance notes

- The normative source for content guidance is the catalog controls (CNT-1/2/3 + SLP-9). The
  skill applies them; the website presents them; both link them. New content rules go into the
  controls first, then the skill/website point at them.
- **Deferred: a voice/tone table parity check.** The voice attribute + tone-by-context tables are
  duplicated between the skill and `voice-tone.mdx`. A `tfx-sync`-style parity check (like 035's)
  could enforce them, but it would have to read `../content/` from `validate.py` (crossing the
  harness↔website boundary, skipping when the plugin is installed without the website) — brittle
  for low-drift-cost presentation. If these tables prove to drift in practice, add a
  `tfx-sync:voice-attributes` block (source = the skill, the plugin-shipped copy) and a
  website-optional sub-check. Noted in SYNC.md.
- A reviewer should confirm no rule content changed — only framing + links — and that the skill
  remains installable without the website.
