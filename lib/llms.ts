import { contentMap } from "@/lib/content-map";
import { getDoc } from "@/lib/content";
import { getCatalogMeta } from "@/lib/catalog";
import { allTwins } from "@/lib/markdown-twin";

/* /llms.txt is a curated llmstxt.org-style index: one H1, a mission blockquote,
   then each section linking the per-page `.md` twins. Built from contentMap +
   getDoc titles/descriptions so it stays in sync with the site and the `.md`
   twins — the human and machine readers cannot diverge. /llms-full.txt is the
   optional single-response corpus, generated only from those same twins. */
export function llmsIndex(): string {
  const { domains, updated, version, waiver_syntax } = getCatalogMeta();
  const lines: string[] = [];
  lines.push("# DXD Design Standard");
  lines.push("");
  lines.push(
    "> One foundation, four domain expressions. Make the quality bar independent of staffing.",
  );
  lines.push(
    "> Brand essence: Kind Utility — useful first, kind at the surface. Every page below",
  );
  lines.push("> is also available as Markdown by appending `.md` to its path.");
  lines.push("");

  lines.push("## About");
  lines.push("");
  lines.push(`- DXD Design Standard (v${version}, updated ${updated}).`);
  lines.push(
    "- One foundation, four domain expressions: Teachers & School, Students, Parents, and Platform.",
  );
  lines.push(
    "- Litmus for standards: if you can't check it, it's a principle or guideline, not a standard.",
  );
  lines.push(
    "- Tiers: L0 non-negotiable (no waiver) · L1 mandatory (documented waiver) · L2 recommended (inline rationale).",
  );
  lines.push(`- Waiver syntax: \`${waiver_syntax}\`.`);
  lines.push(
    "- Stack, type, and colour are resolved profile parameters for each domain expression.",
  );
  lines.push("");

  lines.push("## Domain expressions");
  lines.push("");
  for (const [slug, label] of Object.entries(domains).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    lines.push(`- [${label}](/domains/${slug}.md)`);
  }
  lines.push("");

  lines.push("## Machine readers");
  lines.push("");
  lines.push(
    "- [Full Markdown corpus](/llms-full.txt): optional single-response corpus generated from every Markdown twin.",
  );
  lines.push("");

  // Start here: the singleton entry points.
  lines.push("## Start here");
  lines.push("");
  lines.push("- [DXD Design Standard home](/index.md)");
  lines.push("- [Overview](/overview.md)");
  lines.push("- [How to read this standard](/how-to-read.md)");
  lines.push("- [For agents](/for-agents.md)");
  lines.push("");

  const item = (label: string, href: string, desc?: string) =>
    desc ? `- [${label}](${href}): ${desc}` : `- [${label}](${href})`;

  for (const [key, def] of Object.entries(contentMap)) {
    if (key === "standards") {
      lines.push("## Standards");
      lines.push("");
      const std = getDoc("sections", "standards");
      if (std) lines.push(item("Standards overview", "/standards.md", std.description));
      lines.push(item("Control catalog", "/standards/catalog.md", "readable controls + embedded YAML"));
      lines.push(item("Control catalog (YAML)", "/standards/catalog.yaml", "machine source"));
      lines.push("");
      continue;
    }

    lines.push(`## ${def.label}`);
    lines.push("");

    // Root sections (e.g. governance): the first slug is the doc at the
    // section path itself; any further slugs live at /section/slug.
    if (def.root) {
      for (const [i, slug] of def.slugs.entries()) {
        const doc = getDoc(key, slug);
        const mdPath = i === 0 ? `/${key}.md` : `/${key}/${slug}.md`;
        if (doc) lines.push(item(doc.title, mdPath, doc.description));
      }
      lines.push("");
      continue;
    }

    // Section index, then each slug's .md twin.
    const idx = getDoc("sections", key);
    if (idx) lines.push(item(`${def.label} overview`, `/${key}.md`, idx.description));
    for (const slug of def.slugs) {
      const doc = getDoc(key, slug);
      if (doc) lines.push(item(doc.title, `/${key}/${slug}.md`, doc.description));
    }
    lines.push("");
  }

  return lines.join("\n");
}

/* A deterministic whole-corpus reader. allTwins() owns the registry and each
   twin owns its rendering, so this adds no parser, content walk, or private
   catalog projection. */
export function llmsFull(): string {
  const lines = [
    "# DXD Design Standard — full Markdown corpus",
    "",
    "> Complete DXD corpus generated from the site's Markdown twins. Each source is delimited by its canonical Markdown path.",
    "",
  ];

  const twins = [...allTwins()].sort((a, b) => {
    if (a.mdPath < b.mdPath) return -1;
    if (a.mdPath > b.mdPath) return 1;
    return 0;
  });
  for (const twin of twins) {
    lines.push(`<!-- Source: ${twin.mdPath} -->`, "", twin.render().trim(), "");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}
