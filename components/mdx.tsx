import { isValidElement, type ReactNode } from "react";
import { slugify } from "@/lib/toc";
import { MotionScale } from "@/components/diagrams/motion-scale";
import { OrbitLoop } from "@/components/diagrams/orbit-loop";
import { ColorRamp } from "@/components/foundations/color-ramp";
import { PrimarySwatches } from "@/components/foundations/primary-swatches";
import { FunctionalColours } from "@/components/foundations/functional-colours";
import { TokenTable } from "@/components/foundations/token-table";
import { FontRoles, TypeScale } from "@/components/foundations/type-scale";
import { SpacingScale } from "@/components/foundations/spacing-scale";
import { RadiusScale } from "@/components/foundations/radius-scale";
import { IconSet } from "@/components/foundations/icon-set";
import { BrandIconSet } from "@/components/foundations/brand-icon-set";
import { CodeBlock } from "@/components/code-block";
import { DoDont } from "@/components/foundations/do-dont";
import { SectionInfo } from "@/components/section-info";

export function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

/* Per-doc map of heading slug → plain-language section description, authored in
   the doc's frontmatter `sections:`. */
export type SectionDescriptions = Record<string, string>;

/* Heading ids must match lib/toc's extractHeadings so the rail can target them.
   An h2 whose slug has a frontmatter description also renders a SectionInfo help
   affordance after its text; h3s never do (major sections only). */
export function heading(Tag: "h2" | "h3", sections?: SectionDescriptions) {
  function Heading({ children }: { children?: ReactNode }) {
    const text = textOf(children);
    const description = Tag === "h2" ? sections?.[slugify(text)] : undefined;
    return (
      <Tag id={slugify(text)}>
        {children}
        {description && <SectionInfo heading={text} description={description} />}
      </Tag>
    );
  }
  return Heading;
}

/* Fenced code blocks render through CodeBlock (framed, copyable) instead of a
   bare <pre>. Falls back to a plain <pre> if the child isn't the expected
   <code> element (e.g. an empty fence). */
function Pre({ children }: { children?: ReactNode }) {
  if (isValidElement(children)) {
    const p = children.props as { className?: string; children?: ReactNode };
    const lang = p.className?.replace(/^language-/, "");
    const code = textOf(p.children).replace(/\n$/, "");
    return <CodeBlock code={code} lang={lang} />;
  }
  return <pre>{children}</pre>;
}

/* Components available inside doc-page MDX bodies. Headings get slug ids so the
   TOC rail can target them; the diagrams are token-only inline SVG. Built per
   doc so h2 headings can pick up their frontmatter section descriptions. */
export function buildMdxComponents(sections?: SectionDescriptions) {
  return {
    h2: heading("h2", sections),
    h3: heading("h3"),
    pre: Pre,
    ...sharedMdxComponents,
  };
}

/* Static (non-heading) components, shared across every doc. */
const sharedMdxComponents = {
  CodeBlock,
  DoDont,
  MotionScale,
  OrbitLoop,
  ColorRamp,
  PrimarySwatches,
  FunctionalColours,
  TokenTable,
  TypeScale,
  FontRoles,
  SpacingScale,
  RadiusScale,
  IconSet,
  BrandIconSet,
};
