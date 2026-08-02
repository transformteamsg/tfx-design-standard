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

/* Easing helpers. Sine-based; no bounce, no elastic - matches the Ma
   aesthetic. */
const TAU = Math.PI * 2;
// Smooth 0→1→0 breath curve using half-sine.
const breathe = (phase: number) => (1 - Math.cos(phase * TAU)) / 2;
// Ease in-out sine for a value going 0→1.
const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;

/* All ten pieces share this frame. Extreme padding, subtle border, no
   inner surface change - the SVG breathes on the same paper. */
function DiagramFrame({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <figure className="not-prose my-8 rounded-lg border border-border bg-surface p-12">
      <div className="flex items-center justify-center">{children}</div>
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

/* P1 - We use AI only when nothing simpler will do.
   A vertical stack of five thin rules (fixed rule, form, filter, script,
   AI). Only AI carries the accent, at the top of the stack, reached last.
   Motion: a faint reading-cursor breathes down the list, resting each time
   on the AI line - "considered last". */
export function P1UseAIOnly() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  const labels = ["fixed rule", "form field", "filter", "script", "AI"];
  // 14s cycle, slow scan down the list
  const cycle = (t % 14) / 14;
  const eased = easeInOutSine(cycle);
  const cursorIndex = Math.min(labels.length - 1, Math.floor(eased * labels.length));
  return (
    <DiagramFrame caption="Reach for the simplest tool that solves the job.">
      <svg viewBox="0 0 480 240" className="w-full max-w-[480px]" role="img" aria-label="A vertical stack of five options: fixed rule, form field, filter, script, and AI. AI sits at the top, reached last.">
        {labels.map((label, i) => {
          const y = 60 + i * 30;
          const isAI = i === labels.length - 1;
          const isCursor = !reduced && i === cursorIndex;
          return (
            <g key={label}>
              {isCursor && (
                <circle cx="130" cy={y} r="3" fill={MUTED} opacity="0.5" />
              )}
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

/* P2 - We make every AI output visibly AI.
   A single text-line drawn as one continuous stroke, with a small hairline
   circle bonded to its start. The mark and the content are one line - the
   mark cannot be peeled off. Motion: the mark gently breathes so the eye
   returns to it. */
export function P2MarkOutput() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  // 6s breath cycle
  const phase = (t % 6) / 6;
  const scale = reduced ? 1 : 0.9 + breathe(phase) * 0.25;
  const glow = reduced ? 0.75 : 0.6 + breathe(phase) * 0.35;
  return (
    <DiagramFrame caption="The mark and the content are one composition.">
      <svg viewBox="0 0 480 200" className="w-full max-w-[480px]" role="img" aria-label="A hairline text line with a small marked node bonded to its start; the mark and the content are one shape.">
        <line x1="140" y1="80" x2="360" y2="80" stroke={MUTED} strokeWidth={HAIRLINE} strokeLinecap="round" opacity="0.4" />
        <g>
          {/* soft halo, breathing */}
          <circle cx="130" cy="105" r={5 + scale * 3} fill={ACCENT} opacity={glow * 0.2} />
          <circle cx="130" cy="105" r="5" fill={ACCENT} opacity={glow} />
          <line x1="140" y1="105" x2="360" y2="105" stroke={ACCENT} strokeWidth={ACCENT_STROKE} strokeLinecap="round" />
        </g>
        <line x1="140" y1="130" x2="320" y2="130" stroke={MUTED} strokeWidth={HAIRLINE} strokeLinecap="round" opacity="0.4" />
      </svg>
    </DiagramFrame>
  );
}

/* P3 - We back every claim with a source.
   A short claim card above, a source card below, connected by a single
   quiet arc. Motion: the arc slowly draws in from the claim to the source,
   holds, then resets - the tether re-affirms itself. */
export function P3OpenSource() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  // 8s cycle: 0-0.6 draw, 0.6-0.9 hold, 0.9-1 fade to redraw
  const cycle = (t % 8) / 8;
  let drawProgress = 1;
  if (!reduced) {
    if (cycle < 0.6) drawProgress = easeInOutSine(cycle / 0.6);
    else if (cycle < 0.9) drawProgress = 1;
    else drawProgress = 1 - (cycle - 0.9) / 0.1;
  }
  const pathLen = 110;
  const dashOffset = pathLen * (1 - drawProgress);
  const anchorOpacity = reduced ? 1 : Math.max(0, drawProgress - 0.1);
  return (
    <DiagramFrame caption="Every claim, tethered to its source.">
      <svg viewBox="0 0 480 260" className="w-full max-w-[480px]" role="img" aria-label="A claim card above connected by a single arc to a source card below.">
        {/* Claim card - a short quoted line */}
        <g transform="translate(150 60)">
          <rect x="0" y="0" width="180" height="48" rx="8" fill="none" stroke={FG} strokeWidth={HAIRLINE} />
          <line x1="16" y1="20" x2="164" y2="20" stroke={FG} strokeWidth={HAIRLINE} strokeLinecap="round" opacity="0.55" />
          <line x1="16" y1="32" x2="120" y2="32" stroke={FG} strokeWidth={HAIRLINE} strokeLinecap="round" opacity="0.55" />
          <text x="8" y="14" fontSize="14" fill={ACCENT}>&ldquo;</text>
        </g>
        {/* Tether arc - progressively drawn */}
        <path
          d="M 240 108 Q 200 155 220 195"
          stroke={ACCENT}
          strokeWidth={HAIRLINE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={pathLen}
          strokeDashoffset={dashOffset}
        />
        <circle cx="220" cy="195" r="3" fill={ACCENT} opacity={anchorOpacity} />
        {/* Source card */}
        <g transform="translate(220 195)">
          <path
            d="M 0 0 L 82 0 L 100 18 L 100 54 L 0 54 Z"
            fill="none"
            stroke={ACCENT}
            strokeWidth={HAIRLINE}
            strokeLinejoin="round"
          />
          <path
            d="M 82 0 L 82 18 L 100 18"
            fill="none"
            stroke={ACCENT}
            strokeWidth={HAIRLINE}
            strokeLinejoin="round"
          />
          <line x1="14" y1="30" x2="70" y2="30" stroke={ACCENT} strokeWidth={HAIRLINE} strokeLinecap="round" opacity="0.55" />
          <line x1="14" y1="40" x2="56" y2="40" stroke={ACCENT} strokeWidth={HAIRLINE} strokeLinecap="round" opacity="0.55" />
        </g>
      </svg>
    </DiagramFrame>
  );
}

/* P4 - We catch what our users cannot see.
   An inner arc (the user's field of view) inside a wider arc (the system's
   catch). Motion: both arcs breathe together at slightly different phases -
   the outer holds a beat longer, the way a safety net does. */
export function P4RecoveryNet() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  const phaseInner = (t % 7) / 7;
  const phaseOuter = ((t + 1.4) % 7) / 7;
  const innerOp = reduced ? 0.55 : 0.35 + breathe(phaseInner) * 0.35;
  const outerOp = reduced ? 1 : 0.7 + breathe(phaseOuter) * 0.3;
  return (
    <DiagramFrame caption="Two arcs of care - the outer catches what the inner cannot see.">
      <svg viewBox="0 0 480 240" className="w-full max-w-[480px]" role="img" aria-label="A narrow inner arc labelled user field of view, contained inside a wider outer arc labelled system catch.">
        <circle cx="240" cy="200" r="3" fill={FG} />
        <path
          d="M 175 140 A 80 80 0 0 1 305 140"
          stroke={MUTED}
          strokeWidth={HAIRLINE}
          fill="none"
          strokeLinecap="round"
          opacity={innerOp}
        />
        <path
          d="M 110 130 A 140 140 0 0 1 370 130"
          stroke={ACCENT}
          strokeWidth={ACCENT_STROKE}
          fill="none"
          strokeLinecap="round"
          opacity={outerOp}
        />
        <text x="240" y="220" textAnchor="middle" fontSize="10" fill={MUTED} fontStyle="italic" opacity="0.65">user</text>
      </svg>
    </DiagramFrame>
  );
}

/* P5 - We act only with consent.
   Two hairline circles separated by a small key-notch on the threshold
   between them. A pulse of light drifts from left, eases to a stop at
   the notch, waits, fades. Never crosses. */
export function P5SilentWriteGate() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  // 6s cycle: 0-0.55 drift in (ease-out), 0.55-0.85 hold, 0.85-1 fade
  const cycle = (t % 6) / 6;
  let progress = 1;
  let alpha = 0.7;
  if (!reduced) {
    if (cycle < 0.55) {
      progress = easeInOutSine(cycle / 0.55);
      alpha = 0.35 + progress * 0.45;
    } else if (cycle < 0.85) {
      progress = 1;
      alpha = 0.8;
    } else {
      progress = 1;
      alpha = 0.8 * (1 - (cycle - 0.85) / 0.15);
    }
  }
  const pulseX = 160 + progress * 82; // stops just before the notch at 250
  return (
    <DiagramFrame caption="Nothing crosses without the key.">
      <svg viewBox="0 0 480 200" className="w-full max-w-[480px]" role="img" aria-label="Two circles separated by a threshold with a key-notch gate; a pulse of light stops at the notch.">
        <circle cx="150" cy="100" r="34" fill="none" stroke={ACCENT} strokeWidth={HAIRLINE} />
        <line x1="250" y1="50" x2="250" y2="150" stroke={MUTED} strokeWidth={HAIRLINE} strokeDasharray="2 4" opacity="0.4" />
        <g transform="translate(250 100)">
          <circle cx="0" cy="0" r="6" fill="none" stroke={FG} strokeWidth={HAIRLINE} />
          <line x1="0" y1="6" x2="0" y2="14" stroke={FG} strokeWidth={HAIRLINE} strokeLinecap="round" />
        </g>
        <circle cx="350" cy="100" r="34" fill="none" stroke={MUTED} strokeWidth={HAIRLINE} opacity="0.55" />
        {/* soft halo */}
        <circle cx={pulseX} cy="100" r="8" fill={ACCENT} opacity={alpha * 0.15} />
        <circle cx={pulseX} cy="100" r="4" fill={ACCENT} opacity={alpha} />
      </svg>
    </DiagramFrame>
  );
}

/* P6 - We hold user data in trust.
   Three small dots orbit a still centre point; hairline strings tether
   them to it. Very slow orbit, subtle radius breath. */
export function P6DataControl() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  // Very slow orbit (~30s per revolution) with gentle radius breath
  const orbit = (i: number) => {
    const angle = reduced ? i * 2.1 : t * 0.21 + i * 2.09;
    const breathPhase = ((t + i * 1.3) % 9) / 9;
    const r = reduced ? 70 : 64 + breathe(breathPhase) * 12;
    return {
      x: 240 + Math.cos(angle) * r,
      y: 110 + Math.sin(angle) * r,
    };
  };
  const dots = [orbit(0), orbit(1), orbit(2)];
  return (
    <DiagramFrame caption="Always tethered. Always pullable.">
      <svg viewBox="0 0 480 220" className="w-full max-w-[480px]" role="img" aria-label="Three small dots orbiting a still centre, each tethered by a hairline string.">
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
        <circle cx="240" cy="110" r="6" fill={FG} />
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="5" fill={ACCENT} opacity="0.75" />
        ))}
      </svg>
    </DiagramFrame>
  );
}

/* P7 - We help learners think, not think for them.
   Two paths from base to a peak. The shorter bypass path is a straight
   line; the longer climb path has hairpins and passes through a small
   accent dot midway (the moment of realisation). A walker eases along
   the climb path, pausing at the moment of realisation. */
export function P7GuideNotAnswer() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  // 10s cycle along the climb path
  const cycle = (t % 10) / 10;
  // Insert a pause at the realisation point (midway, s=0.5)
  let s = easeInOutSine(cycle);
  const pauseCenter = 0.5;
  const pauseWidth = 0.08;
  if (!reduced && s > pauseCenter - pauseWidth && s < pauseCenter + pauseWidth) {
    s = pauseCenter;
  }
  // Piecewise path segments (5 legs of the climb)
  const legs = [
    { x1: 124, y1: 197, x2: 200, y2: 197 },
    { x1: 200, y1: 197, x2: 200, y2: 130 },
    { x1: 200, y1: 130, x2: 280, y2: 130 },
    { x1: 280, y1: 130, x2: 280, y2: 70 },
    { x1: 280, y1: 70, x2: 356, y2: 70 },
  ];
  const legLens = legs.map((l) => Math.abs(l.x2 - l.x1) + Math.abs(l.y2 - l.y1));
  const totalLen = legLens.reduce((a, b) => a + b, 0);
  let target = s * totalLen;
  let walker = { x: 124, y: 197 };
  for (let i = 0; i < legs.length; i++) {
    if (target <= legLens[i]) {
      const f = legLens[i] === 0 ? 0 : target / legLens[i];
      walker = {
        x: legs[i].x1 + (legs[i].x2 - legs[i].x1) * f,
        y: legs[i].y1 + (legs[i].y2 - legs[i].y1) * f,
      };
      break;
    }
    target -= legLens[i];
  }
  // Highlight the realisation dot when the walker is near it
  const nearRealisation = Math.abs(s - pauseCenter) < pauseWidth + 0.02;
  const realisationScale = reduced ? 1 : nearRealisation ? 1.5 : 1;
  return (
    <DiagramFrame caption="Both paths reach the peak. Only one grows the climber.">
      <svg viewBox="0 0 480 240" className="w-full max-w-[480px]" role="img" aria-label="Two paths from base to a peak - a short bypass and a longer climb with hairpins that passes through a moment of realisation.">
        <circle cx="120" cy="200" r="4" fill={FG} />
        <text x="120" y="222" textAnchor="middle" fontSize="10" fill={MUTED} fontStyle="italic" opacity="0.65">start</text>
        <circle cx="360" cy="70" r="5" fill={FG} />
        <text x="360" y="55" textAnchor="middle" fontSize="10" fill={MUTED} fontStyle="italic" opacity="0.65">peak</text>
        <line x1="124" y1="197" x2="356" y2="73" stroke={MUTED} strokeWidth={HAIRLINE} opacity="0.35" strokeDasharray="3 3" />
        <path
          d="M 124 197 L 200 197 L 200 130 L 280 130 L 280 70 L 356 70"
          stroke={ACCENT}
          strokeWidth={ACCENT_STROKE}
          fill="none"
          strokeLinejoin="round"
        />
        <circle cx="240" cy="130" r={4 * realisationScale} fill={ACCENT} opacity={nearRealisation ? 1 : 0.7} />
        {!reduced && (
          <circle cx={walker.x} cy={walker.y} r="4" fill={FG} />
        )}
      </svg>
    </DiagramFrame>
  );
}

/* P8 - We hold our standard to the worst-served user.
   A row of circles at different heights. The lowest raises a single
   horizontal bar that everyone must meet. Motion: each circle breathes
   very gently at low amplitude on its own phase, while the lowest circle
   holds a slow pulse to show it as the anchor. */
export function P8RangeNotAverage() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  const baseHeights = [90, 70, 130, 60, 80];
  const heights = baseHeights.map((h, i) => {
    if (reduced) return h;
    const phase = ((t + i * 1.7) % 9) / 9;
    return h + (breathe(phase) - 0.5) * 4; // ±2px, imperceptible flutter
  });
  const lowestIndex = baseHeights.indexOf(Math.max(...baseHeights));
  const lowest = heights[lowestIndex];
  const pulsePhase = (t % 5) / 5;
  const anchorGlow = reduced ? 1 : 0.65 + breathe(pulsePhase) * 0.35;
  return (
    <DiagramFrame caption="Hold the bar at the lowest, not the average.">
      <svg viewBox="0 0 480 220" className="w-full max-w-[480px]" role="img" aria-label="Five circles at different heights; the lowest raises a horizontal bar all must meet.">
        <line x1="80" y1={lowest} x2="400" y2={lowest} stroke={ACCENT} strokeWidth={HAIRLINE} strokeDasharray="4 4" opacity="0.7" />
        {heights.map((h, i) => {
          const isLowest = i === lowestIndex;
          return (
            <g key={i}>
              <line x1={110 + i * 60} y1={h} x2={110 + i * 60} y2="180" stroke={MUTED} strokeWidth={HAIRLINE} opacity="0.3" />
              {isLowest && (
                <circle cx={110 + i * 60} cy={h} r={12} fill={ACCENT} opacity={anchorGlow * 0.15} />
              )}
              <circle
                cx={110 + i * 60}
                cy={h}
                r="8"
                fill={isLowest ? ACCENT : "none"}
                stroke={isLowest ? ACCENT : MUTED}
                strokeWidth={HAIRLINE}
                opacity={isLowest ? anchorGlow : 0.55}
              />
            </g>
          );
        })}
        <line x1="80" y1="180" x2="400" y2="180" stroke={MUTED} strokeWidth={HAIRLINE} opacity="0.4" />
      </svg>
    </DiagramFrame>
  );
}

/* P9 - We build a tool, not a companion.
   Two objects side by side. Left, in accent: a plain hammer - a tool.
   Right, in muted dashed line: a face silhouette (circle + two eye dots +
   mouth arc), crossed through. Says "we ship the shape on the left, not
   the one on the right." */
export function P9HonestIdentity() {
  return (
    <DiagramFrame caption="We ship the shape on the left. Never the one on the right.">
      <svg viewBox="0 0 480 240" className="w-full max-w-[480px]" role="img" aria-label="A hammer on the left in accent colour; a dashed face silhouette on the right, crossed through.">
        {/* Left: hammer */}
        <g transform="translate(140 120)">
          {/* Head - a solid rounded rectangle */}
          <rect x="-40" y="-40" width="70" height="26" rx="4" fill="none" stroke={ACCENT} strokeWidth={ACCENT_STROKE} strokeLinejoin="round" />
          {/* Small claw indent */}
          <path d="M -40 -30 L -46 -20 L -40 -20" fill="none" stroke={ACCENT} strokeWidth={ACCENT_STROKE} strokeLinejoin="round" />
          {/* Handle */}
          <line x1="0" y1="-14" x2="24" y2="60" stroke={ACCENT} strokeWidth={ACCENT_STROKE} strokeLinecap="round" />
          {/* Grip end - tiny cap */}
          <line x1="20" y1="58" x2="30" y2="62" stroke={ACCENT} strokeWidth={ACCENT_STROKE} strokeLinecap="round" />
        </g>
        <text x="140" y="220" textAnchor="middle" fontSize="10" fill={ACCENT} fontStyle="italic" opacity="0.85">tool</text>
        {/* Divider */}
        <line x1="240" y1="60" x2="240" y2="200" stroke={MUTED} strokeWidth={HAIRLINE} strokeDasharray="2 4" opacity="0.3" />
        {/* Right: face silhouette, muted and crossed out */}
        <g transform="translate(340 120)">
          <circle cx="0" cy="0" r="44" fill="none" stroke={MUTED} strokeWidth={HAIRLINE} strokeDasharray="4 4" opacity="0.55" />
          {/* Eyes */}
          <circle cx="-15" cy="-8" r="2.5" fill={MUTED} opacity="0.55" />
          <circle cx="15" cy="-8" r="2.5" fill={MUTED} opacity="0.55" />
          {/* Smile */}
          <path d="M -14 12 Q 0 22 14 12" fill="none" stroke={MUTED} strokeWidth={HAIRLINE} strokeLinecap="round" opacity="0.55" />
          {/* Crossed out - one clean diagonal */}
          <line x1="-40" y1="40" x2="40" y2="-40" stroke={MUTED} strokeWidth={HAIRLINE} strokeLinecap="round" opacity="0.6" />
        </g>
        <text x="340" y="220" textAnchor="middle" fontSize="10" fill={MUTED} fontStyle="italic" opacity="0.55">not a face</text>
      </svg>
    </DiagramFrame>
  );
}

/* P10 - We treat time as entrusted, not extracted.
   Two hairline vessels side by side. Left: a jar, filled patiently by a
   trickle from above (attention as care). Right: a spiral that turns with
   accelerating rhythm (attention as extracted metric). */
export function P10NoEngagement() {
  const reduced = useReducedMotion();
  const t = useTime(!reduced);
  // Jar cycle - 18s slow fill, then drain
  const jarPhase = (t % 18) / 18;
  const fillLevel = reduced ? 0.5 : breathe(jarPhase);
  const fillY = 170 - fillLevel * 60;
  // Trickle - a soft drop falling, easing in on gravity
  const dropCycle = reduced ? 0.5 : (t % 2.5) / 2.5;
  const dropY = reduced ? 100 : 60 + easeInOutSine(dropCycle) * 55;
  const dropOpacity = reduced ? 0.8 : 0.9 * (1 - dropCycle * 0.4);
  // Spiral - accelerating rotation with easing so it never feels mechanical
  const spinPhase = (t % 6) / 6;
  const spiralRotate = reduced ? 0 : easeInOutSine(spinPhase) * 360;
  return (
    <DiagramFrame caption="One fills patiently. The other accelerates.">
      <svg viewBox="0 0 480 240" className="w-full max-w-[480px]" role="img" aria-label="A jar being filled slowly by a trickle from above, beside a rotating spiralling drain accelerating inward.">
        {/* Left: jar */}
        <g transform="translate(140 100)">
          <circle cx="0" cy={dropY - 100} r="2.5" fill={ACCENT} opacity={dropOpacity} />
          <path
            d="M -30 20 L -30 80 Q -30 95 -15 95 L 15 95 Q 30 95 30 80 L 30 20"
            stroke={FG}
            strokeWidth={HAIRLINE}
            fill="none"
            strokeLinejoin="round"
          />
          <line x1="-35" y1="20" x2="35" y2="20" stroke={FG} strokeWidth={HAIRLINE} strokeLinecap="round" />
          <path
            d={`M -28 ${fillY - 100} L 28 ${fillY - 100} L 28 78 Q 28 93 15 93 L -15 93 Q -28 93 -28 78 Z`}
            fill={ACCENT}
            opacity="0.2"
          />
        </g>
        <text x="140" y="215" textAnchor="middle" fontSize="10" fill={MUTED} fontStyle="italic" opacity="0.65">attention as care</text>
        <line x1="240" y1="50" x2="240" y2="200" stroke={MUTED} strokeWidth={HAIRLINE} strokeDasharray="2 4" opacity="0.3" />
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
