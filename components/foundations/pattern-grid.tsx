import {
  MousePointerClick,
  FileText,
  BookOpenText,
  SearchCheck,
  Tags,
  Bot,
  Compass,
  type LucideIcon,
} from "lucide-react";

/* Seven-tile pattern picker at the top of the Patterns page. Each tile is
   a user need phrased as a job the AI does, an anchor to the pattern
   section, and an icon. Same styling family as GroupGrid. */

type Cell = { userNeed: string; anchor: string; icon: LucideIcon };

const CELLS: Cell[] = [
  { userNeed: "Nudge them toward the next step", anchor: "suggesting-a-next-step", icon: MousePointerClick },
  { userNeed: "Give them a draft they will edit", anchor: "generating-a-first-draft", icon: FileText },
  { userNeed: "Summarise long material fast", anchor: "summarising-long-material", icon: BookOpenText },
  { userNeed: "Answer a specific question from records", anchor: "answering-from-your-own-records", icon: SearchCheck },
  { userNeed: "Label, score, or flag many records", anchor: "classifying-a-record", icon: Tags },
  { userNeed: "Run a multi-step task on their behalf", anchor: "running-an-agent-on-someones-behalf", icon: Bot },
  { userNeed: "Explore a fuzzy problem they cannot yet scope", anchor: "exploring-an-open-ended-problem", icon: Compass },
];

export function PatternGrid() {
  return (
    <div className="not-prose my-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {CELLS.map((cell) => {
        const Icon = cell.icon;
        return (
          <a
            key={cell.anchor}
            href={`#${cell.anchor}`}
            className="group flex items-start gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-tw-blue hover:bg-muted/50"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-tw-blue/10 group-hover:text-tw-blue">
              <Icon size={16} strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-muted-foreground">User needs AI to</span>
              <span className="text-sm leading-snug text-foreground">{cell.userNeed}</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
