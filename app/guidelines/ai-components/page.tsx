import { notFound } from "next/navigation";
import { getDoc } from "@/lib/content";
import { AiDocPage } from "@/components/ai-doc-page";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Components", ...mdAlternate("/guidelines/ai-components") };

export default function Page() {
  const doc = getDoc("guidelines", "ai-components");
  if (!doc) notFound();
  return <AiDocPage doc={doc} />;
}
