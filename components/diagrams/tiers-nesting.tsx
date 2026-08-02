/* Three nested rectangles showing the tier hierarchy for AI review.
   Interface sits inside Product decision sits inside Engine.
   The engine sets the ceiling on what the interface can achieve. */

export function TiersNesting() {
  return (
    <figure className="not-prose my-6 flex justify-center rounded-lg border border-border bg-surface p-6">
      <svg
        viewBox="0 0 640 260"
        className="w-full max-w-[560px] text-foreground"
        role="img"
        aria-label="Three nested tiers of review: interface inside product decision inside engine; the engine sets the ceiling"
      >
        {/* Engine - outer, biggest */}
        <g>
          <rect x="60" y="20" width="520" height="220" rx="14" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5" />
          <text x="80" y="42" fontSize="12" fontWeight="600" fill="currentColor">Engine</text>
          <text x="80" y="58" fontSize="11" fill="var(--muted-foreground)">the model itself; procurement gate</text>
        </g>

        {/* Product decision - middle */}
        <g>
          <rect x="120" y="80" width="400" height="140" rx="12" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
          <text x="140" y="102" fontSize="12" fontWeight="600" fill="currentColor">Product decision</text>
          <text x="140" y="118" fontSize="11" fill="var(--muted-foreground)">should this be AI at all; success metric</text>
        </g>

        {/* Interface - inner, smallest */}
        <g>
          <rect x="180" y="140" width="280" height="70" rx="10" fill="var(--muted)" stroke="var(--color-tw-blue)" strokeWidth="1.5" />
          <text x="200" y="162" fontSize="12" fontWeight="600" fill="currentColor">Interface</text>
          <text x="200" y="178" fontSize="11" fill="var(--muted-foreground)">how it behaves on screen</text>
          <text x="200" y="196" fontSize="11" fill="var(--color-tw-blue)">what a designer owns</text>
        </g>

        {/* Side arrow: engine sets the ceiling */}
        <g stroke="var(--muted-foreground)" strokeWidth="1.2" fill="none" markerEnd="url(#tierArrowHead)">
          <line x1="600" y1="40" x2="600" y2="220" />
        </g>
        <text x="608" y="130" fontSize="10" fill="var(--muted-foreground)">the engine sets</text>
        <text x="608" y="144" fontSize="10" fill="var(--muted-foreground)">the ceiling on</text>
        <text x="608" y="158" fontSize="10" fill="var(--muted-foreground)">everything above</text>

        <defs>
          <marker id="tierArrowHead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted-foreground)" />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}
