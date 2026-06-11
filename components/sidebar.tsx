"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const nav = [
  {
    label: "Start",
    items: [
      { href: "/", title: "Overview" },
      { href: "/how-to-read", title: "How to read this" },
    ],
  },
  {
    label: "Principles",
    items: [
      { href: "/principles/brand-principles", title: "Brand Principles" },
      { href: "/principles/product-design-principles", title: "Product Design Principles" },
    ],
  },
  {
    label: "Standards",
    items: [{ href: "/standards", title: "Control catalog" }],
  },
  {
    label: "Guidelines",
    items: [
      { href: "/guidelines/voice-tone", title: "Voice & tone" },
      { href: "/guidelines/naming", title: "Naming" },
      { href: "/guidelines/interaction", title: "Interaction" },
      { href: "/guidelines/web-interface", title: "Web interface" },
      { href: "/guidelines/data-viz", title: "Data visualization" },
      { href: "/guidelines/illustration", title: "Illustration" },
    ],
  },
  {
    label: "Foundations",
    items: [
      { href: "/foundations/colour", title: "Colour" },
      { href: "/foundations/typography", title: "Typography" },
      { href: "/foundations/spacing-radius", title: "Spacing & radius" },
      { href: "/foundations/iconography", title: "Iconography" },
    ],
  },
  {
    label: "Products",
    items: [
      { href: "/products/teacher-workspace", title: "Teacher Workspace" },
      { href: "/products/casesync", title: "CaseSync" },
      { href: "/products/glow", title: "Glow" },
    ],
  },
  {
    label: "Harness",
    items: [
      { href: "/harness/loop", title: "The loop" },
      { href: "/harness/skills", title: "Skills" },
      { href: "/harness/tools", title: "Tools" },
      { href: "/harness/on-ramp", title: "Designer on-ramp" },
    ],
  },
  {
    label: "Governance",
    items: [{ href: "/governance", title: "How this evolves" }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border px-4 py-8 lg:block">
      {nav.map((group) => (
        <div key={group.label} className="mb-6">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          <ul>
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "block rounded-md px-2 py-1.5 text-[13.5px]",
                    pathname === item.href
                      ? "bg-zinc-100 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-zinc-50 hover:text-foreground"
                  )}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
