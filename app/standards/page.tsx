import { getCatalog } from "@/lib/catalog";
import { CatalogBrowser } from "@/components/catalog-browser";

export const metadata = { title: "Standards — control catalog" };

export default function StandardsPage() {
  const controls = getCatalog();
  return (
    <div>
      <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
        ⚑ Proposed seed — v0.1
      </span>
      <h1 className="mt-2 font-display text-[32px] font-bold">Control catalog</h1>
      <p className="mt-2 max-w-[64ch] text-[16px] text-muted-foreground">
        Every standard is a <strong className="text-foreground">control</strong>: one verifiable
        statement with a tier and a check type. If you can&apos;t check it, it&apos;s a principle
        or a guideline — not a standard. <strong className="text-foreground">L0 + L1 are required;
        L2 is recommended.</strong> Machine-readable source:{" "}
        <a className="text-tw-blue underline underline-offset-2" href="/standards/catalog.yaml">
          catalog.yaml
        </a>
      </p>
      <CatalogBrowser controls={controls} />
    </div>
  );
}
