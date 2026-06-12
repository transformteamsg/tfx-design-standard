"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={clsx(
        "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
        open && "rotate-90"
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  /* Groups collapse by default. The group holding the current page opens
     itself; an explicit click overrides either way until the next toggle. */
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  if (pathname === "/") return null; // landing page is full-width, no docs chrome

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border px-4 py-8 lg:block">
      {nav.map((group) => {
        const holdsCurrentPage =
          pathname === group.href ||
          group.items.some((item) => pathname === item.href);
        const open = toggled[group.label] ?? holdsCurrentPage;
        const listId = `nav-${group.label.toLowerCase()}`;
        const toggle = () =>
          setToggled((prev) => ({ ...prev, [group.label]: !open }));

        return (
          <div key={group.label} className="mb-1.5">
            <div className="flex items-center">
              {group.href ? (
                <>
                  <button
                    type="button"
                    onClick={toggle}
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-label={`${open ? "Collapse" : "Expand"} ${group.label}`}
                    className="grid h-7 w-6 place-items-center rounded-md text-muted-foreground hover:text-foreground"
                  >
                    <Chevron open={open} />
                  </button>
                  <Link
                    href={group.href}
                    className={clsx(
                      "block flex-1 rounded-md px-1 py-1.5 text-[11px] font-semibold uppercase tracking-wider",
                      pathname === group.href
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {group.label}
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={toggle}
                  aria-expanded={open}
                  aria-controls={listId}
                  className="flex flex-1 items-center text-left"
                >
                  <span className="grid h-7 w-6 place-items-center text-muted-foreground">
                    <Chevron open={open} />
                  </span>
                  <span className="block flex-1 px-1 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                    {group.label}
                  </span>
                </button>
              )}
            </div>
            <div
              id={listId}
              className="grid transition-[grid-template-rows] duration-200 ease-out"
              style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
            >
              <ul className="min-h-0 overflow-hidden">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      tabIndex={open ? undefined : -1}
                      className={clsx(
                        "ml-6 block rounded-md px-2 py-1.5 text-[13.5px]",
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
          </div>
        );
      })}
    </aside>
  );
}
