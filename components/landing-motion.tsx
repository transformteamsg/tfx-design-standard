"use client";

import {
  cubicBezier,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef, type ReactNode } from "react";

/* Landing-only motion. Ported from marketing-teacher-workspace's
   reveal-on-scroll: fade + lift, fires once, honours prefers-reduced-motion.
   Standard easing, no bounce (SLP-8); decorative motion stays off doc pages
   (MOT-1 — the landing page is the one marketing surface). */

const EASE = cubicBezier(0.4, 0, 0.2, 1);

const IN_VIEW_OPTIONS = {
  once: true,
  margin: "0px 0px -15% 0px",
  amount: 0.25,
} as const;

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  // === true: hydration null must not skip the animation
  const reduced = useReducedMotion() === true;
  const inView = useInView(ref, IN_VIEW_OPTIONS);

  const shouldAnimate = !reduced && inView;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={shouldAnimate || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={reduced ? { duration: 0 } : { duration: 0.6, ease: EASE, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
}

/* Scroll-linked drift: the child moves `drift`px against scroll direction
   across its pass through the viewport. Linear mapping — the scrollbar is
   the easing. */
export function Parallax({
  children,
  drift = 24,
  className,
}: {
  children: ReactNode;
  drift?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [drift, -drift]);

  return (
    <motion.div ref={ref} className={className} style={reduced ? undefined : { y }}>
      {children}
    </motion.div>
  );
}
