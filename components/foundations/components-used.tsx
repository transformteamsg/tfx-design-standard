import Link from "next/link";

/* Chip list of the components that make up a pattern, styled to match the
   caption bar at the bottom of DemoFrame so a pattern reads the same whether
   its "Components used" sits above a demo or on its own with no demo.

   `items` is an array of names; each name links to
   /guidelines/ai-components#{slugified name}. */
type Item = { name: string; anchor?: string };

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

export function ComponentsUsed({ items }: { items: (string | Item)[] }) {
  return (
    <figure className="my-5 rounded-lg border border-border bg-surface">
      <figcaption className="flex flex-wrap items-center gap-2 px-4 py-3">
        <span className="text-xs text-muted-foreground">Components used:</span>
        {items.map((raw) => {
          const item = typeof raw === "string" ? { name: raw } : raw;
          const href = `/guidelines/ai-components#${item.anchor ?? slugify(item.name)}`;
          return (
            <Link
              key={item.name}
              href={href}
              className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.name}
            </Link>
          );
        })}
      </figcaption>
    </figure>
  );
}
