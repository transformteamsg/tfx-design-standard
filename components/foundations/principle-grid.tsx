import {
  SlidersHorizontal,
  BadgeInfo,
  Link2,
  LifeBuoy,
  ShieldCheck,
  Trash2,
  GraduationCap,
  Users,
  CircleUser,
  Timer,
  type LucideIcon,
} from "lucide-react";

/* Ten-tile grid at the top of the Principles page. Each tile carries a
   lucide icon, the directive's short label, and an anchor to the full
   check below. Same visual family as GroupGrid on Components. */

type Cell = { n: number; label: string; anchor: string; icon: LucideIcon };

const CELLS: Cell[] = [
  { n: 1, label: "Use AI only when a rule cannot", anchor: "choose-ai-only-when-a-rule-cannot-do-the-job", icon: SlidersHorizontal },
  { n: 2, label: "Mark every AI output", anchor: "mark-every-ai-output-and-state-its-limits-before-someone-acts-on-it", icon: BadgeInfo },
  { n: 3, label: "Open the source for every claim", anchor: "every-ai-claim-opens-the-source-it-came-from", icon: Link2 },
  { n: 4, label: "Recover from invisible errors", anchor: "design-a-recovery-path-for-the-errors-people-cannot-see-themselves", icon: LifeBuoy },
  { n: 5, label: "No silent writes", anchor: "nothing-files-sends-or-changes-a-record-without-a-clear-yes", icon: ShieldCheck },
  { n: 6, label: "See and remove stored data", anchor: "the-person-can-see-and-remove-what-the-ai-has-kept-about-them", icon: Trash2 },
  { n: 7, label: "For learners, guide not answer", anchor: "if-the-operator-is-the-learner-help-them-get-to-the-answer-instead-of-giving-it", icon: GraduationCap },
  { n: 8, label: "Test across every group", anchor: "test-with-the-range-of-people-who-will-actually-use-it-not-the-average", icon: Users },
  { n: 9, label: "Honest about what it is", anchor: "the-ai-is-honest-about-what-it-is-and-what-it-knows", icon: CircleUser },
  { n: 10, label: "No engagement mechanics", anchor: "no-mechanics-whose-only-job-is-bringing-people-back", icon: Timer },
];

export function PrincipleGrid() {
  return (
    <div className="not-prose my-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CELLS.map((cell) => {
        const Icon = cell.icon;
        return (
          <a
            key={cell.n}
            href={`#${cell.anchor}`}
            className="group flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-tw-blue hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground transition-colors group-hover:bg-tw-blue/10 group-hover:text-tw-blue">
                {cell.n}
              </span>
              <Icon size={16} strokeWidth={2} aria-hidden="true" className="text-muted-foreground transition-colors group-hover:text-tw-blue" />
            </div>
            <span className="text-xs leading-snug text-foreground">{cell.label}</span>
          </a>
        );
      })}
    </div>
  );
}
