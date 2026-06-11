import { notFound } from "next/navigation";
import { getDoc } from "@/lib/content";
import { DocPage } from "@/components/doc-page";

export const metadata = { title: "How to read this" };

export default function Page() {
  const doc = getDoc("sections", "how-to-read");
  if (!doc) notFound();
  return <DocPage doc={doc} />;
}
