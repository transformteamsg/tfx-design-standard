import Link from "next/link";

const products = [
  { name: "Teacher Workspace", colour: "var(--tw-blue)", href: "/products/teacher-workspace" },
  { name: "CaseSync", colour: "var(--casesync)", href: "/products/casesync" },
  { name: "Glow", colour: "var(--glow)", href: "/products/glow" },
];

const ladder = [
  { label: "Principles", answers: "why", desc: "Beliefs that settle trade-offs", href: "/principles/brand-principles" },
  { label: "Standards", answers: "must", desc: "Checkable, enforceable controls", href: "/standards" },
  { label: "Guidelines", answers: "should", desc: "Recommended practice, judgement applies", href: "/guidelines/voice-tone" },
  { label: "Foundations", answers: "with what", desc: "Colour, type, spacing, icons", href: "/foundations/colour" },
  { label: "Harness", answers: "how, fast", desc: "Skills and tools that apply all of it", href: "/harness/loop" },
];

export default function Home() {
  return (
    <div className="max-w-[760px]">
      <p className="text-[12.5px] font-semibold uppercase tracking-widest text-tw-blue">
        TransformX · Teacher &amp; School portfolio
      </p>
      <h1 className="mt-3 font-display text-[44px] font-extrabold leading-[1.05] tracking-tight">
        Kind Utility,<br />held to a standard.
      </h1>
      <p className="mt-5 text-[17.5px] leading-relaxed text-muted-foreground">
        How TransformX designs for Singapore&apos;s teachers — utility-first at the core,
        human-first at the surface. Principles that settle arguments, standards a machine can
        check, and a harness so every builder ships at the bar, with or without a designer
        on the team.
      </p>

      <div className="mt-6 rounded-lg border-l-[3px] border-tw-blue bg-surface p-4 text-[15px]">
        <strong>The one test:</strong> does this help teachers work faster with less stress?
        If not — we don&apos;t build it.
      </div>

      <div className="mt-10 flex flex-col gap-2">
        {ladder.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="group flex items-baseline gap-4 rounded-lg border border-border bg-surface px-5 py-4 hover:border-zinc-400"
          >
            <span className="w-28 shrink-0 font-display text-[16px] font-bold">{l.label}</span>
            <span className="w-20 shrink-0 text-[11.5px] font-semibold uppercase tracking-wider text-tw-blue">
              {l.answers}
            </span>
            <span className="text-[14.5px] text-muted-foreground group-hover:text-foreground">
              {l.desc}
            </span>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 font-display text-[20px] font-bold">One portfolio, three identities</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {products.map((p) => (
          <Link
            key={p.name}
            href={p.href}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-3 hover:border-zinc-400"
          >
            <span className="h-3.5 w-3.5 rounded-full" style={{ background: p.colour }} />
            <span className="text-[14.5px] font-medium">{p.name}</span>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 font-display text-[20px] font-bold">Built for two audiences</h2>
      <p className="mt-2 max-w-[62ch] text-[15px] text-muted-foreground">
        Humans browse this site; agents read it. The control catalog is published as{" "}
        <a href="/standards/catalog.yaml" className="text-tw-blue underline underline-offset-2">
          machine-readable YAML
        </a>{" "}
        and the whole standard is available at{" "}
        <Link href="/llms.txt" className="text-tw-blue underline underline-offset-2">
          /llms.txt
        </Link>{" "}
        — paste it into your AI tool and build to the bar.
      </p>
    </div>
  );
}
