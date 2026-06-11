import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

/* HIG-style topic thumbnails: abstract geometric glyphs, ink-on-tint.
   Deliberately diagrammatic, not illustrative — figurative illustration is
   Midjourney-only per the illustration guideline. Colours via tokens (TOK-1). */

export const sectionInk: Record<string, string> = {
  principles: "var(--sec-principles)",
  standards: "var(--sec-standards)",
  guidelines: "var(--sec-guidelines)",
  foundations: "var(--sec-foundations)",
  products: "var(--sec-products)",
  harness: "var(--sec-harness)",
  governance: "var(--sec-governance)",
};

const ink = { stroke: "var(--ink)", fill: "none" };
const dim = { stroke: "var(--muted-foreground)", fill: "none", opacity: 0.45 };

/* One glyph per doc, keyed "section/slug". Canvas 96x60. */
export const topicArt: Record<string, ReactNode> = {
  "principles/brand-principles": (
    <>
      <circle cx="48" cy="30" r="16" {...ink} />
      <path d="M48 19l4.5 11L48 41l-4.5-11z" stroke="var(--ink)" fill="var(--ink)" fillOpacity={0.15} />
      <circle cx="48" cy="30" r="1.6" fill="var(--ink)" stroke="none" />
    </>
  ),
  "principles/product-design-principles": (
    <>
      <rect x="26" y="13" width="44" height="8" rx="3" {...ink} />
      <rect x="26" y="26" width="32" height="8" rx="3" {...dim} />
      <rect x="26" y="39" width="21" height="8" rx="3" {...dim} />
    </>
  ),
  "standards/catalog": (
    <>
      <rect x="28" y="12" width="9" height="9" rx="2.5" {...ink} />
      <path d="M30.5 16.5l2 2 3.5-4" {...ink} />
      <path d="M44 16.5h24" {...dim} />
      <rect x="28" y="26" width="9" height="9" rx="2.5" {...ink} />
      <path d="M30.5 30.5l2 2 3.5-4" {...ink} />
      <path d="M44 30.5h24" {...dim} />
      <rect x="28" y="40" width="9" height="9" rx="2.5" {...dim} />
      <path d="M44 44.5h16" {...dim} />
    </>
  ),
  "guidelines/voice-tone": (
    <>
      <path d="M34 14h28a6 6 0 016 6v10a6 6 0 01-6 6H44l-8 8v-8h-2a6 6 0 01-6-6V20a6 6 0 016-6z" {...ink} />
      <path d="M38 22h20M38 28h12" {...dim} />
    </>
  ),
  "guidelines/naming": (
    <>
      <path d="M30 16h16l20 14-20 14H30a4 4 0 01-4-4V20a4 4 0 014-4z" {...ink} />
      <circle cx="36" cy="30" r="2.5" {...ink} />
    </>
  ),
  "guidelines/interaction": (
    <>
      <path d="M46 24l15 6.5-6.6 2.3 4.8 7-3.3 2.2-4.8-7-4.8 4.6z" stroke="var(--ink)" fill="var(--ink)" fillOpacity={0.15} />
      <path d="M38 24a8 8 0 018-8" {...dim} />
      <path d="M33 24a13 13 0 0113-13" {...dim} />
    </>
  ),
  "guidelines/web-interface": (
    <>
      <rect x="22" y="12" width="52" height="36" rx="4" {...ink} />
      <path d="M22 21h52" {...ink} />
      <path d="M37 21v27" {...dim} />
      <circle cx="27.5" cy="16.5" r="1.4" fill="var(--ink)" stroke="none" />
      <circle cx="32.5" cy="16.5" r="1.4" fill="var(--ink)" stroke="none" />
    </>
  ),
  "guidelines/data-viz": (
    <>
      <path d="M26 46h44" {...dim} />
      <rect x="32" y="32" width="7" height="14" rx="2" {...dim} />
      <rect x="44" y="22" width="7" height="24" rx="2" {...ink} />
      <rect x="56" y="28" width="7" height="18" rx="2" {...dim} />
    </>
  ),
  "guidelines/illustration": (
    <>
      <path d="M26 42c10-26 26 14 44-24" {...ink} />
      <circle cx="26" cy="42" r="2.5" {...dim} />
      <circle cx="70" cy="18" r="2.5" {...dim} />
    </>
  ),
  "guidelines/product-icons": (
    <>
      <rect x="33" y="15" width="30" height="30" rx="11" {...ink} />
      <circle cx="44" cy="26" r="11" {...dim} />
      <path d="M48 15v30M33 30h30" {...dim} />
    </>
  ),
  "foundations/colour": (
    <>
      <circle cx="40" cy="25" r="11" {...ink} />
      <circle cx="56" cy="25" r="11" {...dim} />
      <circle cx="48" cy="38" r="11" {...dim} />
    </>
  ),
  "foundations/typography": (
    <text
      x="48"
      y="41"
      textAnchor="middle"
      fontFamily="var(--font-display)"
      fontSize="32"
      fontWeight="700"
      fill="var(--ink)"
      stroke="none"
    >
      Aa
    </text>
  ),
  "foundations/spacing-radius": (
    <>
      <rect x="32" y="14" width="32" height="32" rx="10" {...ink} />
      <path d="M64 30h6M48 46v6M48 8v6M26 30h6" {...dim} />
    </>
  ),
  "foundations/iconography": (
    <>
      <circle cx="38" cy="21" r="6" {...ink} />
      <rect x="52" y="15" width="12" height="12" rx="3" {...dim} />
      <path d="M38 33l6 11H32z" {...dim} />
      <path d="M58 34v10M53 39h10" {...ink} />
    </>
  ),
  /* Products: the family signature — one rounded square, one script letter. */
  "products/teacher-workspace": (
    <>
      <rect x="33" y="15" width="30" height="30" rx="11" {...ink} />
      <text
        x="48"
        y="36.5"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="15"
        fontWeight="700"
        fill="var(--ink)"
        stroke="none"
      >
        tw
      </text>
    </>
  ),
  "products/casesync": (
    <>
      <rect x="33" y="15" width="30" height="30" rx="11" {...ink} />
      <text
        x="48"
        y="37"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="17"
        fontWeight="700"
        fill="var(--ink)"
        stroke="none"
      >
        s
      </text>
    </>
  ),
  "products/glow": (
    <>
      <rect x="33" y="15" width="30" height="30" rx="11" {...ink} />
      <text
        x="48"
        y="37"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="17"
        fontWeight="700"
        fill="var(--ink)"
        stroke="none"
      >
        g
      </text>
    </>
  ),
  "harness/loop": (
    <>
      <path d="M35 22.5a15 15 0 0127.8 4.9" {...ink} />
      <path d="M63 24v5h-5" {...ink} />
      <path d="M61 37.5a15 15 0 01-27.8-4.9" {...ink} />
      <path d="M33 36v-5h5" {...ink} />
    </>
  ),
  "harness/skills": (
    <>
      <path d="M36 26l12-8 12 8-12 8z" {...ink} />
      <path d="M36 34l12 8 12-8" {...dim} />
    </>
  ),
  "harness/tools": (
    <>
      <rect x="24" y="13" width="48" height="34" rx="4" {...ink} />
      <path d="M32 24l6 6-6 6" {...ink} />
      <path d="M44 36h14" {...dim} />
    </>
  ),
  "harness/on-ramp": (
    <>
      <path d="M26 46h11v-9h11v-9h11v-9h11" {...ink} />
      <path d="M64 14h6v6" {...ink} />
    </>
  ),
  "governance/governance": (
    <>
      <path d="M38 14v32" {...dim} />
      <path d="M38 30c0-8 8-8 18-9" {...ink} />
      <circle cx="38" cy="14" r="3" {...dim} />
      <circle cx="38" cy="46" r="3" {...dim} />
      <circle cx="60" cy="20" r="3" {...ink} />
    </>
  ),
};

export function Thumb({ ink: inkVar, art }: { ink: string; art: ReactNode }) {
  return (
    <div
      className="aspect-[8/5] overflow-hidden rounded-lg border border-border transition-colors duration-150 group-hover:border-(--ink)"
      style={
        {
          "--ink": inkVar,
          background: "color-mix(in oklab, var(--ink) 7%, var(--surface))",
        } as CSSProperties
      }
    >
      <svg
        viewBox="0 0 96 60"
        className="h-full w-full"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {art}
      </svg>
    </div>
  );
}

export type Topic = {
  href: string;
  title: string;
  description?: string;
  artKey: string;
  ink: string;
};

export function TopicCard({ topic }: { topic: Topic }) {
  return (
    <Link
      href={topic.href}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
    >
      <Thumb ink={topic.ink} art={topicArt[topic.artKey]} />
      <p className="mt-2.5 text-[14px] font-semibold leading-snug">{topic.title}</p>
      {topic.description && (
        <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-muted-foreground">
          {topic.description}
        </p>
      )}
    </Link>
  );
}

/* Landing tile: bigger type, ladder tag, page count. */
export function SectionTile({ topic, tag, count }: { topic: Topic; tag?: string; count?: number }) {
  return (
    <Link
      href={topic.href}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
    >
      <Thumb ink={topic.ink} art={topicArt[topic.artKey]} />
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className="font-display text-[17px] font-bold leading-snug">{topic.title}</p>
        {tag && (
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {tag}
          </span>
        )}
      </div>
      {topic.description && (
        <p className="mt-1 text-[13.5px] leading-snug text-muted-foreground">{topic.description}</p>
      )}
      {count !== undefined && (
        <p className="mt-1.5 text-[12.5px] text-muted-foreground">
          {count} {count === 1 ? "page" : "pages"}
        </p>
      )}
    </Link>
  );
}

/* Horizontal variant for single-doc sections — varies the grid (SLP-5). */
export function TopicRow({ topic }: { topic: Topic }) {
  return (
    <Link
      href={topic.href}
      className="group flex items-center gap-5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
    >
      <div className="w-36 shrink-0">
        <Thumb ink={topic.ink} art={topicArt[topic.artKey]} />
      </div>
      <div>
        <p className="text-[14px] font-semibold leading-snug">{topic.title}</p>
        {topic.description && (
          <p className="mt-1 text-[12.5px] leading-snug text-muted-foreground">
            {topic.description}
          </p>
        )}
      </div>
    </Link>
  );
}
