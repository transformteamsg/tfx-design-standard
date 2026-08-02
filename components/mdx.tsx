import { isValidElement, type ReactNode } from "react";
import { slugify } from "@/lib/toc";

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

/* Common components available inside every doc-page MDX body. Keep this map
   free of client components: DocPage adds richer MDX components only when the
   source actually names them. */
export const baseMdxComponents = {
  h2: heading("h2"),
  h3: heading("h3"),
};
