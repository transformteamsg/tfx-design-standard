# Plan 006: Build the "Get started" onboarding page — plain-language, visual, kind

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 233f3be..HEAD -- content/harness app/harness components/mdx.tsx content/map.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M–L
- **Risk**: MED (design quality is the deliverable; the site must pass its own standard)
- **Depends on**: plans/004-onboarding-wizard.md (the page documents the wizard's real steps) and plans/005-website-domains-section.md (cross-links)
- **Category**: direction (adoption surface) / docs
- **Executor model**: Opus — and the page must be produced **through the repo's own design loop** (`harness:design` skill), not free-styled; the evaluator agent grades it
- **Planned at**: commit `233f3be`, 2026-07-10

## Why this matters

The adopting audience is explicitly not tech-savvy or AI-native. For them, "install the plugin and run the skills" is a wall. Requirement R12: a dedicated page that explains — in plain language — what the plugin is, what skills are, how the design loop works, how to install, how to customise (the profile), and where to get help, **with enough visualisations that the mental model lands without walls of text**. R13: this page is the "before" (understand + decide) and the setup wizard (plan 004) is the "during" (do); each references the other and they tell one story with the same step names. Acceptance AE4: a non-technical domain lead can read this page and explain back what the plugin does and what their team must decide before adopting.

## Current state

- `content/harness/` — existing harness section content: slugs `loop`, `skills`, `tools`, `on-ramp` (see `content/map.json`). **Read all four before writing anything** — `on-ramp` is the closest existing artifact; this plan creates a kinder, non-technical entry that either supersedes or complements it (decision in step 1).
- Frontmatter contract (`lib/content.ts`): `title`, `description`, `status` ("settled"/"proposed" badges), `answers`, `illustration` (Midjourney subject prompt; SREF appended by `<Illo>`).
- MDX components are registered in `components/mdx.tsx` (e.g. `<Illo>` from `components/illo.tsx`); diagrams for this page should be React/SVG components registered there, or MDX-embedded images under `public/` — inline SVG components preferred (theme-aware via CSS variables from `app/globals.css`; raw hex is forbidden — TOK-1, enforced by `token-audit.py` in the prebuild).
- Design constraints that bind this page (root `CLAUDE.md` + catalog): no gradient text, no nested cards, no side-tab borders, no bounce easing (SLP controls); tokens only; Plus Jakarta Sans/Inter only; copy in second person, active voice, sentence case; SLP-9 anti-AI-writing rules (`harness/standards/controls/slp-9.md`).
- The story the page must tell (facts, post-001/002/004): the standard = foundation (catalog of controls + principles) + domain profiles (your brand); the plugin (`/plugin marketplace add …` + `/plugin install dxd@dxd`) puts skills into Claude Code; skills are commands like `/dxd:start`, `/dxd:design`, `/dxd:setup`; the loop = intent → variants → plan (human approves) → implement → verify (checks + evaluator); customising = answering the setup wizard's questions, which writes your product's DESIGN.md; help = the feedback skill + the foundation owner.
- Wizard step names/vocabulary: `harness/.claude/skills/setup/` (post-004) — the page must mirror them (R13).

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Build (MDX + token/a11y gates) | `pnpm build` | exit 0 |
| Dev server for capture | `pnpm dev` | serves localhost |
| Typecheck / lint / tests | `pnpm typecheck && pnpm lint && pnpm test` | exit 0 |

## Suggested executor toolkit

- Run this page through the repo's own design loop: invoke the `harness:design` skill (or `design` if unscoped) for the page's layout/diagrams, and have the `tfx:evaluator` / evaluator agent grade the result before finishing — the site must pass its own standard, and this page is its front door.
- `agent-browser` skill for screenshots at desktop + mobile widths (evidence for the PR and the evaluator).

## Scope

**In scope**:
- `content/harness/get-started.mdx` (create) and `content/map.json` (add `get-started` to the `harness` slugs, first position)
- Possible retitle/edit of `content/harness/on-ramp.mdx` (step 1 decision)
- 2–4 new diagram components, e.g. `components/diagrams/{foundation-profile,loop,adoption-journey}.tsx`, registered in `components/mdx.tsx`
- One prominent link from the landing page (`app/page.tsx`) and from each domain page's "Adopt the standard" anchor (coordinate with 005; if 005 unmerged, note the pending link)

**Out of scope**:
- The wizard itself (004); harness skills; the catalog.
- Restructuring the harness section beyond adding/retitling the two slugs.
- Marketing-style copy — this is a standards site; the kindness is clarity, not hype (SLP-9 buzzword rules apply).

## Git workflow

- Branch: `advisor/006-onboarding-page` off `main` (after 004 + 005).
- Commit per step; match repo message style.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Position against `on-ramp`

Read `content/harness/{on-ramp,loop,skills,tools}.mdx`. Decide: if `on-ramp` already targets non-technical adopters, extend it in place (rename slug NOT allowed — URLs are stable; retitle is fine); otherwise create `get-started.mdx` as the plain-language entry and reframe `on-ramp` as the technical deep-dive, cross-linking both. Record the decision + rationale in the PR description.

**Verify**: `content/map.json` harness slugs include the chosen entry page first; `pnpm build` → exit 0.

### Step 2: Write the page content

Structure (each section short, diagram-anchored):

1. **What this is** — one paragraph: a design standard your product can adopt; foundation + your brand. Diagram 1: foundation/profile split (one foundation box; four domain expressions; "your product" pointing at its domain).
2. **What the plugin and skills are** — plugin = a package you install into Claude Code once; skills = commands you type, each named with what it does (`/dxd:start` orients you, `/dxd:setup` onboards you, `/dxd:design` runs the loop). No jargon left undefined; "agent" gets one plain sentence.
3. **How the loop works** — Diagram 2: the six phases with the human gate highlighted ("you approve the plan before anything is built").
4. **What adopting takes** — the honest checklist: a Claude Code license/session, 15 minutes with the wizard, and your brand basics (primary colour, fonts — everything else can default). Diagram 3: the adoption journey (read this page → decide brand basics → install → run the wizard → design your first screen), with the same step names the wizard uses (R13).
5. **How to customise** — the profile in one breath: "you declare values (your colour, your type); the standard never makes you restate rules"; link your domain's page (005).
6. **Where to get help** — the feedback skill, the foundation owner, the domain pages.

Copy: second person, active voice, sentence case; SLP-9 compliant; Singapore English (organise, colour). Frontmatter `status: settled` only if the wizard (004) has landed — otherwise `proposed` (don't mark proposed things settled).

**Verify**: `pnpm build` → exit 0.

### Step 3: Build the diagrams

Implement diagrams as theme-aware inline SVG React components using only `app/globals.css` tokens (`var(--…)`) — zero raw hex (`token-audit.py` will fail the build otherwise). Text in diagrams uses the site's fonts and meets AA contrast (`contrast`/`a11y-static` checks run on `app components`). Each diagram gets an accessible description (aria/role per existing component patterns — check how `components/thumbnails.tsx` and `components/illo.tsx` handle alt text). Register in `components/mdx.tsx`.

**Verify**: `pnpm build` → exit 0 (token + a11y gates pass); each diagram renders at 360px and 1280px widths without horizontal overflow (dev-server check).

### Step 4: Run the page through the design loop's verify

Capture desktop + mobile screenshots (agent-browser); dispatch the evaluator agent with the screenshots, the page's intent ("non-technical domain lead understands adoption in one read"), and in-scope controls (SLP set, LAY, TYP, A11Y, CNT). Fix what it flags; attach screenshots + evaluator verdict to the PR.

**Verify**: evaluator verdict contains no L0/L1 failures; screenshots attached.

### Step 5: Wire the entry points

Landing page (`app/page.tsx`): add the "New here? Get started" link/CTA per its existing patterns (read the file; follow its component/CTA idiom — content-in-TSX is allowed for chrome-level nav labels only). Domain pages: the "Adopt the standard" anchor (005) links here.

**Verify**: `pnpm build` → exit 0; `grep -rn 'get-started' app/page.tsx content/domains/ | wc -l` → ≥ 2 (or noted as pending on 005).

## Test plan

- Build gates (`pnpm build`) cover MDX, tokens, static a11y.
- The evaluator run (step 4) is the design-quality test; its verdict is the artifact.
- Human proxy test for AE4: have one non-technical reader (or simulate: the evaluator prompt includes "could a non-technical reader explain back what the plugin does and what they must decide?") — record the answer in the PR.

## Done criteria

- [ ] `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test` exit 0
- [ ] Page exists, first in the harness section, covering: what it is / plugin & skills / the loop / what adopting takes / customising / help
- [ ] ≥3 theme-aware, token-only, AA-passing diagrams registered via `components/mdx.tsx`
- [ ] Page vocabulary matches the wizard's step names (R13) — list the pairs in the PR
- [ ] Evaluator verdict attached, no L0/L1 failures; desktop+mobile screenshots attached
- [ ] Entry links from landing page and (if 005 landed) domain pages
- [ ] No files outside the in-scope list modified; `plans/README.md` row updated

## STOP conditions

Stop and report back if:

- Plan 004 hasn't landed and the wizard's steps don't exist to document — writing the page against imagined steps violates R13; wait or mark `status: proposed` and flag.
- The diagrams can't meet AA contrast with existing tokens — a token gap is a catalog/foundation question, not a raw-hex exception.
- The evaluator flags structural problems twice after fixes — escalate with its verdicts rather than iterating blind.

## Maintenance notes

- This page and the wizard are one story (R13): any wizard interview change must be mirrored here. The wizard's `interview.md` carries a pointer to this file (004's maintenance note).
- Install commands on the page go stale when the GitHub repo renames to `dxd-design-standard` — the MIGRATION-DXD note (001) lists this page as an update site.
- The diagrams are the first reusable diagram components in the site; if more pages need diagrams, extract shared primitives then, not now.
