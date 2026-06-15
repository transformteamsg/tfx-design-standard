# TFX Design Standard

The design standard website for **TransformX** (Teacher & School portfolio, GovTech Singapore) — for human builders **and** AI agents.

- Live site: (connect to Vercel — see below)
- Full standard for agents: `/llms.txt` (with control details: `/llms-full.txt`)
- Machine-readable control catalog: `/standards/catalog.yaml`

## Install the design harness (Claude Code plugin)

The harness — the `design-ui` loop, the control catalog, and the voice & tone and
evaluator skills — installs as a Claude Code plugin. It ships its own catalog, so the
skills work in any project, not only this one. (Requires the repo to be public.)

```bash
# add this repo as a plugin marketplace, then install the harness
/plugin marketplace add transformteamsg/tfx-design-standard
/plugin install tfx-design-harness@tfx

# pull the latest controls and skills later
/plugin update tfx-design-harness@tfx
```

Updates ship as versioned releases: `/plugin update` only pulls a new version when
`version` in `harness/.claude-plugin/plugin.json` is bumped — done as part of the
catalog ratchet (`harness/CONTRIBUTING.md`), so an unrelated website commit never looks
like a harness update.

## Architecture

| Thing | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4, shadcn-style tokens (CSS variables in `app/globals.css`) |
| Fonts | Plus Jakarta Sans (display) + Inter (body), self-hosted via Fontsource |
| Content | MDX in `content/<section>/*.mdx` with frontmatter (`title`, `description`, `status: settled|proposed`) |
| Controls | `harness/standards/catalog.yaml` — single source of truth, rendered at `/standards/catalog`, served (re-serialized, public fields only) at `/standards/catalog.yaml` |
| Icons | Lucide |

## Editing content

Edit `content/**/*.mdx` — no code changes needed; `/llms.txt` regenerates from the same files on the next build. New page: add an `.mdx` file, register it in `content/map.json` (drives the directory pages and `/llms.txt`), and add a nav entry in `components/sidebar.tsx` — the build guard (`pnpm check:standards`) fails if you miss a step. New control: add to `harness/standards/catalog.yaml` via the ratchet (see `harness/CONTRIBUTING.md`); the site reads that file directly.

## Later

- Catalog browser UI: surface `verify`, `waiver`, `phase`, and `applies_to` (now available from the harness schema) — a design task that must run through the design loop itself.

## Develop

```bash
pnpm install
pnpm dev
```

## Deploy

1. Push to GitHub (private repo `transformteamsg/tfx-design-standard`).
2. vercel.com → Add New Project → import the repo → defaults work (Next.js preset).
3. Site is public; repo stays private.

## Governance

This site renders the TFX Design Standard v0.1 working draft. ⚑ Proposed content is an opinionated position for the team to react to — change it by PR. The catalog only grows from observed failures (the ratchet), never speculation.
