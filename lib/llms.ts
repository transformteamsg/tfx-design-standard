import { contentMap } from "@/lib/content-map";
import { getDoc } from "@/lib/content";

/* /llms.txt is a curated llmstxt.org-style index: one H1, a mission blockquote,
   then each section linking the per-page `.md` twins. Built from contentMap +
   getDoc titles/descriptions so it stays in sync with the site and the `.md`
   twins — the human and machine readers cannot diverge. The full content lives
   in those per-page `.md` twins (append `.md` to any path), not a separate dump. */
export function llmsIndex(): string {
  const lines: string[] = [];
  lines.push("# TFX Design Standard");
  lines.push("");
  lines.push(
    "> Make the quality bar independent of staffing. Brand essence: Kind Utility —",
  );
  lines.push(
    "> useful first, kind at the surface. The one test: does this help teachers work",
  );
  lines.push(
    "> faster with less stress? Every page below is also available as Markdown by",
  );
  lines.push("> appending `.md` to its path.");
  lines.push("");

  // About: the essential lines from the old /llms.txt header (no context lost).
  lines.push("## About");
  lines.push("");
  lines.push(
    "- TransformX, Teacher & School portfolio, GovTech Singapore (v0.1 draft).",
  );
  lines.push(
    "- Litmus for standards: if you can't check it, it's a principle or guideline, not a standard.",
  );
  lines.push(
    "- Tiers: L0 non-negotiable (no waiver) · L1 mandatory (documented waiver) · L2 recommended (inline rationale).",
  );
  lines.push('- Waiver syntax: `tfx-waive <ID> reason="<specific reason>"`.');
  lines.push(
    "- Stack: Base UI components + Radix Colors + shadcn/ui default tokens. Fonts: Plus Jakarta Sans (display), Inter (body).",
  );
  lines.push("");

  // Start here: the singleton entry points.
  lines.push("## Start here");
  lines.push("");
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

    // Root sections (e.g. governance) are a single doc at the section path.
    if (def.root) {
      for (const slug of def.slugs) {
        const doc = getDoc(key, slug);
        if (doc) lines.push(item(doc.title, `/${key}.md`, doc.description));
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
