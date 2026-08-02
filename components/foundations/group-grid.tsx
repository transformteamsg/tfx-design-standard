import {
  Send,
  MessageSquare,
  ShieldCheck,
  Hand,
  Activity,
  User,
  type LucideIcon,
} from "lucide-react";

/* Six-cell card grid used at the top of the Components page to show what the
   functional groups are at a glance. Icons carry the meaning; the one-line
   descriptions confirm it. Anchors point to the group headings below on the
   same page. */

const ICONS: Record<string, LucideIcon> = {
  Input: Send,
  Output: MessageSquare,
  Trust: ShieldCheck,
  Control: Hand,
  State: Activity,
  Identity: User,
};

type Cell = { name: string; description: string; anchor: string };

const CELLS: Cell[] = [
  { name: "Input", description: "What someone gives the AI.", anchor: "input" },
  { name: "Output", description: "What the AI produces on screen.", anchor: "output" },
  { name: "Trust", description: "What the AI shows about how it got there.", anchor: "trust" },
  { name: "Control", description: "How a person stays in charge.", anchor: "control" },
  { name: "State", description: "How the interface shows what is happening.", anchor: "state" },
  { name: "Identity", description: "How the AI is framed as a tool, not a person.", anchor: "identity" },
];

export function GroupGrid() {
  return (
    <div className="not-prose my-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {CELLS.map((cell) => {
        const Icon = ICONS[cell.name];
        return (
          <a
            key={cell.name}
            href={`#${cell.anchor}`}
            className="group flex items-start gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-tw-blue hover:bg-muted/50"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-tw-blue/10 group-hover:text-tw-blue">
              <Icon size={16} strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">{cell.name}</span>
              <span className="text-xs leading-snug text-muted-foreground">{cell.description}</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
