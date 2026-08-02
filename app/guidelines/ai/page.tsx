import { notFound } from "next/navigation";
import { getDoc } from "@/lib/content";
import { AiDocPage } from "@/components/ai-doc-page";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "AI", ...mdAlternate("/guidelines/ai") };

export default function Page() {
  const doc = getDoc("guidelines", "ai");
  if (!doc) notFound();
  return <AiDocPage doc={doc} />;
}
