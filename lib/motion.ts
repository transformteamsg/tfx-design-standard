import { cubicBezier } from "motion/react";

/* Mirror of the motion tokens in app/globals.css — motion/react needs numbers,
   CSS needs custom properties; lib/motion.test.ts keeps the two in sync.
   Change values there and here together, never one side alone (MOT-2). */
export const DUR = { fast: 0.12, base: 0.2, slow: 0.3, story: 0.6 } as const;
export const STAGGER = 0.06;
export const EASE_OUT = cubicBezier(0.215, 0.61, 0.355, 1);
export const EASE_IN_OUT = cubicBezier(0.645, 0.045, 0.355, 1);
/* Bezier control points, exported for the sync test. */
export const EASE_OUT_POINTS = [0.215, 0.61, 0.355, 1] as const;
export const EASE_IN_OUT_POINTS = [0.645, 0.045, 0.355, 1] as const;
