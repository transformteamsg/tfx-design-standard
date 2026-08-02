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
  { n: 1, label: "We use AI only when nothing simpler will do", anchor: "we-use-ai-only-when-nothing-simpler-will-do", icon: SlidersHorizontal },
  { n: 2, label: "We make every AI output visibly AI", anchor: "we-make-every-ai-output-visibly-ai", icon: BadgeInfo },
  { n: 3, label: "We back every claim with a source", anchor: "we-back-every-claim-with-a-source", icon: Link2 },
  { n: 4, label: "We catch what our users cannot see", anchor: "we-catch-what-our-users-cannot-see", icon: LifeBuoy },
  { n: 5, label: "We act only with consent", anchor: "we-act-only-with-consent", icon: ShieldCheck },
  { n: 6, label: "We hold user data in trust", anchor: "we-hold-user-data-in-trust", icon: Trash2 },
  { n: 7, label: "We help learners think, not think for them", anchor: "we-help-learners-think-not-think-for-them", icon: GraduationCap },
  { n: 8, label: "We hold our standard to the worst-served user", anchor: "we-hold-our-standard-to-the-worst-served-user", icon: Users },
  { n: 9, label: "We build a tool, not a companion", anchor: "we-build-a-tool-not-a-companion", icon: CircleUser },
  { n: 10, label: "We treat time as entrusted, not extracted", anchor: "we-treat-time-as-entrusted-not-extracted", icon: Timer },
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
