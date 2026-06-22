"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { Control } from "@/lib/catalog";
import { tierStyles, tierLabels } from "@/lib/tier-style";

export function CatalogBrowser({ controls }: { controls: Control[] }) {
  const [tier, setTier] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [check, setCheck] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(controls.map((c) => c.category))),
    [controls]
  );

  const filtered = controls.filter(
    (c) =>
      (!tier || c.tier === tier) &&
      (!category || c.category === category) &&
      (!check || c.check === check)
  );

  const copy = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  };

  const Chip = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)",
        active
          ? "border-foreground bg-foreground text-white"
          : "border-border bg-surface text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-2">
        {["L0", "L1", "L2"].map((t) => (
          <Chip key={t} active={tier === t} onClick={() => setTier(tier === t ? null : t)}>
            {t}
          </Chip>
        ))}
        <span className="mx-1 text-border">|</span>
        {categories.map((c) => (
          <Chip
            key={c}
            active={category === c}
            onClick={() => setCategory(category === c ? null : c)}
          >
            {c}
          </Chip>
        ))}
        <span className="mx-1 text-border">|</span>
        {["deterministic", "judgment", "hybrid"].map((k) => (
          <Chip key={k} active={check === k} onClick={() => setCheck(check === k ? null : k)}>
            {k}
          </Chip>
        ))}
      </div>

      <p className="mt-4 text-[12px] text-muted-foreground">
        {filtered.length} of {controls.length} controls
      </p>

      <div className="mt-3 flex flex-col gap-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            id={c.id}
            className="scroll-mt-20 rounded-lg border border-border bg-surface p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => copy(c.id)}
                title="Copy control ID"
                className="rounded-md border border-border bg-accent px-2 py-0.5 text-[12px] font-semibold hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
              >
                {copied === c.id ? "copied ✓" : c.id}
              </button>
              <span
                className={clsx(
                  "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  tierStyles[c.tier]
                )}
              >
                {tierLabels[c.tier]}
              </span>
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                {c.check}
              </span>
              <span className="text-[11px] text-muted-foreground">{c.category}</span>
              <a
                href={`/standards/catalog/${c.id.toLowerCase()}`}
                className="ml-auto text-[12px] text-tw-blue underline underline-offset-2"
              >
                Details →
              </a>
            </div>
            <p className="mt-2 text-[16px] font-medium">{c.statement}</p>
            {c.fails_when && (
              <p className="mt-1.5 text-[14px] text-muted-foreground">
                <span className="font-semibold text-danger">Fails when:</span>{" "}
                {c.fails_when.join(" · ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
