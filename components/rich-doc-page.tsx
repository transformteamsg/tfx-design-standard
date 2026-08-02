import type { ReactNode } from "react";
import type { Doc } from "@/lib/content";
import { DocPage } from "@/components/doc-page";
import { standardMdxComponentImporters } from "@/components/mdx-standard-importers";

export function RichDocPage({ doc, children }: { doc: Doc; children?: ReactNode }) {
  return (
    <DocPage
      doc={doc}
      componentImporters={standardMdxComponentImporters}
    >
      {children}
    </DocPage>
  );
}
