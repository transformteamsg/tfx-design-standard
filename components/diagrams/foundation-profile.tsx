"use client";

/* Foundation → domains → your product. One shared foundation, specialised by
   four domains; your product adopts the standard through its domain. Each
   domain box links to its page. The connecting rails draw in inheritance
   order — foundation stem, rail, domain stems, product stem — so the motion
   traces how the standard flows down; reduced motion renders them static
   (MOT-3). The terminal node is outlined, not filled: filled-primary is
   reserved for real interactive elements. */

import Link from "next/link";
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { DUR, EASE_OUT, STAGGER } from "@/lib/motion";
import { Rise, useFlowReveal } from "./flow";

const domains = [
  { href: "/domains/teachers-school", label: "Teachers & School" },
  { href: "/domains/students", label: "Students" },
  { href: "/domains/parents", label: "Parents" },
  { href: "/domains/platform", label: "Platform" },
];

/* A hairline rail that draws in (scale 0→1) at its slot in the inheritance
   order; k staggers the draw. Offset 0.12s so each rail draws just after its
   Rise block has landed. Reduced motion renders it complete immediately. */
function DrawLine({
  k,
  axis,
  reduced,
  show,
  className,
  style,
}: {
  k: number;
  axis: "x" | "y";
  reduced: boolean;
  show: boolean;
  className: string;
  style?: CSSProperties;
}) {
  const hidden = axis === "x" ? { scaleX: 0 } : { scaleY: 0 };
  const drawn = axis === "x" ? { scaleX: 1 } : { scaleY: 1 };
  return (
    <motion.div
      aria-hidden
      className={className}
      style={style}
      initial={reduced ? false : hidden}
      animate={reduced || show ? drawn : hidden}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: DUR.base, ease: EASE_OUT, delay: 0.12 + k * STAGGER }
      }
    />
  );
}

export function FoundationProfile() {
  const { ref, reduced, show } = useFlowReveal<HTMLDivElement>();
  return (
    <figure className="my-8 max-w-[560px]">
      <div ref={ref}>
        <Rise index={0} reduced={reduced} show={show}>
          <div className="rounded-lg border border-border bg-muted px-4 py-3 text-center">
            <p className="m-0 font-display text-[16px] font-semibold text-foreground">
              The foundation
            </p>
            <p className="m-0 text-[12px] text-muted-foreground">
              a catalog of controls + principles
            </p>
          </div>
        </Rise>

        <Rise index={1} reduced={reduced} show={show}>
          <DrawLine
            k={0}
            axis="y"
            reduced={reduced}
            show={show}
            className="mx-auto h-4 w-px origin-top bg-(--border-strong)"
          />
          <div className="relative">
            {/* rail ends at the outer columns' centres: 12.5% minus half the 3 gaps */}
            <DrawLine
              k={1}
              axis="x"
              reduced={reduced}
              show={show}
              className="absolute left-[calc(12.5%-3px)] right-[calc(12.5%-3px)] top-0 h-px bg-(--border-strong)"
            />
            <div className="grid grid-cols-4 gap-2">
              {domains.map((d) => (
                <div key={d.href}>
                  <DrawLine
                    k={2}
                    axis="y"
                    reduced={reduced}
                    show={show}
                    className="mx-auto h-4 w-px origin-top bg-(--border-strong)"
                  />
                  <Link
                    href={d.href}
                    className="grid h-full min-h-[52px] place-items-center rounded-md border border-border bg-surface px-1.5 py-2 text-center text-[12px] leading-tight text-foreground no-underline transition-colors duration-150 hover:border-(--border-strong) hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
                  >
                    {d.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </Rise>

        <Rise index={2} reduced={reduced} show={show}>
          <div className="mx-auto mt-2 flex w-fit flex-col items-center">
            <span
              aria-hidden
              className="h-0 w-0 border-x-[5px] border-b-[7px] border-x-transparent"
              style={{ borderBottomColor: "var(--tw-blue)" }}
            />
            <DrawLine
              k={3}
              axis="y"
              reduced={reduced}
              show={show}
              className="h-3.5 w-px origin-top"
              style={{ background: "var(--tw-blue)" }}
            />
            <span className="rounded-md border-2 border-(--tw-blue) bg-surface px-3.5 py-2 text-[12px] font-semibold text-tw-blue">
              your product
            </span>
          </div>
        </Rise>
      </div>
      <figcaption className="mt-3 max-w-[52ch] text-[12px] leading-[1.6] text-muted-foreground">
        One foundation, four domains. Your product adopts through whichever domain is its own,
        then declares only what makes it its own.
      </figcaption>
    </figure>
  );
}
