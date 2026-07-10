/* Foundation → domains → your product. One shared foundation, specialised by
   four domains; your product adopts the standard through its domain. Inline SVG,
   tokens only (TOK-1), scales to its container so it never scrolls at 360px. */

const font = "var(--font-body)";

export function FoundationProfile() {
  const domains = [
    { cx: 57, lines: ["Teachers", "& School"] },
    { cx: 139, lines: ["Students"] },
    { cx: 221, lines: ["Parents"] },
    { cx: 303, lines: ["Platform"] },
  ];

  return (
    <figure className="my-8">
      <svg
        viewBox="0 0 360 212"
        role="img"
        aria-label="The foundation — a catalog of controls and principles — is specialised by four domains: Teachers & School, Students, Parents, and Platform. Your product, shown beneath the domains, adopts the standard through whichever domain is its own."
        style={{ width: "100%", height: "auto", fontFamily: font }}
      >
        {/* foundation */}
        <rect x="24" y="14" width="312" height="46" rx="8" fill="var(--muted)" stroke="var(--border)" />
        <text x="180" y="34" textAnchor="middle" fontSize="15" fontWeight="600" fill="var(--foreground)" style={{ fontFamily: "var(--font-display)" }}>
          The foundation
        </text>
        <text x="180" y="50" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
          a catalog of controls + principles
        </text>

        {/* bus connecting foundation to the four domains */}
        <path
          d="M180 60 V74 M57 74 H303 M57 74 V92 M139 74 V92 M221 74 V92 M303 74 V92"
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth="1.5"
        />

        {/* domains */}
        {domains.map((d) => (
          <g key={d.cx}>
            <rect x={d.cx - 33} y="92" width="66" height="40" rx="6" fill="var(--surface)" stroke="var(--border)" />
            {d.lines.map((line, i) => (
              <text
                key={line}
                x={d.cx}
                y={d.lines.length === 1 ? 116 : 110 + i * 13}
                textAnchor="middle"
                fontSize="10.5"
                fill="var(--foreground)"
              >
                {line}
              </text>
            ))}
          </g>
        ))}

        {/* your product, centred — it adopts through whichever domain is its own */}
        <path d="M180 160 V140" fill="none" stroke="var(--primary)" strokeWidth="2" markerEnd="url(#fp-arrow)" />
        <rect x="141" y="160" width="78" height="34" rx="6" fill="var(--primary)" />
        <text x="180" y="181" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--primary-foreground)">
          your product
        </text>
        <text x="196" y="153" fontSize="9.5" fill="var(--muted-foreground)">
          through its domain
        </text>

        <defs>
          <marker id="fp-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M1 1 L7 4 L1 7 Z" fill="var(--primary)" />
          </marker>
        </defs>
      </svg>
      <figcaption className="mt-2.5 text-[13px] leading-[1.6] text-muted-foreground">
        One foundation, four domains. Your product inherits the foundation and its
        domain, then declares only what makes it its own.
      </figcaption>
    </figure>
  );
}
