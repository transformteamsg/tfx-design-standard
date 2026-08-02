import { ExternalLink } from "lucide-react";

/* Compact external "source" link for the Components page.
   One per component entry, pointing at the AI Elements or shadcn docs.
   Icon + short label, not a full-width "View on AI Elements ↗" sentence. */
export function SourceLink({
  href,
  label = "AI Elements",
}: {
  href: string;
  label?: string;
}) {
  return (
    <a
      href={href}
      rel="noreferrer"
      target="_blank"
      className="not-prose my-2 inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <ExternalLink size={12} aria-hidden="true" />
      {label}
    </a>
  );
}
