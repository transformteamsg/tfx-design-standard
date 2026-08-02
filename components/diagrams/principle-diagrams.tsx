"use client";

import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";

/* Ten small pieces of contemplative art - one per principle. Each is a
   composition first, then subtle motion. Motion respects prefers-reduced-motion
   by rendering the settled composed frame with no animation loop. */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/* rAF-driven ticker returning elapsed seconds since mount. Pauses when the
   tab is hidden. Returns 0 when reduced-motion is on so callers render the
   settled frame. */
function useTime(active: boolean) {
  const [, tick] = useReducer((n: number) => n + 1, 0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!active) return;
    let last = performance.now();
    startRef.current = last;
    const loop = () => {
      tick();
      const now = performance.now();
      // If tab was hidden, skip the elapsed. Not critical here.
      if (now - last < 5000) last = now;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);
  return startRef.current !== null && active
    ? (performance.now() - startRef.current) / 1000
    : 0;
}

function DiagramFrame({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <figure className="not-prose my-6 rounded-lg border border-border bg-surface p-10">
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

/* -------------------------------------------------------------------------- */

/* P1 - Rule vs AI.
   Rule = a still straight line. AI = a slowly meandering low-amplitude sine.
   The stillness reads as reliability; the wobble reads as behaviour that
   varies. */
export function P1UseAIOnly() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  const points: string[] = [];
  const w = 140;
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const x = 240 + (i / steps) * w;
    const y = 90 + Math.sin(i * 0.4 + t * 0.6) * 6;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return (
    <DiagramFrame caption="Ship the rule if it works.">
      <svg viewBox="0 0 440 180" className="w-full max-w-[440px]" role="img" aria-label="A still straight line labelled rule beside a slowly meandering wavy line labelled AI">
        <line x1="60" y1="90" x2="200" y2="90" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" />
        <text x="130" y="140" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)" fontStyle="italic">rule</text>
        <line x1="220" y1="40" x2="220" y2="150" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 3" />
        <polyline
          points={points.join(" ")}
          stroke="var(--muted-foreground)"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x="310" y="140" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)" fontStyle="italic">AI</text>
      </svg>
    </DiagramFrame>
  );
}

/* P2 - Mark output.
   Parallel text-line strokes; one line rendered in accent blue with a small
   "AI" chip beside it. The mark is inside the content, not floating in
   empty space. Fixes the R15 "empty rectangle" problem. */
export function P2MarkOutput() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  const glow = reduced ? 0.9 : 0.75 + 0.2 * Math.sin(t * 1.2);
  return (
    <DiagramFrame caption="The mark sits inside the content.">
      <svg viewBox="0 0 440 200" className="w-full max-w-[440px]" role="img" aria-label="Several parallel lines of text with one line rendered as an AI-marked accent, and an AI badge beside it">
        {/* Text lines */}
        <line x1="70" y1="55" x2="330" y2="55" stroke="var(--muted-foreground)" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
        <line x1="70" y1="80" x2="300" y2="80" stroke="var(--muted-foreground)" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
        {/* Marked line */}
        <line x1="70" y1="105" x2="320" y2="105" stroke="var(--color-tw-blue)" strokeWidth="3" strokeLinecap="round" opacity={glow} />
        {/* AI badge on the same row, to the right */}
        <g transform="translate(340 105)">
          <circle cx="0" cy="0" r="12" fill="var(--color-tw-blue)" />
          <text x="0" y="3" textAnchor="middle" fontSize="9" fontWeight="600" fill="white">AI</text>
        </g>
        {/* Text lines below */}
        <line x1="70" y1="130" x2="290" y2="130" stroke="var(--muted-foreground)" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
        <line x1="70" y1="155" x2="270" y2="155" stroke="var(--muted-foreground)" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      </svg>
    </DiagramFrame>
  );
}

/* P3 - Open source.
   Text lines with a thread slowly drawing down to a labelled source document.
   The thread pulses on a 6s cycle. */
export function P3OpenSource() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  const cycle = (t % 6) / 6; // 0..1
  const drawFrac = reduced ? 1 : Math.min(1, cycle * 1.4); // draws over first 70%, then holds
  const pathLen = 110;
  const dashOffset = pathLen * (1 - drawFrac);
  return (
    <DiagramFrame caption="Every claim is a thread you can pull.">
      <svg viewBox="0 0 440 220" className="w-full max-w-[440px]" role="img" aria-label="A curved line of text with a thread slowly drawing down to a small source document">
        <path d="M 60 55 Q 220 45 380 55" stroke="var(--muted-foreground)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M 60 75 Q 220 65 380 75" stroke="var(--muted-foreground)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M 60 95 Q 220 85 300 95" stroke="var(--muted-foreground)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
        {/* Animated thread */}
        <path
          d="M 220 70 Q 220 130 220 170"
          stroke="var(--color-tw-blue)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray={pathLen}
          strokeDashoffset={dashOffset}
        />
        {/* Source document */}
        <g transform="translate(180 160)" opacity={drawFrac}>
          <path d="M 0 0 L 60 0 L 80 20 L 80 60 L 0 60 Z" fill="var(--surface)" stroke="var(--color-tw-blue)" strokeWidth="1.5" />
          <path d="M 60 0 L 60 20 L 80 20" fill="none" stroke="var(--color-tw-blue)" strokeWidth="1.5" />
          <line x1="14" y1="34" x2="66" y2="34" stroke="var(--muted-foreground)" strokeWidth="1.5" opacity="0.5" />
          <line x1="14" y1="44" x2="60" y2="44" stroke="var(--muted-foreground)" strokeWidth="1.5" opacity="0.5" />
        </g>
      </svg>
    </DiagramFrame>
  );
}

/* P4 - Recovery net.
   Danger dot falls, gets caught by the net, resets. 5s cycle. */
export function P4RecoveryNet() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  const cycle = (t % 5) / 5; // 0..1
  const fallY = reduced ? 155 : 20 + cycle * 135;
  return (
    <DiagramFrame caption="The check runs before the person does.">
      <svg viewBox="0 0 440 240" className="w-full max-w-[440px]" role="img" aria-label="A small dot falling toward a curved net stretched below">
        {/* Trail */}
        <line x1="220" y1="20" x2="220" y2={fallY - 10} stroke="var(--danger)" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
        {/* Falling dot */}
        <circle cx="220" cy={fallY} r="8" fill="var(--danger)" />
        {/* Net */}
        <g stroke="var(--muted-foreground)" strokeWidth="1.5" fill="none" opacity="0.7">
          <path d="M 80 170 Q 220 145 360 170" />
          <path d="M 80 170 Q 220 158 360 170" />
          <line x1="105" y1="163" x2="105" y2="192" />
          <line x1="150" y1="157" x2="150" y2="192" />
          <line x1="220" y1="152" x2="220" y2="192" />
          <line x1="290" y1="157" x2="290" y2="192" />
          <line x1="335" y1="163" x2="335" y2="192" />
        </g>
      </svg>
    </DiagramFrame>
  );
}

/* P5 - Silent write gate.
   A pulse of light travels from AI toward the record but stops at the gate.
   Nothing crosses without the yes. */
export function P5SilentWriteGate() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  const cycle = (t % 4) / 4;
  // pulse animates 0..1 from AI toward gate (stops before crossing)
  const pulseX = reduced ? 165 : 130 + cycle * 45;
  const pulseOpacity = reduced ? 0.7 : Math.max(0, 1 - cycle * 1.3);
  return (
    <DiagramFrame caption="Nothing crosses without a clear yes.">
      <svg viewBox="0 0 440 220" className="w-full max-w-[440px]" role="img" aria-label="An AI circle and a record square either side of a threshold, with a check gate on the line">
        {/* AI */}
        <circle cx="100" cy="110" r="28" fill="var(--color-tw-blue)" fillOpacity="0.15" stroke="var(--color-tw-blue)" strokeWidth="1.5" />
        <text x="100" y="114" textAnchor="middle" fontSize="10" fill="var(--color-tw-blue)" fontStyle="italic">AI</text>
        {/* Pulse */}
        <circle cx={pulseX} cy="110" r="6" fill="var(--color-tw-blue)" opacity={pulseOpacity} />
        {/* Threshold */}
        <line x1="220" y1="40" x2="220" y2="180" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
        {/* Gate */}
        <rect x="205" y="95" width="30" height="30" rx="6" fill="var(--surface)" stroke="var(--foreground)" strokeWidth="1.5" />
        <path d="M 211 110 L 218 117 L 229 103" stroke="var(--success)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Record */}
        <rect x="304" y="84" width="56" height="56" rx="6" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5" />
        <text x="332" y="115" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)" fontStyle="italic">record</text>
      </svg>
    </DiagramFrame>
  );
}

/* P6 - Data control.
   Dots inside a container pulse gently. */
export function P6DataControl() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  const scale = (i: number) =>
    reduced ? 1 : 0.9 + 0.15 * Math.sin(t * 1.5 + i * 1.7);
  return (
    <DiagramFrame caption="Always visible, always removable.">
      <svg viewBox="0 0 440 220" className="w-full max-w-[440px]" role="img" aria-label="A dashed translucent container holding three softly pulsing dots with an arc lifting one out">
        <rect x="90" y="100" width="260" height="90" rx="12" fill="var(--muted)" fillOpacity="0.4" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx="150" cy="145" r={10 * scale(0)} fill="var(--muted-foreground)" opacity="0.55" />
        <circle cx="220" cy="145" r={10 * scale(1)} fill="var(--muted-foreground)" opacity="0.55" />
        <circle cx="290" cy="145" r={10 * scale(2)} fill="var(--muted-foreground)" opacity="0.55" />
        <path d="M 220 145 Q 290 60 350 40" stroke="var(--color-tw-blue)" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
        <circle cx="350" cy="40" r="10" fill="var(--color-tw-blue)" />
      </svg>
    </DiagramFrame>
  );
}

/* P7 - Guide vs answer.
   Two walkers reach the same destination. Fast walker on direct arrow;
   slow walker on meander with a pause at the midpoint. Same period so
   they arrive together, teaching that both work - only one teaches on
   the way. */
export function P7GuideNotAnswer() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  const period = 6;
  const cycle = (t % period) / period; // 0..1
  const c = reduced ? 0.5 : cycle;
  const start = { x: 58, y: 110 };
  const end = { x: 350, y: 110 };
  // Fast walker on straight line
  const fx = start.x + (end.x - start.x) * c;
  const fy = 80;
  // Slow walker on curve - parametric approximation
  const t2 = c;
  const bx = start.x + (end.x - start.x) * t2;
  const by = 130 + Math.sin(t2 * Math.PI * 2) * 25;
  return (
    <DiagramFrame caption="Both paths reach the destination. Only one teaches.">
      <svg viewBox="0 0 440 220" className="w-full max-w-[440px]" role="img" aria-label="A learner start point connected to a destination by two paths - a direct arrow with a fast walker, and a meander with a slower walker">
        {/* Start */}
        <circle cx="58" cy="110" r="7" fill="var(--foreground)" />
        <text x="58" y="135" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)" fontStyle="italic">learner</text>
        {/* Destination */}
        <circle cx="350" cy="110" r="10" fill="var(--success)" />
        <text x="350" y="135" textAnchor="middle" fontSize="10" fill="var(--success)" fontStyle="italic">gets it</text>
        {/* Direct arrow */}
        <line x1="66" y1="80" x2="336" y2="80" stroke="var(--muted-foreground)" strokeWidth="1.5" opacity="0.4" />
        <text x="200" y="65" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">answer</text>
        {/* Meander */}
        <path
          d="M 66 130 C 130 165, 180 100, 220 145 S 310 100, 340 130"
          stroke="var(--color-tw-blue)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.55"
        />
        <text x="200" y="200" textAnchor="middle" fontSize="11" fill="var(--color-tw-blue)">guide</text>
        {/* Fast walker */}
        <circle cx={fx} cy={fy} r="4" fill="var(--muted-foreground)" />
        {/* Slow walker */}
        <circle cx={bx} cy={by} r="4" fill="var(--color-tw-blue)" />
      </svg>
    </DiagramFrame>
  );
}

/* P8 - Range not average.
   Score bars oscillate on a very low amplitude; the lowest one glows in
   danger to hold attention as the standard. */
export function P8RangeNotAverage() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  const wobble = (i: number) => (reduced ? 0 : Math.sin(t * 0.9 + i * 1.3) * 3);
  return (
    <DiagramFrame caption="Hold the standard on the worst-served, not the average.">
      <svg viewBox="0 0 440 220" className="w-full max-w-[440px]" role="img" aria-label="Five score bars of different heights, the lowest highlighted in danger as the held standard">
        {/* Bars */}
        <rect x="72" y={60 + wobble(0)} width="16" height={90 - wobble(0)} rx="3" fill="var(--muted-foreground)" opacity="0.5" />
        <rect x="132" y={75 + wobble(1)} width="16" height={75 - wobble(1)} rx="3" fill="var(--muted-foreground)" opacity="0.5" />
        <rect x="192" y={105 + wobble(2)} width="16" height={45 - wobble(2)} rx="3" fill="var(--danger)" />
        <rect x="252" y={50 + wobble(3)} width="16" height={100 - wobble(3)} rx="3" fill="var(--muted-foreground)" opacity="0.5" />
        <rect x="312" y={70 + wobble(4)} width="16" height={80 - wobble(4)} rx="3" fill="var(--muted-foreground)" opacity="0.5" />
        {/* Threshold */}
        <line x1="50" y1="105" x2="350" y2="105" stroke="var(--danger)" strokeWidth="1" strokeDasharray="4 3" opacity="0.55" />
        {/* Group circles */}
        <circle cx="80" cy="180" r="10" fill="var(--muted)" stroke="var(--border)" strokeWidth="1" />
        <circle cx="140" cy="180" r="13" fill="var(--muted)" stroke="var(--border)" strokeWidth="1" />
        <circle cx="200" cy="180" r="8" fill="var(--muted)" stroke="var(--danger)" strokeWidth="1.5" />
        <circle cx="260" cy="180" r="12" fill="var(--muted)" stroke="var(--border)" strokeWidth="1" />
        <circle cx="320" cy="180" r="11" fill="var(--muted)" stroke="var(--border)" strokeWidth="1" />
      </svg>
    </DiagramFrame>
  );
}

/* P9 - Reads as a tool.
   The mask outline is drawn as a single continuous line that fades in at
   one end and out at the other, never fully closing. Says "never a face"
   through motion. */
export function P9HonestIdentity() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  // Path length approximation
  const pathLen = 400;
  const stroke = 24;
  const period = 8;
  const c = reduced ? 0.5 : (t % period) / period;
  // The visible arc slides around the perimeter
  const offset = -c * pathLen;
  return (
    <DiagramFrame caption="Always a tool, never a face.">
      <svg viewBox="0 0 440 220" className="w-full max-w-[440px]" role="img" aria-label="A mask outline drawn as a single continuous line, fading in one side and out the other, never fully forming a face">
        {/* Mask ghost outline (very faint) */}
        <path
          d="M 150 70 Q 220 40 290 70 Q 305 100 295 140 Q 280 165 220 175 Q 160 165 145 140 Q 135 100 150 70 Z"
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
          opacity="0.4"
        />
        {/* Animated segment - a short section of the perimeter travels */}
        <path
          d="M 150 70 Q 220 40 290 70 Q 305 100 295 140 Q 280 165 220 175 Q 160 165 145 140 Q 135 100 150 70 Z"
          fill="none"
          stroke="var(--color-tw-blue)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${stroke} ${pathLen - stroke}`}
          strokeDashoffset={offset}
        />
        {/* Eye holes (very faint - a hint, not a face) */}
        <ellipse cx="190" cy="110" rx="7" ry="4" fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.6" />
        <ellipse cx="250" cy="110" rx="7" ry="4" fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.6" />
      </svg>
    </DiagramFrame>
  );
}

/* P10 - Reward real progress, not visits.
   Left: five progress dots with a "tick" that walks across one at a time,
   cycling. Right: a spiral rotating slowly with no end. Two rhythms side
   by side - one purposeful, one hypnotic. */
export function P10NoEngagement() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  const active = reduced ? 2 : Math.floor((t * 0.9) % 5);
  const rotate = reduced ? 0 : (t * 12) % 360;
  return (
    <DiagramFrame caption="One measures real progress. The other pulls the sleeve.">
      <svg viewBox="0 0 440 220" className="w-full max-w-[440px]" role="img" aria-label="A row of five progress dots with a ticking indicator that walks across them, beside a slowly rotating spiral in danger colour">
        {/* Left: progress track */}
        <line x1="50" y1="110" x2="200" y2="110" stroke="var(--muted-foreground)" strokeWidth="1" opacity="0.35" />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={65 + i * 32}
            cy="110"
            r="6"
            fill={i === active ? "var(--success)" : i < active ? "var(--success)" : "var(--muted)"}
            fillOpacity={i === active ? 1 : i < active ? 0.6 : 1}
            stroke={i > active ? "var(--muted-foreground)" : "none"}
            strokeWidth="1"
          />
        ))}
        <text x="125" y="150" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)" fontStyle="italic">real progress</text>
        {/* Divider */}
        <line x1="240" y1="40" x2="240" y2="180" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 3" />
        {/* Right: dopamine spiral (rotating) */}
        <g transform={`translate(340 110) rotate(${rotate})`}>
          <path
            d="M 0 0
               m -40 0
               a 40 40 0 1 1 80 0
               a 32 32 0 1 0 -64 0
               a 24 24 0 1 1 48 0
               a 16 16 0 1 0 -32 0
               a 8 8 0 1 1 16 0"
            stroke="var(--danger)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        </g>
        <text x="340" y="180" textAnchor="middle" fontSize="11" fill="var(--danger)" fontStyle="italic">dopamine loop</text>
      </svg>
    </DiagramFrame>
  );
}
