/* Best-practices Do/Don't table for the Foundations pages. Pills reuse the
   functional tokens that already clear AA (COL-2/A11Y-1): success for Do,
   danger for Don't. Static content grouped with rows, not cards (SLP-11).
   Item text supports inline [label](href) links so patterns can point at
   alternative sections without JSX authoring inside JS arrays. */
type Item = { kind: "do" | "dont"; text: string };
type Props = { items: Item[]; doLabel?: string; dontLabel?: string };

// Split "some text [link](href) more text" into text/link nodes.
function renderText(text: string) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <a
        key={`l-${i++}`}
        href={m[2]}
        className="underline underline-offset-2 hover:text-foreground"
      >
        {m[1]}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

export function DoDont({ items, doLabel = "Do", dontLabel = "Don't" }: Props) {
  return (
    <figure className="mb-5 mt-4 overflow-hidden rounded-lg border border-border bg-surface">
      <ul className="m-0 list-none divide-y divide-border p-0">
        {items.map((it, i) => (
          <li key={i} className="mb-0 flex items-start gap-3 px-4 py-3">
            <span
              className={`mt-0.5 inline-block shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
                it.kind === "do"
                  ? "border-success-muted bg-success-subtle text-success"
                  : "border-danger-muted bg-danger-subtle text-danger"
              }`}
            >
              {it.kind === "do" ? doLabel : dontLabel}
            </span>
            <span className="text-sm leading-[1.6] text-(--prose-body)">{renderText(it.text)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
