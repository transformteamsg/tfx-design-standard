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

/* Ten-row stacked list at the top of the Principles page. One figure card,
   ten rows separated by a divider. Each row: number badge · icon · label ·
   anchor. Same visual family as Checklist / DoDont for consistency. */

type Row = { n: number; label: string; anchor: string; icon: LucideIcon };

const ROWS: Row[] = [
  { n: 1, label: "Use AI only when a rule cannot", anchor: "choose-ai-only-when-a-rule-cannot-do-the-job", icon: SlidersHorizontal },
  { n: 2, label: "Mark every AI output", anchor: "mark-every-ai-output-and-state-its-limits-before-someone-acts-on-it", icon: BadgeInfo },
  { n: 3, label: "Open the source for every claim", anchor: "every-ai-claim-opens-the-source-it-came-from", icon: Link2 },
  { n: 4, label: "Recover from invisible errors", anchor: "design-a-recovery-path-for-the-errors-people-cannot-see-themselves", icon: LifeBuoy },
  { n: 5, label: "No silent writes", anchor: "nothing-files-sends-or-changes-a-record-without-a-clear-yes", icon: ShieldCheck },
  { n: 6, label: "Let people see and remove stored data", anchor: "the-person-can-see-and-remove-what-the-ai-has-kept-about-them", icon: Trash2 },
  { n: 7, label: "For learners, guide - do not answer", anchor: "when-the-learner-is-the-operator-guide-do-not-answer", icon: GraduationCap },
  { n: 8, label: "Test across every group, not the average", anchor: "test-with-the-range-of-people-who-will-actually-use-it-not-the-average", icon: Users },
  { n: 9, label: "Reads as a tool; warmth scales with vulnerability", anchor: "the-ai-reads-as-a-tool-and-its-warmth-scales-down-with-the-users-vulnerability", icon: CircleUser },
  { n: 10, label: "Reward real progress, not visits", anchor: "reward-real-progress-not-visits", icon: Timer },
];

export function PrincipleGrid() {
  return (
    <figure className="not-prose my-6 overflow-hidden rounded-lg border border-border bg-surface">
      <ul className="m-0 list-none divide-y divide-border p-0">
        {ROWS.map((row) => {
          const Icon = row.icon;
          return (
            <li key={row.n} className="mb-0">
              <a
                href={`#${row.anchor}`}
                className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground transition-colors group-hover:bg-tw-blue/10 group-hover:text-tw-blue">
                  {row.n}
                </span>
                <Icon size={16} strokeWidth={2} aria-hidden="true" className="shrink-0 text-muted-foreground transition-colors group-hover:text-tw-blue" />
                <span className="text-sm text-foreground">{row.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
