import Link from "next/link";
import { getDoc } from "@/lib/content";
import { Reveal } from "@/components/landing-motion";
import { Readers, type Reader } from "@/components/readers";
import { OrbitLoop } from "@/components/diagrams/orbit-loop";

export const metadata = {
  alternates: { types: { "text/markdown": "/index.md" } },
};

type WhyItem = { title: string; text: string };
type Owner = { role: string; who: string };
type Role = { key: string; title: string; first: string; href: string; link: string };

export default function Landing() {
  const doc = getDoc("sections", "landing");
  if (!doc) return null;
  const why = (doc.data.why ?? []) as WhyItem[];
  const owners = (doc.data.owners ?? []) as Owner[];
  const roles = (doc.data.roles ?? []) as Role[];
  const readers = (doc.data.readers ?? []) as Reader[];
  const cta = (doc.data.cta as string) ?? "See the DXD Design Standard";

  return (
    <div className="mx-auto max-w-[880px]">
      <section className="pt-10 sm:pt-16">
        <p className="text-[13px] font-semibold text-tw-blue">
          Digital Products &amp; Excellence Division
        </p>
        <h1 className="mt-4 max-w-[16ch] font-display text-[48px] font-semibold leading-[1.04] tracking-tight sm:text-[72px]">
          {doc.title}
        </h1>
        <p className="mt-6 max-w-[58ch] text-[18px] leading-[1.6] text-muted-foreground">
          {doc.description}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link
            href="/overview"
            className="rounded-lg bg-tw-blue px-5 py-3 text-[16px] font-semibold text-white transition-colors duration-150 hover:bg-tw-blue-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
          >
            {cta}
          </Link>
          <Link
            href="/harness/get-started"
            className="rounded-lg border border-border bg-surface px-5 py-3 text-[16px] font-semibold text-foreground transition-colors duration-150 hover:border-(--border-strong) hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
          >
            Adopt it — get started
          </Link>
          <Link
            href="/for-agents"
            className="text-[14px] font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Building with an AI agent?
          </Link>
          <Link
            href="/how-to-read"
            className="text-[14px] font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            New here? Start here
          </Link>
        </div>
      </section>

      <Reveal className="mt-14">
        <OrbitLoop />
        <p className="mt-3 text-[13px] text-muted-foreground">
          The design loop, live — two human gates, intent without loss.{" "}
          <Link href="/harness/loop" className="text-tw-blue underline underline-offset-2">
            How the loop works
          </Link>
        </p>
      </Reveal>

      {readers.length > 0 && (
        <Readers
          heading={(doc.data.readersHeading as string) ?? "One standard, three readers"}
          lead={(doc.data.readersLead as string) ?? ""}
          readers={readers}
        />
      )}

      <section className="mt-16">
        <Reveal>
          <h2 className="font-display text-[24px] font-semibold tracking-tight">
            Why a standard, not a style guide
          </h2>
        </Reveal>
        <div className="mt-2">
          {why.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 80}
              className="border-b border-border last:border-b-0"
            >
              <div className="grid gap-2 py-7 sm:grid-cols-[88px_1fr] sm:gap-6">
                <p className="font-display text-[24px] font-semibold text-tw-blue">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div>
                  <h3 className="font-display text-[18px] font-semibold">{item.title}</h3>
                  <p className="mt-2 max-w-[62ch] text-[16px] leading-[1.6] text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <Reveal>
          <h2 className="font-display text-[24px] font-semibold tracking-tight">
            What adopting means for your team
          </h2>
        </Reveal>
        <div className="mt-2">
          {roles.map((role, i) => (
            <Reveal
              key={role.key}
              delay={i * 80}
              className="border-b border-border last:border-b-0"
            >
              <div className="grid gap-2 py-7 sm:grid-cols-[200px_1fr] sm:gap-6">
                <h3 className="font-display text-[18px] font-semibold">{role.title}</h3>
                <div>
                  <p className="max-w-[62ch] text-[16px] leading-[1.6] text-muted-foreground">
                    {role.first}
                  </p>
                  <Link
                    href={role.href}
                    className="mt-3 inline-block text-[14px] font-medium text-tw-blue underline underline-offset-2 hover:text-foreground"
                  >
                    {role.link} &rarr;
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-xl bg-tw-blue px-8 py-10 text-white sm:px-12">
        <p className="text-[13px] font-semibold text-white">
          The one test
        </p>
        <p className="mt-3 max-w-[28ch] font-display text-[24px] font-semibold leading-snug sm:text-[32px]">
          Does this help your users get their task done faster, with less stress?
        </p>
        <p className="mt-3 text-[16px] text-white">If not, we don&apos;t build it.</p>
        <p className="mt-2 text-[14px] text-white">
          Each domain names its own test — Teachers &amp; School asks it about teachers.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-[24px] font-semibold tracking-tight">
          Who owns this
        </h2>
        <div className="mt-2">
          {owners.map((owner) => (
            <div
              key={owner.role}
              className="grid gap-1 border-b border-border py-6 last:border-b-0 sm:grid-cols-[200px_1fr] sm:gap-6"
            >
              <p className="text-[16px] font-semibold">{owner.role}</p>
              <p className="max-w-[62ch] text-[14px] leading-[1.6] text-muted-foreground">
                {owner.who}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6 mt-16 border-t border-border pt-12 text-center">
        <h2 className="mx-auto max-w-[26ch] font-display text-[24px] font-semibold tracking-tight">
          Principles, controls, and a harness, in one place.
        </h2>
        <div className="mt-6">
          <Link
            href="/overview"
            className="inline-block rounded-lg bg-tw-blue px-5 py-3 text-[16px] font-semibold text-white transition-colors duration-150 hover:bg-tw-blue-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
          >
            {cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
