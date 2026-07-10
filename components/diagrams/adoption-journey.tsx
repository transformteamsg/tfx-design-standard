/* The adoption journey — five steps, using the setup wizard's own question names.
   Inline SVG, tokens only (TOK-1); scales to its container so it never scrolls
   at 360px. */

const font = "var(--font-body)";

export function AdoptionJourney() {
  const steps = [
    { cy: 20, label: "Read this page", sub: "understand what you are adopting" },
    { cy: 70, label: "Decide your brand basics", sub: "primary colour · typefaces · domain" },
    { cy: 120, label: "Install the plugin", sub: "two lines in Claude Code, once" },
    { cy: 170, label: "Run the wizard", sub: "" },
    { cy: 258, label: "Design your first screen", sub: "through the design loop" },
  ];
  const questions = [
    "product name → domain → audiences →",
    "primary colour → typefaces → stack →",
    "illustration → voice",
    "skip any non-essential question for the default",
  ];

  return (
    <figure className="my-8">
      <svg
        viewBox="0 0 360 292"
        role="img"
        aria-label="Adopting the standard in five steps: read this page; decide your brand basics (primary colour, typefaces, domain); install the plugin; run the setup wizard, which asks for product name, domain, audiences, primary colour, typefaces, stack, illustration, and voice, each skippable for the default; then design your first screen through the loop."
        style={{ width: "100%", height: "auto", fontFamily: font }}
      >
        {/* spine */}
        <path d="M26 20 V258" stroke="var(--border-strong)" strokeWidth="1.5" />

        {steps.map((s, i) => (
          <g key={s.label}>
            <circle cx="26" cy={s.cy} r="12" fill="var(--tw-blue)" />
            <text x="26" y={s.cy + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--surface)">
              {i + 1}
            </text>
            <text x="48" y={s.cy - 1} fontSize="13" fontWeight="600" fill="var(--foreground)">
              {s.label}
            </text>
            {s.sub && (
              <text x="48" y={s.cy + 13} fontSize="10.5" fill="var(--muted-foreground)">
                {s.sub}
              </text>
            )}
          </g>
        ))}

        {/* the wizard's questions, indented under step 4 */}
        {questions.map((q, i) => (
          <text key={q} x="48" y={192 + i * 15} fontSize="10.5" fill="var(--muted-foreground)">
            {q}
          </text>
        ))}
      </svg>
      <figcaption className="mt-2.5 text-[13px] leading-[1.6] text-muted-foreground">
        The wizard asks these in order and writes your product&apos;s{" "}
        <code>DESIGN.md</code> for you. Answer only what you know; skip the rest.
      </figcaption>
    </figure>
  );
}
