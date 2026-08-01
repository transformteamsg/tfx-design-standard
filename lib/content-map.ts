import rawMap from "@/content/map.json";

/* content/map.json is the one registration point for docs: the sidebar
   directory, /llms.txt, and the build guard (scripts/check-standards.mjs)
   all derive from it. `root: true` marks a section whose first slug renders
   at the section root itself (e.g. /governance); any further slugs are
   normal /section/slug pages. Root sections are excluded from the directory
   grid; their docs still publish to the machine readers. */
export type ContentGroup = {
  label: string;
  slugs: string[];
};

export type ContentSection = {
  label: string;
  slugs: string[];
  root?: boolean;
  /* Optional sub-grouping for the section index grid (e.g. Guidelines'
     Content / AI clusters). Slugs not covered by any group render
     standalone, same as before. Sections without `groups` render as one
     flat grid, unchanged. */
  groups?: ContentGroup[];
};

export const contentMap = rawMap as Record<string, ContentSection>;
