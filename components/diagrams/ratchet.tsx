/* The ratchet: how the catalog grows — only from observed failures, through a
   design-lead gate, into a control that is checked on every future run and
   never weakened. Inline SVG, tokens only (TOK-1); scales to its container so
   it never scrolls at 360px. */

const font = "var(--font-body)";

export function Ratchet() {
  const steps = [
    { label: "A defect escapes to a shipped surface", note: "observed, not speculated" },
    { label: "It becomes a control proposal", note: "with evidence attached" },
    { label: "A design lead approves the ratchet", note: "or rejects it, in writing", gate: true },
    { label: "The control enters the catalog", note: "one verifiable statement" },
    { label: "Every future run checks it", note: "the same defect can't escape twice" },
  ];
  const rowH = 52;
  const boxH = 40;
  const top = 10;

  return (
    <figure className="my-8">
      <svg
        viewBox="0 0 360 270"
        role="img"
        aria-label="The ratchet in five steps: a defect escapes to a shipped surface (observed, not speculated); it becomes a control proposal with evidence attached; a design lead approves the ratchet or rejects it in writing — the human gate; the control enters the catalog as one verifiable statement; every future run checks it, so the same defect cannot escape twice."
        style={{ width: "100%", height: "auto", fontFamily: font }}
      >
        {steps.map((s, i) => {
          const y = top + i * rowH;
          return (
            <g key={s.label}>
              {i > 0 && (
                <path
                  d={`M170 ${y - 12} V${y - 2}`}
                  stroke="var(--border-strong)"
                  strokeWidth="1.5"
                  markerEnd="url(#ratchet-arrow)"
                />
              )}
              <rect
                x="20"
                y={y}
                width="300"
                height={boxH}
                rx="8"
                fill={s.gate ? "var(--primary)" : "var(--surface)"}
                stroke={s.gate ? "var(--primary)" : "var(--border)"}
              />
              <text
                x="170"
                y={y + 17}
                textAnchor="middle"
                fontSize="11.5"
                fontWeight={s.gate ? "600" : "400"}
                fill={s.gate ? "var(--primary-foreground)" : "var(--foreground)"}
              >
                {s.label}
              </text>
              <text
                x="170"
                y={y + 31}
                textAnchor="middle"
                fontSize="9.5"
                fill={s.gate ? "var(--primary-foreground)" : "var(--muted-foreground)"}
              >
                {s.note}
              </text>
              {s.gate && (
                <>
                  <text x="326" y={y + 18} fontSize="9.5" fontWeight="600" fill="var(--primary)">
                    human
                  </text>
                  <text x="326" y={y + 29} fontSize="9.5" fontWeight="600" fill="var(--primary)">
                    gate
                  </text>
                </>
              )}
            </g>
          );
        })}
        <defs>
          <marker id="ratchet-arrow" markerWidth="8" markerHeight="8" refX="4" refY="6" orient="auto">
            <path d="M1 1 L4 6 L7 1 Z" fill="var(--border-strong)" />
          </marker>
        </defs>
      </svg>
      <figcaption className="mt-2.5 text-[13px] leading-[1.6] text-muted-foreground">
        The catalog only tightens. A control is never weakened or removed by a
        domain; recurring waivers mean fix the standard or fix the system.
      </figcaption>
    </figure>
  );
}
