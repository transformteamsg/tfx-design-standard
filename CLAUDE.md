# tfx-design-standard

## Deprecated

This repo is deprecated and no longer maintained. The harness, the control
catalog, and the website moved to the DX Design Harness —
site [go.gov.sg/dxharness](https://go.gov.sg/dxharness), repo
[transformteamsg/dx-harness](https://github.com/transformteamsg/dx-harness)
(plugin: `dx-harness@dx-harness`, skills: `/dx-harness:dx-*`). Make changes
there, not here. Work in this repo only to fix the deprecation notices
themselves or to answer a question about the retired setup — and say so before
you start editing anything else.

The TFX Design Standard website (TransformX, Teacher & School portfolio). Next.js 15 App Router + Tailwind v4 + MDX content + YAML control catalog. Package manager: pnpm.

This site must pass its own standard. Before changing UI, read [harness/standards/catalog.yaml](harness/standards/catalog.yaml) (the single source of truth — the site reads it directly) — especially the SLP (anti-slop) controls.

## Design constraints

- No gradient text, no nested cards, no side-tab borders, no bounce easing, no purple gradients (SLP controls).
- Tokens: only the CSS variables in `app/globals.css`. No raw hex in components (TOK-1). Product colours: `--tw-blue` #0064FF, `--casesync` (Radix indigo-9), `--glow` (Radix orange-9).
- Fonts: Plus Jakarta Sans Variable (display), Inter Variable (body) via Fontsource. No other typefaces (TYP-1).

## Content & copy

- Content lives in `content/`, not in components. Page chrome lives in `components/`. Don't hardcode standard content into TSX.
- Copy: second person, active voice, sentence case, plain language. Error messages say what happened and what to do next.
- When editing prose in `content/`, apply SLP-9 (AI-writing tells) — canonical lists and calibration in `harness/standards/controls/slp-9.md`, carried by the tfx:copy skill.
- Status frontmatter matters: `settled` vs `proposed` renders different badges. Don't mark proposed things settled.

## Verify

- After content edits run `pnpm build` to verify MDX parses.
