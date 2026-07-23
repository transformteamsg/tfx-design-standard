"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { RefObject } from "react";

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
  /** Attach to the element that should trigger the animation when scrolled into view. */
  ref: RefObject<HTMLElement | null>;
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
  const ref = useRef<HTMLElement | null>(null);
  const hasStartedRef = useRef(false);

  // Latest options live in a ref so runSequence stays referentially stable.
  // Demos pass array literals for stepMs, which change identity every render;
  // without this the observer effect re-armed on every render, re-fired while
  // the demo was still in view, and the animation looped until scrolled past.
  const optsRef = useRef({ steps, stepMs, reduced });
  optsRef.current = { steps, stepMs, reduced };

  // Run animation sequence
  const runSequence = useCallback(() => {
    const { steps: s, stepMs: ms, reduced: r } = optsRef.current;
    if (timerRef.current) clearTimeout(timerRef.current);

    if (r) {
      // Jump straight to final state
      setStep(s);
      return;
    }

    setStep(0);

    let current = 0;
    const schedule = () => {
      if (current >= s) return;
      const delay = getStepMs(ms, current);
      timerRef.current = setTimeout(() => {
        current++;
        setStep(current);
        schedule();
      }, delay);
    };
    schedule();
  }, []);

  // Arm once per mount and once per replay() (token bump). hasStartedRef is
  // only reset by replay(), never here - so the sequence plays exactly once
  // when the element first enters the viewport, then again only on Replay.
  useEffect(() => {
    const start = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;
      runSequence();
    };

    if (typeof IntersectionObserver === "undefined") {
      start();
      return;
    }

    const target = ref.current;
    if (!target) {
      // Ref not yet attached - start immediately
      start();
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start();
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observerRef.current.observe(target);

    return () => {
      observerRef.current?.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, runSequence]);

  const replay = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    hasStartedRef.current = false;
    restart();
  }, []);

  return {
    step,
    progress: steps > 0 ? step / steps : 0,
    replay,
    reduced,
    ref,
  };
}
