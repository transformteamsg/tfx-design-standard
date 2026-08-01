/* The AI journey: the five stages a person moves through in an AI feature,
   drawn as a numbered strip that doubles as in-page navigation. Each stage
   links to its section below. Token-only, and static by design, so there is
   no motion to reduce. The numerals carry the order; the track line behind
   them (desktop) reads it as one journey. */

const STAGES = [
  { n: 1, label: "Start", href: "#start", hint: "Give the first move" },
  { n: 2, label: "Ask", href: "#ask", hint: "Take the request" },
  { n: 3, label: "Watch it work", href: "#watch-it-work", hint: "Show it working" },
  { n: 4, label: "Read the answer", href: "#read-the-answer", hint: "Present and cite" },
  { n: 5, label: "Check and fix", href: "#check-and-fix", hint: "Approve and correct" },
] as const;

export function AiJourney() {
  return (
    <nav aria-label="The AI journey" className="not-prose my-8">
      <ol className="relative grid gap-4 sm:grid-cols-5 sm:gap-2">
        {/* Track behind the badge row, desktop only. Inset to the first and
            last badge centres (each cell is 20% wide, badge centred). */}
        <span
          aria-hidden="true"
          className="absolute top-[18px] left-[10%] right-[10%] hidden h-px bg-border sm:block"
        />
        {STAGES.map((s) => (
          <li key={s.href} className="relative">
            <a
              href={s.href}
              className="group flex items-center gap-3 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue) sm:flex-col sm:gap-2 sm:text-center"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border-strong bg-surface font-display text-sm font-semibold text-tw-blue transition-colors group-hover:border-tw-blue">
                {s.n}
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{s.label}</span>
                <span className="block text-xs text-muted-foreground">{s.hint}</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
