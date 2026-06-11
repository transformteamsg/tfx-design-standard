# tfx-design-standard

The TFX Design Standard website (TransformX, Teacher & School portfolio). Next.js 15 App Router + Tailwind v4 + MDX content + YAML control catalog.

## Rules for agents working in this repo

- This site must pass its own standard. Before changing UI, read `/content/standards/catalog.yaml` — especially the SLP (anti-slop) controls. No gradient text, no nested cards, no side-tab borders, no bounce easing, no purple gradients.
- Content lives in `content/`, not in components. Page chrome lives in `components/`. Don't hardcode standard content into TSX.
- Tokens: only the CSS variables in `app/globals.css`. No raw hex in components (TOK-1). Product colours: `--tw-blue` #0064FF, `--casesync` (Radix indigo-9), `--glow` (Radix orange-9).
- Fonts: Plus Jakarta Sans Variable (display), Inter Variable (body) via Fontsource. No other typefaces (TYP-1).
- Copy: second person, active voice, sentence case, plain language. Error messages say what happened and what to do next.
- Status frontmatter matters: `settled` vs `proposed` renders different badges. Don't mark proposed things settled.
- After content edits run `npm run build` to verify MDX parses.
