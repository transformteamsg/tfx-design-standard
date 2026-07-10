/* The six-phase loop, with the plan step marked as the human gate. Inline SVG,
   tokens only (TOK-1); scales to its container so it never scrolls at 360px. */

const font = "var(--font-body)";

export function DesignLoop() {
  const phases = [
    { n: "1", label: "Intent — what you mean" },
    { n: "2", label: "Diverge — 2–3 options" },
    { n: "3", label: "Plan — you approve", gate: true },
    { n: "4", label: "Implement — build the plan" },
    { n: "5", label: "Verify — checks + evaluator" },
    { n: "6", label: "Ratchet — capture what we learn" },
  ];
  const rowH = 38;
  const top = 12;

  return (
    <figure className="my-8">
      <svg
        viewBox="0 0 360 240"
        role="img"
        aria-label="The design loop runs in six phases: intent (write what you mean as a contract), diverge (two to three options), plan (a human gate — you approve before anything is built), implement (build the approved plan), verify (deterministic checks then a separate evaluator), and ratchet (capture what we learn). The plan phase is the human gate."
        style={{ width: "100%", height: "auto", fontFamily: font }}
      >
        {phases.map((p, i) => {
          const y = top + i * rowH;
          const cy = y + 15;
          return (
            <g key={p.n}>
              {i > 0 && (
                <path
                  d={`M180 ${y - 8} V${y}`}
                  stroke="var(--border-strong)"
                  strokeWidth="1.5"
                  markerEnd="url(#loop-arrow)"
                />
              )}
              <circle cx="24" cy={cy} r="11" fill="var(--foreground)" />
              <text x="24" y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--surface)">
                {p.n}
              </text>
              <rect
                x="48"
                y={y}
                width="264"
                height="30"
                rx="15"
                fill={p.gate ? "var(--tw-blue)" : "var(--surface)"}
                stroke={p.gate ? "var(--tw-blue)" : "var(--border)"}
              />
              <text
                x="180"
                y={y + 19}
                textAnchor="middle"
                fontSize="11.5"
                fontWeight={p.gate ? "600" : "400"}
                fill={p.gate ? "var(--surface)" : "var(--foreground)"}
              >
                {p.label}
              </text>
              {p.gate && (
                <>
                  <text x="320" y={cy - 2} fontSize="9.5" fontWeight="600" fill="var(--tw-blue)">
                    human
                  </text>
                  <text x="320" y={cy + 9} fontSize="9.5" fontWeight="600" fill="var(--tw-blue)">
                    gate
                  </text>
                </>
              )}
            </g>
          );
        })}
        <defs>
          <marker id="loop-arrow" markerWidth="8" markerHeight="8" refX="4" refY="6" orient="auto">
            <path d="M1 1 L4 6 L7 1 Z" fill="var(--border-strong)" />
          </marker>
        </defs>
      </svg>
      <figcaption className="mt-2.5 text-[13px] leading-[1.6] text-muted-foreground">
        You approve the plan before anything is built. Verify runs the checks, then
        a separate agent grades the result against what you asked for.
      </figcaption>
    </figure>
  );
}
