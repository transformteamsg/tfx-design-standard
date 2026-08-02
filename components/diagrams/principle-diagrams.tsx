"use client";

import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";

/* Ten diagrams for the ten principles. Aesthetic locked to Japanese Ma +
   Dieter Rams discipline: hairline strokes, near-monochrome palette, one
   accent used sparingly to mark meaning, extreme whitespace, slow
   sine-eased motion, prefers-reduced-motion respected. Each composition
   is designed to read the principle at a glance. */

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

function useTime(active: boolean) {
  const [, tick] = useReducer((n: number) => n + 1, 0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!active) return;
    startRef.current = performance.now();
    const loop = () => {
      tick();
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

/* All ten pieces share this frame. Extreme padding, subtle border, no
   inner surface change - the SVG breathes on the same paper. */
function DiagramFrame({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <figure className="not-prose my-8 rounded-lg border border-border bg-surface p-12">
      <div className="flex items-center justify-center">
        {children}
      </div>
      {caption && (
        <figcaption className="mt-6 text-center text-xs italic text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* Shared stroke settings picked once. Every diagram inherits these. */
const HAIRLINE = 1.25;
const ACCENT_STROKE = 1.5;
const MUTED = "var(--muted-foreground)";
const FG = "var(--foreground)";
const ACCENT = "var(--color-tw-blue)";

/* -------------------------------------------------------------------------- */

/* P1 - AI is a last resort, not a default.
   A vertical stack of five thin rules (fixed rule, form, filter, script,
   AI). Only AI carries the accent, at the top of the stack, reached last. */
export function P1UseAIOnly() {
  const labels = ["fixed rule", "form field", "filter", "script", "AI"];
  return (
    <DiagramFrame caption="Reach for the simplest tool that solves the job.">
      <svg viewBox="0 0 480 240" className="w-full max-w-[480px]" role="img" aria-label="A vertical stack of five options: fixed rule, form field, filter, script, and AI. AI sits at the top, reached last.">
        {labels.map((label, i) => {
          const y = 60 + i * 30;
          const isAI = i === labels.length - 1;
          return (
            <g key={label}>
              <line
                x1="140"
                y1={y}
                x2="280"
                y2={y}
                stroke={isAI ? ACCENT : MUTED}
                strokeWidth={isAI ? ACCENT_STROKE : HAIRLINE}
                strokeLinecap="round"
                opacity={isAI ? 1 : 0.55}
              />
              <text
                x="300"
                y={y + 3}
                fontSize="11"
                fill={isAI ? ACCENT : MUTED}
                opacity={isAI ? 1 : 0.7}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}

/* P2 - AI declares itself.
   A single text-line drawn as one continuous stroke, with a small hairline
   circle bonded to its start. The mark and the content are one line - the
   mark cannot be peeled off. */
export function P2MarkOutput() {
  return (
    <DiagramFrame caption="The mark and the content are one composition.">
      <svg viewBox="0 0 480 200" className="w-full max-w-[480px]" role="img" aria-label="A hairline text line with a small marked node bonded to its start; the mark and the content are one shape.">
        {/* Three lines of "text" */}
        <line x1="140" y1="80" x2="360" y2="80" stroke={MUTED} strokeWidth={HAIRLINE} strokeLinecap="round" opacity="0.4" />
        {/* Marked line - accent circle attached to the start */}
        <g>
          <circle cx="130" cy="105" r="5" fill={ACCENT} />
          <line x1="140" y1="105" x2="360" y2="105" stroke={ACCENT} strokeWidth={ACCENT_STROKE} strokeLinecap="round" />
        </g>
        <line x1="140" y1="130" x2="320" y2="130" stroke={MUTED} strokeWidth={HAIRLINE} strokeLinecap="round" opacity="0.4" />
      </svg>
    </DiagramFrame>
  );
}

/* P3 - Every claim carries its receipt.
   A single sentence-line with a hairline thread trailing down to a small
   receipt tag. The thread pulses along its length. */
export function P3OpenSource() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  const cycle = (t % 5) / 5;
  const pathLen = 60;
  const dashOffset = reduced ? 0 : pathLen * (1 - Math.min(1, cycle * 1.5));
  return (
    <DiagramFrame caption="Every claim ties back to something a person can open.">
      <svg viewBox="0 0 480 220" className="w-full max-w-[480px]" role="img" aria-label="A sentence line with a hairline thread trailing down to a small receipt tag.">
        {/* Sentence line */}
        <line x1="140" y1="80" x2="360" y2="80" stroke={FG} strokeWidth={HAIRLINE} strokeLinecap="round" />
        {/* Thread - animated draw */}
        <path
          d="M 250 82 L 250 140"
          stroke={ACCENT}
          strokeWidth={HAIRLINE}
          fill="none"
          strokeDasharray={pathLen}
          strokeDashoffset={dashOffset}
        />
        {/* Receipt tag */}
        <g transform="translate(228 140)">
          <path
            d="M 0 0 L 44 0 L 44 26 L 22 34 L 0 26 Z"
            fill="none"
            stroke={ACCENT}
            strokeWidth={HAIRLINE}
            strokeLinejoin="round"
          />
          <line x1="8" y1="12" x2="36" y2="12" stroke={ACCENT} strokeWidth={HAIRLINE * 0.9} opacity="0.5" strokeLinecap="round" />
          <line x1="8" y1="20" x2="30" y2="20" stroke={ACCENT} strokeWidth={HAIRLINE * 0.9} opacity="0.5" strokeLinecap="round" />
        </g>
      </svg>
    </DiagramFrame>
  );
}

/* P4 - The system catches what the user cannot see.
   An inner arc (the user's field of view) inside a wider arc (the system's
   catch). What falls outside the inner arc is still held by the outer. */
export function P4RecoveryNet() {
  return (
    <DiagramFrame caption="Two arcs of care - the outer catches what the inner cannot see.">
      <svg viewBox="0 0 480 240" className="w-full max-w-[480px]" role="img" aria-label="A narrow inner arc labelled user field of view, contained inside a wider outer arc labelled system catch.">
        {/* Centre dot - the user */}
        <circle cx="240" cy="200" r="3" fill={FG} />
        {/* Inner arc - user's field of view */}
        <path
          d="M 175 140 A 80 80 0 0 1 305 140"
          stroke={MUTED}
          strokeWidth={HAIRLINE}
          fill="none"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* Outer arc - system's catch */}
        <path
          d="M 110 130 A 140 140 0 0 1 370 130"
          stroke={ACCENT}
          strokeWidth={ACCENT_STROKE}
          fill="none"
          strokeLinecap="round"
        />
        <text x="240" y="220" textAnchor="middle" fontSize="10" fill={MUTED} fontStyle="italic" opacity="0.65">user</text>
      </svg>
    </DiagramFrame>
  );
}

/* P5 - No action without consent.
   Two hairline circles separated by a small key-notch on the threshold
   between them. A pulse of light travels from one side, stops at the
   notch, waits. */
export function P5SilentWriteGate() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  const cycle = (t % 4) / 4;
  const pulseX = reduced ? 205 : 160 + Math.min(45, cycle * 60);
  const pulseOpacity = reduced ? 0.7 : Math.max(0, 1 - cycle * 1.3);
  return (
    <DiagramFrame caption="Nothing crosses without the key.">
      <svg viewBox="0 0 480 200" className="w-full max-w-[480px]" role="img" aria-label="Two circles separated by a threshold with a key-notch gate; a pulse of light stops at the notch.">
        {/* Left circle */}
        <circle cx="150" cy="100" r="34" fill="none" stroke={ACCENT} strokeWidth={HAIRLINE} />
        {/* Threshold */}
        <line x1="250" y1="50" x2="250" y2="150" stroke={MUTED} strokeWidth={HAIRLINE} strokeDasharray="2 4" opacity="0.4" />
        {/* Key notch on threshold */}
        <g transform="translate(250 100)">
          <circle cx="0" cy="0" r="6" fill="none" stroke={FG} strokeWidth={HAIRLINE} />
          <line x1="0" y1="6" x2="0" y2="14" stroke={FG} strokeWidth={HAIRLINE} strokeLinecap="round" />
        </g>
        {/* Right circle */}
        <circle cx="350" cy="100" r="34" fill="none" stroke={MUTED} strokeWidth={HAIRLINE} opacity="0.55" />
        {/* Pulse */}
        <circle cx={pulseX} cy="100" r="4" fill={ACCENT} opacity={pulseOpacity} />
      </svg>
    </DiagramFrame>
  );
}

/* P6 - The subject owns their data.
   Three small dots orbit a still centre point; hairline strings tether
   them to it. The person can always pull. */
export function P6DataControl() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  const orbit = (i: number, r: number) => {
    const angle = reduced ? i * 2.1 : t * 0.35 + i * 2.09;
    return {
      x: 240 + Math.cos(angle) * r,
      y: 110 + Math.sin(angle) * r,
    };
  };
  const dots = [orbit(0, 70), orbit(1, 70), orbit(2, 70)];
  return (
    <DiagramFrame caption="Always tethered. Always pullable.">
      <svg viewBox="0 0 480 220" className="w-full max-w-[480px]" role="img" aria-label="Three small dots orbiting a still centre, each tethered by a hairline string.">
        {/* Tether strings */}
        {dots.map((d, i) => (
          <line
            key={i}
            x1="240"
            y1="110"
            x2={d.x}
            y2={d.y}
            stroke={MUTED}
            strokeWidth={HAIRLINE}
            opacity="0.4"
          />
        ))}
        {/* Centre - the subject */}
        <circle cx="240" cy="110" r="6" fill={FG} />
        {/* Orbiting data dots */}
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="5" fill={ACCENT} opacity="0.75" />
        ))}
      </svg>
    </DiagramFrame>
  );
}

/* P7 - For learners, the struggle is the point.
   Two paths from base to a peak. The shorter bypass path is a straight
   line; the longer climb path has hairpins and passes through a small
   accent dot midway (the moment of realisation). The peak is the same. */
export function P7GuideNotAnswer() {
  return (
    <DiagramFrame caption="Both paths reach the peak. Only one grows the climber.">
      <svg viewBox="0 0 480 240" className="w-full max-w-[480px]" role="img" aria-label="Two paths from base to a peak - a short bypass and a longer climb with hairpins that passes through a moment of realisation.">
        {/* Base */}
        <circle cx="120" cy="200" r="4" fill={FG} />
        <text x="120" y="222" textAnchor="middle" fontSize="10" fill={MUTED} fontStyle="italic" opacity="0.65">start</text>
        {/* Peak */}
        <circle cx="360" cy="70" r="5" fill={FG} />
        <text x="360" y="55" textAnchor="middle" fontSize="10" fill={MUTED} fontStyle="italic" opacity="0.65">peak</text>
        {/* Bypass path - straight, thin */}
        <line x1="124" y1="197" x2="356" y2="73" stroke={MUTED} strokeWidth={HAIRLINE} opacity="0.35" strokeDasharray="3 3" />
        {/* Climb path - with two hairpins */}
        <path
          d="M 124 197 L 200 197 L 200 130 L 280 130 L 280 70 L 356 70"
          stroke={ACCENT}
          strokeWidth={ACCENT_STROKE}
          fill="none"
          strokeLinejoin="round"
        />
        {/* Moment of realisation - midway on climb */}
        <circle cx="240" cy="130" r="4" fill={ACCENT} />
      </svg>
    </DiagramFrame>
  );
}

/* P8 - The worst-served user sets the standard.
   A row of circles at different heights. The lowest raises a single
   horizontal bar that everyone must meet. */
export function P8RangeNotAverage() {
  const heights = [90, 70, 130, 60, 80];
  const lowest = Math.max(...heights); // largest y = lowest position
  return (
    <DiagramFrame caption="Hold the bar at the lowest, not the average.">
      <svg viewBox="0 0 480 220" className="w-full max-w-[480px]" role="img" aria-label="Five circles at different heights; the lowest raises a horizontal bar all must meet.">
        {/* Bar held by the lowest */}
        <line x1="80" y1={lowest} x2="400" y2={lowest} stroke={ACCENT} strokeWidth={HAIRLINE} strokeDasharray="4 4" opacity="0.7" />
        {/* Circles */}
        {heights.map((h, i) => {
          const isLowest = h === lowest;
          return (
            <g key={i}>
              {/* Vertical stem from circle down to baseline */}
              <line x1={110 + i * 60} y1={h} x2={110 + i * 60} y2="180" stroke={MUTED} strokeWidth={HAIRLINE} opacity="0.3" />
              <circle
                cx={110 + i * 60}
                cy={h}
                r="8"
                fill={isLowest ? ACCENT : "none"}
                stroke={isLowest ? ACCENT : MUTED}
                strokeWidth={HAIRLINE}
                opacity={isLowest ? 1 : 0.55}
              />
            </g>
          );
        })}
        {/* Baseline */}
        <line x1="80" y1="180" x2="400" y2="180" stroke={MUTED} strokeWidth={HAIRLINE} opacity="0.4" />
      </svg>
    </DiagramFrame>
  );
}

/* P9 - AI is a tool, not a companion.
   A single hairline hand-and-pen silhouette. Object shapes, no face. */
export function P9HonestIdentity() {
  return (
    <DiagramFrame caption="An object in the hand. Not a face in the room.">
      <svg viewBox="0 0 480 240" className="w-full max-w-[480px]" role="img" aria-label="A hairline drawing of a hand holding a pen - an object, not a face.">
        {/* Pen shaft */}
        <line x1="260" y1="60" x2="180" y2="160" stroke={ACCENT} strokeWidth={ACCENT_STROKE} strokeLinecap="round" />
        {/* Pen tip */}
        <path d="M 180 160 L 170 178 L 174 168 Z" fill={ACCENT} stroke={ACCENT} strokeWidth={HAIRLINE} strokeLinejoin="round" />
        {/* Hand - a simple curve suggesting a grip, no fingers */}
        <path
          d="M 240 110 Q 260 130 250 160 Q 240 180 220 180 Q 200 180 195 170"
          stroke={FG}
          strokeWidth={HAIRLINE}
          fill="none"
          strokeLinecap="round"
        />
        {/* Wrist */}
        <path
          d="M 195 170 Q 200 195 220 205"
          stroke={FG}
          strokeWidth={HAIRLINE}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </DiagramFrame>
  );
}

/* P10 - Attention is a duty, not a currency.
   Two hairline vessels side by side. Left: a jar, filled slowly by a
   trickle from above (attention as care). Right: a spiralling drain
   with an arrow accelerating inward (attention as extracted metric). */
export function P10NoEngagement() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  // jar fills slowly and empties on cycle
  const jarCycle = (t % 12) / 12;
  const fillLevel = reduced ? 0.5 : jarCycle;
  const fillY = 170 - fillLevel * 60;
  const dropY = reduced ? 100 : 60 + ((t * 30) % 55);
  const spiralRotate = reduced ? 0 : (t * 30) % 360;
  return (
    <DiagramFrame caption="One fills patiently. The other accelerates.">
      <svg viewBox="0 0 480 240" className="w-full max-w-[480px]" role="img" aria-label="A jar being filled slowly by a trickle from above, beside a rotating spiralling drain accelerating inward.">
        {/* Left: jar */}
        <g transform="translate(140 100)">
          {/* Trickle - falling drop */}
          <circle cx="0" cy={dropY - 100} r="2.5" fill={ACCENT} opacity="0.8" />
          {/* Jar outline */}
          <path
            d="M -30 20 L -30 80 Q -30 95 -15 95 L 15 95 Q 30 95 30 80 L 30 20"
            stroke={FG}
            strokeWidth={HAIRLINE}
            fill="none"
            strokeLinejoin="round"
          />
          <line x1="-35" y1="20" x2="35" y2="20" stroke={FG} strokeWidth={HAIRLINE} strokeLinecap="round" />
          {/* Fill level */}
          <path
            d={`M -28 ${fillY - 100} L 28 ${fillY - 100} L 28 78 Q 28 93 15 93 L -15 93 Q -28 93 -28 78 Z`}
            fill={ACCENT}
            opacity="0.2"
          />
        </g>
        <text x="140" y="215" textAnchor="middle" fontSize="10" fill={MUTED} fontStyle="italic" opacity="0.65">attention as care</text>
        {/* Divider */}
        <line x1="240" y1="50" x2="240" y2="200" stroke={MUTED} strokeWidth={HAIRLINE} strokeDasharray="2 4" opacity="0.3" />
        {/* Right: spiral drain */}
        <g transform={`translate(340 130) rotate(${spiralRotate})`}>
          <path
            d="M 0 0
               m -50 0
               a 50 50 0 1 1 100 0
               a 40 40 0 1 0 -80 0
               a 30 30 0 1 1 60 0
               a 20 20 0 1 0 -40 0
               a 10 10 0 1 1 20 0"
            stroke="var(--danger)"
            strokeWidth={HAIRLINE}
            fill="none"
            strokeLinecap="round"
          />
        </g>
        <text x="340" y="215" textAnchor="middle" fontSize="10" fill="var(--danger)" fontStyle="italic" opacity="0.7">attention as metric</text>
      </svg>
    </DiagramFrame>
  );
}
