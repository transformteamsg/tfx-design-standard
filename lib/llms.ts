import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { contentMap } from "@/lib/content-map";
import { getPublicCatalogYaml } from "@/lib/catalog";

/* The /llms.txt body derives from content/map.json — the same registration
   that drives the sidebar directory — so the human and machine readers
   cannot diverge. The standards section is special-cased: its content is
   the public catalog YAML, not an MDX doc. */

function section(label: string, text: string) {
  return `\n\n## ===== ${label} =====\n\n${text}`;
}

export function llmsBody(): string {
  const parts: string[] = [];
  for (const [key, def] of Object.entries(contentMap)) {
    if (key === "standards") {
      parts.push(
        section("STANDARDS — CONTROL CATALOG (YAML)", getPublicCatalogYaml()),
      );
    }
    for (const slug of def.slugs) {
      const file = path.join(process.cwd(), "content", key, `${slug}.mdx`);
      const raw = fs.readFileSync(file, "utf8");
      const title = String(matter(raw).data.title ?? slug);
      const label =
        title.toLowerCase() === def.label.toLowerCase()
          ? def.label.toUpperCase()
          : `${def.label} — ${title}`.toUpperCase();
      parts.push(section(label, raw));
    }
  }
  return parts.join("");
}

/* Control detail files (rationale, pass/fail examples, evaluator guidance),
   sorted by control ID, with the harness-internal `refs` frontmatter block
   stripped — matching what the public catalog YAML exposes. */
export function controlDetails(): string {
  const dir = path.join(process.cwd(), "harness", "standards", "controls");
  const byId = (name: string) => {
    const [, prefix, num] = name.match(/^([a-z0-9]+)-(\d+)/) ?? [];
    return [prefix ?? name, Number(num ?? 0)] as const;
  };
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => {
      const [pa, na] = byId(a);
      const [pb, nb] = byId(b);
      return pa === pb ? na - nb : pa.localeCompare(pb);
    });
  return files
    .map((f) => {
      const { data, content } = matter(
        fs.readFileSync(path.join(dir, f), "utf8"),
      );
      delete data.refs;
      return matter.stringify(content, data);
    })
    .join("\n\n");
}
