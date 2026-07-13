"use client";

/* The ratchet: the catalog only tightens. A horizontal rack of five
   asymmetric teeth — sloped leading edge, vertical trailing edge, the shape
   that physically permits one direction — with a pawl resting against the
   newest tooth. Once in view, the fifth tooth slides in from the right, clicks
   just past its seat as the pawl drops behind it, then settles back against the
   pawl's edge and stops dead. The settle uses token easing — no bounce, no
   spring (SLP-8); the small pre-seat overshoot is a positional click, not bounce.
   The animation ends on exactly the geometry reduced motion renders at once:
   five teeth, pawl seated. Order, the gate, and the rule all live statically
   in the numbered stations and caption below (MOT-3). Colours are tokens only
   (TOK-1); nothing here is interactive, so nothing looks clickable. */

import { motion } from "motion/react";
import { DUR, EASE_IN_OUT, EASE_OUT } from "@/lib/motion";
import { useFlowReveal } from "./flow";

type Station = { label: string; note: string; gate?: boolean };

const stations: Station[] = [
  { label: "A defect escapes to a shipped surface", note: "observed, not speculated" },
  { label: "It becomes a control proposal", note: "with evidence attached" },
  { label: "A design lead approves it", note: "or rejects it, in writing", gate: true },
  { label: "The control enters the catalog", note: "one verifiable statement" },
  { label: "Every future run checks it", note: "the same defect can't escape twice" },
];

/* Tooth centres sit at 10 / 30 / 50 / 70 / 90% of the 600-unit viewBox — the
   centres of the five station columns below, so each tooth reads as its stage. */
const TEETH_X = [60, 180, 300, 420, 540];
const TOOTH = { halfWidth: 24, baseY: 96, peakY: 62 };

/* Asymmetric ratchet tooth: long slope rising left→right to a peak, then a
   vertical trailing edge — the face the pawl blocks. */
function toothPoints(cx: number) {
  const { halfWidth: w, baseY, peakY } = TOOTH;
  return `${cx - w},${baseY} ${cx + w},${peakY} ${cx + w},${baseY}`;
}

/* The pawl pivots at (588, 20); its tip rests at (566, 72), pressed against
   the fifth tooth's vertical edge (x = 564). Rotating +14° swings the tip up
   and clear of the tooth peaks while the new tooth passes underneath. */
const PIVOT = { x: 588, y: 20 };
const TIP = { x: 566, y: 72 };

/* Entry: the fifth tooth starts fully beyond the right edge (+96), overshoots
   its seat by 10 units as the rack clicks forward (−10), rests, then slides
   back to 0 — where its vertical edge meets the pawl tip and stops dead. */
const TOOTH_KEYFRAMES = [96, -10, -10, 0];

const strong = { fill: "var(--border-strong)" } as const;

export function Ratchet() {
  const { ref, reduced, show } = useFlowReveal<HTMLElement>();

  return (
    <figure ref={ref} className="my-8 w-full max-w-[680px]">
      <svg aria-hidden viewBox="0 0 600 104" className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* The rack: a fixed bar and the four teeth already won. */}
        <rect x="16" y="96" width="568" height="4" rx="2" style={strong} />
        {TEETH_X.slice(0, 4).map((cx) => (
          <polygon key={cx} points={toothPoints(cx)} style={strong} />
        ))}

        {/* The fifth tooth: in from the right, past the pawl, blocked on the
            way back. Per-segment easing — entry ease-out, hold, return
            ease-in-out stopping dead at the pawl. */}
        <motion.g
          initial={reduced ? false : { x: TOOTH_KEYFRAMES[0] }}
          animate={
            reduced ? { x: 0 } : show ? { x: TOOTH_KEYFRAMES } : { x: TOOTH_KEYFRAMES[0] }
          }
          transition={
            reduced
              ? { duration: 0 }
              : {
                  duration: DUR.story + 0.4 + DUR.base,
                  delay: 0.15,
                  times: [0, 0.5, 0.8333, 1],
                  ease: [EASE_OUT, "linear", EASE_IN_OUT],
                }
          }
        >
          <polygon points={toothPoints(TEETH_X[4])} style={{ fill: "var(--tw-blue)" }} />
        </motion.g>

        {/* The pawl: clicks up as the tooth passes, drops behind it, and holds
            the line when the tooth tries to come back. */}
        <motion.g
          style={{ transformBox: "view-box", originX: `${PIVOT.x}px`, originY: `${PIVOT.y}px` }}
          initial={reduced ? false : { rotate: 0 }}
          animate={reduced ? { rotate: 0 } : show ? { rotate: [0, 14, 0] } : { rotate: 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: DUR.base * 2, delay: 0.3, times: [0, 0.5, 1], ease: EASE_IN_OUT }
          }
        >
          <line
            x1={PIVOT.x}
            y1={PIVOT.y}
            x2={TIP.x}
            y2={TIP.y}
            style={{ stroke: "var(--tw-blue)" }}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx={PIVOT.x} cy={PIVOT.y} r="4" style={{ fill: "var(--tw-blue)" }} />
        </motion.g>
      </svg>

      <ol className="mt-3 grid list-none grid-cols-1 gap-2 p-0 text-foreground sm:grid-cols-5 sm:gap-0">
        {stations.map((s, i) => (
          <li key={s.label} className="flex items-start gap-2.5 sm:block sm:px-1 sm:text-center">
            <span
              aria-hidden
              className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border text-[11px] font-semibold text-muted-foreground sm:mx-auto sm:mb-1.5"
            >
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-[12px] font-medium leading-snug">{s.label}</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                {s.note}
              </span>
              {s.gate && (
                <span className="mt-1.5 inline-block rounded-full border border-(--tw-blue) px-2 py-0.5 text-[11px] font-semibold text-tw-blue">
                  human gate
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>

      <figcaption className="mt-3 max-w-[52ch] text-[12px] leading-[1.6] text-muted-foreground">
        The catalog only tightens. A control is never weakened or removed by a domain; recurring
        waivers mean fix the standard or fix the system.
      </figcaption>
    </figure>
  );
}
