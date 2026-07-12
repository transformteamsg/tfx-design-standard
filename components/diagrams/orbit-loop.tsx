"use client";

/* The design loop drawn as a loop: six phases on a ring, two human gates, a
   travelling dot that pauses where the loop pauses — at the gates. The SVG is
   decorative (aria-hidden); the semantics live in an HTML tablist overlaid on
   the nodes (APG Tabs, automatic activation) and a tabpanel that carries each
   phase's detail from loop-data.ts.

   Controls this component answers to:
   - MOT-3: the numbered ring communicates order and gates without motion;
     under reduced motion the dot is not rendered and nothing is lost.
   - MOT-1/2 + SLP-8: interface transitions use DUR/EASE tokens, spring-free.
     The dot's revolution is ambient narrative choreography (its numbers are
     named constants below, its easings are the token curves).
   - A11Y-2/4: real 44px buttons with the house focus ring; A11Y-5: reduced
     motion drops the dot and makes every transition instant.
   - TOK-1: every colour is a token. */

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { DUR, EASE_IN_OUT, EASE_OUT } from "@/lib/motion";
import { LOOP_PHASES } from "./loop-data";

/* ── Geometry: ring r=170 centred in a 480 viewBox, phase 1 at 12 o'clock,
   clockwise. Everything else is derived from these. ── */
const C = 240;
const R = 170;
const NODE_R = 17;
const GATE_RING_R = 22.5;
const VIEW = 480;

const rad = (deg: number) => (deg * Math.PI) / 180;
const POS = LOOP_PHASES.map((_, i) => ({
  deg: i * 60,
  x: C + R * Math.sin(rad(i * 60)),
  y: C - R * Math.cos(rad(i * 60)),
}));

/* Label blocks sit outside the ring, anchored per quadrant: centred above and
   below for the 12 and 6 o'clock nodes, hugging the viewBox edge for the four
   diagonal nodes (the corner zones beyond the arc are the only place their
   text fits at 360px without crossing the ring). Chips only exist on the two
   gates, which both sit on the bottom diagonals. */
type LabelSpot = {
  anchor: "start" | "middle" | "end";
  x: number;
  labelY: number;
  noteY: number;
  chipY?: number; // vertical centre of the gate chip
  chipW?: number;
};
const SPOTS: LabelSpot[] = [
  { anchor: "middle", x: C, labelY: 30, noteY: 45 }, // Intent (top)
  { anchor: "end", x: 474, labelY: 112, noteY: 127 }, // Diverge (top right)
  { anchor: "end", x: 474, labelY: 364, chipY: 381, chipW: 76, noteY: 400 }, // Plan
  { anchor: "middle", x: C, labelY: 447, noteY: 462 }, // Implement (bottom)
  { anchor: "start", x: 6, labelY: 364, chipY: 381, chipW: 104, noteY: 400 }, // Verify
  { anchor: "start", x: 6, labelY: 112, noteY: 127 }, // Ratchet (top left)
];

/* ── Ambient choreography (plan 017): one revolution ≈ 36s, dwelling at the
   two gates — the motion itself says "the loop stops for humans". The cycle
   starts and ends at the Plan gate (120° and 480° are the same angle), so the
   infinite repeat is seamless and velocity-continuous: ease into a stop, hold,
   ease out. Travel easing is the token in-out curve; no springs (SLP-8).
   These seconds are narrative pacing for an ambient diagram, not interface
   motion, so they live here as named constants rather than in the MOT-2
   token scale (which caps at 600ms). ── */
const ORBIT_S = 36;
const DWELL_PLAN_S = 1.6;
const DWELL_VERIFY_S = 1.2;
const PLAN_DEG = 120;
const VERIFY_DEG = 240;
const START_TRANSFORM = `rotate(${PLAN_DEG} ${C} ${C})`;

const TRAVEL_S = ORBIT_S - DWELL_PLAN_S - DWELL_VERIFY_S;
const KEYFRAMES = [PLAN_DEG, PLAN_DEG, VERIFY_DEG, VERIFY_DEG, PLAN_DEG + 360];
const TIMES = [
  0,
  DWELL_PLAN_S / ORBIT_S,
  (DWELL_PLAN_S + TRAVEL_S / 3) / ORBIT_S, // Plan→Verify is 120° of the 360°
  (DWELL_PLAN_S + TRAVEL_S / 3 + DWELL_VERIFY_S) / ORBIT_S,
  1,
];
const EASES = ["linear", EASE_IN_OUT, "linear", EASE_IN_OUT] as const;

export function OrbitLoop({ variant = "full" }: { variant?: "full" | "inline" }) {
  // === true: hydration null must not skip the animation
  const reduced = useReducedMotion() === true;
  const uid = useId();
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focusWithin, setFocusWithin] = useState(false);
  const [pointerDown, setPointerDown] = useState(false);

  const rootRef = useRef<HTMLElement | null>(null);
  const dotRef = useRef<SVGGElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const spinRef = useRef<ReturnType<typeof animate> | null>(null);
  const pausedRef = useRef(false);

  const inView = useInView(rootRef, { once: true, amount: 0.2 });
  const angle = useMotionValue(PLAN_DEG);
  useMotionValueEvent(angle, "change", (a) => {
    dotRef.current?.setAttribute("transform", `rotate(${a} ${C} ${C})`);
  });

  /* Start the revolution once the diagram is on screen; never under reduced
     motion (the dot is not even rendered then — MOT-3 holds statically). */
  useEffect(() => {
    if (reduced || !inView) return;
    const controls = animate(angle, KEYFRAMES, {
      duration: ORBIT_S,
      times: TIMES,
      ease: EASES as unknown as typeof EASE_IN_OUT[],
      repeat: Infinity,
    });
    spinRef.current = controls;
    if (pausedRef.current) controls.pause();
    return () => {
      controls.stop();
      spinRef.current = null;
    };
  }, [reduced, inView, angle]);

  /* No competing motion while the reader is engaged: pointer down on a node or
     focus anywhere in the tablist parks the dot; it resumes afterwards. */
  const paused = focusWithin || pointerDown;
  useEffect(() => {
    pausedRef.current = paused;
    const controls = spinRef.current;
    if (!controls) return;
    if (paused) controls.pause();
    else controls.play();
  }, [paused]);

  useEffect(() => {
    if (!pointerDown) return;
    const release = () => setPointerDown(false);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [pointerDown]);

  const count = LOOP_PHASES.length;
  const tabId = (id: string) => `${uid}-tab-${id}`;
  const panelId = `${uid}-panel`;
  const phase = LOOP_PHASES[selected];

  function selectAndFocus(i: number) {
    setSelected(i);
    tabRefs.current[i]?.focus();
  }

  function onTablistKeyDown(e: React.KeyboardEvent) {
    const next: number | undefined = {
      ArrowRight: (selected + 1) % count,
      ArrowDown: (selected + 1) % count,
      ArrowLeft: (selected + count - 1) % count,
      ArrowUp: (selected + count - 1) % count,
      Home: 0,
      End: count - 1,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    selectAndFocus(next);
  }

  const colorTransition = reduced ? "" : " transition-colors duration-(--motion-fast)";

  const ring = (
    <div
      className={
        variant === "full"
          ? "relative mx-auto w-full max-w-[480px]"
          : "relative mx-auto w-full max-w-[320px]"
      }
    >
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="block h-auto w-full" aria-hidden="true">
        {/* the track */}
        <circle cx={C} cy={C} r={R} className="fill-none stroke-border" strokeWidth={1.5} />

        {/* centre wordmark */}
        <text
          x={C}
          y={234}
          textAnchor="middle"
          className="fill-foreground font-display text-[20px] font-semibold"
        >
          the loop
        </text>
        <text x={C} y={258} textAnchor="middle" className="fill-muted-foreground text-[12.5px]">
          intent without loss
        </text>

        {/* phase nodes */}
        {LOOP_PHASES.map((p, i) => {
          const { x, y } = POS[i];
          const isSelected = i === selected;
          const isHovered = i === hovered;
          return (
            <g key={p.id}>
              {p.gate && (
                <circle
                  cx={x}
                  cy={y}
                  r={GATE_RING_R}
                  className="fill-none stroke-tw-blue"
                  strokeWidth={1.25}
                  strokeOpacity={0.55}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={NODE_R}
                strokeWidth={1.25}
                className={
                  (isSelected
                    ? "fill-tw-blue stroke-tw-blue"
                    : isHovered
                      ? "fill-surface stroke-tw-blue"
                      : "fill-surface stroke-border-strong") + colorTransition
                }
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className={
                  (isSelected ? "fill-surface" : "fill-foreground") +
                  " text-[12.5px] font-semibold" +
                  colorTransition
                }
              >
                {p.n}
              </text>
            </g>
          );
        })}

        {/* labels, notes, gate chips */}
        {LOOP_PHASES.map((p, i) => {
          const s = SPOTS[i];
          const isSelected = i === selected;
          const chipX = s.anchor === "end" ? s.x - (s.chipW ?? 0) : s.x;
          return (
            <g key={p.id}>
              <text
                x={s.x}
                y={s.labelY}
                textAnchor={s.anchor}
                className={
                  (isSelected
                    ? "fill-foreground font-semibold"
                    : "fill-muted-foreground font-medium") +
                  " text-[13px]" +
                  colorTransition
                }
              >
                {p.label}
              </text>
              {p.gate && s.chipY && s.chipW && (
                <>
                  <rect
                    x={chipX}
                    y={s.chipY - 9}
                    width={s.chipW}
                    height={18}
                    rx={9}
                    strokeWidth={1}
                    className={
                      p.gate === "plan"
                        ? "fill-tw-blue stroke-tw-blue"
                        : "fill-surface stroke-tw-blue"
                    }
                  />
                  <text
                    x={chipX + s.chipW / 2}
                    y={s.chipY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={
                      (p.gate === "plan" ? "fill-surface" : "fill-tw-blue") +
                      " text-[11px] font-semibold"
                    }
                  >
                    {p.gateLabel}
                  </text>
                </>
              )}
              <text
                x={s.x}
                y={s.noteY}
                textAnchor={s.anchor}
                className="fill-muted-foreground text-[11.5px]"
              >
                {p.note}
              </text>
            </g>
          );
        })}

        {/* the travelling dot — pure emphasis, absent under reduced motion */}
        {!reduced && (
          <g ref={dotRef} transform={START_TRANSFORM}>
            <circle cx={C} cy={C - R} r={4} className="fill-tw-blue" />
          </g>
        )}
      </svg>

      {/* interactive layer: real buttons over the drawn nodes */}
      <div
        role="tablist"
        aria-label="Design loop phases"
        className="pointer-events-none absolute inset-0"
        onKeyDown={onTablistKeyDown}
        onFocus={() => setFocusWithin(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocusWithin(false);
        }}
      >
        {LOOP_PHASES.map((p, i) => (
          <button
            key={p.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={tabId(p.id)}
            aria-selected={i === selected}
            aria-controls={panelId}
            tabIndex={i === selected ? 0 : -1}
            onClick={() => setSelected(i)}
            onFocus={() => setSelected(i)}
            onPointerDown={() => setPointerDown(true)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className="pointer-events-auto absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
            style={{
              left: `${(POS[i].x / VIEW) * 100}%`,
              top: `${(POS[i].y / VIEW) * 100}%`,
            }}
          >
            <span className="sr-only">
              {p.n}. {p.label}
              {p.gateLabel ? `, ${p.gateLabel}` : ""}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const panel = (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId(phase.id)}
      tabIndex={0}
      className={
        "rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue) " +
        (variant === "full" ? "min-h-[152px] lg:min-h-[264px]" : "min-h-[152px]")
      }
    >
      <motion.div
        key={phase.id}
        initial={reduced ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0 } : { duration: DUR.base, ease: EASE_OUT }}
      >
        <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
          <span className="font-display text-[15px] font-semibold tabular-nums text-tw-blue">
            0{phase.n}
          </span>
          <span className="font-display text-[17px] font-semibold text-foreground">
            {phase.label}
          </span>
          {phase.gate && (
            <span
              className={
                phase.gate === "plan"
                  ? "rounded-full bg-tw-blue px-2 py-0.5 text-[11px] font-semibold text-primary-foreground"
                  : "rounded-full border border-tw-blue px-2 py-0.5 text-[11px] font-semibold text-tw-blue"
              }
            >
              {phase.gateLabel}
            </span>
          )}
        </p>
        <p className="mt-2.5 text-[14px] leading-[1.65] text-(--prose-body)">{phase.detail}</p>
        <p className="mt-3 text-[13px] leading-[1.6] text-muted-foreground">
          <span className="font-semibold text-foreground">You: </span>
          {phase.you}
        </p>
      </motion.div>
    </div>
  );

  return (
    <figure ref={rootRef} className="my-8">
      <div
        className={
          variant === "full"
            ? "grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center"
            : "grid gap-6"
        }
      >
        {ring}
        {panel}
      </div>
      <figcaption className="mt-3 max-w-[52ch] text-[13px] leading-[1.6] text-muted-foreground">
        Select a phase to read what happens there.
        {!reduced && " The dot pauses at the two gates — where the loop waits for you."}
      </figcaption>
    </figure>
  );
}
