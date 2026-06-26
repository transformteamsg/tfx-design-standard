import { isValidElement, type ReactNode } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { Doc } from "@/lib/content";
import { extractHeadings, slugify } from "@/lib/toc";
import { Toc } from "@/components/toc";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageActions } from "@/components/page-actions";
import { ToolCard, type Tool } from "@/components/tool-card";

/* Sections whose docs live at /{section}/{slug} and get a breadcrumb back to
   the section root. Single-doc sections (governance) and start pages don't. */
const sectionCrumbs: Record<string, { label: string; href: string }> = {
  principles: { label: "Principles", href: "/principles" },
  standards: { label: "Standards", href: "/standards" },
  guidelines: { label: "Guidelines", href: "/guidelines" },
  foundations: { label: "Foundations", href: "/foundations" },
  products: { label: "Products", href: "/products" },
  harness: { label: "Harness", href: "/harness" },
};

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

/* Heading ids must match lib/toc's extractHeadings so the rail can target them. */
function heading(Tag: "h2" | "h3") {
  function Heading({ children }: { children?: ReactNode }) {
    return <Tag id={slugify(textOf(children))}>{children}</Tag>;
  }
  return Heading;
}

export function DocPage({ doc, children }: { doc: Doc; children?: ReactNode }) {
  const crumb = sectionCrumbs[doc.section];
  const headings = extractHeadings(doc.content);
  const tools = (doc.data.tools ?? []) as Tool[];

  return (
    <div className="flex gap-12">
      <div className="min-w-0 max-w-[720px] flex-1">
        <div className="mb-3 flex justify-end">
          <PageActions />
        </div>
        {crumb && <Breadcrumb section={crumb} current={doc.title} />}
        {doc.status === "proposed" && (
          <span className="mb-2 inline-block rounded-full border border-warning-muted bg-warning-subtle px-2 py-0.5 text-[11px] font-medium text-warning">
            ⚑ Proposed — react, don&apos;t obey
          </span>
        )}
        {doc.status === "settled" && (
          <span className="mb-2 inline-block rounded-full border border-success-muted bg-success-subtle px-2 py-0.5 text-[11px] font-medium text-success">
            Settled
          </span>
        )}
        <h1 className="font-display text-[32px] font-semibold tracking-tight">{doc.title}</h1>
        {doc.description && (
          <p className="mt-3 text-[18px] leading-[1.6] text-muted-foreground">
            {doc.description}
          </p>
        )}
        {tools.map((tool) => (
          <ToolCard key={tool.href} tool={tool} />
        ))}
        <article className="prose mt-8">
          <MDXRemote
            source={doc.content}
            components={{ h2: heading("h2"), h3: heading("h3") }}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </article>
        {children}
      </div>
      {headings.length >= 2 && <Toc headings={headings} />}
    </div>
  );
}
