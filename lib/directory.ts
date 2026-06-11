import { getDoc } from "@/lib/content";
import { sectionInk, type Topic } from "@/components/thumbnails";

/* Directory structure is chrome (like the sidebar); titles and descriptions
   come from content frontmatter via getDoc. `pages` covers the few section
   pages that aren't MDX docs (e.g. the control catalog). */
type SectionDef = {
  label: string;
  slugs?: string[];
  pages?: Omit<Topic, "ink">[];
};

export const sections: Record<string, SectionDef> = {
  principles: {
    label: "Principles",
    slugs: ["brand-principles", "product-design-principles"],
  },
  standards: {
    label: "Standards",
    pages: [
      {
        href: "/standards/catalog",
        title: "Control catalog",
        description:
          "Every control with its tier, fail conditions and check type. Filter, copy IDs, cite them in review.",
        artKey: "standards/catalog",
      },
    ],
  },
  guidelines: {
    label: "Guidelines",
    slugs: ["voice-tone", "naming", "interaction", "web-interface", "data-viz", "illustration", "product-icons"],
  },
  foundations: {
    label: "Foundations",
    slugs: ["colour", "typography", "spacing-radius", "iconography"],
  },
  products: {
    label: "Products",
    slugs: ["teacher-workspace", "casesync", "glow"],
  },
  harness: {
    label: "Harness",
    slugs: ["loop", "skills", "tools", "on-ramp"],
  },
};

export function sectionTopics(key: string): Topic[] {
  const section = sections[key];
  if (!section) return [];
  const ink = sectionInk[key] ?? "var(--foreground)";
  const fromPages = (section.pages ?? []).map((page) => ({ ...page, ink }));
  const fromSlugs = (section.slugs ?? []).flatMap((slug) => {
    const doc = getDoc(key, slug);
    if (!doc) return [];
    return [
      {
        href: `/${key}/${slug}`,
        title: doc.title,
        description: doc.description,
        artKey: `${key}/${slug}`,
        ink,
      },
    ];
  });
  return [...fromPages, ...fromSlugs];
}
