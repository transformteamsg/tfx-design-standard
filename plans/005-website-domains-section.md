# Plan 005: Add the Domains section to the website — one nav item, four domain pages

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 233f3be..HEAD -- content app components/topbar.tsx lib/content.ts lib/content-map.ts components/section-index.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/002-domain-profile-schema.md (domain profiles are the data source); 001 for naming
- **Category**: direction (product surface)
- **Executor model**: Sonnet (follows a strong existing content-section pattern; judgment already made in the IA decisions below)
- **Planned at**: commit `233f3be`, 2026-07-10

## Why this matters

Domain leads across DXD (Students, Parents, Platform/EduPass) adopt through the website — it is what inspired them. The site must present "one foundation, four expressions": each domain gets a page carrying its brand profile (primary colours, typefaces, illustration direction + SREF, voice, stack, products, domain-scoped controls), with Teachers & School launching rich and the other three as honest structured stubs that double as the onboarding template (requirements R9–R11, acceptance AE4). The IA decision is settled: **one top-nav item "Domains", not four domain buttons** — three stub domains as top-level buttons would overstate parity and crowd the nav.

## Current state

- Content architecture (root `CLAUDE.md`: content lives in `content/`, chrome in `components/`, never hardcode standard content in TSX):
  - `content/map.json` — section registry; current keys: `principles`, `standards`, `guidelines`, `foundations`, `products` (slugs `teacher-workspace`, `casesync`, `glow`), `harness`, `governance` (`"root": true`). Shape: `{ "<section>": { "label": "...", "slugs": [...] } }`.
  - `lib/content.ts` — `getDoc(section, slug)` / `listDocs(section)` reading `content/<section>/<slug>.mdx` with gray-matter; frontmatter fields: `title`, `description`, `status` ("settled" | "proposed" — renders different badges; **don't mark proposed things settled**), `answers`, `illustration` (Midjourney subject prompt; SREF appended by `<Illo>`).
  - Section index pages are one-liners, e.g. `app/products/page.tsx`:
    ```tsx
    export const metadata = { title: "Products", ...mdAlternate("/products") };
    export default function Page() { return <SectionIndex sectionKey="products" />; }
    ```
    plus `app/products/[slug]/page.tsx` for detail pages. `lib/markdown-twin.ts` provides `mdAlternate` (each page has a markdown twin at `/md/...`; `lib/llms.ts` builds `app/llms.txt`).
- `components/topbar.tsx` — primary nav currently holds only "For agents"; sidebar comes from the section map (see `lib/content-map.ts`, `components/ui/sidebar.tsx` usage in `app/layout.tsx`).
- Domain data source (from 002): `harness/standards/domains/{teachers-school,students,parents,platform}.yaml`; T&S `settled`, others `proposed`. `lib/catalog.ts` already reads YAML from `harness/standards/` (pattern to follow for a profile reader).
- Catalog controls may carry `domains:`/`products:` scope (002); `lib/catalog.ts` types them.

Settled IA decisions (do not relitigate):

- One new section `domains` with four slugs; nav order: after `principles`… — concretely, insert `domains` between `products` and `harness` in `map.json` (section order in the sidebar follows map order).
- Add "Domains" to the topbar primary nav next to "For agents".
- **Do not move or break `/products/*` URLs.** "Products move under Teachers & School" is presentational: the T&S domain page lists and links the three product pages; `content/products/` stays where it is.
- Stub pages state their status honestly (`status: proposed`, explicit "awaiting domain lead" copy) and render the declaration template — what a domain must supply to exist here.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Build (MDX parse + standards gate) | `pnpm build` | exit 0 |
| Typecheck | `pnpm typecheck` | exit 0 |
| Tests | `pnpm test` | all pass |
| Lint | `pnpm lint` | exit 0 |

## Scope

**In scope**:
- `content/map.json`; `content/domains/` (create: 4 MDX files)
- `app/domains/page.tsx`, `app/domains/[slug]/page.tsx` (create, following `app/products/` exactly — read both product files first and mirror them, including `generateStaticParams`/metadata/md-twin handling)
- `components/topbar.tsx` (one nav link)
- `lib/` — only if a small domain-profile reader is needed (e.g. `lib/domains.ts` reading `harness/standards/domains/*.yaml`, modelled on `lib/catalog.ts`); plus `lib/llms.ts`/sitemap only if sections are hardcoded there (check `app/sitemap.ts` and `lib/llms.ts` — if they iterate `map.json`, no change needed)
- A small MDX-registered component if needed to render profile data inside MDX (register in `components/mdx.tsx`, following existing patterns like `<Illo>`)

**Out of scope**:
- Moving/renaming `content/products/` or its routes.
- The onboarding page (plan 006) — but leave a linkable anchor: each domain page ends with a "Adopt the standard for your product" link target the 006 page will point to and from.
- Editing domain profile YAMLs (002 owns them) or the catalog.
- Landing-page redesign; only the topbar link is chrome.

## Git workflow

- Branch: `advisor/005-domains-section` off `main` (after 002).
- Commit per step; match repo message style.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Register the section

Add to `content/map.json`, between `products` and `harness`:

```json
"domains": {
  "label": "Domains",
  "slugs": ["teachers-school", "students", "parents", "platform"]
}
```

**Verify**: `pnpm build` → fails only on missing MDX (expected until step 2) or exits 0 if the build tolerates empty sections — note which.

### Step 2: Write the four domain MDX pages

`content/domains/teachers-school.mdx` — `status: settled`. Sections: who the domain serves; the brand profile (primary per product, typefaces, stack, illustration direction + SREF, voice = Kind Utility) — **values sourced from `harness/standards/domains/teachers-school.yaml`, not retyped from memory**; the product list linking to `/products/teacher-workspace`, `/products/casesync`, `/products/glow`; domain-scoped controls (e.g. IDN-4) linking into `/standards`.

`students.mdx`, `parents.mdx`, `platform.mdx` — `status: proposed`. Identical section skeleton with "awaiting the domain lead's declarations — until then, foundation defaults apply" in each empty section, plus one intro line per domain (platform: "Platform products serve every audience — e.g. EduPass sign-on for teachers and HQ staff"). The skeleton **is** the declaration template — end each stub with "To fill this page in: declare your profile (see the domain template) and submit it via the ratchet", linking `harness/standards/domains/_template.yaml` and `/governance`.

Copy rules (root `CLAUDE.md`): second person, active voice, sentence case, plain language; apply SLP-9 (no AI-writing tells — canonical list in `harness/standards/controls/slp-9.md`). Frontmatter needs `title`, `description`, `status`; add `illustration` only if a sensible subject prompt exists per existing product pages' pattern (read `content/products/casesync.mdx` first as the exemplar).

**Verify**: `pnpm build` → exit 0 (MDX parses; standards gate passes).

### Step 3: Routes

Create `app/domains/page.tsx` and `app/domains/[slug]/page.tsx` by mirroring `app/products/page.tsx` and `app/products/[slug]/page.tsx` exactly (imports, `SectionIndex`, md-twin metadata, static params). Check `app/md/` for how markdown twins route sections — if the md-twin route enumerates sections, add `domains`.

**Verify**: `pnpm build && pnpm typecheck` → exit 0; build output lists `/domains` and 4 `/domains/[slug]` static pages.

### Step 4: Nav

`components/topbar.tsx`: add `<Link href="/domains" ...>Domains</Link>` before "For agents", same classes. Sidebar: confirm it derives from `map.json` (it should — check `lib/content-map.ts`); if any section list is hardcoded anywhere (`grep -rn '"products"' components/ lib/ app/ --include='*.ts*' | grep -v test`), add `domains` there too.

**Verify**: `pnpm build` → exit 0; `grep -n 'domains' components/topbar.tsx` → 1 hit.

### Step 5: Profile data honesty check

Cross-check every value on the T&S page against `harness/standards/domains/teachers-school.yaml`; if 002 hasn't landed, source from `harness/CLAUDE.md` + `harness/standards/controls/col-1.md`/`typ-1.md` and note in the PR that the page must be re-verified against the profile when 002 merges.

**Verify**: each brand value on the page has a matching value in its source file (list the pairs in the PR description).

## Test plan

- `pnpm build` is the main gate (MDX parse + token/a11y static scans over `app`/`components`).
- If `lib/domains.ts` is created: unit test modelled on `lib/catalog.test.ts` asserting all four profiles load and T&S is `settled`.
- Manual: `pnpm dev`, visit `/domains`, all four pages; stubs show the proposed badge; T&S links to the three product pages. Screenshot each for the PR.

## Done criteria

- [ ] `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm lint` exit 0
- [ ] `/domains` + 4 domain pages build statically; topbar links Domains
- [ ] T&S page values match the profile YAML (pairs listed in PR); stubs are `status: proposed` with the declaration-template skeleton
- [ ] `/products/*` URLs untouched (`git diff --stat` shows no `content/products` or `app/products` changes)
- [ ] No standard content hardcoded in TSX (all prose in `content/domains/*.mdx`)
- [ ] No files outside the in-scope list modified; `plans/README.md` row updated

## STOP conditions

Stop and report back if:

- The sidebar/md-twin/llms.txt pipeline does NOT derive sections from `map.json` (i.e. adding a section requires touching >2 hardcoded lists) — report the list of places first.
- `SectionIndex` or the doc-page renderer can't render a section without some frontmatter field the domain pages lack — report rather than inventing frontmatter semantics.
- You're tempted to write brand values for students/parents/platform — the stubs stay empty of values.

## Maintenance notes

- When a domain lead submits a real profile (ratchet, plan 007), the flow is: update `standards/domains/<slug>.yaml` → update the MDX page → flip `status` to settled. Consider (later, not now) generating the profile block on the page from the YAML to remove the double-entry — deferred because MDX-from-data needs a design pass.
- Revisit promoting domains into the top nav when a second domain page reaches `settled` — the one-item decision was premised on three stubs.
- Plan 006 links every domain page to the onboarding page; keep the "Adopt the standard" anchor stable.
