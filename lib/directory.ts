import { getDoc } from "@/lib/content";
import { contentMap } from "@/lib/content-map";
import { sectionInk, type Topic } from "@/components/thumbnails";

/* Directory structure is chrome (like the sidebar); doc registration comes
   from content/map.json via lib/content-map, titles and descriptions from
   content frontmatter via getDoc. `pages` covers the few section pages that
   aren't MDX docs (e.g. the control catalog). */
type SectionDef = {
  label: string;
  slugs?: string[];
  pages?: Omit<Topic, "ink">[];
  groups?: { label: string; slugs: string[] }[];
};

const chromePages: Record<string, Omit<Topic, "ink">[]> = {
  standards: [
    {
      href: "/standards/catalog",
      title: "Control catalog",
      description:
        "Every control with its tier, fail conditions and check type. Filter, copy IDs, cite them in review.",
      artKey: "standards/catalog",
    },
  ],
};

export const sections: Record<string, SectionDef> = Object.fromEntries(
  Object.entries(contentMap)
    .filter(([, def]) => !def.root)
    .map(([key, def]) => [
      key,
      { label: def.label, slugs: def.slugs, pages: chromePages[key], groups: def.groups },
    ]),
);

function topicFromSlug(key: string, slug: string, ink: string): Topic | null {
  const doc = getDoc(key, slug);
  if (!doc) return null;
  return {
    href: `/${key}/${slug}`,
    title: doc.title,
    description: doc.description,
    artKey: `${key}/${slug}`,
    ink,
  };
}

export function sectionTopics(key: string): Topic[] {
  const section = sections[key];
  if (!section) return [];
  const ink = sectionInk[key] ?? "var(--foreground)";
  const fromPages = (section.pages ?? []).map((page) => ({ ...page, ink }));
  const fromSlugs = (section.slugs ?? []).flatMap((slug) => {
    const topic = topicFromSlug(key, slug, ink);
    return topic ? [topic] : [];
  });
  return [...fromPages, ...fromSlugs];
}

export type TopicGroup = { label: string | null; topics: Topic[] };

/* Grouped view of a section's topics, for sections that declare `groups`
   in content/map.json (currently just Guidelines' Content / AI clusters).
   Returns null for sections without groups, so callers fall back to the
   flat grid from sectionTopics unchanged. Slugs and chrome pages not
   covered by a named group land in one trailing unlabelled group. */
export function sectionTopicGroups(key: string): TopicGroup[] | null {
  const section = sections[key];
  if (!section?.groups?.length) return null;
  const ink = sectionInk[key] ?? "var(--foreground)";

  const named = section.groups.map((group) => ({
    label: group.label,
    topics: group.slugs.flatMap((slug) => {
      const topic = topicFromSlug(key, slug, ink);
      return topic ? [topic] : [];
    }),
  }));

  const groupedSlugs = new Set(section.groups.flatMap((group) => group.slugs));
  const standaloneSlugs = (section.slugs ?? []).filter((slug) => !groupedSlugs.has(slug));
  const standaloneTopics = [
    ...(section.pages ?? []).map((page) => ({ ...page, ink })),
    ...standaloneSlugs.flatMap((slug) => {
      const topic = topicFromSlug(key, slug, ink);
      return topic ? [topic] : [];
    }),
  ];

  return standaloneTopics.length
    ? [...named, { label: null, topics: standaloneTopics }]
    : named;
}
