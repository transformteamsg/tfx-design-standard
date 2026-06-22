import { SectionIndex } from "@/components/section-index";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Standards", ...mdAlternate("/standards") };

export default function Page() {
  return <SectionIndex sectionKey="standards" />;
}
