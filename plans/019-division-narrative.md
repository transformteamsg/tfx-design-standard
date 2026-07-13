# Plan 019: Division-level narrative — landing, overview, machine identity, nav order, and the reading ladder

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If any
> STOP condition occurs, stop and report — do not improvise. Do NOT update
> `plans/README.md` — your reviewer maintains the index.
>
> **Drift check (run first)**:
> `git diff --stat 7fbc703..HEAD -- content/sections/landing.mdx app/page.tsx app/overview/page.tsx content/sections/home.mdx app/layout.tsx lib/llms.ts content/sections/how-to-read.mdx components/diagrams/ladder.tsx components/sidebar.tsx content/sections/products.mdx content/sections/domains.mdx`
> Expected drift: `components/sidebar.tsx` MAY show one added Foundations line
> (`/foundations/motion`) from plan 016 — preserve that line in everything you
> do. Any other drift: compare against the excerpts below; mismatch = STOP.

## Status

- **Priority**: P1 (tomorrow's audience is the division; today's copy speaks team)
- **Effort**: L
- **Risk**: MED (the front door; copy judgment under SLP-9)
- **Depends on**: none (016's sidebar line must merely be preserved if present)
- **Category**: docs/direction (IA + narrative)
- **Planned at**: commit `7fbc703`, 2026-07-12

## Why this matters

Tomorrow this site is presented to the whole DXD division (Digital Products &
Excellence Division) as the division-level design standard — one foundation,
four domain expressions (Teachers & School, Students, Parents, Platform incl.
EduPass). But every identity surface still speaks team-level: the landing hero
says "how TransformX builds the Teacher & School portfolio", the site-wide meta
description and the machine-readable /llms.txt call it the TFX/teacher
standard, the landing team block ships THREE literal "Add designer name"
placeholders, and the page that tells a team how to adopt is buried four levels
deep under "Harness". A division reader must answer three questions in the
first minute — what is this, why should we care, what does my team do next —
and today's front door answers none of them at division scope.

## Decided constraints (do not relitigate)

- Foundation sections stay the primary nav spine; **one** "Domains" item; no
  per-domain nav buttons; `/products/*` URLs stay (2026-07-10 requirements
  R9–R11).
- The illustration guideline is strict: Midjourney-with-SREF only, **no
  hand-coded fallback art** — so you remove the landing hero's empty
  placeholder but do NOT draw replacement art (a later plan embeds the loop
  diagram there; you leave a marked slot).
- "Kind Utility" and "does this help teachers…" are the **Teachers & School
  domain's** declarations — at division level they are cited as the first
  domain's instance, never erased.

## Current state (verbatim excerpts — verify before editing)

- `content/sections/landing.mdx` frontmatter (the whole file is frontmatter):
  - line 2: `title: Design that gives teachers their time back.`
  - line 3: `description: The DXD Design Standard is how TransformX builds the Teacher & School portfolio (Teacher Workspace, CaseSync, and Glow). It turns our design quality bar into something every builder can reach, with or without a designer in the room.`
  - lines 34–43: `team:` with `- name: Add designer name` ×3 (roles: Principal
    Product Designer / Product Designer CaseSync / Product Designer Glow)
  - also holds `illustration:`, `cta:`, `readersHeading:`, `readersLead:`,
    `readers:` (3 entries: human / human-machine / machine — KEEP these), and
    `why:` (3 entries — KEEP, may tighten wording).
- `app/page.tsx`:
  - line 34–36 kicker: `TransformX · Teacher &amp; School portfolio`
  - lines 43–62: CTA row — primary Link to `/overview` + two quiet links
    (`/for-agents` "Building with an AI agent?", `/how-to-read` "New here? Start here")
  - lines 65–69: `{doc.illustration && (<Parallax drift={14}><Illo subject={doc.illustration} /></Parallax>)}` — the dashed empty placeholder box that is currently the hero's only visual
  - lines 108–116: the "one test" panel: `Does this help teachers work faster with less stress?` / `If not, we don't build it.`
  - lines 118–141: "The designers behind it" — initials-avatar grid rendering the `team:` placeholders
- `app/overview/page.tsx`:
  - lines 27–29 kicker: `TransformX · Teacher &amp; School portfolio`
  - lines 30–32 h1: `Kind Utility,<br />held to a standard.`
  - lines 33–38 intro: `How TransformX designs for Singapore's teachers — utility-first at the core, human-first at the surface…`
  - lines 42–48: one-test callout (`does this help teachers work faster with less stress?`)
  - line 40: `{home?.illustration && <Illo subject={home.illustration} />}` — KEEP (directory page; the strict-guideline placeholder is acceptable here)
  - tiles array lines 12–20 includes domains — KEEP tile set; you may reorder `domains` before `products`.
- `content/sections/home.mdx` line 3: `description: How TransformX designs for Singapore's teachers.`
- `app/layout.tsx` lines 10–13 metadata description: `"How TransformX designs the Teacher & School portfolio: principles, checkable standards, guidelines, foundations, and the AI design harness. For human builders and AI agents."`
- `lib/llms.ts` (machine identity — verbatim):
  - line 11: `lines.push("# TFX Design Standard");`
  - lines 13–22 mission blockquote: `Make the quality bar independent of staffing. Brand essence: Kind Utility — useful first, kind at the surface. The one test: does this help teachers work faster with less stress? …`
  - line 29: `"- TransformX, Teacher & School portfolio, GovTech Singapore (v0.1 draft)."`
  - line 37: waiver bullet with `tfx-waive`
  - line 39: `"- Stack: Base UI components + Radix Colors + shadcn/ui default tokens. Fonts: Plus Jakarta Sans (display), Inter (body)."` — presented as THE stack, contradicting the domain model (stack is a profile fact, per requirement R2)
  - lines 44–49 "## Start here" lists only Overview / How to read / For agents.
- `content/sections/how-to-read.mdx`: `<Ladder />` at line 8, then a 6-row
  table (lines 10–17) duplicating the same six layers/answers, then
  `## Status labels` and `## Mission` sections (KEEP those two).
- `components/diagrams/ladder.tsx`: `layers` array lines 10–23 — six rows
  (principles why / standards must [enforced] / guidelines should / foundations
  with what / products where / harness how, fast); each row already a real Link.
- `components/sidebar.tsx` nav array lines 34–125: groups in order Start
  (Overview, How to read this, For agents), Principles, Standards, Guidelines,
  Foundations, Products, Domains, Harness (Get started, The loop, Skills,
  Tools, Designer on-ramp), Governance.
- `content/sections/products.mdx` line 4: `answers: where`;
  `content/sections/domains.mdx` line 4: MISSING an answers key check — the file
  has `answers: "where"`? Verify: it has no `answers` line if grep says so; the
  audit found BOTH claim "where" — run
  `grep -n "answers" content/sections/products.mdx content/sections/domains.mdx`
  and reconcile per Step 6.
- Build guard `scripts/check-standards.mjs`: sidebar hrefs are a **Set** —
  moving a registered doc's entry between groups is legal; an entry for an
  unregistered path fails; a registered doc with zero entries fails.
- Conventions: SLP-9 (no AI-writing tells — canonical list
  `harness/standards/controls/slp-9.md`, read it before writing any copy);
  second person, active voice, sentence case, Singapore English; landing
  motion primitives `Reveal`/`Parallax` from `components/landing-motion.tsx`
  (016 may have re-pointed their internals — the API is unchanged).

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck / Lint / Tests | `pnpm typecheck && pnpm lint && pnpm test` | exit 0 |
| Standards guard | `node scripts/check-standards.mjs` | `OK: … docs registered, present, and in nav` |
| Full build | `pnpm build` | exit 0, no `[doc-page]` warnings |
| Dev server | `pnpm dev --port 4019` | serves |

## Suggested executor toolkit

- Read `harness/standards/controls/slp-9.md` FIRST (copy constraints), then
  `content/harness/get-started.mdx` (the house's best plain-language page —
  match its register).
- `agent-browser` CLI for screenshots (`~/.claude/skills/agent-browser/SKILL.md`).

## Scope

**In scope** (only these):
- `content/sections/landing.mdx`, `app/page.tsx`
- `app/overview/page.tsx`, `content/sections/home.mdx`
- `app/layout.tsx` (metadata description only)
- `lib/llms.ts`
- `content/sections/how-to-read.mdx`, `components/diagrams/ladder.tsx`
- `components/sidebar.tsx` (group order + item moves only)
- `content/sections/products.mdx`, `content/sections/domains.mdx`
  (**frontmatter `answers:` line only** — a sibling plan owns their bodies)

**Out of scope** (do NOT touch):
- `content/harness/get-started.mdx` (plan 017 owns its embeds; its content is
  the model, not your patient)
- `components/landing-motion.tsx`, `lib/motion.ts`, `app/globals.css`
- `components/mdx.tsx`, all other diagrams
- `content/sections/standards.mdx`, `for-agents.mdx`, `harness.mdx` and all
  other content files (plan 021 owns them)
- The `readers:` block's three-reader structure (tune words, keep structure)

## Git workflow

- Worktree branch `advisor/019-division-narrative`; commit per logical unit
  (landing / overview+home / llms+layout / how-to-read+ladder / sidebar);
  style `feat(site): …` / `docs(site): …`; do not push.

## Steps

### Step 1: Landing content (`content/sections/landing.mdx`)

Rewrite frontmatter fields (structure unchanged, `illustration:` may stay —
the hero stops rendering it in Step 2):

- `title:` — division-level, human-outcome, ≤ 8 words, sentence case. Default:
  `Design that gives people their time back.` (If you produce a sharper line
  that names no single audience, you may use it; record both in NOTES.)
- `description:` — must contain, in plain prose: DXD Design Standard; one
  foundation; the four domain expressions BY NAME (Teachers & School, Students,
  Parents, Platform); "born in the Teacher & School portfolio" as the honest
  origin; and the promise (quality bar every builder reaches, with or without
  a designer). ≤ 3 sentences, no buzzwords (SLP-9).
- `readersLead:`/`readers:` — keep; adjust any teacher-only wording to
  division-neutral where it isn't quoting the T&S domain.
- `why:` — keep the three items; tighten wording only.
- REPLACE `team:` with two new frontmatter blocks:
  ```yaml
  owners:
    - role: Foundation owner
      who: A design lead stewards the catalog and approves every ratchet.
    - role: Domain leads
      who: Each domain declares its brand profile and proposes domain-scoped controls.
    - role: Everyone in DXD
      who: Anyone can propose a control from an observed failure. Evidence, not opinion.
  roles:
    - key: design
      title: Design leads
      first: Read the principles, then run the critique skill on one existing page this week.
      href: /harness/get-started
      link: Get started
    - key: eng
      title: Engineers
      first: Install the plugin, point CI at the catalog and checks, and keep the gates green.
      href: /for-agents
      link: For agents
    - key: lead
      title: PMs and domain leads
      first: Declare your domain profile — primary colour, typefaces, voice — and know the two gates.
      href: /domains
      link: See the domains
  ```
  (Copy is yours to polish within SLP-9; facts are fixed.)

### Step 2: Landing page chrome (`app/page.tsx`)

1. Kicker → `Digital Products & Excellence Division` (keep styling).
2. CTA row: primary button unchanged (`/overview`, `cta` text); ADD a second,
   visually secondary button → `/harness/get-started`, label `Adopt it — get
   started` (bordered, not filled: `rounded-lg border border-border bg-surface
   px-5 py-3 text-[16px] font-semibold text-foreground hover:border-(--border-strong) hover:bg-muted`
   + the repo focus-visible pattern). Keep the two quiet links.
3. DELETE the hero `Illo` block (lines 65–69) and its now-unused imports;
   leave in its place: `{/* Hero visual: the live loop diagram lands here (plan 022). */}`
4. One-test panel: headline → `Does this help your users get their task done
   faster, with less stress?`; body → two short lines: `If not, we don't build
   it.` and a muted second line: `Each domain names its own test — Teachers &
   School asks it about teachers.`
5. REPLACE "The designers behind it" section with `Who owns this` — render the
   `owners:` list as three hairline-separated rows (role 16px/600 +
   sentence 14px muted; NO avatar circles, NO cards — SLP-4/5).
6. ADD `What adopting means for your team` section (renders `roles:`): three
   hairline rows, each title + `first` sentence + arrow link (`href`/`link`).
   Place it after the "Why a standard" section, before the one-test panel.
   Reuse the `Reveal` wrapper rhythm the page already uses.

**Verify**: `pnpm typecheck && pnpm lint` → exit 0; `pnpm dev --port 4019`,
`/` shows: division kicker, two buttons, no dashed illustration box, roles
band, generalized one-test, owners rows (no "Add designer name" anywhere).

### Step 3: Overview + home descriptor

- `app/overview/page.tsx`: kicker → `Digital Products & Excellence Division`;
  h1 → `One foundation.<br />Four domain expressions.`; intro paragraph →
  division framing in the current sentence rhythm (principles that settle
  arguments, standards a machine can check, a harness so every builder ships
  at the bar — now "for every product team in DXD"); one-test callout → same
  generalized wording as Step 2.4; reorder tiles so `domains` precedes
  `products`; after the governance TopicRow add one muted line linking the
  evidence: `Deciding whether to adopt? The measures live in
  [how this evolves](/governance).`
- `content/sections/home.mdx` description → one sentence, division framing,
  e.g. `How DXD designs digital products — one foundation, four domain
  expressions, every screen held to a checkable bar.`

**Verify**: `pnpm build` → exit 0; /overview shows new h1/kicker and
domains-before-products tiles.

### Step 4: Machine identity (`lib/llms.ts`) + site meta (`app/layout.tsx`)

- `llms.ts` line 11 H1 → `# DXD Design Standard`.
- Mission blockquote → keep "Make the quality bar independent of staffing.";
  replace the Kind-Utility/teacher sentences with: one line naming one
  foundation + four domain expressions (by name); the always-on test line
  `does this help your users get their task done faster with less stress?`;
  keep the `.md` twins line.
- About bullets: org line → `- DXD (Digital Products & Excellence Division),
  GovTech Singapore (v0.1 draft). Born in TransformX's Teacher & School
  portfolio; TFX survives as that domain's profile.`; waiver line →
  `dxd-waive <ID> reason="<specific reason>"` with `(legacy tfx-waive markers
  remain valid)`; stack line → `- Stack is a domain-profile fact, not a
  foundation rule. Teachers & School declares: Base UI + Radix Colours +
  shadcn/ui tokens; Plus Jakarta Sans (display), Inter (body).`; ADD one
  bullet: `- Brand essence is declared per domain — Teachers & School:
  Kind Utility (useful first, kind at the surface).`
- "Start here" list: add `- [Get started](/harness/get-started.md)` first and
  `- [Domains](/domains.md)` last (keep existing three between).
- `app/layout.tsx` metadata description → division framing, ≤ 2 sentences,
  mentioning: DXD division standard, one foundation + four domains, checkable
  standards, harness, for human builders and AI agents.

**Verify**: `pnpm build` → exit 0, then
`curl -s localhost:4019/llms.txt | head -30` (dev server running) shows the
new H1/About; `grep -n "tfx-waive" lib/llms.ts` → only inside the
"legacy remains valid" note.

### Step 5: How-to-read ladder = one artefact, plus a Domains rung

- `components/diagrams/ladder.tsx`: extend each row's data with the authority
  phrase so the table becomes redundant — final rows (label · answers · note):
  1. Principles · why · `used to decide, not to check`
  2. Standards · must · `required; L0 blocks, L1 needs a documented waiver` (keep `enforced: true` + "the only machine-enforced layer")
  3. Guidelines · should · `judgement applies; deviation needs a reason`
  4. Foundations · with what · `build from these by default`
  5. Domains · who for · `brand per domain; adds, never overrides` (href `/domains`)
  6. Products · where · `one character, calibrated per product`
  7. Harness · how, fast · `use the skills and tools; improve them`
- `content/sections/how-to-read.mdx`: DELETE the 6-row table; keep the
  `<Ladder />`, the blockquote litmus line, `## Status labels`, and
  `## Mission` sections. Add one sentence under the ladder pointing adopters
  to `/harness/get-started`.

**Verify**: `pnpm build` → exit 0; /how-to-read shows a 7-rung ladder and no
table (`grep -c "| Layer |" content/sections/how-to-read.mdx` → 0).

### Step 6: Sidebar order + answers dedupe

- `components/sidebar.tsx`:
  - Start group items → `Overview`, `Get started` (`/harness/get-started`),
    `How to read this`, `For agents` (in that order).
  - REMOVE `Get started` from the Harness group (it moved; Harness keeps The
    loop, Skills, Tools, Designer on-ramp).
  - Move the whole `Domains` group above `Products`.
  - PRESERVE the Foundations `motion` entry if present (plan 016).
  - No other reordering, no label changes.
- `content/sections/domains.mdx` frontmatter `answers:` → `who for`;
  `content/sections/products.mdx` keeps `answers: where`. Touch nothing else
  in either file.

**Verify**: `node scripts/check-standards.mjs` → OK (no stale/missing nav
errors); `grep -n "get-started" components/sidebar.tsx` → exactly one hit,
inside the Start group.

### Step 7: Full gate + evidence

`pnpm typecheck && pnpm lint && pnpm test && pnpm build` → all green.
Screenshots via agent-browser (`pnpm dev --port 4019`): `/` at 360/1280,
`/overview` at 1280, `/how-to-read` at 768. Confirm in captures: no
"Add designer name", no dashed hero box, division kicker visible. Paths in
NOTES.

## Test plan

No new unit tests (content + chrome). Machine gates: build guard OK proves
nav/map consistency; `grep -rn "Add designer name" content/` → no matches;
`grep -rn "Teacher & School portfolio" app/ lib/` → no matches left in
kickers/meta/llms (the phrase may legitimately survive inside
`content/domains/teachers-school.mdx` and product pages, which you don't own).

## Done criteria

- [ ] `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all exit 0
- [ ] `node scripts/check-standards.mjs` → OK
- [ ] `grep -rn "Add designer name" content/` → no matches
- [ ] `grep -n "TransformX · Teacher" app/page.tsx app/overview/page.tsx` → no matches
- [ ] `grep -n "TFX Design Standard" lib/llms.ts` → no matches
- [ ] `grep -n "Illo" app/page.tsx` → no matches (hero placeholder gone)
- [ ] Sidebar: Get started under Start; Domains above Products; guard OK
- [ ] /how-to-read: 7-rung ladder, no duplicate table
- [ ] All new copy passes a self-check against slp-9.md (state this in NOTES)
- [ ] No files outside scope modified (`git status`)

## STOP conditions

- Any "Current state" excerpt doesn't match the live file.
- The build guard rejects the sidebar move in a way one retry doesn't fix.
- You feel the need to invent facts (names, metrics, dates) — the plan's fixed
  facts are the only facts; report gaps instead of filling them.
- Removing the hero Illo breaks the landing layout in a way that needs new
  visual invention beyond a comment slot — report with a screenshot.

## Maintenance notes

- Plan 022 replaces the landing hero comment slot with `<OrbitLoop />` — keep
  the slot marker intact.
- `landing.mdx` `owners:`/`roles:` are now data the page depends on — future
  copy edits happen there, not in TSX.
- When real designer names are ready, they belong in a domain-team block on
  the Teachers & School domain page, not on the division landing.
- The reviewer will grade the new copy against SLP-9 and the division framing
  against the 2026-07-10 requirements doc.
