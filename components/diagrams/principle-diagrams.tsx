import type { ReactNode } from "react";

/* Abstract compositions - one per principle. Each is a small piece of visual
   art, not an icon-and-label functional diagram. Shared DiagramFrame keeps
   the outer container consistent; each SVG carries the concept. */

function DiagramFrame({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <figure className="not-prose my-6 rounded-lg border border-border bg-surface p-8">
      <div className="flex items-center justify-center">
        {children}
      </div>
      {caption && (
        <figcaption className="mt-4 text-center text-xs italic text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* P1 - Use AI only when a rule cannot.
   Straight crisp line (rule) vs a tangled scribble (AI), side by side. */
export function P1UseAIOnly() {
  return (
    <DiagramFrame caption="Ship the rule if it works.">
      <svg viewBox="0 0 400 180" className="w-full max-w-[420px]" role="img" aria-label="A straight line labelled rule beside a tangled scribble labelled AI">
        {/* Left panel: rule */}
        <g>
          <line x1="40" y1="90" x2="160" y2="90" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" />
          <text x="100" y="140" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)" fontStyle="italic">rule</text>
        </g>
        {/* Divider */}
        <line x1="200" y1="30" x2="200" y2="150" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 3" />
        {/* Right panel: AI scribble */}
        <g>
          <path
            d="M 240 90 C 260 40, 275 130, 290 70 S 315 130, 330 60 S 355 130, 370 90"
            stroke="var(--muted-foreground)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <text x="305" y="140" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)" fontStyle="italic">AI</text>
        </g>
      </svg>
    </DiagramFrame>
  );
}

/* P2 - Mark every AI output.
   Muted content field with one small accent dot in the corner. The mark IS
   the diagram. */
export function P2MarkOutput() {
  return (
    <DiagramFrame caption="A quiet mark, always beside the content.">
      <svg viewBox="0 0 400 220" className="w-full max-w-[420px]" role="img" aria-label="A large muted content field with a small accent circle in the top-right corner marking it as AI">
        {/* Content field */}
        <rect x="60" y="40" width="280" height="140" rx="12" fill="var(--muted)" stroke="var(--border)" strokeWidth="1" />
        {/* AI mark - small circle top right */}
        <circle cx="330" cy="52" r="10" fill="var(--color-tw-blue)" />
        <text x="330" y="55" textAnchor="middle" fontSize="9" fontWeight="600" fill="white">AI</text>
      </svg>
    </DiagramFrame>
  );
}

/* P3 - Every AI claim opens the source.
   A curved gesture of "text" with a thin thread pulling out to a source doc.  */
export function P3OpenSource() {
  return (
    <DiagramFrame caption="Every claim is a thread you can pull.">
      <svg viewBox="0 0 400 220" className="w-full max-w-[420px]" role="img" aria-label="A curved line representing text with a thin thread pulling down from its midpoint to a small labelled source document">
        {/* Three curved 'text lines' */}
        <path d="M 40 55 Q 200 45 360 55" stroke="var(--muted-foreground)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M 40 75 Q 200 65 360 75" stroke="var(--muted-foreground)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M 40 95 Q 200 85 280 95" stroke="var(--muted-foreground)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
        {/* Thread pulling down */}
        <path d="M 200 70 Q 200 130 200 170" stroke="var(--color-tw-blue)" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
        {/* Source doc */}
        <g transform="translate(160 160)">
          <path d="M 0 0 L 60 0 L 80 20 L 80 60 L 0 60 Z" fill="var(--surface)" stroke="var(--color-tw-blue)" strokeWidth="1.5" />
          <path d="M 60 0 L 60 20 L 80 20" fill="none" stroke="var(--color-tw-blue)" strokeWidth="1.5" />
          <line x1="14" y1="34" x2="66" y2="34" stroke="var(--muted-foreground)" strokeWidth="1.5" opacity="0.5" />
          <line x1="14" y1="44" x2="60" y2="44" stroke="var(--muted-foreground)" strokeWidth="1.5" opacity="0.5" />
        </g>
      </svg>
    </DiagramFrame>
  );
}

/* P4 - Recover from invisible errors.
   A small object mid-fall with a curved net stretched below. */
export function P4RecoveryNet() {
  return (
    <DiagramFrame caption="The check runs before the person does.">
      <svg viewBox="0 0 400 220" className="w-full max-w-[420px]" role="img" aria-label="A small dot falling toward a curved fine-line net stretched beneath it">
        {/* Falling dot */}
        <circle cx="200" cy="65" r="9" fill="var(--danger)" />
        {/* Motion trail */}
        <line x1="200" y1="20" x2="200" y2="55" stroke="var(--danger)" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
        {/* Net - four arcs crossing */}
        <g stroke="var(--muted-foreground)" strokeWidth="1.5" fill="none" opacity="0.7">
          <path d="M 60 160 Q 200 130 340 160" />
          <path d="M 60 160 Q 200 150 340 160" />
          <line x1="90" y1="152" x2="90" y2="180" />
          <line x1="140" y1="146" x2="140" y2="180" />
          <line x1="200" y1="142" x2="200" y2="180" />
          <line x1="260" y1="146" x2="260" y2="180" />
          <line x1="310" y1="152" x2="310" y2="180" />
        </g>
      </svg>
    </DiagramFrame>
  );
}

/* P5 - No silent writes.
   AI element + record separated by a gate glyph on a threshold. */
export function P5SilentWriteGate() {
  return (
    <DiagramFrame caption="Nothing crosses without a clear yes.">
      <svg viewBox="0 0 400 220" className="w-full max-w-[420px]" role="img" aria-label="A blue circle on one side, a grey square on the other, separated by a threshold with a check-gate glyph">
        {/* Left: AI */}
        <circle cx="90" cy="110" r="26" fill="var(--color-tw-blue)" opacity="0.15" stroke="var(--color-tw-blue)" strokeWidth="1.5" />
        <text x="90" y="114" textAnchor="middle" fontSize="10" fill="var(--color-tw-blue)" fontStyle="italic">AI</text>
        {/* Threshold */}
        <line x1="200" y1="40" x2="200" y2="180" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
        {/* Gate glyph on threshold */}
        <rect x="185" y="95" width="30" height="30" rx="6" fill="var(--surface)" stroke="var(--foreground)" strokeWidth="1.5" />
        <path d="M 191 110 L 198 117 L 209 103" stroke="var(--success)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Right: record */}
        <rect x="284" y="84" width="52" height="52" rx="6" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5" />
        <text x="310" y="114" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)" fontStyle="italic">record</text>
      </svg>
    </DiagramFrame>
  );
}

/* P6 - Let people see and remove stored data.
   Translucent container of dots with an arc lifting one out. */
export function P6DataControl() {
  return (
    <DiagramFrame caption="Always visible, always removable.">
      <svg viewBox="0 0 400 220" className="w-full max-w-[420px]" role="img" aria-label="A rounded translucent container holding three dots with an arc lifting one dot up and out">
        {/* Container */}
        <rect x="80" y="100" width="240" height="90" rx="12" fill="var(--muted)" fillOpacity="0.4" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 3" />
        {/* Three dots inside */}
        <circle cx="140" cy="145" r="10" fill="var(--muted-foreground)" opacity="0.5" />
        <circle cx="200" cy="145" r="10" fill="var(--muted-foreground)" opacity="0.5" />
        <circle cx="260" cy="145" r="10" fill="var(--muted-foreground)" opacity="0.5" />
        {/* Arc lifting one dot out */}
        <path d="M 200 145 Q 260 60 320 40" stroke="var(--color-tw-blue)" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
        {/* Lifted dot */}
        <circle cx="320" cy="40" r="10" fill="var(--color-tw-blue)" />
      </svg>
    </DiagramFrame>
  );
}

/* P7 - For learners, guide - do not answer.
   Two paths to the same destination: direct arrow "answer", meander "guide". */
export function P7GuideNotAnswer() {
  return (
    <DiagramFrame caption="Both paths reach the destination. Only one teaches.">
      <svg viewBox="0 0 400 220" className="w-full max-w-[420px]" role="img" aria-label="A learner start point on the left connected to a destination on the right by two paths: a direct arrow labelled answer and a longer meandering path labelled guide">
        {/* Start dot */}
        <circle cx="50" cy="110" r="7" fill="var(--foreground)" />
        <text x="50" y="135" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)" fontStyle="italic">learner</text>
        {/* Destination dot */}
        <circle cx="350" cy="110" r="10" fill="var(--success)" />
        <text x="350" y="135" textAnchor="middle" fontSize="10" fill="var(--success)" fontStyle="italic">gets it</text>
        {/* Direct answer arrow */}
        <line x1="58" y1="80" x2="336" y2="80" stroke="var(--muted-foreground)" strokeWidth="1.5" opacity="0.6" markerEnd="url(#answerArrow)" />
        <text x="200" y="70" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">answer</text>
        {/* Meandering guide path */}
        <path
          d="M 58 130 C 110 165, 170 100, 220 145 S 300 100, 340 130"
          stroke="var(--color-tw-blue)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Small dot along the guide - "learner realises" */}
        <circle cx="220" cy="145" r="4" fill="var(--color-tw-blue)" />
        <text x="200" y="180" textAnchor="middle" fontSize="11" fill="var(--color-tw-blue)">guide</text>
        <defs>
          <marker id="answerArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted-foreground)" opacity="0.6" />
          </marker>
        </defs>
      </svg>
    </DiagramFrame>
  );
}

/* P8 - Test across every group.
   Row of differently-sized circles with score bars, lowest highlighted. */
export function P8RangeNotAverage() {
  return (
    <DiagramFrame caption="Hold the standard on the worst-served, not the average.">
      <svg viewBox="0 0 400 220" className="w-full max-w-[420px]" role="img" aria-label="Five circles of different sizes across the bottom representing groups, each with a score bar above; the lowest bar is highlighted in danger red">
        {/* Score bars - group 3 is lowest */}
        <rect x="52" y="60" width="16" height="90" rx="3" fill="var(--muted-foreground)" opacity="0.6" />
        <rect x="112" y="75" width="16" height="75" rx="3" fill="var(--muted-foreground)" opacity="0.6" />
        <rect x="172" y="105" width="16" height="45" rx="3" fill="var(--danger)" />
        <rect x="232" y="50" width="16" height="100" rx="3" fill="var(--muted-foreground)" opacity="0.6" />
        <rect x="292" y="70" width="16" height="80" rx="3" fill="var(--muted-foreground)" opacity="0.6" />
        {/* Threshold line - held at lowest */}
        <line x1="30" y1="105" x2="330" y2="105" stroke="var(--danger)" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
        {/* Groups (circles of different sizes) */}
        <circle cx="60" cy="180" r="10" fill="var(--muted)" stroke="var(--border)" strokeWidth="1" />
        <circle cx="120" cy="180" r="13" fill="var(--muted)" stroke="var(--border)" strokeWidth="1" />
        <circle cx="180" cy="180" r="8" fill="var(--muted)" stroke="var(--danger)" strokeWidth="1.5" />
        <circle cx="240" cy="180" r="12" fill="var(--muted)" stroke="var(--border)" strokeWidth="1" />
        <circle cx="300" cy="180" r="11" fill="var(--muted)" stroke="var(--border)" strokeWidth="1" />
      </svg>
    </DiagramFrame>
  );
}

/* P9 - Honest about what it is.
   A single mask outline, half-filled. Always a tool, never a face. */
export function P9HonestIdentity() {
  return (
    <DiagramFrame caption="Always a tool, never a face.">
      <svg viewBox="0 0 400 220" className="w-full max-w-[420px]" role="img" aria-label="A mask shape - half filled with accent colour, half hollow - marking the AI as clearly a tool">
        {/* Mask outline - stylised */}
        <path
          d="M 130 70 Q 200 40 270 70 Q 285 100 275 140 Q 260 165 200 175 Q 140 165 125 140 Q 115 100 130 70 Z"
          fill="var(--surface)"
          stroke="var(--foreground)"
          strokeWidth="1.8"
        />
        {/* Half-fill overlay */}
        <path
          d="M 130 70 Q 200 40 200 40 L 200 175 Q 140 165 125 140 Q 115 100 130 70 Z"
          fill="var(--color-tw-blue)"
          fillOpacity="0.15"
        />
        {/* Eye holes */}
        <ellipse cx="170" cy="110" rx="10" ry="6" fill="var(--surface)" stroke="var(--foreground)" strokeWidth="1.5" />
        <ellipse cx="230" cy="110" rx="10" ry="6" fill="var(--surface)" stroke="var(--foreground)" strokeWidth="1.5" />
        {/* Vertical divide line */}
        <line x1="200" y1="40" x2="200" y2="175" stroke="var(--foreground)" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
      </svg>
    </DiagramFrame>
  );
}

/* P10 - No engagement mechanics.
   A straight line of even marks (real progress) beside a dopamine spiral. */
export function P10NoEngagement() {
  return (
    <DiagramFrame caption="One measures real progress. The other pulls the sleeve.">
      <svg viewBox="0 0 400 220" className="w-full max-w-[420px]" role="img" aria-label="A straight row of evenly spaced progress marks beside a spiral going nowhere">
        {/* Real progress: line of even ticks */}
        <g>
          <line x1="40" y1="110" x2="180" y2="110" stroke="var(--muted-foreground)" strokeWidth="1" opacity="0.4" />
          <circle cx="55" cy="110" r="5" fill="var(--success)" />
          <circle cx="85" cy="110" r="5" fill="var(--success)" />
          <circle cx="115" cy="110" r="5" fill="var(--success)" />
          <circle cx="145" cy="110" r="5" fill="var(--success)" />
          <circle cx="175" cy="110" r="5" fill="var(--muted)" stroke="var(--muted-foreground)" strokeWidth="1" />
          <text x="110" y="150" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)" fontStyle="italic">real progress</text>
        </g>
        {/* Divider */}
        <line x1="220" y1="40" x2="220" y2="180" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 3" />
        {/* Dopamine spiral - going nowhere */}
        <g>
          <path
            d="M 320 110
               m -40 0
               a 40 40 0 1 1 80 0
               a 32 32 0 1 0 -64 0
               a 24 24 0 1 1 48 0
               a 16 16 0 1 0 -32 0
               a 8 8 0 1 1 16 0"
            stroke="var(--danger)"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          <text x="320" y="180" textAnchor="middle" fontSize="11" fill="var(--danger)" fontStyle="italic">dopamine loop</text>
        </g>
      </svg>
    </DiagramFrame>
  );
}
