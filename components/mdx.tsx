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

export function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

/* Heading ids must match lib/toc's extractHeadings so the rail can target them. */
export function heading(Tag: "h2" | "h3") {
  function Heading({ children }: { children?: ReactNode }) {
    return <Tag id={slugify(textOf(children))}>{children}</Tag>;
  }
  return Heading;
}

/* Components available inside doc-page MDX bodies. Headings get slug ids so the
   TOC rail can target them; the diagrams are token-only inline SVG. */
export const mdxComponents = {
  h2: heading("h2"),
  h3: heading("h3"),
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
