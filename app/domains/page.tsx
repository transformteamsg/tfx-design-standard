import { SectionIndex } from "@/components/section-index";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Domains", ...mdAlternate("/domains") };

export default function Page() {
  return <SectionIndex sectionKey="domains" />;
}
