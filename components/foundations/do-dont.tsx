/* Best-practices Do/Don't table for the Foundations pages. Pills reuse the
   functional tokens that already clear AA (COL-2/A11Y-1): success for Do,
   danger for Don't. Static content grouped with rows, not cards (SLP-11). */
type Item = { kind: "do" | "dont"; text: string };
export function DoDont({ items }: { items: Item[] }) {
  return (
    <figure className="my-8 overflow-hidden rounded-lg border border-border">
      <ul className="divide-y divide-border">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-3 bg-surface px-4 py-3">
            <span
              className={`mt-0.5 inline-block shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
                it.kind === "do"
                  ? "border-success-muted bg-success-subtle text-success"
                  : "border-danger-muted bg-danger-subtle text-danger"
              }`}
            >
              {it.kind === "do" ? "Do" : "Don't"}
            </span>
            <span className="text-sm leading-[1.6] text-(--prose-body)">{it.text}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
