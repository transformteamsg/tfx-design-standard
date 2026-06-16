import Link from "next/link";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-tw-blue text-[11px] font-semibold text-white">
            tf
          </span>
          <span className="font-display text-[16px] font-semibold tracking-tight">
            TFX Design Standard
          </span>
          <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            v0.1 draft
          </span>
        </Link>
        <nav aria-label="Primary" className="flex items-center text-[14px] font-medium text-muted-foreground">
          <Link href="/for-agents" className="hover:text-foreground">For agents</Link>
        </nav>
      </div>
    </header>
  );
}
