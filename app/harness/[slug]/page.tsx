import { notFound } from "next/navigation";
import { getDoc, listDocs } from "@/lib/content";
import { DocPage } from "@/components/doc-page";

export function generateStaticParams() {
  return listDocs("harness").map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc("harness", slug);
  return { title: doc?.title ?? "harness" };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc("harness", slug);
  if (!doc) notFound();
  return <DocPage doc={doc} />;
}
