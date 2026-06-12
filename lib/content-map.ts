import rawMap from "@/content/map.json";

/* content/map.json is the one registration point for docs: the sidebar
   directory, /llms.txt, and the build guard (scripts/check-standards.mjs)
   all derive from it. `root: true` marks a single-doc section rendered at
   the section root (e.g. /governance) — it has no per-slug pages, so it is
   excluded from the directory pages and the sidebar links the section href
   itself; its doc still publishes to the machine readers. */
export type ContentSection = {
  label: string;
  slugs: string[];
  root?: boolean;
};

export const contentMap = rawMap as Record<string, ContentSection>;
