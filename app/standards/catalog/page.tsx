import { getCatalog } from "@/lib/catalog";
import { CatalogBrowser } from "@/components/catalog-browser";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata = { title: "Control catalog" };

export default function CatalogPage() {
  const controls = getCatalog();
  return (
    <div>
      <div className="max-w-[720px]">
        <Breadcrumb
          section={{ label: "Standards", href: "/standards" }}
          current="Control catalog"
        />
        <span className="mb-2 inline-block rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
          ⚑ Proposed seed — v0.1
        </span>
        <h1 className="font-display text-[36px] font-extrabold tracking-tight">
          Control catalog
        </h1>
        <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">
          Every control in the standard — one verifiable statement each, with its tier, fail
          conditions, and how it&apos;s checked. Cite IDs in review; agents read the same list.
        </p>
        <p className="mt-3 text-[15px] text-muted-foreground">
          Machine-readable source:{" "}
          <a
            className="text-tw-blue underline underline-offset-2"
            href="/standards/catalog.yaml"
          >
            catalog.yaml
          </a>
        </p>
      </div>
      <CatalogBrowser controls={controls} />
    </div>
  );
}
