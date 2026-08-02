import { notFound } from "next/navigation";
import { getDoc, listDocs } from "@/lib/content";
import { DocPage } from "@/components/doc-page";
import { codeMdxComponentImporters } from "@/components/mdx-code-importers";
import { mdAlternate } from "@/lib/markdown-twin";

const aiDemoSlugs = new Set(["ai", "ai-patterns", "ai-components"]);

export function generateStaticParams() {
  return listDocs("guidelines")
    .filter((d) => !aiDemoSlugs.has(d.slug))
    .map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc("guidelines", slug);
  return { title: doc?.title ?? "guidelines", ...mdAlternate(`/guidelines/${slug}`) };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc("guidelines", slug);
  if (!doc) notFound();
  if (aiDemoSlugs.has(slug)) notFound();
  return <DocPage doc={doc} componentImporters={codeMdxComponentImporters} />;
}
