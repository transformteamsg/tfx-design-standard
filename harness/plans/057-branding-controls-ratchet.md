# Plan 057: Per-product branding controls — extend IDN via the ratchet (design-lead gated)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `harness/plans/README.md` — unless a reviewer dispatched you and told you
> they maintain the index.
>
> **Drift check (run first)**, from the repo root:
> `git diff --stat <post-056 merge SHA>..HEAD -- harness/standards harness/docs/catalog-changes harness/README.md`
> (Fill in the SHA where plan 056 landed — this plan HARD-depends on 056's
> scope fields being live. If 056 has not merged, STOP.)

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW–MED (Step 1 is propose-only; the catalog commit sits behind the design-lead gate)
- **Depends on**: plans/056-catalog-scope-dimensions.md (**hard** — uses `products:`/`audiences:` fields and the meta display maps)
- **Category**: direction
- **Planned at**: commit `48d13dd`, 2026-07-03

## Why this matters

Operator direction (2026-07-03): the per-product layer of the catalog
restructure "will include branding standards as well". Today the recorded
branding facts are scattered: the per-product primary lives in COL-1's detail
table, the tone-by-product calibration lives inside the `content` skill, the
product-icon rules live in a website guideline, and only logo/lockup usage
(IDN-1) is a control. This plan consolidates the *already-recorded* branding
facts into catalog controls under the existing **IDN (Identity)** category —
the first real users of 056's `products:` scope field — via the standard
ratchet: proposal records first, catalog commit only after design-lead
approval.

Deliberately NOT authored (confirmed with the operator): speculative
student/parent controls — those wait for real surfaces, per the harness's own
principle that controls grow from observed failures and real surfaces, never
speculation.

**Category decision (do not revisit):** extend `IDN` (Identity — the existing
branding category, holding IDN-1 on logos/lockups). Do NOT create a `BRD`
prefix — a new prefix means schema, categories map, website grouping, and
COUNT-prose churn for zero semantic gain.

## Current state

Verified at `48d13dd` (re-verify after 056 merges — the drift check above):

- `harness/standards/catalog.yaml` — 48 controls; IDN category holds exactly
  one control:

  ```yaml
  - id: IDN-1
    source: TFX-DS
    title: Product lockups and logos render only from approved assets; no recreations
    tier: L1
    check: deterministic
    phase: [implement, verify]
    applies_to: [page]
    verify: "Logo/lockup files resolve to the approved asset library; no inline redraws"
    waiver: documented
    fails_when:
      - rebuilt or distorted logo marks
  ```

- **Recorded branding facts** (the ONLY permitted sources for the drafts —
  every claim in a proposal record must cite one of these):
  1. `harness/standards/controls/col-1.md` — the per-product primary table
     (TW → Teacher & School Blue `#0064FF`; CaseSync → Radix indigo-9; Glow →
     Radix orange-9). COL-1 itself stays untouched — it already owns
     "primary actions use the product's own primary".
  2. `harness/.claude/skills/content/SKILL.md` §"Per-product tone calibration
     (§6)" — verbatim:

     ```
     Same character everywhere; calibrate weight, never switch systems:

     - **Teacher Workspace** — calm daily command centre: neutral, steady, quietly confident.
     - **CaseSync** — higher gravity: more reserved, restrained celebration, privacy-forward
       (sensitive casework).
     - **Glow** — lighter, more encouraging: warmer accents, more celebratory moments.
     - **Posts / PG Staff Portal** — pure TW, no nuance.
     ```

  3. `content/guidelines/product-icons.mdx` — the product-icon guideline on
     the website (approved icon set usage).
  4. `harness/CLAUDE.md` — the fixed stack + "Brand essence is Kind Utility"
     (a principle, NOT checkable — it must not become a control; the
     README's litmus test: "if you can't check it, it's a principle").

- **Ratchet mechanics**: proposal records live in
  `harness/docs/catalog-changes/` — read the two records plan 053 wrote
  there (LAY-1 grid, LAY-7 focal point) and copy their structure, including
  the placeholder-id convention and the honest evidence line
  ("standards-derived, no incident" where true). Governance precedent:
  020→023, 027, 029, 053 — Step 1 records now, catalog commit ONLY after a
  named design-lead approval (interactive in-session approval counts and is
  recorded, per 027/029).

- **Count guard**: `[COUNT-SYNC]` in `harness/checks/validate.py` fails the
  build when any "`<N> controls`" claim in `harness/README.md` disagrees
  with the catalog count. Committing new controls REQUIRES updating that
  prose in the same change.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Catalog validation | `cd harness && python3 checks/validate.py` | `OK: <N> controls valid`, exit 0 |
| Self-test | `cd harness && python3 checks/validate.py --self-test` | exit 0 |
| Website check + build | `node scripts/check-standards.mjs && pnpm build` | exit 0 |
| Re-audit set for a changed control | `cd harness && python3 checks/reaudit-scope.py IDN-1` | prints the affected-records set |

## Scope

**In scope**:

- `harness/docs/catalog-changes/` — new proposal records (Step 1)
- After the gate ONLY: `harness/standards/catalog.yaml` (new IDN entries +
  `meta.updated`), `harness/standards/controls/idn-*.md` (new detail files),
  `harness/README.md` (COUNT-SYNC prose), `harness/plans/README.md` (row)

**Out of scope**:

- COL-1, TYP-1, IDN-1 — the existing controls already covering primary
  colour, typefaces, and logos. The new controls must not duplicate them;
  overlap is a drafting error.
- The `content` skill's §6 table — it stays where it is; a new control's
  detail file POINTS at it or carries a synced copy per `docs/SYNC.md`
  fragment rules (read that doc before duplicating any fragment).
- `schema.json`, validators, website code — 056 finished that layer; new IDN
  entries flow through automatically.
- Anything student/parent-specific.
- No `BRD` prefix.

## Git workflow

- Branch: `advisor/057-branding-ratchet` off `main` (post-056).
- Step 1 commit: `docs(standards): propose IDN branding controls — ratchet records (plan 057)`.
- Step 3 commit (only after the gate): `feat(standards): IDN-2..N branding controls — design-lead approved <date> (plan 057)`.

## Steps

### Step 1: Draft the proposal records (propose-only — no catalog edits)

Read the two plan-053 records in `harness/docs/catalog-changes/` first and
mirror their structure. Write one record per candidate. The candidates, each
seeded ONLY from the recorded facts above:

1. **Product icons from the approved set** (candidate `IDN-2`; global —
   applies to every product): product icons render only from the approved
   product-icon set, no ad-hoc or regenerated icons — the icon-level twin of
   IDN-1. Seed: `content/guidelines/product-icons.mdx` + IDN-1's shape.
   Draft as `check: deterministic`, `tier: L1`, `phase: [implement, verify]`,
   `applies_to: [page, component]`, no scope fields (global).
2. **Per-product tone calibration** (candidate `IDN-3`; global with
   per-product parameters, the COL-1 pattern): copy in a product carries that
   product's calibrated register — TW neutral/steady, CaseSync reserved and
   privacy-forward, Glow warmer/encouraging; same character, calibrated
   weight, never a different system. Seed: content SKILL §6 verbatim. Draft
   as `check: judgment`, `tier: L2`, `applies_to: [content]`, detail file
   carries the per-product table (synced or pointed per `docs/SYNC.md`).
3. **CaseSync sensitivity register** (candidate `IDN-4`; the first
   product-SCOPED control — `products: [casesync]`): CaseSync surfaces treat
   casework as sensitive — restrained celebration, no gamified or playful
   elements around case data. Seed: the §6 CaseSync line ("higher gravity …
   privacy-forward (sensitive casework)"). Flag in the record that the
   design lead may fold this into IDN-3's table instead of a separate
   control — that is exactly the kind of call the gate exists for.

Each record carries: the draft YAML entry, the evidence citations
(file:line), the non-duplication statement (why COL-1/TYP-1/IDN-1 don't
already cover it), and open questions. Evidence lines stay honest:
"standards-derived from recorded guidance, no incident" — do not invent
failures.

**Verify**: records exist; `python3 harness/checks/validate.py` still prints the pre-gate count (catalog untouched); `git status --short` shows only `docs/catalog-changes/` additions.

### Step 2: STOP — design-lead gate

Present the records and stop. Do not proceed without a named design-lead
approval (interactive approval in-session counts; record the name and date
in each record, per the 027/029 precedent). If this is an unattended run,
the plan ENDS here: report "gate-pending", like plan 053.

### Step 3: Commit the approved controls (gated)

Only for candidates the design lead approved, with whatever amendments they
made:

1. Add the entries to `catalog.yaml` under the IDN section, ids assigned
   from the live catalog's next free IDN number (do not hardcode — read the
   file). Bump `meta.updated`.
2. Write `controls/idn-<n>.md` detail files for every `judgment`/`hybrid`
   control (validate.py enforces this); deterministic entries may be
   self-sufficient.
3. Update every "`<N> controls`" claim in `harness/README.md` to the new
   count — `[COUNT-SYNC]` fails the build until you do.
4. Mark each record approved (name + date), per the 053→023 pattern.

**Verify**: `python3 harness/checks/validate.py` → `OK: <new N> controls valid`, exit 0; `python3 checks/validate.py --self-test` → exit 0; `node scripts/check-standards.mjs && pnpm build` → exit 0 (the new controls render as catalog pages + `.md` twins automatically).

### Step 4: Close the loop

1. `cd harness && python3 checks/reaudit-scope.py IDN-1` (and each new id) →
   record the re-audit set in the records (which existing decision records,
   if any, should be re-checked against the new controls).
2. Update the 057 row in `harness/plans/README.md` (DONE or
   DONE-AS-PROPOSED / gate-pending, mirroring 053's honest status style).

## Test plan

- Pre-gate: validate.py unchanged count proves propose-only discipline.
- Post-gate: validate.py (count + detail-file enforcement + [COUNT-SYNC]),
  check-standards.mjs, pnpm build. The website's per-control pages and
  twins are generated — visiting `/standards/catalog/idn-2` after build is
  the smoke test.
- No routing implications (no skill files change).

## Done criteria

Pre-gate (always):

- [ ] One record per candidate in `harness/docs/catalog-changes/`, each with draft YAML, file:line evidence, non-duplication statement
- [ ] Catalog byte-untouched at Step 1 (`git diff -- harness/standards/catalog.yaml` empty)

Post-gate (only if approved):

- [ ] `python3 harness/checks/validate.py` → `OK: <new N> controls valid`
- [ ] `harness/README.md` count prose updated ([COUNT-SYNC] green)
- [ ] Detail files exist for every new judgment/hybrid control
- [ ] `pnpm build` exit 0; `/standards/catalog/idn-<n>` pages exist in the build output
- [ ] Records marked approved with a named design lead + date
- [ ] `plans/README.md` row updated

## STOP conditions

- Plan 056 is not merged (no `products` key in `harness/standards/schema.json`).
- Step 2 always stops — that is the gate, not a failure.
- A draft turns out to duplicate COL-1, TYP-1, or IDN-1 in substance —
  report the overlap instead of wordsmithing around it.
- The design lead rejects all candidates → mark the plan
  REJECTED-AT-GATE with their reasoning captured in the records; do not
  redraft in the same run.
- You are tempted to draft a student- or parent-specific control — out of
  scope by operator decision.

## Maintenance notes

- IDN-3's per-product table duplicates a fragment of the content skill's §6 —
  whichever way Step 3 resolves it (pointer vs synced copy), follow
  `docs/SYNC.md`; if a synced copy is chosen, a `tfx-sync` marker + parity
  check is the precedent (L0-SYNC/SLP9-SYNC pattern).
- When student/parent surfaces become real, their branding/tone controls
  join via this same ratchet — and 056's `audiences:` field is how they
  scope. The age-band values already exist in the schema.
- The direction finding "per-product DESIGN.md in product repos"
  (plans/README.md batch 6, #2) is the parameter-side complement: if it
  lands, IDN-3's per-product table may migrate from a detail file to
  machine-read per-product files — note this in IDN-3's record.
