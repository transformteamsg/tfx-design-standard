/* Two-figure diagram illustrating the operator-vs-affected split.
   Operator (Teacher / School Officer) uses the AI; the AI output flows
   to the Affected person (Student / Applicant); a return arrow shows
   the affected person needs a path to see it and contest it.
   Token colours only, no motion, no external assets. */

export function OperatorAffectedDiagram() {
  return (
    <figure className="not-prose my-6 flex justify-center rounded-lg border border-border bg-surface p-6">
      <svg
        viewBox="0 0 640 220"
        className="w-full max-w-[560px] text-foreground"
        role="img"
        aria-label="Operator uses the AI; affected person receives the output and needs a path to see and contest it"
      >
        {/* Operator column */}
        <g>
          <circle cx="90" cy="65" r="18" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5" />
          <path d="M 60 118 Q 90 88 120 118 L 120 138 L 60 138 Z" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5" />
          <text x="90" y="170" textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">Operator</text>
          <text x="90" y="188" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">Teacher / Officer</text>
        </g>

        {/* AI box in centre */}
        <g>
          <rect x="245" y="70" width="150" height="70" rx="10" fill="var(--muted)" stroke="var(--color-tw-blue)" strokeWidth="1.5" />
          <text x="320" y="103" textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">AI feature</text>
          <text x="320" y="122" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">produces an output</text>
        </g>

        {/* Affected column */}
        <g>
          <circle cx="550" cy="65" r="18" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5" />
          <path d="M 520 118 Q 550 88 580 118 L 580 138 L 520 138 Z" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5" />
          <text x="550" y="170" textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">Affected person</text>
          <text x="550" y="188" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">Student / Applicant</text>
        </g>

        {/* Arrow: operator → AI */}
        <g stroke="var(--color-tw-blue)" strokeWidth="1.5" fill="none" markerEnd="url(#opArrowHead)">
          <line x1="130" y1="105" x2="240" y2="105" />
        </g>
        {/* Arrow: AI → affected (output) */}
        <g stroke="var(--color-tw-blue)" strokeWidth="1.5" fill="none" markerEnd="url(#opArrowHead)">
          <line x1="400" y1="95" x2="510" y2="95" />
        </g>
        {/* Return arrow: affected must be able to see + contest */}
        <g stroke="var(--danger)" strokeWidth="1.5" fill="none" strokeDasharray="4 3" markerEnd="url(#opArrowHeadDanger)">
          <path d="M 510 125 Q 455 155 400 125" />
        </g>
        <text x="455" y="175" textAnchor="middle" fontSize="10" fill="var(--danger)">must see + contest</text>

        <defs>
          <marker id="opArrowHead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-tw-blue)" />
          </marker>
          <marker id="opArrowHeadDanger" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--danger)" />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}
