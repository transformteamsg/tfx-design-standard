import { MDXRemote } from "next-mdx-remote/rsc";
import type { Doc } from "@/lib/content";

export function DocPage({ doc }: { doc: Doc }) {
  return (
    <article className="prose">
      <div className="mb-1 flex items-center gap-2">
        {doc.status === "proposed" && (
          <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
            ⚑ Proposed — react, don&apos;t obey
          </span>
        )}
        {doc.status === "settled" && (
          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            Settled
          </span>
        )}
      </div>
      <h1>{doc.title}</h1>
      {doc.description && (
        <p className="!text-[17px] !text-muted-foreground">{doc.description}</p>
      )}
      <MDXRemote source={doc.content} />
    </article>
  );
}
