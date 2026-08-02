import { isValidElement, type ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import type { MdxComponentImporters } from "@/components/doc-page";
import { textOf } from "@/components/mdx";

async function codeComponents(): Promise<MDXComponents> {
  const { CodeBlock } = await import("@/components/code-block");
  function Pre({ children }: { children?: ReactNode }) {
    if (isValidElement(children)) {
      const p = children.props as { className?: string; children?: ReactNode };
      const lang = p.className?.replace(/^language-/, "");
      const code = textOf(p.children).replace(/\n$/, "");
      return <CodeBlock code={code} lang={lang} />;
    }
    return <pre>{children}</pre>;
  }
  return { pre: Pre, CodeBlock };
}

export const codeMdxComponentImporters: MdxComponentImporters = {
  CodeBlock: codeComponents,
};
