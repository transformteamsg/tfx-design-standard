import Link from "next/link";

/* Site-wide notice: the standard, the harness, and this site moved to the DX
   Design Harness (go.gov.sg/dxharness). Warning role from the functional scale
   (COL-2), tokens only (TOK-1). Sits above the sticky top bar so it scrolls
   away after one read. */
export function DeprecationBanner() {
  return (
    <div
      role="region"
      aria-label="Deprecation notice"
      className="border-b border-warning-muted bg-warning-subtle"
    >
      <p className="mx-auto max-w-[1320px] px-3 py-2 text-sm text-warning sm:px-6">
        <span className="font-semibold">This site has moved.</span> The standard
        and its harness now live at{" "}
        <a
          href="https://go.gov.sg/dxharness"
          className="font-medium underline underline-offset-2 hover:no-underline"
        >
          go.gov.sg/dxharness
        </a>
        . Nothing here is updated any more —{" "}
        <Link href="/harness/install" className="font-medium underline underline-offset-2 hover:no-underline">
          how to switch
        </Link>
        .
      </p>
    </div>
  );
}
