"use client";

import { useState } from "react";
import { Sparkles, ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DemoFrame } from "./demo-frame";

/* Illustrates the classifier shape - the AI adds a label, score, or flag to a
   record. The interface is a data-table row with an AI-added column, not a
   chat bubble. Each row's "AI note" opens a Popover explaining the basis of
   the flag. Ghost thumbs let the person the row describes correct the label,
   and a click acknowledges locally.

   No className overrides carry a size or font-size token that the Badge /
   Button variants already own. Table uses semantic <table> markup with
   token-only Tailwind utilities. */

type Confidence = "high" | "medium" | "low";
type Feedback = "up" | "down" | null;

interface Row {
  id: string;
  applicant: string;
  submitted: string;
  confidence: Confidence;
  note: string;
  basis: string;
}

const ROWS: Row[] = [
  {
    id: "nadia",
    applicant: "Nadia J.",
    submitted: "3 days ago",
    confidence: "high",
    note: "Complete application",
    basis:
      "All required documents present. Consent form signed on submission. No follow-up needed.",
  },
  {
    id: "amara",
    applicant: "Amara O.",
    submitted: "1 day ago",
    confidence: "medium",
    note: "Transcript upload incomplete",
    basis:
      "Only 2 of 3 transcript pages uploaded. Applicant may not have noticed the third slot. Nudge before processing.",
  },
  {
    id: "wei",
    applicant: "Wei L.",
    submitted: "5 days ago",
    confidence: "low",
    note: "Missing consent form; late by 5 days",
    basis:
      "Consent form not attached and application arrived after the deadline. Two independent flags - route to a person before deciding.",
  },
];

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const CONFIDENCE_CLASS: Record<Confidence, string> = {
  high: "bg-success-subtle text-success",
  medium: "bg-warning-subtle text-warning",
  low: "bg-danger-subtle text-danger",
};

export const DemoClassifierRow = ({
  title,
  blurb,
}: {
  title?: string;
  blurb?: string;
}) => {
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});

  const handleFeedback = (rowId: string, value: Exclude<Feedback, null>) => {
    setFeedback((prev) => ({ ...prev, [rowId]: value }));
  };

  return (
    <DemoFrame
      caption={["Badge", "Popover", "Button"]}
      title={title}
      blurb={blurb}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                Application
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                Submitted
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                Confidence
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                AI note
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                Correct
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const rowFeedback = feedback[row.id] ?? null;
              const isLow = row.confidence === "low";

              return (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-b-0 align-top transition-colors hover:bg-muted/50"
                >
                  <td className="px-3 py-3 font-medium text-foreground">
                    {row.applicant}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {row.submitted}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <Badge className={CONFIDENCE_CLASS[row.confidence]} variant="secondary">
                        {CONFIDENCE_LABEL[row.confidence]}
                      </Badge>
                      {isLow && (
                        <span className="inline-flex items-center gap-1 text-xs text-warning">
                          <AlertTriangle
                            aria-hidden="true"
                            className="size-3"
                          />
                          Review recommended
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Popover>
                      <PopoverTrigger aria-label={`Why the AI flagged ${row.applicant}`}>
                        <Badge variant="secondary">
                          <Sparkles aria-hidden="true" />
                          AI
                        </Badge>
                      </PopoverTrigger>
                      <PopoverContent side="bottom" align="start">
                        <p className="text-sm font-semibold text-foreground">
                          {row.note}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {row.basis}
                        </p>
                      </PopoverContent>
                    </Popover>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.note}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    {rowFeedback ? (
                      <span className="text-xs text-muted-foreground">
                        Thanks - noted
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Mark AI note for ${row.applicant} as correct`}
                          onClick={() => handleFeedback(row.id, "up")}
                        >
                          <ThumbsUp aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Mark AI note for ${row.applicant} as wrong`}
                          onClick={() => handleFeedback(row.id, "down")}
                        >
                          <ThumbsDown aria-hidden="true" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DemoFrame>
  );
};
