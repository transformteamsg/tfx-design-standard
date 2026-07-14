"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { DemoFrame } from "./demo-frame";

const SOURCES = [
  {
    id: 1,
    title: "Term 2 reading records",
    description: "Class 5A — 18 sessions logged across 9 weeks",
  },
  {
    id: 2,
    title: "Class 5A running records",
    description: "Ahmad Hassan — band scores from weeks 1–9",
  },
];

/* Illustrates the Sources + InlineCitation patterns.
   Sources panel is collapsible; citation markers are inline in the text. */
export function DemoSources() {
  const [open, setOpen] = useState(false);

  return (
    <DemoFrame caption={["Sources", "InlineCitation"]}>
      <div className="flex flex-col gap-4">
        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-tw-blue px-4 py-2.5 text-[14px] leading-relaxed text-white">
            How is Ahmad tracking against year-level benchmarks?
          </div>
        </div>

        {/* Assistant message */}
        <div className="flex items-start gap-3">
          <div
            aria-hidden="true"
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground"
          >
            AI
          </div>

          <div className="flex-1 space-y-3">
            <p className="text-[14px] leading-relaxed text-foreground">
              Ahmad has attended 14 of 18 sessions this term.{" "}
              <button
                type="button"
                aria-label="Citation 1: Term 2 reading records"
                className="relative inline-flex h-4 w-4 items-center justify-center rounded bg-muted text-[9px] font-semibold text-muted-foreground transition-colors hover:bg-border hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
              >
                1
              </button>{" "}
              His running record places him at band 3, on track for his year level.{" "}
              <button
                type="button"
                aria-label="Citation 2: Class 5A running records"
                className="relative inline-flex h-4 w-4 items-center justify-center rounded bg-muted text-[9px] font-semibold text-muted-foreground transition-colors hover:bg-border hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
              >
                2
              </button>{" "}
              Comprehension responses show strong literal recall.
            </p>

            {/* Collapsible sources panel */}
            <div className="rounded-lg border border-border">
              <button
                type="button"
                aria-expanded={open}
                aria-controls="demo-sources-panel"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between px-3 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
              >
                <span>{SOURCES.length} sources</span>
                {open ? (
                  <ChevronUp size={14} aria-hidden="true" />
                ) : (
                  <ChevronDown size={14} aria-hidden="true" />
                )}
              </button>

              {open && (
                <div id="demo-sources-panel" className="border-t border-border">
                  {SOURCES.map((src, idx) => (
                    <div
                      key={src.id}
                      className={
                        idx < SOURCES.length - 1 ? "border-b border-border px-3 py-2.5" : "px-3 py-2.5"
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="mt-px inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-muted text-[9px] font-semibold text-muted-foreground">
                            {src.id}
                          </span>
                          <div>
                            <p className="flex items-center gap-1 text-[13px] font-medium text-foreground">
                              {src.title}
                              <ExternalLink
                                size={11}
                                aria-hidden="true"
                                className="text-muted-foreground"
                              />
                            </p>
                            <p className="text-[12px] text-muted-foreground">
                              {src.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DemoFrame>
  );
}
