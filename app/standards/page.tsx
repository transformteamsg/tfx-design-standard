import { SectionIndex } from "@/components/section-index";
import { SlopCompare } from "@/components/compare";
import { mdAlternate } from "@/lib/markdown-twin";

export const metadata = { title: "Standards", ...mdAlternate("/standards") };

export default function Page() {
  return (
    <div>
      <SectionIndex sectionKey="standards" />
      <section className="mt-14 max-w-[760px]">
        <h2 className="font-display text-[24px] font-semibold tracking-tight">
          See what the catalog catches
        </h2>
        <p className="mt-2 max-w-[62ch] text-[16px] leading-[1.6] text-muted-foreground">
          Sixty-two controls read as one demo. Drag the handle.
        </p>
        <SlopCompare />
      </section>
    </div>
  );
}
