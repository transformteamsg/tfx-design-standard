import { notFound } from "next/navigation";
import { getDoc } from "@/lib/content";
import { AiDocPage } from "@/components/ai-doc-page";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Patterns", ...mdAlternate("/guidelines/ai-patterns") };

export default function Page() {
  const doc = getDoc("guidelines", "ai-patterns");
  if (!doc) notFound();
  return <AiDocPage doc={doc} />;
}
