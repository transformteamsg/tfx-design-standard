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
  { n: 1, label: "AI is a last resort, not a default", anchor: "ai-is-a-last-resort-not-a-default", icon: SlidersHorizontal },
  { n: 2, label: "AI declares itself", anchor: "ai-declares-itself", icon: BadgeInfo },
  { n: 3, label: "Every claim carries its receipt", anchor: "every-claim-carries-its-receipt", icon: Link2 },
  { n: 4, label: "The system catches what the user cannot see", anchor: "the-system-catches-what-the-user-cannot-see", icon: LifeBuoy },
  { n: 5, label: "No action without consent", anchor: "no-action-without-consent", icon: ShieldCheck },
  { n: 6, label: "The subject owns their data", anchor: "the-subject-owns-their-data", icon: Trash2 },
  { n: 7, label: "For learners, the struggle is the point", anchor: "for-learners-the-struggle-is-the-point", icon: GraduationCap },
  { n: 8, label: "The worst-served user sets the standard", anchor: "the-worst-served-user-sets-the-standard", icon: Users },
  { n: 9, label: "AI is a tool, not a companion", anchor: "ai-is-a-tool-not-a-companion", icon: CircleUser },
  { n: 10, label: "Attention is a duty, not a currency", anchor: "attention-is-a-duty-not-a-currency", icon: Timer },
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
