"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const nav = [
  {
    label: "Start",
    items: [
      { href: "/overview", title: "Overview" },
      { href: "/how-to-read", title: "How to read this" },
      { href: "/for-agents", title: "For agents" },
    ],
  },
  {
    label: "Principles",
    href: "/principles",
    items: [
      { href: "/principles/brand-principles", title: "Brand Principles" },
      { href: "/principles/product-design-principles", title: "Product Design Principles" },
    ],
  },
  {
    label: "Standards",
    href: "/standards",
    items: [{ href: "/standards/catalog", title: "Control catalog" }],
  },
  {
    label: "Guidelines",
    href: "/guidelines",
    items: [
      { href: "/guidelines/voice-tone", title: "Voice & tone" },
      { href: "/guidelines/naming", title: "Naming" },
      { href: "/guidelines/interaction", title: "Interaction" },
      { href: "/guidelines/web-interface", title: "Web interface" },
      { href: "/guidelines/data-viz", title: "Data visualization" },
      { href: "/guidelines/illustration", title: "Illustration" },
      { href: "/guidelines/product-icons", title: "Product icons" },
    ],
  },
  {
    label: "Foundations",
    href: "/foundations",
    items: [
      { href: "/foundations/colour", title: "Colour" },
      { href: "/foundations/typography", title: "Typography" },
      { href: "/foundations/spacing-radius", title: "Spacing & radius" },
      { href: "/foundations/iconography", title: "Iconography" },
    ],
  },
  {
    label: "Products",
    href: "/products",
    items: [
      { href: "/products/teacher-workspace", title: "Teacher Workspace" },
      { href: "/products/casesync", title: "CaseSync" },
      { href: "/products/glow", title: "Glow" },
    ],
  },
  {
    label: "Harness",
    href: "/harness",
    items: [
      { href: "/harness/loop", title: "The loop" },
      { href: "/harness/skills", title: "Skills" },
      { href: "/harness/tools", title: "Tools" },
      { href: "/harness/on-ramp", title: "Designer on-ramp" },
    ],
  },
  {
    label: "Governance",
    href: "/governance",
    items: [{ href: "/governance", title: "How this evolves" }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  if (pathname === "/") return null; // landing page is full-width, no docs chrome
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border px-4 py-8 lg:block">
      {nav.map((group) => (
        <div key={group.label} className="mb-6">
          {group.href ? (
            <Link
              href={group.href}
              className={clsx(
                "mb-2 block px-2 text-[11px] font-semibold uppercase tracking-wider",
                pathname === group.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {group.label}
            </Link>
          ) : (
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
          )}
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
