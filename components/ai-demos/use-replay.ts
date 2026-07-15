"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

export interface UseReplayOptions {
  /** Number of discrete animation steps (0 = not started, N = final state). */
  steps: number;
  /**
   * Duration (ms) for each step transition. Can be a single number (all
   * steps the same) or an array with one entry per step.
   */
  stepMs?: number | number[];
}

export interface UseReplayResult {
  /** Current step index (0 = not started, `steps` = complete). */
  step: number;
  /** Fractional progress 0..1 (step / steps). */
  progress: number;
  /** Restart the animation from step 0. */
  replay: () => void;
  /** True when prefers-reduced-motion is active. Animation is skipped. */
  reduced: boolean;
}

const getStepMs = (stepMs: number | number[] | undefined, index: number): number => {
  if (!stepMs) return 600;
  if (typeof stepMs === "number") return stepMs;
  return stepMs[index] ?? stepMs[stepMs.length - 1] ?? 600;
};

export function useReplay({
  steps,
  stepMs,
}: UseReplayOptions): UseReplayResult {
  // Reduced-motion preference
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Step counter - use a token to allow replay() to restart
  const [token, restart] = useReducer((n: number) => n + 1, 0);
  const [step, setStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<Element | null>(null);
  const hasStartedRef = useRef(false);

  // Run animation sequence
  const runSequence = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (reduced) {
      // Jump straight to final state
      setStep(steps);
      return;
    }

    setStep(0);

    let current = 0;
    const schedule = () => {
      if (current >= steps) return;
      const delay = getStepMs(stepMs, current);
      timerRef.current = setTimeout(() => {
        current++;
        setStep(current);
        schedule();
      }, delay);
    };
    schedule();
  }, [reduced, steps, stepMs, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start on mount via IntersectionObserver, fall back to immediate
  useEffect(() => {
    hasStartedRef.current = false;

    const start = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;
      runSequence();
    };

    if (typeof IntersectionObserver === "undefined") {
      start();
      return;
    }

    // Observe <body> as a proxy when we have no specific element ref
    const target = containerRef.current ?? document.body;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start();
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observerRef.current.observe(target);

    return () => {
      observerRef.current?.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, runSequence]);

  const replay = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    restart();
  }, []);

  return {
    step,
    progress: steps > 0 ? step / steps : 0,
    replay,
    reduced,
  };
}
