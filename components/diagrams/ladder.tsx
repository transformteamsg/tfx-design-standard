/* The six-layer ladder from "How to read this": each layer answers one
   question and carries a different authority. Standards — the only layer the
   harness enforces — is marked. Inline SVG, tokens only (TOK-1); scales to
   its container so it never scrolls at 360px. */

const font = "var(--font-body)";

export function Ladder() {
  const layers = [
    { label: "Principles", answers: "why", note: "decide, don't check" },
    { label: "Standards", answers: "must", note: "verified by checks", enforced: true },
    { label: "Guidelines", answers: "should", note: "judgement applies" },
    { label: "Foundations", answers: "with what", note: "build from these" },
    { label: "Products", answers: "where", note: "calibrated per product" },
    { label: "Harness", answers: "how, fast", note: "use it, improve it" },
  ];
  const rowH = 36;
  const top = 10;

  return (
    <figure className="my-8">
      <svg
        viewBox="0 0 360 232"
        role="img"
        aria-label="The standard is a ladder of six layers. Principles answer why and are used to decide, not to check. Standards answer must and are the only layer verified by automatic checks. Guidelines answer should, with judgement. Foundations answer with what. Products answer where. The harness answers how, fast. Standards is highlighted as the enforced layer."
        style={{ width: "100%", height: "auto", fontFamily: font }}
      >
        {layers.map((l, i) => {
          const y = top + i * rowH;
          return (
            <g key={l.label}>
              <rect
                x="10"
                y={y}
                width="150"
                height="28"
                rx="6"
                fill={l.enforced ? "var(--primary)" : "var(--surface)"}
                stroke={l.enforced ? "var(--primary)" : "var(--border)"}
              />
              <text
                x="24"
                y={y + 18}
                fontSize="11.5"
                fontWeight="600"
                fill={l.enforced ? "var(--primary-foreground)" : "var(--foreground)"}
              >
                {l.label}
              </text>
              <text
                x="146"
                y={y + 18}
                textAnchor="end"
                fontSize="10.5"
                fontStyle="italic"
                fill={l.enforced ? "var(--primary-foreground)" : "var(--muted-foreground)"}
              >
                {l.answers}
              </text>
              <path d={`M168 ${y + 14} H184`} stroke="var(--border-strong)" strokeWidth="1.5" />
              <text x="192" y={y + 18} fontSize="10.5" fill="var(--muted-foreground)">
                {l.note}
              </text>
              {l.enforced && (
                <text x="192" y={y + 30.5} fontSize="9.5" fontWeight="600" fill="var(--primary)">
                  the only machine-enforced layer
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2.5 text-[13px] leading-[1.6] text-muted-foreground">
        The litmus test: if you can&apos;t check it, it&apos;s a principle or a
        guideline, not a standard.
      </figcaption>
    </figure>
  );
}
